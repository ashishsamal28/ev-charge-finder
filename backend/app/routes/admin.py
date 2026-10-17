import math
from datetime import datetime, timezone
from flask import Blueprint, request
from sqlalchemy import or_
from app.extensions import db
from app.models import Station, Charger, Booking, User
from app.errors import APIError, success_response
from app.utils.auth import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

# --- ADMIN STATS ---

@admin_bp.route("/stats", methods=["GET"])
@admin_required()
def get_stats():
    now = datetime.now(timezone.utc)
    
    total_stations = Station.query.count()
    active_stations = Station.query.filter_by(is_active=True).count()
    
    total_chargers = Charger.query.count()
    operational_chargers = Charger.query.filter_by(operational_status="Available", is_active=True).count()
    chargers_maintenance = Charger.query.filter_by(operational_status="Maintenance").count()
    chargers_out_of_service = Charger.query.filter_by(operational_status="Out of Service").count()

    upcoming_bookings = Booking.query.filter(Booking.status == "confirmed", Booking.start_time >= now).count()
    completed_bookings = Booking.query.filter(
        (Booking.status == "completed") | ((Booking.status == "confirmed") & (Booking.end_time < now))
    ).count()
    cancelled_bookings = Booking.query.filter_by(status="cancelled").count()
    total_bookings = Booking.query.count()

    recent_bookings = Booking.query.order_by(Booking.created_at.desc()).limit(6).all()

    return success_response({
        "stations": {
            "total": total_stations,
            "active": active_stations,
            "inactive": total_stations - active_stations
        },
        "chargers": {
            "total": total_chargers,
            "operational": operational_chargers,
            "maintenance": chargers_maintenance,
            "out_of_service": chargers_out_of_service
        },
        "bookings": {
            "total": total_bookings,
            "upcoming": upcoming_bookings,
            "completed": completed_bookings,
            "cancelled": cancelled_bookings
        },
        "recent_bookings": [b.to_dict() for b in recent_bookings]
    })

# --- ADMIN STATIONS ---

