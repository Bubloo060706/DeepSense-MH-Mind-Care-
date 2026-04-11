import uuid
import json
from ..db.database import get_db


class PHQEntry:
    def __init__(self, id, user_id, score, responses, submitted_at):
        self.id = id
        self.user_id = user_id
        self.score = score
        self.responses = json.loads(responses) if isinstance(responses, str) else (responses or [])
        self.submitted_at = submitted_at

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "score": self.score,
            "responses": self.responses,
            "severity": self.get_severity(),
            "submitted_at": self.submitted_at,
        }

    def get_severity(self):
        if self.score <= 4:
            return "minimal"
        elif self.score <= 9:
            return "mild"
        elif self.score <= 14:
            return "moderate"
        elif self.score <= 19:
            return "moderately_severe"
        else:
            return "severe"

    @staticmethod
    def create(user_id, score, responses=None):
        db = get_db()
        entry_id = str(uuid.uuid4())
        responses_json = json.dumps(responses or [])
        db.execute(
            """INSERT INTO phq_entries (id, user_id, score, responses)
               VALUES (?, ?, ?, ?)""",
            (entry_id, user_id, score, responses_json),
        )
        db.commit()
        return PHQEntry.get_by_id(entry_id)

    @staticmethod
    def get_by_id(entry_id):
        db = get_db()
        row = db.execute("SELECT * FROM phq_entries WHERE id = ?", (entry_id,)).fetchone()
        if row is None:
            return None
        return PHQEntry(**dict(row))

    @staticmethod
    def get_by_user(user_id, limit=20):
        db = get_db()
        rows = db.execute(
            "SELECT * FROM phq_entries WHERE user_id = ? ORDER BY submitted_at DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()
        return [PHQEntry(**dict(r)) for r in rows]