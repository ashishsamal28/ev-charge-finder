import math
from datetime import datetime, timezone
from flask import Blueprint, request
from app.extensions import db
from app.models import Booking, ensure_utc
from app.errors import APIError, success_response
from app.utils.auth import get_current_user
from app.services.booking_service import create_booking, cancel_booking

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/bookings")

@bookings_bp.route("", methods=["POST"])
def book_slot():
    user = get_current_user()
    data = request.get_json() or {}

    station_id = data.get("station_id")
    charger_id = data.get("charger_id")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    estimated_energy_kwh = data.get("estimated_energy_kwh")

    if not station_id or not charger_id or not start_time or not end_time:
        raise APIError("VALIDATION_ERROR", "station_id, charger_id, start_time, and end_time are required.", 400)

    booking = create_booking(
        user=user,
        station_id=int(station_id),
        charger_id=int(charger_id),
        start_time=start_time,
        end_time=end_time,
        estimated_energy_kwh=estimated_energy_kwh
    )

    return success_response(booking.to_dict(), status_code=201)

@bookings_bp.route("/my", methods=["GET"])
def get_my_bookings():
    user = get_current_user()
    status_filter = request.args.get("status", "all").lower()
    search_q = (request.args.get("q") or "").strip()
    page = max(1, request.args.get("page", 1, type=int))
    limit = min(50, max(1, request.args.get("limit", 10, type=int)))

    query = Booking.query.filter_by(user_id=user.id)

    now = datetime.now(timezone.utc)

    if status_filter == "upcoming":
        query = query.filter(Booking.status == "confirmed", Booking.start_time >= now)
    elif status_filter == "completed":
        query = query.filter(
            (Booking.status == "completed") | 
            ((Booking.status == "confirmed") & (Booking.end_time < now))
        )
    elif status_filter == "cancelled":
        query = query.filter(Booking.status == "cancelled")

    if search_q:
        query = query.filter(Booking.booking_reference.ilike(f"%{search_q}%"))

    query = query.order_by(Booking.start_time.desc())

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    bookings = query.offset((page - 1) * limit).limit(limit).all()

    items = []
    for b in bookings:
        item = b.to_dict()
        if b.status == "confirmed" and ensure_utc(b.end_time) < now:
            item["status"] = "completed"
        items.append(item)

    return success_response(
        data=items,
        meta={
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    )

@bookings_bp.route("/<int:booking_id>", methods=["GET"])
def get_booking(booking_id):
    user = get_current_user()
    booking = db.session.get(Booking, booking_id)
    if not booking:
        raise APIError("BOOKING_NOT_FOUND", "Booking not found.", 404)

    if user.role != "admin" and booking.user_id != user.id:
        raise APIError("FORBIDDEN", "You do not have access to this booking.", 403)

    item = booking.to_dict()
    now = datetime.now(timezone.utc)
    if booking.status == "confirmed" and ensure_utc(booking.end_time) < now:
        item["status"] = "completed"

    return success_response(item)

@bookings_bp.route("/<int:booking_id>/cancel", methods=["PATCH"])
def cancel(booking_id):
    user = get_current_user()
    booking = cancel_booking(user, booking_id)
    return success_response(booking.to_dict())
