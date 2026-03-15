import { useEffect, useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { useTheme } from '../utils/ThemeContext'
import { useAuth } from '../utils/AuthContext'
import { jobDomains } from '../data/jobDomains'
import type { Candidate } from '../data/candidates'
import { CandidateProfile } from '../components/CandidateProfile'
import { PremiumBackground } from '../components/PremiumBackground'
import { JobOfferRequestForm } from '../components/JobOfferRequestForm'
import { getCandidatesByDomain, getDomainStats } from '../services/candidateService'

export function TalentSearchPage() {
  const { language } = useLanguage()
  const { isDark } = useTheme()
  const { userType } = useAuth()
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [domainCounts, setDomainCounts] = useState<Record<string, number>>({})
  const [domainCandidates, setDomainCandidates] = useState<Candidate[]>([])
  const [isLoadingDomains, setIsLoadingDomains] = useState(true)
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [showJobOfferForm, setShowJobOfferForm] = useState(false)

  const selectedCandidateData = selectedCandidate
    ? domainCandidates.find(c => c.id === selectedCandidate)
    : null

  useEffect(() => {
    const loadDomainCounts = async () => {
      setIsLoadingDomains(true)
      const stats = await getDomainStats()
      if (stats) {
        setDomainCounts(stats.domainCounts)
      }
      setIsLoadingDomains(false)
    }

    loadDomainCounts()
  }, [])

  useEffect(() => {
    const loadCandidates = async () => {
      if (!selectedDomain) {
        setDomainCandidates([])
        return
      }

      setIsLoadingCandidates(true)
      const data = await getCandidatesByDomain(selectedDomain)
      setDomainCandidates(data)
      setIsLoadingCandidates(false)
    }

    loadCandidates()
  }, [selectedDomain])

  return (
    <div className={`talent-search-page ${isDark ? 'dark' : 'light'}`}>
      <PremiumBackground />

      {/* Job Offer Request Form Modal */}
      {showJobOfferForm && (
        <div className="modal-overlay" onClick={() => setShowJobOfferForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <JobOfferRequestForm
              onSuccess={() => {
                alert(language === 'fr' 
                  ? 'Demande soumise avec succès! En attente d\'approbation.' 
                  : 'Request submitted successfully! Awaiting approval.')
                setShowJobOfferForm(false)
              }}
              onClose={() => setShowJobOfferForm(false)}
            />
          </div>
        </div>
      )}

      {/* Show domains when no domain is selected */}
      {!selectedDomain ? (
        <div className="talent-search-container">
          <div className="talent-search-header">
            <h1>{language === 'fr' ? 'Trouver des Talents' : 'Find Talent'}</h1>
            <p>
              {language === 'fr'
                ? 'Explorez nos domaines d\'emploi et découvrez les meilleurs candidats'
                : 'Explore our job domains and discover the best candidates'}
            </p>
          </div>

          {userType === 'recruiter' ? (
            <div className="recruiter-inline-form">
              <JobOfferRequestForm />
            </div>
          ) : (
            <>
              <button
                className="btn-submit-job-offer"
                onClick={() => setShowJobOfferForm(true)}
              >
                {language === 'fr' ? '📋 Soumettre une Offre d\'Emploi' : '📋 Submit Job Offer'}
              </button>
              <div className="domains-grid">
                {jobDomains.map(domain => (
                  <div
                    key={domain.id}
                    className="domain-card"
                    onClick={() => setSelectedDomain(domain.id)}
                    style={{ borderColor: domain.color }}
                  >
                    <div className="domain-icon">{domain.icon}</div>
                    <h3>{language === 'fr' ? domain.name : domain.nameEn}</h3>
                    <p>{language === 'fr' ? domain.description : domain.descriptionEn}</p>
                    <div className="domain-meta">
                      <span className="candidate-count">
                        {(domainCounts[domain.id] ?? 0)} {language === 'fr' ? 'candidats' : 'candidates'}
                      </span>
                      <span className="arrow">→</span>
                    </div>
                  </div>
                ))}
              </div>
              {isLoadingDomains && (
                <p style={{ textAlign: 'center', marginTop: '16px' }}>
                  {language === 'fr' ? 'Chargement des statistiques...' : 'Loading statistics...'}
                </p>
              )}
            </>
          )}
        </div>
      ) : !selectedCandidateData ? (
        // Show candidates in selected domain
        <div className="candidates-container">
          <div className="candidates-header">
            <button
              className="btn-back"
              onClick={() => setSelectedDomain(null)}
            >
              ← {language === 'fr' ? 'Retour' : 'Back'}
            </button>
            <h1>
              {jobDomains.find(d => d.id === selectedDomain)?.[language === 'fr' ? 'name' : 'nameEn']}
            </h1>
            <p>
              {language === 'fr' ? 'Sélectionnez un candidat pour voir son profil' : 'Select a candidate to view their profile'}
            </p>
          </div>

          <div className="candidates-grid">
            {isLoadingCandidates && (
              <p>{language === 'fr' ? 'Chargement des candidats...' : 'Loading candidates...'}</p>
            )}
            {domainCandidates.map(candidate => (
              <div
                key={candidate.id}
                className="candidate-card"
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div className="candidate-avatar">{candidate.profileImage}</div>
                <h3>{candidate.name}</h3>
                <p className="candidate-title">{candidate.title}</p>
                <p className="candidate-location">
                  📍 {language === 'fr' ? candidate.locationXOF || candidate.location : candidate.location}
                </p>
                <div className="candidate-exp">
                  <span>
                    {candidate.yearsOfExperience} {language === 'fr' ? 'ans' : 'years'}
                  </span>
                </div>
                <div className="candidate-skills">
                  {candidate.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="skill-badge">{skill}</span>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="skill-more">+{candidate.skills.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Show detailed candidate profile
        <CandidateProfile 
          candidate={selectedCandidateData}
          onBack={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}
