import pytest
import json
from app import create_app, db
from app.models.user import User

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING":                 True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY":          "test-secret"
    })

    with app.app_context():
        db.create_all()
        # Seed a test user
        user = User(
            id    = "test-user-001",
            name  = "Test Patient",
            email = "test@example.com",
            role  = "patient"
        )
        db.session.add(user)
        db.session.commit()

    yield app

    with app.app_context():
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_header(client):
    from flask_jwt_extended import create_access_token
    with client.application.app_context():
        token = create_access_token(identity="test-user-001")
    return {"Authorization": f"Bearer {token}"}


# --- Score Routes ---

def test_submit_score(client, auth_header):
    payload = {
        "user_id":      "test-user-001",
        "score":        0.72,
        "window_start": "2024-06-01T08:00:00",
        "window_end":   "2024-06-01T20:00:00"
    }
    res = client.post(
        "/api/scores/",
        data    = json.dumps(payload),
        content_type = "application/json",
        headers = auth_header
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["score"]    == 0.72
    assert data["severity"] == "high"


def test_submit_score_invalid(client, auth_header):
    payload = {"user_id": "test-user-001", "score": 1.5}
    res = client.post(
        "/api/scores/",
        data         = json.dumps(payload),
        content_type = "application/json",
        headers      = auth_header
    )
    assert res.status_code == 400


def test_get_scores_empty(client, auth_header):
    res = client.get("/api/scores/test-user-001", headers=auth_header)
    assert res.status_code == 200
    assert res.get_json() == []


# --- PHQ Routes ---

def test_submit_phq(client, auth_header):
    payload = {"user_id": "test-user-001", "score": 14}
    res = client.post(
        "/api/phq/",
        data         = json.dumps(payload),
        content_type = "application/json",
        headers      = auth_header
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["severity"] == "moderate"


def test_submit_phq_out_of_range(client, auth_header):
    payload = {"user_id": "test-user-001", "score": 30}
    res = client.post(
        "/api/phq/",
        data         = json.dumps(payload),
        content_type = "application/json",
        headers      = auth_header
    )
    assert res.status_code == 400


# --- Alert Routes ---

def test_get_alerts_empty(client, auth_header):
    res = client.get("/api/alerts/test-user-001", headers=auth_header)
    assert res.status_code == 200
    assert res.get_json() == []


def test_unread_count_zero(client, auth_header):
    res = client.get("/api/alerts/test-user-001/count", headers=auth_header)
    assert res.status_code == 200
    assert res.get_json()["unread_count"] == 0