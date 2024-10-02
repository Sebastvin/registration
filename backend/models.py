from . import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum


class MealType(Enum):
    VEGETARIAN = "vegetarian"
    MEAT = "meat"


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_organiser = db.Column(db.Boolean, default=False, nullable=False)
    meal_preference = db.Column(SQLAlchemyEnum(MealType))
