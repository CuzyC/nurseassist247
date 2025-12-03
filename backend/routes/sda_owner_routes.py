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
    Inquiry,
    Booking,
    Amenity,
    Feature,
    Image
)
from flask_jwt_extended import jwt_required, get_jwt_identity

from sqlalchemy import func, desc
from sqlalchemy.exc import IntegrityError


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


# -----------------------------
# Resolvers: accept id or name
# -----------------------------
def _resolve_feature_id(value):
    """Accept either integer id or a string name. Return feature_id (int) or None."""
    if value is None or value == "":
        return None
    # if it's an int already
    try:
        return int(value)
    except (TypeError, ValueError):
        pass

    # it's a name string -> look up or create
    name = str(value).strip()
    if not name:
        return None
    existing = Feature.query.filter(func.lower(Feature.name) == name.lower()).first()
    if existing:
        return existing.id
    # create new Feature
    newf = Feature(name=name)
    db.session.add(newf)
    try:
        db.session.flush()  # assigns id without committing
    except Exception:
        db.session.rollback()
        db.session.add(newf)
        db.session.commit()
    return newf.id


def _resolve_amenity_id(value):
    """Accept either integer id or a string name. Return amenity_id (int) or None."""
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        pass

    name = str(value).strip()
    if not name:
        return None
    existing = Amenity.query.filter(func.lower(Amenity.name) == name.lower()).first()
    if existing:
        return existing.id
    newa = Amenity(name=name)
    db.session.add(newa)
    try:
        db.session.flush()
    except Exception:
        db.session.rollback()
        db.session.add(newa)
        db.session.commit()
    return newa.id


