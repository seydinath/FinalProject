import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { useNavigation } from '../utils/NavigationContext'
import { useToast } from '../utils/ToastContext'
import { getPendingJobOfferRequests } from '../services/jobOfferRequestService'
import {
  getAdminApplicationsSummary,
  getAdminApplicantsByJob,
  getAdminValidatedCandidates,
  type ApplicationWithJobOffer,
} from '../services/applicationService'
import '../styles/AdminDashboardPage.css'

type Tab = 'requests' | 'applicants' | 'validated'

const AdminDashboardPage = () => {
  const { language } = useLanguage()
  const { navigateTo } = useNavigation()
  const { error: toastError } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('requests')
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [summary, setSummary] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  })
  const [jobsWithApplicants, setJobsWithApplicants] = useState<any[]>([])
  const [validatedCandidates, setValidatedCandidates] = useState<ApplicationWithJobOffer[]>([])

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [pending, appSummary, applicantsByJob, validated] = await Promise.all([
        getPendingJobOfferRequests(),
        getAdminApplicationsSummary(),
        getAdminApplicantsByJob(),
        getAdminValidatedCandidates(),
      ])

      setPendingRequests(pending)
      if (appSummary) setSummary(appSummary)
      setJobsWithApplicants(applicantsByJob?.jobs || [])
      setValidatedCandidates(validated?.candidates || [])
    } catch (_error) {
      toastError(language === 'fr' ? 'Erreur de chargement du dashboard admin' : 'Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const cards = useMemo(() => [
    {
      icon: '📋',
      labelFr: 'Demandes en attente',
      labelEn: 'Pending Requests',
      value: pendingRequests.length,
      action: () => navigateTo('admin-job-requests')
    },
    {
      icon: '📝',
      labelFr: 'Candidatures totales',
      labelEn: 'Total Applications',
      value: summary.totalApplications,
      action: () => navigateTo('reports')
    },
    {
      icon: '✅',
      labelFr: 'Candidats validés',
      labelEn: 'Validated Candidates',
      value: summary.acceptedApplications,
      action: () => setActiveTab('validated')
    },
    {
      icon: '⏳',
      labelFr: 'Candidatures en attente',
      labelEn: 'Pending Applications',
      value: summary.pendingApplications,
      action: () => setActiveTab('applicants')
    },
  ], [pendingRequests.length, summary, navigateTo])

  const quickActions = [
    {
      icon: '🛡️',
      titleFr: 'Demandes recruteurs',
      titleEn: 'Recruiter Requests',
      descriptionFr: 'Valider ou rejeter les demandes d\'offres.',
      descriptionEn: 'Approve or reject job offer requests.',
      page: 'admin-job-requests' as const,
    },
    {
      icon: '👥',
      titleFr: 'Utilisateurs',
      titleEn: 'Users',
      descriptionFr: 'Gérer les comptes et leurs statuts.',
      descriptionEn: 'Manage accounts and statuses.',
      page: 'user-management' as const,
    },
    {
      icon: '📈',
      titleFr: 'Analytiques',
      titleEn: 'Analytics',
      descriptionFr: 'Voir les indicateurs de performance.',
      descriptionEn: 'View performance indicators.',
      page: 'analytics' as const,
    },
    {
      icon: '📄',
      titleFr: 'Rapports',
      titleEn: 'Reports',
      descriptionFr: 'Consulter et exporter les rapports.',
      descriptionEn: 'View and export reports.',
      page: 'reports' as const,
    },
  ]

  const formatDate = (value?: string) => {
    if (!value) return ''
    try {
      return new Date(value).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')
    } catch {
      return value
    }
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <h1 className="admin-dashboard-title">
            {language === 'fr' ? 'Tableau de bord Admin' : 'Admin Dashboard'}
          </h1>
          <p className="admin-dashboard-subtitle">
            {language === 'fr'
              ? 'Vue globale en temps réel des demandes, candidatures et validations.'
              : 'Real-time global view of requests, applications, and validations.'}
          </p>
        </div>

        {loading ? (
          <p>{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
        ) : (
          <>
            <div className="admin-stats-grid">
              {cards.map((card) => (
                <button key={card.labelFr} className="admin-stat-card" onClick={card.action}>
                  <div className="admin-stat-icon">{card.icon}</div>
                  <div className="admin-stat-content">
                    <p className="admin-stat-label">{language === 'fr' ? card.labelFr : card.labelEn}</p>
                    <p className="admin-stat-value">{card.value}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="admin-menu-section">
              <h2 className="admin-menu-title">{language === 'fr' ? 'Accès rapide' : 'Quick Access'}</h2>
              <div className="admin-menu-grid">
                {quickActions.map((action) => (
                  <button
                    key={action.page}
                    className="admin-menu-card"
                    onClick={() => navigateTo(action.page)}
                  >
                    <div className="admin-menu-icon">{action.icon}</div>
                    <div className="admin-menu-content">
                      <p className="admin-menu-title">{language === 'fr' ? action.titleFr : action.titleEn}</p>
                      <p className="admin-menu-description">
                        {language === 'fr' ? action.descriptionFr : action.descriptionEn}
                      </p>
                    </div>
                    <span className="admin-menu-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-menu-section">
              <div className="admin-tab-row">
                <button
                  className={`admin-menu-card admin-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  {language === 'fr' ? 'Demandes recruteurs' : 'Recruiter Requests'} ({pendingRequests.length})
                </button>
                <button
                  className={`admin-menu-card admin-tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
                  onClick={() => setActiveTab('applicants')}
                >
                  {language === 'fr' ? 'Candidats par offre' : 'Applicants by Offer'} ({jobsWithApplicants.length})
                </button>
                <button
                  className={`admin-menu-card admin-tab-btn ${activeTab === 'validated' ? 'active' : ''}`}
                  onClick={() => setActiveTab('validated')}
                >
                  {language === 'fr' ? 'Validés par recruteurs' : 'Validated by Recruiters'} ({validatedCandidates.length})
                </button>
              </div>

              {activeTab === 'requests' && (
                <div className="admin-activity-section">
                  <h2 className="admin-activity-title">{language === 'fr' ? 'Demandes en attente' : 'Pending Requests'}</h2>
                  <div className="admin-activity-list">
                    {pendingRequests.length === 0 && <p>{language === 'fr' ? 'Aucune demande en attente.' : 'No pending requests.'}</p>}
                    {pendingRequests.map((r) => (
                      <div key={r._id} className="admin-activity-item">
                        <div className="admin-activity-content">
                          <p className="admin-activity-text">{r.companyName} - {r.location}</p>
                          <p className="admin-activity-time">{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'applicants' && (
                <div className="admin-activity-section">
                  <h2 className="admin-activity-title">{language === 'fr' ? 'Candidats par offre' : 'Applicants by Job Offer'}</h2>
                  <div className="admin-activity-list">
                    {jobsWithApplicants.length === 0 && <p>{language === 'fr' ? 'Aucune candidature.' : 'No applications.'}</p>}
                    {jobsWithApplicants.map((job) => (
                      <div key={job.jobOfferId} className="admin-activity-item">
                        <div className="admin-activity-content">
                          <p className="admin-activity-text">{job.title} - {job.companyName}</p>
                          <p className="admin-activity-time">{job.totalApplicants} {language === 'fr' ? 'candidat(s)' : 'applicant(s)'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'validated' && (
                <div className="admin-activity-section">
                  <h2 className="admin-activity-title">{language === 'fr' ? 'Candidats validés' : 'Validated Candidates'}</h2>
                  <div className="admin-activity-list">
                    {validatedCandidates.length === 0 && <p>{language === 'fr' ? 'Aucun candidat validé.' : 'No validated candidates.'}</p>}
                    {validatedCandidates.map((candidate) => (
                      <div key={candidate._id} className="admin-activity-item">
                        <div className="admin-activity-content">
                          <p className="admin-activity-text">
                            {candidate.candidateName} - {(candidate.jobOfferId as any)?.title || (language === 'fr' ? 'Offre' : 'Job')}
                          </p>
                          <p className="admin-activity-time">{formatDate(candidate.acceptedAt || candidate.appliedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
