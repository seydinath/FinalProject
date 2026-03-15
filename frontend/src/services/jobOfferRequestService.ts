import { apiRequest } from './apiClient'

export interface JobOfferRequestData {
  companyName: string
  jobTitle: string
  customJobTitle?: string
  location: string
  salary: number
  numberOfPositions: number
  jobDuration: 'temporary' | 'permanent' | 'contract' | 'part-time'
  experienceRequired?: number
  description?: string
}

export interface JobOfferRequestResponse extends JobOfferRequestData {
  _id: string
  recruiterId: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

// ✅ Submit job offer request
export async function submitJobOfferRequest(data: JobOfferRequestData): Promise<JobOfferRequestResponse | null> {
  try {
    const response = await apiRequest('/job-offer-requests/request', {
      method: 'POST',
      body: data,
      token: localStorage.getItem('authToken') || '',
    })

    if (response.success && response.data) {
      return response.data as JobOfferRequestResponse
    }
    console.error('Error submitting job offer request:', response.error)
    return null
  } catch (error) {
    console.error('API error submitting job offer request:', error)
    return null
  }
}

// ✅ Get recruiter's job offer requests
export async function getMyJobOfferRequests(): Promise<JobOfferRequestResponse[]> {
  try {
    const response = await apiRequest('/job-offer-requests/my-requests', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })

    if (response.success && response.data && Array.isArray(response.data.requests)) {
      return response.data.requests as JobOfferRequestResponse[]
    }
    return []
  } catch (error) {
    console.error('API error getting job offer requests:', error)
    return []
  }
}

// ✅ Get pending requests (admin)
export async function getPendingJobOfferRequests(): Promise<JobOfferRequestResponse[]> {
  try {
    const response = await apiRequest('/job-offer-requests/admin/pending-requests', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })

    if (response.success && response.data && Array.isArray(response.data.requests)) {
      return response.data.requests as JobOfferRequestResponse[]
    }
    return []
  } catch (error) {
    console.error('API error getting pending requests:', error)
    return []
  }
}

// ✅ Get all requests (admin)
export async function getAllJobOfferRequests(): Promise<JobOfferRequestResponse[]> {
  try {
    const response = await apiRequest('/job-offer-requests/admin/all-requests', {
      method: 'GET',
      token: localStorage.getItem('authToken') || '',
    })

    if (response.success && response.data && Array.isArray(response.data.requests)) {
      return response.data.requests as JobOfferRequestResponse[]
    }
    return []
  } catch (error) {
    console.error('API error getting all requests:', error)
    return []
  }
}

// ✅ Approve job offer request (admin)
export async function approveJobOfferRequest(requestId: string): Promise<boolean> {
  try {
    const response = await apiRequest(`/job-offer-requests/admin/requests/${requestId}/approve`, {
      method: 'POST',
      token: localStorage.getItem('authToken') || '',
    })

    return response.success || false
  } catch (error) {
    console.error('API error approving job offer request:', error)
    return false
  }
}

// ✅ Reject job offer request (admin)
export async function rejectJobOfferRequest(
  requestId: string,
  rejectionReason: string
): Promise<boolean> {
  try {
    const response = await apiRequest(`/job-offer-requests/admin/requests/${requestId}/reject`, {
      method: 'POST',
      body: { rejectionReason },
      token: localStorage.getItem('authToken') || '',
    })

    return response.success || false
  } catch (error) {
    console.error('API error rejecting job offer request:', error)
    return false
  }
}
