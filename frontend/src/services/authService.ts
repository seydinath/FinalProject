/**
 * Authentication Service
 * Gère les appels API d'authentification
 */

import { apiRequest, setAuthToken, clearAuthToken } from './apiClient'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name: string
  userType: 'job_seeker' | 'recruiter'
}

export interface GoogleLoginPayload {
  googleId: string
  email: string
  name: string
  avatar?: string
  userType?: 'job_seeker' | 'recruiter'
}

export interface UserProfile {
  headline?: string
  bio?: string
  phone?: string
  location?: string
  skills?: string[]
  yearsOfExperience?: number
  expectations?: string
  languages?: string[]
  availability?: 'immediate' | '2-weeks' | '1-month' | 'negotiable'
  desiredDomain?: string
  cvUrl?: string
}

export interface AuthResponse {
  token?: string
  message?: string
  requiresEmailVerification?: boolean
  user: {
    id: string
    email: string
    name: string
    userType: 'job_seeker' | 'recruiter' | 'admin'
    isAdmin?: boolean
    avatar?: string
    isVerified?: boolean
    profile?: UserProfile
  }
}

export interface RegisterResponse {
  token?: string
  message?: string
  requiresEmailVerification?: boolean
  user?: AuthResponse['user']
}

export interface MeResponse {
  id: string
  email: string
  name: string
  userType: 'job_seeker' | 'recruiter' | 'admin'
  isAdmin?: boolean
  avatar?: string
  isVerified?: boolean
  profile?: UserProfile
}

interface MeApiResponse {
  user: MeResponse
}

/**
 * Connexion utilisateur
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse | null> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: credentials
  })

  if (response.success && response.data) {
    // Stocker le token
    if (response.data.token) {
      setAuthToken(response.data.token)
    }
    return response.data
  }

  throw new Error(response.error || 'Login failed')
}

/**
 * Inscription utilisateur
 */
export async function registerUser(credentials: RegisterCredentials): Promise<RegisterResponse | null> {
  const response = await apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: credentials
  })

  if (response.success && response.data) {
    // Stocker le token uniquement si présent (fallback sans verification email)
    if (response.data.token) {
      setAuthToken(response.data.token)
    }
    return response.data
  }

  throw new Error(response.error || 'Registration failed')
}

/**
 * Connexion Google OAuth
 */
export async function googleLoginUser(payload: GoogleLoginPayload): Promise<AuthResponse | null> {
  const response = await apiRequest<AuthResponse>('/auth/google-login', {
    method: 'POST',
    body: payload
  })

  if (response.success && response.data) {
    if (response.data.token) {
      setAuthToken(response.data.token)
    }
    return response.data
  }

  throw new Error(response.error || 'Google sign-in failed')
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const response = await apiRequest<{ message: string }>('/auth/verify-email', {
    method: 'POST',
    body: { token },
    token: '',
  })

  if (response.success) {
    return true
  }

  throw new Error(response.error || 'Email verification failed')
}

export async function resendVerificationEmail(email: string): Promise<boolean> {
  const response = await apiRequest<{ message: string }>('/auth/resend-verification-email', {
    method: 'POST',
    body: { email },
    token: '',
  })

  if (response.success) {
    return true
  }

  throw new Error(response.error || 'Failed to resend verification email')
}

/**
 * Déconnexion utilisateur
 */
export function logoutUser(): void {
  clearAuthToken()
  localStorage.removeItem('user')
}

/**
 * Obtenir les informations de l'utilisateur stockées
 */
export function getStoredUser(): AuthResponse['user'] | null {
  const stored = localStorage.getItem('user')
  return stored ? JSON.parse(stored) : null
}

/**
 * Stocker les informations de l'utilisateur
 */
export function storeUser(user: AuthResponse['user']): void {
  localStorage.setItem('user', JSON.stringify(user))
}

export async function getMe(): Promise<MeResponse | null> {
  const response = await apiRequest<MeApiResponse>('/auth/me', { method: 'GET' })
  return response.success && response.data?.user ? response.data.user : null
}

export async function updateProfile(profile: UserProfile): Promise<MeResponse | null> {
  const response = await apiRequest<{ user: MeResponse }>('/auth/profile', {
    method: 'PATCH',
    body: { profile }
  })

  if (response.success && response.data?.user) {
    return response.data.user
  }

  return null
}

export async function uploadCv(file: File): Promise<{ cvUrl: string; user: MeResponse } | null> {
  const formData = new FormData()
  formData.append('cv', file)

  const response = await apiRequest<{ cvUrl: string; user: MeResponse }>('/auth/profile/cv', {
    method: 'POST',
    body: formData,
  })

  if (response.success && response.data) {
    return response.data
  }

  return null
}

export default {
  loginUser,
  registerUser,
  googleLoginUser,
  verifyEmailToken,
  resendVerificationEmail,
  logoutUser,
  getStoredUser,
  storeUser,
  getMe,
  updateProfile,
  uploadCv,
}
