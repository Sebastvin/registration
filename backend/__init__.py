from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt


db = SQLAlchemy()
bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
    app.config["JWT_SECRET_KEY"] = "temp"

    db.init_app(app)
    bcrypt.init_app(app)

    from .auth import auth_bp
    from .user_management import user_management

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_management, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app
