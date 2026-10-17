def test_reject_anonymous_admin_access(client):
    res = client.get("/api/admin/stats")
    assert res.status_code == 401

def test_reject_ordinary_user_admin_access(client, user_token):
    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 403
    assert res.get_json()["error"]["code"] == "FORBIDDEN"

def test_admin_get_stats(client, admin_token):
    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "stations" in data
    assert "chargers" in data
    assert "bookings" in data

def test_admin_create_and_edit_station(client, admin_token):
    # 1. Create station
    res = client.post("/api/admin/stations", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "name": "Pune Tech Hub FastCharge",
        "description": "Station located in Hinjawadi IT Park",
        "address": "Phase 1, Hinjawadi",
        "city": "Pune",
        "state": "Maharashtra",
        "postal_code": "411057",
        "latitude": 18.5912,
        "longitude": 73.7389,
        "opening_hours": "24/7",
        "contact_phone": "+91 20 1234 5678",
        "amenities": ["WiFi", "Cafe", "24/7 Security"],
        "is_active": True
    })
    assert res.status_code == 201
    st_data = res.get_json()["data"]
    st_id = st_data["id"]
    assert st_data["name"] == "Pune Tech Hub FastCharge"

    # 2. Edit station
    res_edit = client.put(f"/api/admin/stations/{st_id}", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "name": "Pune Tech Hub SuperCharge",
        "description": "Updated description with lounge"
    })
    assert res_edit.status_code == 200
    assert res_edit.get_json()["data"]["name"] == "Pune Tech Hub SuperCharge"

    # 3. Toggle status
    res_toggle = client.patch(f"/api/admin/stations/{st_id}/status", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "is_active": False
    })
    assert res_toggle.status_code == 200
    assert res_toggle.get_json()["data"]["is_active"] is False

def test_admin_create_and_edit_charger(client, seed_data, admin_token):
    st_id = seed_data["station1_id"]
    
    # Create charger
    res = client.post("/api/admin/chargers", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "station_id": st_id,
        "charger_code": "DLI-EXP-99",
        "connector_type": "CCS2",
        "charging_power_kw": 180.0,
        "price_per_kwh": 21.0,
        "operational_status": "Available"
    })
    assert res.status_code == 201
    c_id = res.get_json()["data"]["id"]

    # Reject duplicate charger code at same station
    res_dup = client.post("/api/admin/chargers", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "station_id": st_id,
        "charger_code": "DLI-EXP-99",
        "connector_type": "CCS2",
        "charging_power_kw": 180.0,
        "price_per_kwh": 21.0
    })
    assert res_dup.status_code == 409

    # Edit charger
    res_edit = client.put(f"/api/admin/chargers/{c_id}", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "price_per_kwh": 22.5,
        "operational_status": "Maintenance"
    })
    assert res_edit.status_code == 200
    assert res_edit.get_json()["data"]["price_per_kwh"] == 22.5
    assert res_edit.get_json()["data"]["operational_status"] == "Maintenance"

def test_admin_prevent_unsafe_deletion(client, seed_data, admin_token, user_token):
    from datetime import datetime, timezone, timedelta
    # Create a booking on station1
    start = (datetime.now(timezone.utc) + timedelta(days=12)).isoformat()
    end = (datetime.now(timezone.utc) + timedelta(days=12, hours=1)).isoformat()
    client.post("/api/bookings", headers={"Authorization": f"Bearer {user_token}"}, json={
        "station_id": seed_data["station1_id"],
        "charger_id": seed_data["c1_id"],
        "start_time": start,
        "end_time": end
    })

    # Attempt to delete station1
    res = client.delete(f"/api/admin/stations/{seed_data['station1_id']}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "CANNOT_DELETE_STATION_WITH_BOOKINGS"
