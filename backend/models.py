from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class Accommodation(db.Model):
    __tablename__ = "accommodations"

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    title = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=False)
    accommodation_type = db.Column(db.String(255), nullable=False)
    bedrooms = db.Column(db.Integer, nullable=False)
    bathrooms = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(100), nullable=False)
    support_level = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False)

    features = db.relationship("AccommodationFeature", backref="accommodation", cascade="all, delete")
    amenities = db.relationship("AccommodationAmenity", backref="accommodation", cascade="all, delete")
    images = db.relationship("AccommodationImage", backref="accommodation", cascade="all, delete")

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
            "supportLevel": self.support_level,
            "status": self.status,

            "features": [f.feature_id for f in self.features] if self.features else [],
            "amenities": [a.amenity_id for a in self.amenities] if self.amenities else [],
            "images": [i.image.name for i in self.images] if self.images else [],

            "owner": self.owner.name
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
    accommodation_id = db.Column(db.Integer, db.ForeignKey("accommodations.id"))
    feature_id = db.Column(db.Integer, db.ForeignKey("features.id"))

    feature = db.relationship("Feature")

class AccommodationAmenity(db.Model):
    __tablename__ = "accommodation_amenities"

    id = db.Column(db.Integer, primary_key=True)
    accommodation_id = db.Column(db.Integer, db.ForeignKey("accommodations.id"))
    amenity_id = db.Column(db.Integer, db.ForeignKey("amenities.id"))

    amenity = db.relationship("Amenity")

class AccommodationImage(db.Model):
    __tablename__ = "accommodation_images"

    id = db.Column(db.Integer, primary_key=True)
    accommodation_id = db.Column(db.Integer, db.ForeignKey("accommodations.id"))
    image_id = db.Column(db.Integer, db.ForeignKey("images.id"))

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