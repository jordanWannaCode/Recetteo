from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, Utilisateur
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('nom_utilisateur', 'email', 'mot_de_passe')):
        return jsonify({"message": "Tous les champs sont requis"}), 400
    
    if Utilisateur.query.filter_by(nom_utilisateur=data['nom_utilisateur']).first():
        return jsonify({"message": "Nom d'utilisateur déjà utilisé"}), 409
    
    if Utilisateur.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email déjà utilisé"}), 409
    
    try:
        user = Utilisateur(
            nom_utilisateur=data['nom_utilisateur'],
            email=data['email']
        )
        user.set_password(data['mot_de_passe'])
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Utilisateur créé",
            "access_token": access_token,
            "user": user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur inscription: {str(e)}")
        return jsonify({"message": "Erreur serveur"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('email', 'mot_de_passe')):
        return jsonify({"message": "Email et mot de passe requis"}), 400
    
    user = Utilisateur.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['mot_de_passe']):
        return jsonify({"message": "Identifiants invalides"}), 401
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = Utilisateur.query.get(int(user_id))
    
    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404
    
    return jsonify(user.to_dict()), 200