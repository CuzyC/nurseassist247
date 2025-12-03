from flask import Blueprint, request, jsonify
from models import db, User, Activity, Accommodation, Booking, Inquiry
from sqlalchemy.exc import IntegrityError

admin = Blueprint("admin", __name__)

# ==========================
# ADMIN USER MANAGEMENT ROUTES
# ==========================

# Get list of all admin accounts
@admin.route("/api/admin/get_users", methods=["GET"])
def get_users():
    users = User.query.all()
    json_users = [u.to_json() for u in users]
    return jsonify({"users": json_users}), 200


# Create new user accounts
@admin.route("/api/admin/add_user", methods=["POST"])
def add_user():
    # if session.get('role') != 'owner':
    #     return jsonify({"message": "Access denied: only owner can create users."}), 403

    data = request.get_json() or {}
    name = data.get("name")
    username = data.get("username")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    role = data.get("role", "admin")  # Default role is 'admin'
    status = data.get("status", "Active")

    # Validation checks
    if not all([name, username, email, password]):
        return jsonify({"message": "Missing required fields"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    new_user = User(
        name=name,
        username=username,
        email=email,
        phone=phone,
        role=role,
        status=status,
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Admin user created successfully"}), 201


# Edit/update user account
@admin.route("/api/admin/update_user/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    # if session.get('role') != 'owner':
    #     return jsonify({"message": "Access denied: only owner can edit users."}), 404

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Admin not found"}), 404

    data = request.get_json() or {}

    # Update basic info
    user.name = data.get("name", user.name)
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)
    user.role = data.get("role", user.role)
    user.status = data.get("status", user.status)

    # Update password only if provided
    if data.get("password"):
        user.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200


# Delete user account
@admin.route("/api/admin/delete_user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Admin not found"}), 404

    try:
        # Option A: delete dependent Activity rows first (explicit)
        Activity.query.filter_by(owner_id=user.id).delete(synchronize_session="fetch")

        # Option B: delete bookings created by this user (if you want them gone)
        Booking.query.filter_by(user_id=user.id).delete(synchronize_session="fetch")

        # Option C: optionally delete accommodations owned by this user
        # (if you want accommodations deleted when user deleted)
        Accommodation.query.filter_by(owner_id=user.id).delete(synchronize_session="fetch")

        # Option D: inquiries with owner_id set to cascade already — if not, handle them too
        Inquiry.query.filter_by(owner_id=user.id).delete(synchronize_session="fetch")

        # finally delete user
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Admin deleted successfully"}), 200

    except IntegrityError as e:
        db.session.rollback()
        # log for debugging
        admin.logger.exception("IntegrityError while deleting user: %s", e.orig if hasattr(e, "orig") else e)
        return jsonify({"message": "Cannot delete this user because dependent records exist. See logs."}), 400

# -------------------------
# Get all owner's activity feed
# -------------------------
@admin.route("/api/sdaowner/activities", methods=["GET"])
def get_all_owners_activities():
    activities = Activity.query.all()
    json_activity = [a.to_json() for a in activities]
    return jsonify({"activities": json_activity}), 200