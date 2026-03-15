import { apiRequest } from './apiClient'

export interface JobApplicationData {
  candidatePhone?: string
  candidateLocation?: string
  candidateExperience?: number
  candidateSkills?: string[]
  candidateCoverLetter?: string
}

export interface JobApplicationResponse extends JobApplicationData {
  _id: string
  jobOfferId: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  candidateCvUrl?: string
  status: 'applied' | 'reviewing' | 'shortlisted' | 'interview_scheduled' | 'accepted' | 'rejected'
  recruiterNote?: string
  reviewedAt?: string
  shortlistedAt?: string
  interviewScheduledAt?: string
  interviewDate?: string
  appliedAt: string
  acceptedAt?: string
  rejectedAt?: string
  matchScore?: number
  matchedSkills?: string[]
  missingSkills?: string[]
  matchReasons?: string[]
  statusHistory?: Array<{
    status: JobApplicationResponse['status']
    changedAt: string
    note?: string
  }>
}

export interface JobOfferForApplication {
  _id: string
  title: string
  companyName: string
  location: string
  salary?: number
  numberOfPositions?: number
}

export interface ApplicationWithJobOffer extends Omit<JobApplicationResponse, 'jobOfferId'> {
  jobOfferId: JobOfferForApplication
}

export interface RecruiterPipelineDashboard {
  summary: {
    activeOffers: number
    totalOffers: number
    totalApplications: number
    averageMatchScore: number
    byStatus: Record<JobApplicationResponse['status'], number>
  }
  offers: Array<{
    jobOfferId: string
    title: string
    companyName: string
    location?: string
    publicationStatus: string
    status: string
    positionsAvailable: number
    applicationsCount: number
    averageMatchScore: number
    pipelineCounts: Record<JobApplicationResponse['status'], number>
    topCandidates: ApplicationWithJobOffer[]
  }>
  recentApplications: ApplicationWithJobOffer[]
}

export interface CandidateOpportunityDashboard {
  summary: {
    totalApplications: number
    activeApplications: number
    interviewsScheduled: number
    acceptedApplications: number
    profileCompletion: number
    recommendationCount: number
  }
  applicationsByStatus: Record<JobApplicationResponse['status'], number>
  recentApplications: ApplicationWithJobOffer[]
  recommendedJobs: Array<JobOfferForApplication & {
    description?: string
    requiredSkills?: string[]
    experienceRequired?: number
    matchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    matchReasons: string[]
  }>
}

export interface AdminApplicationsSummary {
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
}

export interface AdminApplicantsByJob {
  totalJobs: number
  jobs: Array<{
    jobOfferId: string
    title: string
    companyName: string
    location: string
    totalApplicants: number
    applicants: ApplicationWithJobOffer[]
  }>
}

export interface AdminValidatedCandidates {
  total: number
  candidates: ApplicationWithJobOffer[]
}

// ✅ Apply to a job offer (job seeker)
export async function applyToJobOffer(
  jobOfferId: string,
  data: JobApplicationData
): Promise<JobApplicationResponse | null> {
  try {
    const response = await apiRequest(`/applications/${jobOfferId}/apply`, {
      method: 'POST',
      body: data,
      token: localStorage.getItem('authToken') || '',
    })

    if (response.success && response.data) {
      return response.data as JobApplicationResponse
    }
    console.error('Error applying to job offer:', response.error)
    return null
  } catch (error) {
    console.error('API error applying to job offer:', error)
    return null
  }
}

// ✅ Get applications for a specific job offer (recruiter)
export async function getJobOfferApplications(jobOfferId: string): Promise<JobApplicationResponse[]> {
  try {
    const response = await apiRequest(`/applications/${jobOfferId}/applications`, {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })

    if (response.success && response.data && Array.isArray(response.data.applications)) {
      return response.data.applications as JobApplicationResponse[]
    }
    return []
  } catch (error) {
    console.error('API error getting applications:', error)
    return []
  }
}

