from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, ShoppingList, ShoppingListItem, Recette, Inventaire, InventaireIngredient, Ingredient, RecetteIngredient
import logging

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

shopping_bp = Blueprint('shopping', __name__)

@shopping_bp.route('/lists', methods=['GET'])
@jwt_required()
def get_shopping_lists():
    user_id = get_jwt_identity()
    
    # Obtenir les listes de courses de l'utilisateur
    shopping_lists = ShoppingList.query.filter_by(utilisateur_id=user_id).all()
    
    return jsonify({
        "listes_courses": [shopping_list.to_dict() for shopping_list in shopping_lists]
    }), 200

@shopping_bp.route('/lists/<int:liste_id>', methods=['GET'])
@jwt_required()
def get_shopping_list(liste_id):
    user_id = get_jwt_identity()
    shopping_list = ShoppingList.query.get(liste_id)
    
    if not shopping_list:
        return jsonify({"message": "Liste de courses non trouvée"}), 404
    
    # Vérifier si l'utilisateur est le propriétaire de la liste
    if shopping_list.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à accéder à cette liste"}), 403
    
    return jsonify(shopping_list.to_dict()), 200

@shopping_bp.route('/lists', methods=['POST'])
@jwt_required()
def create_shopping_list():
    user_id = get_jwt_identity()
    
    try:
        # Création d'une nouvelle liste de courses
        new_shopping_list = ShoppingList(
            utilisateur_id=user_id
        )
        
        db.session.add(new_shopping_list)
        db.session.commit()
        
        return jsonify({
            "message": "Liste de courses créée avec succès",
            "liste_courses": new_shopping_list.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la création de la liste de courses: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la création de la liste de courses"}), 500

@shopping_bp.route('/lists/<int:liste_id>/items', methods=['POST'])
@jwt_required()
def add_item_to_list(liste_id):
    user_id = get_jwt_identity()
    shopping_list = ShoppingList.query.get(liste_id)
    
    if not shopping_list:
        return jsonify({"message": "Liste de courses non trouvée"}), 404
    
    # Vérifier si l'utilisateur est le propriétaire de la liste
    if shopping_list.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à modifier cette liste"}), 403
    
    data = request.get_json()
    
    # Validation des données
    if not all(k in data for k in ('ingredient_id', 'quantite')):
        return jsonify({"message": "L'ID de l'ingrédient et la quantité sont requis"}), 400
    
    try:
        # Vérifier si l'ingrédient existe
        ingredient = Ingredient.query.get(data['ingredient_id'])
        if not ingredient:
            return jsonify({"message": "Ingrédient non trouvé"}), 404
        
        # Vérifier si l'ingrédient est déjà dans la liste
        existing_item = ShoppingListItem.query.filter_by(
            liste_id=liste_id,
            ingredient_id=data['ingredient_id']
        ).first()
        
        if existing_item:
            # Mettre à jour la quantité
            existing_item.quantite += data['quantite']
        else:
            # Ajouter le nouvel item
            new_item = ShoppingListItem(
                liste_id=liste_id,
                ingredient_id=data['ingredient_id'],
                quantite=data['quantite'],
                est_achete=False
            )
            db.session.add(new_item)
        
        db.session.commit()
        
        return jsonify({
            "message": "Article ajouté à la liste de courses avec succès",
            "liste_courses": shopping_list.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de l'ajout d'un article à la liste de courses: {e}")
        return jsonify({"message": "Une erreur est survenue lors de l'ajout d'un article à la liste de courses"}), 500

@shopping_bp.route('/lists/<int:liste_id>/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_shopping_list_item(liste_id, item_id):
    user_id = get_jwt_identity()
    shopping_list = ShoppingList.query.get(liste_id)
    
    if not shopping_list:
        return jsonify({"message": "Liste de courses non trouvée"}), 404
    
    # Vérifier si l'utilisateur est le propriétaire de la liste
    if shopping_list.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à modifier cette liste"}), 403
    
    item = ShoppingListItem.query.get(item_id)
    if not item or item.liste_id != liste_id:
        return jsonify({"message": "Article non trouvé dans cette liste"}), 404
    
    data = request.get_json()
    
    try:
        # Mise à jour de l'article
        if 'quantite' in data:
            item.quantite = data['quantite']
        
        if 'est_achete' in data:
            item.est_achete = data['est_achete']
        
        db.session.commit()
        
        return jsonify({
            "message": "Article mis à jour avec succès",
            "item": item.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la mise à jour de l'article: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la mise à jour de l'article"}), 500

@shopping_bp.route('/lists/<int:liste_id>/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_shopping_list_item(liste_id, item_id):
    user_id = get_jwt_identity()
    shopping_list = ShoppingList.query.get(liste_id)
    
    if not shopping_list:
        return jsonify({"message": "Liste de courses non trouvée"}), 404
    
    # Vérifier si l'utilisateur est le propriétaire de la liste
    if shopping_list.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à modifier cette liste"}), 403
    
    item = ShoppingListItem.query.get(item_id)
    if not item or item.liste_id != liste_id:
        return jsonify({"message": "Article non trouvé dans cette liste"}), 404
    
    try:
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({
            "message": "Article supprimé avec succès"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la suppression de l'article: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la suppression de l'article"}), 500

@shopping_bp.route('/lists/<int:liste_id>', methods=['DELETE'])
@jwt_required()
def delete_shopping_list(liste_id):
    user_id = get_jwt_identity()
    shopping_list = ShoppingList.query.get(liste_id)
    
    if not shopping_list:
        return jsonify({"message": "Liste de courses non trouvée"}), 404
    
    # Vérifier si l'utilisateur est le propriétaire de la liste
    if shopping_list.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à supprimer cette liste"}), 403
    
    try:
        db.session.delete(shopping_list)
        db.session.commit()
        
        return jsonify({
            "message": "Liste de courses supprimée avec succès"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la suppression de la liste de courses: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la suppression de la liste de courses"}), 500

@shopping_bp.route('/generate/<int:recette_id>/<int:inventaire_id>', methods=['POST'])
@jwt_required()
def generate_shopping_list(recette_id, inventaire_id):
    user_id = get_jwt_identity()
    
    # Vérifier si la recette existe
    recette = Recette.query.get(recette_id)
    if not recette:
        return jsonify({"message": "Recette non trouvée"}), 404
    
    # Vérifier si l'inventaire existe et appartient à l'utilisateur
    inventaire = Inventaire.query.get(inventaire_id)
    if not inventaire:
        return jsonify({"message": "Inventaire non trouvé"}), 404
    
    if inventaire.utilisateur_id != user_id:
        return jsonify({"message": "Vous n'êtes pas autorisé à accéder à cet inventaire"}), 403
    
    try:
        # Créer une nouvelle liste de courses
        new_list = ShoppingList(utilisateur_id=user_id)
        db.session.add(new_list)
        db.session.commit()
        
        # Récupérer les ingrédients de la recette
        recette_ingredients = RecetteIngredient.query.filter_by(recette_id=recette_id).all()
        
        # Pour chaque ingrédient de la recette
        for ri in recette_ingredients:
            # Vérifier si l'ingrédient est dans l'inventaire
            inventory_item = InventaireIngredient.query.filter_by(
                inventaire_id=inventaire_id,
                ingredient_id=ri.ingredient_id
            ).first()
            
            quantite_manquante = ri.quantite
            
            # Si l'ingrédient est dans l'inventaire, calculer la quantité manquante
            if inventory_item:
                if inventory_item.quantite_disponible >= ri.quantite:
                    # On a assez d'ingrédients, continuer au suivant
                    continue
                else:
                    # On manque d'ingrédients, calculer la quantité manquante
                    quantite_manquante = ri.quantite - inventory_item.quantite_disponible
            
            # Ajouter l'ingrédient manquant à la liste de courses
            list_item = ShoppingListItem(
                liste_id=new_list.id,
                ingredient_id=ri.ingredient_id,
                quantite=quantite_manquante,
                est_achete=False
            )
            db.session.add(list_item)
        
        db.session.commit()
        
        return jsonify({
            "message": "Liste de courses générée avec succès",
            "liste_courses": new_list.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur lors de la génération de la liste de courses: {e}")
        return jsonify({"message": "Une erreur est survenue lors de la génération de la liste de courses"}), 500