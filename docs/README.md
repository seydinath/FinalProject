# JobConnect

Plateforme de mise en relation entre recruteurs et chercheurs d'emploi, pensée pour des besoins concrets et rapides: missions ponctuelles, recrutements ciblés, suivi de candidatures, gestion administrative et support temps réel.

## Vue d'ensemble

JobConnect permet à un recruteur de publier une offre, de recevoir des candidatures, de suivre les profils et de piloter ses recrutements depuis une interface dédiée. Côté candidat, la plateforme permet de consulter les offres, postuler, suivre l'état des candidatures et échanger avec l'administration si besoin.

Le projet est organisé en monorepo avec:
- un frontend React + TypeScript + Vite
- un backend Node.js + Express + TypeScript
- MongoDB pour la persistance principale
- Redis pour le cache et certaines fonctionnalités temps réel/session quand disponible
- Socket.IO pour les mises à jour en direct

## Fonctionnalités actuelles

### Recruteurs
- création et gestion d'offres d'emploi
- consultation des candidatures reçues
- suivi des statuts candidat
- interface de gestion des profils et des flux de recrutement

### Chercheurs d'emploi
- consultation des offres disponibles
- dépôt de candidature
- suivi des candidatures et des statuts
- gestion du profil et du CV
- réception des notifications produit

### Administration
- gestion des utilisateurs
- modération de contenus
- revue des demandes de publication d'offres
- suivi des notifications et de l'activité support

### Support intégré
- fil de discussion support utilisateur <-> administration
- résumé admin des conversations ouvertes et non lues
- statut de conversation `open` / `resolved`
- marquage lu utilisateur/admin
- diffusion temps réel des nouveaux messages et des changements de statut

### Expérience produit
- interface responsive desktop/mobile
- thème clair/sombre harmonisé
- composants UI premium et animations maîtrisées
- landing page enrichie avec effets visuels Three.js

## Stack technique

- Frontend: React 18, TypeScript, Vite, Redux Toolkit, Socket.IO Client, Three.js
- Backend: Node.js, Express, TypeScript, Mongoose, JWT, Socket.IO
- Données: MongoDB, Redis
- Authentification: JWT, Google OAuth côté backend selon configuration
- Styling: CSS modulaire par page + styles globaux

## Structure du dépôt

```text
FinalProject/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- store/
|   |   |-- styles/
|   |   `-- utils/
|   `-- package.json
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- services/
|   `-- package.json
|-- docs/
|-- docker-compose.yml
`-- package.json
```

## Démarrage rapide

### Prérequis

- Node.js 18+
- npm 9+
- MongoDB
- Redis optionnel mais recommandé

### Installation

Depuis la racine du projet:

```bash
npm install
```

Puis installer les dépendances de chaque workspace si nécessaire:

```bash
cd frontend
npm install

cd ../backend
npm install
```

### Lancement en développement

Depuis la racine:

```bash
npm run dev
```

Ou séparément:

```bash
cd backend
npm run dev

cd ../frontend
npm run dev
```

Accès par défaut:
- frontend: `http://localhost:5173`
- backend: `http://localhost:5000`

## Scripts utiles

### Racine

```bash
npm run dev
npm run build
npm run lint
```

### Backend

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run admin:upsert
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## État de validation

Contrôles vérifiés sur l'état actuel du projet:
- lint frontend: OK
- lint backend: OK
- build frontend: OK
- build backend: OK
- smoke test backend: OK

## Modules clés

### Backend

- `src/routes/auth.ts`: authentification et sessions
- `src/routes/jobOffers.ts`: gestion des offres
- `src/routes/applications.ts`: gestion des candidatures
- `src/routes/notifications.ts`: notifications produit
- `src/routes/support.ts`: messagerie support et statut des conversations
- `src/services/realtime.ts`: diffusion Socket.IO

### Frontend

- `src/pages/NotificationsPage.tsx`: historique notifications + fil support utilisateur
- `src/pages/UserManagementPage.tsx`: gestion admin + inbox support
- `src/components/TopNav.tsx`: navigation globale, badges et signal support
- `src/services/supportService.ts`: API du support

## Flux support

### Utilisateur
1. ouvre son espace notifications
2. consulte l'historique ou envoie un message support
3. reçoit les réponses de l'administration en temps réel
4. voit le statut de la conversation

### Administration
1. consulte le résumé des conversations dans la navigation / gestion utilisateurs
2. filtre les discussions ouvertes, résolues ou non lues
3. répond au fil support
4. marque la conversation comme résolue ou la rouvre

## Documentation associée

Voir les autres fichiers du dossier `docs/`:
- [SETUP.md](SETUP.md): installation détaillée
- [API.md](API.md): documentation des endpoints
- [DATABASE.md](DATABASE.md): structure des données
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md): guide d'intégration
- [JOB_OFFERS_WORKFLOW.md](JOB_OFFERS_WORKFLOW.md): workflow métier des offres
- [TESTING.md](TESTING.md): stratégie et commandes de test

## Statut

- Version documentaire: mars 2026
- Statut projet: base fonctionnelle active, buildée et validée
- Dernière mise à jour README: alignée avec l'état réel du code et des commandes disponibles