// ✅ Get all recruiter's applications (for all posted jobs)
export async function getAllRecruiterApplications(): Promise<ApplicationWithJobOffer[]> {
  try {
    const response = await apiRequest('/applications/recruiter/all-applications', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })

    if (response.success && response.data && Array.isArray(response.data.applications)) {
      return response.data.applications as ApplicationWithJobOffer[]
    }
    return []
  } catch (error) {
    console.error('API error getting recruiter applications:', error)
    return []
  }
}

// ✅ Accept application (recruiter)
export async function acceptApplication(applicationId: string): Promise<boolean> {
  return updateApplicationStatus(applicationId, 'accepted')
}

// ✅ Reject application (recruiter)
export async function rejectApplication(applicationId: string): Promise<boolean> {
  return updateApplicationStatus(applicationId, 'rejected')
}

export async function updateApplicationStatus(
  applicationId: string,
  status: 'reviewing' | 'shortlisted' | 'interview_scheduled' | 'accepted' | 'rejected',
  recruiterNote?: string,
  interviewDate?: string
): Promise<boolean> {
  try {
    const response = await apiRequest(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: { status, recruiterNote, interviewDate },
      token: localStorage.getItem('authToken') || '',
    })

    return response.success || false
  } catch (error) {
    console.error('API error updating application status:', error)
    return false
  }
}

// ✅ Get my applications (job seeker)
export async function getMyApplications(): Promise<ApplicationWithJobOffer[]> {
  try {
    const response = await apiRequest('/applications/my-applications', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })

    if (response.success && response.data && Array.isArray(response.data.applications)) {
      return response.data.applications as ApplicationWithJobOffer[]
    }
    return []
  } catch (error) {
    console.error('API error getting my applications:', error)
    return []
  }
}

export async function deleteMyApplication(applicationId: string): Promise<boolean> {
  try {
    const response = await apiRequest(`/applications/${applicationId}`, {
      method: 'DELETE',
      token: localStorage.getItem('authToken') || '',
    })

    return !!response.success
  } catch (error) {
    console.error('API error deleting application:', error)
    return false
  }
}

export async function getAdminApplicationsSummary(): Promise<AdminApplicationsSummary | null> {
  try {
    const response = await apiRequest<AdminApplicationsSummary>('/applications/admin/summary', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })
    return response.success && response.data ? response.data : null
  } catch (error) {
    console.error('API error getting admin summary:', error)
    return null
  }
}

export async function getAdminApplicantsByJob(): Promise<AdminApplicantsByJob | null> {
  try {
    const response = await apiRequest<AdminApplicantsByJob>('/applications/admin/applicants-by-job', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })
    return response.success && response.data ? response.data : null
  } catch (error) {
    console.error('API error getting applicants by job:', error)
    return null
  }
}

export async function getAdminValidatedCandidates(): Promise<AdminValidatedCandidates | null> {
  try {
    const response = await apiRequest<AdminValidatedCandidates>('/applications/admin/validated-candidates', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })
    return response.success && response.data ? response.data : null
  } catch (error) {
    console.error('API error getting validated candidates:', error)
    return null
  }
}

export async function getRecruiterPipelineDashboard(): Promise<RecruiterPipelineDashboard | null> {
  try {
    const response = await apiRequest<RecruiterPipelineDashboard>('/applications/recruiter/pipeline-dashboard', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })
    return response.success && response.data ? response.data : null
  } catch (error) {
    console.error('API error getting recruiter dashboard:', error)
    return null
  }
}

export async function getCandidateOpportunityDashboard(): Promise<CandidateOpportunityDashboard | null> {
  try {
    const response = await apiRequest<CandidateOpportunityDashboard>('/applications/job-seeker/opportunity-dashboard', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })
    return response.success && response.data ? response.data : null
  } catch (error) {
    console.error('API error getting opportunity dashboard:', error)
    return null
  }
}
