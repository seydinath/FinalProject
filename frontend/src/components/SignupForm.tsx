import React, { useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { registerUser, storeUser } from '../services/authService'

interface SignupFormProps {
  onclose?: () => void
}

export function SignupForm({ onclose }: SignupFormProps) {
  const { t } = useLanguage()
  const [userType, setUserType] = useState<'recruiter' | 'job_seeker'>('job_seeker')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await registerUser({
        name,
        email,
        password,
        userType
      })

      if (result) {
        if (result.user) {
          // Legacy/fallback path when backend returns a token+user.
          storeUser(result.user)
          alert(`Bienvenue ${result.user.name} !`)
        } else {
          // Default email verification path.
          alert('Compte cree. Verifiez votre email puis connectez-vous.')
        }
        
        // Close modal or redirect
        if (onclose) {
          onclose()
        } else {
          window.location.href = '/'
        }
      } else {
        setError('Inscription échouée. Veuillez réessayer.')
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-form">
      <h2>{t('signup.title')}</h2>
      
      {error && (
        <div className="error-message" style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userType">{t('signup.userType')}</label>
          <select 
            id="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value as 'recruiter' | 'job_seeker')}
          >
            <option value="job_seeker">{t('signup.jobSeeker')}</option>
            <option value="recruiter">{t('signup.recruiter')}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name">{t('signup.name')}</label>
          <input 
            type="text" 
            id="name" 
            placeholder="John Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">{t('signup.email')}</label>
          <input 
            type="email" 
            id="email" 
            placeholder="john@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input 
            type="password" 
            id="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required 
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Chargement...' : t('signup.create')}
        </button>

        <div className="divider">
          <span>{t('signup.or')}</span>
        </div>

        <button type="button" className="btn-google">
          🔵 {t('signup.googleSignUp')}
        </button>
      </form>

      <p className="signup-footer">
        {t('signup.alreadyHaveAccount')} <a href="#signin">{t('signup.signInHere')}</a>
      </p>
    </div>
  )
}
