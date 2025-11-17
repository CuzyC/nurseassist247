# sda_owner_routes.py
import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from flask import Blueprint, request, jsonify, current_app, url_for
from werkzeug.utils import secure_filename

from models import (
    db,
    Accommodation,
    AccommodationFeature,
    AccommodationAmenity,
    AccommodationImage,
    User,
    Image,
    Activity,
)
from flask_jwt_extended import jwt_required, get_jwt_identity

sda_owner = Blueprint("sda_owner", __name__)

# Allowed image extensions
ALLOWED_EXT = {"jpg", "jpeg", "png", "webp", "gif", "bmp"}


def _get_owner_id():
    identity = get_jwt_identity()
    # If identity is a dict: {"id": 1, "role": "Owner"}
    if isinstance(identity, dict):
        return identity.get("id")

    # If it’s already an int or string
    try:
        return int(identity)
    except (TypeError, ValueError):
        return None
    

# --------------------------------------------------------------------
# Helper: generate absolute URL for any DB image path
# --------------------------------------------------------------------
def _public_image_url(rel_path):
    """Convert DB path like 'uploads/admin/2/file.png' -> full URL.

    Ensures we don't duplicate the 'uploads' segment in the generated URL.
    """
    if not rel_path:
        return None

    # normalize
    rel = rel_path.lstrip("/")

    # if stored as "uploads/..." strip that prefix because serve_uploads route
    # already maps to /uploads/<path:filename> where filename is relative to UPLOAD_FOLDER
    if rel.startswith("uploads/"):
        filename_for_url = rel[len("uploads/"):]
    else:
        filename_for_url = rel

    try:
        return url_for("serve_uploads", filename=filename_for_url, _external=True)
    except Exception:
        base = request.host_url.rstrip("/")
        return f"{base}/uploads/{filename_for_url}"



def _create_activity(owner_id, action, accommodation_id=None, accommodation_title=None, details=None):
    act = Activity(
        owner_id=owner_id,
        action=action,
        accommodation_id=accommodation_id if accommodation_id is not None else None,
        accommodation_title=accommodation_title,
        details=details,
        timestamp=datetime.utcnow(),
    )
    db.session.add(act)
    return act


# -------------------------
# Get owner accommodations
# -------------------------
@sda_owner.route("/api/sdaowner/get_accommodations", methods=["GET"])
@jwt_required()
def get_accommodations():
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    accommodations = Accommodation.query.filter_by(owner_id=owner_id).all()
    json_accommodations = [a.to_json() for a in accommodations]
    return jsonify({"accommodations": json_accommodations}), 200


# -------------------------
# Create new accommodation
# -------------------------
@sda_owner.route("/api/sdaowner/add_accommodation", methods=["POST"])
@jwt_required()
def add_accommodation():
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = User.query.get(owner_id)
    username = user.username if user else f"user_{owner_id}"

    data = request.get_json() or {}

    required_fields = [
        "title",
        "location",
        "capacity",
        "description",
        "accommodationType",
        "bedrooms",
        "bathrooms",
        "gender",
        "status",
    ]

    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    new_accommodation = Accommodation(
        title=data["title"],
        location=data["location"],
        capacity=data["capacity"],
        description=data["description"],
        accommodation_type=data["accommodationType"],
        bedrooms=data["bedrooms"],
        bathrooms=data["bathrooms"],
        gender=data["gender"],
        status=data["status"],
        owner_id=owner_id,
    )

    db.session.add(new_accommodation)
    db.session.commit()  # need id to link relationships

    features = data.get("features", [])
    amenities = data.get("amenities", [])
    images = data.get("images", [])

    for feature_id in features:
        # optional: validate feature exists
        db.session.add(
            AccommodationFeature(accommodation_id=new_accommodation.id, feature_id=feature_id)
        )

    for amenity_id in amenities:
        # optional: validate amenity exists
        db.session.add(
            AccommodationAmenity(accommodation_id=new_accommodation.id, amenity_id=amenity_id)
        )

    uploads_root = current_app.config.get("UPLOAD_FOLDER")
    for image_id in images:
        db.session.add(
            AccommodationImage(accommodation_id=new_accommodation.id, image_id=image_id)
        )
        img = Image.query.get(image_id)
        if img:
            try:
                _move_image_to_accommodation(
                    img=img,
                    username=username,
                    accommodation_id=new_accommodation.id,
                    uploads_root=uploads_root,
                )
                db.session.add(img)  # mark updated image for commit
            except Exception as e:
                current_app.logger.exception("Failed to move image %s: %s", image_id, e)

    db.session.commit()

    # Log activity
    _create_activity(
        owner_id=owner_id,
        action="add",
        accommodation_id=new_accommodation.id,
        accommodation_title=new_accommodation.title,
        details="Created accommodation",
    )
    db.session.commit()

    return jsonify({"message": "Accommodation created successfully", "id": new_accommodation.id}), 201


