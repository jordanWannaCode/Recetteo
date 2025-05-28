from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, bcrypt
import os

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialisation des extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    CORS(app)
    
    # Importation et enregistrement des routes
    from routes.auth import auth_bp
    from routes.recettes import recettes_bp
    from routes.ingredients import ingredients_bp
    from routes.inventaires import inventaires_bp
    from routes.shopping import shopping_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(recettes_bp, url_prefix='/api/recettes')
    app.register_blueprint(ingredients_bp, url_prefix='/api/ingredients')
    app.register_blueprint(inventaires_bp, url_prefix='/api/inventaires')
    app.register_blueprint(shopping_bp, url_prefix='/api/shopping')
    
    # Création des tables si elles n'existent pas
    with app.app_context():
        db.create_all()
    
    @app.route('/')
    def index():
        return {"message": "API de gestion de recettes"}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)