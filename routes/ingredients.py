from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Ingredient
from sqlalchemy.exc import IntegrityError
import logging
from validation import ValidationError, validate_ingredient_payload

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ingredients_bp = Blueprint('ingredients', __name__)

def _format_integrity_error(error: IntegrityError) -> str:
    message = str(error).lower()
    if 'prix_unitaire' in message and 'null' in message:
        return "Le prix unitaire ne peut pas etre null."
    if 'duplicate' in message or 'unique' in message:
        return "Cet ingrédient existe déjà."
    return "Contrainte de base de données non respectée."

@ingredients_bp.route('/', methods=['GET'])
def get_ingredients():
    try:
        ingredients = Ingredient.query.all()
        return jsonify([ingredient.to_dict() for ingredient in ingredients]), 200
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des ingrédients: {str(e)}")
        return jsonify({"message": "Erreur serveur"}), 500

@ingredients_bp.route('/<int:ingredient_id>', methods=['GET'])
def get_ingredient(ingredient_id):
    try:
        ingredient = Ingredient.query.get_or_404(ingredient_id)
        return jsonify(ingredient.to_dict()), 200
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'ingrédient: {str(e)}")
        return jsonify({"message": "Ingrédient non trouvé"}), 404

@ingredients_bp.route('/', methods=['POST'])
@jwt_required()
def create_ingredient():
    try:
        data = validate_ingredient_payload(request.get_json(silent=True))
    except ValidationError as exc:
        return jsonify({"message": str(exc)}), 400
    
    if Ingredient.query.filter_by(nom=data['nom']).first():
        return jsonify({"message": "Cet ingrédient existe déjà"}), 409
    
    try:
        ingredient = Ingredient(
            nom=data['nom'],
            unite=data['unite'],
            prix_unitaire=data.get('prix_unitaire')
        )
        db.session.add(ingredient)
        db.session.commit()
        return jsonify(ingredient.to_dict()), 201
    except IntegrityError as exc:
        db.session.rollback()
        logger.error(f"Erreur création ingrédient: {exc}")
        return jsonify({"message": _format_integrity_error(exc)}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur création ingrédient: {str(e)}")
        return jsonify({"message": "Erreur serveur"}), 500

@ingredients_bp.route('/<int:ingredient_id>', methods=['PUT'])
@jwt_required()
def update_ingredient(ingredient_id):
    try:
        ingredient = Ingredient.query.get_or_404(ingredient_id)
        data = validate_ingredient_payload(request.get_json(silent=True), partial=True)
        
        if 'nom' in data:
            if Ingredient.query.filter(Ingredient.nom == data['nom'], Ingredient.id != ingredient_id).first():
                return jsonify({"message": "Nom déjà utilisé"}), 409
            ingredient.nom = data['nom']
        
        if 'unite' in data:
            ingredient.unite = data['unite']
            
        if 'prix_unitaire' in data:
            ingredient.prix_unitaire = data['prix_unitaire']
        
        db.session.commit()
        return jsonify(ingredient.to_dict()), 200
    except ValidationError as exc:
        return jsonify({"message": str(exc)}), 400
    except IntegrityError as exc:
        db.session.rollback()
        logger.error(f"Erreur mise à jour ingrédient: {exc}")
        return jsonify({"message": _format_integrity_error(exc)}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur mise à jour ingrédient: {str(e)}")
        return jsonify({"message": "Erreur serveur"}), 500

@ingredients_bp.route('/<int:ingredient_id>', methods=['DELETE'])
@jwt_required()
def delete_ingredient(ingredient_id):
    try:
        ingredient = Ingredient.query.get_or_404(ingredient_id)
        db.session.delete(ingredient)
        db.session.commit()
        return jsonify({"message": "Ingrédient supprimé"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur suppression ingrédient: {str(e)}")
        return jsonify({"message": "Erreur suppression - L'ingrédient est peut-être utilisé ailleurs"}), 500
