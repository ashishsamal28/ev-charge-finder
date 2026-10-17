import concurrent.futures
from datetime import datetime, timezone, timedelta

def test_concurrent_overlapping_bookings(app, seed_data, user_token, user2_token):
    """
    Spawns concurrent threads to attempt booking the exact same slot at the exact same moment.
    Only 1 request must succeed (HTTP 201), and the other must be rejected with HTTP 409 Conflict.
    """
    start = (datetime.now(timezone.utc) + timedelta(days=10)).replace(hour=15, minute=0, second=0, microsecond=0)
    end = start + timedelta(minutes=60)

    results = []

    def attempt_booking(token):
        # Create a fresh test client for each thread to simulate real distinct client connections
        client = app.test_client()
        res = client.post(
            "/api/bookings",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "station_id": seed_data["station1_id"],
                "charger_id": seed_data["c1_id"],
                "start_time": start.isoformat(),
                "end_time": end.isoformat()
            }
        )
        return res.status_code, res.get_json()

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(attempt_booking, user_token)
        f2 = executor.submit(attempt_booking, user2_token)
        results.append(f1.result())
        results.append(f2.result())

    status_codes = [r[0] for r in results]
    assert 201 in status_codes, f"Expected exactly one 201, got: {status_codes}"
    assert 409 in status_codes, f"Expected exactly one 409 Conflict, got: {status_codes}"

    success_count = sum(1 for s in status_codes if s == 201)
    conflict_count = sum(1 for s in status_codes if s == 409)

    assert success_count == 1
    assert conflict_count == 1
