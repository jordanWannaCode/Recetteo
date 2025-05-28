from werkzeug.security import generate_password_hash, check_password_hash
import logging
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
from flask import jsonify

db = SQLAlchemy()
bcrypt = Bcrypt()

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Utilisateur(db.Model):
    __tablename__ = 'utilisateurs'
    
    id = db.Column(db.Integer, primary_key=True)
    nom_utilisateur = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mot_de_passe = db.Column(db.String(128), nullable=False)
    date_inscription = db.Column(db.DateTime, default=datetime.utcnow)

    recettes = db.relationship('Recette', backref='auteur', lazy=True)
    inventaires = db.relationship('Inventaire', backref='proprietaire', lazy=True)
    listes_courses = db.relationship('ShoppingList', backref='utilisateur', lazy=True)

    def set_password(self, mot_de_passe):
        try:
            self.mot_de_passe = bcrypt.generate_password_hash(mot_de_passe).decode('utf-8')
        except Exception as e:
            logger.error(f"Erreur hachage mot de passe: {e}")
            raise ValueError("Erreur création compte")

    def check_password(self, mot_de_passe):
        try:
            return bcrypt.check_password_hash(self.mot_de_passe, mot_de_passe)
        except Exception as e:
            logger.error(f"Erreur vérification mot de passe: {e}")
            return False

    def to_dict(self):
        return {
            'id': self.id,
            'nom_utilisateur': self.nom_utilisateur,
            'email': self.email,
            'date_inscription': self.date_inscription.isoformat()
        }

    def to_safe_dict(self):
        return {
            'id': self.id,
            'nom_utilisateur': self.nom_utilisateur,
            'date_inscription': self.date_inscription.isoformat()
        }

    def __repr__(self):
        return f"<Utilisateur {self.nom_utilisateur}>"


class Recette(db.Model):
    __tablename__ = 'recettes'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    temps_preparation = db.Column(db.Integer, nullable=False)
    temps_cuisson = db.Column(db.Integer, nullable=False)
    est_publique = db.Column(db.Boolean, default=False, nullable=False)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_modification = db.Column(db.DateTime, onupdate=datetime.utcnow)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)

    ingredients = db.relationship('RecetteIngredient', backref='recette_rel', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, with_ingredients=False):
        data = {
            'id': self.id,
            'nom': self.nom,
            'description':   self.description,
            'temps_preparation': self.temps_preparation,
            'temps_cuisson': self.temps_cuisson,
            'est_publique': self.est_publique,
            'date_creation': self.date_creation.isoformat(),
            'date_modification': self.date_modification.isoformat() if self.date_modification else None,
            'utilisateur_id': self.utilisateur_id
        }

        if with_ingredients:
            data['ingredients'] = []
            for ri in self.ingredients:
                ing = ri.ingredient_rel
                if ing:  # Vérification de sécurité
                    data['ingredients'].append({
                        'id': ing.id,
                        'nom': ing.nom,
                        'quantite': ri.quantite,
                        'unite': ing.unite
                    })
                else:
                    logger.warning(f"Ingrédient manquant pour recette ID {self.id}, RI ID {ri.id}")

        return data
    def ajouter_ingredient(self, ingredient, quantite):
        try:
            if not self.id:
                db.session.flush()  # Assure que l'ID est généré

            ri = RecetteIngredient(
                recette_id=self.id,
                ingredient_id=ingredient.id,
                quantite=quantite
            )
            db.session.add(ri)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erreur ajout ingrédient à recette: {e}")
            return False

    def __repr__(self):
        return f"<Recette {self.nom}>"


class Ingredient(db.Model):
    __tablename__ = 'ingredients'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(120), nullable=False, unique=True)
    unite = db.Column(db.String(50), nullable=False)
    prix_unitaire = db.Column(db.Float, nullable=False)
    date_ajout = db.Column(db.DateTime, default=datetime.utcnow)
    
    recettes = db.relationship('RecetteIngredient', backref='ingredient_rel', lazy=True)
    inventaires = db.relationship('InventaireIngredient', backref='ingredient_inv', lazy=True)
    items_liste = db.relationship('ShoppingListItem', backref='ingredient_item', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'unite': self.unite,
            'prix_unitaire': self.prix_unitaire,
            'date_ajout': self.date_ajout.isoformat()
        }

