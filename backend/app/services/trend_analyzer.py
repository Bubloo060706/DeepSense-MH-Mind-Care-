from .score_aggregator import ScoreAggregator
from ..db.database import get_db


class TrendAnalyzer:
    """Derive longitudinal trend insights from aggregated scores."""

    def __init__(self, user_id):
        self.user_id = user_id
        self.aggregator = ScoreAggregator(user_id)

    def analyze(self, days=30):
        daily = self.aggregator.daily_averages(days=days)
        distribution = self.aggregator.risk_level_distribution(days=days)
        overall_avg = self.aggregator.overall_average(days=days)
        phq_history = self._phq_history()

        if len(daily) >= 2:
            trend_direction = self._compute_trend(daily)
        else:
            raw_scores = self.aggregator.latest_n_scores(n=30)
            # ensure oldest → newest order
            raw_scores = list(reversed(raw_scores))

            fallback = [
                {"avg_score": s["score"] if isinstance(s, dict) else s.score}
                for s in raw_scores
            ]
            trend_direction = self._compute_trend(fallback)

        return {
            "user_id": self.user_id,
            "days_analyzed": days,
            "overall_avg_score": overall_avg,
            "trend_direction": trend_direction,
            "daily_averages": daily,
            "risk_level_distribution": distribution,
            "phq_history": phq_history,
        }

    def summary(self):
        overall_avg = self.aggregator.overall_average(days=7)
        distribution = self.aggregator.risk_level_distribution(days=7)
        latest = self.aggregator.latest_n_scores(n=1)
        daily = self.aggregator.daily_averages(days=7)
        trend_direction = self._compute_trend(daily)

        return {
            "user_id": self.user_id,
            "week_avg_score": overall_avg,
            "trend_direction": trend_direction,
            "latest_score": latest[0] if latest else None,
            "risk_distribution_7d": distribution,
        }

    def _phq_history(self):
        db = get_db()
        rows = db.execute(
            """
            SELECT score, submitted_at
            FROM phq_entries
            WHERE user_id = ?
            ORDER BY submitted_at ASC
            LIMIT 10
            """,
            (self.user_id,),
        ).fetchall()
        return [dict(r) for r in rows]

    def _compute_trend(self, daily_averages):
        """Simple linear trend: compare first half avg vs second half avg."""
        if len(daily_averages) < 2:
            return "insufficient_data"

        scores = [d["avg_score"] for d in daily_averages]
        mid = len(scores) // 2
        first_half_list = scores[:mid]
        second_half_list = scores[mid:]

        if not first_half_list or not second_half_list:
            return "insufficient_data"

        first_half = sum(first_half_list) / len(first_half_list)
        second_half = sum(second_half_list) / len(second_half_list)

        diff = second_half - first_half
        if diff > 0.05:
            return "worsening"
        elif diff < -0.05:
            return "improving"
        else:
            return "stable"