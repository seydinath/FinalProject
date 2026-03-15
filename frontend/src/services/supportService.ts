import { apiRequest } from './apiClient'

export interface SupportThreadUser {
  id: string
  name: string
  email: string
  userType: 'job_seeker' | 'recruiter' | 'admin'
}

export interface SupportResolvedBy {
  id: string
  name: string
  email: string
}

export interface SupportConversationState {
  userId: string
  status: 'open' | 'resolved'
  resolvedAt?: string | null
  resolvedBy?: SupportResolvedBy | null
  lastMessageAt: string
}

export interface SupportMessage {
  _id: string
  userId: string
  senderRole: 'user' | 'admin'
  sender: {
    id: string
    name: string
    email: string
  }
  message: string
  readByUserAt?: string | null
  readByAdminAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface SupportConversationSummary {
  userId: string
  userName: string
  userEmail: string
  userType: 'job_seeker' | 'recruiter' | 'admin'
  unreadCount: number
  lastMessage: string
  lastSenderRole: 'user' | 'admin'
  lastMessageAt: string
  status: 'open' | 'resolved'
  resolvedAt?: string | null
  resolvedBy?: SupportResolvedBy | null
}

export async function getSupportMessages(userId?: string): Promise<{
  threadUser: SupportThreadUser | null
  conversation: SupportConversationState | null
  messages: SupportMessage[]
}> {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : ''
  const response = await apiRequest<{
    threadUser: SupportThreadUser | null
    conversation: SupportConversationState | null
    messages: SupportMessage[]
  }>(`/support/messages${query}`, {
    method: 'GET',
  })

  if (response.success && response.data) {
    return response.data
  }

  return { threadUser: null, conversation: null, messages: [] }
}

export async function sendSupportMessage(
  message: string,
  userId?: string
): Promise<{ message: SupportMessage; conversation: SupportConversationSummary | SupportConversationState | null } | null> {
  const response = await apiRequest<{
    message: SupportMessage
    conversation: SupportConversationSummary | SupportConversationState | null
  }>('/support/messages', {
    method: 'POST',
    body: { message, userId },
  })

  return response.success && response.data?.message ? response.data : null
}

export async function markSupportThreadRead(userId?: string): Promise<boolean> {
  const response = await apiRequest('/support/read', {
    method: 'PATCH',
    body: { userId },
  })

  return !!response.success
}

export async function getAdminSupportConversations(): Promise<SupportConversationSummary[]> {
  const response = await apiRequest<{ conversations: SupportConversationSummary[] }>('/support/conversations', {
    method: 'GET',
  })

  return response.success && response.data?.conversations ? response.data.conversations : []
}

export async function getAdminSupportSummary(): Promise<{ unreadMessages: number; openConversations: number }> {
  const response = await apiRequest<{ unreadMessages: number; openConversations: number }>('/support/summary', {
    method: 'GET',
  })

  if (response.success && response.data) {
    return response.data
  }

  return { unreadMessages: 0, openConversations: 0 }
}

export async function updateSupportConversationStatus(
  userId: string,
  status: 'open' | 'resolved'
): Promise<SupportConversationSummary | null> {
  const response = await apiRequest<{ conversation: SupportConversationSummary }>('/support/status', {
    method: 'PATCH',
    body: { userId, status },
  })

  return response.success && response.data?.conversation ? response.data.conversation : null
}