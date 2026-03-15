import { apiRequest } from './apiClient'

export interface AdminUser {
  id: string
  name: string
  email: string
  type: 'job_seeker' | 'recruiter' | 'admin'
  isAdmin: boolean
  status: 'active' | 'suspended' | 'banned'
  joinDate: string
  lastActive: string
}

export interface AdminUsersResponse {
  total: number
  users: AdminUser[]
}

export interface AdminAnalyticsResponse {
  keyMetrics: {
    totalUsers: number
    totalJobs: number
    totalOpenJobs: number
    totalPendingRequests: number
    totalApplications: number
    conversionRate: number
  }
  usersByType: Array<{ label: string; value: number }>
  applicationsByStatus: Array<{ label: string; value: number }>
  jobsByPublication: Array<{ label: string; value: number }>
}

export interface AdminReport {
  id: string
  title: string
  type: 'user' | 'job' | 'engagement'
  generatedDate: string
  status: 'completed'
  description: string
  metrics: Record<string, number>
}

export async function getAdminUsers(): Promise<AdminUsersResponse | null> {
  const response = await apiRequest<AdminUsersResponse>('/admin/users', { method: 'GET' })
  return response.success && response.data ? response.data : null
}

export async function updateAdminUserStatus(
  userId: string,
  status: 'active' | 'suspended' | 'banned'
): Promise<boolean> {
  const response = await apiRequest(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: { status },
  })

  return !!response.success
}

export async function updateAdminUserRole(
  userId: string,
  userType: 'job_seeker' | 'recruiter'
): Promise<boolean> {
  const response = await apiRequest(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: { userType },
  })

  return !!response.success
}

export async function updateAdminRights(
  userId: string,
  isAdmin: boolean,
  fallbackUserType?: 'job_seeker' | 'recruiter'
): Promise<boolean> {
  const response = await apiRequest(`/admin/users/${userId}/admin-rights`, {
    method: 'PATCH',
    body: { isAdmin, fallbackUserType },
  })

  return !!response.success
}

export async function deleteAdminUser(userId: string): Promise<boolean> {
  const response = await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' })
  return !!response.success
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsResponse | null> {
  const response = await apiRequest<AdminAnalyticsResponse>('/admin/analytics', { method: 'GET' })
  return response.success && response.data ? response.data : null
}

export async function getAdminReports(): Promise<AdminReport[]> {
  const response = await apiRequest<{ total: number; reports: AdminReport[] }>('/admin/reports', { method: 'GET' })
  if (response.success && response.data?.reports) {
    return response.data.reports
  }
  return []
}
