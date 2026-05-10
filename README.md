# ProjectFlow — Application Mobile

> Application mobile du projet de gestion de projets collaboratifs ProjectFlow.  
> Développée avec **React Native + Expo**.

---

## Stack technique

| Technologie | Rôle |
|---|---|
| React Native | Framework mobile cross-platform (iOS + Android) |
| Expo | Outils de développement et build simplifié |
| React Navigation | Navigation entre les écrans |
| Axios | Requêtes HTTP vers l'API |
| AsyncStorage | Stockage local sécurisé du token |
| EAS Build | Compilation de l'APK/IPA |

---

## Fonctionnalités

- Connexion / déconnexion
- Consultation des projets et tâches
- Mise à jour du statut des tâches assignées
- Notifications
- Gestion du profil
- Changement de mot de passe
- Réinitialisation de mot de passe

---

## Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/ton-compte/projectflow-mobile.git
cd projectflow-mobile

# 2. Installer les dépendances
npm install

# 3. Lancer avec Expo
npx expo start
```

Puis scanner le QR code avec l'application **Expo Go** sur votre téléphone.

---

## Architecture des écrans

```
src/
├── context/
│   └── AuthContext.js     # Gestion globale de l'authentification
├── navigation/
│   └── AppNavigator.js    # Définition des routes de navigation
├── screens/               # Tous les écrans de l'application
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── DashboardScreen
│   ├── TasksScreen
│   ├── ProjectsScreen
│   ├── PlanningScreen
│   ├── NotificationsScreen
│   ├── ProfileScreen
│   ├── ChangePasswordScreen
│   └── ForgotPasswordScreen
└── services/
    └── api.js             # Configuration Axios + intercepteurs
```

---

## Différence avec l'application web

| Fonctionnalité | Web | Mobile |
|---|---|---|
| Tableau de bord complet | Oui | Oui (simplifié) |
| Administration | Oui | Non |
| Upload de fichiers | Oui | Non |
| Kanban Board | Oui | Non |
| Consultation tâches/projets | Oui | Oui |
| Notifications | Oui | Oui |
| Profil / MDP | Oui | Oui |

> L'application mobile est conçue pour un usage terrain (membres d'équipe),
> tandis que l'interface web est l'outil de gestion complet (chefs de projet, administrateurs).

---

## Sécurité

- Token stocké dans `AsyncStorage` (stockage natif sécurisé)
- Déconnexion automatique si token expiré (erreur 401)
- `DeviceEventEmitter` pour gérer la session expirée depuis n'importe quel écran

---

## Auteur

Projet réalisé dans le cadre du BTS SIO option SLAM.
