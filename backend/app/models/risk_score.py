import uuid
import json
from datetime import datetime
from ..db.database import get_db


class RiskScore:
    def __init__(self, id, user_id, score, risk_level, features, recorded_at):
        self.id = id
        self.user_id = user_id
        self.score = score
        self.risk_level = risk_level
        self.features = json.loads(features) if isinstance(features, str) else (features or {})
        self.recorded_at = recorded_at

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "score": self.score,
            "risk_level": self.risk_level,
            "features": self.features,
            "recorded_at": self.recorded_at,
        }

    @staticmethod
    def create(user_id, score, risk_level, features=None):
        db = get_db()
        record_id = str(uuid.uuid4())
        features_json = json.dumps(features or {})
        recorded_at = datetime.utcnow().isoformat()

        db.execute(
            """INSERT INTO risk_scores (id, user_id, score, risk_level, features, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (record_id, user_id, score, risk_level, features_json, recorded_at),
        )
        db.commit()
        return RiskScore.get_by_id(record_id)

    @staticmethod
    def get_by_id(record_id):
        db = get_db()
        row = db.execute("SELECT * FROM risk_scores WHERE id = ?", (record_id,)).fetchone()
        if row is None:
            return None
        return RiskScore(**dict(row))

    @staticmethod
    def get_by_user(user_id, limit=30):
        db = get_db()
        # get_by_user
        rows = db.execute(
            "SELECT * FROM risk_scores WHERE user_id = ? ORDER BY recorded_at DESC, id DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()
        return [RiskScore(**dict(r)) for r in rows]

    @staticmethod
    def get_latest(user_id):
        db = get_db()
        # get_latest
        row = db.execute(
            "SELECT * FROM risk_scores WHERE user_id = ? ORDER BY recorded_at DESC, id DESC LIMIT 1",
            (user_id,),
        ).fetchone()
        if row is None:
            return None
        return RiskScore(**dict(row))