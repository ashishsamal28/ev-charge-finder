
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.models import User
from app.extensions import db


def get_current_user():
    verify_jwt_in_request()
    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None

    return db.session.get(User, user_id)


def admin_required(fn=None):
    def decorator(view_function):
        @wraps(view_function)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                identity = get_jwt_identity()

                try:
                    user_id = int(identity)
                except (TypeError, ValueError):
                    return jsonify({
                        "success": False,
                        "message": "Invalid authentication token"
                    }), 401

                user = db.session.get(User, user_id)

                if user is None or not user.is_active:
                    return jsonify({
                        "success": False,
                        "message": "User not found or inactive"
                    }), 401

                if user.role != "admin":
                    return jsonify({
                        "success": False,
                        "message": "Administrator access required"
                    }), 403

            except Exception:
                return jsonify({
                    "success": False,
                    "message": "Authentication required"
                }), 401

            return view_function(*args, **kwargs)

        return wrapper

    if fn is None:
        return decorator

    return decorator(fn)
