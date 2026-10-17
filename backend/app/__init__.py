
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from app.extensions import db, jwt
from app.errors import register_error_handlers


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    register_error_handlers(app)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    from app.routes.stations import stations_bp
    from app.routes.bookings import bookings_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(stations_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(admin_bp)

    with app.app_context():
        db.create_all()

    @app.get("/")
    def health_check():
        return jsonify({
            "message": "EV Charge Finder API is running"
        })

    return app
