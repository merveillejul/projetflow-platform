# ProjectFlow — API REST Laravel

Backend de l'application ProjectFlow. Fournit une API REST sécurisée consommée par l'application web et l'application mobile.

## Stack technique

- PHP 8.2 / Laravel 11
- MySQL 8 (XAMPP)
- Laravel Sanctum (authentification JWT)
- Eloquent ORM
- Middlewares de rôles (Admin / Chef / Membre)

## Prérequis

- XAMPP (Apache + MySQL démarrés)
- PHP 8.2+
- Composer

## Installation

```bash
git clone https://github.com/merveillejul/projetflow-platform.git
cd projectflow-api
composer install
cp .env.example .env
```

Configurer le fichier `.env` :

```env
DB_DATABASE=projectflow_db
DB_USERNAME=root
DB_PASSWORD=
APP_URL=http://localhost:8000
```

```bash
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=0.0.0.0 --port=8000
```

L'API est accessible sur `http://localhost:8000/api`

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | admin.projectflow@demo.fr | Admin@PF2026! |
| Chef de projet | chef.projectflow@demo.fr | Chef@PF2026! |
| Membre | membre.projectflow@demo.fr | Membre@PF2026! |

## Commandes utiles

```bash
php artisan migrate:fresh --seed   # Réinitialiser la base
php artisan config:clear           # Vider le cache config
php artisan route:list             # Voir toutes les routes
```

## Endpoints principaux

| Méthode | URL | Rôle requis |
|---------|-----|-------------|
| POST | /api/login | — |
| POST | /api/register | — |
| GET | /api/projects | auth |
| POST | /api/projects | chef |
| PUT | /api/projects/{id} | chef |
| DELETE | /api/projects/{id} | chef |
| GET | /api/projects/{id}/tasks | auth |
| POST | /api/tasks | chef |
| PUT | /api/tasks/{id} | auth |
| GET | /api/my-tasks | auth |
| GET | /api/notifications | auth |
| GET | /api/users | admin |
| PATCH | /api/users/{id}/validate | admin |
| GET | /api/dashboard/stats | auth |

Collection Postman complète disponible dans le Google Drive du projet.

## Auteur

Merveille Juliana — BTS SIO SLAM 2026 — N° 2545871902