import sqlite3
import os
from flask import g

DB_PATH = os.getenv("SQLITE_PATH", "mindcare.db")


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            DB_PATH,
            detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES,
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
        g.db.execute("PRAGMA foreign_keys=ON")
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(app):
    app.teardown_appcontext(close_db)
    schema_path = os.path.join(
        os.path.dirname(__file__), "migrations", "init_schema.sql"
    )
    with app.app_context():
        db = get_db()
        with open(schema_path, "r") as f:
            db.executescript(f.read())
        db.commit()