import { memo, useState, useCallback, useEffect } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { getPendingJobOffers, approveJobOffer, rejectJobOffer, type JobOffer } from '../services/jobOfferService'
import '../styles/ContentModerationPage.css'

const ContentModerationPage = memo(() => {
  const { language } = useLanguage()
  const [postings, setPostings] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedPosting, setSelectedPosting] = useState<JobOffer | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load pending job offers on mount
  useEffect(() => {
    loadPostings()
  }, [])

  const loadPostings = async () => {
    try {
      setLoading(true)
      setError(null)
      const offers = await getPendingJobOffers()
      setPostings(offers)
    } catch (err) {
      console.error('Failed to load postings:', err)
      setError(language === 'fr' ? 'Erreur lors du chargement' : 'Failed to load postings')
    } finally {
      setLoading(false)
    }
  }

  const filteredPostings = postings.filter(p => {
    if (filterStatus === 'all') return true
    return p.publicationStatus === filterStatus
  })

  const handleApprove = useCallback(async (id: string) => {
    try {
      setActionLoading(true)
      const updated = await approveJobOffer(id)
      if (updated) {
        setPostings(postings.map(p =>
          p._id === id ? { ...p, publicationStatus: 'approved' } : p
        ))
        setSelectedPosting(null)
      }
    } catch (err) {
      console.error('Failed to approve:', err)
      setError(language === 'fr' ? 'Erreur lors de l\'approbation' : 'Failed to approve')
    } finally {
      setActionLoading(false)
    }
  }, [postings, language])

  const handleReject = useCallback(async (id: string) => {
    if (!rejectionReason.trim()) {
      setError(language === 'fr' ? 'Veuillez entrer une raison de rejet' : 'Please enter a rejection reason')
      return
    }

    try {
      setActionLoading(true)
      const updated = await rejectJobOffer(id, rejectionReason)
      if (updated) {
        setPostings(postings.map(p =>
          p._id === id ? { ...p, publicationStatus: 'rejected', rejectionReason } : p
        ))
        setRejectionReason('')
        setSelectedPosting(null)
        setError(null)
      }
    } catch (err) {
      console.error('Failed to reject:', err)
      setError(language === 'fr' ? 'Erreur lors du rejet' : 'Failed to reject')
    } finally {
      setActionLoading(false)
    }
  }, [postings, rejectionReason, language])

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending': return 'status-badge status-pending'
      case 'approved': return 'status-badge status-approved'
      case 'rejected': return 'status-badge status-rejected'
      default: return 'status-badge'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return '⏳'
      case 'approved': return '✅'
      case 'rejected': return '❌'
      default: return '•'
    }
  }

  const getStatusLabel = (status: string) => {
    if (language === 'fr') {
      switch(status) {
        case 'pending': return 'En attente'
        case 'approved': return 'Approuvé'
        case 'rejected': return 'Rejeté'
        default: return status
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')
    } catch {
      return dateString
    }
  }

  const pendingCount = postings.filter(p => p.publicationStatus === 'pending').length
  const approvedCount = postings.filter(p => p.publicationStatus === 'approved').length
  const rejectedCount = postings.filter(p => p.publicationStatus === 'rejected').length

  return (
    <div className="content-moderation-page">
      <div className="content-moderation-container">
        {/* Header */}
        <div className="moderation-header">
          <div className="moderation-header-content">
            <div className="moderation-header-top">
              <div>
                <h1 className="moderation-title">
                  {language === 'fr' ? '🛡️ Modération du contenu' : '🛡️ Content Moderation'}
                </h1>
                <p className="moderation-subtitle">
                  {language === 'fr' 
                    ? `${pendingCount} offre(s) en attente d'approbation`
                    : `${pendingCount} posting(s) pending approval`
                  }
                </p>
              </div>
              <div className="header-stats">
                <div className="stat-item">
                  <span className="stat-value">{approvedCount}</span>
                  <span className="stat-label">{language === 'fr' ? 'Approuvés' : 'Approved'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{rejectedCount}</span>
                  <span className="stat-label">{language === 'fr' ? 'Rejetés' : 'Rejected'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="moderation-filters">
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            ⏳ {language === 'fr' ? 'En attente' : 'Pending'} ({postings.filter(p => p.publicationStatus === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            ✅ {language === 'fr' ? 'Approuvés' : 'Approved'} ({postings.filter(p => p.publicationStatus === 'approved').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            ❌ {language === 'fr' ? 'Rejetés' : 'Rejected'} ({postings.filter(p => p.publicationStatus === 'rejected').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            📋 {language === 'fr' ? 'Tous' : 'All'} ({postings.length})
          </button>
        </div>

        <div className="moderation-content">
          {/* Postings List */}
          <div className="postings-list">
            {loading ? (
              <div className="loading-message">
                <p>{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
              </div>
            ) : filteredPostings.length === 0 ? (
              <div className="no-postings-message">
                <p>
                  {filterStatus === 'pending'
                    ? language === 'fr' ? 'Aucune offre en attente' : 'No pending postings'
                    : language === 'fr' ? 'Aucune offre trouvée' : 'No postings found'
                  }
                </p>
              </div>
            ) : (
              filteredPostings.map((posting) => (
                <div
                  key={posting._id}
                  className={`posting-card ${selectedPosting?._id === posting._id ? 'selected' : ''}`}
                  onClick={() => setSelectedPosting(posting)}
                >
                  <div className="posting-card-inner">
                    <div className="posting-card-badges">
                      <span className={getStatusBadgeClass(posting.publicationStatus)}>
                        {getStatusIcon(posting.publicationStatus)} {getStatusLabel(posting.publicationStatus)}
                      </span>
                    </div>
                    
                    <div className="posting-card-header">
                      <div className="posting-card-title-section">
                        <h3 className="posting-card-title">{posting.title}</h3>
                        <p className="posting-card-company">🏢 {posting.recruiter?.name || 'Unknown'}</p>
                      </div>
                    </div>

                    <p className="posting-card-description">{posting.description}</p>

                    <div className="posting-card-footer">
                      <div className="posting-card-meta">
                        <span className="meta-item">📅 {formatDate(posting.createdAt)}</span>
                        <span className="meta-item">👤 {posting.recruiter?.email || 'N/A'}</span>
                        <span className="meta-item">📍 {posting.location || 'Web'}</span>
                      </div>
                      <div className="card-action-hint">
                        {language === 'fr' ? 'Cliquez pour voir les détails' : 'Click for details'} →
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details Panel */}
          {selectedPosting && (
            <div className="details-panel">
              <div className="details-header">
                <div>
                  <h2 className="details-title">{selectedPosting.title}</h2>
                  <p className="details-company">🏢 {selectedPosting.recruiter?.name || 'Unknown'}</p>
                </div>
                <button
                  className="close-btn"
                  onClick={() => setSelectedPosting(null)}
                  title={language === 'fr' ? 'Fermer' : 'Close'}
                >
                  ✕
                </button>
              </div>

              <div className="details-content">
                <div className="details-badges-section">
                  <span className={getStatusBadgeClass(selectedPosting.publicationStatus)}>
                    {getStatusIcon(selectedPosting.publicationStatus)} {getStatusLabel(selectedPosting.publicationStatus)}
                  </span>
                </div>

                <div className="detail-section">
                  <p className="detail-label">📝 {language === 'fr' ? 'Description' : 'Description'}</p>
                  <div className="detail-value detail-description">{selectedPosting.description}</div>
                </div>

                {selectedPosting.location && (
                  <div className="detail-section">
                    <p className="detail-label">📍 {language === 'fr' ? 'Localisation' : 'Location'}</p>
                    <div className="detail-value">{selectedPosting.location}</div>
                  </div>
                )}

                {selectedPosting.positionsAvailable && (
                  <div className="detail-section">
                    <p className="detail-label">💼 {language === 'fr' ? 'Postes disponibles' : 'Positions Available'}</p>
                    <div className="detail-value">{selectedPosting.positionsAvailable}</div>
                  </div>
                )}

                {selectedPosting.requiredSkills && selectedPosting.requiredSkills.length > 0 && (
                  <div className="detail-section">
                    <p className="detail-label">🎯 {language === 'fr' ? 'Compétences requises' : 'Required Skills'}</p>
                    <div className="detail-value">
                      {selectedPosting.requiredSkills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-separator"></div>

                <div className="detail-section detail-meta-section">
                  <div className="detail-meta-item">
                    <span className="detail-meta-icon">📅</span>
                    <div>
                      <p className="detail-label">{language === 'fr' ? 'Date de soumission' : 'Submitted Date'}</p>
                      <p className="detail-value">{formatDate(selectedPosting.createdAt)}</p>
                    </div>
                  </div>

                  <div className="detail-meta-item">
                    <span className="detail-meta-icon">👤</span>
                    <div>
                      <p className="detail-label">{language === 'fr' ? 'Soumis par' : 'Submitted By'}</p>
                      <p className="detail-value detail-email">{selectedPosting.recruiter?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {selectedPosting.rejectionReason && (
                  <div className="detail-section">
                    <p className="detail-label">⚠️ {language === 'fr' ? 'Raison du rejet' : 'Rejection Reason'}</p>
                    <div className="rejection-reason-box">{selectedPosting.rejectionReason}</div>
                  </div>
                )}

                <div className="detail-separator"></div>

                {selectedPosting.publicationStatus === 'pending' && (
                  <div className="action-section">
                    <label className="rejection-label">
                      {language === 'fr' ? '📝 Commentaire (optionnel)' : '📝 Comment (optional)'}
                    </label>
                    <textarea
                      placeholder={language === 'fr' 
                        ? 'Entrez vos commentaires ou raison de rejet...' 
                        : 'Enter your comments or rejection reason...'}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="rejection-textarea"
                      disabled={actionLoading}
                    />

                    <div className="action-buttons">
                      <button
                        className="action-btn action-approve"
                        onClick={() => handleApprove(selectedPosting._id)}
                        disabled={actionLoading}
                      >
                        <span className="btn-icon">✅</span>
                        <span>{actionLoading ? (language === 'fr' ? 'Chargement...' : 'Loading...') : (language === 'fr' ? 'Approuver' : 'Approve')}</span>
                      </button>
                      <button
                        className="action-btn action-reject"
                        onClick={() => handleReject(selectedPosting._id)}
                        disabled={actionLoading}
                      >
                        <span className="btn-icon">❌</span>
                        <span>{actionLoading ? (language === 'fr' ? 'Chargement...' : 'Loading...') : (language === 'fr' ? 'Rejeter' : 'Reject')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

ContentModerationPage.displayName = 'ContentModerationPage'

export default ContentModerationPage
