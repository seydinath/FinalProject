import { useEffect, useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { useTheme } from '../utils/ThemeContext'
import { useAuth } from '../utils/AuthContext'
import { PremiumBackground } from '../components/PremiumBackground'
import {
  getCandidateOpportunityDashboard,
  getRecruiterPipelineDashboard,
  type CandidateOpportunityDashboard,
  type RecruiterPipelineDashboard,
} from '../services/applicationService'

interface DashboardProps {
  onNavigateToNotifications: () => void
  onNavigateToTalentSearch: () => void
  onNavigateToRecruiterApplications: () => void
  onNavigateToProfile: () => void
  onNavigateToMyApplications: () => void
  onLogout: () => void
}

export function DashboardPage({
  onNavigateToNotifications,
  onNavigateToTalentSearch,
  onNavigateToRecruiterApplications,
  onNavigateToProfile,
  onNavigateToMyApplications,
  onLogout,
}: DashboardProps) {
  const { language } = useLanguage()
  const { isDark } = useTheme()
  const { userEmail, userType, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [recruiterDashboard, setRecruiterDashboard] = useState<RecruiterPipelineDashboard | null>(null)
  const [candidateDashboard, setCandidateDashboard] = useState<CandidateOpportunityDashboard | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      if (userType === 'recruiter') {
        setRecruiterDashboard(await getRecruiterPipelineDashboard())
      }
      if (userType === 'job_seeker') {
        setCandidateDashboard(await getCandidateOpportunityDashboard())
      }
      setLoading(false)
    }

    loadDashboard()
  }, [userType])

  const handleLogout = () => {
    logout()
    onLogout()
  }

  return (
    <div className={`dashboard-page ${isDark ? 'dark' : 'light'}`}>
      <PremiumBackground />

      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-title">
            <h1>{language === 'fr' ? 'Bienvenue' : 'Welcome'}</h1>
            <p>{userEmail}</p>
          </div>
          <button className="btn-logout-dashboard" onClick={handleLogout}>
            {language === 'fr' ? '🚪 Déconnexion' : '🚪 Logout'}
          </button>
        </div>

        {loading && (
          <div className="dashboard-live-panel">
            <p>{language === 'fr' ? 'Chargement du tableau de bord...' : 'Loading dashboard...'}</p>
          </div>
        )}

        {!loading && userType === 'recruiter' && recruiterDashboard && (
          <>
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card">
                <span>{language === 'fr' ? 'Offres actives' : 'Active offers'}</span>
                <strong>{recruiterDashboard.summary.activeOffers}</strong>
              </div>
              <div className="dashboard-stat-card">
                <span>{language === 'fr' ? 'Candidatures totales' : 'Total applications'}</span>
                <strong>{recruiterDashboard.summary.totalApplications}</strong>
              </div>
              <div className="dashboard-stat-card">
                <span>{language === 'fr' ? 'Entretiens planifies' : 'Interviews scheduled'}</span>
                <strong>{recruiterDashboard.summary.byStatus.interview_scheduled}</strong>
              </div>
              <div className="dashboard-stat-card">
                <span>{language === 'fr' ? 'Match moyen' : 'Average match'}</span>
                <strong>{recruiterDashboard.summary.averageMatchScore}%</strong>
              </div>
            </div>

            <div className="dashboard-live-section">
              <div className="section-heading-row">
                <h2>{language === 'fr' ? 'Pipeline par offre' : 'Pipeline by job offer'}</h2>
                <button className="section-link-btn" onClick={onNavigateToRecruiterApplications}>
                  {language === 'fr' ? 'Ouvrir le pipeline' : 'Open pipeline'}
                </button>
              </div>
              <div className="pipeline-offers-list">
                {recruiterDashboard.offers.slice(0, 4).map((offer) => (
                  <article key={offer.jobOfferId} className="pipeline-offer-card">
                    <div className="pipeline-offer-top">
                      <div>
                        <h3>{offer.title}</h3>
                        <p>{offer.companyName} {offer.location ? `• ${offer.location}` : ''}</p>
                      </div>
                      <span className="match-pill">{offer.averageMatchScore}%</span>
                    </div>
                    <div className="pipeline-mini-stats">
                      <span>{language === 'fr' ? 'Nouvelles' : 'New'}: {offer.pipelineCounts.applied}</span>
                      <span>{language === 'fr' ? 'En revue' : 'Reviewing'}: {offer.pipelineCounts.reviewing}</span>
                      <span>{language === 'fr' ? 'Shortlist' : 'Shortlisted'}: {offer.pipelineCounts.shortlisted}</span>
                      <span>{language === 'fr' ? 'Entretien' : 'Interview'}: {offer.pipelineCounts.interview_scheduled}</span>
                    </div>
                    <div className="top-match-list">
                      {offer.topCandidates.slice(0, 3).map((candidate) => (
                        <div key={candidate._id} className="top-match-item">
                          <span>{candidate.candidateName}</span>
                          <span>{candidate.matchScore || 0}%</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && userType === 'job_seeker' && candidateDashboard && (
          <>
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card">
                <span>{language === 'fr' ? 'Candidatures actives' : 'Active applications'}</span>
                <strong>{candidateDashboard.summary.activeApplications}</strong>
              </div>
              <div className="dashboard-stat-card">
                <span>{language === 'fr' ? 'Entretiens planifies' : 'Interviews scheduled'}</span>
                <strong>{candidateDashboard.summary.interviewsScheduled}</strong>
              </div>
              <div className="dashboard-stat-card">
                <span>{language === 'fr' ? 'Taux de profil' : 'Profile completion'}</span>
                <strong>{candidateDashboard.summary.profileCompletion}%</strong>
              </div>
              <div className="dashboard-stat-card">
                <span>{language === 'fr' ? 'Opportunites recommandees' : 'Recommended opportunities'}</span>
                <strong>{candidateDashboard.summary.recommendationCount}</strong>
              </div>
            </div>

            <div className="dashboard-live-section">
              <div className="section-heading-row">
                <h2>{language === 'fr' ? 'Opportunites recommandees' : 'Recommended opportunities'}</h2>
                <button className="section-link-btn" onClick={onNavigateToMyApplications}>
                  {language === 'fr' ? 'Voir mes candidatures' : 'See my applications'}
                </button>
              </div>
              <div className="opportunity-list">
                {candidateDashboard.recommendedJobs.map((job) => (
                  <article key={job._id} className="opportunity-card">
                    <div className="pipeline-offer-top">
                      <div>
                        <h3>{job.title}</h3>
                        <p>{job.companyName} {job.location ? `• ${job.location}` : ''}</p>
                      </div>
                      <span className="match-pill">{job.matchScore}%</span>
                    </div>
                    <p className="opportunity-copy">{job.description || ''}</p>
                    <div className="reason-list">
                      {job.matchReasons.map((reason) => (
                        <span key={reason} className="reason-pill">{reason}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Options Grid */}
        <div className="dashboard-grid">
          {userType === 'recruiter' && (
            <>
              <div className="dashboard-card" onClick={onNavigateToTalentSearch}>
                <div className="card-icon">🔍</div>
                <h2>{language === 'fr' ? 'Je cherche des talents' : 'Find Talent'}</h2>
                <p>
                  {language === 'fr'
                    ? 'Soumettez vos offres, suivez leur validation admin et attirez des candidats qualifiés.'
                    : 'Submit offers, track admin approval, and attract qualified candidates.'}
                </p>
                <div className="card-features">
                  <span>✓ {language === 'fr' ? 'Soumission d\'offres' : 'Offer submission'}</span>
                  <span>✓ {language === 'fr' ? 'Validation admin' : 'Admin approval workflow'}</span>
                  <span>✓ {language === 'fr' ? 'Recherche de candidats' : 'Candidate search'}</span>
                </div>
                <div className="card-cta">{language === 'fr' ? 'Ouvrir →' : 'Open →'}</div>
              </div>

              <div className="dashboard-card" onClick={onNavigateToRecruiterApplications}>
                <div className="card-icon">📥</div>
                <h2>{language === 'fr' ? 'Gérer les candidatures' : 'Manage Applications'}</h2>
                <p>
                  {language === 'fr'
                    ? 'Consultez les candidats, acceptez/rejetez et débloquez le téléphone après validation.'
                    : 'Review applicants, accept/reject, and unlock phone access after validation.'}
                </p>
                <div className="card-features">
                  <span>✓ {language === 'fr' ? 'Vue par offre' : 'Per-offer view'}</span>
                  <span>✓ {language === 'fr' ? 'Acceptation/Rejet' : 'Accept/Reject workflow'}</span>
                  <span>✓ {language === 'fr' ? 'Contact après validation' : 'Contact after validation'}</span>
                </div>
                <div className="card-cta">{language === 'fr' ? 'Voir →' : 'View →'}</div>
              </div>

              <div className="dashboard-card" onClick={onNavigateToNotifications}>
                <div className="card-icon">🔔</div>
                <h2>{language === 'fr' ? 'Centre notifications' : 'Notification Center'}</h2>
                <p>
                  {language === 'fr'
                    ? 'Consultez votre historique, filtrez les alertes et suivez les mises a jour importantes.'
                    : 'Browse history, filter alerts, and follow critical updates.'}
                </p>
                <div className="card-features">
                  <span>✓ {language === 'fr' ? 'Historique complet' : 'Full history'}</span>
                  <span>✓ {language === 'fr' ? 'Filtre lu / non lu' : 'Read/unread filters'}</span>
                  <span>✓ {language === 'fr' ? 'Alertes en temps reel' : 'Realtime alerts'}</span>
                </div>
                <div className="card-cta">{language === 'fr' ? 'Ouvrir →' : 'Open →'}</div>
              </div>
            </>
          )}

          {userType === 'job_seeker' && (
            <>
              <div className="dashboard-card" onClick={onNavigateToProfile}>
                <div className="card-icon">👤</div>
                <h2>{language === 'fr' ? 'Mon profil & CV' : 'My Profile & CV'}</h2>
                <p>
                  {language === 'fr'
                    ? 'Mettez à jour vos coordonnées, compétences, expérience et CV.'
                    : 'Update contact details, skills, experience, and CV.'}
                </p>
                <div className="card-features">
                  <span>✓ {language === 'fr' ? 'Profil persistant' : 'Persisted profile'}</span>
                  <span>✓ {language === 'fr' ? 'Upload CV' : 'CV upload'}</span>
                  <span>✓ {language === 'fr' ? 'Données MongoDB' : 'MongoDB-backed data'}</span>
                </div>
                <div className="card-cta">{language === 'fr' ? 'Modifier →' : 'Edit →'}</div>
              </div>

              <div className="dashboard-card" onClick={onNavigateToMyApplications}>
                <div className="card-icon">📄</div>
                <h2>{language === 'fr' ? 'Mes candidatures' : 'My Applications'}</h2>
                <p>
                  {language === 'fr'
                    ? 'Suivez le statut de vos candidatures et supprimez celles non pertinentes.'
                    : 'Track application status and delete irrelevant submissions.'}
                </p>
                <div className="card-features">
                  <span>✓ {language === 'fr' ? 'Statut en temps réel' : 'Real-time status'}</span>
                  <span>✓ {language === 'fr' ? 'Historique complet' : 'Full history'}</span>
                  <span>✓ {language === 'fr' ? 'Suppression possible' : 'Delete support'}</span>
                </div>
                <div className="card-cta">{language === 'fr' ? 'Consulter →' : 'Review →'}</div>
              </div>

              <div className="dashboard-card" onClick={onNavigateToNotifications}>
                <div className="card-icon">🔔</div>
                <h2>{language === 'fr' ? 'Mes notifications' : 'My Notifications'}</h2>
                <p>
                  {language === 'fr'
                    ? 'Retrouvez vos reponses de candidature et autres alertes importantes.'
                    : 'Track application outcomes and all important alerts in one place.'}
                </p>
                <div className="card-features">
                  <span>✓ {language === 'fr' ? 'Historique complet' : 'Full history'}</span>
                  <span>✓ {language === 'fr' ? 'Filtrage par type' : 'Filter by type'}</span>
                  <span>✓ {language === 'fr' ? 'Mise a jour instantanee' : 'Instant updates'}</span>
                </div>
                <div className="card-cta">{language === 'fr' ? 'Consulter →' : 'Review →'}</div>
              </div>
            </>
          )}
        </div>

        {/* Info Section */}
        {userType === 'recruiter' && (
          <div className="dashboard-info">
            <div className="info-card">
              <h3>{language === 'fr' ? '🎯 Flux Recruteur' : '🎯 Recruiter Flow'}</h3>
              <ul>
                <li>{language === 'fr' ? 'Soumettre une demande d\'offre' : 'Submit a job-offer request'}</li>
                <li>{language === 'fr' ? 'Attendre validation admin' : 'Wait for admin approval'}</li>
                <li>{language === 'fr' ? 'Traiter les candidatures reçues' : 'Process received applications'}</li>
              </ul>
            </div>
          </div>
        )}

        {userType === 'job_seeker' && (
          <div className="dashboard-info">
            <div className="info-card">
              <h3>{language === 'fr' ? '📈 Flux Candidat' : '📈 Job Seeker Flow'}</h3>
              <ul>
                <li>{language === 'fr' ? 'Maintenir le profil à jour' : 'Keep profile updated'}</li>
                <li>{language === 'fr' ? 'Postuler aux offres validées' : 'Apply to approved offers'}</li>
                <li>{language === 'fr' ? 'Suivre acceptation/rejet' : 'Track accept/reject status'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
