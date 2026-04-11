from ..db.database import get_db


class ScoreAggregator:
    """Aggregate risk scores over time windows for a given user."""

    def __init__(self, user_id):
        self.user_id = user_id

    def daily_averages(self, days=30):
        """Return average daily risk score for the past N days."""
        db = get_db()
        rows = db.execute(
            """
            SELECT
                date(recorded_at) AS day,
                ROUND(AVG(score), 4)  AS avg_score,
                COUNT(*)              AS reading_count
            FROM risk_scores
            WHERE user_id = ?
              AND recorded_at >= datetime('now', ? || ' days')
            GROUP BY date(recorded_at)
            ORDER BY day ASC
            """,
            (self.user_id, f"-{days}"),
        ).fetchall()
        return [dict(r) for r in rows]

    def risk_level_distribution(self, days=30):
        """Count readings per risk level in the past N days."""
        db = get_db()
        rows = db.execute(
            """
            SELECT risk_level, COUNT(*) AS count
            FROM risk_scores
            WHERE user_id = ?
              AND recorded_at >= datetime('now', ? || ' days')
            GROUP BY risk_level
            """,
            (self.user_id, f"-{days}"),
        ).fetchall()
        return {r["risk_level"]: r["count"] for r in rows}

    def latest_n_scores(self, n=10):
        """Return the last N raw scores."""
        db = get_db()
        rows = db.execute(
            """
            SELECT score, risk_level, recorded_at
            FROM risk_scores
            WHERE user_id = ?
            ORDER BY recorded_at DESC
            LIMIT ?
            """,
            (self.user_id, n),
        ).fetchall()
        return [dict(r) for r in rows]

    def overall_average(self, days=30):
        """Return single float average score over the window."""
        db = get_db()
        row = db.execute(
            """
            SELECT ROUND(AVG(score), 4) AS avg_score
            FROM risk_scores
            WHERE user_id = ?
              AND recorded_at >= datetime('now', ? || ' days')
            """,
            (self.user_id, f"-{days}"),
        ).fetchone()
        return row["avg_score"] if row and row["avg_score"] is not None else 0.0