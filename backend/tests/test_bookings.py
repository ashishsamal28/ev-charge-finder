from datetime import datetime, timezone, timedelta
from app.models import Charger, Booking
from app.extensions import db

def test_create_valid_booking(client, seed_data, user_token):
    # Future booking
    start = (datetime.now(timezone.utc) + timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0)
    end = start + timedelta(minutes=60)

    res = client.post("/api/bookings", headers={"Authorization": f"Bearer {user_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c1_id"],
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "estimated_energy_kwh": 35.0
    })
    assert res.status_code == 201
    data = res.get_json()["data"]
    assert data["booking_reference"].startswith("BK-")
    assert data["status"] == "confirmed"
    assert data["price_per_kwh_snapshot"] == 18.0
    assert data["estimated_cost"] == round(35.0 * 18.0, 2)

def test_reject_unauthenticated_booking(client, seed_data):
    start = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    end = (datetime.now(timezone.utc) + timedelta(days=2, hours=1)).isoformat()
    res = client.post("/api/bookings", json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c1_id"],
        "start_time": start,
        "end_time": end
    })
    assert res.status_code == 401

def test_reject_past_booking(client, seed_data, user_token):
    past_start = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    past_end = (datetime.now(timezone.utc) - timedelta(days=1, hours=-1)).isoformat()
    res = client.post("/api/bookings", headers={"Authorization": f"Bearer {user_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c1_id"],
        "start_time": past_start,
        "end_time": past_end
    })
    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "PAST_BOOKING_NOT_ALLOWED"

def test_reject_invalid_interval(client, seed_data, user_token):
    start = (datetime.now(timezone.utc) + timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0)
    # End before start
    end = start - timedelta(minutes=30)
    res = client.post("/api/bookings", headers={"Authorization": f"Bearer {user_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c1_id"],
        "start_time": start.isoformat(),
        "end_time": end.isoformat()
    })
    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "INVALID_INTERVAL"

def test_reject_out_of_service_charger(client, app, seed_data, user_token):
    with app.app_context():
        c = db.session.get(Charger, seed_data["c1_id"])
        c.operational_status = "Out of Service"
        db.session.commit()

    start = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    end = (datetime.now(timezone.utc) + timedelta(days=3, minutes=45)).isoformat()
    res = client.post("/api/bookings", headers={"Authorization": f"Bearer {user_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c1_id"],
        "start_time": start,
        "end_time": end
    })
    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "CHARGER_UNAVAILABLE"

def test_reject_overlapping_booking(client, seed_data, user_token, user2_token):
    start = (datetime.now(timezone.utc) + timedelta(days=4)).replace(hour=14, minute=0, second=0, microsecond=0)
    end = start + timedelta(minutes=60) # 14:00 to 15:00

    # User 1 books
    res1 = client.post("/api/bookings", headers={"Authorization": f"Bearer {user_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c2_id"],
        "start_time": start.isoformat(),
        "end_time": end.isoformat()
    })
    assert res1.status_code == 201

    # User 2 tries to book overlapping slot (14:30 to 15:30)
    overlap_start = start + timedelta(minutes=30)
    overlap_end = end + timedelta(minutes=30)
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {user2_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c2_id"],
        "start_time": overlap_start.isoformat(),
        "end_time": overlap_end.isoformat()
    })
    assert res2.status_code == 409
    assert res2.get_json()["error"]["code"] == "BOOKING_CONFLICT"

def test_permit_non_overlapping_booking(client, seed_data, user_token, user2_token):
    start = (datetime.now(timezone.utc) + timedelta(days=5)).replace(hour=10, minute=0, second=0, microsecond=0)
    end = start + timedelta(minutes=60) # 10:00 to 11:00

    # User 1 books 10:00 - 11:00
    res1 = client.post("/api/bookings", headers={"Authorization": f"Bearer {user_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c2_id"],
        "start_time": start.isoformat(),
        "end_time": end.isoformat()
    })
    assert res1.status_code == 201

    # User 2 books adjacent slot 11:00 - 12:00
    adjacent_start = end
    adjacent_end = adjacent_start + timedelta(minutes=60)
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {user2_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c2_id"],
        "start_time": adjacent_start.isoformat(),
        "end_time": adjacent_end.isoformat()
    })
    assert res2.status_code == 201

def test_price_snapshot_preserved_after_charger_price_change(client, app, seed_data, user_token):
    start = (datetime.now(timezone.utc) + timedelta(days=6)).replace(hour=10, minute=0, second=0, microsecond=0)
    end = start + timedelta(minutes=60)

    res = client.post("/api/bookings", headers={"Authorization": f"Bearer {user_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c1_id"],
        "start_time": start.isoformat(),
        "end_time": end.isoformat()
    })
    assert res.status_code == 201
    booking_id = res.get_json()["data"]["id"]
    snapshot_price = res.get_json()["data"]["price_per_kwh_snapshot"]
    assert snapshot_price == 18.0

    # Modify charger price in database
    with app.app_context():
        charger = db.session.get(Charger, seed_data["c1_id"])
        charger.price_per_kwh = 29.5
        db.session.commit()

    # Query booking again, verify snapshot was preserved
    res_get = client.get(f"/api/bookings/{booking_id}", headers={"Authorization": f"Bearer {user_token}"})
    assert res_get.status_code == 200
    assert res_get.get_json()["data"]["price_per_kwh_snapshot"] == 18.0

def test_cancellation_workflow(client, seed_data, user_token, user2_token):
    start = (datetime.now(timezone.utc) + timedelta(days=7)).replace(hour=12, minute=0, second=0, microsecond=0)
    end = start + timedelta(minutes=60)

    res = client.post("/api/bookings", headers={"Authorization": f"Bearer {user_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c1_id"],
        "start_time": start.isoformat(),
        "end_time": end.isoformat()
    })
    booking_id = res.get_json()["data"]["id"]

    # Reject user 2 cancelling user 1's booking
    res_unauth = client.patch(f"/api/bookings/{booking_id}/cancel", headers={"Authorization": f"Bearer {user2_token}"})
    assert res_unauth.status_code == 403

    # User 1 successfully cancels
    res_cancel = client.patch(f"/api/bookings/{booking_id}/cancel", headers={"Authorization": f"Bearer {user_token}"})
    assert res_cancel.status_code == 200
    assert res_cancel.get_json()["data"]["status"] == "cancelled"
    assert res_cancel.get_json()["data"]["cancelled_at"] is not None

    # Reject duplicate cancellation
    res_dup = client.patch(f"/api/bookings/{booking_id}/cancel", headers={"Authorization": f"Bearer {user_token}"})
    assert res_dup.status_code == 400
    assert res_dup.get_json()["error"]["code"] == "ALREADY_CANCELLED"

    # Verify slot is released and can now be booked by user 2
    res_rebook = client.post("/api/bookings", headers={"Authorization": f"Bearer {user2_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c1_id"],
        "start_time": start.isoformat(),
        "end_time": end.isoformat()
    })
    assert res_rebook.status_code == 201
