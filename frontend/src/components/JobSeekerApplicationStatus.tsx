import React, { useState, useEffect } from 'react'
import { getMyApplications, deleteMyApplication } from '../services/applicationService'
import { ApplicationWithJobOffer } from '../services/applicationService'
import '../styles/job-seeker-applications.css'

export const JobSeekerApplicationStatus: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationWithJobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | ApplicationWithJobOffer['status']>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyApplications()
      setApplications(data)
    } catch (err) {
      setError('Erreur lors du chargement de vos candidatures')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredApplications = () => {
    if (filter === 'all') return applications
    return applications.filter((app) => app.status === filter)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <span className="badge badge-pending">⏳ Candidature en attente</span>
      case 'reviewing':
        return <span className="badge badge-reviewing">👀 En cours d'examen</span>
      case 'shortlisted':
        return <span className="badge badge-shortlisted">⭐ Vous etes shortlisté</span>
      case 'interview_scheduled':
        return <span className="badge badge-interview">📅 Entretien planifié</span>
      case 'accepted':
        return <span className="badge badge-accepted">✅ Candidature Acceptée!</span>
      case 'rejected':
        return <span className="badge badge-rejected">❌ Candidature Rejetée</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Le recruteur examinera votre candidature bientôt'
      case 'reviewing':
        return 'Votre profil est actuellement en cours d evaluation par le recruteur.'
      case 'shortlisted':
        return 'Bonne progression: votre candidature fait partie de la shortlist.'
      case 'interview_scheduled':
        return 'Un entretien a ete planifie. Consultez la date communiquee ci-dessous.'
      case 'accepted':
        return '🎉 Félicitations! Le recruteur a accepté votre candidature. Vous serez bientôt contacté!'
      case 'rejected':
        return 'Malheureusement, votre candidature a été rejetée. Vous pouvez postuler à d\'autres offres.'
      default:
        return ''
    }
  }

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Supprimer cette candidature ?')) return
    setDeletingId(applicationId)
    try {
      const ok = await deleteMyApplication(applicationId)
      if (ok) {
        setApplications((prev) => prev.filter((a) => a._id !== applicationId))
      } else {
        alert('Impossible de supprimer la candidature')
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="job-seeker-applications">
        <div className="loading">⏳ Chargement de vos candidatures...</div>
      </div>
    )
  }

  const filteredApps = getFilteredApplications()

  return (
    <div className="job-seeker-applications">
      <h2>📋 Mes Candidatures</h2>

      {error && <div className="error-message">{error}</div>}

      {applications.length > 0 && (
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes ({applications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'applied' ? 'active' : ''}`}
            onClick={() => setFilter('applied')}
          >
            En Attente ({applications.filter((a) => a.status === 'applied').length})
          </button>
          <button
            className={`filter-btn ${filter === 'reviewing' ? 'active' : ''}`}
            onClick={() => setFilter('reviewing')}
          >
            En revue ({applications.filter((a) => a.status === 'reviewing').length})
          </button>
          <button
            className={`filter-btn ${filter === 'shortlisted' ? 'active' : ''}`}
            onClick={() => setFilter('shortlisted')}
          >
            Shortlist ({applications.filter((a) => a.status === 'shortlisted').length})
          </button>
          <button
            className={`filter-btn ${filter === 'interview_scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('interview_scheduled')}
          >
            Entretien ({applications.filter((a) => a.status === 'interview_scheduled').length})
          </button>
          <button
            className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Acceptées ({applications.filter((a) => a.status === 'accepted').length})
          </button>
          <button
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejetées ({applications.filter((a) => a.status === 'rejected').length})
          </button>
        </div>
      )}

      {filteredApps.length === 0 ? (
        <div className="empty-state">
          <p>
            {applications.length === 0
              ? 'Vous n\'avez pas encore postulé à d\'offres d\'emploi'
              : 'Aucune candidature ne correspond à ce filtre'}
          </p>
        </div>
      ) : (
        <div className="applications-list">
          {filteredApps.map((app) => (
            <div key={app._id} className={`application-card status-${app.status}`}>
              <div className="card-header">
                <div className="job-info">
                  <h3>{(app.jobOfferId as any).title || 'Poste'}</h3>
                  <p className="company">
                    {(app.jobOfferId as any).companyName || 'Entreprise'}
                  </p>
                </div>
                <div className="status">{getStatusBadge(app.status)}</div>
              </div>

              <div className="card-body">
                <p className="status-message">{getStatusMessage(app.status)}</p>

                <div className="job-details">
                  <div className="detail-item">
                    <span className="label">📍 Lieu:</span>
                    <span className="value">
                      {(app.jobOfferId as any).location || 'Non spécifié'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">💰 Salaire:</span>
                    <span className="value">
                      {(app.jobOfferId as any).salary
                        ? `${(app.jobOfferId as any).salary} FCFA`
                        : 'Non spécifié'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">📊 Postes:</span>
                    <span className="value">
                      {(app.jobOfferId as any).numberOfPositions || 'N/A'} poste(s)
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">🎯 Match:</span>
                    <span className="value">{app.matchScore || 0}%</span>
                  </div>
                </div>

                {app.matchReasons && app.matchReasons.length > 0 && (
                  <div className="job-details">
                    <div className="detail-item detail-item-column">
                      <span className="label">Pourquoi cette offre vous correspond:</span>
                      <div className="match-reason-list">
                        {app.matchReasons.map((reason) => (
                          <span key={reason} className="match-reason-pill">{reason}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="timestamps">
                  <small>
                    📅 Candidature: {new Date(app.appliedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </small>

                  {app.acceptedAt && (
                    <small>
                      ✅ Acceptée: {new Date(app.acceptedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </small>
                  )}

                  {app.rejectedAt && (
                    <small>
                      ❌ Rejetée: {new Date(app.rejectedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </small>
                  )}

                  {app.interviewDate && (
                    <small>
                      📅 Entretien: {new Date(app.interviewDate).toLocaleString('fr-FR')}
                    </small>
                  )}

                  {app.recruiterNote && (
                    <small>
                      📝 Note recruteur: {app.recruiterNote}
                    </small>
                  )}
                </div>

                <div className="card-actions" style={{ marginTop: '1rem' }}>
                  <button
                    className="btn-reject"
                    onClick={() => handleDelete(app._id)}
                    disabled={deletingId === app._id}
                  >
                    {deletingId === app._id ? '⏳ Suppression...' : '🗑️ Supprimer'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default JobSeekerApplicationStatus
