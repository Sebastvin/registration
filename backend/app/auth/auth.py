import jwt
from flask import Blueprint, request, jsonify
from ..models.models import User, MealType, Meal, MealTime
from email_validator import validate_email, EmailNotValidError
from flask_jwt_extended import create_access_token
from typing import Tuple
from datetime import datetime, timedelta
from ... import db, bcrypt

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
    is_organiser = data.get("is_organiser", False)
    meal_preference = data.get("meal_preference")
    start_time = data.get("participation_start_time")
    end_time = data.get("participation_end_time")
    meal_choices = data.get("meal_choices", [])

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    is_valid, email_or_error = validate_email_address(email)
    if not is_valid:
        return jsonify({"message": f"Invalid email: {email_or_error}"}), 400

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

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(
        email=email,
        password=hashed_password,
        is_organiser=is_organiser,
        meal_preference=meal_pref,
        participation_start_time=start_datetime,
        participation_end_time=end_datetime,
    )

    for meal_choice in meal_choices:
        try:
            meal_time = MealTime[meal_choice.upper()]
            meal = Meal.query.filter_by(meal_time=meal_time).first()
            if meal:
                new_user.meals.append(meal)
            else:
                return jsonify({"message": f"Invalid meal choice: {meal_choice}"}), 400
        except KeyError:
            return jsonify({"message": f"Invalid meal choice: {meal_choice}"}), 400

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
        access_token = create_access_token(
            {
                "user_id": user.id,
                "email": user.email,
                "exp": datetime.now() + timedelta(hours=1),
            },
            "TEST_KEY",
        )

        return jsonify({"access_token": access_token, "user_id": user.id}), 200

    return jsonify({"message": "Invalid email or password"}), 401
