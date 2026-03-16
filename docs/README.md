# JobConnect

Plateforme de mise en relation entre recruteurs et chercheurs d'emploi, pensÃ©e pour des besoins concrets et rapides: missions ponctuelles, recrutements ciblÃ©s, suivi de candidatures, gestion administrative et support temps rÃ©el.

## Vue d'ensemble

JobConnect permet a un recruteur de publier une offre, de recevoir des candidatures, de suivre les profils et de piloter ses recrutements depuis une interface dÃ©diÃ©e. CÃ´tÃ© candidat, la plateforme permet de consulter les offres, postuler, suivre l'Ã©tat des candidatures et Ã©changer avec l'administration si besoin.

Le projet est organisÃ© en monorepo avec:
- un frontend React + TypeScript + Vite
- un backend Node.js + Express + TypeScript
- MongoDB pour la persistance principale
- Redis pour le cache et certaines fonctionnalitÃ©s temps rÃ©el/session quand disponible
- Socket.IO pour les mises a jour en direct

## FonctionnalitÃ©s actuelles

### Recruteurs
- crÃ©ation et gestion d'offres d'emploi
- consultation des candidatures reÃ§ues
- suivi des statuts candidat
- interface de gestion des profils et des flux de recrutement

### Chercheurs d'emploi
- consultation des offres disponibles
- dÃ©pÃ´t de candidature
- suivi des candidatures et des statuts
- gestion du profil et du CV
- rÃ©ception des notifications produit

### Administration
- gestion des utilisateurs
- modÃ©ration de contenus
- revue des demandes de publication d'offres
- suivi des notifications et de l'activitÃ© support

### Support intÃ©grÃ©
- fil de discussion support utilisateur <-> administration
- rÃ©sumÃ© admin des conversations ouvertes et non lues
- statut de conversation `open` / `resolved`
- marquage lu utilisateur/admin
- diffusion temps rÃ©el des nouveaux messages et des changements de statut

### ExpÃ©rience produit
- interface responsive desktop/mobile
- thÃ¨me clair/sombre harmonisÃ©
- composants UI premium et animations maÃ®trisÃ©es
- landing page enrichie avec effets visuels Three.js

## Stack technique

- Frontend: React 18, TypeScript, Vite, Redux Toolkit, Socket.IO Client, Three.js
- Backend: Node.js, Express, TypeScript, Mongoose, JWT, Socket.IO
- DonnÃ©es: MongoDB, Redis
- Authentification: JWT, Google OAuth cÃ´tÃ© backend selon configuration
- Styling: CSS modulaire par page + styles globaux

## Structure du dÃ©pÃ´t

```text
FinalProject/
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”œâ”€â”€ styles/
â”‚   â”‚   â””â”€â”€ utils/
â”‚   â””â”€â”€ package.json
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”œâ”€â”€ middleware/
â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â””â”€â”€ services/
â”‚   â””â”€â”€ package.json
â”œâ”€â”€ docs/
â”œâ”€â”€ docker-compose.yml
â””â”€â”€ package.json
```

## DÃ©marrage rapide

### PrÃ©requis

- Node.js 18+
- npm 9+
- MongoDB
- Redis optionnel mais recommandÃ©

### Installation

Depuis la racine du projet:

```bash
npm install
```

Puis installer les dÃ©pendances de chaque workspace si nÃ©cessaire:

```bash
cd frontend
npm install

cd ../backend
npm install
```

### Lancement en dÃ©veloppement

Depuis la racine:

```bash
npm run dev
```

Ou sÃ©parÃ©ment:

```bash
cd backend
npm run dev

cd ../frontend
npm run dev
```

AccÃ¨s par dÃ©faut:
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

## Ã‰tat de validation

ContrÃ´les vÃ©rifiÃ©s sur l'Ã©tat actuel du projet:
- lint frontend: OK
- lint backend: OK
- build frontend: OK
- build backend: OK
- smoke test backend: OK

## Modules clÃ©s

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
3. reÃ§oit les rÃ©ponses de l'administration en temps rÃ©el
4. voit le statut de la conversation

### Administration
1. consulte le rÃ©sumÃ© des conversations dans la navigation / gestion utilisateurs
2. filtre les discussions ouvertes, rÃ©solues ou non lues
3. rÃ©pond au fil support
4. marque la conversation comme rÃ©solue ou la rouvre

## Documentation associÃ©e

Voir les autres fichiers du dossier `docs/`:
- [SETUP.md](SETUP.md): installation dÃ©taillÃ©e
- [API.md](API.md): documentation des endpoints
- [DATABASE.md](DATABASE.md): structure des donnÃ©es
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md): guide d'intÃ©gration
- [JOB_OFFERS_WORKFLOW.md](JOB_OFFERS_WORKFLOW.md): workflow mÃ©tier des offres
- [TESTING.md](TESTING.md): stratÃ©gie et commandes de test

## Statut

- Version documentaire: mars 2026
- Statut projet: base fonctionnelle active, buildÃ©e et validÃ©e
- DerniÃ¨re mise a jour README: alignÃ©e avec l'Ã©tat rÃ©el du code et des commandes disponibles

