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

## Technologies Envisagées

- **Frontend** : React / Vue.js / Angular
- **Backend** : Node.js/Express ou Python/Django
- **Base de Données** : MongoDB / PostgreSQL
- **Authentification** : Google OAuth 2.0
- **Déploiement** : Heroku / Vercel / AWS

---

**Version** : 1.0 - Documentation Initiale  
**Date** : Mars 2026
