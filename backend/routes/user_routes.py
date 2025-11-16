# backend/routes/user_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from datetime import timedelta
from models import db, User

user = Blueprint('user', __name__)


# LOGIN
@user.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400

    user_obj = User.query.filter_by(username=username).first()

    # Assuming your User model has check_password method
    if not user_obj or not user_obj.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    # identity MUST be a string for PyJWT
    identity = str(user_obj.id)

    # extra info goes into additional_claims, not identity
    additional_claims = {
        "role": user_obj.role,
        "name": user_obj.name,
        "username": user_obj.username,
        "status": user_obj.status,
    }

    access_token = create_access_token(
        identity=identity,
        additional_claims=additional_claims,
        expires_delta=timedelta(minutes=15),
    )

    refresh_token = create_refresh_token(
        identity=identity,
        additional_claims=additional_claims,  # optional but nice to keep same claims
    )

    return jsonify({
        "access": access_token,
        "refresh": refresh_token,
        "user": {
            "id": user_obj.id,
            "name": user_obj.name,
            "username": user_obj.username,
            "role": user_obj.role,
            "status": user_obj.status,
        },
    }), 200


# REFRESH TOKEN
@user.route("/api/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    # identity is the string user id
    identity = get_jwt_identity()
    # existing claims on the refresh token
    claims = get_jwt()

    additional_claims = {
        "role": claims.get("role"),
        "name": claims.get("name"),
        "username": claims.get("username"),
        "status": claims.get("status"),
    }

    new_access_token = create_access_token(
        identity=identity,
        additional_claims=additional_claims,
        expires_delta=timedelta(minutes=15),
    )

    return jsonify({"access": new_access_token}), 200


# LOGOUT
@user.route("/api/auth/logout", methods=["POST"])
def logout():
    # If you're not using token revocation/blacklist, this is just client-side
    return jsonify({"message": "Logout successful"}), 200


