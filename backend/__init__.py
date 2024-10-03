from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
    app.config["JWT_SECRET_KEY"] = "TEST_KEY"

    db.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)

    from .app.auth.auth import auth_bp
    from .app.management.user_management import user_management
    from .app.models.models import init_meals

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_management, url_prefix="/api")

    with app.app_context():
        db.create_all()
        init_meals()

    return app
