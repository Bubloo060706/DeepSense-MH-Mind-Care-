from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.risk_score import RiskScore
from app.models.user import User
from app.services.alert_generator import maybe_generate_alert

scores_bp = Blueprint("scores", __name__)

@scores_bp.route("/", methods=["POST"])
@jwt_required()
def submit_score():
    """
    POST /api/scores/
    Body: { user_id, score, window_start, window_end }
    Called by the Android app after on-device inference.
    """
    data = request.get_json()

    required = ["user_id", "score", "window_start", "window_end"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    if not (0.0 <= data["score"] <= 1.0):
        return jsonify({"error": "Score must be between 0.0 and 1.0"}), 400

    risk_score = RiskScore(
        user_id      = data["user_id"],
        score        = data["score"],
        window_start = datetime.fromisoformat(data["window_start"]),
        window_end   = datetime.fromisoformat(data["window_end"])
    )

    db.session.add(risk_score)
    db.session.commit()

    # Trigger alert if score exceeds threshold
    maybe_generate_alert(risk_score)

    return jsonify(risk_score.to_dict()), 201


@scores_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_scores(user_id):
    """
    GET /api/scores/<user_id>?limit=30
    Returns paginated risk scores for a user.
    """
    limit  = request.args.get("limit", 30, type=int)
    scores = (
        RiskScore.query
        .filter_by(user_id=user_id)
        .order_by(RiskScore.window_end.desc())
        .limit(limit)
        .all()
    )
    return jsonify([s.to_dict() for s in scores]), 200


@scores_bp.route("/latest/<user_id>", methods=["GET"])
@jwt_required()
def get_latest_score(user_id):
    """
    GET /api/scores/latest/<user_id>
    Returns the most recent risk score for a user.
    """
    score = (
        RiskScore.query
        .filter_by(user_id=user_id)
        .order_by(RiskScore.synced_at.desc())
        .first()
    )
    if not score:
        return jsonify({"error": "No scores found"}), 404

    return jsonify(score.to_dict()), 200