class RecetteIngredient(db.Model):
    __tablename__ = 'recette_ingredients'
    
    id = db.Column(db.Integer, primary_key=True)
    recette_id = db.Column(db.Integer, db.ForeignKey('recettes.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredients.id'), nullable=False)
    quantite = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'recette_id': self.recette_id,
            'ingredient_id': self.ingredient_id,
            'quantite': self.quantite
        }

class Inventaire(db.Model):
    __tablename__ = 'inventaires'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(120), nullable=False)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_modification = db.Column(db.DateTime, onupdate=datetime.utcnow)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    
    ingredients = db.relationship('InventaireIngredient', backref='inventaire_rel', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, with_ingredients=False):
        data = {
            'id': self.id,
            'nom': self.nom,
            'date_creation': self.date_creation.isoformat(),
            'date_modification': self.date_modification.isoformat() if self.date_modification else None,
            'utilisateur_id': self.utilisateur_id
        }

        if with_ingredients:
            data['ingredients'] = []
            for ii in self.ingredients:
                ing = ii.ingredient_inv
                if ing:
                    data['ingredients'].append({
                        'id': ing.id,
                        'nom': ing.nom,
                        'quantite_disponible': ii.quantite_disponible,
                        'unite': ing.unite,
                        'prix_unitaire': ing.prix_unitaire
                    })
                else:
                    logger.warning(f"Ingrédient manquant dans inventaire ID {self.id}, II ID {ii.id}")

        return data

class InventaireIngredient(db.Model):
    __tablename__ = 'inventaire_ingredients'
    
    id = db.Column(db.Integer, primary_key=True)
    inventaire_id = db.Column(db.Integer, db.ForeignKey('inventaires.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredients.id'), nullable=False)
    quantite_disponible = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'inventaire_id': self.inventaire_id,
            'ingredient_id': self.ingredient_id,
            'quantite_disponible': self.quantite_disponible
        }

    def update_quantity(self, quantite):
        try:
            self.quantite_disponible += quantite
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erreur mise à jour quantité: {e}")
            return False

class ShoppingList(db.Model):
    __tablename__ = 'shopping_lists'
    
    id = db.Column(db.Integer, primary_key=True)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_mise_a_jour = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    items = db.relationship('ShoppingListItem', backref='liste', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'utilisateur_id': self.utilisateur_id,
            'date_creation': self.date_creation.isoformat(),
            'date_mise_a_jour': self.date_mise_a_jour.isoformat() if self.date_mise_a_jour else None,
            'items': [item.to_dict() for item in self.items],
            'total_items': len(self.items),
            'total_ingredients': sum(item.quantite for item in self.items),
            'prix_total': round(sum(item.quantite * item.ingredient_item.prix_unitaire for item in self.items), 2)
        }
    
class ShoppingListItem(db.Model):
    __tablename__ = 'shopping_list_items'
    
    id = db.Column(db.Integer, primary_key=True)
    liste_id = db.Column(db.Integer, db.ForeignKey('shopping_lists.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredients.id'), nullable=False)
    quantite = db.Column(db.Float, nullable=False)
    est_achete = db.Column(db.Boolean, default=False, nullable=False)
    date_ajout = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        ing = self.ingredient_item
        if ing is None:
            logger.warning(f"Ingredient manquant pour ShoppingListItem ID {self.id}")
            return {
                'id': self.id,
                'liste_id': self.liste_id,
                'ingredient_id': self.ingredient_id,
                'ingredient_nom': None,
                'quantite': self.quantite,
                'unite': None,
                'est_achete': self.est_achete,
                'prix_estime': None,
                'date_ajout': self.date_ajout.isoformat()
            }

        return {
            'id': self.id,
            'liste_id': self.liste_id,
            'ingredient_id': self.ingredient_id,
            'ingredient_nom': ing.nom,
            'quantite': self.quantite,
            'unite': ing.unite,
            'est_achete': self.est_achete,
            'prix_estime': round(self.quantite * ing.prix_unitaire, 2),
            'date_ajout': self.date_ajout.isoformat()
        }
