# ProjectFlow — Application Mobile React Native

Application mobile Android de ProjectFlow. Développée avec React Native (Expo), consomme la même API REST Laravel que l'application web.

## Stack technique

- React Native (Expo SDK)
- JavaScript ES6+
- React Navigation v6 (Tab + Stack Navigator)
- Axios + AsyncStorage (authentification JWT)
- react-native-svg (icônes et graphiques)

## Prérequis

- Node.js 18+ (requis pour Metro bundler et npm — ce n'est PAS un backend)
- Expo CLI : `npm install -g expo-cli`
- API Laravel démarrée et accessible sur le réseau local
- Expo Go installé sur ton smartphone Android OU Android Studio pour l'émulateur

## Installation

```bash
cd projectflow-mobile
npm install
npx expo start
```

Puis :
- Scanner le QR code avec Expo Go (smartphone Android)
- Appuyer sur `a` dans le terminal pour ouvrir sur l'émulateur Android Studio

## Configuration

L'URL de l'API est configurée dans `services/api.js` :

```javascript
baseURL: 'http://192.168.X.X:8000/api'  // Remplacer par ton IP locale
```

Pour trouver ton IP : `ipconfig` dans PowerShell → IPv4 de ta carte réseau.

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Chef de projet | chef.projectflow@demo.fr | Chef@PF2026! |
| Membre | membre.projectflow@demo.fr | Membre@PF2026! |

## Écrans disponibles

| Écran | Description |
|-------|-------------|
| LoginScreen | Connexion |
| RegisterScreen | Inscription |
| ChangePasswordScreen | 1ère connexion — mot de passe forcé |
| DashboardScreen | Tableau de bord avec statistiques |
| ProjectsScreen | Liste des projets avec filtres |
| ProjectDetailScreen | Détail projet, tâches, équipe, commentaires |
| TasksScreen | Mes tâches avec mise à jour de statut |
| NotificationsScreen | Notifications avec badge |
| ProfileScreen | Profil et déconnexion |

## Générer l'APK Android

```bash
npm install -g eas-cli
eas build -p android
```

## Note sur Node.js

Node.js est utilisé exclusivement comme moteur d'exécution pour le Metro bundler d'Expo et les outils npm. Il ne constitue pas un backend supplémentaire — le backend unique du projet est l'API REST Laravel.

## Auteur

Merveille Juliana — BTS SIO SLAM 2026 — N° 2545871902