import os
import uuid
from urllib.parse import urlparse
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.models import db, Utilisateur, Recette, Inventaire, ShoppingList
import logging
import time
from backend.validation import (
    ValidationError,
    validate_login_payload,
    validate_register_payload,
    validate_profile_payload,
    validate_password_change_payload
)
from backend.uploads import validate_image_upload, upload_to_cloudinary

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)
AUTH_ATTEMPTS = {}
AUTH_LIMIT = 5
AUTH_WINDOW_SECONDS = 900


def _save_image(file_storage, subdir):
    ext = validate_image_upload(file_storage, current_app.config.get('ALLOWED_IMAGE_EXTENSIONS', set()))

    cloud_url = upload_to_cloudinary(file_storage, f"recetteo/{subdir}")
    if cloud_url:
        return cloud_url

    unique_name = f"{uuid.uuid4().hex}.{ext}"
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], subdir)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_name)
    file_storage.save(file_path)

    public_path = f"{subdir}/{unique_name}"
    public_url = f"{request.host_url.rstrip('/')}/uploads/{public_path}"
    return public_url


def _delete_uploaded_file(file_url):
    if not file_url:
        return
    parsed = urlparse(file_url)
    path = parsed.path or ''
    if not path.startswith('/uploads/'):
        return
    relative = path.replace('/uploads/', '', 1)
    full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], relative)
    if os.path.isfile(full_path):
        try:
            os.remove(full_path)
        except OSError:
            logger.warning("Impossible de supprimer le fichier upload %s", full_path)


def _client_ip():
    forwarded_for = request.headers.get('X-Forwarded-For', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.remote_addr or 'unknown'


def _is_rate_limited(key):
    now = time.time()
    attempts = [attempt for attempt in AUTH_ATTEMPTS.get(key, []) if now - attempt < AUTH_WINDOW_SECONDS]
    AUTH_ATTEMPTS[key] = attempts
    return len(attempts) >= AUTH_LIMIT


def _record_attempt(key):
    now = time.time()
    attempts = [attempt for attempt in AUTH_ATTEMPTS.get(key, []) if now - attempt < AUTH_WINDOW_SECONDS]
    attempts.append(now)
    AUTH_ATTEMPTS[key] = attempts


def _clear_attempts(key):
    AUTH_ATTEMPTS.pop(key, None)

@auth_bp.route('/register', methods=['POST'])
def register():
    rate_limit_key = f"register:{_client_ip()}"
    if _is_rate_limited(rate_limit_key):
        return jsonify({"message": "Trop de tentatives, veuillez reessayer plus tard"}), 429

    try:
        data = validate_register_payload(request.get_json(silent=True))
    except ValidationError as exc:
        _record_attempt(rate_limit_key)
        return jsonify({"message": str(exc)}), 400

    if Utilisateur.query.filter_by(nom_utilisateur=data['nom_utilisateur']).first() or Utilisateur.query.filter_by(email=data['email']).first():
        _record_attempt(rate_limit_key)
        return jsonify({"message": "Un utilisateur avec ces informations existe deja"}), 409
    
    try:
        user = Utilisateur(
            nom_utilisateur=data['nom_utilisateur'],
            email=data['email']
        )
        user.set_password(data['mot_de_passe'])
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=str(user.id))
        _clear_attempts(rate_limit_key)
        
        return jsonify({
            "message": "Utilisateur créé",
            "access_token": access_token,
            "user": user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur inscription: {str(e)}")
        _record_attempt(rate_limit_key)
        return jsonify({"message": "Erreur serveur"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    rate_limit_key = f"login:{_client_ip()}"
    if _is_rate_limited(rate_limit_key):
        return jsonify({"message": "Trop de tentatives, veuillez reessayer plus tard"}), 429

    try:
        data = validate_login_payload(request.get_json(silent=True))
    except ValidationError as exc:
        _record_attempt(rate_limit_key)
        return jsonify({"message": str(exc)}), 400
    
    user = Utilisateur.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['mot_de_passe']):
        _record_attempt(rate_limit_key)
        return jsonify({"message": "Identifiants invalides"}), 401
    
    access_token = create_access_token(identity=str(user.id))
    _clear_attempts(rate_limit_key)
    
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


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = Utilisateur.query.get(int(user_id))

    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    try:
        data = validate_profile_payload(request.get_json(silent=True), partial=True)
    except ValidationError as exc:
        return jsonify({"message": str(exc)}), 400

    if not data:
        return jsonify({"message": "Aucune donnée à mettre à jour"}), 400

    if 'nom_utilisateur' in data and data['nom_utilisateur'] != user.nom_utilisateur:
        if Utilisateur.query.filter_by(nom_utilisateur=data['nom_utilisateur']).first():
            return jsonify({"message": "Nom d'utilisateur déjà utilisé"}), 409
        user.nom_utilisateur = data['nom_utilisateur']

    if 'email' in data and data['email'] != user.email:
        if Utilisateur.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Email déjà utilisé"}), 409
        user.email = data['email']

    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        logger.error("Erreur mise a jour profil: %s", exc)
        return jsonify({"message": "Erreur lors de la mise à jour du profil"}), 500

    return jsonify(user.to_dict()), 200


@auth_bp.route('/profile/password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = Utilisateur.query.get(int(user_id))

    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    try:
        data = validate_password_change_payload(request.get_json(silent=True))
    except ValidationError as exc:
        return jsonify({"message": str(exc)}), 400

    if not user.check_password(data['currentPassword']):
        return jsonify({"message": "Mot de passe actuel incorrect"}), 400

    try:
        user.set_password(data['newPassword'])
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        logger.error("Erreur changement mot de passe: %s", exc)
        return jsonify({"message": "Erreur lors du changement de mot de passe"}), 500

    return jsonify({"message": "Mot de passe mis à jour"}), 200


@auth_bp.route('/profile/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = get_jwt_identity()
    user = Utilisateur.query.get(int(user_id))

    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    if 'avatar' not in request.files:
        return jsonify({"message": "Aucun fichier fourni"}), 400

    try:
        avatar_url = _save_image(request.files['avatar'], 'avatars')
    except ValidationError as exc:
        return jsonify({"message": str(exc)}), 400
    except Exception as exc:
        logger.error("Erreur upload avatar: %s", exc)
        return jsonify({"message": "Erreur lors de l'upload de la photo"}), 500

    if user.avatar_url and user.avatar_url != avatar_url:
        _delete_uploaded_file(user.avatar_url)

    user.avatar_url = avatar_url
    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        logger.error("Erreur sauvegarde avatar: %s", exc)
        return jsonify({"message": "Erreur lors de la sauvegarde"}), 500

    return jsonify(user.to_dict()), 200


@auth_bp.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = Utilisateur.query.get(int(user_id))

    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    if user.avatar_url:
        _delete_uploaded_file(user.avatar_url)

    try:
        recettes = Recette.query.filter_by(utilisateur_id=user.id).all()
        inventaires = Inventaire.query.filter_by(utilisateur_id=user.id).all()
        listes = ShoppingList.query.filter_by(utilisateur_id=user.id).all()

        for recette in recettes:
            if recette.image_url:
                _delete_uploaded_file(recette.image_url)
            db.session.delete(recette)

        for inventaire in inventaires:
            db.session.delete(inventaire)

        for liste in listes:
            db.session.delete(liste)

        db.session.delete(user)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        logger.error("Erreur suppression compte: %s", exc)
        return jsonify({"message": "Erreur lors de la suppression du compte"}), 500

    return jsonify({"message": "Compte supprimé"}), 200
