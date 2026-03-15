import { useLanguage } from '../utils/LanguageContext'
import { useTheme } from '../utils/ThemeContext'
import { Candidate } from '../data/candidates'

interface CandidateProfileProps {
  candidate: Candidate
  onBack: () => void
}

export function CandidateProfile({ candidate, onBack }: CandidateProfileProps) {
  const { language } = useLanguage()
  const { isDark } = useTheme()

  const availabilityLabels = {
    immediate: { fr: 'Immédiatement', en: 'Immediately' },
    '2-weeks': { fr: '2 semaines', en: '2 weeks' },
    '1-month': { fr: '1 mois', en: '1 month' },
    negotiable: { fr: 'À négocier', en: 'Negotiable' }
  }

  return (
    <div className={`candidate-profile-page ${isDark ? 'dark' : 'light'}`}>
      <div className="profile-container">
        {/* Header with back button */}
        <div className="profile-header">
          <button className="btn-back" onClick={onBack}>
            ← {language === 'fr' ? 'Retour' : 'Back'}
          </button>
          <h1>{language === 'fr' ? 'Profil du Candidat' : 'Candidate Profile'}</h1>
        </div>

        <div className="profile-content">
          {/* Main profile info */}
          <div className="profile-overview">
            <div className="profile-header-section">
              <div className="avatar-large">{candidate.profileImage}</div>
              <div className="header-info">
                <h1>{candidate.name}</h1>
                <p className="title">{candidate.title}</p>
                <p className="location">📍 {language === 'fr' ? candidate.locationXOF || candidate.location : candidate.location}</p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="label">{language === 'fr' ? 'Expérience' : 'Experience'}</span>
                <span className="value">{candidate.yearsOfExperience} {language === 'fr' ? 'ans' : 'years'}</span>
              </div>
              <div className="stat">
                <span className="label">{language === 'fr' ? 'Disponibilité' : 'Availability'}</span>
                <span className="value">{availabilityLabels[candidate.availability][language]}</span>
              </div>
              <div className="stat">
                <span className="label">{language === 'fr' ? 'Langues' : 'Languages'}</span>
                <span className="value">{candidate.languages.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="profile-section">
            <h2>{language === 'fr' ? 'À Propos' : 'About'}</h2>
            <p>{candidate.bio}</p>
          </div>

          {/* Expectations */}
          <div className="profile-section">
            <h2>{language === 'fr' ? 'Attentes Professionnelles' : 'Professional Expectations'}</h2>
            <p>{candidate.expectations}</p>
          </div>

          {/* Skills */}
          <div className="profile-section">
            <h2>{language === 'fr' ? 'Compétences' : 'Skills'}</h2>
            <div className="skills-grid">
              {candidate.skills.map(skill => (
                <span key={skill} className="skill-badge-large">{skill}</span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="profile-section">
            <h2>{language === 'fr' ? 'Expérience Professionnelle' : 'Professional Experience'}</h2>
            <div className="experience-list">
              {candidate.experience.map((exp) => (
                <div key={exp.id} className={`experience-item ${exp.current ? 'current' : ''}`}>
                  <div className="experience-header">
                    <div className="exp-title-duration">
                      <h3>{exp.position}</h3>
                      <p className="company">{exp.company}</p>
                    </div>
                    <span className="duration">
                      {exp.duration}
                      {exp.current && (
                        <span className="current-badge">
                          {language === 'fr' ? 'Actuel' : 'Current'}
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="description">{exp.description}</p>
                  <div className="tech-stack">
                    {exp.technologies.map(tech => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CV Section */}
          <div className="profile-section">
            <h2>{language === 'fr' ? 'Documents' : 'Documents'}</h2>
            <div className="cv-section">
              <div className="cv-card">
                <span className="cv-icon">📄</span>
                <div className="cv-info">
                  <h3>{language === 'fr' ? 'Curriculum Vitae' : 'Curriculum Vitae'}</h3>
                  <p>{language === 'fr' ? 'PDF - Format complet' : 'PDF - Full format'}</p>
                </div>
                <button className="btn-download">
                  {language === 'fr' ? 'Télécharger' : 'Download'}
                </button>
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="profile-actions">
            <button className="btn-contact primary">
              {language === 'fr' ? 'Envoyer une Offre' : 'Send Job Offer'}
            </button>
            <button className="btn-contact secondary">
              {language === 'fr' ? 'Envoyer un Message' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
