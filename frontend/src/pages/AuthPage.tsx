import React, { useEffect, useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { useTheme } from '../utils/ThemeContext'
import { useAuth } from '../utils/AuthContext'
import { useToast } from '../utils/ToastContext'
import { useFormValidation } from '../hooks/useFormValidation'
import { ValidationRules } from '../utils/ValidationRules'
import { FormInput } from '../components/FormInput'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'
import { LoadingButton } from '../components/Loading'
import { LoginCharacter } from '../components/LoginCharacter'

interface AuthPageProps {
  onAuthSuccess?: () => void
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const { t, language } = useLanguage()
  const { isDark } = useTheme()
  const { login, loginWithGoogle, register, isLoading } = useAuth()
  const { success, error: showError } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState<'job_seeker' | 'recruiter'>('job_seeker')
  const [showPassword, setShowPassword] = useState(false)
  const [isFieldFocused, setIsFieldFocused] = useState(false)
  const [charIsShaking, setCharIsShaking] = useState(false)
  const [charIsSad, setCharIsSad] = useState(false)
  const [charIsHappy, setCharIsHappy] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)

  useEffect(() => {
    const existing = document.getElementById('google-gsi-sdk') as HTMLScriptElement | null
    if (existing) {
      setGoogleReady(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'google-gsi-sdk'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setGoogleReady(true)
    script.onerror = () => {
      setGoogleReady(false)
      showError(language === 'fr' ? 'Impossible de charger Google OAuth' : 'Failed to load Google OAuth')
    }
    document.head.appendChild(script)
  }, [language, showError])

  // Form validation state
  const { 
    formState, 
    handleChange, 
    handleBlur, 
    handleSubmit: handleValidation,
    isSubmitting,
    reset 
  } = useFormValidation(
    {
      name: '',
      email: '',
      password: '',
      passwordConfirm: ''
    },
    {
      rules: {
        name: isLogin ? [] : [
          ValidationRules.required(language === 'fr' ? 'Nom requis' : 'Name required'),
          ValidationRules.minLength(3, language === 'fr' ? 'Au moins 3 caractères' : 'At least 3 characters')
        ],
        email: [
          ValidationRules.required(language === 'fr' ? 'Email requis' : 'Email required'),
          ValidationRules.email(language === 'fr' ? 'Email invalide' : 'Invalid email')
        ],
        password: [
          ValidationRules.required(language === 'fr' ? 'Mot de passe requis' : 'Password required'),
          isLogin 
            ? ValidationRules.weakPassword()
            : ValidationRules.password(language === 'fr' ? 'Mot de passe faible' : 'Weak password')
        ],
        passwordConfirm: !isLogin ? [
          ValidationRules.required(language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password required'),
          ValidationRules.match(
            () => formState.password.value,
            language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'
          )
        ] : []
      },
      onSubmit: async (values) => {
        try {
          let loginSuccess = false

          loginSuccess = isLogin
            ? await login(values.email, values.password)
            : await register(values.name, values.email, values.password, userType)

          if (loginSuccess) {
            const message = isLogin
              ? (language === 'fr' ? 'Connexion réussie! Bienvenue! 🎉' : 'Sign in successful! Welcome! 🎉')
              : (language === 'fr' ? 'Compte créé avec succès! Bienvenue! 🚀' : 'Account created successfully! Welcome! 🚀')
            success(message)
            setCharIsHappy(true)
            setTimeout(() => setCharIsHappy(false), 2000)
          } else {
            showError(language === 'fr' ? 'Erreur d\'authentification' : 'Authentication error')
            setCharIsShaking(true)
            setCharIsSad(true)
            setTimeout(() => { setCharIsShaking(false); setCharIsSad(false) }, 1500)
            return
          }
          
          // Reset form
          reset()
          
          if (onAuthSuccess) {
            onAuthSuccess()
          }
        } catch (err) {
          showError(language === 'fr' ? 'Une erreur est survenue' : 'An error occurred')
        }
      }
    }
  )

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleValidation(e as any)
  }

  const handleGoogleAuth = async () => {
    const googleClientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID

    if (!googleClientId) {
      showError(language === 'fr' ? 'VITE_GOOGLE_CLIENT_ID manquant' : 'Missing VITE_GOOGLE_CLIENT_ID')
      return
    }

    if (!googleReady || !(window as any).google?.accounts?.id) {
      showError(language === 'fr' ? 'Google OAuth non prêt' : 'Google OAuth not ready')
      return
    }

    try {
      const credentialToken = await new Promise<string>((resolve, reject) => {
        ;(window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (response?.credential) {
              resolve(response.credential)
            } else {
              reject(new Error('No Google credential'))
            }
          },
          auto_select: false,
          ux_mode: 'popup',
        })

        ;(window as any).google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
            reject(new Error('Google prompt unavailable'))
          }
        })
      })

      const tokenPayload = JSON.parse(atob(credentialToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))

      const ok = await loginWithGoogle({
        googleId: tokenPayload.sub,
        email: tokenPayload.email,
        name: tokenPayload.name,
        avatar: tokenPayload.picture,
        userType,
      })

      if (!ok) {
        showError(language === 'fr' ? 'Connexion Google échouée' : 'Google sign-in failed')
        return
      }

      success(language === 'fr' ? 'Connexion Google réussie' : 'Google sign-in successful')
      setCharIsHappy(true)
      setTimeout(() => setCharIsHappy(false), 2000)

      if (onAuthSuccess) {
        onAuthSuccess()
      }
    } catch (error) {
      console.error('Google auth error:', error)
      showError(language === 'fr' ? 'Erreur Google OAuth' : 'Google OAuth error')
    }
  }

  return (
    <div className={`auth-page ${isDark ? 'dark' : 'light'}`}>
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="auth-container">
        {/* Character panel */}
        <div className="auth-character-panel">
          <LoginCharacter
            showPassword={showPassword}
            isFocused={isFieldFocused}
            isShaking={charIsShaking}
            isSad={charIsSad}
            isHappy={charIsHappy}
          />
          <p className="auth-character-title">
            {isLogin
              ? (language === 'fr' ? 'Bon retour !' : 'Welcome back!')
              : (language === 'fr' ? 'Rejoignez-nous !' : 'Join us!')}
          </p>
          <p className="auth-character-subtitle">
            {isLogin
              ? (language === 'fr' ? 'Je garde un œil sur vos données' : 'I\'m keeping an eye on your data')
              : (language === 'fr' ? 'Je serai là pour vous accompagner' : 'I\'ll be here to guide you')}
          </p>
        </div>

        <div className="auth-card"
          onFocus={() => setIsFieldFocused(true)}
          onBlur={() => setIsFieldFocused(false)}
        >
          <div className="auth-tabs">
            <button
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              {t('nav.signIn')}
            </button>
            <button
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              {t('signup.create')}
            </button>
          </div>

          {/* Admin Login Tab */}
          <form onSubmit={handleFormSubmit} className="auth-form">
            {/* User Type Selection */}
            {!isLogin && (
              <div className="form-group">
                <label>{t('signup.userType')}</label>
                <div className="user-type-selector">
                  <label className={`type-option ${userType === 'job_seeker' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="job_seeker"
                      checked={userType === 'job_seeker'}
                      onChange={(e) => setUserType(e.target.value as 'job_seeker')}
                    />
                    <span className="type-label">👤 {t('signup.jobSeeker')}</span>
                  </label>
                  <label className={`type-option ${userType === 'recruiter' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="recruiter"
                      checked={userType === 'recruiter'}
                      onChange={(e) => setUserType(e.target.value as 'recruiter')}
                    />
                    <span className="type-label">🏢 {t('signup.recruiter')}</span>
                  </label>
                </div>
              </div>
            )}

            {/* Name Field (Signup only) */}
            {!isLogin && (
              <FormInput
                name="name"
                label={t('signup.name')}
                type="text"
                placeholder={language === 'fr' ? 'Jean Dupont' : 'John Doe'}
                field={formState.name}
                onChange={handleChange}
                onBlur={handleBlur}
                icon="👤"
                successMessage={language === 'fr' ? 'Nom valide' : 'Valid name'}
                required
              />
            )}

            {/* Email Field */}
            <FormInput
              name="email"
              label={t('signup.email')}
              type="email"
              placeholder={language === 'fr' ? 'vous@email.com' : 'you@email.com'}
              field={formState.email}
              onChange={handleChange}
              onBlur={handleBlur}
              icon="✉️"
              successMessage={language === 'fr' ? 'Email valide' : 'Valid email'}
              hint={language === 'fr' ? 'Utilisez une adresse email valide' : 'Use a valid email address'}
              required
            />

            {/* Password Field */}
            <div className="password-field-wrapper">
              <FormInput
                name="password"
                label={language === 'fr' ? 'Mot de passe' : 'Password'}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                field={formState.password}
                onChange={handleChange}
                onBlur={handleBlur}
                icon="🔒"
                successMessage={isLogin ? undefined : (language === 'fr' ? 'Mot de passe fort' : 'Strong password')}
                hint={isLogin ? undefined : (language === 'fr' ? 'Au moins 8 caractères, avec majuscules, minuscules, chiffres et caractères spéciaux' : 'At least 8 characters with uppercase, lowercase, numbers and special characters')}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? (language === 'fr' ? 'Masquer le mot de passe' : 'Hide password') : (language === 'fr' ? 'Afficher le mot de passe' : 'Show password')}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength Meter (Signup only) */}
            {!isLogin && (
              <PasswordStrengthMeter 
                password={formState.password.value} 
                showLabel={true}
                showMessage={true}
              />
            )}

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <FormInput
                name="passwordConfirm"
                label={language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'}
                type="password"
                placeholder="••••••••"
                field={formState.passwordConfirm}
                onChange={handleChange}
                onBlur={handleBlur}
                icon="🔒"
                hint={language === 'fr' ? 'Doit correspondre au mot de passe ci-dessus' : 'Must match the password above'}
                required
              />
            )}

            {/* Submit Button */}
            <LoadingButton
              loading={isSubmitting || isLoading}
              className="btn-submit"
              disabled={isSubmitting || isLoading}
            >
              {isLogin ? t('nav.signIn') : t('signup.create')}
            </LoadingButton>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>{t('signup.or')}</span>
          </div>

          {/* Google Auth */}
          <button 
            type="button" 
            className="btn-google"
            onClick={handleGoogleAuth}
            disabled={isSubmitting || isLoading || !googleReady}
          >
            <span className="google-icon">🔵</span>
            {language === 'fr' ? 'Continuer avec Google' : 'Continue with Google'}
          </button>

          {/* Toggle Auth Type */}
          <p className="auth-toggle">
            {isLogin ? (
              <>
                {language === 'fr' ? 'Pas encore de compte? ' : "Don't have an account? "}
                <button 
                  type="button" 
                  onClick={() => setIsLogin(false)}
                  className="toggle-link"
                >
                  {language === 'fr' ? 'Inscrivez-vous' : 'Sign up'}
                </button>
              </>
            ) : (
              <>
                {language === 'fr' ? 'Vous avez déjà un compte? ' : 'Already have an account? '}
                <button 
                  type="button" 
                  onClick={() => setIsLogin(true)}
                  className="toggle-link"
                >
                  {language === 'fr' ? 'Connectez-vous' : 'Sign in'}
                </button>
              </>
            )}
          </p>
        </div>


      </div>
    </div>
  )
}
