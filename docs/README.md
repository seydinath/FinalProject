# JobConnect - Plateforme de Mise en Relation Recruteurs & Chercheurs d'Emploi

## Présentation du Projet

**JobConnect** est une plateforme web innovante qui met en relation les recruteurs avec les chercheurs d'emploi selon une approche différente du modèle LinkedIn classique.

### Concept Principal

Notre solution permet aux utilisateurs de **poster des besoins en personnel ponctuels ou événementiels**. Par exemple :
- Un recruteur a besoin de **4 personnes** pour aider lors d'un événement
- Il poste cette annonce sur JobConnect
- Les chercheurs d'emploi peuvent voir l'offre et **postuler directement**
- Le recruteur peut évaluer les candidatures et sélectionner les personnes appropriées

## Fonctionnalités Principales

### Pour les Recruteurs
- Créer et publier des offres temporaires ou ponctuelles
- Spécifier le nombre de personnes recherchées
- Consulter les candidatures reçues
- Sélectionner et accepter les candidats
- Gérer son profil professionnel

### Pour les Chercheurs d'Emploi
- Consulter les offres disponibles
- Postuler à une offre en un clic
- Gérer ses candidatures (en attente, acceptées, refusées)
- Construire un profil attractif
- Recevoir des notifications sur les réponses

### Authentification
- Authentification sécurisée via Google Gmail
- Pas de création de mot de passe complexe
- Accès rapide et sécurisé pour tous les utilisateurs

## Architecture Technique

### Structure Générale
```
JobConnect/
├── Frontend (Client)
│   └── Application Web (React/Vue/Angular)
├── Backend (Serveur)
│   └── API RESTful
├── Base de Données
└── Documentation
```

### Frontend
- Interface utilisateur responsive (desktop & mobile)
- Formulaires pour créer/consulter les offres
- Système de candidature intuitif
- Dashboard personnalisé pour chaque utilisateur

### Backend
- API RESTful pour la gestion des offres
- Gestion des utilisateurs et authentification
- Système de candidatures
- Notifications

### Authentification
- Intégration OAuth 2.0 avec Google
- Vérification via Gmail
- Tokens JWT pour les sessions utilisateur

## Modèle de Données (Général)

### Utilisateurs
- Profil (nom, email, téléphone, description)
- Type (recruteur ou chercheur d'emploi)
- Date d'inscription

### Offres/Annonces
- Titre et description
- Nombre de postes disponibles
- Localisation
- Date de début/fin
- Compétences requises
- Créateur (recruteur)

### Candidatures
- Utilisateur candidat
- Offre visée
- Date de candidature
- Statut (en attente, acceptée, refusée)

## Flux Utilisateur

### Recruteur
1. **Authentification** via Google
2. **Création de profil** professionnel
3. **Publication d'une offre** (titre, description, nombre de postes, localisation)
4. **Réception des candidatures**
5. **Sélection des candidats**
6. **Confirmation avec les sélectionnés**

### Chercheur d'Emploi
1. **Authentification** via Google
2. **Création de profil** personnel
3. **Consultation des offres** disponibles
4. **Candidature** à une ou plusieurs offres
5. **Suivi des candidatures**

## Objectifs du Projet

- Créer une plateforme simple et efficace de mise en relation
- Différenciation par rapport à LinkedIn (approche événementielle/ponctuelle)
- Expérience utilisateur fluide et intuitive
- Sécurité garantie via authentification Google

## Technologies Sélectionnées

- **Frontend** : React + TypeScript + Vite
- **Backend** : Node.js/Express
- **Base de Données** : MongoDB
- **Authentification** : Google OAuth 2.0
- **Effects** : Three.js (Liquid Metal)
- **Styling** : CSS moderne + Dark Mode
- **Déploiement** : Heroku / Vercel / AWS

---

## 📁 Structure du Projet

```
JobConnect/
├── frontend/              # Application React premium
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages principales
│   │   ├── utils/        # Utilitaires
│   │   └── styles/       # CSS global
│   └── package.json
│
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── routes/       # Routes API
│   │   ├── models/       # Modèles MongoDB
│   │   ├── middleware/   # Middlewares
│   │   └── config/       # Configuration
│   └── package.json
│
└── docs/                 # Documentation
    ├── SETUP.md         # Guide d'installation
    ├── API.md           # Documentation API
    └── DATABASE.md      # Schéma base de données
```

---

## 🎨 Fonctionnalités Frontend

✅ Landing page premium avec design moderne  
✅ Mode sombre / Mode clair avec transitions fluides  
✅ Effets Liquid Metal avec Three.js  
✅ Design responsive (Desktop & Mobile)  
✅ Prêt pour Google OAuth  

## 🔧 Fonctionnalités Backend

✅ API RESTful complète
✅ Authentification JWT
✅ Modèles MongoDB (User, JobOffer, Application)
✅ CORS configuré
✅ Gestion d'erreurs robuste

---

## 🚀 Démarrage Rapide

### Installation Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Installation Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`  
L'API sera accessible sur `http://localhost:5000`

---

## 📚 Documentation

Voir les fichiers dans `/docs/`:
- [SETUP.md](docs/SETUP.md) - Guide d'installation complet
- [API.md](docs/API.md) - Documentation des endpoints
- [DATABASE.md](docs/DATABASE.md) - Schéma et modèles

---

**Version** : 1.0 - Conception Complète  
**Date** : Mars 2026  
**Statut** : 🟢 Prêt pour le développement
