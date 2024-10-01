import jwt
from flask import Blueprint, request, jsonify
from .models import User
from email_validator import validate_email, EmailNotValidError
from typing import Tuple
from datetime import datetime, timedelta
from . import db, bcrypt

auth_bp = Blueprint("auth", __name__)


def validate_email_address(email: str) -> Tuple[bool, str]:
    try:
        v = validate_email(email)
        email = v["email"]
        return True, email
    except EmailNotValidError as e:
        return False, str(e)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    is_valid, email_or_error = validate_email_address(email)
    if not is_valid:
        return jsonify({"message": f"Invalid email: {email_or_error}"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email already registered"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    is_valid, email_or_error = validate_email_address(email)
    if not is_valid:
        return jsonify({"message": f"Invalid email: {email_or_error}"}), 400

    user = User.query.filter_by(email=email_or_error).first()

    if user and bcrypt.check_password_hash(user.password, password):
        token = jwt.encode(
            {
                "user_id": user.id,
                "email": user.email,
                "exp": datetime.utcnow() + timedelta(hours=1),
            },
            "TEST_KEY",
        )

        return jsonify({"token": token}), 200

    return jsonify({"message": "Invalid email or password"}), 401
