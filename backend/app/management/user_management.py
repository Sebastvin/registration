from flask import Blueprint, jsonify, request
from ..models.models import User, MealType, Meal, MealTime
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ... import db, bcrypt

user_management = Blueprint("user_management", __name__)


@user_management.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    users = User.query.all()
    return (
        jsonify(
            [
                {
                    "id": user.id,
                    "email": user.email,
                    "is_organiser": user.is_organiser,
                    "meal_preference": user.meal_preference.value
                    if user.meal_preference
                    else None,
                    "participation_start_time": user.participation_start_time.isoformat()
                    if user.participation_start_time
                    else None,
                    "participation_end_time": user.participation_end_time.isoformat()
                    if user.participation_end_time
                    else None,
                    "meals": [meal.meal_time.value for meal in user.meals],
                }
                for user in users
            ]
        ),
        200,
    )


@user_management.route("/user/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return (
        jsonify(
            {
                "email": user.email,
                "meal_preference": user.meal_preference.name
                if user.meal_preference
                else None,
                "participation_start_time": user.participation_start_time.isoformat()
                if user.participation_start_time
                else None,
                "participation_end_time": user.participation_end_time.isoformat()
                if user.participation_end_time
                else None,
                "meals": [meal.meal_time.name for meal in user.meals],
            }
        ),
        200,
    )


@user_management.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return (
        jsonify(
            {
                "id": user.id,
                "email": user.email,
                "is_organiser": user.is_organiser,
                "meal_preference": user.meal_preference.value
                if user.meal_preference
                else None,
                "participation_start_time": user.participation_start_time.isoformat()
                if user.participation_start_time
                else None,
                "participation_end_time": user.participation_end_time.isoformat()
                if user.participation_end_time
                else None,
                "meals": [meal.meal_time.value for meal in user.meals],
            }
        ),
        200,
    )


@user_management.route("/users", methods=["POST"])
@jwt_required()
def create_user():
    data = request.get_json()

    required_fields = ["email", "password"]
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"{field} is required"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    new_user = User(
        email=data["email"],
        password=hashed_password,
        is_organiser=data.get("is_organiser", False),
        meal_preference=MealType[data["meal_preference"].upper()]
        if "meal_preference" in data
        else None,
        participation_start_time=datetime.fromisoformat(
            data["participation_start_time"]
        )
        if "participation_start_time" in data
        else None,
        participation_end_time=datetime.fromisoformat(data["participation_end_time"])
        if "participation_end_time" in data
        else None,
    )

    if "meals" in data:
        for meal_time in data["meals"]:
            try:
                meal_enum = MealTime[meal_time.upper()]
            except KeyError:
                return jsonify({"message": f"Invalid meal choice: {meal_time}"}), 400
            meal = Meal.query.filter_by(meal_time=meal_enum).first()
            if meal:
                new_user.meals.append(meal)
            else:
                return jsonify({"message": f"Meal time not found: {meal_time}"}), 400

    db.session.add(new_user)
    db.session.commit()

    serialized_user = {
        "id": new_user.id,
        "email": new_user.email,
        "is_organiser": new_user.is_organiser,
        "meal_preference": new_user.meal_preference.name
        if new_user.meal_preference
        else None,
        "participation_start_time": new_user.participation_start_time.isoformat()
        if new_user.participation_start_time
        else None,
        "participation_end_time": new_user.participation_end_time.isoformat()
        if new_user.participation_end_time
        else None,
        "meals": [meal.meal_time.name for meal in new_user.meals],
    }

    return jsonify(serialized_user), 201


@user_management.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if "email" in data:
        user.email = data["email"]
    if "is_organiser" in data:
        user.is_organiser = data["is_organiser"]
    if "meal_preference" in data:
        user.meal_preference = (
            MealType[data["meal_preference"].upper()]
            if data["meal_preference"]
            else None
        )
    if "participation_start_time" in data:
        user.participation_start_time = (
            datetime.fromisoformat(data["participation_start_time"])
            if data["participation_start_time"]
            else None
        )
    if "participation_end_time" in data:
        user.participation_end_time = (
            datetime.fromisoformat(data["participation_end_time"])
            if data["participation_end_time"]
            else None
        )

    if "meals" in data:
        user.meals = []
        for meal_time in data["meals"]:
            try:
                meal_enum = MealTime[meal_time.upper()]
            except KeyError:
                return jsonify({"message": f"Invalid meal choice: {meal_time}"}), 400
            meal = Meal.query.filter_by(meal_time=meal_enum).first()
            if meal:
                user.meals.append(meal)
            else:
                return jsonify({"message": f"Meal time not found: {meal_time}"}), 400

    db.session.commit()

    serialized_user = {
        "id": user.id,
        "email": user.email,
        "is_organiser": user.is_organiser,
        "meal_preference": user.meal_preference.value if user.meal_preference else None,
        "participation_start_time": user.participation_start_time.isoformat()
        if user.participation_start_time
        else None,
        "participation_end_time": user.participation_end_time.isoformat()
        if user.participation_end_time
        else None,
        "meals": [meal.meal_time.value for meal in user.meals],
    }

    return jsonify(serialized_user), 200


@user_management.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200


@user_management.route("/user/role", methods=["GET"])
@jwt_required()
def check_user_role():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"is_organiser": user.is_organiser}), 200
