# ðŸ”— Guide d'IntÃ©gration du Backend - Frontend

## ðŸ“‹ Vue d'ensemble

Votre frontend est maintenant **connectÃ© au backend MongoDB**! Les services API ont Ã©tÃ© crÃ©Ã©s pour gÃ©rer:

âœ… **Authentification** (`authService.ts`)
âœ… **Offres d'emploi** (`jobOfferService.ts`)  
âœ… **RequÃªtes HTTP gÃ©nÃ©rales** (`apiClient.ts`)

---

## ðŸš€ DÃ©marrage Rapide

### **1. DÃ©marrer les deux apps**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# âœ… MongoDB Connected: cluster0.tnbfvmi.mongodb.net
# ðŸš€ JobConnect API running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# âœ… http://localhost:5173
```

---

## ðŸ“‚ Structure des Services

```
frontend/src/services/
â”œâ”€â”€ apiClient.ts        # Client HTTP de base avec gestion d'erreurs
â”œâ”€â”€ authService.ts      # Login, Register, Logout
â”œâ”€â”€ jobOfferService.ts  # CRUD offres d'emploi
â””â”€â”€ index.ts           # Export centralisÃ©
```

---

## ðŸ’¡ Utilisation des Services

### **Authentication Service**

```typescript
import { loginUser, registerUser, logoutUser } from '../services'

// âœ… Connexion
const result = await loginUser({
  email: 'user@example.com',
  password: 'SecurePass123'
})

if (result) {
  console.log('ConnectÃ©!', result.user)
  // Token auto-stockÃ© dans localStorage
}

// âœ… Inscription
const newUser = await registerUser({
  email: 'new@example.com',
  password: 'SecurePass123',
  name: 'Jean Dupont',
  userType: 'job_seeker'
})

// âœ… DÃ©connexion
logoutUser() // Efface le token
```

### **Job Offers Service**

```typescript
import { getJobOffers, getJobOfferById, createJobOffer } from '../services'

// âœ… RÃ©cupÃ©rer toutes les offres
const offers = await getJobOffers({
  status: 'open',
  limit: 10
})

// âœ… RÃ©cupÃ©rer une offre
const offer = await getJobOfferById('offerId')

// âœ… CrÃ©er une offre (recruiter)
const newOffer = await createJobOffer({
  title: 'React Developer',
  description: 'Looking for...',
  positionsAvailable: 2,
  requiredSkills: ['React', 'TypeScript'],
  salaryRange: {
    min: 45000,
    max: 60000,
    currency: 'EUR'
  }
})
```

### **API Client (avancÃ©)**

```typescript
import { apiRequest, setAuthToken, getAuthToken } from '../services'

// âœ… RequÃªte GET
const data = await apiRequest('/some-endpoint', {
  method: 'GET'
})

// âœ… RequÃªte POST avec token
const response = await apiRequest('/protected-endpoint', {
  method: 'POST',
  body: { key: 'value' },
  token: getAuthToken()
})

// âœ… Changer le token manuellement
setAuthToken('new_token_here')
```

---

## ðŸ” Contexte d'Authentification

Le `AuthContext` utilise maintenant les services:

```typescript
import { useAuth } from '../utils/AuthContext'

function MyComponent() {
  const { 
    isLoggedIn,      // boolean
    userType,        // 'job_seeker' | 'recruiter' | 'admin'
    userEmail,       // string | null
    isAdmin,         // boolean
    isLoading,       // boolean (vraiment utile!)
    login,           // async function
    loginAsAdmin,    // async function
    logout           // function
  } = useAuth()

  // âœ… Utiliser l'Ã©tat
  if (isLoading) return <div>Connexion en cours...</div>
  if (!isLoggedIn) return <div>Non connectÃ©</div>

  return <div>Bienvenue {userEmail}</div>
}
```

---

## ðŸ”‘ Configuration

Le fichier `.env.local` configure l'URL du backend:

```env
VITE_API_URL=http://localhost:5000
```

**Pour la production:**
```env
VITE_API_URL=https://api.jobconnect.com
```

---

## âœ¨ FonctionnalitÃ©s ClÃ©s

### **1. Gestion Automatique du Token**

- Token stockÃ© avant chaque requÃªte
- EnvoyÃ© automatiquement en header `Authorization: Bearer <token>`
- Clair Ã  la dÃ©connexion

### **2. Gestion des Erreurs**

```typescript
const response = await apiRequest('/endpoint')

if (!response.success) {
  console.error(response.error) // Message d'erreur
}
```

### **3. Persistance de Connexion**

- Survit au rechargement de page
- DonnÃ©es utilisateur dans `localStorage`
- Token dans `localStorage`

---

## ðŸ§ª Tester l'IntÃ©gration

### **ScÃ©nario 1: Connexion Admin**

1. Ouvrir http://localhost:5173
2. Cliquer sur "Se connecter"
3. Entrer:
   - Email: `legendino19@gmail.com`
   - Mot de passe: `DirtyDiana21022011`
4. Vous devriez Ãªtre redirigÃ© au dashboard admin

### **ScÃ©nario 2: CrÃ©er un Compte**

1. Cliquer sur "Inscrivez-vous"
2. Remplir le formulaire
3. Cliquer "CrÃ©er un compte"
4. Vous Ãªtes connectÃ© et redirigÃ© au dashboard

### **ScÃ©nario 3: RÃ©cupÃ©rer les Offres**

```typescript
// Dans un composant
useEffect(() => {
  getJobOffers({ status: 'open' }).then(offers => {
    console.log('Offres:', offers)
  })
}, [])
```

---

## ðŸ› DÃ©pannage

**Erreur: "API Error"**
- VÃ©rifiez que le backend tourne: `npm run dev` dans `backend/`
- VÃ©rifiez `VITE_API_URL` dans `.env.local`
- VÃ©rifiez la console du navegador (F12)

**Erreur: "Authorization failed"**
- Token expirÃ©: nouvellement connectÃ©
- VÃ©rifiez que le token est stockÃ©: `localStorage.getItem('authToken')`

**Erreur: "MongoDB Connection Error"**
â†’ Voir le guide MongoDB Atlas (whitelist IP, etc.)

---

## ðŸ“ Prochaines Ã‰tapes

1. âœ… **IntÃ©grer les appels API** dans les composants existants
2. âœ… **RÃ©cupÃ©rer les offres d'emploi** depuis le backend
3. âœ… **Synchroniser les applications** d'emploi
4. âœ… **Ajouter les notifications en temps rÃ©el** (WebSocket)

---

## ðŸ“Œ Checklist Projet

- [x] Backend MongoDB connectÃ©
- [x] Services API crÃ©Ã©s
- [x] AuthContext utilise le backend
- [x] AuthPage intÃ©grÃ©e
- [ ] TalentSearchPage intÃ©grÃ©e
- [ ] DashboardPage intÃ©grÃ©e
- [ ] Synchronisation bidirectionnelle

---

**Tout fonctionne? ðŸŽ‰ Passez Ã  l'Ã©tape suivante !**

