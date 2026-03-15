import { apiRequest } from './apiClient'

export type UserNotification = {
  _id: string
  userId: string
  type: 'application_submitted' | 'application_accepted' | 'application_rejected' | 'job_request_approved' | 'job_request_rejected' | 'support_message' | 'support_reply' | 'system'
  title: string
  message: string
  link?: string
  readAt?: string | null
  createdAt: string
}

export async function getNotifications(
  limit = 20,
  unreadOnly = false,
  page = 1,
  type: UserNotification['type'] | 'all' = 'all'
): Promise<{ notifications: UserNotification[]; unreadCount: number; hasMore: boolean }> {
  try {
    const response = await apiRequest<{
      notifications: UserNotification[]
      unreadCount: number
      hasMore?: boolean
    }>(
      `/notifications?limit=${limit}&unreadOnly=${unreadOnly}&page=${page}&type=${type}`,
      {
        method: 'GET',
        token: localStorage.getItem('authToken') || '',
      }
    )

    if (response.success && response.data) {
      return {
        notifications: response.data.notifications || [],
        unreadCount: response.data.unreadCount || 0,
        hasMore: !!response.data.hasMore,
      }
    }

    return { notifications: [], unreadCount: 0, hasMore: false }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { notifications: [], unreadCount: 0, hasMore: false }
  }
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    const response = await apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
      token: localStorage.getItem('authToken') || '',
    })

    return !!response.success
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

export async function markAllNotificationsRead(): Promise<boolean> {
  try {
    const response = await apiRequest('/notifications/read-all', {
      method: 'PATCH',
      token: localStorage.getItem('authToken') || '',
    })

    return !!response.success
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}
