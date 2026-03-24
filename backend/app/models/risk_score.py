import uuid
from datetime import datetime
from app import db

class RiskScore(db.Model):
    __tablename__ = "risk_scores"

    id           = db.Column(db.String,   primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id      = db.Column(db.String,   db.ForeignKey("users.id"), nullable=False)
    score        = db.Column(db.Float,    nullable=False)
    window_start = db.Column(db.DateTime, nullable=False)
    window_end   = db.Column(db.DateTime, nullable=False)
    synced_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def severity_label(self):
        if self.score < 0.3:
            return "low"
        elif self.score < 0.65:
            return "moderate"
        else:
            return "high"

    def to_dict(self):
        return {
            "id":           self.id,
            "user_id":      self.user_id,
            "score":        round(self.score, 4),
            "severity":     self.severity_label(),
            "window_start": self.window_start.isoformat(),
            "window_end":   self.window_end.isoformat(),
            "synced_at":    self.synced_at.isoformat()
        }

    def __repr__(self):
        return f"<RiskScore user={self.user_id} score={self.score:.2f}>"