@admin_bp.route("/stations", methods=["GET"])
@admin_required()
def list_stations():
    search_q = (request.args.get("q") or "").strip()
    status_filter = request.args.get("status", "all")
    page = max(1, request.args.get("page", 1, type=int))
    limit = min(50, max(1, request.args.get("limit", 10, type=int)))

    query = Station.query
    if search_q:
        term = f"%{search_q}%"
        query = query.filter(
            or_(
                Station.name.ilike(term),
                Station.city.ilike(term),
                Station.address.ilike(term)
            )
        )

    if status_filter == "active":
        query = query.filter_by(is_active=True)
    elif status_filter == "inactive":
        query = query.filter_by(is_active=False)

    query = query.order_by(Station.id.desc())

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    stations = query.offset((page - 1) * limit).limit(limit).all()

    return success_response(
        data=[s.to_dict(include_chargers=True) for s in stations],
        meta={
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    )

@admin_bp.route("/stations", methods=["POST"])
@admin_required()
def create_station():
    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    address = (data.get("address") or "").strip()
    city = (data.get("city") or "").strip()
    state = (data.get("state") or "").strip()
    postal_code = (data.get("postal_code") or "").strip()

    if not name or not address or not city or not state or not postal_code:
        raise APIError("VALIDATION_ERROR", "Name, address, city, state, and postal code are required.", 400)

    lat = data.get("latitude")
    lng = data.get("longitude")
    if lat is not None:
        try:
            lat = float(lat)
            if lat < -90 or lat > 90:
                raise ValueError()
        except ValueError:
            raise APIError("VALIDATION_ERROR", "Latitude must be between -90 and 90.", 400)
    
    if lng is not None:
        try:
            lng = float(lng)
            if lng < -180 or lng > 180:
                raise ValueError()
        except ValueError:
            raise APIError("VALIDATION_ERROR", "Longitude must be between -180 and 180.", 400)

    station = Station(
        name=name,
        description=(data.get("description") or "").strip() or None,
        address=address,
        city=city,
        state=state,
        postal_code=postal_code,
        latitude=lat,
        longitude=lng,
        opening_hours=(data.get("opening_hours") or "24/7").strip(),
        contact_phone=(data.get("contact_phone") or "").strip() or None,
        amenities=",".join(data.get("amenities")) if isinstance(data.get("amenities"), list) else (data.get("amenities") or None),
        is_active=bool(data.get("is_active", True))
    )

    db.session.add(station)
    db.session.commit()

    return success_response(station.to_dict(include_chargers=True), status_code=201)

@admin_bp.route("/stations/<int:station_id>", methods=["PUT"])
@admin_required()
def update_station(station_id):
    station = db.session.get(Station, station_id)
    if not station:
        raise APIError("STATION_NOT_FOUND", "Station not found.", 404)

    data = request.get_json() or {}

    if "name" in data:
        name = (data["name"] or "").strip()
        if not name:
            raise APIError("VALIDATION_ERROR", "Station name cannot be empty.", 400)
        station.name = name

    if "description" in data:
        station.description = (data["description"] or "").strip() or None

    if "address" in data:
        addr = (data["address"] or "").strip()
        if not addr:
            raise APIError("VALIDATION_ERROR", "Address cannot be empty.", 400)
        station.address = addr

    if "city" in data:
        city = (data["city"] or "").strip()
        if not city:
            raise APIError("VALIDATION_ERROR", "City cannot be empty.", 400)
        station.city = city

    if "state" in data:
        st = (data["state"] or "").strip()
        if not st:
            raise APIError("VALIDATION_ERROR", "State cannot be empty.", 400)
        station.state = st

    if "postal_code" in data:
        pc = (data["postal_code"] or "").strip()
        if not pc:
            raise APIError("VALIDATION_ERROR", "Postal code cannot be empty.", 400)
        station.postal_code = pc

    if "latitude" in data:
        lat = data["latitude"]
        if lat is not None:
            try:
                lat = float(lat)
                if lat < -90 or lat > 90:
                    raise ValueError()
                station.latitude = lat
            except ValueError:
                raise APIError("VALIDATION_ERROR", "Latitude must be between -90 and 90.", 400)
        else:
            station.latitude = None

    if "longitude" in data:
        lng = data["longitude"]
        if lng is not None:
            try:
                lng = float(lng)
                if lng < -180 or lng > 180:
                    raise ValueError()
                station.longitude = lng
            except ValueError:
                raise APIError("VALIDATION_ERROR", "Longitude must be between -180 and 180.", 400)
        else:
            station.longitude = None

    if "opening_hours" in data:
        station.opening_hours = (data["opening_hours"] or "24/7").strip()

    if "contact_phone" in data:
        station.contact_phone = (data["contact_phone"] or "").strip() or None

    if "amenities" in data:
        amenities = data["amenities"]
        station.amenities = ",".join(amenities) if isinstance(amenities, list) else (amenities or None)

    if "is_active" in data:
        station.is_active = bool(data["is_active"])

    db.session.commit()
    return success_response(station.to_dict(include_chargers=True))

@admin_bp.route("/stations/<int:station_id>/status", methods=["PATCH"])
@admin_required()
def toggle_station_status(station_id):
    station = db.session.get(Station, station_id)
    if not station:
        raise APIError("STATION_NOT_FOUND", "Station not found.", 404)

    data = request.get_json() or {}
    if "is_active" in data:
        station.is_active = bool(data["is_active"])
    else:
        station.is_active = not station.is_active

    db.session.commit()
    return success_response(station.to_dict(include_chargers=True))

@admin_bp.route("/stations/<int:station_id>", methods=["DELETE"])
@admin_required()
def delete_station(station_id):
    station = db.session.get(Station, station_id)
    if not station:
        raise APIError("STATION_NOT_FOUND", "Station not found.", 404)

    booking_count = Booking.query.filter_by(station_id=station.id).count()
    if booking_count > 0:
        raise APIError(
            "CANNOT_DELETE_STATION_WITH_BOOKINGS",
            f"Cannot delete station with {booking_count} existing booking records. Deactivate the station instead to preserve historical records.",
            400
        )

    db.session.delete(station)
    db.session.commit()
    return success_response({"message": "Station successfully deleted."})

# --- ADMIN CHARGERS ---

@admin_bp.route("/chargers", methods=["GET"])
@admin_required()
def list_chargers():
    station_id = request.args.get("station_id", type=int)
    query = Charger.query
    if station_id:
        query = query.filter_by(station_id=station_id)

    chargers = query.order_by(Charger.id.desc()).all()
    return success_response([c.to_dict() for c in chargers])

@admin_bp.route("/chargers", methods=["POST"])
@admin_required()
def create_charger():
    data = request.get_json() or {}

    station_id = data.get("station_id")
    charger_code = (data.get("charger_code") or "").strip()
    connector_type = (data.get("connector_type") or "").strip()
    charging_power_kw = data.get("charging_power_kw")
    price_per_kwh = data.get("price_per_kwh")
    operational_status = (data.get("operational_status") or "Available").strip()
    is_active = bool(data.get("is_active", True))

    if not station_id or not charger_code or not connector_type or charging_power_kw is None or price_per_kwh is None:
        raise APIError("VALIDATION_ERROR", "station_id, charger_code, connector_type, power, and price are required.", 400)

    station = db.session.get(Station, station_id)
    if not station:
        raise APIError("STATION_NOT_FOUND", "Station not found.", 404)

    duplicate = Charger.query.filter_by(station_id=station_id, charger_code=charger_code).first()
    if duplicate:
        raise APIError("DUPLICATE_CHARGER_CODE", f"Charger code '{charger_code}' already exists at this station.", 409)

    try:
        power = float(charging_power_kw)
        price = float(price_per_kwh)
        if power <= 0 or price < 0:
            raise ValueError()
    except ValueError:
        raise APIError("VALIDATION_ERROR", "Charging power must be > 0 and price per kWh must be >= 0.", 400)

    charger = Charger(
        station_id=station_id,
        charger_code=charger_code,
        connector_type=connector_type,
        charging_power_kw=power,
        price_per_kwh=price,
        operational_status=operational_status,
        is_active=is_active
    )

    db.session.add(charger)
    db.session.commit()

    return success_response(charger.to_dict(), status_code=201)

@admin_bp.route("/chargers/<int:charger_id>", methods=["PUT"])
@admin_required()
def update_charger(charger_id):
    charger = db.session.get(Charger, charger_id)
    if not charger:
        raise APIError("CHARGER_NOT_FOUND", "Charger not found.", 404)

    data = request.get_json() or {}

    if "charger_code" in data:
        code = (data["charger_code"] or "").strip()
        if not code:
            raise APIError("VALIDATION_ERROR", "Charger code cannot be empty.", 400)
        dup = Charger.query.filter(
            Charger.station_id == charger.station_id,
            Charger.charger_code == code,
            Charger.id != charger.id
        ).first()
        if dup:
            raise APIError("DUPLICATE_CHARGER_CODE", f"Charger code '{code}' already in use at this station.", 409)
        charger.charger_code = code

    if "connector_type" in data:
        charger.connector_type = (data["connector_type"] or charger.connector_type).strip()

    if "charging_power_kw" in data:
        try:
            power = float(data["charging_power_kw"])
            if power <= 0:
                raise ValueError()
            charger.charging_power_kw = power
        except ValueError:
            raise APIError("VALIDATION_ERROR", "Power must be greater than 0.", 400)

    if "price_per_kwh" in data:
        try:
            price = float(data["price_per_kwh"])
            if price < 0:
                raise ValueError()
            charger.price_per_kwh = price
        except ValueError:
            raise APIError("VALIDATION_ERROR", "Price must be non-negative.", 400)

    if "operational_status" in data:
        status = data["operational_status"]
        if status not in ["Available", "Occupied", "Maintenance", "Out of Service"]:
            raise APIError("VALIDATION_ERROR", "Invalid operational status.", 400)
        charger.operational_status = status

    if "is_active" in data:
        charger.is_active = bool(data["is_active"])

    db.session.commit()
    return success_response(charger.to_dict())

@admin_bp.route("/chargers/<int:charger_id>/status", methods=["PATCH"])
@admin_required()
def toggle_charger_status(charger_id):
    charger = db.session.get(Charger, charger_id)
    if not charger:
        raise APIError("CHARGER_NOT_FOUND", "Charger not found.", 404)

    data = request.get_json() or {}
    if "operational_status" in data:
        status = data["operational_status"]
        if status not in ["Available", "Occupied", "Maintenance", "Out of Service"]:
            raise APIError("VALIDATION_ERROR", "Invalid operational status.", 400)
        charger.operational_status = status

    if "is_active" in data:
        charger.is_active = bool(data["is_active"])

    db.session.commit()
    return success_response(charger.to_dict())

@admin_bp.route("/chargers/<int:charger_id>", methods=["DELETE"])
@admin_required()
def delete_charger(charger_id):
    charger = db.session.get(Charger, charger_id)
    if not charger:
        raise APIError("CHARGER_NOT_FOUND", "Charger not found.", 404)

    booking_count = Booking.query.filter_by(charger_id=charger.id).count()
    if booking_count > 0:
        raise APIError(
            "CANNOT_DELETE_CHARGER_WITH_BOOKINGS",
            f"Cannot delete charger with {booking_count} existing booking records. Deactivate or set to 'Out of Service' instead.",
            400
        )

    db.session.delete(charger)
    db.session.commit()
    return success_response({"message": "Charger successfully deleted."})

# --- ADMIN BOOKINGS ---

@admin_bp.route("/bookings", methods=["GET"])
@admin_required()
def list_bookings():
    search_q = (request.args.get("q") or "").strip()
    status_filter = request.args.get("status", "all")
    station_id = request.args.get("station_id", type=int)
    date_filter = request.args.get("date")
    page = max(1, request.args.get("page", 1, type=int))
    limit = min(50, max(1, request.args.get("limit", 10, type=int)))

    query = Booking.query
    if search_q:
        term = f"%{search_q}%"
        query = query.join(User, Booking.user_id == User.id).join(Station, Booking.station_id == Station.id).filter(
            or_(
                Booking.booking_reference.ilike(term),
                User.full_name.ilike(term),
                User.email.ilike(term),
                Station.name.ilike(term)
            )
        )

    if station_id:
        query = query.filter(Booking.station_id == station_id)

    if status_filter and status_filter != "all":
        query = query.filter(Booking.status == status_filter)

    if date_filter:
        try:
            from datetime import timedelta
            d = datetime.strptime(date_filter, "%Y-%m-%d").date()
            start_d = datetime(d.year, d.month, d.day, 0, 0, 0, tzinfo=timezone.utc)
            end_d = start_d + timedelta(days=1)
            query = query.filter(Booking.start_time >= start_d, Booking.start_time < end_d)
        except Exception:
            pass

    query = query.order_by(Booking.start_time.desc())

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    bookings = query.offset((page - 1) * limit).limit(limit).all()

    return success_response(
        data=[b.to_dict() for b in bookings],
        meta={
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    )

@admin_bp.route("/bookings/<int:booking_id>", methods=["GET"])
@admin_required()
def get_admin_booking(booking_id):
    booking = db.session.get(Booking, booking_id)
    if not booking:
        raise APIError("BOOKING_NOT_FOUND", "Booking record not found.", 404)
    return success_response(booking.to_dict())
