import React, { memo } from 'react'
import { useLanguage } from '../utils/LanguageContext'

function HowItWorksContent() {
  const { t } = useLanguage()

  const steps = [
    {
      number: '1',
      emoji: '👤',
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Desc'),
      color: '#667eea'
    },
    {
      number: '2',
      emoji: '🔍',
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Desc'),
      color: '#764ba2'
    },
    {
      number: '3',
      emoji: '📝',
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Desc'),
      color: '#f5576c'
    },
    {
      number: '4',
      emoji: '✅',
      title: t('howItWorks.step4Title'),
      description: t('howItWorks.step4Desc'),
      color: '#43e97b'
    }
  ]

  const forRecruiters = t('howItWorks.forRecruitersList') as unknown as string[]
  const forJobSeekers = t('howItWorks.forJobSeekersList') as unknown as string[]

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works-header">
        <h2>{t('howItWorks.title')}</h2>
        <p>{t('howItWorks.subtitle')}</p>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-wrapper">
            <div 
              className="step-card"
              style={{ '--step-color': step.color } as React.CSSProperties}
            >
              <div className="step-number" style={{ backgroundColor: step.color }}>
                {step.number}
              </div>
              <div className="step-emoji">{step.emoji}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            {index < steps.length - 1 && <div className="step-arrow">→</div>}
          </div>
        ))}
      </div>

      <div className="how-it-works-details">
        <div className="details-grid">
          <div className="details-card recruiters">
            <h3>{t('howItWorks.forRecruitersTitle')}</h3>
            <ul>
              {Array.isArray(forRecruiters) && forRecruiters.map((item, index) => (
                <li key={index}>
                  <span className="check-icon">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="details-card job-seekers">
            <h3>{t('howItWorks.forJobSeekersTitle')}</h3>
            <ul>
              {Array.isArray(forJobSeekers) && forJobSeekers.map((item, index) => (
                <li key={index}>
                  <span className="check-icon">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// Memoize to prevent re-renders
export const HowItWorks = memo(HowItWorksContent)
