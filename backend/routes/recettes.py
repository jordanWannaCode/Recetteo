import os
import uuid
from urllib.parse import urlparse
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, Recette, Ingredient, RecetteIngredient
import logging
from backend.validation import ValidationError, validate_recipe_payload
from backend.uploads import validate_image_upload, upload_to_cloudinary

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

recettes_bp = Blueprint('recettes', __name__)


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

@recettes_bp.route('/', methods=['GET'])
@jwt_required()
def get_recettes():
    user_id = int(get_jwt_identity())
    recettes = Recette.query.filter_by(utilisateur_id=user_id).all()
    return jsonify({
        "recettes": [recette.to_dict() for recette in recettes]
    }), 200

@recettes_bp.route('/publiques', methods=['GET'])
def get_recettes_publiques():
    recettes_publiques = Recette.query.filter_by(est_publique=True).all()
    return jsonify({
        "recettes": [recette.to_dict() for recette in recettes_publiques]
    }), 200

@recettes_bp.route('/<int:recette_id>', methods=['GET'])
@jwt_required()
def get_recette(recette_id):
    user_id = int(get_jwt_identity())
    recette = Recette.query.get(recette_id)

    if not recette:
        return jsonify({"message": "Recette non trouvée"}), 404

    if not recette.est_publique and recette.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'avez pas accès à cette recette"}), 403

    return jsonify(recette.to_dict(with_ingredients=True)), 200

@recettes_bp.route('/', methods=['POST'])
@jwt_required()
def create_recette():
    user_id = int(get_jwt_identity())
    try:
        data = validate_recipe_payload(request.get_json(silent=True))
    except ValidationError as exc:
        return jsonify({"message": str(exc)}), 400

    try:
        nouvelle_recette = Recette(
            nom=data['nom'],
            description=data['description'],
            temps_preparation=data['temps_preparation'],
            temps_cuisson=data['temps_cuisson'],
            est_publique=data.get('est_publique', False),
            utilisateur_id=user_id
        )
        db.session.add(nouvelle_recette)
        db.session.commit()

        if 'ingredients' in data and isinstance(data['ingredients'], list):
            for ingredient_data in data['ingredients']:
                ingredient = Ingredient.query.get(ingredient_data['id'])
                if ingredient and not nouvelle_recette.ajouter_ingredient(ingredient, ingredient_data['quantite']):
                    raise ValueError("Impossible d'ajouter un ingrédient à la recette")

        db.session.commit()

        return jsonify({
            "message": "Recette créée avec succès",
            "recette": nouvelle_recette.to_dict(with_ingredients=True)
        }), 201

    except ValueError as exc:
        db.session.rollback()
        logger.error(f"Erreur lors de la création de la recette: {exc}")
        return jsonify({"message": str(exc)}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la création de la recette: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la création de la recette"}), 500

@recettes_bp.route('/<int:recette_id>', methods=['PUT'])
@jwt_required()
def update_recette(recette_id):
    user_id = int(get_jwt_identity())
    recette = Recette.query.get(recette_id)

    if not recette:
        return jsonify({"message": "Recette non trouvée"}), 404

    if recette.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à modifier cette recette"}), 403

    try:
        data = validate_recipe_payload(request.get_json(silent=True), partial=True)
    except ValidationError as exc:
        return jsonify({"message": str(exc)}), 400

    try:
        if 'nom' in data:
            recette.nom = data['nom']
        if 'description' in data:
            recette.description = data['description']
        if 'temps_preparation' in data:
            recette.temps_preparation = data['temps_preparation']
        if 'temps_cuisson' in data:
            recette.temps_cuisson = data['temps_cuisson']
        if 'est_publique' in data:
            recette.est_publique = data['est_publique']

        if 'ingredients' in data and isinstance(data['ingredients'], list):
            RecetteIngredient.query.filter_by(recette_id=recette.id).delete()
            for ingredient_data in data['ingredients']:
                ingredient = Ingredient.query.get(ingredient_data['id'])
                if ingredient and not recette.ajouter_ingredient(ingredient, ingredient_data['quantite']):
                    raise ValueError("Impossible d'ajouter un ingrédient à la recette")

        db.session.commit()

        return jsonify({
            "message": "Recette mise à jour avec succès",
            "recette": recette.to_dict(with_ingredients=True)
        }), 200

    except ValueError as exc:
        db.session.rollback()
        logger.error(f"Erreur lors de la mise à jour de la recette: {exc}")
        return jsonify({"message": str(exc)}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la mise à jour de la recette: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la mise à jour de la recette"}), 500

@recettes_bp.route('/<int:recette_id>', methods=['DELETE'])
@jwt_required()
def delete_recette(recette_id):
    user_id = int(get_jwt_identity())
    recette = Recette.query.get(recette_id)

    if not recette:
        return jsonify({"message": "Recette non trouvée"}), 404

    if recette.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à supprimer cette recette"}), 403

    try:
        if recette.image_url:
            _delete_uploaded_file(recette.image_url)
        db.session.delete(recette)
        db.session.commit()

        return jsonify({
            "message": "Recette supprimée avec succès"
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la suppression de la recette: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la suppression de la recette"}), 500


@recettes_bp.route('/<int:recette_id>/image', methods=['POST'])
@jwt_required()
def upload_recette_image(recette_id):
    user_id = int(get_jwt_identity())
    recette = Recette.query.get(recette_id)

    if not recette:
        return jsonify({"message": "Recette non trouvée"}), 404

    if recette.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à modifier cette recette"}), 403

    if 'image' not in request.files:
        return jsonify({"message": "Aucun fichier fourni"}), 400

    try:
        image_url = _save_image(request.files['image'], 'recipes')
    except ValidationError as exc:
        return jsonify({"message": str(exc)}), 400
    except Exception as exc:
        logger.error("Erreur upload image recette: %s", exc)
        return jsonify({"message": "Erreur lors de l'upload de l'image"}), 500

    if recette.image_url and recette.image_url != image_url:
        _delete_uploaded_file(recette.image_url)

    recette.image_url = image_url
    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        logger.error("Erreur sauvegarde image recette: %s", exc)
        return jsonify({"message": "Erreur lors de la sauvegarde"}), 500

    return jsonify({
        "message": "Image recette mise à jour",
        "recette": recette.to_dict(with_ingredients=True)
    }), 200
