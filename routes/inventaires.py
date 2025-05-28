from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Inventaire, InventaireIngredient, Ingredient
import logging

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

inventaires_bp = Blueprint('inventaires', __name__)

@inventaires_bp.route('/', methods=['GET'])
@jwt_required()
def get_inventaires():
    user_id = get_jwt_identity()
    
    # Obtenir les inventaires de l'utilisateur
    inventaires = Inventaire.query.filter_by(utilisateur_id=user_id).all()
    
    return jsonify({
        "inventaires": [inventaire.to_dict() for inventaire in inventaires]
    }), 200

@inventaires_bp.route('/<int:inventaire_id>', methods=['GET'])
@jwt_required()
def get_inventaire(inventaire_id):
    user_id = get_jwt_identity()
    inventaire = Inventaire.query.get(inventaire_id)
    
    if not inventaire:
        return jsonify({"message": "Inventaire non trouvé"}), 404
    
    # Vérifier si l'utilisateur est le propriétaire de l'inventaire
    if inventaire.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à accéder à cet inventaire"}), 403
    
    return jsonify(inventaire.to_dict(with_ingredients=True)), 200

@inventaires_bp.route('/', methods=['POST'])
@jwt_required()
def create_inventaire():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validation des données
    if 'nom' not in data:
        return jsonify({"message": "Le nom de l'inventaire est requis"}), 400
    
    try:
        # Création de l'inventaire
        nouvel_inventaire = Inventaire(
            nom=data['nom'],
            utilisateur_id=user_id
        )
        
        db.session.add(nouvel_inventaire)
        db.session.commit()
        
        # Ajouter les ingrédients si fournis
        if 'ingredients' in data and isinstance(data['ingredients'], list):
            for ingredient_data in data['ingredients']:
                if all(k in ingredient_data for k in ('id', 'quantite_disponible')):
                    ingredient = Ingredient.query.get(ingredient_data['id'])
                    if ingredient:
                        inventaire_ingredient = InventaireIngredient(
                            inventaire_id=nouvel_inventaire.id,
                            ingredient_id=ingredient.id,
                            quantite_disponible=ingredient_data['quantite_disponible']
                        )
                        db.session.add(inventaire_ingredient)
            
            db.session.commit()
        
        return jsonify({
            "message": "Inventaire créé avec succès",
            "inventaire": nouvel_inventaire.to_dict(with_ingredients=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la création de l'inventaire: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la création de l'inventaire"}), 500

@inventaires_bp.route('/<int:inventaire_id>', methods=['PUT'])
@jwt_required()
def update_inventaire(inventaire_id):
    user_id = get_jwt_identity()
    inventaire = Inventaire.query.get(inventaire_id)
    
    if not inventaire:
        return jsonify({"message": "Inventaire non trouvé"}), 404
    
    # Vérifier si l'utilisateur est le propriétaire de l'inventaire
    if inventaire.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à modifier cet inventaire"}), 403
    
    data = request.get_json()
    
    try:
        # Mise à jour des informations de l'inventaire
        if 'nom' in data:
            inventaire.nom = data['nom']
        
        # Mise à jour des ingrédients si fournis
        if 'ingredients' in data and isinstance(data['ingredients'], list):
            # Supprimer les anciens ingrédients
            InventaireIngredient.query.filter_by(inventaire_id=inventaire.id).delete()
            
            # Ajouter les nouveaux ingrédients
            for ingredient_data in data['ingredients']:
                if all(k in ingredient_data for k in ('id', 'quantite_disponible')):
                    ingredient = Ingredient.query.get(ingredient_data['id'])
                    if ingredient:
                        inventaire_ingredient = InventaireIngredient(
                            inventaire_id=inventaire.id,
                            ingredient_id=ingredient.id,
                            quantite_disponible=ingredient_data['quantite_disponible']
                        )
                        db.session.add(inventaire_ingredient)
        
        db.session.commit()
        
        return jsonify({
            "message": "Inventaire mis à jour avec succès",
            "inventaire": inventaire.to_dict(with_ingredients=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la mise à jour de l'inventaire: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la mise à jour de l'inventaire"}), 500

@inventaires_bp.route('/<int:inventaire_id>/ingredients/<int:ingredient_id>', methods=['PUT'])
@jwt_required()
def update_ingredient_quantity(inventaire_id, ingredient_id):
    user_id = get_jwt_identity()
    inventaire = Inventaire.query.get(inventaire_id)
    
    if not inventaire:
        return jsonify({"message": "Inventaire non trouvé"}), 404
    
    # Vérifier si l'utilisateur est le propriétaire de l'inventaire
    if inventaire.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à modifier cet inventaire"}), 403
    
    data = request.get_json()
    
    if 'quantite_disponible' not in data:
        return jsonify({"message": "La quantité disponible est requise"}), 400
    
    try:
        # Rechercher l'ingrédient dans l'inventaire
        inventaire_ingredient = InventaireIngredient.query.filter_by(
            inventaire_id=inventaire_id,
            ingredient_id=ingredient_id
        ).first()
        
        # Si l'ingrédient n'existe pas dans l'inventaire, on l'ajoute
        if not inventaire_ingredient:
            ingredient = Ingredient.query.get(ingredient_id)
            if not ingredient:
                return jsonify({"message": "Ingrédient non trouvé"}), 404
            
            inventaire_ingredient = InventaireIngredient(
                inventaire_id=inventaire_id,
                ingredient_id=ingredient_id,
                quantite_disponible=data['quantite_disponible']
            )
            db.session.add(inventaire_ingredient)
        else:
            # Sinon, on met à jour la quantité
            inventaire_ingredient.quantite_disponible = data['quantite_disponible']
        
        db.session.commit()
        
        return jsonify({
            "message": "Quantité d'ingrédient mise à jour avec succès",
            "inventaire_ingredient": inventaire_ingredient.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la mise à jour de la quantité d'ingrédient: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la mise à jour de la quantité d'ingrédient"}), 500

@inventaires_bp.route('/<int:inventaire_id>', methods=['DELETE'])
@jwt_required()
def delete_inventaire(inventaire_id):
    user_id = get_jwt_identity()
    inventaire = Inventaire.query.get(inventaire_id)
    
    if not inventaire:
        return jsonify({"message": "Inventaire non trouvé"}), 404
    
    # Vérifier si l'utilisateur est le propriétaire de l'inventaire
    if inventaire.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à supprimer cet inventaire"}), 403
    
    try:
        db.session.delete(inventaire)
        db.session.commit()
        
        return jsonify({
            "message": "Inventaire supprimé avec succès"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la suppression de l'inventaire: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la suppression de l'inventaire"}), 500