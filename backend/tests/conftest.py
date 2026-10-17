import pytest
from app import create_app
from app.extensions import db
from app.models import User, Station, Charger, Booking

@pytest.fixture(scope="function")
def app():
    app = create_app("config.TestConfig")
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope="function")
def client(app):
    return app.test_client()

@pytest.fixture(scope="function")
def seed_data(app):
    with app.app_context():
        # Demo admin
        admin = User(
            full_name="Admin Test",
            email="admin@test.com",
            role="admin",
            is_active=True
        )
        admin.set_password("AdminPass123!")
        db.session.add(admin)

        # Demo regular user 1
        user1 = User(
            full_name="User One",
            email="user1@test.com",
            role="user",
            is_active=True
        )
        user1.set_password("UserPass123!")
        db.session.add(user1)

        # Demo regular user 2
        user2 = User(
            full_name="User Two",
            email="user2@test.com",
            role="user",
            is_active=True
        )
        user2.set_password("UserPass123!")
        db.session.add(user2)

        # Demo Station
        station = Station(
            name="Delhi Metro FastCharge",
            description="High speed chargers near Rajiv Chowk",
            address="Connaught Place Outer Circle",
            city="Delhi",
            state="Delhi",
            postal_code="110001",
            latitude=28.6328,
            longitude=77.2197,
            opening_hours="24/7",
            amenities="WiFi, Cafe, Restroom",
            is_active=True
        )
        db.session.add(station)
        db.session.flush()

        # Station 2
        station2 = Station(
            name="Mumbai Marina ChargePoint",
            description="Scenic seaside charging station",
            address="Marine Drive",
            city="Mumbai",
            state="Maharashtra",
            postal_code="400020",
            latitude=18.9438,
            longitude=72.8234,
            opening_hours="24/7",
            amenities="EV Lounge, Restroom",
            is_active=True
        )
        db.session.add(station2)
        db.session.flush()

        # Active chargers
        c1 = Charger(
            station_id=station.id,
            charger_code="DLI-DC-01",
            connector_type="CCS2",
            charging_power_kw=120.0,
            price_per_kwh=18.0,
            operational_status="Available",
            is_active=True
        )
        c2 = Charger(
            station_id=station.id,
            charger_code="DLI-AC-01",
            connector_type="Type 2",
            charging_power_kw=22.0,
            price_per_kwh=12.0,
            operational_status="Available",
            is_active=True
        )
        c_mumbai = Charger(
            station_id=station2.id,
            charger_code="BOM-DC-01",
            connector_type="CCS2",
            charging_power_kw=60.0,
            price_per_kwh=16.0,
            operational_status="Available",
            is_active=True
        )
        db.session.add_all([c1, c2, c_mumbai])
        db.session.commit()

        return {
            "admin_id": admin.id,
            "user1_id": user1.id,
            "user2_id": user2.id,
            "station1_id": station.id,
            "station2_id": station2.id,
            "c1_id": c1.id,
            "c2_id": c2.id,
            "c_mumbai_id": c_mumbai.id
        }

@pytest.fixture
def user_token(client, seed_data):
    res = client.post("/api/auth/login", json={
        "email": "user1@test.com",
        "password": "UserPass123!"
    })
    return res.get_json()["data"]["access_token"]

@pytest.fixture
def user2_token(client, seed_data):
    res = client.post("/api/auth/login", json={
        "email": "user2@test.com",
        "password": "UserPass123!"
    })
    return res.get_json()["data"]["access_token"]

@pytest.fixture
def admin_token(client, seed_data):
    res = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "AdminPass123!"
    })
    return res.get_json()["data"]["access_token"]
