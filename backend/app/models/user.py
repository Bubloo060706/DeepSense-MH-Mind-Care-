import uuid
from datetime import datetime
from app import db

class User(db.Model):
    __tablename__ = "users"

    id         = db.Column(db.String,   primary_key=True, default=lambda: str(uuid.uuid4()))
    name       = db.Column(db.String,   nullable=False)
    email      = db.Column(db.String,   unique=True, nullable=False)
    role       = db.Column(db.String,   nullable=False, default="patient")  # patient | clinician
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    risk_scores = db.relationship("RiskScore", backref="user", lazy=True)
    phq_entries = db.relationship("PhqEntry",  backref="user", lazy=True)
    alerts      = db.relationship("Alert",     backref="user", lazy=True)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "role":       self.role,
            "created_at": self.created_at.isoformat()
        }

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"