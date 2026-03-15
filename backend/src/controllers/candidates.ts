import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { CandidateCacheService, CandidateCacheData } from '../services/candidateCache'
import { RateLimitService } from '../services/rateLimit'
import { User } from '../models/User'

type Availability = 'immediate' | '2-weeks' | '1-month' | 'negotiable'

type DomainConfig = {
  id: string
  keywords: string[]
  fallbackTitleFr: string
  fallbackTitleEn: string
}

type CandidateProfile = {
  headline?: string
  bio?: string
  phone?: string
  location?: string
  skills?: string[]
  yearsOfExperience?: number
  expectations?: string
  languages?: string[]
  availability?: Availability
  desiredDomain?: string
  cvUrl?: string
}

const DOMAIN_CONFIG: DomainConfig[] = [
  {
    id: 'dev',
    keywords: ['react', 'node', 'typescript', 'javascript', 'develop', 'frontend', 'backend', 'fullstack', 'web'],
    fallbackTitleFr: 'Developpeur Web',
    fallbackTitleEn: 'Web Developer'
  },
  {
    id: 'design',
    keywords: ['design', 'ux', 'ui', 'figma', 'adobe', 'graphique', 'branding'],
    fallbackTitleFr: 'Designer UI/UX',
    fallbackTitleEn: 'UI/UX Designer'
  },
  {
    id: 'marketing',
    keywords: ['marketing', 'seo', 'social media', 'content', 'growth', 'campagne', 'communication'],
    fallbackTitleFr: 'Specialiste Marketing Digital',
    fallbackTitleEn: 'Digital Marketing Specialist'
  },
  {
    id: 'data',
    keywords: ['data', 'sql', 'python', 'power bi', 'analytics', 'analyse'],
    fallbackTitleFr: 'Analyste Data',
    fallbackTitleEn: 'Data Analyst'
  },
  {
    id: 'business',
    keywords: ['project manager', 'consultant', 'business', 'gestion', 'operations', 'management'],
    fallbackTitleFr: 'Consultant Affaires',
    fallbackTitleEn: 'Business Consultant'
  },
  {
    id: 'sales',
    keywords: ['sales', 'vente', 'commercial', 'business development', 'prospection'],
    fallbackTitleFr: 'Commercial',
    fallbackTitleEn: 'Sales Representative'
  },
  {
    id: 'masonry',
    keywords: ['macon', 'masonry', 'construction', 'batiment', 'chantier', 'carrelage', 'coffrage'],
    fallbackTitleFr: 'Macon',
    fallbackTitleEn: 'Mason'
  },
  {
    id: 'housekeeping',
    keywords: ['aide menagere', 'menage', 'housekeeping', 'nettoyage', 'entretien', 'domestique'],
    fallbackTitleFr: 'Aide Menagere',
    fallbackTitleEn: 'Housekeeper'
  },
  {
    id: 'restaurant',
    keywords: ['restaurant', 'serveur', 'serveuse', 'cuisine', 'plonge', 'commis', 'chef de rang'],
    fallbackTitleFr: 'Aide Restaurant',
    fallbackTitleEn: 'Restaurant Assistant'
  }
]

function pickDomainFromProfile(profile: CandidateProfile): string {
  if (profile.desiredDomain && DOMAIN_CONFIG.some((domain) => domain.id === profile.desiredDomain)) {
    return profile.desiredDomain
  }

  const searchable = [
    profile.headline || '',
    profile.bio || '',
    ...(profile.skills || [])
  ]
    .join(' ')
    .toLowerCase()

  let bestDomain = 'other'
  let bestScore = 0

  for (const domain of DOMAIN_CONFIG) {
    const score = domain.keywords.reduce((acc, keyword) => {
      return searchable.includes(keyword) ? acc + 1 : acc
    }, 0)

    if (score > bestScore) {
      bestScore = score
      bestDomain = domain.id
    }
  }

  return bestDomain
}

