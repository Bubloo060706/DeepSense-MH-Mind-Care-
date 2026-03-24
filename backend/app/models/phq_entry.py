import uuid
from datetime import datetime
from app import db

PHQ_SEVERITY_MAP = {
    (0,  4):  "minimal",
    (5,  9):  "mild",
    (10, 14): "moderate",
    (15, 19): "moderately severe",
    (20, 27): "severe"
}

def get_severity(score: int) -> str:
    for (low, high), label in PHQ_SEVERITY_MAP.items():
        if low <= score <= high:
            return label
    return "unknown"

class PhqEntry(db.Model):
    __tablename__ = "phq_entries"

    id           = db.Column(db.String,   primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id      = db.Column(db.String,   db.ForeignKey("users.id"), nullable=False)
    score        = db.Column(db.Integer,  nullable=False)
    severity     = db.Column(db.String,   nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, user_id, score):
        self.id       = str(uuid.uuid4())
        self.user_id  = user_id
        self.score    = score
        self.severity = get_severity(score)

    def to_dict(self):
        return {
            "id":           self.id,
            "user_id":      self.user_id,
            "score":        self.score,
            "severity":     self.severity,
            "submitted_at": self.submitted_at.isoformat()
        }

    def __repr__(self):
        return f"<PhqEntry user={self.user_id} score={self.score} ({self.severity})>"