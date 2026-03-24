import uuid
from datetime import datetime
from app import db
from app.models.alert import Alert
from app.models.risk_score import RiskScore
from app.services.score_aggregator import get_rolling_average, detect_worsening_trend
from app.config import Config

def maybe_generate_alert(risk_score: RiskScore) -> Alert | None:
    """
    Evaluates a newly submitted risk score and generates an alert
    if the score or trend crosses the configured threshold.
    Called automatically after every score submission.
    """
    user_id      = risk_score.user_id
    rolling_avg  = get_rolling_average(user_id, days=3)
    is_worsening = detect_worsening_trend(user_id, window=5)

    alert = None

    # High single score
    if risk_score.score >= Config.RISK_ALERT_THRESHOLD:
        alert = _create_alert(
            user_id       = user_id,
            risk_score_id = risk_score.id,
            message       = (
                f"High depression risk detected: score {risk_score.score:.2f}. "
                f"Immediate review recommended."
            ),
            severity = "high"
        )

    # Sustained elevated rolling average
    elif rolling_avg and rolling_avg >= 0.55:
        alert = _create_alert(
            user_id       = user_id,
            risk_score_id = risk_score.id,
            message       = (
                f"Sustained elevated risk over the past 3 days "
                f"(avg: {rolling_avg:.2f}). Consider checking in."
            ),
            severity = "medium"
        )

    # Consistent worsening trend
    elif is_worsening:
        alert = _create_alert(
            user_id       = user_id,
            risk_score_id = risk_score.id,
            message       = (
                "Risk score has been consistently increasing over the past 5 windows. "
                "Monitor closely."
            ),
            severity = "medium"
        )

    return alert


def _create_alert(
    user_id: str,
    risk_score_id: str,
    message: str,
    severity: str
) -> Alert:
    alert = Alert(
        id            = str(uuid.uuid4()),
        user_id       = user_id,
        risk_score_id = risk_score_id,
        message       = message,
        severity      = severity,
        is_read       = False,
        created_at    = datetime.utcnow()
    )
    db.session.add(alert)
    db.session.commit()
    return alert