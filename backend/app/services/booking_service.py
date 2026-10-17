from datetime import datetime, timezone, timedelta
import threading
from app.extensions import db
from app.models import Booking, Charger, Station, User, ensure_utc
from app.errors import APIError

_booking_lock = threading.Lock()

def check_interval_overlap(charger_id, start_time, end_time, exclude_booking_id=None):
    """
    Check if requested interval overlaps with any active (confirmed) booking for the charger.
    Two intervals overlap when: requested_start < existing_end AND requested_end > existing_start
    Only 'confirmed' bookings block the slot; cancelled bookings do not.
    """
    query = Booking.query.filter(
        Booking.charger_id == charger_id,
        Booking.status == "confirmed",
        Booking.start_time < end_time,
        Booking.end_time > start_time
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    return query.first()

def create_booking(user, station_id, charger_id, start_time, end_time, estimated_energy_kwh=None):
    """
    Atomically validate and create a booking.
    Protected by concurrency lock and transactional commit.
    """
    if isinstance(start_time, str):
        try:
            start_time = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
        except Exception:
            raise APIError("INVALID_DATE_FORMAT", "Invalid start_time format. Use ISO format (e.g. 2026-10-15T14:00:00Z)", 400)
    
    if isinstance(end_time, str):
        try:
            end_time = datetime.fromisoformat(end_time.replace("Z", "+00:00"))
        except Exception:
            raise APIError("INVALID_DATE_FORMAT", "Invalid end_time format. Use ISO format (e.g. 2026-10-15T15:00:00Z)", 400)

    start_time = ensure_utc(start_time)
    end_time = ensure_utc(end_time)

    now = datetime.now(timezone.utc)

    # Server-side validation
    if start_time < now - timedelta(minutes=2):
        raise APIError("PAST_BOOKING_NOT_ALLOWED", "Booking start time must be in the future.", 400)

    if end_time <= start_time:
        raise APIError("INVALID_INTERVAL", "End time must be after start time.", 400)

    duration_minutes = (end_time - start_time).total_seconds() / 60
    if duration_minutes < 15:
        raise APIError("DURATION_TOO_SHORT", "Minimum booking duration is 15 minutes.", 400)
    if duration_minutes > 480:
        raise APIError("DURATION_TOO_LONG", "Maximum booking duration is 8 hours.", 400)

    station = db.session.get(Station, station_id)
    if not station:
        raise APIError("STATION_NOT_FOUND", "Station not found.", 404)
    if not station.is_active:
        raise APIError("STATION_INACTIVE", "This station is currently inactive.", 400)

    charger = db.session.get(Charger, charger_id)
    if not charger:
        raise APIError("CHARGER_NOT_FOUND", "Charger not found.", 404)
    if charger.station_id != station.id:
        raise APIError("INVALID_CHARGER_STATION", "Charger does not belong to the selected station.", 400)
    if not charger.is_active:
        raise APIError("CHARGER_INACTIVE", "This charger is currently inactive.", 400)
    if charger.operational_status in ["Maintenance", "Out of Service"]:
        raise APIError("CHARGER_UNAVAILABLE", f"Charger is currently {charger.operational_status.lower()}.", 400)

    estimated_cost = None
    if estimated_energy_kwh is not None:
        try:
            estimated_energy_kwh = float(estimated_energy_kwh)
            if estimated_energy_kwh > 0:
                estimated_cost = round(estimated_energy_kwh * charger.price_per_kwh, 2)
            else:
                estimated_energy_kwh = None
        except (ValueError, TypeError):
            estimated_energy_kwh = None

    with _booking_lock:
        conflict = check_interval_overlap(charger_id, start_time, end_time)
        if conflict:
            raise APIError(
                "BOOKING_CONFLICT",
                "This charger is already reserved for the selected time interval.",
                409,
                details={
                    "conflicting_booking_reference": conflict.booking_reference,
                    "conflicting_start": ensure_utc(conflict.start_time).isoformat(),
                    "conflicting_end": ensure_utc(conflict.end_time).isoformat()
                }
            )

        booking = Booking(
            booking_reference=Booking.generate_reference(),
            user_id=user.id,
            station_id=station.id,
            charger_id=charger.id,
            start_time=start_time,
            end_time=end_time,
            status="confirmed",
            price_per_kwh_snapshot=charger.price_per_kwh,
            estimated_energy_kwh=estimated_energy_kwh,
            estimated_cost=estimated_cost
        )

        db.session.add(booking)
        db.session.commit()

        return booking

def cancel_booking(user, booking_id):
    """
    Cancel an existing booking adhering to cutoff policies and user ownership.
    """
    booking = db.session.get(Booking, booking_id)
    if not booking:
        raise APIError("BOOKING_NOT_FOUND", "Booking record not found.", 404)

    if user.role != "admin" and booking.user_id != user.id:
        raise APIError("FORBIDDEN", "You are not authorized to cancel this booking.", 403)

    if booking.status == "cancelled":
        raise APIError("ALREADY_CANCELLED", "This booking is already cancelled.", 400)

    if booking.status == "completed":
        raise APIError("ALREADY_COMPLETED", "Cannot cancel a completed booking.", 400)

    now = datetime.now(timezone.utc)
    booking_start = ensure_utc(booking.start_time)
    cutoff_time = booking_start - timedelta(minutes=30)

    if now > cutoff_time and user.role != "admin":
        raise APIError(
            "CANCELLATION_CUTOFF_EXCEEDED",
            "Bookings cannot be cancelled less than 30 minutes before the scheduled start time.",
            400
        )

    booking.status = "cancelled"
    booking.cancelled_at = now
    db.session.commit()

    return booking

def get_station_availability(station_id, target_date):
    station = db.session.get(Station, station_id)
    if not station:
        raise APIError("STATION_NOT_FOUND", "Station not found.", 404)

    try:
        date_obj = datetime.strptime(target_date, "%Y-%m-%d").date()
    except Exception:
        raise APIError("INVALID_DATE", "target_date must be in YYYY-MM-DD format.", 400)

    chargers = Charger.query.filter_by(station_id=station_id, is_active=True).all()

    start_of_day = datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0, tzinfo=timezone.utc)
    end_of_day = start_of_day + timedelta(days=1)

    bookings = Booking.query.filter(
        Booking.station_id == station_id,
        Booking.status == "confirmed",
        Booking.start_time < end_of_day,
        Booking.end_time > start_of_day
    ).all()

    availability_by_charger = {}
    for c in chargers:
        charger_bookings = [b for b in bookings if b.charger_id == c.id]
        
        slots = []
        current_slot_start = datetime(date_obj.year, date_obj.month, date_obj.day, 6, 0, 0, tzinfo=timezone.utc)
        day_limit = datetime(date_obj.year, date_obj.month, date_obj.day, 23, 0, 0, tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)

        while current_slot_start < day_limit:
            current_slot_end = current_slot_start + timedelta(minutes=30)
            
            is_reserved = any(
                ensure_utc(b.start_time) < current_slot_end and ensure_utc(b.end_time) > current_slot_start
                for b in charger_bookings
            )

            is_past = current_slot_start < now
            is_available = not is_reserved and not is_past and (c.operational_status == "Available")

            slots.append({
                "start_time": current_slot_start.isoformat(),
                "end_time": current_slot_end.isoformat(),
                "time_label": current_slot_start.strftime("%H:%M"),
                "is_available": is_available,
                "is_reserved": is_reserved,
                "is_past": is_past
            })

            current_slot_start = current_slot_end

        availability_by_charger[c.id] = {
            "charger_id": c.id,
            "charger_code": c.charger_code,
            "connector_type": c.connector_type,
            "charging_power_kw": c.charging_power_kw,
            "price_per_kwh": c.price_per_kwh,
            "operational_status": c.operational_status,
            "slots": slots
        }

    return availability_by_charger
