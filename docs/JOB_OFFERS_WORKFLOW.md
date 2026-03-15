# 📋 Guide Complet - Système de Gestion des Offres d'Emploi

**Date de création:** 9 mars 2026  
**Système:** JobConnect - Workflow Complet Recruiter → Admin → Job Seeker

---

## 🎯 Vue d'Ensemble

Ce système implémente un workflow complet de gestion des offres d'emploi avec 3 rôles principaux:

1. **Recruiter (Recruteur)** - Soumet des demandes d'offres d'emploi
2. **Admin (Administrateur)** - Approuve ou rejette les demandes
3. **Job Seeker (Chercheur d'emploi)** - Postule aux offres approuvées

---

## 📊 Flux de Travail

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  RECRUITER  │─────▶│    ADMIN    │─────▶│ JOB SEEKER  │
└─────────────┘      └─────────────┘      └─────────────┘
      │                     │                     │
      │                     │                     │
   Soumet              Approuve              Postule
  Demande              Demande                 à
   d'offre              ↓                     l'offre
      │              Crée l'offre                │
      │              publique                    │
      ↓                     ↓                    ↓
 En attente          Offre publiée         Candidature
                                            envoyée
                                                ↓
                                          Recruiter
                                          voit & valide
```

---

## 🗄️ Modèles de Données

### 1. JobOfferRequest (Demande d'Offre)

**Fichier:** `backend/src/models/JobOfferRequest.ts`

```typescript
{
  recruiterId: ObjectId,          // Référence vers User
  companyName: String,            // Nom de l'entreprise *
  location: String,               // Lieu de travail *
  salary: Number,                 // Salaire en FCFA *
  numberOfPositions: Number,      // Nombre de postes *
  jobDuration: String,            // Type: permanent | contract | temporary | part-time *
  experienceRequired: Number,     // Années d'expérience (défaut: 0)
  description: String,            // Description du poste
  status: String,                 // pending | approved | rejected
  rejectionReason: String,        // Raison du rejet (si rejeté)
  approvedBy: ObjectId,           // Admin qui a approuvé
  approvedAt: Date
}
```

### 2. JobOffer (Offre Publique)

**Fichier:** `backend/src/models/JobOffer.ts` (modifié)

```typescript
{
  jobOfferRequestId: ObjectId,    // Référence vers JobOfferRequest
  title: String,                  // Titre du poste *
  description: String,            // Description *
  companyName: String,            // Nom entreprise *
  recruiter: ObjectId,            // Référence vers User *
  numberOfPositions: Number,      // Postes disponibles *
  positionsAvailable: Number,     // (même que ci-dessus)
  location: String,               // Lieu
  jobDuration: String,            // Type de contrat
  experienceRequired: Number,     // Expérience requise
  salary: Number,                 // Salaire
  requiredSkills: [String],       // Compétences requises
  publicationStatus: String,      // pending | approved | rejected
  status: String,                 // open | closed | filled
  approvedBy: ObjectId,
  approvedAt: Date
}
```

### 3. JobApplication (Candidature)

**Fichier:** `backend/src/models/JobApplication.ts`

```typescript
{
  jobOfferId: ObjectId,           // Référence vers JobOffer *
  candidateId: ObjectId,          // Référence vers User *
  candidateName: String,          // Nom du candidat *
  candidateEmail: String,         // Email du candidat *
  candidatePhone: String,         // Téléphone
  candidateLocation: String,      // Lieu actuel
  candidateExperience: Number,    // Années d'expérience
  candidateSkills: [String],      // Compétences
  candidateCoverLetter: String,   // Lettre de motivation
  status: String,                 // applied | accepted | rejected
  appliedAt: Date,                // Date de candidature
  acceptedAt: Date,               // Date d'acceptation
  rejectedAt: Date                // Date de rejet
}
```

---

## 🚀 Routes API Backend

### Routes: Job Offer Requests (`/job-offer-requests`)

**Fichier:** `backend/src/routes/jobOfferRequests.ts`

| Méthode | Endpoint | Rôle | Description |
|---------|----------|------|-------------|
| POST | `/request` | Recruiter | Soumettre une demande d'offre |
| GET | `/my-requests` | Recruiter | Voir ses propres demandes |
| GET | `/admin/pending-requests` | Admin | Voir demandes en attente |
| GET | `/admin/all-requests` | Admin | Voir toutes les demandes |
| POST | `/admin/requests/:id/approve` | Admin | Approuver une demande |
| POST | `/admin/requests/:id/reject` | Admin | Rejeter une demande |

### Routes: Applications (`/applications`)

**Fichier:** `backend/src/routes/applications.ts`

| Méthode | Endpoint | Rôle | Description |
|---------|----------|------|-------------|
| POST | `/:jobOfferId/apply` | Job Seeker | Postuler à une offre |
| GET | `/:jobOfferId/applications` | Recruiter | Voir candidatures d'une offre |
| GET | `/recruiter/all-applications` | Recruiter | Voir toutes ses candidatures |
| POST | `/:applicationId/accept` | Recruiter | Accepter une candidature |
| POST | `/:applicationId/reject` | Recruiter | Rejeter une candidature |
| GET | `/my-applications` | Job Seeker | Voir ses propres candidatures |

---

## 🎨 Composants Frontend

### 1. JobOfferRequestForm (Formulaire de Demande)

**Fichier:** `frontend/src/components/JobOfferRequestForm.tsx`

**Usage:** Le recruiter remplit ce formulaire pour soumettre une demande.

**Champs:**
- Nom de l'entreprise *
- Lieu *
- Salaire (FCFA) *
- Nombre de postes *
- Type de contrat *
- Expérience requise
- Description

**Intégration:** Dans `TalentSearchPage` via un bouton "Soumettre une Offre d'Emploi"

### 2. AdminJobOfferRequestsPanel (Panel Admin)

**Fichier:** `frontend/src/components/AdminJobOfferRequestsPanel.tsx`

**Rôle:** Permet à l'admin de voir et gérer toutes les demandes.

**Fonctionnalités:**
- Filtrer: En attente / Toutes
- Approuver une demande → Crée JobOffer automatiquement
- Rejeter avec raison
- Voir historique complet

**Page:** `AdminJobRequestsPage.tsx`

### 3. ApplicationForm (Formulaire de Candidature)

**Fichier:** `frontend/src/components/ApplicationForm.tsx`

**Usage:** Le chercheur d'emploi remplit ce formulaire pour postuler.

**Champs:**
- Téléphone *
- Lieu actuel
- Années d'expérience
- Compétences
- Lettre de motivation

**Intégration:** Modal dans `JobsList` au clic sur "Postuler"

### 4. RecruiterApplicationsList (Liste Candidatures)

**Fichier:** `frontend/src/components/RecruiterApplicationsList.tsx`

**Rôle:** Le recruiter voit toutes les candidatures reçues sur ses offres.

**Fonctionnalités:**
- Voir détails candidat (email, téléphone, CV)
- Accepter une candidature
- Rejeter une candidature
- Filtrer par statut

**Page:** `RecruiterApplicationsPage.tsx`

### 5. JobSeekerApplicationStatus (Statut Candidatures)

**Fichier:** `frontend/src/components/JobSeekerApplicationStatus.tsx`

**Rôle:** Le chercheur d'emploi voit l'état de ses candidatures.

**Fonctionnalités:**
- Voir toutes candidatures
- Filtrer: Toutes / En attente / Acceptées / Rejetées
- Notification du statut (accepté/rejeté)

**Page:** `JobSeekerApplicationsPage.tsx`

---

## 🎯 Services Frontend

### jobOfferRequestService.ts

```typescript
- submitJobOfferRequest(data)
- getMyJobOfferRequests()
- getPendingJobOfferRequests()      // Admin
- getAllJobOfferRequests()          // Admin
- approveJobOfferRequest(id)        // Admin
- rejectJobOfferRequest(id, reason) // Admin
```

### applicationService.ts

```typescript
- applyToJobOffer(jobOfferId, data)
- getJobOfferApplications(jobOfferId)    // Recruiter
- getAllRecruiterApplications()          // Recruiter
- acceptApplication(applicationId)       // Recruiter
- rejectApplication(applicationId)       // Recruiter
- getMyApplications()                    // Job Seeker
```

---

## 🔐 Permissions & Sécurité

### Recruiter peut:
- ✅ Soumettre des demandes d'offres d'emploi
- ✅ Voir ses propres demandes
- ✅ Voir les candidatures reçues
- ✅ Accepter/rejeter des candidatures
- ❌ Approuver des demandes (réservé admin)
- ❌ Postuler à des offres

### Admin peut:
- ✅ Voir toutes les demandes
- ✅ Approuver des demandes → Crée offre publique
- ✅ Rejeter des demandes avec raison
- ✅ Accès complet aux stats

### Job Seeker peut:
- ✅ Postuler aux offres approuvées
- ✅ Voir l'état de ses candidatures
- ✅ Recevoir notifications (accepté/rejeté)
- ❌ Soumettre des offres
- ❌ Voir d'autres candidatures

---

## 🧪 Comment Tester le Workflow Complet

### Étape 1: Créer un Compte Recruiter
1. Se créer un compte avec `userType: 'recruiter'`
2. Aller dans "Trouver des Talents"
3. Cliquer sur "📋 Soumettre une Offre d'Emploi"
4. Remplir le formulaire et soumettre
5. ✅ Vous verrez: "Demande soumise avec succès! En attente d'approbation."

### Étape 2: Approuver en tant qu'Admin
1. Se connecter avec un compte admin
2. Aller dans le panel admin (AdminJobRequestsPage)
3. Voir la demande dans "En Attente"
4. Cliquer "Approuver"
5. ✅ L'offre est maintenant créée et visible sur l'accueil

### Étape 3: Postuler en tant que Job Seeker
1. Se connecter avec un compte chercheur d'emploi
2. Aller sur la page d'accueil / section Jobs
3. Voir l'offre approuvée
4. Cliquer "Postuler"
5. Remplir le formulaire de candidature
6. ✅ Candidature envoyée

### Étape 4: Gérer les Candidatures (Recruiter)
1. Retour au compte recruiter
2. Aller dans "Mes Candidatures Reçues" (RecruiterApplicationsPage)
3. Voir la candidature avec tous les détails
4. Accepter ou rejeter
5. ✅ Le chercheur d'emploi verra la mise à jour

### Étape 5: Vérifier Statut (Job Seeker)
1. Retour au compte chercheur d'emploi
2. Aller dans "Mes Candidatures" (JobSeekerApplicationsPage)
3. Voir le statut: "Acceptée" ou "Rejetée"
4. ✅ Notification visible

---

## 📝 Fichiers CSS Créés

- `frontend/src/styles/forms.css` - Formulaires (demande + candidature)
- `frontend/src/styles/recruiter-applications.css` - Liste candidatures recruiter
- `frontend/src/styles/job-seeker-applications.css` - Statut candidatures chercheur
- `frontend/src/styles/admin-panel.css` - Panel administration

---

## 🛠️ Améliorations Futures Possibles

1. **Notifications en temps réel** (WebSocket)
2. **Upload CV** (fichiers PDF)
3. **Système de messagerie** recruiter ↔ candidat
4. **Notes privées** du recruiter sur candidatures
5. **Historique** des modifications
6. **Export Excel** des candidatures
7. **Emails automatiques** lors changement statut
8. **Dashboard analytics** pour recruiter/admin

---

## 🚨 Points d'Attention

### Validation
- Tous les champs marqués `*` sont obligatoires
- Le téléphone est obligatoire pour candidature
- Une raison est requise pour rejeter une demande

### États
- JobOfferRequest: `pending` → `approved` | `rejected`
- JobApplication: `applied` → `accepted` | `rejected`
- JobOffer: `publicationStatus: approved` + `status: open`

### Intégrité
- Une demande approuvée crée automatiquement une JobOffer
- Un candidat ne peut postuler qu'une fois par offre
- Seul le recruiter de l'offre peut voir/gérer les candidatures

---

## 📞 Support

Pour toute question sur l'implémentation:
- Vérifier les logs backend: MongoDB + Redis
- Vérifier la console frontend: Erreurs API
- Tester les endpoints avec Postman/Insomnia

**Serveurs:**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

---

**✅ Système complet et opérationnel!**
