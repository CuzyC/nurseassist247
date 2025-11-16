from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from sqlalchemy import func, text

db = SQLAlchemy()


class Accommodation(db.Model):
    __tablename__ = "accommodations"

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    capacity = db.Column(db.Integer, nullable=False, default=1)
    description = db.Column(db.Text, nullable=False)
    accommodation_type = db.Column(db.String(255), nullable=False)
    bedrooms = db.Column(db.Integer, nullable=False)
    bathrooms = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False, server_default=text("'available'"))

    # relationships
    features = db.relationship(
        "AccommodationFeature",
        backref="accommodation",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    amenities = db.relationship(
        "AccommodationAmenity",
        backref="accommodation",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    images = db.relationship(
        "AccommodationImage",
        backref="accommodation",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    rooms = db.relationship(
        "Room",
        backref=db.backref("accommodation"),
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def available_rooms(self):
        return [r for r in self.rooms if r.status == "vacant"]

    def occupied_rooms(self):
        return [r for r in self.rooms if r.status == "occupied"]

    @property
    def occupied_count(self):
        return sum(1 for r in self.rooms if r.status == "occupied")

    @property
    def vacant_count(self):
        return sum(1 for r in self.rooms if r.status == "vacant")

    def available_count_db(self):
        return db.session.query(func.count(Room.id)).filter(
            Room.accommodation_id == self.id,
            Room.status == "vacant"
        ).scalar()

    def to_json(self):
        return {
            "id": self.id,
            "title": self.title,
            "location": self.location,
            "capacity": self.capacity,
            "description": self.description,
            "accommodationType": self.accommodation_type,
            "bedrooms": self.bedrooms,
            "bathrooms": self.bathrooms,
            "gender": self.gender,
            "status": self.status,

            "features": [f.feature_id for f in self.features] if self.features else [],
            "amenities": [a.amenity_id for a in self.amenities] if self.amenities else [],
            "images": [i.image.name if (i and i.image) else None for i in self.images] if self.images else [],

            "owner": self.owner.name if getattr(self, "owner", None) else None,

            "rooms": [r.to_json() for r in self.rooms],
            "occupiedCount": self.occupied_count,
            "vacantCount": self.vacant_count
        }


class Room(db.Model):
    __tablename__ = "rooms"

    id = db.Column(db.Integer, primary_key=True)
    accommodation_id = db.Column(
        db.Integer,
        db.ForeignKey("accommodations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    room_number = db.Column(db.String(50), nullable=True)   # optional
    status = db.Column(db.String(50), nullable=False, server_default=text("'vacant'"))  # vacant/occupied/maintenance

    def to_json(self):
        return {
            "id": self.id,
            "roomNumber": self.room_number,
            "status": self.status
        }
    
# ========================
# MASTER TABLES   
# ========================
class Feature(db.Model):
    __tablename__ = "features"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

class Amenity(db.Model):
    __tablename__ = "amenities"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

class Image(db.Model):
    __tablename__ = "images"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

# =========================
# LINKING TABLES
# ======================

class AccommodationFeature(db.Model):
    __tablename__ = "accommodation_features"
    id = db.Column(db.Integer, primary_key=True)
    accommodation_id = db.Column(db.Integer, db.ForeignKey("accommodations.id", ondelete="CASCADE"))
    feature_id = db.Column(db.Integer, db.ForeignKey("features.id", ondelete="CASCADE"))
    feature = db.relationship("Feature")

class AccommodationAmenity(db.Model):
    __tablename__ = "accommodation_amenities"
    id = db.Column(db.Integer, primary_key=True)
    accommodation_id = db.Column(db.Integer, db.ForeignKey("accommodations.id", ondelete="CASCADE"))
    amenity_id = db.Column(db.Integer, db.ForeignKey("amenities.id", ondelete="CASCADE"))
    amenity = db.relationship("Amenity")

class AccommodationImage(db.Model):
    __tablename__ = "accommodation_images"
    id = db.Column(db.Integer, primary_key=True)
    accommodation_id = db.Column(db.Integer, db.ForeignKey("accommodations.id", ondelete="CASCADE"))
    image_id = db.Column(db.Integer, db.ForeignKey("images.id", ondelete="CASCADE"))
    image = db.relationship("Image")


# ======================
# USERS
# ===================
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(250), unique=False, nullable = False)
    status = db.Column(db.String(10), nullable=False)

    accommodations = db.relationship("Accommodation", backref="owner")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "status": self.status
        }
    
# ======================
# SDA OWNER ACTIVITIES
# ===================
class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # add / edit / delete
    action = db.Column(db.String(32), nullable=False)
    accommodation_id = db.Column(db.Integer, db.ForeignKey("accommodations.id"), nullable=True)
    accommodation_title = db.Column(db.String(255), nullable=True)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    owner = db.relationship("User", backref="activities")
    accommodation = db.relationship("Accommodation", backref="activity_entries", lazy="joined")

    def to_json(self):
        return {
            "id": self.id,
            "ownerId": self.owner_id,
            "ownerName": self.owner.name if self.owner else "Unknown",
            "action": self.action,
            "accommodationId": self.accommodation_id,
            "accommodationTitle": self.accommodation_title,
            "details": self.details,
            "timestamp": self.timestamp.isoformat() + "Z"
        }