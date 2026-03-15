import { CacheService } from './cache'

export interface CandidateCacheData {
  id: string
  name: string
  domain: string
  title: string
  yearsOfExperience: number
  skills: string[]
  location: string
  availability: string
}

export class CandidateCacheService {
  // Cache key prefixes
  private static readonly DOMAIN_PREFIX = 'candidates:domain'
  private static readonly USER_PREFIX = 'candidate:user'
  private static readonly SEARCH_PREFIX = 'candidates:search'

  /**
   * Cache candidates by domain
   */
  static getCandidatesByDomainKey(domainId: string): string {
    return `${this.DOMAIN_PREFIX}:${domainId}`
  }

  /**
   * Cache single candidate
   */
  static getCandidateKey(candidateId: string): string {
    return `${this.USER_PREFIX}:${candidateId}`
  }

  /**
   * Cache search results
   */
  static getSearchKey(query: string): string {
    return `${this.SEARCH_PREFIX}:${query}`
  }

  /**
   * Set candidates by domain in cache
   */
  static async setCandidatesByDomain(
    domainId: string,
    candidates: CandidateCacheData[]
  ): Promise<void> {
    const key = this.getCandidatesByDomainKey(domainId)
    await CacheService.set(key, candidates, { ttl: 3600 }) // 1 hour
  }

  /**
   * Get candidates by domain from cache
   */
  static async getCandidatesByDomain(domainId: string): Promise<CandidateCacheData[] | null> {
    const key = this.getCandidatesByDomainKey(domainId)
    return CacheService.get<CandidateCacheData[]>(key)
  }

  /**
   * Set single candidate in cache
   */
  static async setCandidate(candidate: CandidateCacheData): Promise<void> {
    const key = this.getCandidateKey(candidate.id)
    await CacheService.set(key, candidate, { ttl: 3600 }) // 1 hour
  }

  /**
   * Get single candidate from cache
   */
  static async getCandidate(candidateId: string): Promise<CandidateCacheData | null> {
    const key = this.getCandidateKey(candidateId)
    return CacheService.get<CandidateCacheData>(key)
  }

  /**
   * Invalidate domain cache
   */
  static async invalidateDomain(domainId: string): Promise<void> {
    const key = this.getCandidatesByDomainKey(domainId)
    await CacheService.delete(key)
  }

  /**
   * Invalidate candidate cache
   */
  static async invalidateCandidate(candidateId: string): Promise<void> {
    const key = this.getCandidateKey(candidateId)
    await CacheService.delete(key)
  }

  /**
   * Invalidate all domain caches (when candidates change)
   */
  static async invalidateAllDomains(domains: string[]): Promise<void> {
    const keys = domains.map(domain => this.getCandidatesByDomainKey(domain))
    await CacheService.deleteMany(keys)
  }

  /**
   * Cache search results
   */
  static async setSearchResults(
    query: string,
    results: CandidateCacheData[]
  ): Promise<void> {
    const key = this.getSearchKey(query)
    await CacheService.set(key, results, { ttl: 1800 }) // 30 minutes
  }

  /**
   * Get cached search results
   */
  static async getSearchResults(query: string): Promise<CandidateCacheData[] | null> {
    const key = this.getSearchKey(query)
    return CacheService.get<CandidateCacheData[]>(key)
  }
}
