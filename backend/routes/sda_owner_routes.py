# sda_owner_routes.py
import os
import shutil
from datetime import datetime

from flask import Blueprint, request, jsonify, current_app
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


def _create_activity(owner_id, action, accommodation_id=None, accommodation_title=None, details=None):
    """
    Create an Activity row. We intentionally avoid setting accommodation_id for deleted accommodations
    (to prevent FK constraint issues if the accommodation row is removed).
    """
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
# Get all accommodations owned by the logged-in SDA owner
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
        # optionally enforce these if you want:
        # "features",
        # "amenities",
        # "images",
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

    # Safe defaults if frontend didn't provide them
    features = data.get("features", [])
    amenities = data.get("amenities", [])
    images = data.get("images", [])

    for feature_id in features:
        db.session.add(
            AccommodationFeature(accommodation_id=new_accommodation.id, feature_id=feature_id)
        )

    for amenity_id in amenities:
        db.session.add(
            AccommodationAmenity(accommodation_id=new_accommodation.id, amenity_id=amenity_id)
        )

    # Handle images: link and move physical files into proper folder
    uploads_root = current_app.config["UPLOAD_FOLDER"]
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
                # optionally log error; keep going so create doesn't fail because of move issues
                current_app.logger.exception("Failed to move image %s: %s", image_id, e)

    # commit the relationships and any updated image records
    db.session.commit()

    # Log activity (we include accommodation_id for add)
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
# Update existing accommodation
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

    # Handle fields whose JSON key doesn't match column name
    if "accommodationType" in data:
        accommodation.accommodation_type = data["accommodationType"]
        changed_fields.append("accommodationType")

    # Update relationships if provided
    if "features" in data:
        AccommodationFeature.query.filter_by(accommodation_id=accommodation_id).delete()
        for feature_id in data["features"]:
            db.session.add(
                AccommodationFeature(accommodation_id=accommodation_id, feature_id=feature_id)
            )
        changed_fields.append("features")

    if "amenities" in data:
        AccommodationAmenity.query.filter_by(accommodation_id=accommodation_id).delete()
        for amenity_id in data["amenities"]:
            db.session.add(
                AccommodationAmenity(accommodation_id=accommodation_id, amenity_id=amenity_id)
            )
        changed_fields.append("amenities")

    if "images" in data:
        AccommodationImage.query.filter_by(accommodation_id=accommodation_id).delete()
        for image_id in data["images"]:
            db.session.add(
                AccommodationImage(accommodation_id=accommodation_id, image_id=image_id)
            )
        changed_fields.append("images")

    db.session.commit()

    # Log activity (include accommodation_id)
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

    # fetch accommodation and check owner
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

    try:
        # 1) Delete linking rows explicitly
        AccommodationFeature.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)
        AccommodationAmenity.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)

        # Collect image ids for cleanup
        acc_images = AccommodationImage.query.filter_by(accommodation_id=accommodation_id).all()
        image_ids = [ai.image_id for ai in acc_images]

        # Delete the linking rows
        AccommodationImage.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)

        db.session.commit()  # commit link deletions so FK constraints are satisfied
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to remove linking rows for accommodation %s", accommodation_id)
        # continue trying to delete accommodation below

    # 2) Delete orphan Image rows (only those not referenced elsewhere)
    try:
        for img_id in image_ids:
            if img_id is None:
                continue
            refs = AccommodationImage.query.filter(AccommodationImage.image_id == img_id).count()
            if refs == 0:
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

    # 4) Log activity (no accommodation_id to avoid FK on deleted rows)
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
    Update img.name (relative path stored in DB) if moved.
    """
    # img.name is expected to be a relative path like "uploads/<username>/file.jpg" or similar
    # resolve absolute current path
    current_rel = img.name or ""
    current_basename = os.path.basename(current_rel)
    # Work out current absolute path: if current_rel starts with "uploads", join with uploads_root
    if current_rel.startswith("uploads"):
        current_abs = os.path.join(uploads_root, os.path.relpath(current_rel, "uploads"))
    else:
        # if stored differently, fall back to filename under username
        current_abs = os.path.join(uploads_root, username, current_basename)

    # destination dir for accommodation images
    dest_dir_abs = os.path.join(uploads_root, username, str(accommodation_id), "images")
    os.makedirs(dest_dir_abs, exist_ok=True)

    dest_abs = os.path.join(dest_dir_abs, current_basename)
    # if current_abs == dest_abs, nothing to do
    try:
        if os.path.abspath(current_abs) != os.path.abspath(dest_abs):
            shutil.move(current_abs, dest_abs)
        # update DB relative path
        new_rel = os.path.join("uploads", username, str(accommodation_id), "images", current_basename)
        img.name = new_rel
    except FileNotFoundError:
        # file not present on disk — don't crash. Optionally log.
        # keep img.name as-is, or set to expected path if you like:
        img.name = os.path.join("uploads", username, str(accommodation_id), "images", current_basename)
    except Exception as e:
        # catch-all — don't break flow; optionally log error
        img.name = os.path.join("uploads", username, str(accommodation_id), "images", current_basename)


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

    # secure filename and enforce basename to avoid path traversal
    filename = secure_filename(os.path.basename(file.filename))

    # Optional accommodation_id can be passed as form-data field or query param
    # e.g., form field 'accommodation_id' or ?accommodation_id=123
    accommodation_id = request.form.get("accommodation_id") or request.args.get("accommodation_id")
    try:
        accommodation_id = int(accommodation_id) if accommodation_id is not None else None
    except (TypeError, ValueError):
        accommodation_id = None

    uploads_root = current_app.config["UPLOAD_FOLDER"]  # e.g. backend/uploads

    if accommodation_id:
        # store under uploads/<username>/<accommodation_id>/images/<filename>
        user_folder_rel = os.path.join("uploads", username, str(accommodation_id), "images")
        user_folder_abs = os.path.join(uploads_root, username, str(accommodation_id), "images")
    else:
        # store under uploads/<username>/
        user_folder_rel = os.path.join("uploads", username)
        user_folder_abs = os.path.join(uploads_root, username)

    os.makedirs(user_folder_abs, exist_ok=True)

    rel_path = os.path.join(user_folder_rel, filename)  # value to store in DB
    abs_path = os.path.join(user_folder_abs, filename)  # physical path

    # Save file
    file.save(abs_path)

    # create Image record
    img = Image(name=rel_path)
    db.session.add(img)
    db.session.commit()

    return jsonify({"id": img.id, "path": rel_path}), 201



# -------------------------
# PUBLIC: Get ALL accommodations (no owner filter)
# -------------------------
@sda_owner.route("/api/public/accommodations", methods=["GET"])
def get_all_accommodations():
    accommodations = Accommodation.query.all()
    json_accommodations = [a.to_json() for a in accommodations]
    return jsonify({"accommodations": json_accommodations}), 200


