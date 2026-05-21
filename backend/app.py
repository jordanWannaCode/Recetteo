import os
from urllib.parse import urlparse
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from backend.models import db, bcrypt

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='dist', static_url_path='')
    app.url_map.strict_slashes = False
    app.config.from_object(config_class)
    
    # Initialisation des extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)

    @jwt.expired_token_loader
    def _expired_token_callback(jwt_header, jwt_payload):
        app.logger.warning("JWT expired: %s", jwt_payload.get('jti'))
        return jsonify({"message": "Token expire"}), 401

    @jwt.invalid_token_loader
    def _invalid_token_callback(reason):
        app.logger.warning("JWT invalid: %s", reason)
        return jsonify({"message": "Token invalide"}), 401

    @jwt.unauthorized_loader
    def _missing_token_callback(reason):
        app.logger.warning("JWT missing: %s", reason)
        return jsonify({"message": "Token manquant"}), 401

    @jwt.revoked_token_loader
    def _revoked_token_callback(jwt_header, jwt_payload):
        app.logger.warning("JWT revoked: %s", jwt_payload.get('jti'))
        return jsonify({"message": "Token revoque"}), 401
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": app.config['CORS_ORIGINS'],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Authorization", "Content-Type"],
            }
        },
    )

    def _startup_diagnostics():
        enabled = os.environ.get('STARTUP_DIAGNOSTICS', '').lower() in ('1', 'true', 'yes')
        if not enabled:
            return

        app.logger.info("Startup diagnostics: begin")
        for key in ('SECRET_KEY', 'JWT_SECRET_KEY', 'DATABASE_URI'):
            app.logger.info("Env %s set: %s", key, 'yes' if os.environ.get(key) else 'no')

        db_uri = os.environ.get('DATABASE_URI', '')
        if db_uri:
            parsed = urlparse(db_uri)
            db_name = parsed.path.lstrip('/') if parsed.path else ''
            app.logger.info(
                "DB target: scheme=%s host=%s port=%s db=%s",
                parsed.scheme or 'n/a',
                parsed.hostname or 'n/a',
                parsed.port or 'n/a',
                db_name or 'n/a',
            )
        else:
            app.logger.info("DB target: missing")

        cors = app.config.get('CORS_ORIGINS') or []
        app.logger.info("CORS origins: %s", ','.join(cors) if cors else 'none')

        cloud_url = os.environ.get('CLOUDINARY_URL')
        if not cloud_url:
            cloud_status = 'not-set'
        elif cloud_url.startswith('cloudinary://'):
            cloud_status = 'ok'
        else:
            cloud_status = 'invalid-scheme'
        app.logger.info("Cloudinary URL: %s", cloud_status)

        db_check = os.environ.get('STARTUP_DB_CHECK', '').lower() in ('1', 'true', 'yes')
        if db_check:
            try:
                from sqlalchemy import text
                with app.app_context():
                    db.session.execute(text('SELECT 1'))
                app.logger.info("DB check: ok")
            except Exception as exc:
                app.logger.error("DB check: failed (%s)", exc)

        app.logger.info("Startup diagnostics: end")

    _startup_diagnostics()
    
    upload_root = app.config['UPLOAD_FOLDER']
    os.makedirs(os.path.join(upload_root, 'avatars'), exist_ok=True)
    os.makedirs(os.path.join(upload_root, 'recipes'), exist_ok=True)

    # Importation et enregistrement des routes
    from backend.routes.auth import auth_bp
    from backend.routes.recettes import recettes_bp
    from backend.routes.ingredients import ingredients_bp
    from backend.routes.inventaires import inventaires_bp
    from backend.routes.shopping import shopping_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(recettes_bp, url_prefix='/api/recettes')
    app.register_blueprint(ingredients_bp, url_prefix='/api/ingredients')
    app.register_blueprint(inventaires_bp, url_prefix='/api/inventaires')
    app.register_blueprint(shopping_bp, url_prefix='/api/shopping')
    
    auto_create_env = os.environ.get('AUTO_CREATE_DB')
    if auto_create_env is None:
        should_create = os.environ.get('FLASK_ENV', '').lower() == 'development'
    else:
        should_create = auto_create_env.lower() in ('1', 'true', 'yes')

    if should_create:
        # Création des tables si elles n'existent pas (dev uniquement sauf override)
        with app.app_context():
            db.create_all()
    
    def _spa_fallback(path):
        if path.startswith('api/') or path.startswith('uploads/'):
            return jsonify({"message": "Not found"}), 404

        index_path = os.path.join(app.static_folder, 'index.html')
        if not os.path.exists(index_path):
            return jsonify({"message": "Frontend non build (dist/index.html introuvable)"}), 404

        static_path = os.path.join(app.static_folder, path)
        if path and os.path.exists(static_path):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def spa(path):
        return _spa_fallback(path)

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/api/health')
    def health():
        return jsonify({"status": "ok"}), 200
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
