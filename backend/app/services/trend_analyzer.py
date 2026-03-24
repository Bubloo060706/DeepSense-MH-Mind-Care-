from datetime import datetime, timedelta
from app.models.risk_score import RiskScore
from app.models.phq_entry import PhqEntry
from app.services.score_aggregator import get_daily_average

def get_weekly_trend(user_id: str, weeks: int = 8) -> list[dict]:
    """
    Returns weekly average risk scores over the last N weeks.
    Each entry contains the week start date and average score.
    """
    results = []
    now     = datetime.utcnow()

    for i in range(weeks - 1, -1, -1):
        week_start = now - timedelta(weeks=i+1)
        week_end   = now - timedelta(weeks=i)

        scores = (
            RiskScore.query
            .filter(
                RiskScore.user_id     == user_id,
                RiskScore.window_end >= week_start,
                RiskScore.window_end <  week_end
            )
            .all()
        )

        avg = round(sum(s.score for s in scores) / len(scores), 4) if scores else None

        results.append({
            "week_start": week_start.strftime("%Y-%m-%d"),
            "week_end":   week_end.strftime("%Y-%m-%d"),
            "avg_score":  avg,
            "sample_count": len(scores)
        })

    return results


def get_phq_risk_correlation(user_id: str) -> list[dict]:
    """
    Returns aligned risk score and PHQ-9 entries over time.
    For each PHQ-9 entry, fetches the 7-day average risk score
    centered around the submission date.
    """
    phq_entries = (
        PhqEntry.query
        .filter_by(user_id=user_id)
        .order_by(PhqEntry.submitted_at.asc())
        .all()
    )

    results = []
    for entry in phq_entries:
        window_start = entry.submitted_at - timedelta(days=3)
        window_end   = entry.submitted_at + timedelta(days=3)

        nearby_scores = (
            RiskScore.query
            .filter(
                RiskScore.user_id     == user_id,
                RiskScore.window_end >= window_start,
                RiskScore.window_end <= window_end
            )
            .all()
        )

        avg_risk = (
            round(sum(s.score for s in nearby_scores) / len(nearby_scores), 4)
            if nearby_scores else None
        )

        results.append({
            "date":          entry.submitted_at.strftime("%Y-%m-%d"),
            "phq_score":     entry.score,
            "phq_severity":  entry.severity,
            "avg_risk_score": avg_risk
        })

    return results


def get_feature_summary(user_id: str) -> dict:
    """
    Returns a summary of behavioral feature trends for the last 7 days.
    Placeholder structure — in production, features would be stored
    per-window alongside each risk score.
    """
    scores = (
        RiskScore.query
        .filter_by(user_id=user_id)
        .order_by(RiskScore.window_end.desc())
        .limit(7)
        .all()
    )

    return {
        "user_id":        user_id,
        "period":         "last_7_days",
        "num_windows":    len(scores),
        "avg_risk_score": round(sum(s.score for s in scores) / len(scores), 4) if scores else None,
        "latest_severity": scores[0].severity_label() if scores else "unknown",
        "trend":          _compute_trend([s.score for s in reversed(scores)])
    }


def _compute_trend(scores: list[float]) -> str:
    if len(scores) < 2:
        return "insufficient_data"
    slope = (scores[-1] - scores[0]) / len(scores)
    if slope > 0.03:
        return "worsening"
    elif slope < -0.03:
        return "improving"
    else:
        return "stable"