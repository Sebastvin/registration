from . import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum


class MealType(Enum):
    VEGETARIAN = "vegetarian"
    MEAT = "meat"


class MealTime(Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


user_meals = db.Table(
    "user_meals",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
    db.Column("meal_id", db.Integer, db.ForeignKey("meal.id"), primary_key=True),
)


class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meal_time = db.Column(SQLAlchemyEnum(MealTime), nullable=False, unique=True)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_organiser = db.Column(db.Boolean, default=False, nullable=False)
    meal_preference = db.Column(SQLAlchemyEnum(MealType))
    participation_start_time = db.Column(db.DateTime, nullable=True)
    participation_end_time = db.Column(db.DateTime, nullable=True)
    meals = db.relationship(
        "Meal",
        secondary=user_meals,
        lazy="subquery",
        backref=db.backref("users", lazy=True),
    )

    def set_event_times(self, start_time, end_time):
        self.participation_start_time = start_time
        self.participation_end_time = end_time

    def get_event_duration(self):
        if self.participation_start_time and self.participation_end_time:
            return self.participation_end_time - self.participation_start_time
        return None


def init_meals():
    for meal_time in MealTime:
        meal = Meal.query.filter_by(meal_time=meal_time).first()
        if not meal:
            new_meal = Meal(meal_time=meal_time)
            db.session.add(new_meal)
    db.session.commit()
