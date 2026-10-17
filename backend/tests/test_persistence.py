import os
import tempfile
from app import create_app
from app.extensions import db
from app.models import Station, Charger, User

def test_database_persistence_across_app_contexts():
    # Create temporary database file
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tf:
        db_path = tf.name

    try:
        os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

        # 1. First app instance: Create tables and insert records
        app1 = create_app("config.Config")
        with app1.app_context():
            user = User(full_name="Persistent User", email="persist@test.com", role="user")
            user.set_password("Secret123!")
            st = Station(
                name="Persistent Station Hub",
                address="123 Highway Road",
                city="Bengaluru",
                state="Karnataka",
                postal_code="560001",
                is_active=True
            )
            db.session.add_all([user, st])
            db.session.commit()
            user_id = user.id
            st_id = st.id

        # 2. Second app instance: Simulate server restart
        app2 = create_app("config.Config")
        with app2.app_context():
            reloaded_user = db.session.get(User, user_id)
            reloaded_station = db.session.get(Station, st_id)

            assert reloaded_user is not None
            assert reloaded_user.email == "persist@test.com"
            assert reloaded_user.check_password("Secret123!") is True
            assert reloaded_station is not None
            assert reloaded_station.name == "Persistent Station Hub"
            assert reloaded_station.city == "Bengaluru"

    finally:
        if os.path.exists(db_path):
            os.remove(db_path)