function fallbackTitle(domainId: string, language: 'fr' | 'en' = 'fr'): string {
  const domain = DOMAIN_CONFIG.find((d) => d.id === domainId)
  if (!domain) {
    return language === 'fr' ? 'Candidat' : 'Candidate'
  }

  return language === 'fr' ? domain.fallbackTitleFr : domain.fallbackTitleEn
}

function mapUserToCandidate(user: any): CandidateCacheData {
  const profile = user.profile || {}
  const domain = pickDomainFromProfile(profile)
  return {
    id: String(user._id),
    name: user.name || 'Candidate',
    domain,
    title: profile.headline || fallbackTitle(domain, 'fr'),
    yearsOfExperience: profile.yearsOfExperience || 0,
    skills: profile.skills || [],
    location: profile.location || 'Senegal',
    availability: (profile.availability || 'negotiable') as Availability
  }
}

function normalizeSkills(value: unknown): string[] {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function getDomains(_req: Request, res: Response) {
  try {
    const users = await User.find({ userType: 'job_seeker' }).select('profile')

    const counts: Record<string, number> = {}
    DOMAIN_CONFIG.forEach((domain) => {
      counts[domain.id] = 0
    })

    for (const user of users) {
      const domainId = pickDomainFromProfile(user.profile || {})
      if (counts[domainId] !== undefined) {
        counts[domainId] += 1
      }
    }

    res.json({
      totalCandidates: users.length,
      domainCounts: counts
    })
  } catch (error) {
    console.error('Get domain stats error:', error)
    res.status(500).json({ error: 'Failed to fetch domain stats' })
  }
}

/**
 * Example: Get candidates by domain with caching
 */
export async function getCandidatesByDomain(req: Request, res: Response) {
  try {
    const { domainId } = req.params

    // Apply rate limiting
    const userId = (req as any).user?.id || req.ip || 'anonymous'
    const rateLimitResult = await RateLimitService.isAllowed(userId, {
      windowSizeSeconds: 60,
      maxRequests: 100
    })

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: rateLimitResult.resetIn
      })
    }

    // Try to get from cache first
    let candidates = await CandidateCacheService.getCandidatesByDomain(domainId)

    if (candidates) {
      // Return from cache with a header indicating it's cached
      res.setHeader('X-Cache', 'HIT')
      return res.json({
        source: 'cache',
        data: candidates,
        count: candidates.length
      })
    }

    // If not in cache, fetch from database
    const users = await User.find({ userType: 'job_seeker' }).select('name profile')
    const fetchedCandidates = users
      .map((user) => mapUserToCandidate(user))
      .filter((candidate) => candidate.domain === domainId)

    // Cache the results
    if (fetchedCandidates.length > 0) {
      await CandidateCacheService.setCandidatesByDomain(domainId, fetchedCandidates)
    }

    // Return from database with cache header
    res.setHeader('X-Cache', 'MISS')
    res.json({
      source: 'database',
      data: fetchedCandidates,
      count: fetchedCandidates.length
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    res.status(500).json({ error: 'Failed to fetch candidates' })
  }
}

/**
 * Example: Get single candidate with caching
 */
export async function getCandidate(req: Request, res: Response) {
  try {
    const { candidateId } = req.params

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ error: 'Invalid candidate id' })
    }

    // Try cache first
    let candidate = await CandidateCacheService.getCandidate(candidateId)

    if (candidate) {
      res.setHeader('X-Cache', 'HIT')
      return res.json({
        source: 'cache',
        data: candidate
      })
    }

    // Fetch from database
    const user = await User.findOne({ _id: candidateId, userType: 'job_seeker' }).select('name profile')
    if (!user) {
      return res.status(404).json({ error: 'Candidate not found' })
    }

    const fetchedCandidate = mapUserToCandidate(user)

    // Cache it
    await CandidateCacheService.setCandidate(fetchedCandidate)

    res.setHeader('X-Cache', 'MISS')
    res.json({
      source: 'database',
      data: fetchedCandidate
    })
  } catch (error) {
    console.error('Error fetching candidate:', error)
    res.status(500).json({ error: 'Failed to fetch candidate' })
  }
}

