from app import db
from sqlalchemy import text

def init_db():
    """
    Run raw SQL migrations if needed.
    Called manually or during testing setup.
    """
    with open("app/db/migrations/init_schema.sql", "r") as f:
        sql = f.read()

    with db.engine.connect() as conn:
        for statement in sql.split(";"):
            stmt = statement.strip()
            if stmt:
                conn.execute(text(stmt))
        conn.commit()

def get_db():
    """
    Returns the SQLAlchemy session.
    Use db.session directly in most cases.
    """
    return db.session

def health_check():
    """
    Simple DB connectivity check for /health endpoint.
    """
    try:
        db.session.execute(text("SELECT 1"))
        return True
    except Exception:
        return False