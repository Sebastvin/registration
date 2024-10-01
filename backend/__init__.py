from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt


db = SQLAlchemy()
bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

    db.init_app(app)
    bcrypt.init_app(app)

    from .auth import auth_bp

    app.register_blueprint(auth_bp)

    with app.app_context():
        db.create_all()

    return app
