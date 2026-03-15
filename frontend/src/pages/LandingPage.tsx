import { useState } from 'react'
import { PremiumBackground } from '../components/PremiumBackground'
import { HeroSection } from '../components/HeroSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { HowItWorks } from '../components/HowItWorks'
import { JobsList } from '../components/JobsList'
import { SignupForm } from '../components/SignupForm'
import { useTheme } from '../utils/ThemeContext'
import { useLanguage } from '../utils/LanguageContext'

interface LandingPageProps {
  onNavigateToAuth?: () => void
}

export function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const [showSignup, setShowSignup] = useState(false)

  const handleOpenAuth = () => {
    if (onNavigateToAuth) {
      onNavigateToAuth()
    } else {
      setShowSignup(true)
    }
  }

  return (
    <div className={`landing-page ${isDark ? 'dark' : 'light'}`}>
      <PremiumBackground />
      
      <div className="main-content">
        <HeroSection onNavigateToAuth={handleOpenAuth} />
        <FeaturesSection />
        <HowItWorks />
        <JobsList onOpenAuth={handleOpenAuth} />
        
        {showSignup && (
          <div className="modal-overlay" onClick={() => setShowSignup(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowSignup(false)}>✕</button>
              <SignupForm onclose={() => setShowSignup(false)} />
            </div>
          </div>
        )}
        
        <footer className="footer">
          <p>{t('footer.copyright')}</p>
        </footer>
      </div>
    </div>
  )
}
