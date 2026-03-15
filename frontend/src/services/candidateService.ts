import { apiRequest } from './apiClient'
import type { Candidate } from '../data/candidates'

export interface DomainStatsResponse {
  totalCandidates: number
  domainCounts: Record<string, number>
}

interface DomainCandidatesResponse {
  data: Candidate[]
  total: number
}

export async function getDomainStats(): Promise<DomainStatsResponse | null> {
  const response = await apiRequest<DomainStatsResponse>('/candidates/domains')

  if (response.success && response.data) {
    return response.data
  }

  console.error('Domain stats error:', response.error)
  return null
}

export async function getCandidatesByDomain(domainId: string): Promise<Candidate[]> {
  const response = await apiRequest<DomainCandidatesResponse>(`/candidates/domain/${domainId}`)

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Candidates by domain error:', response.error)
  return []
}
