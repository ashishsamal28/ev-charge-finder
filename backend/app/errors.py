from flask import jsonify


class APIError(Exception):
    def __init__(self, message, status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


def success_response(data=None, message="Success", status_code=200):
    return jsonify({
        "success": True,
        "message": message,
        "data": data,
    }), status_code


def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = {
            "success": False,
            "message": error.message,
        }
        if error.details is not None:
            response["details"] = error.details
        return jsonify(response), error.status_code

    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({
            "success": False,
            "message": "An internal server error occurred",
        }), 500
