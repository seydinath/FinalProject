# 🔗 Guide d'Intégration du Backend - Frontend

## 📋 Vue d'ensemble

Votre frontend est maintenant **connecté au backend MongoDB**! Les services API ont été créés pour gérer:

✅ **Authentification** (`authService.ts`)
✅ **Offres d'emploi** (`jobOfferService.ts`)  
✅ **Requêtes HTTP générales** (`apiClient.ts`)

---

## 🚀 Démarrage Rapide

### **1. Démarrer les deux apps**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# ✅ MongoDB Connected: cluster0.tnbfvmi.mongodb.net
# 🚀 JobConnect API running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# ✅ http://localhost:5173
```

---

## 📂 Structure des Services

```
frontend/src/services/
├── apiClient.ts        # Client HTTP de base avec gestion d'erreurs
├── authService.ts      # Login, Register, Logout
├── jobOfferService.ts  # CRUD offres d'emploi
└── index.ts           # Export centralisé
```

---

## 💡 Utilisation des Services

### **Authentication Service**

```typescript
import { loginUser, registerUser, logoutUser } from '../services'

// ✅ Connexion
const result = await loginUser({
  email: 'user@example.com',
  password: 'SecurePass123'
})

if (result) {
  console.log('Connecté!', result.user)
  // Token auto-stocké dans localStorage
}

// ✅ Inscription
const newUser = await registerUser({
  email: 'new@example.com',
  password: 'SecurePass123',
  name: 'Jean Dupont',
  userType: 'job_seeker'
})

// ✅ Déconnexion
logoutUser() // Efface le token
```

### **Job Offers Service**

```typescript
import { getJobOffers, getJobOfferById, createJobOffer } from '../services'

// ✅ Récupérer toutes les offres
const offers = await getJobOffers({
  status: 'open',
  limit: 10
})

// ✅ Récupérer une offre
const offer = await getJobOfferById('offerId')

// ✅ Créer une offre (recruiter)
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

### **API Client (avancé)**

```typescript
import { apiRequest, setAuthToken, getAuthToken } from '../services'

// ✅ Requête GET
const data = await apiRequest('/some-endpoint', {
  method: 'GET'
})

// ✅ Requête POST avec token
const response = await apiRequest('/protected-endpoint', {
  method: 'POST',
  body: { key: 'value' },
  token: getAuthToken()
})

// ✅ Changer le token manuellement
setAuthToken('new_token_here')
```

---

## 🔐 Contexte d'Authentification

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

  // ✅ Utiliser l'état
  if (isLoading) return <div>Connexion en cours...</div>
  if (!isLoggedIn) return <div>Non connecté</div>

  return <div>Bienvenue {userEmail}</div>
}
```

---

## 🔑 Configuration

Le fichier `.env.local` configure l'URL du backend:

```env
VITE_API_URL=http://localhost:5000
```

**Pour la production:**
```env
VITE_API_URL=https://api.jobconnect.com
```

---

## ✨ Fonctionnalités Clés

### **1. Gestion Automatique du Token**

- Token stocké avant chaque requête
- Envoyé automatiquement en header `Authorization: Bearer <token>`
- Clair à la déconnexion

### **2. Gestion des Erreurs**

```typescript
const response = await apiRequest('/endpoint')

if (!response.success) {
  console.error(response.error) // Message d'erreur
}
```

### **3. Persistance de Connexion**

- Survit au rechargement de page
- Données utilisateur dans `localStorage`
- Token dans `localStorage`

---

## 🧪 Tester l'Intégration

### **Scénario 1: Connexion Admin**

1. Ouvrir http://localhost:5173
2. Cliquer sur "Se connecter"
3. Entrer:
   - Email: `legendino19@gmail.com`
   - Mot de passe: `DirtyDiana21022011`
4. Vous devriez être redirigé au dashboard admin

### **Scénario 2: Créer un Compte**

1. Cliquer sur "Inscrivez-vous"
2. Remplir le formulaire
3. Cliquer "Créer un compte"
4. Vous êtes connecté et redirigé au dashboard

### **Scénario 3: Récupérer les Offres**

```typescript
// Dans un composant
useEffect(() => {
  getJobOffers({ status: 'open' }).then(offers => {
    console.log('Offres:', offers)
  })
}, [])
```

---

## 🐛 Dépannage

**Erreur: "API Error"**
- Vérifiez que le backend tourne: `npm run dev` dans `backend/`
- Vérifiez `VITE_API_URL` dans `.env.local`
- Vérifiez la console du navegador (F12)

**Erreur: "Authorization failed"**
- Token expiré: nouvellement connecté
- Vérifiez que le token est stocké: `localStorage.getItem('authToken')`

**Erreur: "MongoDB Connection Error"**
→ Voir le guide MongoDB Atlas (whitelist IP, etc.)

---

## 📝 Prochaines Étapes

1. ✅ **Intégrer les appels API** dans les composants existants
2. ✅ **Récupérer les offres d'emploi** depuis le backend
3. ✅ **Synchroniser les applications** d'emploi
4. ✅ **Ajouter les notifications en temps réel** (WebSocket)

---

## 📌 Checklist Projet

- [x] Backend MongoDB connecté
- [x] Services API créés
- [x] AuthContext utilise le backend
- [x] AuthPage intégrée
- [ ] TalentSearchPage intégrée
- [ ] DashboardPage intégrée
- [ ] Synchronisation bidirectionnelle

---

**Tout fonctionne? 🎉 Passez à l'étape suivante !**
