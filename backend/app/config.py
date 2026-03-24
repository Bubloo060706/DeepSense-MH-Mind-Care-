import os
from datetime import timedelta

class Config:
    # General
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "sqlite:///depression_detection.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv("JWT_EXPIRY_HOURS", 24))
    )

    # App-specific
    RISK_ALERT_THRESHOLD = 0.65      # risk score above this triggers alert
    PHQ_SYNC_INTERVAL_DAYS = 7       # how often PHQ-9 is expected