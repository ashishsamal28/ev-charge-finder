def test_search_by_city(client, seed_data):
    res = client.get("/api/stations?city=Delhi")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) == 1
    assert data[0]["city"] == "Delhi"

def test_search_by_station_name(client, seed_data):
    res = client.get("/api/stations?q=Marina")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) == 1
    assert "Mumbai Marina" in data[0]["name"]

def test_filter_by_connector(client, seed_data):
    # Only Type 2
    res = client.get("/api/stations?connector=Type 2")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) == 1
    assert "Type 2" in data[0]["connector_types"]

def test_filter_by_power(client, seed_data):
    # High power >= 100 kW
    res = client.get("/api/stations?min_power=100")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) == 1
    assert data[0]["max_power_kw"] >= 100

def test_filter_by_price(client, seed_data):
    # Max price <= 15
    res = client.get("/api/stations?max_price=15")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) >= 1
    for st in data:
        assert st["min_price_per_kwh"] <= 15

def test_filter_by_availability(client, seed_data):
    res = client.get("/api/stations?available_only=true")
    assert res.status_code == 200
    data = res.get_json()["data"]
    for st in data:
        assert st["operational_chargers_count"] > 0

def test_combine_multiple_filters(client, seed_data):
    res = client.get("/api/stations?city=Delhi&connector=CCS2&min_power=50")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) == 1
    assert data[0]["name"] == "Delhi Metro FastCharge"

def test_pagination(client, seed_data):
    res = client.get("/api/stations?limit=1&page=1")
    assert res.status_code == 200
    meta = res.get_json()["meta"]
    data = res.get_json()["data"]
    assert len(data) == 1
    assert meta["limit"] == 1
    assert meta["total"] == 2
    assert meta["total_pages"] == 2

def test_retrieve_station_details(client, seed_data):
    st_id = seed_data["station1_id"]
    res = client.get(f"/api/stations/{st_id}")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["name"] == "Delhi Metro FastCharge"
    assert "chargers" in data
    assert len(data["chargers"]) == 2

def test_retrieve_station_chargers(client, seed_data):
    st_id = seed_data["station1_id"]
    res = client.get(f"/api/stations/{st_id}/chargers")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) == 2
    codes = [c["charger_code"] for c in data]
    assert "DLI-DC-01" in codes

def test_station_not_found(client, seed_data):
    res = client.get("/api/stations/99999")
    assert res.status_code == 404
    assert res.get_json()["error"]["code"] == "STATION_NOT_FOUND"

def test_station_availability_endpoint(client, seed_data):
    st_id = seed_data["station1_id"]
    res = client.get(f"/api/stations/{st_id}/availability?date=2026-10-20")
    assert res.status_code == 200
    data = res.get_json()["data"]
    # Charger slots returned
    assert str(seed_data["c1_id"]) in data
    assert len(data[str(seed_data["c1_id"])]["slots"]) > 0