/**
 * Example: Update candidate (invalidate cache)
 */
export async function updateCandidate(req: Request, res: Response) {
  try {
    const { candidateId } = req.params
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ error: 'Invalid candidate id' })
    }

    const {
      title,
      location,
      yearsOfExperience,
      skills,
      availability,
      bio,
      desiredDomain
    } = req.body as {
      title?: string
      location?: string
      yearsOfExperience?: number
      skills?: string[] | string
      availability?: Availability
      bio?: string
      desiredDomain?: string
    }

    const current = await User.findOne({ _id: candidateId, userType: 'job_seeker' }).select('profile name')
    if (!current) {
      return res.status(404).json({ error: 'Candidate not found' })
    }

    const profile = (current.profile || {}) as CandidateProfile
    const nextProfile = {
      ...profile,
      headline: title ?? profile.headline,
      location: location ?? profile.location,
      yearsOfExperience: yearsOfExperience ?? profile.yearsOfExperience,
      skills: skills ? normalizeSkills(skills) : (profile.skills || []),
      availability: availability ?? profile.availability,
      bio: bio ?? profile.bio,
      desiredDomain: desiredDomain ?? profile.desiredDomain
    }

    await User.updateOne({ _id: candidateId }, { $set: { profile: nextProfile } })

    const updatedCandidate = mapUserToCandidate({
      _id: candidateId,
      name: current.name,
      profile: nextProfile
    })

    // Invalidate cache
    await CandidateCacheService.invalidateCandidate(candidateId)
    const nextDomain = pickDomainFromProfile(nextProfile)
    await CandidateCacheService.invalidateDomain(nextDomain)
    await CandidateCacheService.setCandidate(updatedCandidate)

    res.json({
      message: 'Candidate updated successfully',
      data: updatedCandidate
    })
  } catch (error) {
    console.error('Error updating candidate:', error)
    res.status(500).json({ error: 'Failed to update candidate' })
  }
}

/**
 * Example: Search candidates with caching
 */
export async function searchCandidates(req: Request, res: Response) {
  try {
    const { domain, skills, location, minYearsExperience } = req.query
    const query = `${String(domain || '')}-${String(skills || '')}-${String(location || '')}-${String(minYearsExperience || '')}`

    // Try to get cached search results
    const cached = await CandidateCacheService.getSearchResults(query)

    if (cached) {
      res.setHeader('X-Cache', 'HIT')
      return res.json({
        source: 'cache',
        data: cached,
        count: cached.length
      })
    }

    // Perform search
    const users = await User.find({ userType: 'job_seeker' }).select('name profile')
    const parsedSkills = normalizeSkills(skills)
    const minYears = Number(minYearsExperience || 0)
    const normalizedDomain = domain ? String(domain).toLowerCase() : ''
    const normalizedLocation = location ? String(location).toLowerCase() : ''

    const results: CandidateCacheData[] = users
      .map((user) => mapUserToCandidate(user))
      .filter((candidate) => {
        if (normalizedDomain && candidate.domain !== normalizedDomain) {
          return false
        }

        if (parsedSkills.length > 0) {
          const lowerSkills = candidate.skills.map((skill) => skill.toLowerCase())
          const hasRequestedSkill = parsedSkills.some((skill) => lowerSkills.includes(skill.toLowerCase()))
          if (!hasRequestedSkill) {
            return false
          }
        }

        if (normalizedLocation && !candidate.location.toLowerCase().includes(normalizedLocation)) {
          return false
        }

        if (minYears > 0 && candidate.yearsOfExperience < minYears) {
          return false
        }

        return true
      })

    // Cache results (shorter TTL for search)
    await CandidateCacheService.setSearchResults(query, results)

    res.setHeader('X-Cache', 'MISS')
    res.json({
      source: 'database',
      data: results,
      count: results.length
    })
  } catch (error) {
    console.error('Error searching candidates:', error)
    res.status(500).json({ error: 'Search failed' })
  }
}
