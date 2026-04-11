import uuid
from datetime import datetime
from ..db.database import get_db


class User:
    def __init__(self, id, name, email, role, created_at):
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at,
        }

    @staticmethod
    def create(name, email, role="patient", user_id=None):
        db = get_db()
        if user_id is None:
            user_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)",
            (user_id, name, email, role),
        )
        db.commit()
        return User.get_by_id(user_id)

    @staticmethod
    def get_by_id(user_id):
        db = get_db()
        row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if row is None:
            return None
        return User(**dict(row))

    @staticmethod
    def get_by_email(email):
        db = get_db()
        row = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if row is None:
            return None
        return User(**dict(row))

    @staticmethod
    def get_all():
        db = get_db()
        rows = db.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
        return [User(**dict(r)) for r in rows]