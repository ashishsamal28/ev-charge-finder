
from datetime import datetime, timezone
from uuid import uuid4

from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db


def ensure_utc(value):
    """Normalize a datetime to UTC."""
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(30))
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    bookings = db.relationship("Booking", back_populates="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "is_active": self.is_active,
        }


class Station(db.Model):
    __tablename__ = "stations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    opening_hours = db.Column(db.String(255))
    contact_phone = db.Column(db.String(30))
    amenities = db.Column(db.Text, default="")    
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    chargers = db.relationship(
        "Charger", back_populates="station", cascade="all, delete-orphan", lazy=True
    )
    bookings = db.relationship("Booking", back_populates="station", lazy=True)

    def to_dict(self, include_chargers=False):
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "postal_code": self.postal_code,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "opening_hours": self.opening_hours,
            "contact_phone": self.contact_phone,
            "amenities": [item.strip() for item in (self.amenities or "").split(",") if item.strip()],
            "is_active": self.is_active,
        }
        if include_chargers:
            result["chargers"] = [charger.to_dict() for charger in self.chargers]
        return result


class Charger(db.Model):
    __tablename__ = "chargers"

    id = db.Column(db.Integer, primary_key=True)
    station_id = db.Column(db.Integer, db.ForeignKey("stations.id"), nullable=False)
    charger_code = db.Column(db.String(50), nullable=False)
    connector_type = db.Column(db.String(50), nullable=False)
    charging_power_kw = db.Column(db.Float, nullable=False)
    price_per_kwh = db.Column(db.Float, nullable=False)
    operational_status = db.Column(db.String(30), nullable=False, default="Available")
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    station = db.relationship("Station", back_populates="chargers")
    bookings = db.relationship("Booking", back_populates="charger", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "station_id": self.station_id,
            "charger_code": self.charger_code,
            "connector_type": self.connector_type,
            "charging_power_kw": self.charging_power_kw,
            "price_per_kwh": self.price_per_kwh,
            "operational_status": self.operational_status,
            "is_active": self.is_active,
        }


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    booking_reference = db.Column(
        db.String(40), unique=True, nullable=False, default=lambda: f"EV-{uuid4().hex[:10].upper()}"
    )
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    station_id = db.Column(db.Integer, db.ForeignKey("stations.id"), nullable=False)
    charger_id = db.Column(db.Integer, db.ForeignKey("chargers.id"), nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="Confirmed")
    price_per_kwh_snapshot = db.Column(db.Float, nullable=False, default=0)
    estimated_energy_kwh = db.Column(db.Float, nullable=False, default=0)
    estimated_cost = db.Column(db.Float, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="bookings")
    station = db.relationship("Station", back_populates="bookings")
    charger = db.relationship("Charger", back_populates="bookings")

    @staticmethod
    def generate_reference():
        return f"EV-{uuid4().hex[:10].upper()}"

    def to_dict(self):
        return {
            "id": self.id,
            "booking_reference": self.booking_reference,
            "user_id": self.user_id,
            "station_id": self.station_id,
            "charger_id": self.charger_id,
            "start_time": ensure_utc(self.start_time).isoformat() if self.start_time else None,
            "end_time": ensure_utc(self.end_time).isoformat() if self.end_time else None,
            "status": self.status,
            "price_per_kwh_snapshot": self.price_per_kwh_snapshot,
            "estimated_energy_kwh": self.estimated_energy_kwh,
            "estimated_cost": self.estimated_cost,
            "station": self.station.to_dict() if self.station else None,
            "charger": self.charger.to_dict() if self.charger else None,
        }
