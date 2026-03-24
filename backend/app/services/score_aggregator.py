from datetime import datetime, timedelta
from sqlalchemy import func
from app import db
from app.models.risk_score import RiskScore

def get_daily_average(user_id: str, date: datetime) -> float | None:
    """
    Returns the average risk score for a user on a given day.
    """
    start = date.replace(hour=0,  minute=0,  second=0,  microsecond=0)
    end   = date.replace(hour=23, minute=59, second=59, microsecond=999999)

    result = (
        db.session.query(func.avg(RiskScore.score))
        .filter(
            RiskScore.user_id      == user_id,
            RiskScore.window_end  >= start,
            RiskScore.window_end  <= end
        )
        .scalar()
    )
    return round(float(result), 4) if result else None


def get_rolling_average(user_id: str, days: int = 7) -> float | None:
    """
    Returns the rolling average risk score over the last N days.
    Used to smooth out daily variance before alert generation.
    """
    since = datetime.utcnow() - timedelta(days=days)

    result = (
        db.session.query(func.avg(RiskScore.score))
        .filter(
            RiskScore.user_id     == user_id,
            RiskScore.window_end >= since
        )
        .scalar()
    )
    return round(float(result), 4) if result else None


def get_score_series(user_id: str, days: int = 30) -> list[dict]:
    """
    Returns a time-ordered list of risk scores for the last N days.
    Used by the trend analyzer and dashboard charts.
    """
    since = datetime.utcnow() - timedelta(days=days)

    scores = (
        RiskScore.query
        .filter(
            RiskScore.user_id     == user_id,
            RiskScore.window_end >= since
        )
        .order_by(RiskScore.window_end.asc())
        .all()
    )
    return [s.to_dict() for s in scores]


def detect_worsening_trend(user_id: str, window: int = 5) -> bool:
    """
    Returns True if the last N scores show a consistent upward trend.
    Simple linear slope check — slope > 0.05 per window = worsening.
    """
    since  = datetime.utcnow() - timedelta(days=window)
    scores = (
        RiskScore.query
        .filter(
            RiskScore.user_id     == user_id,
            RiskScore.window_end >= since
        )
        .order_by(RiskScore.window_end.asc())
        .all()
    )

    if len(scores) < 3:
        return False

    values = [s.score for s in scores]
    n      = len(values)
    slope  = (values[-1] - values[0]) / n

    return slope > 0.05