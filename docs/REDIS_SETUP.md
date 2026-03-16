# ðŸ”´ Redis Integration Guide

Redis a Ã©tÃ© intÃ©grÃ© Ã  JobConnect pour amÃ©liorer les performances avec caching, gestion de sessions, et rate limiting.

## ðŸ“‹ Table des matiÃ¨res
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Services Redis](#services-redis)
4. [Utilisation](#utilisation)
5. [Docker Setup](#docker-setup)

---

## ðŸš€ Installation

### Option 1: Installation locale (Windows)
```bash
# TÃ©lÃ©charger depuis https://github.com/microsoftarchive/redis/releases
# Ou installer via Chocolatey:
choco install redis-64
```

### Option 2: Docker (recommandÃ©)
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

## âš™ï¸ Configuration

### 1. Fichier `.env`
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 2. DÃ©marrer Redis localement
```bash
# Windows (cmd)
redis-server

# Ou avec Docker
docker-compose up -d redis
```

### 3. Tester la connexion
```bash
redis-cli ping
# RÃ©ponse: PONG
```

---

## ðŸ“¦ Services Redis disponibles

### 1. **CacheService** - Cache gÃ©nÃ©ral
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

// RÃ©cupÃ©rer du cache
const cached = await CandidateCacheService.getCandidatesByDomain('dev')

// Invalider cache
await CandidateCacheService.invalidateDomain('dev')
```

### 3. **SessionService** - Gestion sessions
```typescript
import { SessionService } from '@/services/session'

// CrÃ©er session
await SessionService.createSession(sessionId, {
  userId: '123',
  email: 'user@example.com',
  userType: 'recruiter'
})

// RÃ©cupÃ©rer session
const session = await SessionService.getSession(sessionId)

// Valider session
const isValid = await SessionService.isSessionValid(sessionId)
```

### 4. **RateLimitService** - Limitation requÃªtes
```typescript
import { RateLimitService } from '@/services/rateLimit'

// VÃ©rifier si requÃªte autorisÃ©e
const result = await RateLimitService.isAllowed(
  userId,
  { windowSizeSeconds: 60, maxRequests: 100 }
)

if (!result.allowed) {
  // Trop de requÃªtes
  res.status(429).json({ 
    error: 'Too many requests', 
    retryAfter: result.resetIn 
  })
}
```

---

## ðŸ’¡ Utilisation dans les routes

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

// Appliquer Ã  une route
app.post(
  '/search',
  rateLimitMiddleware({ windowSizeSeconds: 60, maxRequests: 30 }),
  async (req, res) => {
    // Handler
  }
)
```

---

## ðŸ³ Docker Setup

### DÃ©marrer les services
```bash
cd c:\Users\md\Documents\projets\FinalProject

# DÃ©marrer Redis + MongoDB
docker-compose up -d

# VÃ©rifier le status
docker-compose ps

# Voir les logs
docker-compose logs -f redis
docker-compose logs -f mongodb
```

### ArrÃªter les services
```bash
docker-compose down

# Ou tout supprimer (y compris volumes)
docker-compose down -v
```

### AccÃ©der Ã  Redis CLI via Docker
```bash
docker exec -it jobconnect_redis redis-cli
```

---

## ðŸ“Š Commandes Redis utiles

```bash
redis-cli

# VÃ©rifier connexion
> PING
PONG

# Lister toutes les clÃ©s
> KEYS *

# Voir une clÃ©
> GET key_name

# Voir le type
> TYPE key_name

# Voir TTL (temps avant expiration)
> TTL key_name

# Supprimer une clÃ©
> DEL key_name

# Vider toute la base
> FLUSHDB

# Statistiques
> INFO stats
```

---

## ðŸ“ˆ Performance avec Redis

### Avant Redis:
```
Recherche candidats par domaine:
- RequÃªte MongoDB: ~150ms
- RÃ©sultat: lent pour utilisateurs multiples
```

### AprÃ¨s Redis:
```
Recherche candidats par domaine:
- PremiÃ¨re requÃªte MongoDB + cache: ~150ms
- RequÃªtes suivantes du cache: ~1-5ms
- Gain: 30x plus rapide!
```

---

## âš ï¸ Gestion des erreurs

Redis est **optionnel**. Si Redis n'est pas disponible:
- Les services retournent `null` ou `true` gracieusement
- L'app continue Ã  fonctionner normalement (mais plus lent)
- Les donnÃ©es sont toujours en BD

```typescript
// Exemple dans CacheService
if (!redis) {
  console.log('Redis unavailable, falling back to database')
  return null // Retour gracieux
}
```

---

## ðŸ”§ Troubleshooting

### Erreur: "Redis connection refused"
```bash
# VÃ©rifier si Redis tourne
redis-cli ping

# Sinon dÃ©marrer Redis
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

### Session/Cache pas mis Ã  jour
```bash
# Vider le cache
redis-cli FLUSHDB

# Ou spÃ©cifiquement
redis-cli DEL "candidates:domain:dev"
```

---

## âœ… Checklist intÃ©gration Redis

- âœ… Redis npm package installÃ©
- âœ… Services crÃ©Ã©s (cache, session, rateLimit, candidateCache)
- âœ… Redis initialisÃ© dans server.ts
- âœ… Middleware rate limit crÃ©Ã©
- âœ… .env.example mis Ã  jour
- âœ… Docker compose configurÃ©
- âœ… Graceful shutdown implÃ©mentÃ©

**PrÃªt Ã  utiliser! ðŸš€**

