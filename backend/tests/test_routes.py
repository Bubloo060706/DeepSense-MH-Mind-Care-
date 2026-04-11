import json
import pytest  # type: ignore
from app import create_app
from app.db.database import get_db


@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLITE_PATH": ":memory:",
    })
    yield app


@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture(autouse=True)
def clean_db(client):
    with client.application.app_context():
        db = get_db()
        db.execute("DELETE FROM users")
        db.commit()
        
        
@pytest.fixture
def sample_user(client):
    """Insert a user directly into DB and return their id."""
    with client.application.app_context():
        from app.models.user import User
        user = User.create(name="Test Patient", email="test@mindcare.ai", role="patient")
        return user.id


# ── Health ────────────────────────────────────────────────────

def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.get_json()["status"] == "ok"


# ── Scores ────────────────────────────────────────────────────

def test_post_score_success(client, sample_user):
    res = client.post("/api/scores", json={
        "user_id": sample_user,
        "score": 0.75,
        "features": {"step_count": 1200, "sleep_hours": 5.2}
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["risk_level"] == "high"
    assert data["score"] == 0.75


def test_post_score_missing_fields(client):
    res = client.post("/api/scores", json={"score": 0.5})
    assert res.status_code == 422


def test_post_score_invalid_range(client, sample_user):
    res = client.post("/api/scores", json={"user_id": sample_user, "score": 1.5})
    assert res.status_code == 422


def test_get_scores(client, sample_user):
    # Post two scores first
    for s in [0.2, 0.6]:
        client.post("/api/scores", json={"user_id": sample_user, "score": s})
    res = client.get(f"/api/scores/{sample_user}")
    assert res.status_code == 200
    assert len(res.get_json()) == 2


def test_get_latest_score(client, sample_user):
    client.post("/api/scores", json={"user_id": sample_user, "score": 0.4})
    client.post("/api/scores", json={"user_id": sample_user, "score": 0.8})
    res = client.get(f"/api/scores/{sample_user}/latest")
    assert res.status_code == 200
    assert res.get_json()["score"] == 0.8


# ── PHQ ───────────────────────────────────────────────────────

def test_post_phq_success(client, sample_user):
    res = client.post("/api/phq", json={
        "user_id": sample_user,
        "responses": [2, 1, 3, 2, 1, 0, 2, 1, 1]
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["score"] == 13
    assert data["severity"] == "moderate"


def test_post_phq_wrong_count(client, sample_user):
    res = client.post("/api/phq", json={
        "user_id": sample_user,
        "responses": [1, 2, 3]
    })
    assert res.status_code == 422


def test_post_phq_invalid_values(client, sample_user):
    res = client.post("/api/phq", json={
        "user_id": sample_user,
        "responses": [0, 1, 2, 3, 4, 0, 1, 2, 3]   # 4 is invalid
    })
    assert res.status_code == 422


# ── Alerts ────────────────────────────────────────────────────

def test_get_alerts_empty(client, sample_user):
    res = client.get(f"/api/alerts/{sample_user}")
    assert res.status_code == 200
    assert res.get_json() == []


def test_alerts_generated_on_high_score(client, sample_user):
    client.post("/api/scores", json={"user_id": sample_user, "score": 0.9})
    res = client.get(f"/api/alerts/{sample_user}")
    alerts = res.get_json()
    assert len(alerts) >= 1
    assert alerts[0]["severity"] == "critical"