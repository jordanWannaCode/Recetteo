# Recetteo

Application web de gestion culinaire combinant un backend Flask sécurisé et un frontend React pour gérer recettes, ingrédients, inventaires et listes de courses.

## Aperçu

Recetteo a été commencé comme projet académique, puis repris pour être rendu plus propre, plus documenté et plus sécurisé.

Le projet couvre les besoins suivants :

- création de compte et connexion utilisateur
- gestion de recettes personnelles
- gestion d'un catalogue d'ingrédients
- gestion d'inventaires utilisateur
- génération et suivi de listes de courses

## Architecture générale

Le dépôt regroupe :

- un backend Python/Flask dans `backend/`
- un frontend React dans `frontend/`
- une base de données MySQL

## Stack technique

### Backend

- Python 3
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-Bcrypt
- Flask-Cors
- Flask-Migrate
- MySQL
- `mysql-connector-python`

### Frontend

- React
- React Router DOM
- Axios
- Material UI
- Emotion
- Framer Motion
- React Hook Form
- Yup
- Vite (dev server + build)

## Structure du projet

```text
Recetteo/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── validation.py
│   ├── requirements.txt
│   ├── routes/
│   ├── instance/
│   └── uploads.py
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
├── api/
│   └── index.py
└── vercel.json
```

## Fonctionnalités implémentées

### Authentification

- inscription utilisateur
- connexion utilisateur
- récupération du profil connecté
- hachage des mots de passe avec bcrypt
- tokens JWT

### Recettes

- lister les recettes de l'utilisateur
- consulter les recettes publiques
- créer une recette
- modifier une recette
- supprimer une recette
- associer des ingrédients à une recette

### Ingrédients

- lister les ingrédients
- consulter un ingrédient
- créer un ingrédient
- modifier un ingrédient
- supprimer un ingrédient

### Inventaires

- lister les inventaires utilisateur
- consulter un inventaire
- créer un inventaire
- modifier un inventaire
- supprimer un inventaire
- gérer les quantités d'ingrédients dans l'inventaire

### Listes de courses

- créer une liste
- consulter les listes de l'utilisateur
- ajouter/modifier/supprimer des articles
- générer automatiquement une liste à partir d'une recette et d'un inventaire

## Sécurité appliquée

Le projet a été renforcé sur plusieurs axes.

### Déjà en place

- ORM SQLAlchemy pour éviter les concaténations SQL manuelles
- mots de passe hachés avec bcrypt
- JWT pour protéger les routes privées
- validation backend centralisée dans [backend/validation.py](backend/validation.py)
- limitation simple des tentatives sur `login/register`
- CORS restreint par configuration
- secrets et URI de base obligatoires via variables d'environnement

### Règles suivies

- zéro confiance sur les entrées JSON
- validation stricte des types, formats, longueurs et bornes
- pas de secrets en dur dans le code final attendu
- pas d'exposition inutile des erreurs internes SQL au client

## Limites actuelles

Le projet est fonctionnel côté base, mais il reste encore plusieurs écarts à traiter pour une reprise complète :

- certaines pages frontend attendent encore des champs ou services non présents côté backend
- le profil frontend prévoit des actions supplémentaires qui ne sont pas encore exposées par l'API
- le formulaire/contact côté frontend n'est pas pertinent ici, car le projet reste centré sur l'API métier
- `db.create_all()` est encore utilisé au démarrage, pratique en dev mais pas idéal à long terme

## Installation

### Prérequis

- Python 3.10+ recommandé
- Node.js 20+ recommandé
- npm
- MySQL 8+ recommandé

### Configuration backend

Crée un environnement virtuel puis installe les dépendances Python :

