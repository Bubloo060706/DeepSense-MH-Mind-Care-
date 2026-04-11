from flask import Flask
from flask_cors import CORS
from .config import get_config
from .db.database import init_db
from .routes.scores import scores_bp
from .routes.phq import phq_bp
from .routes.trends import trends_bp
from .routes.alerts import alerts_bp
from .routes.users import users_bp


def create_app():
    app = Flask(__name__)
    cfg = get_config()
    app.config.from_object(cfg)

    CORS(app, origins=cfg.CORS_ORIGINS)

    init_db(app)

    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(scores_bp, url_prefix="/api")
    app.register_blueprint(phq_bp, url_prefix="/api")
    app.register_blueprint(trends_bp, url_prefix="/api")
    app.register_blueprint(alerts_bp, url_prefix="/api")

    @app.route("/health")
    def health():
        return {"status": "ok", "service": "DeepSense-MH Backend"}, 200

    return app