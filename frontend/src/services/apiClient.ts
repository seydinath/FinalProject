/**
 * API Client Service
 * Gère les requêtes HTTP vers le backend
 */

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  token?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Effectue une requête API
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body = null,
    token = localStorage.getItem('authToken')
  } = options

  try {
    const isFormData = body instanceof FormData
    const fetchOptions: RequestInit = {
      method,
      headers: isFormData
        ? { ...headers }
        : {
            'Content-Type': 'application/json',
            ...headers
          }
    }

    // Ajouter le token d'authentification si disponible
    if (token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`
      }
    }

    // Ajouter le corps de la requête
    if (body) {
      fetchOptions.body = isFormData ? body : JSON.stringify(body)
    }

    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions)

    // Traiter la réponse
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

/**
 * Obtient l'URL complète de l'API
 */
export function getApiUrl(endpoint: string): string {
  return `${API_URL}${endpoint}`
}

/**
 * Stocke le token d'authentification
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token)
}

/**
 * Récupère le token d'authentification
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken')
}

/**
 * Supprime le token d'authentification
 */
export function clearAuthToken(): void {
  localStorage.removeItem('authToken')
}

export default {
  apiRequest,
  getApiUrl,
  setAuthToken,
  getAuthToken,
  clearAuthToken
}
