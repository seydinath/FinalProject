import React, { useState, useEffect } from 'react'
import {
  getPendingJobOfferRequests,
  getAllJobOfferRequests,
  approveJobOfferRequest,
  rejectJobOfferRequest,
  JobOfferRequestResponse,
} from '../services/jobOfferRequestService'
import '../styles/admin-panel.css'

export const AdminJobOfferRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<JobOfferRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadRequests()
  }, [filter])

  const loadRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const data =
        filter === 'pending'
          ? await getPendingJobOfferRequests()
          : await getAllJobOfferRequests()
      setRequests(data)
    } catch (err) {
      setError('Erreur lors du chargement des demandes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    if (!confirm('Approuver cette demande d\'emploi ?')) return

    setProcessing(requestId)
    try {
      const success = await approveJobOfferRequest(requestId)
      if (success) {
        // Refresh list
        loadRequests()
      } else {
        alert('Erreur lors de l\'approbation')
      }
    } finally {
      setProcessing(null)
    }
  }

  const openRejectModal = (requestId: string) => {
    setRejectingId(requestId)
    setRejectionReason('')
  }

  const handleReject = async () => {
    if (!rejectingId) return
    if (!rejectionReason.trim()) {
      alert('Veuillez fournir une raison pour le rejet')
      return
    }

    setProcessing(rejectingId)
    try {
      const success = await rejectJobOfferRequest(rejectingId, rejectionReason)
      if (success) {
        setRejectingId(null)
        setRejectionReason('')
        loadRequests()
      } else {
        alert('Erreur lors du rejet')
      }
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-pending">En attente</span>
      case 'approved':
        return <span className="badge badge-approved">Approuvée</span>
      case 'rejected':
        return <span className="badge badge-rejected">Rejetée</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  const getDurationLabel = (duration: string) => {
    const labels: Record<string, string> = {
      permanent: 'Permanent',
      contract: 'CDD',
      temporary: 'Temporaire',
      'part-time': 'Temps partiel',
    }
    return labels[duration] || duration
  }

  const formatSalary = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'

  const getInitials = (name: string) =>
    name
      ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
      : '?'

  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const approvedCount = requests.filter((r) => r.status === 'approved').length
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading">
          <div className="loading-spinner" />
          Chargement des demandes…
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div>
          <h2>Gestion des Demandes d'Emploi</h2>
          <p className="panel-subtitle">Examinez et traitez les offres soumises par les recruteurs</p>
        </div>
        <button className="refresh-btn" onClick={loadRequests} title="Actualiser">
          ↻
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-bar">
        <div className="stat-chip stat-chip--pending">
          <span className="stat-dot" />
          <strong>{pendingCount}</strong> En attente
        </div>
        <div className="stat-chip stat-chip--approved">
          <span className="stat-dot" />
          <strong>{approvedCount}</strong> Approuvées
        </div>
        <div className="stat-chip stat-chip--rejected">
          <span className="stat-dot" />
          <strong>{rejectedCount}</strong> Rejetées
        </div>
      </div>

      <div className="panel-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            ⏳ En attente
            {pendingCount > 0 && <span className="filter-count">{pendingCount}</span>}
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            📋 Toutes
            <span className="filter-count filter-count--neutral">{requests.length}</span>
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>{filter === 'pending' ? 'Aucune demande en attente' : 'Aucune demande trouvée'}</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((req) => {
            const recruiterName = (req.recruiterId as any)?.name || 'N/A'
            const recruiterEmail = (req.recruiterId as any)?.email
            return (
              <div key={req._id} className="request-card" data-status={req.status}>
                <div className="card-header">
                  <div className="header-left">
                    <div className="recruiter-avatar">{getInitials(recruiterName)}</div>
                    <div className="company-info">
                      <h3 className="job-title">{req.jobTitle || '—'}</h3>
                      <p className="company-name">{req.companyName}</p>
                      <p className="recruiter-info">
                        {recruiterName}
                        {recruiterEmail && (
                          <span className="email"> · {recruiterEmail}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="header-right">
                    {getStatusBadge(req.status)}
                    <span className="card-date">
                      {new Date(req.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>📍 Lieu</label>
                      <p>{req.location}</p>
                    </div>
                    <div className="info-item">
                      <label>💰 Salaire</label>
                      <p>{formatSalary(req.salary)}</p>
                    </div>
                    <div className="info-item">
                      <label>👥 Postes</label>
                      <p>{req.numberOfPositions}</p>
                    </div>
                    <div className="info-item">
                      <label>📄 Contrat</label>
                      <p>{getDurationLabel(req.jobDuration)}</p>
                    </div>
                    <div className="info-item">
                      <label>🎓 Expérience</label>
                      <p>
                        {req.experienceRequired || 0} an{(req.experienceRequired || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {req.description && (
                    <div className="description">
                      <label>Description</label>
                      <p>{req.description}</p>
                    </div>
                  )}

                  {req.rejectionReason && (
                    <div className="rejection-reason">
                      <label>Motif du rejet</label>
                      <p>{req.rejectionReason}</p>
                    </div>
                  )}

                  {req.approvedAt && (
                    <div className="meta-info">
                      <span>✅ Approuvée le {new Date(req.approvedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {req.status === 'pending' && (
                  <div className="card-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(req._id)}
                      disabled={processing === req._id}
                    >
                      {processing === req._id ? (
                        <><span className="btn-spinner" /> Traitement…</>
                      ) : (
                        <>✓ Approuver</>
                      )}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => openRejectModal(req._id)}
                      disabled={processing === req._id}
                    >
                      ✕ Rejeter
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="modal-overlay" onClick={() => setRejectingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rejeter la Demande</h3>
            <p>Veuillez fournir une raison pour le rejet:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Raison du rejet..."
              rows={4}
              className="rejection-textarea"
            />
            <div className="modal-actions">
              <button
                className="btn-confirm"
                onClick={handleReject}
                disabled={processing === rejectingId || !rejectionReason.trim()}
              >
                {processing === rejectingId ? '⏳' : '✅'} Confirmer le Rejet
              </button>
              <button
                className="btn-cancel"
                onClick={() => setRejectingId(null)}
                disabled={processing === rejectingId}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminJobOfferRequestsPanel
