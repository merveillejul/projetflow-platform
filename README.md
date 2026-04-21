# ProjectFlow — Application Web React JS

Interface web de l'application ProjectFlow. SPA (Single Page Application) consommant l'API REST Laravel.

## Stack technique

- React JS 18 (Vite)
- JavaScript ES6+
- Axios (appels HTTP)
- React Router v6
- Recharts (graphiques)
- Police Inter (Google Fonts)

## Prérequis

- Node.js 18+
- API Laravel démarrée sur `http://localhost:8000`

## Installation

```bash
cd projectflow-web
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`

## Configuration

L'URL de l'API est configurée dans `src/api/api.js` :

```javascript
baseURL: 'http://localhost:8000/api'
```

Si tu utilises une IP réseau différente, modifie cette ligne.

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | admin.projectflow@demo.fr | Admin@PF2026! |
| Chef de projet | chef.projectflow@demo.fr | Chef@PF2026! |
| Membre | membre.projectflow@demo.fr | Membre@PF2026! |

## Structure des pages

| Route | Page | Accès |
|-------|------|-------|
| / | Connexion | Tous |
| /register | Inscription | Tous |
| /admin | Interface Admin | Admin |
| /dashboard | Tableau de bord | Chef + Membre |
| /projects | Liste des projets | Chef + Membre |
| /projects/:id | Détail projet | Chef + Membre |
| /tasks | Mes tâches | Chef + Membre |
| /notifications | Notifications | Chef + Membre |
| /profile | Profil | Tous (connectés) |

## Lancer en production

```bash
npm run build
```

Les fichiers compilés sont dans le dossier `dist/`.

## Auteur

Merveille Juliana — BTS SIO SLAM 2026 — N° 2545871902