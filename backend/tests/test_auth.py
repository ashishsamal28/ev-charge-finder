from app.models import User

def test_register_successfully(client):
    res = client.post("/api/auth/register", json={
        "full_name": "Rohan Sharma",
        "email": "rohan@example.com",
        "phone": "+91 99999 88888",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "terms_accepted": True
    })
    assert res.status_code == 201
    json_data = res.get_json()
    assert "data" in json_data
    assert json_data["data"]["user"]["email"] == "rohan@example.com"
    assert json_data["data"]["user"]["role"] == "user"
    assert "access_token" in json_data["data"]

def test_reject_duplicate_email(client, seed_data):
    res = client.post("/api/auth/register", json={
        "full_name": "Duplicate User",
        "email": "user1@test.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "terms_accepted": True
    })
    assert res.status_code == 409
    assert res.get_json()["error"]["code"] == "EMAIL_EXISTS"

def test_reject_invalid_input(client):
    # Short password
    res = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "test@valid.com",
        "password": "123",
        "confirm_password": "123",
        "terms_accepted": True
    })
    assert res.status_code == 400

    # Password mismatch
    res2 = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "test@valid.com",
        "password": "Password123!",
        "confirm_password": "DifferentPassword",
        "terms_accepted": True
    })
    assert res2.status_code == 400

    # Terms not accepted
    res3 = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "test@valid.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "terms_accepted": False
    })
    assert res3.status_code == 400

def test_password_hashes_are_not_plain_text(app, seed_data):
    with app.app_context():
        user = User.query.filter_by(email="user1@test.com").first()
        assert user.password_hash != "UserPass123!"
        assert user.password_hash.startswith("pbkdf2:")

def test_login_successfully(client, seed_data):
    res = client.post("/api/auth/login", json={
        "email": "user1@test.com",
        "password": "UserPass123!"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "access_token" in data
    assert data["user"]["email"] == "user1@test.com"

def test_reject_incorrect_credentials(client, seed_data):
    res = client.post("/api/auth/login", json={
        "email": "user1@test.com",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert res.get_json()["error"]["code"] == "INVALID_CREDENTIALS"

def test_reject_inactive_user(client, app, seed_data):
    with app.app_context():
        user = User.query.filter_by(email="user1@test.com").first()
        user.is_active = False
        from app.extensions import db
        db.session.commit()

    res = client.post("/api/auth/login", json={
        "email": "user1@test.com",
        "password": "UserPass123!"
    })
    assert res.status_code == 403
    assert res.get_json()["error"]["code"] == "ACCOUNT_DEACTIVATED"

def test_reject_unauthorized_protected_requests(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401

def test_ordinary_registration_cannot_create_administrators(client, app):
    # Attacking by injecting role="admin" in payload
    res = client.post("/api/auth/register", json={
        "full_name": "Hacker Try",
        "email": "hacker@test.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "terms_accepted": True,
        "role": "admin"
    })
    assert res.status_code == 201
    user_data = res.get_json()["data"]["user"]
    assert user_data["role"] == "user"

    with app.app_context():
        db_user = User.query.filter_by(email="hacker@test.com").first()
        assert db_user.role == "user"