def _resolve_image_id(value):
    """Accept integer id, an object like {'id': N} or a filename string. Return image_id (int) or None."""
    if value is None or value == "":
        return None
    # if dict-like with id
    if isinstance(value, dict):
        if "id" in value:
            try:
                return int(value["id"])
            except (TypeError, ValueError):
                pass
        if "image_id" in value:
            try:
                return int(value["image_id"])
            except (TypeError, ValueError):
                pass
        # fallthrough to other fields (maybe name)
        value = value.get("name") or value.get("path") or value.get("filename") or value

    # if it's already an int (or string numeric)
    try:
        return int(value)
    except (TypeError, ValueError):
        pass

    # treat as filename/path — try to find image by name
    name = str(value).strip()
    if not name:
        return None
    img = Image.query.filter(Image.name == name).first()
    if img:
        return img.id

    # Not found: DO NOT create Image rows automatically — safer to require upload.
    return None



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
    out = []
    for a in accommodations:
        j = a.to_json()
        imgs = j.get("images", []) or []

        # imgs may be a single string or a list of DB paths. Convert to public URLs.
        if isinstance(imgs, str):
            j["images"] = [_public_image_url(imgs)]
        else:
            j["images"] = [_public_image_url(p) for p in imgs]

        out.append(j)

    return jsonify({"accommodations": out}), 200


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
    # commit to ensure new_accommodation.id is available
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to commit new accommodation")
        return jsonify({"message": "Failed to create accommodation"}), 500

    # --- attach features (resolve names/ids) ---
    features = data.get("features", []) or []
    for f in features:
        try:
            fid = _resolve_feature_id(f)
            if fid is None:
                current_app.logger.warning("Could not resolve feature: %s", f)
                continue
            db.session.add(
                AccommodationFeature(accommodation_id=new_accommodation.id, feature_id=fid)
            )
        except Exception:
            current_app.logger.exception("Error resolving/adding feature %s", f)

    # --- attach amenities (resolve names/ids) ---
    amenities = data.get("amenities", []) or []
    for a in amenities:
        try:
            aid = _resolve_amenity_id(a)
            if aid is None:
                current_app.logger.warning("Could not resolve amenity: %s", a)
                continue
            db.session.add(
                AccommodationAmenity(accommodation_id=new_accommodation.id, amenity_id=aid)
            )
        except Exception:
            current_app.logger.exception("Error resolving/adding amenity %s", a)

    # --- attach images (resolve ids) ---
    uploads_root = current_app.config.get("UPLOAD_FOLDER")
    images = data.get("images", []) or []
    for image_val in images:
        try:
            iid = _resolve_image_id(image_val)
            if iid is None:
                current_app.logger.warning("Image not found or not resolvable: %s", image_val)
                continue
            db.session.add(
                AccommodationImage(accommodation_id=new_accommodation.id, image_id=iid)
            )
            img = Image.query.get(iid)
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
                    current_app.logger.exception("Failed to move image %s: %s", iid, e)
        except Exception:
            current_app.logger.exception("Error resolving/adding image %s", image_val)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to commit linked rows for accommodation %s", new_accommodation.id)
        return jsonify({"message": "Failed to create accommodation (links)"}), 500

    # Log activity
    _create_activity(
        owner_id=owner_id,
        action="add",
        accommodation_id=new_accommodation.id,
        accommodation_title=new_accommodation.title,
        details="Created accommodation",
    )
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to commit activity for accommodation %s", new_accommodation.id)

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
        try:
            # delete existing links
            AccommodationFeature.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)
            db.session.flush()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Failed to delete old feature links for acc %s", accommodation_id)

        new_features = data.get("features", []) or []
        for f in new_features:
            try:
                fid = _resolve_feature_id(f)
                if fid is None:
                    current_app.logger.warning("Could not resolve feature when updating: %s", f)
                    continue
                db.session.add(AccommodationFeature(accommodation_id=accommodation_id, feature_id=fid))
            except Exception:
                current_app.logger.exception("Error adding updated feature %s", f)
        changed_fields.append("features")

    # Update amenities
    if "amenities" in data:
        try:
            AccommodationAmenity.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)
            db.session.flush()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Failed to delete old amenity links for acc %s", accommodation_id)

        new_amenities = data.get("amenities", []) or []
        for a in new_amenities:
            try:
                aid = _resolve_amenity_id(a)
                if aid is None:
                    current_app.logger.warning("Could not resolve amenity when updating: %s", a)
                    continue
                db.session.add(AccommodationAmenity(accommodation_id=accommodation_id, amenity_id=aid))
            except Exception:
                current_app.logger.exception("Error adding updated amenity %s", a)
        changed_fields.append("amenities")

    # Replace images: ensure we remove old links and optionally clean orphaned images
    if "images" in data:
        # Gather previous image ids BEFORE deletion to allow safe orphan cleanup
        prev_links = AccommodationImage.query.filter_by(accommodation_id=accommodation_id).all()
        prev_image_ids = [li.image_id for li in prev_links if li.image_id is not None]

        try:
            # Delete previous links
            AccommodationImage.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)
            db.session.flush()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Failed to delete previous accommodation_image links for %s", accommodation_id)

        # Add new links (resolve values)
        new_images = data.get("images", []) or []
        uploads_root = current_app.config.get("UPLOAD_FOLDER")
        user = User.query.get(owner_id)
        username = user.username if user else f"user_{owner_id}"

        for img_val in new_images:
            try:
                iid = _resolve_image_id(img_val)
                if iid is None:
                    current_app.logger.warning("Image not found when updating acc %s: %s", accommodation_id, img_val)
                    continue
                db.session.add(AccommodationImage(accommodation_id=accommodation_id, image_id=iid))
                img = Image.query.get(iid)
                if img:
                    try:
                        _move_image_to_accommodation(img=img, username=username, accommodation_id=accommodation_id, uploads_root=uploads_root)
                        db.session.add(img)
                    except Exception as e:
                        current_app.logger.exception("Failed to move image %s: %s", iid, e)
            except Exception:
                current_app.logger.exception("Error resolving/adding image %s", img_val)

        # Clean up orphan images that were previously linked to this accommodation and now have zero references
        for img_id in prev_image_ids:
            if img_id is None:
                continue
            try:
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
            except Exception:
                current_app.logger.exception("Error cleaning up orphan image id=%s", img_id)

        changed_fields.append("images")

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
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to commit activity for update of accommodation %s", accommodation_id)

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

    # Prepare image ref counts container so it's always defined
    image_ref_counts = {}

    # If uploads_root configured, try to remove filesystem folder and collect linked images
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
            # continue — we'll still attempt to delete the accommodation row below

    else:
        # If uploads_root not configured, still delete DB links safely
        try:
            acc_images = AccommodationImage.query.filter_by(accommodation_id=accommodation_id).all()
            image_ids = [ai.image_id for ai in acc_images if ai.image_id is not None]
            for img_id in image_ids:
                image_ref_counts[img_id] = AccommodationImage.query.filter(
                    AccommodationImage.image_id == img_id,
                    AccommodationImage.accommodation_id != accommodation_id
                ).count()

            AccommodationFeature.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)
            AccommodationAmenity.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)
            AccommodationImage.query.filter_by(accommodation_id=accommodation_id).delete(synchronize_session=False)
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Failed to remove linking rows (no uploads_root) for accommodation %s", accommodation_id)
            # continue to attempt accommodation delete

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
        db.session.rollback()
        current_app.logger.exception("Failed to create activity log for deletion of accommodation %s", accommodation_id)
        # activity logging failed but the accommodation is already deleted; still return success
        return jsonify({"message": "Accommodation deleted, but failed to log activity"}), 200

    # Success
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

