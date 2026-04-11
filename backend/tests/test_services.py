import pytest
from app import create_app
from app.models.user import User
from app.models.risk_score import RiskScore
from app.models.phq_entry import PHQEntry
from app.services.score_aggregator import ScoreAggregator
from app.services.trend_analyzer import TrendAnalyzer
from app.services.alert_generator import AlertGenerator
from app.db.database import get_db, init_db

@pytest.fixture
def app():
    app = create_app()
    app.config.update({"TESTING": True, "SQLITE_PATH": ":memory:"})
    init_db(app)
    return app


        
@pytest.fixture
def ctx(app):
    with app.app_context():
        yield


@pytest.fixture(autouse=True)
def clean_db(ctx):
    db = get_db()
    db.execute("DELETE FROM users")
    db.execute("DELETE FROM risk_scores")
    db.execute("DELETE FROM phq_entries")
    db.execute("DELETE FROM alerts")
    db.commit()


@pytest.fixture
def user(clean_db):
    return User.create("Service Tester", "svc@mindcare.ai", "patient")


# ── ScoreAggregator ───────────────────────────────────────────

def test_daily_averages_empty(ctx, user):
    agg = ScoreAggregator(user.id)
    assert agg.daily_averages() == []


def test_daily_averages_populated(ctx, user):
    for s in [0.3, 0.5, 0.7]:
        RiskScore.create(user.id, s, "moderate")
    agg = ScoreAggregator(user.id)
    daily = agg.daily_averages(days=7)
    assert len(daily) == 1
    assert abs(daily[0]["avg_score"] - 0.5) < 0.01


def test_overall_average(ctx, user):
    for s in [0.2, 0.4, 0.6]:
        RiskScore.create(user.id, s, "moderate")
    agg = ScoreAggregator(user.id)
    assert abs(agg.overall_average() - 0.4) < 0.01


def test_risk_level_distribution(ctx, user):
    RiskScore.create(user.id, 0.2, "low")
    RiskScore.create(user.id, 0.5, "moderate")
    RiskScore.create(user.id, 0.8, "high")
    agg = ScoreAggregator(user.id)
    dist = agg.risk_level_distribution()
    assert dist["low"] == 1
    assert dist["moderate"] == 1
    assert dist["high"] == 1


# ── TrendAnalyzer ─────────────────────────────────────────────

def test_trend_insufficient_data(ctx, user):
    RiskScore.create(user.id, 0.5, "moderate")
    analyzer = TrendAnalyzer(user.id)
    result = analyzer.analyze(days=30)
    assert result["trend_direction"] == "insufficient_data"


def test_trend_worsening(ctx, user):
    # First half low, second half high
    for s in [0.2, 0.2, 0.8, 0.9]:
        RiskScore.create(user.id, s, "varies")
    analyzer = TrendAnalyzer(user.id)
    result = analyzer.analyze(days=30)
    assert result["trend_direction"] == "worsening"


# ── AlertGenerator ────────────────────────────────────────────

def test_high_risk_alert_created(ctx, user):
    record = RiskScore.create(user.id, 0.9, "high")
    AlertGenerator.evaluate_and_create(user.id, record)

    from app.db.database import get_db
    db = get_db()
    alerts = db.execute(
        "SELECT * FROM alerts WHERE user_id = ?", (user.id,)
    ).fetchall()
    assert len(alerts) == 1
    assert alerts[0]["alert_type"] == "high_risk"
    assert alerts[0]["severity"] == "critical"


def test_phq_spike_alert(ctx, user):
    AlertGenerator.create_phq_spike_alert(user.id, phq_score=21)

    from app.db.database import get_db
    db = get_db()
    alerts = db.execute(
        "SELECT * FROM alerts WHERE user_id = ?", (user.id,)
    ).fetchall()
    assert len(alerts) == 1
    assert alerts[0]["alert_type"] == "phq_spike"
    assert alerts[0]["severity"] == "critical"