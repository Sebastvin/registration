from flask import Blueprint, request, jsonify
from ..models.models import User, MealType, Meal, MealTime
from email_validator import validate_email, EmailNotValidError
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt,
    create_access_token,
    set_access_cookies,
    unset_jwt_cookies,
)
from typing import Tuple
from datetime import datetime
from ... import db, bcrypt, jwt_manager
from datetime import datetime, timezone


auth_bp = Blueprint("auth", __name__)


# Debugging purposes
revoked_tokens = set()


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
    is_organiser = data.get("is_organiser", False)
    meal_preference = data.get("meal_preference")
    start_time = data.get("participation_start_time")
    end_time = data.get("participation_end_time")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    is_valid, email_or_error = validate_email_address(email)
    if not is_valid:
        return jsonify({"message": f"Invalid email: {email_or_error}"}), 400

    email = email_or_error.lower()

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email already registered"}), 400

    try:
        meal_pref = MealType[meal_preference.upper()] if meal_preference else None
    except KeyError:
        return jsonify({"message": "Invalid meal preference"}), 400

    try:
        start_datetime = datetime.fromisoformat(start_time) if start_time else None
        end_datetime = datetime.fromisoformat(end_time) if end_time else None
    except ValueError:
        return (
            jsonify(
                {
                    "message": "Invalid date format. Please use ISO format (YYYY-MM-DDTHH:MM:SS)"
                }
            ),
            400,
        )

    if not start_datetime or not end_datetime:
        return (
            jsonify({"message": "Both participation start and end times are required"}),
            400,
        )

    current_time = datetime.now(timezone.utc)
    if start_datetime < current_time:
        return (
            jsonify({"message": "Participation start time cannot be in the past"}),
            400,
        )

    if end_datetime < start_datetime:
        return (
            jsonify(
                {"message": "Participation end time cannot be earlier than start time"}
            ),
            400,
        )

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(
        email=email,
        password=hashed_password,
        is_organiser=is_organiser,
        meal_preference=meal_pref,
        participation_start_time=start_datetime,
        participation_end_time=end_datetime,
    )

    if "meal_times" in data:
        for meal_time in data["meal_times"]:
            try:
                meal_enum = MealTime[meal_time.upper()]
            except KeyError:
                return jsonify({"message": f"Invalid meal choice: {meal_time}"}), 400
            meal = Meal.query.filter_by(meal_time=meal_enum).first()
            if meal:
                new_user.meals.append(meal)
            else:
                new_meal = Meal(meal_time=meal_enum)
                new_user.meals.append(new_meal)

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

    email = email_or_error.lower()

    user = User.query.filter_by(email=email_or_error).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)

        response = jsonify({"message": "Login successful"})
        set_access_cookies(response, access_token)
        return response, 200

    return jsonify({"message": "Invalid email or password"}), 401


@auth_bp.route("/logout", methods=["POST"])
@jwt_required(optional=True)
def logout():
    try:
        jti = get_jwt().get("jti")
        if jti:
            revoked_tokens.add(jti)
        response = jsonify({"message": "Successfully logged out"})
        unset_jwt_cookies(response)
        return response, 200
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({"message": f"Logout failed: {str(e)}"}), 500


@jwt_manager.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in revoked_tokens