#------------------------------
# INQURIES
#----------------------
@sda_owner.route("/api/client/inquiries", methods=["POST"])
def create_inquiry():
    """
    Public endpoint – called by the Enquire form.
    Required body: name, email, accommodation_id
    Optional: phone, message
    """
    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    message = (data.get("message") or "").strip()
    accommodation_id = data.get("accommodation_id")

    if not name or not email:
        return jsonify({"message": "Name and email are required."}), 400

    if not accommodation_id:
        return jsonify({"message": "accommodation_id is required."}), 400

    accommodation = Accommodation.query.get(accommodation_id)
    if not accommodation:
        return jsonify({"message": "Accommodation not found."}), 404

    owner_id = accommodation.owner_id

    inquiry = Inquiry(
        accommodation_id=accommodation.id,
        owner_id=owner_id,
        name=name,
        email=email,
        phone=phone,
        message=message,
        status="new",
        created_at=datetime.utcnow()
    )

    try:
        db.session.add(inquiry)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # log exception on server for debugging (use logger)
        return jsonify({"message": "Failed to create inquiry."}), 500

    # optionally: trigger owner notification (email/push) here

    return jsonify({
        "message": "Inquiry submitted successfully.",
        "inquiry_id": inquiry.id,
        "created_at": inquiry.created_at.isoformat()
    }), 201

# DELETE an inquiry (owner-only)
@sda_owner.route("/api/sdaowner/delete_inquiry/<int:inquiry_id>", methods=["DELETE"])
@jwt_required()
def delete_inquiry(inquiry_id):
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    inquiry = Inquiry.query.get(inquiry_id)
    if not inquiry:
        return jsonify({"message": "Inquiry not found"}), 404

    # ensure the current user is the owner who should see this inquiry
    if inquiry.owner_id != owner_id:
        return jsonify({"message": "Forbidden: you do not own this inquiry"}), 403

    try:
        db.session.delete(inquiry)
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to delete inquiry %s", inquiry_id)
        return jsonify({"message": "Failed to delete inquiry"}), 500

    # optional: create activity log
    try:
        _create_activity(
            owner_id=owner_id,
            action="delete_inquiry",
            accommodation_id=inquiry.accommodation_id,
            accommodation_title=(inquiry.accommodation.title if inquiry.accommodation else None),
            details=f"Deleted inquiry id={inquiry_id}"
        )
        db.session.commit()
    except Exception:
        # don't block success if activity log fails
        db.session.rollback()
        current_app.logger.exception("Failed to log delete inquiry activity for %s", inquiry_id)

    return jsonify({"message": "Inquiry deleted"}), 200

# GET ALL MESSAGE
@sda_owner.route("/api/sdaowner/get_inquiries", methods=["GET"])
@jwt_required()
def get_inquiries():
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    inquiries = Inquiry.query.filter_by(owner_id=owner_id).all()
    print("json_inquiries", inquiries)

    json_inquiries = []
    for i in inquiries:
        d = i.to_json()  # whatever you already return

        # Attach accommodation info
        acc = Accommodation.query.get(i.accommodation_id)
        if acc:
            # match the keys your frontend uses
            d["accommodationTitle"] = acc.title
            d["location"] = acc.location
            d["type"] = acc.accommodation_type  # or acc.type if that's your field

        # (optional) also provide a date field for the header
        if hasattr(i, "created_at") and i.created_at:
            d["date"] = i.created_at.isoformat()

        json_inquiries.append(d)

    return jsonify({"enquiries": json_inquiries}), 200
    


# =========================================
# BOOKING 
#================================
@sda_owner.route("/api/sdaowner/get_bookings")
@jwt_required()
def get_booking():
    try:
        owner_id = _get_owner_id()
        if not owner_id:
            return jsonify({"message": "Unauthorized"}), 401

        # Booking model uses `user_id` for the owner; filter by that
        bookings = Booking.query.filter_by(user_id=owner_id).all()
        json_bookings = [b.to_json() for b in bookings]
        return jsonify({"bookings": json_bookings}), 200
    except Exception as e:
        current_app.logger.exception("Error in get_bookings")
        return jsonify({"message": "Server error", "detail": str(e)}), 500