# -------------------------
# Update accommodation
# -------------------------
@sda_owner.route("/api/sdaowner/update_accommodation/<int:accommodation_id>", methods=["PUT"])
@jwt_required()
def update_accommodation(accommodation_id):
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    accommodation = Accommodation.query.filter_by(id=accommodation_id, owner_id=owner_id).first()
    if not accommodation:
        return jsonify({"message": "Accommodation not found"}), 404

    data = request.get_json() or {}

    updatable_fields = [
        "title",
        "location",
        "capacity",
        "description",
        "bedrooms",
        "bathrooms",
        "gender",
        "status",
    ]

    changed_fields = []
    for field in updatable_fields:
        if field in data:
            setattr(accommodation, field, data[field])
            changed_fields.append(field)

    if "accommodationType" in data:
        accommodation.accommodation_type = data["accommodationType"]
        changed_fields.append("accommodationType")

    # Update features
    if "features" in data:
        AccommodationFeature.query.filter_by(accommodation_id=accommodation_id).delete()
        for feature_id in data["features"]:
            db.session.add(
                AccommodationFeature(accommodation_id=accommodation_id, feature_id=feature_id)
            )
        changed_fields.append("features")

    # Update amenities
    if "amenities" in data:
        AccommodationAmenity.query.filter_by(accommodation_id=accommodation_id).delete()
        for amenity_id in data["amenities"]:
            db.session.add(
                AccommodationAmenity(accommodation_id=accommodation_id, amenity_id=amenity_id)
            )
        changed_fields.append("amenities")

    # Replace images: ensure we remove old links and optionally clean orphaned images
    if "images" in data:
        # Gather previous image ids BEFORE deletion to allow safe orphan cleanup
        prev_links = AccommodationImage.query.filter_by(accommodation_id=accommodation_id).all()
        prev_image_ids = [li.image_id for li in prev_links if li.image_id is not None]

        # Delete previous links
        AccommodationImage.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)

        # Add new links
        for image_id in data["images"]:
            db.session.add(
                AccommodationImage(accommodation_id=accommodation_id, image_id=image_id)
            )
        changed_fields.append("images")

        # Clean up orphan images that were previously linked to this accommodation and now have zero references
        for img_id in prev_image_ids:
            if img_id is None:
                continue
            refs_other = AccommodationImage.query.filter(
                AccommodationImage.image_id == img_id
            ).count()
            if refs_other == 0:
                img = Image.query.get(img_id)
                if img:
                    try:
                        db.session.delete(img)
                    except Exception:
                        current_app.logger.exception("Failed to delete orphan Image DB row id=%s", img_id)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to commit update for accommodation %s", accommodation_id)
        return jsonify({"message": "Failed to update accommodation"}), 500

    # Activity log
    details = "Updated fields: " + (", ".join(changed_fields) if changed_fields else "none")
    _create_activity(
        owner_id=owner_id,
        action="edit",
        accommodation_id=accommodation.id,
        accommodation_title=accommodation.title,
        details=details,
    )
    db.session.commit()

    return jsonify({"message": "Accommodation updated successfully"}), 200


