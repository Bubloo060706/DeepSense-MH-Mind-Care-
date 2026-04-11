from flask import Blueprint, request, jsonify
from ..models.user import User
from ..services.trend_analyzer import TrendAnalyzer

trends_bp = Blueprint("trends", __name__)


@trends_bp.route("/trends/<user_id>", methods=["GET"])
def get_trends(user_id):
    """Return longitudinal trend analysis for a user."""
    if User.get_by_id(user_id) is None:
        return jsonify({"error": "User not found"}), 404

    days = request.args.get("days", 30, type=int)
    analyzer = TrendAnalyzer(user_id)
    result = analyzer.analyze(days=days)
    return jsonify(result), 200


@trends_bp.route("/trends/<user_id>/summary", methods=["GET"])
def get_trend_summary(user_id):
    """Return a short summary card for the dashboard."""
    if User.get_by_id(user_id) is None:
        return jsonify({"error": "User not found"}), 404

    analyzer = TrendAnalyzer(user_id)
    summary = analyzer.summary()
    return jsonify(summary), 200