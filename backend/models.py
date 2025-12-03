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
    # rooms = db.relationship(
    #     "Room",
    #     backref=db.backref("accommodation"),
    #     cascade="all, delete-orphan",
    #     passive_deletes=True
    # )

    # def available_rooms(self):
    #     return [r for r in self.rooms if r.status == "vacant"]

    # def occupied_rooms(self):
    #     return [r for r in self.rooms if r.status == "occupied"]

    # @property
    # def occupied_count(self):
    #     return sum(1 for r in self.rooms if r.status == "occupied")

    # @property
    # def vacant_count(self):
    #     return sum(1 for r in self.rooms if r.status == "vacant")

    # def available_count_db(self):
    #     return db.session.query(func.count(Room.id)).filter(
    #         Room.accommodation_id == self.id,
    #         Room.status == "vacant"
    #     ).scalar()

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

            "features": [f.feature.name for f in self.features if f and f.feature] if self.features else [],
            "amenities": [a.amenity.name for a in self.amenities if a and a.amenity] if self.amenities else [],

            "images": [i.image.name if (i and i.image) else None for i in self.images] if self.images else [],

            "owner": self.owner.name if getattr(self, "owner", None) else None,

            # "rooms": [r.to_json() for r in self.rooms],
            # "occupiedCount": self.occupied_count,
            # "vacantCount": self.vacant_count
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
    email = db.Column(db.String(120), unique=True, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(250), unique=False, nullable=False)
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
            "phone": self.phone,
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
    

# ======================
# BOOKINGS
# ======================
class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)

    # relation to accommodation
    accommodation_id = db.Column(
        db.Integer,
        db.ForeignKey("accommodations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # user_id is the SDA owner/admin who created/owns the booking record
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    client_name = db.Column(db.String(255), nullable=False)
    client_email = db.Column(db.String(255), nullable=True)
    client_phone = db.Column(db.String(50), nullable=True)
    accommodation_title = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)

    # Booking window
    check_in = db.Column(db.DateTime, nullable=False, index=True)
    check_out = db.Column(db.DateTime, nullable=False, index=True)

    # status: pending, confirmed, cancelled, completed (choose your set)
    status = db.Column(db.String(32), nullable=False, server_default=text("'pending'"))

    # audit
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    accommodation = db.relationship(
        "Accommodation",
        backref=db.backref("bookings", cascade="all, delete-orphan")
    )
    user = db.relationship(
        "User",
        foreign_keys=[user_id],
        backref=db.backref("bookings", lazy="dynamic")
    )

    def to_json(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "accommodationId": self.accommodation_id,
            "accommodationTitle": self.accommodation_title,
            "location": self.location,
            "clientName": self.client_name,
            "clientEmail": self.client_email,
            "clientPhone": self.client_phone,
            "checkIn": self.check_in.isoformat() + "Z" if self.check_in else None,
            "checkOut": self.check_out.isoformat() + "Z" if self.check_out else None,
            "status": self.status,
            "createdAt": self.created_at.isoformat() + "Z" if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() + "Z" if self.updated_at else None,
        }

    @staticmethod
    def overlaps(accommodation_id, start_dt, end_dt, ignore_booking_id=None):
        """
        Returns True if there exists a booking for accommodation_id that overlaps [start_dt, end_dt).
        Overlap condition: existing.check_in < end_dt AND existing.check_out > start_dt
        Cancels are ignored.
        Optionally provide ignore_booking_id to exclude a booking (useful when updating).
        """
        q = db.session.query(Booking).filter(
            Booking.accommodation_id == accommodation_id,
            Booking.status != "cancelled",
            Booking.check_in < end_dt,
            Booking.check_out > start_dt
        )
        if ignore_booking_id:
            q = q.filter(Booking.id != ignore_booking_id)
        return db.session.query(q.exists()).scalar()

    @staticmethod
    def create_booking(accommodation, user_id, client_name,
                       check_in, check_out, status="pending",
                       client_email=None, client_phone=None):
        """
        Factory that:
         - accepts accommodation instance or id
         - ensures check_out > check_in
         - prevents overlapping (raises ValueError)
         - snapshots accommodation title & location into booking
        """
        # normalize accommodation
        acc = accommodation if isinstance(accommodation, Accommodation) else Accommodation.query.get(accommodation)
        if not acc:
            raise ValueError("Accommodation not found")

        # validate window
        if check_out <= check_in:
            raise ValueError("check_out must be after check_in")

        # overlap guard
        if Booking.overlaps(acc.id, check_in, check_out):
            raise ValueError("Requested dates overlap with an existing booking")

        booking = Booking(
            accommodation_id=acc.id,
            user_id=user_id,
            client_name=client_name,
            client_email=client_email,
            client_phone=client_phone,
            accommodation_title=acc.title,
            location=acc.location,
            check_in=check_in,
            check_out=check_out,
            status=status
        )
        db.session.add(booking)
        db.session.commit()
        return booking

#===========================
# INQUIRY
#=======================
class Inquiry(db.Model):
    __tablename__ = "inquiries"

    id = db.Column(db.Integer, primary_key=True)

    # which accommodation was inquired about (optional, in case of generic enquiry)
    accommodation_id = db.Column(
        db.Integer,
        db.ForeignKey("accommodations.id", ondelete="SET NULL"),
        nullable=True,
    )
    # owner that should see this enquiry
    owner_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    message = db.Column(db.Text, nullable=True)

    # new / in_progress / closed
    status = db.Column(db.String(50), nullable=False, default="new")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    accommodation = db.relationship("Accommodation", backref="inquiries")
    owner = db.relationship("User", backref="inquiries", passive_deletes=True)

    def to_json(self):
        return {
            "id": self.id,
            "accommodationId": self.accommodation_id,
            "accommodationTitle": self.accommodation.title if self.accommodation else None,
            "ownerId": self.owner_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "message": self.message,
            "status": self.status,
            "createdAt": self.created_at.isoformat() + "Z",
        }
