# ProjectFlow — API Laravel

API REST du projet ProjectFlow, développée avec Laravel 10.50.2.

**Candidat :** Merveille Juliana — N° 2545871902  
**BTS SIO SLAM — Session 2026**

---

## Stack technique

- PHP 8.2
- Laravel 10.50.2
- Laravel Sanctum (authentification par token)
- MySQL
- Déployé sur Railway

---

## Architecture

L'API suit une architecture REST standard :

- `POST /api/login` — Connexion, renvoie un token Bearer
- `POST /api/register` — Inscription (compte en attente de validation)
- `POST /api/logout` — Déconnexion
- `GET /api/user` — Profil de l'utilisateur connecté
- `PUT /api/user` — Modifier nom et email
- `POST /api/user/photo` — Uploader une photo de profil

### Projets
- `GET /api/projects` — Liste des projets
- `POST /api/projects` — Créer un projet (chef uniquement)
- `GET /api/projects/{id}` — Détail d'un projet
- `PUT /api/projects/{id}` — Modifier un projet (chef uniquement)
- `DELETE /api/projects/{id}` — Supprimer un projet (chef uniquement)
- `GET /api/projects/{id}/members` — Membres d'un projet
- `POST /api/projects/{id}/members` — Ajouter un membre (chef uniquement)
- `DELETE /api/projects/{id}/members/{userId}` — Retirer un membre (chef uniquement)

### Tâches
- `GET /api/projects/{id}/tasks` — Tâches d'un projet
- `POST /api/tasks` — Créer une tâche (chef uniquement)
- `PUT /api/tasks/{id}` — Modifier/changer statut
- `DELETE /api/tasks/{id}` — Supprimer une tâche (chef uniquement)
- `GET /api/my-tasks` — Mes tâches assignées

### Commentaires
- `GET /api/tasks/{id}/comments` — Commentaires d'une tâche
- `POST /api/tasks/{id}/comments` — Ajouter un commentaire
- `DELETE /api/comments/{id}` — Supprimer un commentaire

### Notifications
- `GET /api/notifications` — Mes notifications
- `POST /api/notifications/{id}/read` — Marquer comme lue
- `POST /api/notifications/read-all` — Tout marquer comme lu
- `DELETE /api/notifications/{id}` — Supprimer une notification

### Administration
- `GET /api/users` — Liste des utilisateurs (admin uniquement)
- `PATCH /api/users/{id}/validate` — Valider/suspendre un compte (admin uniquement)
- `PUT /api/users/{id}/role` — Modifier le rôle (admin uniquement)
- `DELETE /api/users/{id}` — Supprimer un utilisateur (admin uniquement)
- `GET /api/dashboard/stats` — Statistiques du tableau de bord

---

## Sécurité

- Mots de passe hashés avec **bcrypt**
- Authentification par **token Bearer** (Laravel Sanctum)
- **Middleware CheckRole** — vérifie le rôle avant chaque requête protégée
- **Protection brute force** — blocage temporaire après 5 tentatives échouées (15 minutes)
- Nouveau compte bloqué jusqu'à validation par un administrateur
- Mot de passe : minimum 12 caractères, majuscule, chiffre, caractère spécial obligatoires
- **CORS** configuré pour autoriser uniquement les domaines autorisés

---

## Base de données

8 tables :

| Table | Rôle |
|---|---|
| `users` | Utilisateurs (admin, chef, membre) |
| `projects` | Projets créés par les chefs |
| `tasks` | Tâches liées aux projets |
| `project_user` | Table pivot — membres d'un projet |
| `comments` | Commentaires sur les tâches |
| `notifications` | Notifications utilisateurs |
| `files` | Fichiers uploadés |
| `personal_access_tokens` | Tokens Sanctum |

---

## Lancer en local

```bash
# Cloner le repo
git clone https://github.com/merveillejul/projetflow-platform.git
cd projectflow-api

# Installer les dépendances
composer install

# Configurer l'environnement
cp .env.example .env
php artisan key:generate

# Migrer la base de données
php artisan migrate:fresh --seed

# Lancer le serveur
php artisan serve --host=0.0.0.0 --port=8000
```

## Comptes de démonstration

Après `php artisan migrate:fresh --seed` :

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin.projectflow@demo.fr | Admin@PF2026! |
| Chef de projet | chef.projectflow@demo.fr | Chef@PF2026! |
| Membre | membre.projectflow@demo.fr | Membre@PF2026! |

---

## Déploiement

API déployée sur **Railway** :  
`https://projetflow-platform-production.up.railway.app/api`
