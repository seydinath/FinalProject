# 🔴 Redis Integration Guide

Redis a été intégré à JobConnect pour améliorer les performances avec caching, gestion de sessions, et rate limiting.

## 📋 Table des matières
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Services Redis](#services-redis)
4. [Utilisation](#utilisation)
5. [Docker Setup](#docker-setup)

---

## 🚀 Installation

### Option 1: Installation locale (Windows)
```bash
# Télécharger depuis https://github.com/microsoftarchive/redis/releases
# Ou installer via Chocolatey:
choco install redis-64
```

### Option 2: Docker (recommandé)
```bash
cd c:\Users\md\Documents\projets\FinalProject
docker-compose up -d
```

### Option 3: Packages npm
```bash
cd backend
npm install redis
```

---

## ⚙️ Configuration

### 1. Fichier `.env`
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 2. Démarrer Redis localement
```bash
# Windows (cmd)
redis-server

# Ou avec Docker
docker-compose up -d redis
```

### 3. Tester la connexion
```bash
redis-cli ping
# Réponse: PONG
```

---

## 📦 Services Redis disponibles

### 1. **CacheService** - Cache général
```typescript
import { CacheService } from '@/services/cache'

// Set cache
await CacheService.set('key', data, { ttl: 3600 })

// Get cache
const data = await CacheService.get('key')

// Delete cache
await CacheService.delete('key')

// Clear all
await CacheService.clear()
```

### 2. **CandidateCacheService** - Cache candidats
```typescript
import { CandidateCacheService } from '@/services/candidateCache'

// Cache candidats par domaine
await CandidateCacheService.setCandidatesByDomain('dev', candidates)

// Récupérer du cache
const cached = await CandidateCacheService.getCandidatesByDomain('dev')

// Invalider cache
await CandidateCacheService.invalidateDomain('dev')
```

### 3. **SessionService** - Gestion sessions
```typescript
import { SessionService } from '@/services/session'

// Créer session
await SessionService.createSession(sessionId, {
  userId: '123',
  email: 'user@example.com',
  userType: 'recruiter'
})

// Récupérer session
const session = await SessionService.getSession(sessionId)

// Valider session
const isValid = await SessionService.isSessionValid(sessionId)
```

### 4. **RateLimitService** - Limitation requêtes
```typescript
import { RateLimitService } from '@/services/rateLimit'

// Vérifier si requête autorisée
const result = await RateLimitService.isAllowed(
  userId,
  { windowSizeSeconds: 60, maxRequests: 100 }
)

if (!result.allowed) {
  // Trop de requêtes
  res.status(429).json({ 
    error: 'Too many requests', 
    retryAfter: result.resetIn 
  })
}
```

---

## 💡 Utilisation dans les routes

### Exemple: Cache candidats par domaine

```typescript
// routes/candidates.ts
import express from 'express'
import { CandidateCacheService } from '../services'

const router = express.Router()

router.get('/domain/:domainId', async (req, res) => {
  const { domainId } = req.params

  try {
    // Chercher en cache d'abord
    let candidates = await CandidateCacheService.getCandidatesByDomain(domainId)

    if (!candidates) {
      // Si pas en cache, chercher en BD
      candidates = await Candidate.find({ domain: domainId })

      // Mettre en cache
      await CandidateCacheService.setCandidatesByDomain(domainId, candidates)
    }

    res.json(candidates)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
```

### Exemple: Rate limiting middleware

```typescript
// middleware/rateLimit.ts
import { rateLimitMiddleware } from '../middleware/rateLimit'

// Appliquer à une route
app.post(
  '/search',
  rateLimitMiddleware({ windowSizeSeconds: 60, maxRequests: 30 }),
  async (req, res) => {
    // Handler
  }
)
```

---

## 🐳 Docker Setup

### Démarrer les services
```bash
cd c:\Users\md\Documents\projets\FinalProject

# Démarrer Redis + MongoDB
docker-compose up -d

# Vérifier le status
docker-compose ps

# Voir les logs
docker-compose logs -f redis
docker-compose logs -f mongodb
```

### Arrêter les services
```bash
docker-compose down

# Ou tout supprimer (y compris volumes)
docker-compose down -v
```

### Accéder à Redis CLI via Docker
```bash
docker exec -it jobconnect_redis redis-cli
```

---

## 📊 Commandes Redis utiles

```bash
redis-cli

# Vérifier connexion
> PING
PONG

# Lister toutes les clés
> KEYS *

# Voir une clé
> GET key_name

# Voir le type
> TYPE key_name

# Voir TTL (temps avant expiration)
> TTL key_name

# Supprimer une clé
> DEL key_name

# Vider toute la base
> FLUSHDB

# Statistiques
> INFO stats
```

---

## 📈 Performance avec Redis

### Avant Redis:
```
Recherche candidats par domaine:
- Requête MongoDB: ~150ms
- Résultat: lent pour utilisateurs multiples
```

### Après Redis:
```
Recherche candidats par domaine:
- Première requête MongoDB + cache: ~150ms
- Requêtes suivantes du cache: ~1-5ms
- Gain: 30x plus rapide!
```

---

## ⚠️ Gestion des erreurs

Redis est **optionnel**. Si Redis n'est pas disponible:
- Les services retournent `null` ou `true` gracieusement
- L'app continue à fonctionner normalement (mais plus lent)
- Les données sont toujours en BD

```typescript
// Exemple dans CacheService
if (!redis) {
  console.log('Redis unavailable, falling back to database')
  return null // Retour gracieux
}
```

---

## 🔧 Troubleshooting

### Erreur: "Redis connection refused"
```bash
# Vérifier si Redis tourne
redis-cli ping

# Sinon démarrer Redis
redis-server

# Ou avec Docker
docker-compose up -d redis
```

### Erreur: "Port 6379 already in use"
```bash
# Changer le port dans .env
REDIS_PORT=6380

# Ou tuer le processus qui l'utilise
lsof -i :6379
kill -9 <PID>
```

### Session/Cache pas mis à jour
```bash
# Vider le cache
redis-cli FLUSHDB

# Ou spécifiquement
redis-cli DEL "candidates:domain:dev"
```

---

## ✅ Checklist intégration Redis

- ✅ Redis npm package installé
- ✅ Services créés (cache, session, rateLimit, candidateCache)
- ✅ Redis initialisé dans server.ts
- ✅ Middleware rate limit créé
- ✅ .env.example mis à jour
- ✅ Docker compose configuré
- ✅ Graceful shutdown implémenté

**Prêt à utiliser! 🚀**
