/**
 * Job Offers Service
 * Gère les appels API pour les offres d'emploi
 */

import { apiRequest } from './apiClient'

export interface JobOffer {
  _id: string
  title: string
  description: string
  companyName?: string
  recruiter: {
    _id: string
    name: string
    email: string
  }
  positionsAvailable: number
  numberOfPositions?: number
  location?: string
  requiredSkills: string[]
  salary?: number
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  status: 'open' | 'closed' | 'filled'
  publicationStatus: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  approvedBy?: {
    _id: string
    name: string
    email: string
  }
}

export interface CreateJobOfferPayload {
  title: string
  description: string
  positionsAvailable: number
  location?: string
  requiredSkills: string[]
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
}

export interface Application {
  _id: string
  jobOffer: string
  candidate: {
    _id: string
    name: string
    email: string
    profile?: any
    skills?: string[]
  }
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  message?: string
  appliedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

/**
 * Récupérer toutes les offres d'emploi publiées (public)
 */
export async function getJobOffers(
  filters?: {
    limit?: number
    offset?: number
    location?: string
    skills?: string[]
  }
): Promise<{ data: JobOffer[], total: number, offset: number, limit: number }> {
  const queryParams = new URLSearchParams()
  
  if (filters?.location) {
    queryParams.append('location', filters.location)
  }
  if (filters?.skills && filters.skills.length > 0) {
    queryParams.append('skills', filters.skills.join(','))
  }
  if (filters?.limit) {
    queryParams.append('limit', filters.limit.toString())
  }
  if (filters?.offset) {
    queryParams.append('offset', filters.offset.toString())
  }

  const endpoint = queryParams.toString() 
    ? `/job-offers?${queryParams.toString()}`
    : '/job-offers'

  const response = await apiRequest<any>(endpoint, {
    method: 'GET'
  })

  if (response.success && response.data) {
    return response.data
  }
  
  return { data: [], total: 0, offset: 0, limit: 50 }
}

/**
 * Récupérer une offre d'emploi par ID
 */
export async function getJobOfferById(id: string): Promise<JobOffer | null> {
  const response = await apiRequest<JobOffer>(`/job-offers/${id}`, {
    method: 'GET'
  })

  return response.success && response.data ? response.data : null
}

/**
 * Récupérer mes offres d'emploi (recruiter only)
 */
export async function getMyJobOffers(): Promise<JobOffer[]> {
  const response = await apiRequest<JobOffer[]>('/job-offers/recruiter/my-offers', {
    method: 'GET'
  })

  return response.success && response.data ? response.data : []
}

/**
 * Créer une nouvelle offre d'emploi
 */
export async function createJobOffer(
  payload: CreateJobOfferPayload
): Promise<JobOffer | null> {
  const response = await apiRequest<{ jobOffer: JobOffer }>('/job-offers', {
    method: 'POST',
    body: payload
  })

  if (response.success && response.data?.jobOffer) {
    return response.data.jobOffer
  }

  console.error('Create job offer error:', response.error)
  return null
}

/**
 * Mettre à jour une offre d'emploi
 */
export async function updateJobOffer(
  id: string,
  payload: Partial<CreateJobOfferPayload>
): Promise<JobOffer | null> {
  const response = await apiRequest<{ jobOffer: JobOffer }>(`/job-offers/${id}`, {
    method: 'PUT',
    body: payload
  })

  if (response.success && response.data?.jobOffer) {
    return response.data.jobOffer
  }

  console.error('Update job offer error:', response.error)
  return null
}

/**
 * Supprimer une offre d'emploi
 */
export async function deleteJobOffer(id: string): Promise<boolean> {
  const response = await apiRequest(`/job-offers/${id}`, {
    method: 'DELETE'
  })

  return response.success
}

// ============ ADMIN ENDPOINTS ============

/**
 * ADMIN: Récupérer les offres en attente d'approbation
 */
export async function getPendingJobOffers(): Promise<JobOffer[]> {
  const response = await apiRequest<JobOffer[]>('/job-offers/admin/pending', {
    method: 'GET'
  })

  return response.success && response.data ? response.data : []
}

/**
 * ADMIN: Récupérer TOUTES les offres (any status)
 */
export async function getAllJobOffersAdmin(
  filters?: {
    publicationStatus?: 'pending' | 'approved' | 'rejected'
    status?: 'open' | 'closed' | 'filled'
  }
): Promise<JobOffer[]> {
  const queryParams = new URLSearchParams()
  
  if (filters?.publicationStatus) {
    queryParams.append('publicationStatus', filters.publicationStatus)
  }
  if (filters?.status) {
    queryParams.append('status', filters.status)
  }

  const endpoint = queryParams.toString() 
    ? `/job-offers/admin/all?${queryParams.toString()}`
    : '/job-offers/admin/all'

  const response = await apiRequest<JobOffer[]>(endpoint, {
    method: 'GET'
  })

  return response.success && response.data ? response.data : []
}

/**
 * ADMIN: Approuver une offre d'emploi
 */
export async function approveJobOffer(id: string): Promise<JobOffer | null> {
  const response = await apiRequest<{ jobOffer: JobOffer }>(`/job-offers/${id}/approve`, {
    method: 'PATCH',
    body: {}
  })

  if (response.success && response.data?.jobOffer) {
    return response.data.jobOffer
  }

  console.error('Approve job offer error:', response.error)
  return null
}

/**
 * ADMIN: Rejeter une offre d'emploi
 */
export async function rejectJobOffer(id: string, reason: string): Promise<JobOffer | null> {
  const response = await apiRequest<{ jobOffer: JobOffer }>(`/job-offers/${id}/reject`, {
    method: 'PATCH',
    body: { reason }
  })

  if (response.success && response.data?.jobOffer) {
    return response.data.jobOffer
  }

  console.error('Reject job offer error:', response.error)
  return null
}

// ============ APPLICATION ENDPOINTS ============

/**
 * Postuler à une offre d'emploi
 */
export async function applyForJob(id: string, message: string): Promise<Application | null> {
  const response = await apiRequest<{ application: Application }>(`/job-offers/${id}/apply`, {
    method: 'POST',
    body: { message }
  })

  if (response.success && response.data?.application) {
    return response.data.application
  }

  console.error('Apply for job error:', response.error)
  return null
}

/**
 * Récupérer les candidatures pour une offre (recruiter only)
 */
export async function getApplicationsForJob(jobOfferId: string): Promise<Application[]> {
  const response = await apiRequest<Application[]>(`/job-offers/${jobOfferId}/applications`, {
    method: 'GET'
  })

  return response.success && response.data ? response.data : []
}

/**
 * Mettre à jour le statut d'une candidature (recruiter only)
 */
export async function updateApplicationStatus(
  jobOfferId: string,
  applicationId: string,
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
): Promise<Application | null> {
  const response = await apiRequest<{ application: Application }>(
    `/job-offers/${jobOfferId}/applications/${applicationId}`,
    {
      method: 'PATCH',
      body: { status }
    }
  )

  if (response.success && response.data?.application) {
    return response.data.application
  }

  console.error('Update application error:', response.error)
  return null
}

export default {
  getJobOffers,
  getJobOfferById,
  getMyJobOffers,
  createJobOffer,
  updateJobOffer,
  deleteJobOffer,
  getPendingJobOffers,
  getAllJobOffersAdmin,
  approveJobOffer,
  rejectJobOffer,
  applyForJob,
  getApplicationsForJob,
  updateApplicationStatus
}
