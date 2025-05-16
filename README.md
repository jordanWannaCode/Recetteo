# Gestion de Recettes Culinaires - API Backend

## 📝 Description

Cette application est une API backend complète pour un système de gestion de recettes culinaires. Elle permet aux utilisateurs de :

- Gérer leurs recettes personnelles
- Créer et partager des recettes
- Gérer des inventaires d'ingrédients
- Générer des listes de courses intelligentes

## 🛠 Technologies utilisées

- **Backend**:
  - Python 3
  - Flask
  - Flask-SQLAlchemy (ORM)
  - Flask-JWT-Extended (Authentification)
  - Flask-Bcrypt (Hachage des mots de passe)
  - MySQL (Base de données)

## 🚀 Fonctionnalités principales

### 🔐 Authentification
- Inscription et connexion sécurisée
- Gestion des sessions avec JWT
- Protection des routes

### 📚 Recettes
- Création, lecture, modification et suppression de recettes
- Gestion des ingrédients associés
- Marquer les recettes comme publiques/privées
- Consultation des recettes publiques

### 🥕 Ingrédients
- Catalogue central d'ingrédients
- Gestion des unités de mesure
- Suivi des prix unitaires

### 🗃 Inventaires
- Gestion de plusieurs inventaires par utilisateur
- Suivi des quantités disponibles
- Intégration avec les recettes

### 🛒 Listes de courses
- Génération automatique basée sur les recettes et inventaires
- Gestion manuelle des articles
- Calcul du coût total estimé

## 🗃 Structure de la base de données

```
utilisateurs
├── recettes
│   └── recette_ingredients
│       └── ingredients
├── inventaires
│   └── inventaire_ingredients
│       └── ingredients
└── shopping_lists
    └── shopping_list_items
        └── ingredients
```

## 🔧 Installation

1. **Prérequis**:
   - Python 3.8+
   - MySQL
   - Environnement virtuel Python (recommandé)

2. **Configuration**:
   - Créer un fichier `.env` à partir de `.env.example`
   - Configurer les variables d'environnement (SECRET_KEY, DATABASE_URI, etc.)

3. **Installation des dépendances**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialisation de la base de données**:
   ```bash
   flask shell
   >>> db.create_all()
   >>> exit()
   ```

5. **Lancer l'application**:
   ```bash
   python app.py
   ```

## 📚 Documentation API

L'API est organisée en plusieurs endpoints :

- `/api/auth` - Authentification
- `/api/recettes` - Gestion des recettes
- `/api/ingredients` - Gestion des ingrédients
- `/api/inventaires` - Gestion des inventaires
- `/api/shopping` - Gestion des listes de courses

### Exemple de requête

**Connexion**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "utilisateur@example.com",
  "mot_de_passe": "motdepasse"
}
```

**Réponse réussie**:
```json
{
  "access_token": "xxx.yyy.zzz",
  "user": {
    "id": 1,
    "nom_utilisateur": "chef123",
    "email": "utilisateur@example.com",
    "date_inscription": "2023-01-01T00:00:00"
  }
}
```

## 🌟 Fonctionnalités avancées

1. **Génération intelligente de listes de courses**:
   - Compare automatiquement les ingrédients nécessaires avec ceux disponibles dans l'inventaire
   - Calcule uniquement les quantités manquantes

2. **Calcul des coûts**:
   - Estimation du coût total des listes de courses
   - Basé sur les prix unitaires des ingrédients

3. **Sécurité renforcée**:
   - Hachage BCrypt pour les mots de passe
   - Tokens JWT avec expiration
   - Validation stricte des entrées
