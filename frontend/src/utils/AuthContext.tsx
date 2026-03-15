import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, googleLoginUser, logoutUser, storeUser } from '../services/authService'

interface AuthContextType {
  isLoggedIn: boolean
  userType: 'job_seeker' | 'recruiter' | 'admin' | null
  userEmail: string | null
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string, userType?: 'job_seeker' | 'recruiter') => Promise<boolean>
  loginWithGoogle: (profile: {
    googleId: string
    email: string
    name: string
    avatar?: string
    userType?: 'job_seeker' | 'recruiter'
  }) => Promise<boolean>
  register: (name: string, email: string, password: string, userType: 'job_seeker' | 'recruiter') => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<'job_seeker' | 'recruiter' | 'admin' | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn') === 'true'
    const storedEmail = localStorage.getItem('userEmail')
    const storedType = localStorage.getItem('userType') as 'job_seeker' | 'recruiter' | 'admin' | null
    const storedAdmin = localStorage.getItem('isAdmin') === 'true'
    
    if (storedLogin && storedEmail && storedType) {
      setIsLoggedIn(true)
      setUserEmail(storedEmail)
      setUserType(storedType)
      setIsAdmin(storedAdmin)
    }
  }, [])

  const login = async (email: string, password: string, _type?: 'job_seeker' | 'recruiter'): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Appel au backend
      const result = await loginUser({ email, password })
      
      if (result) {
        const resolvedType = result.user.userType
        const resolvedAdmin = resolvedType === 'admin' || !!result.user.isAdmin

        setIsLoggedIn(true)
        setUserEmail(result.user.email)
        setUserType(resolvedType)
        setIsAdmin(resolvedAdmin)
        
        // Stocker dans localStorage
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userEmail', result.user.email)
        localStorage.setItem('userType', resolvedType)
        localStorage.setItem('isAdmin', resolvedAdmin ? 'true' : 'false')
        storeUser(result.user)
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    type: 'job_seeker' | 'recruiter'
  ): Promise<boolean> => {
    setIsLoading(true)

    try {
      const result = await registerUser({ name, email, password, userType: type })

      if (result) {
        setIsLoggedIn(true)
        setUserEmail(result.user.email)
        setUserType(type)
        setIsAdmin(false)

        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userEmail', result.user.email)
        localStorage.setItem('userType', type)
        localStorage.setItem('isAdmin', 'false')
        storeUser(result.user)

        return true
      }

      return false
    } catch (error) {
      console.error('Register error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async (profile: {
    googleId: string
    email: string
    name: string
    avatar?: string
    userType?: 'job_seeker' | 'recruiter'
  }): Promise<boolean> => {
    setIsLoading(true)

    try {
      const result = await googleLoginUser(profile)

      if (result) {
        const resolvedType = result.user.userType
        const resolvedAdmin = resolvedType === 'admin' || !!result.user.isAdmin

        setIsLoggedIn(true)
        setUserEmail(result.user.email)
        setUserType(resolvedType)
        setIsAdmin(resolvedAdmin)

        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userEmail', result.user.email)
        localStorage.setItem('userType', resolvedType)
        localStorage.setItem('isAdmin', resolvedAdmin ? 'true' : 'false')
        storeUser(result.user)

        return true
      }

      return false
    } catch (error) {
      console.error('Google login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setIsLoading(true)
    
    try {
      // Appel au backend pour déconnexion
      logoutUser()
      
      setIsLoggedIn(false)
      setUserEmail(null)
      setUserType(null)
      setIsAdmin(false)
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userType')
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userType, userEmail, isAdmin, isLoading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
