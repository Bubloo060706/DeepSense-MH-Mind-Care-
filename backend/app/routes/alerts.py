from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.alert import Alert

alerts_bp = Blueprint("alerts", __name__)

@alerts_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_alerts(user_id):
    """
    GET /api/alerts/<user_id>?unread_only=true
    Returns alerts for a user, optionally filtered to unread only.
    """
    unread_only = request.args.get("unread_only", "false").lower() == "true"

    query = Alert.query.filter_by(user_id=user_id)
    if unread_only:
        query = query.filter_by(is_read=False)

    alerts = query.order_by(Alert.created_at.desc()).all()
    return jsonify([a.to_dict() for a in alerts]), 200


@alerts_bp.route("/<alert_id>/read", methods=["PATCH"])
@jwt_required()
def mark_read(alert_id):
    """
    PATCH /api/alerts/<alert_id>/read
    Marks a single alert as read.
    """
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    alert.is_read = True
    db.session.commit()
    return jsonify(alert.to_dict()), 200


@alerts_bp.route("/<user_id>/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_read(user_id):
    """
    PATCH /api/alerts/<user_id>/read-all
    Marks all alerts for a user as read.
    """
    Alert.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All alerts marked as read"}), 200


@alerts_bp.route("/<user_id>/count", methods=["GET"])
@jwt_required()
def unread_count(user_id):
    """
    GET /api/alerts/<user_id>/count
    Returns count of unread alerts.
    """
    count = Alert.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({"unread_count": count}), 200