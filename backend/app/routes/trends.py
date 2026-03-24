from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.trend_analyzer import (
    get_weekly_trend,
    get_phq_risk_correlation,
    get_feature_summary
)

trends_bp = Blueprint("trends", __name__)

@trends_bp.route("/<user_id>/weekly", methods=["GET"])
@jwt_required()
def weekly_trend(user_id):
    """
    GET /api/trends/<user_id>/weekly?weeks=8
    Returns weekly average risk scores over N weeks.
    """
    weeks = request.args.get("weeks", 8, type=int)
    data  = get_weekly_trend(user_id, weeks)
    return jsonify(data), 200


@trends_bp.route("/<user_id>/phq-correlation", methods=["GET"])
@jwt_required()
def phq_correlation(user_id):
    """
    GET /api/trends/<user_id>/phq-correlation
    Returns side-by-side risk score vs PHQ-9 score over time.
    """
    data = get_phq_risk_correlation(user_id)
    return jsonify(data), 200


@trends_bp.route("/<user_id>/feature-summary", methods=["GET"])
@jwt_required()
def feature_summary(user_id):
    """
    GET /api/trends/<user_id>/feature-summary
    Returns a summary of the last 7 days of behavioral features.
    """
    data = get_feature_summary(user_id)
    return jsonify(data), 200