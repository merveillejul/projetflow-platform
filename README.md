# ProjectFlow — API

> API REST backend du projet de gestion de projets collaboratifs ProjectFlow.  
> Développée avec **Laravel 10**, déployée sur **Railway**.

---

## Stack technique

| Technologie | Rôle |
|---|---|
| PHP 8.2 + Laravel 10 | Framework backend |
| MySQL | Base de données relationnelle |
| Laravel Sanctum | Authentification par token |
| Laravel Reverb | WebSocket temps réel |
| Cloudinary | Stockage photos de profil |
| Brevo (API HTTP) | Envoi d'emails transactionnels |
| Railway | Hébergement cloud |

---

## Fonctionnalités

- Authentification sécurisée (register, login, logout)
- Gestion des rôles : `admin`, `chef`, `membre`
- CRUD complet : projets, tâches, commentaires, fichiers
- Notifications temps réel via WebSocket (Reverb)
- Réinitialisation de mot de passe par email
- Rate limiting sur les routes sensibles
- Headers de sécurité sur toutes les réponses API

---

## Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/ton-compte/projectflow-api.git
cd projectflow-api

# 2. Installer les dépendances
composer install

# 3. Copier et configurer l'environnement
cp .env.example .env
# Remplir les variables dans .env

# 4. Générer la clé d'application
php artisan key:generate

# 5. Exécuter les migrations
php artisan migrate

# 6. Lancer le serveur
php artisan serve
```

---

## Variables d'environnement requises

```
APP_KEY=
APP_ENV=production
APP_DEBUG=false

DB_CONNECTION=mysql
DB_HOST=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

BREVO_API_KEY=
BREVO_SENDER_EMAIL=

CLOUDINARY_URL=

REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=

FRONTEND_URL=https://projectflow-web-pink.vercel.app
```

> Le fichier `.env` ne doit **jamais** être commité sur GitHub.

---

## Endpoints principaux

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/register` | Public | Créer un compte |
| POST | `/api/login` | Public | Se connecter |
| POST | `/api/auth/forgot-password` | Public | Demande réinitialisation MDP |
| POST | `/api/auth/reset-password` | Public | Réinitialiser le MDP |
| GET | `/api/projects` | Authentifié | Liste des projets |
| POST | `/api/projects` | Chef | Créer un projet |
| GET | `/api/projects/{id}/tasks` | Authentifié | Tâches d'un projet |
| POST | `/api/tasks` | Chef | Créer une tâche |
| GET | `/api/notifications` | Authentifié | Notifications |
| GET | `/api/dashboard/stats` | Authentifié | Statistiques tableau de bord |

---

## Sécurité

- Tokens Sanctum avec expiration à 2 heures
- Validation forte des mots de passe (12 car. min + complexité)
- Rate limiting : 5 tentatives/min sur login, 10/min sur register
- CORS restreint aux domaines autorisés
- Headers de sécurité : X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- Mots de passe hashés avec bcrypt
- Messages d'erreur volontairement génériques (anti-énumération)

---

## CI/CD

Chaque push sur `main` déclenche automatiquement :
1. Vérification syntaxe PHP
2. Migrations de test
3. Exécution des tests PHPUnit
4. Déploiement automatique sur Railway (via intégration GitHub)

---

## Auteur

Projet réalisé dans le cadre du BTS SIO option SLAM.
