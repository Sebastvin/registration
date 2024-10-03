from flask import Blueprint, jsonify
from .models import User


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
                    "event_start_time": user.event_start_time.isoformat()
                    if user.event_start_time
                    else None,
                    "event_end_time": user.event_end_time.isoformat()
                    if user.event_end_time
                    else None,
                    "meals": [meal.meal_time.value for meal in user.meals],
                }
                for user in users
            ]
        ),
        200,
    )
