from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt_manager = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
    app.config["JWT_SECRET_KEY"] = "TEST_KEY"

    CORS(app)

    # Add JWT configuration
    app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"

    db.init_app(app)
    bcrypt.init_app(app)
    jwt_manager.init_app(app)

    from .app.auth.auth import auth_bp
    from .app.management.user_management import user_management
    from .app.models.models import init_meals

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_management, url_prefix="/api")

    with app.app_context():
        db.create_all()
        init_meals()

    return app
