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
  token: string
  user: {
    id: string
    email: string
    name: string
    userType: 'job_seeker' | 'recruiter' | 'admin'
    isAdmin?: boolean
    avatar?: string
    profile?: UserProfile
  }
}

export interface MeResponse {
  id: string
  email: string
  name: string
  userType: 'job_seeker' | 'recruiter' | 'admin'
  isAdmin?: boolean
  avatar?: string
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
    setAuthToken(response.data.token)
    return response.data
  }

  console.error('Login error:', response.error)
  return null
}

/**
 * Inscription utilisateur
 */
export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse | null> {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: credentials
  })

  if (response.success && response.data) {
    // Stocker le token
    setAuthToken(response.data.token)
    return response.data
  }

  console.error('Register error:', response.error)
  return null
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
    setAuthToken(response.data.token)
    return response.data
  }

  console.error('Google login error:', response.error)
  return null
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
  logoutUser,
  getStoredUser,
  storeUser,
  getMe,
  updateProfile,
  uploadCv,
}
