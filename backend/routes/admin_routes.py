from flask import Blueprint, request, jsonify, session
from models import db, User

admin = Blueprint('admin', __name__)

# ADMIN USER MANAGEMENT ROUTES
# Get list of all admin accounts
@admin.route('/api/admin/get_users', methods=['GET'])
def get_users():
    users = User.query.all()
    json_users = list(map(lambda admin: admin.to_json(), users))
    return jsonify({"users": json_users}), 200

# (OWNER ONLY) Create new user accounts
@admin.route('/api/admin/add_user', methods=['POST'])
def add_user():
    # if session.get('role') != 'owner':
    #     return jsonify({"message": "Access denied: only owner can create users."}), 403

    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'admin')  # Default role is 'admin'
    status = data.get('status', 'Active')

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
        status=status
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Admin user created successfully"}), 201


# (OWNER ONLY) Edit/update user account
@admin.route('/api/admin/update_user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    # if session.get('role') != 'owner':
    #     return jsonify({"message": "Access denied: only owner can edit users."}), 404

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "Admin not found"}), 404

    data = request.get_json()

    # Update basic info
    user.name = data.get('name', user.name)
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.role = data.get('role', user.role)
    user.status = data.get('status', user.status)

    # Update password only if provided
    if data.get('password'):
        user.set_password(data['password'])

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200


# (OWNER ONLY) Delete user account
@admin.route('/api/admin/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    # if session.get('role') != 'owner':
    #     return jsonify({"message": "Access denied: only owner can delete users."}), 404

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Admin not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Admin deleted successfully"}), 200