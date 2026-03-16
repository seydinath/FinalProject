# ðŸ“‹ Guide Complet - SystÃ¨me de Gestion des Offres d'Emploi

**Date de crÃ©ation:** 9 mars 2026  
**SystÃ¨me:** JobConnect - Workflow Complet Recruiter â†’ Admin â†’ Job Seeker

---

## ðŸŽ¯ Vue d'Ensemble

Ce systÃ¨me implÃ©mente un workflow complet de gestion des offres d'emploi avec 3 rÃ´les principaux:

1. **Recruiter (Recruteur)** - Soumet des demandes d'offres d'emploi
2. **Admin (Administrateur)** - Approuve ou rejette les demandes
3. **Job Seeker (Chercheur d'emploi)** - Postule aux offres approuvÃ©es

---

## ðŸ“Š Flux de Travail

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  RECRUITER  â”‚â”€â”€â”€â”€â”€â–¶â”‚    ADMIN    â”‚â”€â”€â”€â”€â”€â–¶â”‚ JOB SEEKER  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
      â”‚                     â”‚                     â”‚
      â”‚                     â”‚                     â”‚
   Soumet              Approuve              Postule
  Demande              Demande                 Ã 
   d'offre              â†“                     l'offre
      â”‚              CrÃ©e l'offre                â”‚
      â”‚              publique                    â”‚
      â†“                     â†“                    â†“
 En attente          Offre publiÃ©e         Candidature
                                            envoyÃ©e
                                                â†“
                                          Recruiter
                                          voit & valide
```

---

## ðŸ—„ï¸ ModÃ¨les de DonnÃ©es

### 1. JobOfferRequest (Demande d'Offre)

**Fichier:** `backend/src/models/JobOfferRequest.ts`

```typescript
{
  recruiterId: ObjectId,          // RÃ©fÃ©rence vers User
  companyName: String,            // Nom de l'entreprise *
  location: String,               // Lieu de travail *
  salary: Number,                 // Salaire en FCFA *
  numberOfPositions: Number,      // Nombre de postes *
  jobDuration: String,            // Type: permanent | contract | temporary | part-time *
  experienceRequired: Number,     // AnnÃ©es d'expÃ©rience (dÃ©faut: 0)
  description: String,            // Description du poste
  status: String,                 // pending | approved | rejected
  rejectionReason: String,        // Raison du rejet (si rejetÃ©)
  approvedBy: ObjectId,           // Admin qui a approuvÃ©
  approvedAt: Date
}
```

### 2. JobOffer (Offre Publique)

**Fichier:** `backend/src/models/JobOffer.ts` (modifiÃ©)

```typescript
{
  jobOfferRequestId: ObjectId,    // RÃ©fÃ©rence vers JobOfferRequest
  title: String,                  // Titre du poste *
  description: String,            // Description *
  companyName: String,            // Nom entreprise *
  recruiter: ObjectId,            // RÃ©fÃ©rence vers User *
  numberOfPositions: Number,      // Postes disponibles *
  positionsAvailable: Number,     // (mÃªme que ci-dessus)
  location: String,               // Lieu
  jobDuration: String,            // Type de contrat
  experienceRequired: Number,     // ExpÃ©rience requise
  salary: Number,                 // Salaire
  requiredSkills: [String],       // CompÃ©tences requises
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
  jobOfferId: ObjectId,           // RÃ©fÃ©rence vers JobOffer *
  candidateId: ObjectId,          // RÃ©fÃ©rence vers User *
  candidateName: String,          // Nom du candidat *
  candidateEmail: String,         // Email du candidat *
  candidatePhone: String,         // TÃ©lÃ©phone
  candidateLocation: String,      // Lieu actuel
  candidateExperience: Number,    // AnnÃ©es d'expÃ©rience
  candidateSkills: [String],      // CompÃ©tences
  candidateCoverLetter: String,   // Lettre de motivation
  status: String,                 // applied | accepted | rejected
  appliedAt: Date,                // Date de candidature
  acceptedAt: Date,               // Date d'acceptation
  rejectedAt: Date                // Date de rejet
}
```

---

## ðŸš€ Routes API Backend

### Routes: Job Offer Requests (`/job-offer-requests`)

**Fichier:** `backend/src/routes/jobOfferRequests.ts`

| MÃ©thode | Endpoint | RÃ´le | Description |
|---------|----------|------|-------------|
| POST | `/request` | Recruiter | Soumettre une demande d'offre |
| GET | `/my-requests` | Recruiter | Voir ses propres demandes |
| GET | `/admin/pending-requests` | Admin | Voir demandes en attente |
| GET | `/admin/all-requests` | Admin | Voir toutes les demandes |
| POST | `/admin/requests/:id/approve` | Admin | Approuver une demande |
| POST | `/admin/requests/:id/reject` | Admin | Rejeter une demande |

### Routes: Applications (`/applications`)

**Fichier:** `backend/src/routes/applications.ts`

| MÃ©thode | Endpoint | RÃ´le | Description |
|---------|----------|------|-------------|
| POST | `/:jobOfferId/apply` | Job Seeker | Postuler Ã  une offre |
| GET | `/:jobOfferId/applications` | Recruiter | Voir candidatures d'une offre |
| GET | `/recruiter/all-applications` | Recruiter | Voir toutes ses candidatures |
| POST | `/:applicationId/accept` | Recruiter | Accepter une candidature |
| POST | `/:applicationId/reject` | Recruiter | Rejeter une candidature |
| GET | `/my-applications` | Job Seeker | Voir ses propres candidatures |

---

## ðŸŽ¨ Composants Frontend

### 1. JobOfferRequestForm (Formulaire de Demande)

**Fichier:** `frontend/src/components/JobOfferRequestForm.tsx`

**Usage:** Le recruiter remplit ce formulaire pour soumettre une demande.

**Champs:**
- Nom de l'entreprise *
- Lieu *
- Salaire (FCFA) *
- Nombre de postes *
- Type de contrat *
- ExpÃ©rience requise
- Description

**IntÃ©gration:** Dans `TalentSearchPage` via un bouton "Soumettre une Offre d'Emploi"

### 2. AdminJobOfferRequestsPanel (Panel Admin)

**Fichier:** `frontend/src/components/AdminJobOfferRequestsPanel.tsx`

**RÃ´le:** Permet Ã  l'admin de voir et gÃ©rer toutes les demandes.

**FonctionnalitÃ©s:**
- Filtrer: En attente / Toutes
- Approuver une demande â†’ CrÃ©e JobOffer automatiquement
- Rejeter avec raison
- Voir historique complet

**Page:** `AdminJobRequestsPage.tsx`

### 3. ApplicationForm (Formulaire de Candidature)

**Fichier:** `frontend/src/components/ApplicationForm.tsx`

**Usage:** Le chercheur d'emploi remplit ce formulaire pour postuler.

**Champs:**
- TÃ©lÃ©phone *
- Lieu actuel
- AnnÃ©es d'expÃ©rience
- CompÃ©tences
- Lettre de motivation

**IntÃ©gration:** Modal dans `JobsList` au clic sur "Postuler"

### 4. RecruiterApplicationsList (Liste Candidatures)

**Fichier:** `frontend/src/components/RecruiterApplicationsList.tsx`

**RÃ´le:** Le recruiter voit toutes les candidatures reÃ§ues sur ses offres.

**FonctionnalitÃ©s:**
- Voir dÃ©tails candidat (email, tÃ©lÃ©phone, CV)
- Accepter une candidature
- Rejeter une candidature
- Filtrer par statut

**Page:** `RecruiterApplicationsPage.tsx`

### 5. JobSeekerApplicationStatus (Statut Candidatures)

**Fichier:** `frontend/src/components/JobSeekerApplicationStatus.tsx`

**RÃ´le:** Le chercheur d'emploi voit l'Ã©tat de ses candidatures.

**FonctionnalitÃ©s:**
- Voir toutes candidatures
- Filtrer: Toutes / En attente / AcceptÃ©es / RejetÃ©es
- Notification du statut (acceptÃ©/rejetÃ©)

**Page:** `JobSeekerApplicationsPage.tsx`

---

## ðŸŽ¯ Services Frontend

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

## ðŸ” Permissions & SÃ©curitÃ©

### Recruiter peut:
- âœ… Soumettre des demandes d'offres d'emploi
- âœ… Voir ses propres demandes
- âœ… Voir les candidatures reÃ§ues
- âœ… Accepter/rejeter des candidatures
- âŒ Approuver des demandes (rÃ©servÃ© admin)
- âŒ Postuler Ã  des offres

### Admin peut:
- âœ… Voir toutes les demandes
- âœ… Approuver des demandes â†’ CrÃ©e offre publique
- âœ… Rejeter des demandes avec raison
- âœ… AccÃ¨s complet aux stats

### Job Seeker peut:
- âœ… Postuler aux offres approuvÃ©es
- âœ… Voir l'Ã©tat de ses candidatures
- âœ… Recevoir notifications (acceptÃ©/rejetÃ©)
- âŒ Soumettre des offres
- âŒ Voir d'autres candidatures

---

## ðŸ§ª Comment Tester le Workflow Complet

### Ã‰tape 1: CrÃ©er un Compte Recruiter
1. Se crÃ©er un compte avec `userType: 'recruiter'`
2. Aller dans "Trouver des Talents"
3. Cliquer sur "ðŸ“‹ Soumettre une Offre d'Emploi"
4. Remplir le formulaire et soumettre
5. âœ… Vous verrez: "Demande soumise avec succÃ¨s! En attente d'approbation."

### Ã‰tape 2: Approuver en tant qu'Admin
1. Se connecter avec un compte admin
2. Aller dans le panel admin (AdminJobRequestsPage)
3. Voir la demande dans "En Attente"
4. Cliquer "Approuver"
5. âœ… L'offre est maintenant crÃ©Ã©e et visible sur l'accueil

### Ã‰tape 3: Postuler en tant que Job Seeker
1. Se connecter avec un compte chercheur d'emploi
2. Aller sur la page d'accueil / section Jobs
3. Voir l'offre approuvÃ©e
4. Cliquer "Postuler"
5. Remplir le formulaire de candidature
6. âœ… Candidature envoyÃ©e

### Ã‰tape 4: GÃ©rer les Candidatures (Recruiter)
1. Retour au compte recruiter
2. Aller dans "Mes Candidatures ReÃ§ues" (RecruiterApplicationsPage)
3. Voir la candidature avec tous les dÃ©tails
4. Accepter ou rejeter
5. âœ… Le chercheur d'emploi verra la mise Ã  jour

### Ã‰tape 5: VÃ©rifier Statut (Job Seeker)
1. Retour au compte chercheur d'emploi
2. Aller dans "Mes Candidatures" (JobSeekerApplicationsPage)
3. Voir le statut: "AcceptÃ©e" ou "RejetÃ©e"
4. âœ… Notification visible

---

## ðŸ“ Fichiers CSS CrÃ©Ã©s

- `frontend/src/styles/forms.css` - Formulaires (demande + candidature)
- `frontend/src/styles/recruiter-applications.css` - Liste candidatures recruiter
- `frontend/src/styles/job-seeker-applications.css` - Statut candidatures chercheur
- `frontend/src/styles/admin-panel.css` - Panel administration

---

## ðŸ› ï¸ AmÃ©liorations Futures Possibles

1. **Notifications en temps rÃ©el** (WebSocket)
2. **Upload CV** (fichiers PDF)
3. **SystÃ¨me de messagerie** recruiter â†” candidat
4. **Notes privÃ©es** du recruiter sur candidatures
5. **Historique** des modifications
6. **Export Excel** des candidatures
7. **Emails automatiques** lors changement statut
8. **Dashboard analytics** pour recruiter/admin

---

## ðŸš¨ Points d'Attention

### Validation
- Tous les champs marquÃ©s `*` sont obligatoires
- Le tÃ©lÃ©phone est obligatoire pour candidature
- Une raison est requise pour rejeter une demande

### Ã‰tats
- JobOfferRequest: `pending` â†’ `approved` | `rejected`
- JobApplication: `applied` â†’ `accepted` | `rejected`
- JobOffer: `publicationStatus: approved` + `status: open`

### IntÃ©gritÃ©
- Une demande approuvÃ©e crÃ©e automatiquement une JobOffer
- Un candidat ne peut postuler qu'une fois par offre
- Seul le recruiter de l'offre peut voir/gÃ©rer les candidatures

---

## ðŸ“ž Support

Pour toute question sur l'implÃ©mentation:
- VÃ©rifier les logs backend: MongoDB + Redis
- VÃ©rifier la console frontend: Erreurs API
- Tester les endpoints avec Postman/Insomnia

**Serveurs:**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

---

**âœ… SystÃ¨me complet et opÃ©rationnel!**

