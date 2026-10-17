from datetime import datetime, timezone
import math

from flask import Blueprint, request
from sqlalchemy import or_

from app.extensions import db
from app.models import Station
from app.errors import APIError, success_response
from app.services.booking_service import get_station_availability


stations_bp = Blueprint("stations", __name__, url_prefix="/api/stations")


def calculate_distance(lat1, lon1, lat2, lon2):
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1)
        * math.cos(phi2)
        * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


@stations_bp.route("", methods=["GET"])
def get_stations():
    query_str = (request.args.get("q") or "").strip()
    city = (request.args.get("city") or "").strip()
    connector = (request.args.get("connector") or "").strip()
    category = (request.args.get("category") or "").strip().upper()

    min_power = request.args.get("min_power", type=float)
    max_power = request.args.get("max_power", type=float)
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)

    available_only = (
        request.args.get("available_only", "").lower()
        in ["1", "true", "yes"]
    )
    amenity = (request.args.get("amenity") or "").strip()
    sort = request.args.get("sort", "recommended")

    user_lat = request.args.get("lat", type=float)
    user_lng = request.args.get("lng", type=float)

    page = max(1, request.args.get("page", 1, type=int))
    limit = min(50, max(1, request.args.get("limit", 9, type=int)))

    query = Station.query.filter(Station.is_active.is_(True))

    if query_str:
        term = f"%{query_str}%"
        query = query.filter(
            or_(
                Station.name.ilike(term),
                Station.city.ilike(term),
                Station.address.ilike(term),
                Station.state.ilike(term),
                Station.postal_code.ilike(term),
            )
        )

    if city:
        query = query.filter(Station.city.ilike(f"%{city}%"))

    if amenity:
        query = query.filter(Station.amenities.ilike(f"%{amenity}%"))

    stations_list = query.all()
    filtered_stations = []

    for st in stations_list:
        active_chargers = [
            charger for charger in st.chargers if charger.is_active
        ]

        if not active_chargers:
            continue

        operational_chargers = [
            charger
            for charger in active_chargers
            if charger.operational_status == "Available"
        ]

        if available_only and not operational_chargers:
            continue

        if connector:
            has_connector = any(
                charger.connector_type
                and charger.connector_type.lower() == connector.lower()
                for charger in active_chargers
            )
            if not has_connector:
                continue

        if category == "DC":
            has_dc = any(
                charger.connector_type in ["CCS2", "CHAdeMO"]
                or (charger.charging_power_kw or 0) > 22.0
                for charger in active_chargers
            )
            if not has_dc:
                continue

        elif category == "AC":
            has_ac = any(
                charger.connector_type == "Type 2"
                or (charger.charging_power_kw or 0) <= 22.0
                for charger in active_chargers
            )
            if not has_ac:
                continue

        charger_powers = [
            charger.charging_power_kw or 0
            for charger in active_chargers
        ]
        charger_prices = [
            charger.price_per_kwh or 0
            for charger in active_chargers
        ]

        max_station_power = max(charger_powers, default=0)
        min_station_price = min(charger_prices, default=0)

        if min_power is not None and max_station_power < min_power:
            continue

        if max_power is not None and min(charger_powers, default=0) > max_power:
            continue

        if min_price is not None and min_station_price < min_price:
            continue

        if max_price is not None and min_station_price > max_price:
            continue

        station_dict = st.to_dict(include_chargers=False)

        station_dict["operational_chargers_count"] = len(
            operational_chargers
        )
        station_dict["max_power_kw"] = max_station_power
        station_dict["min_price_per_kwh"] = min_station_price

        if (
            user_lat is not None
            and user_lng is not None
            and st.latitude is not None
            and st.longitude is not None
        ):
            station_dict["distance_km"] = round(
                calculate_distance(
                    user_lat,
                    user_lng,
                    st.latitude,
                    st.longitude,
                ),
                1,
            )
        else:
            station_dict["distance_km"] = None

        filtered_stations.append(station_dict)

    if sort == "price_asc":
        filtered_stations.sort(
            key=lambda station: station["min_price_per_kwh"]
        )

    elif sort == "price_desc":
        filtered_stations.sort(
            key=lambda station: station["min_price_per_kwh"],
            reverse=True,
        )

    elif sort == "name_asc":
        filtered_stations.sort(
            key=lambda station: station["name"].lower()
        )

    elif sort == "name_desc":
        filtered_stations.sort(
            key=lambda station: station["name"].lower(),
            reverse=True,
        )

    elif sort == "nearest" and user_lat is not None and user_lng is not None:
        filtered_stations.sort(
            key=lambda station: (
                station["distance_km"]
                if station["distance_km"] is not None
                else float("inf")
            )
        )

    else:
        filtered_stations.sort(
            key=lambda station: (
                station["operational_chargers_count"],
                station["max_power_kw"],
            ),
            reverse=True,
        )

    total = len(filtered_stations)
    total_pages = math.ceil(total / limit) if total > 0 else 1

    start_idx = (page - 1) * limit
    paginated_items = filtered_stations[start_idx : start_idx + limit]

    return success_response(
        data=paginated_items,
        message="Stations retrieved successfully",
    )


@stations_bp.route("/<int:station_id>/availability", methods=["GET"])
def get_availability(station_id):
    date_str = request.args.get("date")

    if not date_str:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    availability = get_station_availability(station_id, date_str)
    return success_response(availability)