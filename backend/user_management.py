from flask import Blueprint, jsonify, request
from .models import User, MealType, Meal, MealTime
from . import db
from datetime import datetime

user_management = Blueprint("user_management", __name__)


@user_management.route("/users", methods=["GET"])
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


@user_management.route("/users/<int:user_id>", methods=["GET"])
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
def create_user():
    data = request.get_json()

    required_fields = ["email", "password"]
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"{field} is required"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "User already exists"}), 400

    new_user = User(
        email=data["email"],
        password=data["password"],
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
            meal = Meal.query.filter_by(meal_time=MealTime[meal_time.upper()]).first()
            if meal:
                new_user.meals.append(meal)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


@user_management.route("/users/<int:user_id>", methods=["PUT"])
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
            meal = Meal.query.filter_by(meal_time=MealTime[meal_time.upper()]).first()
            if meal:
                user.meals.append(meal)

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200


@user_management.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200
