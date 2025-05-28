from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Recette, Ingredient, RecetteIngredient
import logging

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

recettes_bp = Blueprint('recettes', __name__)

@recettes_bp.route('/', methods=['GET'])
@jwt_required()
def get_recettes():
    user_id = get_jwt_identity()
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
    user_id = get_jwt_identity()
    recette = Recette.query.get(recette_id)

    if not recette:
        return jsonify({"message": "Recette non trouvée"}), 404

    if not recette.est_publique and recette.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'avez pas accès à cette recette"}), 403

    return jsonify(recette.to_dict(with_ingredients=True)), 200

@recettes_bp.route('/', methods=['POST'])
@jwt_required()
def create_recette():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not all(k in data for k in ('nom', 'description', 'temps_preparation', 'temps_cuisson')):
        return jsonify({"message": "Tous les champs sont requis"}), 400

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
                if all(k in ingredient_data for k in ('id', 'quantite')):
                    ingredient = Ingredient.query.get(ingredient_data['id'])
                    if ingredient:
                        nouvelle_recette.ajouter_ingredient(ingredient, ingredient_data['quantite'])

        db.session.commit()

        return jsonify({
            "message": "Recette créée avec succès",
            "recette": nouvelle_recette.to_dict(with_ingredients=True)
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la création de la recette: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la création de la recette"}), 500

@recettes_bp.route('/<int:recette_id>', methods=['PUT'])
@jwt_required()
def update_recette(recette_id):
    user_id = get_jwt_identity()
    recette = Recette.query.get(recette_id)

    if not recette:
        return jsonify({"message": "Recette non trouvée"}), 404

    if recette.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à modifier cette recette"}), 403

    data = request.get_json()

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
                if all(k in ingredient_data for k in ('id', 'quantite')):
                    ingredient = Ingredient.query.get(ingredient_data['id'])
                    if ingredient:
                        recette.ajouter_ingredient(ingredient, ingredient_data['quantite'])

        db.session.commit()

        return jsonify({
            "message": "Recette mise à jour avec succès",
            "recette": recette.to_dict(with_ingredients=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la mise à jour de la recette: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la mise à jour de la recette"}), 500

@recettes_bp.route('/<int:recette_id>', methods=['DELETE'])
@jwt_required()
def delete_recette(recette_id):
    user_id = get_jwt_identity()
    recette = Recette.query.get(recette_id)

    if not recette:
        return jsonify({"message": "Recette non trouvée"}), 404

    if recette.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à supprimer cette recette"}), 403

    try:
        db.session.delete(recette)
        db.session.commit()

        return jsonify({
            "message": "Recette supprimée avec succès"
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la suppression de la recette: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la suppression de la recette"}), 500
