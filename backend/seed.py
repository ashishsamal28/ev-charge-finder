import os
import sys
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from app import create_app
from app.extensions import db
from app.models import User, Station, Charger, Booking

load_dotenv()

# Demo credentials
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@evchargefinder.com").strip().lower()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@12345")
ADMIN_NAME = os.getenv("ADMIN_NAME", "System Administrator")

USER_EMAIL = os.getenv("DEMO_USER_EMAIL", "user@evchargefinder.com").strip().lower()
USER_PASSWORD = os.getenv("DEMO_USER_PASSWORD", "User@12345")
USER_NAME = os.getenv("DEMO_USER_NAME", "Alex Mercer")

SAMPLE_STATIONS = [
    {
        "name": "SuperCharge Hub — Connaught Place",
        "description": "Premium ultra-fast charging hub located in the heart of Central Delhi. Equipped with solar canopies, high-speed DC chargers, and a comfortable driver lounge.",
        "address": "Inner Circle, Block C, Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
        "postal_code": "110001",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "opening_hours": "24/7",
        "contact_phone": "+91 11 2345 6789",
        "amenities": "EV Lounge, Restroom, Cafe, WiFi, 24/7 Security, Wheelchair Accessible",
        "chargers": [
            {"charger_code": "CP-DC-01", "connector_type": "CCS2", "charging_power_kw": 120.0, "price_per_kwh": 18.5, "operational_status": "Available"},
            {"charger_code": "CP-DC-02", "connector_type": "CCS2", "charging_power_kw": 60.0, "price_per_kwh": 16.5, "operational_status": "Available"},
            {"charger_code": "CP-AC-01", "connector_type": "Type 2", "charging_power_kw": 22.0, "price_per_kwh": 13.0, "operational_status": "Available"}
        ]
    },
    {
        "name": "VoltPoint Green Station — BKC",
        "description": "High-capacity green mobility station situated in Mumbai's prime financial district. Offers green solar-powered DC fast charging with valet assistance.",
        "address": "G Block, Bandra Kurla Complex, Bandra East",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postal_code": "400051",
        "latitude": 19.0662,
        "longitude": 72.8687,
        "opening_hours": "24/7",
        "contact_phone": "+91 22 4567 8901",
        "amenities": "Cafe, Restroom, WiFi, 24/7 Security, EV Valet, Work Desks",
        "chargers": [
            {"charger_code": "BKC-DC-01", "connector_type": "CCS2", "charging_power_kw": 150.0, "price_per_kwh": 19.5, "operational_status": "Available"},
            {"charger_code": "BKC-DC-02", "connector_type": "CHAdeMO", "charging_power_kw": 50.0, "price_per_kwh": 17.0, "operational_status": "Available"},
            {"charger_code": "BKC-AC-01", "connector_type": "Type 2", "charging_power_kw": 22.0, "price_per_kwh": 14.0, "operational_status": "Occupied"}
        ]
    },
    {
        "name": "ChargeGrid Hub — Indiranagar",
        "description": "Urban fast-charging station adjacent to 100 Feet Road in Bangalore. Fast charging while you shop and dine with high uptime and contactless plug & charge.",
        "address": "12th Main Road, HAL 2nd Stage, Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560038",
        "latitude": 12.9719,
        "longitude": 77.6412,
        "opening_hours": "06:00 - 23:00",
        "contact_phone": "+91 80 3456 7890",
        "amenities": "Cafe, Dining, WiFi, Restroom, CCTV Surveillance",
        "chargers": [
            {"charger_code": "IN-DC-01", "connector_type": "CCS2", "charging_power_kw": 60.0, "price_per_kwh": 16.0, "operational_status": "Available"},
            {"charger_code": "IN-AC-01", "connector_type": "Type 2", "charging_power_kw": 22.0, "price_per_kwh": 12.5, "operational_status": "Available"}
        ]
    },
    {
        "name": "EcoCharge Central — HITEC City",
        "description": "Tech corridor charging station in Madhapur with multi-connector DC fast charging and automated slot reservations for busy tech professionals.",
        "address": "Opposite Cyber Towers, Madhapur, HITEC City",
        "city": "Hyderabad",
        "state": "Telangana",
        "postal_code": "500081",
        "latitude": 17.4483,
        "longitude": 78.3742,
        "opening_hours": "24/7",
        "contact_phone": "+91 40 5678 1234",
        "amenities": "EV Lounge, Restroom, WiFi, 24/7 Security, Food Court",
        "chargers": [
            {"charger_code": "HC-DC-01", "connector_type": "CCS2", "charging_power_kw": 120.0, "price_per_kwh": 18.0, "operational_status": "Available"},
            {"charger_code": "HC-DC-02", "connector_type": "CCS2", "charging_power_kw": 60.0, "price_per_kwh": 15.5, "operational_status": "Maintenance"},
            {"charger_code": "HC-AC-01", "connector_type": "Type 2", "charging_power_kw": 22.0, "price_per_kwh": 12.0, "operational_status": "Available"}
        ]
    },
    {
        "name": "SunPower EV Oasis — OMR Expressway",
        "description": "Strategic highway EV plaza on Old Mahabalipuram Road with solar-assisted fast charging for commuters and coastal road trippers.",
        "address": "Kandanchavadi, Perungudi, OMR Expressway",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postal_code": "600096",
        "latitude": 12.9664,
        "longitude": 80.2458,
        "opening_hours": "24/7",
        "contact_phone": "+91 44 6789 0123",
        "amenities": "Cafe, Restroom, WiFi, Tire Inflator, 24/7 Security",
        "chargers": [
            {"charger_code": "OMR-DC-01", "connector_type": "CCS2", "charging_power_kw": 60.0, "price_per_kwh": 15.0, "operational_status": "Available"},
            {"charger_code": "OMR-AC-01", "connector_type": "Type 2", "charging_power_kw": 22.0, "price_per_kwh": 12.0, "operational_status": "Available"}
        ]
    },
    {
        "name": "Koregaon Park Pulse — North Main Road",
        "description": "Boutique electric vehicle station nestled in Koregaon Park with tree-shaded charging bays, artisanal coffee nearby, and high-speed DC charging.",
        "address": "Lane 5, North Main Road, Koregaon Park",
        "city": "Pune",
        "state": "Maharashtra",
        "postal_code": "411001",
        "latitude": 18.5362,
        "longitude": 73.8958,
        "opening_hours": "07:00 - 23:00",
        "contact_phone": "+91 20 7890 1234",
        "amenities": "Cafe, WiFi, Restroom, CCTV Surveillance",
        "chargers": [
            {"charger_code": "KP-DC-01", "connector_type": "CCS2", "charging_power_kw": 50.0, "price_per_kwh": 16.0, "operational_status": "Available"},
            {"charger_code": "KP-AC-01", "connector_type": "Type 2", "charging_power_kw": 11.0, "price_per_kwh": 11.5, "operational_status": "Available"}
        ]
    },
    {
        "name": "CyberHub Rapid Station — DLF Phase 2",
        "description": "High-traffic premier EV station right next to DLF CyberHub Gurgaon. Rapid turnaround 150kW ultra-fast chargers for corporate commuters and express recharging.",
        "address": "DLF Cyber City, Sector 24",
        "city": "Gurugram",
        "state": "Haryana",
        "postal_code": "122002",
        "latitude": 28.4986,
        "longitude": 77.0878,
        "opening_hours": "24/7",
        "contact_phone": "+91 124 8901 2345",
        "amenities": "EV Lounge, Restroom, Shopping Mall, Dining, 24/7 Security",
        "chargers": [
            {"charger_code": "CH-DC-01", "connector_type": "CCS2", "charging_power_kw": 150.0, "price_per_kwh": 20.0, "operational_status": "Available"},
            {"charger_code": "CH-DC-02", "connector_type": "CHAdeMO", "charging_power_kw": 50.0, "price_per_kwh": 16.5, "operational_status": "Available"},
            {"charger_code": "CH-AC-01", "connector_type": "Type 2", "charging_power_kw": 22.0, "price_per_kwh": 13.5, "operational_status": "Out of Service"}
        ]
    },
    {
        "name": "Phoenix Marketcity Hub — Kurla",
        "description": "Spacious shopping mall charging station with 4 dedicated bays. Charge while enjoying cinema, dining, or retail shopping.",
        "address": "LBS Marg, Kurla West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postal_code": "400070",
        "latitude": 19.0864,
        "longitude": 72.8890,
        "opening_hours": "10:00 - 23:00",
        "contact_phone": "+91 22 9012 3456",
        "amenities": "Shopping Mall, Dining, Restroom, WiFi, Parking Assistance",
        "chargers": [
            {"charger_code": "PMC-DC-01", "connector_type": "CCS2", "charging_power_kw": 60.0, "price_per_kwh": 17.5, "operational_status": "Available"},
            {"charger_code": "PMC-AC-01", "connector_type": "Type 2", "charging_power_kw": 22.0, "price_per_kwh": 13.0, "operational_status": "Available"}
        ]
    }
]

