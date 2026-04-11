import uuid
from ..db.database import get_db
from .score_aggregator import ScoreAggregator


class AlertGenerator:
    """Generate alerts based on risk score events."""

    HIGH_RISK_THRESHOLD = 0.7
    SUSTAINED_WINDOW = 5       # number of consecutive readings to check
    SUSTAINED_THRESHOLD = 0.6  # average to flag as sustained risk

    @staticmethod
    def evaluate_and_create(user_id, risk_score_record):
        """Called after every new risk score is saved."""
        score = risk_score_record.score

        # 1. Immediate high-risk alert
        if score >= AlertGenerator.HIGH_RISK_THRESHOLD:
            AlertGenerator._create_alert(
                user_id=user_id,
                alert_type="high_risk",
                message=(
                    f"High depression risk detected (score: {score:.2f}). "
                    "Immediate clinician review recommended."
                ),
                severity="critical",
            )
            return  # don't double-alert in same evaluation

        # 2. Sustained moderate-to-high risk
        aggregator = ScoreAggregator(user_id)
        recent = aggregator.latest_n_scores(n=AlertGenerator.SUSTAINED_WINDOW)
        if len(recent) == AlertGenerator.SUSTAINED_WINDOW:
            avg = sum(r["score"] for r in recent) / len(recent)
            if avg >= AlertGenerator.SUSTAINED_THRESHOLD:
                AlertGenerator._create_alert(
                    user_id=user_id,
                    alert_type="sustained_risk",
                    message=(
                        f"Sustained elevated risk over last "
                        f"{AlertGenerator.SUSTAINED_WINDOW} readings "
                        f"(avg: {avg:.2f}). Consider scheduling a check-in."
                    ),
                    severity="warning",
                )

    @staticmethod
    def create_phq_spike_alert(user_id, phq_score):
        """Call this from PHQ route if score crosses clinical threshold."""
        if phq_score >= 15:
            AlertGenerator._create_alert(
                user_id=user_id,
                alert_type="phq_spike",
                message=(
                    f"PHQ-9 score of {phq_score} indicates "
                    f"{'moderately severe' if phq_score < 20 else 'severe'} depression. "
                    "Urgent clinical review advised."
                ),
                severity="critical" if phq_score >= 20 else "warning",
            )

    @staticmethod
    def _create_alert(user_id, alert_type, message, severity="warning"):
        db = get_db()
        alert_id = str(uuid.uuid4())
        db.execute(
            """INSERT INTO alerts (id, user_id, alert_type, message, severity)
               VALUES (?, ?, ?, ?, ?)""",
            (alert_id, user_id, alert_type, message, severity),
        )
        db.commit()