# -------------------------
# Delete an accommodation
# -------------------------
@sda_owner.route("/api/sdaowner/delete_accommodation/<int:accommodation_id>", methods=["DELETE"])
@jwt_required()
def delete_accommodation(accommodation_id):
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    accommodation = Accommodation.query.filter_by(id=accommodation_id, owner_id=owner_id).first()
    if not accommodation:
        return jsonify({"message": "Accommodation not found"}), 404

    user = User.query.get(owner_id)
    username = user.username if user else f"user_{owner_id}"
    title = accommodation.title

    uploads_root = current_app.config.get("UPLOAD_FOLDER")
    if uploads_root:
        acc_folder_abs = os.path.join(uploads_root, username, str(accommodation_id))
        try:
            if os.path.isdir(acc_folder_abs):
                shutil.rmtree(acc_folder_abs)
                current_app.logger.info("Removed accommodation folder: %s", acc_folder_abs)
        except Exception:
            current_app.logger.exception("Failed to remove accommodation folder %s", acc_folder_abs)

    # 1) Collect linked image ids BEFORE deleting linking rows
    try:
        acc_images = AccommodationImage.query.filter_by(accommodation_id=accommodation_id).all()
        image_ids = [ai.image_id for ai in acc_images if ai.image_id is not None]

        # For each image, count references in OTHER accommodations (exclude current)
        image_ref_counts = {}
        for img_id in image_ids:
            refs_other = AccommodationImage.query.filter(
                AccommodationImage.image_id == img_id,
                AccommodationImage.accommodation_id != accommodation_id
            ).count()
            image_ref_counts[img_id] = refs_other

        # Now delete linking rows for this accommodation
        AccommodationFeature.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)
        AccommodationAmenity.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)
        AccommodationImage.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)

        db.session.commit()  # commit link deletions
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to remove linking rows for accommodation %s", accommodation_id)
        # continue — try to delete accommodation below

    # 2) Delete orphan Image rows only if no other references exist
    try:
        for img_id, refs_other in image_ref_counts.items():
            if refs_other == 0:
                img = Image.query.get(img_id)
                if img:
                    try:
                        db.session.delete(img)
                    except Exception:
                        current_app.logger.exception("Failed to delete Image DB row id=%s", img_id)
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Error cleaning up Image rows for accommodation %s", accommodation_id)

    # 3) Finally delete the accommodation row itself
    try:
        db.session.delete(accommodation)
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to delete accommodation DB row id=%s", accommodation_id)
        return jsonify({"message": "Failed to delete accommodation"}), 500

    # 4) Log activity (no FK on deleted rows)
    try:
        _create_activity(
            owner_id=owner_id,
            action="delete",
            accommodation_id=None,
            accommodation_title=title,
            details="Deleted accommodation",
        )
        db.session.commit()
    except Exception:
        current_app.logger.exception("Failed to create activity log for deletion of accommodation %s", accommodation_id)
        db.session.rollback()

    return jsonify({"message": "Accommodation deleted successfully"}), 200


def _move_image_to_accommodation(img: Image, username: str, accommodation_id: int, uploads_root: str):
    """
    Move an Image record's file into uploads/<username>/<accommodation_id>/images/
    Update img.name (relative path stored in DB) if moved. If file missing, still update DB name to expected path.
    """
    current_rel = img.name or ""
    current_basename = os.path.basename(current_rel)

    # Work out current absolute path: if current_rel starts with "uploads", join with uploads_root
    if current_rel.startswith("uploads"):
        current_abs = os.path.join(uploads_root, os.path.relpath(current_rel, "uploads"))
    else:
        current_abs = os.path.join(uploads_root, username, current_basename)

    dest_dir_abs = os.path.join(uploads_root, username, str(accommodation_id), "images")
    os.makedirs(dest_dir_abs, exist_ok=True)

    dest_abs = os.path.join(dest_dir_abs, current_basename)

    try:
        if os.path.abspath(current_abs) != os.path.abspath(dest_abs):
            # Move if source exists
            if os.path.exists(current_abs):
                shutil.move(current_abs, dest_abs)
        # Update DB relative path (POSIX)
        img.name = (Path("uploads") / username / str(accommodation_id) / "images" / current_basename).as_posix()
    except FileNotFoundError:
        # File not present on disk — set expected DB path and continue
        current_app.logger.warning("File not found while moving image: %s", current_abs)
        img.name = (Path("uploads") / username / str(accommodation_id) / "images" / current_basename).as_posix()
    except Exception:
        current_app.logger.exception("Error moving image %s -> %s", current_abs, dest_abs)
        img.name = (Path("uploads") / username / str(accommodation_id) / "images" / current_basename).as_posix()