def _parse_iso_datetime(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    s = str(val)
    # remove trailing Z if present (UTC marker)
    if s.endswith("Z"):
        s = s[:-1]
    # fromisoformat can parse "YYYY-MM-DDTHH:MM:SS" and with fractional seconds
    try:
        return datetime.fromisoformat(s)
    except Exception:
        # fallback: try common formats
        try:
            return datetime.strptime(s, "%Y-%m-%dT%H:%M:%S")
        except Exception:
            raise ValueError(f"Invalid datetime format: {val}")


# -------------------------
# ADD booking
# -------------------------
@sda_owner.route("/api/sdaowner/add_booking", methods=["POST"])
@jwt_required()
def add_booking():
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}

    # Required keys for creating a Booking
    required_fields = [
        "accommodationId",
        "clientName",
        "clientEmail",
        "clientPhone",
        "checkIn",
        "checkOut",
    ]

    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields: accommodationId, clientName, clientEmail, clientPhone, checkIn, checkOut"}), 400

    # Accept either camelCase or snake_case keys
    acc_id = data.get("accommodationId") or data.get("accommodation_id")
    client_name = (data.get("clientName") or data.get("client_name") or "").strip()
    client_email = data.get("clientEmail") or data.get("client_email")
    client_phone = data.get("clientPhone") or data.get("client_phone")
    check_in_raw = data.get("checkIn") or data.get("check_in")
    check_out_raw = data.get("checkOut") or data.get("check_out")
    status = data.get("status") or "pending"
    location = data.get("location") or None

    if not acc_id or not client_name or not client_email or not client_phone or not check_in_raw or not check_out_raw:
        return jsonify({"message": "Missing required fields: accommodationId, clientName, checkIn, checkOut"}), 400

    # validate accommodation exists
    acc = Accommodation.query.get(acc_id)
    if not acc:
        return jsonify({"message": "Accommodation not found"}), 404

    # optional: ensure owner owns the accommodation (if bookings must be created by owner)
    if acc.owner_id != owner_id:
        return jsonify({"message": "You do not own that accommodation"}), 403

    # parse ISO datetimes (uses helper earlier in file)
    try:
        check_in = _parse_iso_datetime(check_in_raw)
        check_out = _parse_iso_datetime(check_out_raw)
    except ValueError as e:
        return jsonify({"message": str(e)}), 400

    # create booking via factory (this checks overlaps and commits)
    try:
        booking = Booking.create_booking(
            accommodation=acc,
            user_id=owner_id,
            client_name=client_name,
            client_email=client_email,
            client_phone=client_phone,
            check_in=check_in,
            check_out=check_out,
            status=status
        )
    except ValueError as ve:
        # e.g. invalid window or overlap
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        current_app.logger.exception("Failed to create booking")
        return jsonify({"message": "Server error while creating booking", "detail": str(e)}), 500

    return jsonify({"message": "Booking created", "id": booking.id, "booking": booking.to_json()}), 201


# -------------------------
# UPDATE booking
# -------------------------
@sda_owner.route("/api/sdaowner/update_booking/<int:booking_id>", methods=["PUT"])
@jwt_required()
def update_booking(booking_id):
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    # Only the booking owner (user_id) can update it
    if booking.user_id != owner_id:
        return jsonify({"message": "Forbidden: you cannot modify this booking"}), 403

    data = request.get_json() or {}

    # Acceptable update fields (either camelCase or snake_case)
    client_name = data.get("clientName") or data.get("client_name")
    client_email = data.get("clientEmail") or data.get("client_email")
    client_phone = data.get("clientPhone") or data.get("client_phone")
    status = data.get("status")
    location = data.get("location")
    check_in_raw = data.get("checkIn") or data.get("check_in")
    check_out_raw = data.get("checkOut") or data.get("check_out")
    acc_id = data.get("accommodationId") or data.get("accommodation_id")

    # If accommodation change is requested, validate ownership and existence
    if acc_id:
        acc = Accommodation.query.get(acc_id)
        if not acc:
            return jsonify({"message": "Accommodation not found"}), 404
        if acc.owner_id != owner_id:
            return jsonify({"message": "You do not own the new accommodation"}), 403
        booking.accommodation_id = acc.id
        # snapshot title/location from accommodation
        booking.accommodation_title = acc.title
        booking.location = acc.location

    # parse dates if provided
    try:
        check_in = _parse_iso_datetime(check_in_raw) if check_in_raw is not None else None
        check_out = _parse_iso_datetime(check_out_raw) if check_out_raw is not None else None
    except ValueError as e:
        return jsonify({"message": str(e)}), 400

    # Apply date changes if provided
    if check_in is not None:
        booking.check_in = check_in
    if check_out is not None:
        booking.check_out = check_out

    # If dates present, validate ordering
    if booking.check_in and booking.check_out and booking.check_out <= booking.check_in:
        return jsonify({"message": "checkOut must be after checkIn"}), 400

    # If date window changed (or accommodation changed), ensure no overlap with other bookings (exclude current)
    if (check_in is not None or check_out is not None or acc_id is not None):
        try:
            if Booking.overlaps(booking.accommodation_id, booking.check_in, booking.check_out, ignore_booking_id=booking.id):
                return jsonify({"message": "Requested dates overlap with an existing booking"}), 400
        except Exception as e:
            current_app.logger.exception("Error checking booking overlaps")
            return jsonify({"message": "Server error during overlap check", "detail": str(e)}), 500

    # Apply other simple fields
    if client_name is not None:
        booking.client_name = client_name
    if client_email is not None:
        booking.client_email = client_email
    if client_phone is not None:
        booking.client_phone = client_phone
    if status is not None:
        booking.status = status
    if location is not None:
        booking.location = location

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Failed to update booking %s", booking_id)
        return jsonify({"message": "Server error while updating booking", "detail": str(e)}), 500

    return jsonify({"message": "Booking updated", "booking": booking.to_json()}), 200