```powershell
cd C:\Users\user\Desktop\Recetteo\backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crée ensuite la base MySQL :

```sql
CREATE DATABASE gestion_recettes;
```

Crée un fichier `.env` à partir de [backend/.env.example](backend/.env.example).

Exemple :

```env
SECRET_KEY=une-vraie-cle-secrete
JWT_SECRET_KEY=une-vraie-cle-jwt
DATABASE_URI=mysql+mysqlconnector://root:TON_MOT_DE_PASSE@localhost:3306/gestion_recettes
FLASK_APP=backend.app
FLASK_ENV=development
VITE_API_URL=http://localhost:5000/api
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Lancement du backend

```powershell
cd C:\Users\user\Desktop\Recetteo
.\backend\.venv\Scripts\Activate.ps1
python -m backend.app
```

API disponible sur :

```text
http://localhost:5000
```

Test rapide :

```text
GET /api/recettes/publiques
```

### Installation frontend

Installe les dépendances Node.js :

```powershell
cd C:\Users\user\Desktop\Recetteo\frontend
npm install
```

### Lancement du frontend

```powershell
cd C:\Users\user\Desktop\Recetteo\frontend
npm start
```

L'interface est généralement disponible sur :

```text
http://localhost:5173
```

## Résumé de démarrage

En pratique, il faut ouvrir deux terminaux :

### Terminal 1

```powershell
cd C:\Users\user\Desktop\Recetteo
.\backend\.venv\Scripts\Activate.ps1
python -m backend.app
```

### Terminal 2

```powershell
cd C:\Users\user\Desktop\Recetteo\frontend
npm install
npm start
```

## Endpoints principaux

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Recettes

- `GET /api/recettes/`
- `GET /api/recettes/publiques`
- `GET /api/recettes/<id>`
- `POST /api/recettes/`
- `PUT /api/recettes/<id>`
- `DELETE /api/recettes/<id>`

### Ingrédients

- `GET /api/ingredients/`
- `GET /api/ingredients/<id>`
- `POST /api/ingredients/`
- `PUT /api/ingredients/<id>`
- `DELETE /api/ingredients/<id>`

### Inventaires

- `GET /api/inventaires/`
- `GET /api/inventaires/<id>`
- `POST /api/inventaires/`
- `PUT /api/inventaires/<id>`
- `PUT /api/inventaires/<inventaire_id>/ingredients/<ingredient_id>`
- `DELETE /api/inventaires/<id>`

### Shopping

- `GET /api/shopping/lists`
- `GET /api/shopping/lists/<id>`
- `POST /api/shopping/lists`
- `POST /api/shopping/lists/<id>/items`
- `PUT /api/shopping/lists/<id>/items/<item_id>`
- `DELETE /api/shopping/lists/<id>/items/<item_id>`
- `DELETE /api/shopping/lists/<id>`
- `POST /api/shopping/generate/<recette_id>/<inventaire_id>`

## Vérifications utiles

### Vérification syntaxique Python

```powershell
python -m py_compile backend\app.py backend\config.py backend\models.py backend\validation.py backend\routes\auth.py backend\routes\recettes.py backend\routes\ingredients.py backend\routes\inventaires.py backend\routes\shopping.py
```

### Build frontend

```powershell
cd C:\Users\user\Desktop\Recetteo\frontend
npm run build
```

## Axes d'amélioration recommandés

1. compléter la cohérence front/back sur les pages profil, recettes et inventaires
2. remplacer `db.create_all()` par un vrai flux de migrations
3. introduire des tests API et frontend
4. déplacer la limitation de débit vers une solution plus robuste si déploiement public
5. brancher une gestion plus fine des rôles et permissions si le produit évolue

## Positionnement du projet

Recetteo n'est pas un simple site vitrine. C'est une application avec données utilisateur, contenu privé et opérations métier. L'authentification reste donc nécessaire tant que les recettes, inventaires et listes de courses restent personnels.

## Résumé

`Recetteo` est aujourd'hui une bonne base de reprise : l'API tourne, le frontend peut être lancé, la documentation est à jour et le socle de sécurité a été renforcé pour éviter les erreurs les plus classiques sur une application web connectée à une base de données.
