import React, { memo } from 'react'
import { useLanguage } from '../utils/LanguageContext'

function FeaturesSectionContent() {
  const { t } = useLanguage()

  const features = [
    {
      icon: '⚡',
      title: t('features.quickPosting'),
      description: t('features.quickPostingDesc'),
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea'
    },
    {
      icon: '🎯',
      title: t('features.smartMatching'),
      description: t('features.smartMatchingDesc'),
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#f093fb'
    },
    {
      icon: '🔐',
      title: t('features.secure'),
      description: t('features.secureDesc'),
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#4facfe'
    },
    {
      icon: '📊',
      title: t('features.analytics'),
      description: t('features.analyticsDesc'),
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      color: '#43e97b'
    },
    {
      icon: '👥',
      title: t('features.communityTitle'),
      description: t('features.communityDesc'),
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      color: '#fa709a'
    },
    {
      icon: '💬',
      title: t('features.supportTitle'),
      description: t('features.supportDesc'),
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      color: '#30cfd0'
    }
  ]

  return (
    <section id="features" className="features">
      <div className="features-header">
        <h2>{t('features.title')}</h2>
        <p>{t('features.subtitle')}</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="feature-card"
            style={{
              '--feature-color': feature.color,
              '--feature-gradient': feature.gradient,
              '--delay': `${index * 0.1}s`
            } as React.CSSProperties}
          >
            <div className="feature-icon-wrapper">
              <div className="feature-icon">{feature.icon}</div>
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <div className="feature-bottom">
              <div className="feature-accent"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Memoize to prevent re-renders
export const FeaturesSection = memo(FeaturesSectionContent)
