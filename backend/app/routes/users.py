from flask import Blueprint, request, jsonify
from ..models.user import User

users_bp = Blueprint('users', __name__)


@users_bp.route("/users", methods=["POST"])
def create_user():
    """Create a new user"""
    data = request.get_json()
    
    if not data:
        return {"error": "No JSON data provided"}, 422
    
    name = data.get('name')
    email = data.get('email')
    role = data.get('role', 'patient')
    
    if not name or not email:
        return {"error": "name and email are required"}, 422
    
    try:
        user = User.create(name, email, role)
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at
        }, 201
    except Exception as e:
        if "UNIQUE constraint failed" in str(e):
            return {"error": f"Email {email} already exists"}, 409
        return {"error": str(e)}, 500


@users_bp.route("/users/<user_id>", methods=["GET"])
def get_user(user_id):
    """Get user by ID"""
    user = User.get_by_id(user_id)
    if not user:
        return {"error": "User not found"}, 404
    
    return user.to_dict(), 200


@users_bp.route("/users", methods=["GET"])
def get_all_users():
    """Get all users"""
    users = User.get_all()
    return [u.to_dict() for u in users], 200
