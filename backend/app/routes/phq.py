from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.phq_entry import PhqEntry

phq_bp = Blueprint("phq", __name__)

@phq_bp.route("/", methods=["POST"])
@jwt_required()
def submit_phq():
    """
    POST /api/phq/
    Body: { user_id, score }
    Weekly PHQ-9 submission from the app or clinician portal.
    """
    data = request.get_json()

    if "user_id" not in data or "score" not in data:
        return jsonify({"error": "user_id and score are required"}), 400

    if not (0 <= int(data["score"]) <= 27):
        return jsonify({"error": "PHQ-9 score must be between 0 and 27"}), 400

    entry = PhqEntry(
        user_id = data["user_id"],
        score   = int(data["score"])
    )

    db.session.add(entry)
    db.session.commit()

    return jsonify(entry.to_dict()), 201


@phq_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_phq_history(user_id):
    """
    GET /api/phq/<user_id>?limit=10
    Returns PHQ-9 history for a user.
    """
    limit   = request.args.get("limit", 10, type=int)
    entries = (
        PhqEntry.query
        .filter_by(user_id=user_id)
        .order_by(PhqEntry.submitted_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify([e.to_dict() for e in entries]), 200


@phq_bp.route("/latest/<user_id>", methods=["GET"])
@jwt_required()
def get_latest_phq(user_id):
    """
    GET /api/phq/latest/<user_id>
    Returns the most recent PHQ-9 entry.
    """
    entry = (
        PhqEntry.query
        .filter_by(user_id=user_id)
        .order_by(PhqEntry.submitted_at.desc())
        .first()
    )
    if not entry:
        return jsonify({"error": "No PHQ-9 entries found"}), 404

    return jsonify(entry.to_dict()), 200