# -------------------------
# Upload image
# -------------------------
@sda_owner.route("/api/sdaowner/upload_image", methods=["POST"])
@jwt_required()
def upload_image():
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    file = request.files.get("file")
    if not file:
        return jsonify({"message": "No file provided"}), 400

    user = User.query.get(owner_id)
    username = user.username if user else f"user_{owner_id}"

    orig_filename = secure_filename(os.path.basename(file.filename))
    if not orig_filename:
        return jsonify({"message": "Invalid filename"}), 400

    # Validate extension
    if "." in orig_filename:
        ext = orig_filename.rsplit(".", 1)[1].lower()
        if ext not in ALLOWED_EXT:
            return jsonify({"message": "Invalid file type"}), 400
    else:
        return jsonify({"message": "Invalid file type"}), 400

    # Optional accommodation_id: ensure owner owns that accommodation if provided
    accommodation_id = request.form.get("accommodation_id") or request.args.get("accommodation_id")
    try:
        accommodation_id = int(accommodation_id) if accommodation_id else None
    except:
        accommodation_id = None

    if accommodation_id:
        acc = Accommodation.query.filter_by(id=accommodation_id, owner_id=owner_id).first()
        if not acc:
            return jsonify({"message": "Accommodation not found or not owned by user"}), 403

    uploads_root = current_app.config.get("UPLOAD_FOLDER")
    if not uploads_root:
        return jsonify({"message": "Server misconfiguration: UPLOAD_FOLDER not set"}), 500

    # Create unique filename to avoid collisions
    unique_name = f"{uuid.uuid4().hex}_{orig_filename}"

    if accommodation_id:
        user_folder_abs = os.path.join(uploads_root, username, str(accommodation_id), "images")
        os.makedirs(user_folder_abs, exist_ok=True)
        rel_path = (Path("uploads") / username / str(accommodation_id) / "images" / unique_name).as_posix()
    else:
        user_folder_abs = os.path.join(uploads_root, username)
        os.makedirs(user_folder_abs, exist_ok=True)
        rel_path = (Path("uploads") / username / unique_name).as_posix()

    abs_path = os.path.join(user_folder_abs, unique_name)

    try:
        file.save(abs_path)
    except Exception:
        current_app.logger.exception("Failed to save uploaded file to %s", abs_path)
        return jsonify({"message": "Failed to save file"}), 500

    # Store DB record
    img = Image(name=rel_path)
    db.session.add(img)
    db.session.commit()

    # Build public URL if app serves uploads via a route named 'serve_uploads'
    try:
        public_url = url_for("serve_uploads", filename=rel_path, _external=False)
    except Exception:
        public_url = None

    return jsonify({"id": img.id, "path": rel_path, "url": public_url}), 201


# -------------------------
# PUBLIC: Get ALL accommodations (no owner filter)
# -------------------------
@sda_owner.route("/api/public/accommodations", methods=["GET"])
def get_all_accommodations():
    accommodations = Accommodation.query.all()

    out = []
    for a in accommodations:
        j = a.to_json()

        imgs = j.get("images", [])
        if isinstance(imgs, str):
            j["images"] = [_public_image_url(imgs)]
        else:
            j["images"] = [_public_image_url(p) for p in imgs]

        out.append(j)

    return jsonify({"accommodations": out}), 200


@sda_owner.route("/api/sda_owner/activities", methods=['GET'])
@jwt_required()
def get_owner_activities():
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    # optionally accept a limit query param
    try:
        limit = int(request.args.get("limit") or 0)
    except ValueError:
        limit = 0

    q = Activity.query.filter_by(owner_id=owner_id).order_by(Activity.timestamp.desc())
    if limit and limit > 0:
        q = q.limit(limit)

    activities = q.all()
    json_activity = [a.to_json() for a in activities]

    return jsonify({"activities": json_activity}), 200