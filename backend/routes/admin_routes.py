from flask import Blueprint, request, jsonify
from models import db, User, Activity
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
    # if session.get('role') != 'owner':
    #     return jsonify({"message": "Access denied: only owner can delete users."}), 404

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Admin not found"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Admin deleted successfully"}), 200

    except IntegrityError:
        db.session.rollback()
        return (
            jsonify(
                {
                    "message": (
                        "Cannot delete this user because they are linked to one "
                        "or more accommodations. Please reassign or delete those "
                        "accommodations first."
                    )
                }
            ),
            400,
        )
    

# -------------------------
# NEW: Get all owner's activity feed
# -------------------------
@admin.route("/api/sdaowner/activities", methods=["GET"])
def get_all_owners_activities():
    activities = Activity.query.all()
    json_activity = [a.to_json() for a in activities]
    return jsonify({"activities": json_activity}), 200