def seed_database(reset=False):
    app = create_app()
    with app.app_context():
        if reset:
            print("Resetting database tables...")
            db.drop_all()
            db.create_all()
            print("Database schema recreated successfully.")

        # 1. Seed or get Demo Admin (Idempotent)
        admin = User.query.filter_by(email=ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                full_name=ADMIN_NAME,
                email=ADMIN_EMAIL,
                phone="+91 98765 43210",
                role="admin",
                is_active=True
            )
            admin.set_password(ADMIN_PASSWORD)
            db.session.add(admin)
            print(f"Created demo admin: {ADMIN_EMAIL}")
        else:
            print(f"Demo admin already exists: {ADMIN_EMAIL}")

        # 2. Seed or get Demo User (Idempotent)
        user = User.query.filter_by(email=USER_EMAIL).first()
        if not user:
            user = User(
                full_name=USER_NAME,
                email=USER_EMAIL,
                phone="+91 91234 56789",
                role="user",
                is_active=True
            )
            user.set_password(USER_PASSWORD)
            db.session.add(user)
            print(f"Created demo user: {USER_EMAIL}")
        else:
            print(f"Demo user already exists: {USER_EMAIL}")

        db.session.commit()

        # 3. Seed Stations and Chargers (Idempotent)
        for st_data in SAMPLE_STATIONS:
            chargers_data = st_data.get("chargers", [])
            station = Station.query.filter_by(name=st_data["name"]).first()
            if not station:
                station = Station(
                    name=st_data["name"],
                    description=st_data["description"],
                    address=st_data["address"],
                    city=st_data["city"],
                    state=st_data["state"],
                    postal_code=st_data["postal_code"],
                    latitude=st_data["latitude"],
                    longitude=st_data["longitude"],
                    opening_hours=st_data["opening_hours"],
                    contact_phone=st_data["contact_phone"],
                    amenities=[item.strip() for item in st_data["amenities"].split(",")],                    is_active=True
                )
                db.session.add(station)
                db.session.flush() # assign station.id
                print(f"Seeded station: {station.name} ({station.city})")

            # Seed chargers for station
            for c_data in chargers_data:
                existing_charger = Charger.query.filter_by(
                    station_id=station.id,
                    charger_code=c_data["charger_code"]
                ).first()
                if not existing_charger:
                    charger = Charger(
                        station_id=station.id,
                        charger_code=c_data["charger_code"],
                        connector_type=c_data["connector_type"],
                        charging_power_kw=c_data["charging_power_kw"],
                        price_per_kwh=c_data["price_per_kwh"],
                        operational_status=c_data["operational_status"],
                        is_active=True
                    )
                    db.session.add(charger)
                    print(f"  └─ Seeded charger: {c_data['charger_code']} [{c_data['connector_type']} {c_data['charging_power_kw']}kW]")

        db.session.commit()

        # 4. Seed Sample Bookings for demo user (Idempotent)
        now = datetime.now(timezone.utc)
        demo_user = User.query.filter_by(email=USER_EMAIL).first()
        station_cp = Station.query.filter(Station.city == "New Delhi").first()
        
        if demo_user and station_cp:
            first_charger = Charger.query.filter_by(station_id=station_cp.id).first()
            if first_charger and Booking.query.filter_by(user_id=demo_user.id).count() == 0:
                # 1 completed historical booking
                hist_start = now - timedelta(days=2, hours=3)
                hist_end = hist_start + timedelta(minutes=45)
                b1 = Booking(
                    booking_reference=Booking.generate_reference(),
                    user_id=demo_user.id,
                    station_id=station_cp.id,
                    charger_id=first_charger.id,
                    start_time=hist_start,
                    end_time=hist_end,
                    status="completed",
                    price_per_kwh_snapshot=first_charger.price_per_kwh,
                    estimated_energy_kwh=28.5,
                    estimated_cost=round(28.5 * first_charger.price_per_kwh, 2)
                )
                db.session.add(b1)

                # 1 upcoming confirmed booking (tomorrow at 14:00 UTC)
                up_start = (now + timedelta(days=1)).replace(hour=14, minute=0, second=0, microsecond=0)
                up_end = up_start + timedelta(minutes=60)
                b2 = Booking(
                    booking_reference=Booking.generate_reference(),
                    user_id=demo_user.id,
                    station_id=station_cp.id,
                    charger_id=first_charger.id,
                    start_time=up_start,
                    end_time=up_end,
                    status="confirmed",
                    price_per_kwh_snapshot=first_charger.price_per_kwh,
                    estimated_energy_kwh=40.0,
                    estimated_cost=round(40.0 * first_charger.price_per_kwh, 2)
                )
                db.session.add(b2)
                db.session.commit()
                print("Seeded sample historical and upcoming bookings for demo user.")

        print("\nDatabase seeding completed successfully.")

if __name__ == "__main__":
    should_reset = "--reset" in sys.argv
    seed_database(reset=should_reset)
