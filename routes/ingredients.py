from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Ingredient
import logging

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ingredients_bp = Blueprint('ingredients', __name__)

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
    data = request.get_json()
    
    # Validation
    if not data or not all(k in data for k in ('nom', 'unite', 'prix_unitaire')):
        return jsonify({"message": "Nom, unité et prix unitaire requis"}), 400
    
    if Ingredient.query.filter_by(nom=data['nom']).first():
        return jsonify({"message": "Cet ingrédient existe déjà"}), 409
    
    try:
        ingredient = Ingredient(
            nom=data['nom'],
            unite=data['unite'],
            prix_unitaire=float(data['prix_unitaire'])
        )
        db.session.add(ingredient)
        db.session.commit()
        return jsonify(ingredient.to_dict()), 201
    except ValueError:
        return jsonify({"message": "Prix unitaire doit être un nombre"}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur création ingrédient: {str(e)}")
        return jsonify({"message": "Erreur serveur"}), 500

@ingredients_bp.route('/<int:ingredient_id>', methods=['PUT'])
@jwt_required()
def update_ingredient(ingredient_id):
    try:
        ingredient = Ingredient.query.get_or_404(ingredient_id)
        data = request.get_json()
        
        if 'nom' in data:
            if Ingredient.query.filter(Ingredient.nom == data['nom'], Ingredient.id != ingredient_id).first():
                return jsonify({"message": "Nom déjà utilisé"}), 409
            ingredient.nom = data['nom']
        
        if 'unite' in data:
            ingredient.unite = data['unite']
            
        if 'prix_unitaire' in data:
            try:
                ingredient.prix_unitaire = float(data['prix_unitaire'])
            except ValueError:
                return jsonify({"message": "Prix invalide"}), 400
        
        db.session.commit()
        return jsonify(ingredient.to_dict()), 200
        
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
        return jsonify({
            "message": "Erreur suppression - L'ingrédient est peut-être utilisé ailleurs",
            "detail": str(e)
        }), 500