import { memo, useCallback } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { useAuth } from '../utils/AuthContext'
import { useNavigation } from '../utils/NavigationContext'

interface HeroSectionProps {
  onNavigateToAuth?: () => void
}

function HeroSectionContent({ onNavigateToAuth }: HeroSectionProps) {
  const { t } = useLanguage()
  const { isLoggedIn, isAdmin, userType } = useAuth()
  const { navigateTo } = useNavigation()

  const handleRecruiterClick = useCallback(() => {
    if (isLoggedIn && userType === 'recruiter') {
      navigateTo('talent-search')
      return
    }

    onNavigateToAuth?.()
  }, [isLoggedIn, navigateTo, onNavigateToAuth, userType])

  const handleJobSeekerClick = useCallback(() => {
    if (isLoggedIn && userType === 'job_seeker') {
      navigateTo('dashboard')
      return
    }

    onNavigateToAuth?.()
  }, [isLoggedIn, navigateTo, onNavigateToAuth, userType])

  return (
    <section className="hero">
      <div className="hero-content">
        <h2 className="hero-title">{t('hero.title')}</h2>
        <p className="hero-subtitle">
          {t('hero.subtitle')}
        </p>
        
        <div className="hero-cta">
          {(!isLoggedIn || userType === 'recruiter') && !isAdmin && (
            <button className="btn-primary" onClick={handleRecruiterClick}>
              {t('hero.forRecruiters')}
            </button>
          )}
          {(!isLoggedIn || userType === 'job_seeker') && !isAdmin && (
            <button className="btn-secondary" onClick={handleJobSeekerClick}>
              {t('hero.forJobSeekers')}
            </button>
          )}
        </div>

        <p className="hero-footer">{t('hero.joinThousands')}</p>
      </div>
    </section>
  )
}

// Memoize to prevent re-renders
export const HeroSection = memo(HeroSectionContent)
