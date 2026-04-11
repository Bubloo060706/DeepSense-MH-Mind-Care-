from flask import Blueprint, request, jsonify
from ..models.phq_entry import PHQEntry
from ..models.user import User

phq_bp = Blueprint("phq", __name__)


@phq_bp.route("/phq", methods=["POST"])
def submit_phq():
    """Submit a PHQ-9 assessment result."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    user_id = data.get("user_id")
    responses = data.get("responses", [])

    if not user_id or not responses:
        return jsonify({"error": "user_id and responses are required"}), 422

    if len(responses) != 9:
        return jsonify({"error": "PHQ-9 requires exactly 9 responses"}), 422

    if any(r not in [0, 1, 2, 3] for r in responses):
        return jsonify({"error": "Each response must be 0, 1, 2, or 3"}), 422

    if User.get_by_id(user_id) is None:
        return jsonify({"error": "User not found"}), 404

    total_score = sum(responses)
    entry = PHQEntry.create(user_id, total_score, responses)

    return jsonify(entry.to_dict()), 201


@phq_bp.route("/phq/<user_id>", methods=["GET"])
def get_phq(user_id):
    """Return PHQ-9 history for a user."""
    if User.get_by_id(user_id) is None:
        return jsonify({"error": "User not found"}), 404

    limit = request.args.get("limit", 20, type=int)
    entries = PHQEntry.get_by_user(user_id, limit=limit)
    return jsonify([e.to_dict() for e in entries]), 200