from flask import Blueprint, request, jsonify
from ..models.user import User
from ..db.database import get_db

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("/alerts/<user_id>", methods=["GET"])
def get_alerts(user_id):
    """Return alert feed for a user."""
    if User.get_by_id(user_id) is None:
        return jsonify({"error": "User not found"}), 404

    limit = request.args.get("limit", 20, type=int)
    unread_only = request.args.get("unread", "false").lower() == "true"

    db = get_db()
    query = "SELECT * FROM alerts WHERE user_id = ?"
    params = [user_id]

    if unread_only:
        query += " AND is_read = 0"

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    rows = db.execute(query, params).fetchall()
    alerts = [dict(r) for r in rows]
    return jsonify(alerts), 200


@alerts_bp.route("/alerts/<alert_id>/read", methods=["PATCH"])
def mark_read(alert_id):
    """Mark a single alert as read."""
    db = get_db()
    result = db.execute(
        "UPDATE alerts SET is_read = 1 WHERE id = ?", (alert_id,)
    )
    db.commit()

    if result.rowcount == 0:
        return jsonify({"error": "Alert not found"}), 404

    return jsonify({"success": True, "alert_id": alert_id}), 200


@alerts_bp.route("/alerts/<user_id>/read-all", methods=["PATCH"])
def mark_all_read(user_id):
    """Mark all alerts for a user as read."""
    if User.get_by_id(user_id) is None:
        return jsonify({"error": "User not found"}), 404

    db = get_db()
    db.execute(
        "UPDATE alerts SET is_read = 1 WHERE user_id = ? AND is_read = 0",
        (user_id,),
    )
    db.commit()
    return jsonify({"success": True}), 200