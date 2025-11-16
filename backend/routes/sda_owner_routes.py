import os

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from models import db, Accommodation, AccommodationFeature, AccommodationAmenity, AccommodationImage, User, Image
from flask_jwt_extended import jwt_required, get_jwt_identity

sda_owner = Blueprint('sda_owner', __name__)


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


# -------------------------
# Get all accommodations owned by the logged-in SDA owner
# -------------------------
@sda_owner.route('/api/sdaowner/get_accommodations', methods=['GET'])
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
@sda_owner.route('/api/sdaowner/add_accommodation', methods=['POST'])
@jwt_required()
def add_accommodation():
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}

    required_fields = [
        "title", "location", "capacity", "description",
        "accommodationType", "bedrooms", "bathrooms",
        "gender", "supportLevel", "features",
        "amenities", "images", "status"
    ]

    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400


    new_accommodation = Accommodation(
        title=data['title'],
        location=data['location'],
        capacity=data['capacity'],
        description=data['description'],
        accommodation_type=data['accommodationType'],
        bedrooms=data['bedrooms'],
        bathrooms=data['bathrooms'],
        gender=data['gender'],
        support_level=data['supportLevel'],
        status=data['status'],
        owner_id=owner_id
    )

    db.session.add(new_accommodation)
    db.session.commit()

    # Link features, amenities, and images (assuming these are IDs; adjust as needed)
    for feature_id in data['features']:
        db.session.add(
            AccommodationFeature(
                accommodation_id=new_accommodation.id,
                feature_id=feature_id
            )
        )

    for amenity_id in data['amenities']:
        db.session.add(
            AccommodationAmenity(
                accommodation_id=new_accommodation.id,
                amenity_id=amenity_id
            )
        )

    for image_id in data['images']:
        db.session.add(
            AccommodationImage(
                accommodation_id=new_accommodation.id,
                image_id=image_id
            )
        )



    db.session.commit()

    return jsonify({"message": "Accommodation created successfully"}), 201


# -------------------------
# Update existing accommodation
# -------------------------
@sda_owner.route('/api/sdaowner/update_accommodation/<int:accommodation_id>', methods=['PUT'])
@jwt_required()
def update_accommodation(accommodation_id):
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    accommodation = Accommodation.query.filter_by(
        id=accommodation_id,
        owner_id=owner_id
    ).first()
    if not accommodation:
        return jsonify({"message": "Accommodation not found"}), 404

    data = request.get_json() or {}

    updatable_fields = [
        "title", "location", "capacity", "description",
        "bedrooms", "bathrooms", "gender", "status"
    ]

    for field in updatable_fields:
        if field in data:
            setattr(accommodation, field, data[field])

    # Handle fields whose JSON key doesn't match column name
    if "accommodationType" in data:
        accommodation.accommodation_type = data["accommodationType"]

    if "supportLevel" in data:
        accommodation.support_level = data["supportLevel"]

    # Update relationships if provided
    if "features" in data:
        AccommodationFeature.query.filter_by(accommodation_id=accommodation_id).delete()
        for feature_id in data["features"]:
            db.session.add(
                AccommodationFeature(
                    accommodation_id=accommodation_id,
                    feature_id=feature_id
                )
            )

    if "amenities" in data:
        AccommodationAmenity.query.filter_by(accommodation_id=accommodation_id).delete()
        for amenity_id in data["amenities"]:
            db.session.add(
                AccommodationAmenity(
                    accommodation_id=accommodation_id,
                    amenity_id=amenity_id
                )
            )

    if "images" in data:
        AccommodationImage.query.filter_by(
            accommodation_id=accommodation_id
        ).delete()

        for image_id in data["images"]:
            db.session.add(
                AccommodationImage(
                    accommodation_id=accommodation_id,
                    image_id=image_id
                )
            )


    db.session.commit()
    return jsonify({"message": "Accommodation updated successfully"}), 200


# -------------------------
# Delete an accommodation
# -------------------------
@sda_owner.route('/api/sdaowner/delete_accommodation/<int:accommodation_id>', methods=['DELETE'])
@jwt_required()
def delete_accommodation(accommodation_id):
    owner_id = _get_owner_id()
    if not owner_id:
        return jsonify({"message": "Unauthorized"}), 401

    accommodation = Accommodation.query.filter_by(
        id=accommodation_id,
        owner_id=owner_id
    ).first()
    if not accommodation:
        return jsonify({"message": "Accommodation not found"}), 404

    db.session.delete(accommodation)
    db.session.commit()

    return jsonify({"message": "Accommodation deleted successfully"}), 200



# NEW: upload image and store filepath
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

    # secure filename
    filename = secure_filename(file.filename)

    # build folder: uploads/<username>/
    uploads_root = current_app.config["UPLOAD_FOLDER"]  # e.g. backend/uploads
    user_folder_rel = os.path.join("uploads", username)  # for DB / URL
    user_folder_abs = os.path.join(uploads_root, username)

    os.makedirs(user_folder_abs, exist_ok=True)

    # full paths
    rel_path = os.path.join(user_folder_rel, filename)      # store this in DB
    abs_path = os.path.join(user_folder_abs, filename)      # save here physically

    file.save(abs_path)

    # create Image record
    img = Image(name=rel_path)
    db.session.add(img)
    db.session.commit()

    return jsonify({
        "id": img.id,
        "path": rel_path
    }), 201




# -------------------------
# PUBLIC: Get ALL accommodations (no owner filter)
# -------------------------
@sda_owner.route("/api/public/accommodations", methods=["GET"])
def get_all_accommodations():
    accommodations = Accommodation.query.all()
    json_accommodations = [a.to_json() for a in accommodations]
    return jsonify({"accommodations": json_accommodations}), 200