@sda_owner.route("/api/sdaowner/delete_booking/<int:booking_id>", methods=["DELETE"])
@jwt_required()
def delete_booking(booking_id):
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"message": "Booking not found"}), 404
    
    if booking.user_id != owner_id:
        return jsonify({"message": "Forbidden: you cannot delete this booking"}), 403

    try:
        db.session.delete(booking)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Failed to delete booking %s", booking_id)
        return jsonify({"message": "Server error while deleting booking", "detail": str(e)}), 500

    return jsonify({"message": "Booking deleted"}), 200



# -------------------------
# DASHBOARD
# -------------------------
@sda_owner.route("/api/sdaowner/dashboard_summary", methods=["GET"])
@jwt_required()
def dashboard_summary():
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        # get accommodations for owner
        accs = Accommodation.query.filter_by(owner_id=owner_id).all()
        total_props = len(accs)

        vacant_statuses = {"vacant", "available", "vacancy"}  # change to match your app
        vacant = sum(1 for a in accs if (getattr(a, "status", "") or "").strip().lower() in vacant_statuses)
        occupied = total_props - vacant
        occupancy_rate = round((occupied / total_props) * 100) if total_props else 0

        # distribution by type
        dist = {}
        for a in accs:
            key = getattr(a, "accommodation_type", None) or getattr(a, "type", None) or "Other"
            dist[key] = dist.get(key, 0) + 1
        property_distribution = [{"label": k, "value": v} for k, v in dist.items()]

        # small accommodations preview
        accommodations = [
            {
                "id": a.id,
                "title": a.title,
                "type": getattr(a, "accommodation_type", None) or getattr(a, "type", None),
                "location": a.location,
                "status": a.status,
            }
            for a in accs
        ]

        # recent activities (limit 8)
        acts = Activity.query.filter_by(owner_id=owner_id).order_by(Activity.timestamp.desc()).limit(8).all()
        recent_activity = [
            {
                "action": getattr(act, "action", None),
                "accommodationTitle": getattr(act, "accommodation_title", None) or getattr(act, "accommodationTitle", None),
                "timestamp": getattr(act, "timestamp", None).isoformat() if getattr(act, "timestamp", None) else None,
                "details": getattr(act, "details", None),
            }
            for act in acts
        ]

        # recent move-ins from bookings (latest check_in)
        bookings = Booking.query.filter_by(user_id=owner_id).order_by(desc(Booking.check_in)).limit(6).all()
        recent_move_ins = [
            {
                "id": b.id,
                "name": getattr(b, "client_name", None),
                "property": getattr(b, "accommodation_title", None) or getattr(b, "accommodationTitle", None) or "",
                "moveInDate": getattr(b, "check_in", None).isoformat() if getattr(b, "check_in", None) else None,
                "phone": getattr(b, "client_phone", None),
                "email": getattr(b, "client_email", None),
            }
            for b in bookings
        ]

        user = User.query.get(owner_id)
        owner_name = getattr(user, "username", None) or getattr(user, "name", None) or ""

        payload = {
            "username": owner_name,
            "totalProperties": total_props,
            "vacantUnits": vacant,
            "occupiedUnits": occupied,
            "occupancyRate": occupancy_rate,
            "propertyDistribution": property_distribution,
            "accommodations": accommodations,
            "recentActivity": recent_activity,
            "recentMoveIns": recent_move_ins,
        }

        return jsonify(payload), 200

    except Exception:
        current_app.logger.exception("Failed to build dashboard_summary for owner %s", owner_id)
        return jsonify({"message": "Server error"}), 500
