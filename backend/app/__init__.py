from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    from .routes.scores import scores_bp
    from .routes.phq import phq_bp
    from .routes.trends import trends_bp
    from .routes.alerts import alerts_bp

    app.register_blueprint(scores_bp, url_prefix="/api/scores")
    app.register_blueprint(phq_bp,    url_prefix="/api/phq")
    app.register_blueprint(trends_bp, url_prefix="/api/trends")
    app.register_blueprint(alerts_bp, url_prefix="/api/alerts")

    with app.app_context():
        db.create_all()

    return app