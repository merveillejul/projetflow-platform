# ProjectFlow — Application Web

> Interface web du projet de gestion de projets collaboratifs ProjectFlow.  
> Développée avec **React 19 + Vite**, déployée sur **Vercel**.

---

## Stack technique

| Technologie | Rôle |
|---|---|
| React 19 | Framework frontend |
| Vite | Bundler ultra-rapide |
| React Router v7 | Navigation entre les pages |
| Axios | Requêtes HTTP vers l'API |
| Recharts | Graphiques du tableau de bord |
| Vercel | Hébergement et déploiement |

---

## Fonctionnalités

- Connexion / déconnexion sécurisée
- Tableau de bord avec statistiques (graphiques)
- Gestion des projets (création, modification, suppression)
- Gestion des tâches (Kanban, planning)
- Système de commentaires en temps réel
- Upload et téléchargement de fichiers
- Notifications
- Interface d'administration (validation comptes, gestion rôles)
- Réinitialisation de mot de passe par email

---

## Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/ton-compte/projectflow-web.git
cd projectflow-web

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
```

---

## Variables d'environnement

```
VITE_API_URL=https://projetflow-platform-production.up.railway.app/api
```

---

## Scripts disponibles

```bash
npm run dev      # Serveur de développement (localhost:5173)
npm run build    # Compilation pour la production
npm run preview  # Prévisualiser le build
npm run lint     # Vérifier la qualité du code
```

---

## Architecture des pages

```
src/
├── api/           # Appels vers l'API REST
├── components/    # Composants réutilisables (Navbar, Sidebar, PrivateRoute)
├── context/       # AuthContext — gestion de l'état de connexion global
├── pages/         # Toutes les pages de l'application
│   ├── Login, Register, ForgotPassword, ResetPassword
│   ├── Dashboard, Projects, Tasks, Planning, Board
│   ├── ProjectDetails, CreateProject, EditProject
│   ├── Admin, Profile, Notifications
└── utils/         # Fonctions utilitaires (dates, etc.)
```

---

## Sécurité

- Routes protégées avec `PrivateRoute` (redirige si non connecté)
- Token Bearer envoyé automatiquement via intercepteur Axios
- Déconnexion automatique si le token expire (réponse 401)
- Données utilisateur stockées en `localStorage`

---

## CI/CD

Chaque push sur `main` déclenche automatiquement :
1. Vérification ESLint (qualité du code)
2. Build de production (`npm run build`)
3. Déploiement automatique sur Vercel (via intégration GitHub)

---

## URL de production

[https://projectflow-web-pink.vercel.app](https://projectflow-web-pink.vercel.app)

---

## Auteur

Projet réalisé dans le cadre du BTS SIO option SLAM.
