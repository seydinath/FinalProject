import React, { useState, useEffect } from 'react'
import { getAllRecruiterApplications, updateApplicationStatus } from '../services/applicationService'
import { ApplicationWithJobOffer } from '../services/applicationService'
import '../styles/recruiter-applications.css'

export const RecruiterApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationWithJobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | ApplicationWithJobOffer['status']>('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllRecruiterApplications()
      setApplications(data)
    } catch (err) {
      setError('Erreur lors du chargement des candidatures')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (
    applicationId: string,
    status: 'reviewing' | 'shortlisted' | 'interview_scheduled' | 'accepted' | 'rejected'
  ) => {
    setProcessing(applicationId)
    try {
      const recruiterNote = window.prompt('Note recruteur (optionnel)') || undefined
      const interviewDate = status === 'interview_scheduled'
        ? window.prompt('Date entretien (ISO ou texte libre)', '') || undefined
        : undefined

      const success = await updateApplicationStatus(applicationId, status, recruiterNote, interviewDate)
      if (success) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId
              ? {
                  ...app,
                  status,
                  recruiterNote: recruiterNote ?? app.recruiterNote,
                  interviewDate: interviewDate ?? app.interviewDate,
                }
              : app
          )
        )
      } else {
        alert('Erreur lors de la mise a jour de la candidature')
      }
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <span className="badge badge-pending">⏳ En attente</span>
      case 'reviewing':
        return <span className="badge badge-reviewing">👀 En revue</span>
      case 'shortlisted':
        return <span className="badge badge-shortlisted">⭐ Shortlist</span>
      case 'interview_scheduled':
        return <span className="badge badge-interview">📅 Entretien</span>
      case 'accepted':
        return <span className="badge badge-accepted">✅ Acceptée</span>
      case 'rejected':
        return <span className="badge badge-rejected">❌ Rejetée</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter((app) => app.status === filter)

  if (loading) {
    return (
      <div className="recruiter-applications">
        <div className="loading">⏳ Chargement des candidatures...</div>
      </div>
    )
  }

  return (
    <div className="recruiter-applications">
      <h2>📊 Mes Candidatures Reçues</h2>

      <div className="pipeline-filter-row">
        {['all', 'applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'].map((value) => (
          <button
            key={value}
            className={`pipeline-filter-btn ${filter === value ? 'active' : ''}`}
            onClick={() => setFilter(value as typeof filter)}
          >
            {value === 'all' ? 'Toutes' : value}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <p>Aucune candidature pour le moment</p>
        </div>
      ) : (
        <div className="applications-list">
          {filteredApplications.map((app) => (
            <div key={app._id} className="application-card">
              <div className="card-header">
                <div className="job-info">
                  <h3>{app.candidateName}</h3>
                  <p className="job-title">
                    Poste: {(app.jobOfferId as any).title || 'N/A'} -
                    <span className="company">
                      {(app.jobOfferId as any).companyName || 'N/A'}
                    </span>
                  </p>
                </div>
                <div className="status">{getStatusBadge(app.status)}</div>
              </div>

              <div className="card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <label>📧 Email:</label>
                    <p>
                      <a href={`mailto:${app.candidateEmail}`}>{app.candidateEmail}</a>
                    </p>
                  </div>
                  <div className="info-item">
                    <label>📱 Téléphone:</label>
                    {app.status === 'accepted' && app.candidatePhone ? (
                      <p>
                        <a href={`tel:${app.candidatePhone}`}>{app.candidatePhone}</a>
                      </p>
                    ) : (
                      <p>Visible après validation</p>
                    )}
                  </div>
                  <div className="info-item">
                    <label>📍 Lieu:</label>
                    <p>{app.candidateLocation || 'Non spécifié'}</p>
                  </div>
                  <div className="info-item">
                    <label>⏰ Expérience:</label>
                    <p>
                      {app.candidateExperience || 0} année
                      {(app.candidateExperience || 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>🎯 Match:</label>
                    <p>{app.matchScore || 0}%</p>
                  </div>
                </div>

                {app.matchReasons && app.matchReasons.length > 0 && (
                  <div className="skills">
                    <label>⚡ Raisons du match:</label>
                    <div className="skills-list">
                      {app.matchReasons.map((reason) => (
                        <span key={reason} className="skill-tag">{reason}</span>
                      ))}
                    </div>
                  </div>
                )}

                {app.candidateCvUrl && (
                  <div className="info-item" style={{ marginBottom: '1rem' }}>
                    <label>📄 CV:</label>
                    <p>
                      <a href={`http://localhost:5000${app.candidateCvUrl}`} target="_blank" rel="noreferrer">
                        Ouvrir le CV
                      </a>
                    </p>
                  </div>
                )}

                {app.candidateSkills && app.candidateSkills.length > 0 && (
                  <div className="skills">
                    <label>🎯 Compétences:</label>
                    <div className="skills-list">
                      {app.candidateSkills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {app.missingSkills && app.missingSkills.length > 0 && (
                  <div className="skills">
                    <label>🧩 Competences manquantes:</label>
                    <div className="skills-list">
                      {app.missingSkills.map((skill) => (
                        <span key={skill} className="skill-tag missing">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {app.candidateCoverLetter && (
                  <div className="cover-letter">
                    <label>💬 Lettre de Motivation:</label>
                    <p>{app.candidateCoverLetter}</p>
                  </div>
                )}

                <div className="meta-info">
                  <small>Candidature soumise: {new Date(app.appliedAt).toLocaleDateString('fr-FR')}</small>
                  {app.interviewDate && <small>Entretien: {new Date(app.interviewDate).toLocaleString('fr-FR')}</small>}
                  {app.recruiterNote && <small>Note recruteur: {app.recruiterNote}</small>}
                </div>
              </div>

              {app.status !== 'accepted' && app.status !== 'rejected' && (
                <div className="card-actions">
                  <button
                    className="btn-stage"
                    onClick={() => handleStatusChange(app._id, 'reviewing')}
                    disabled={processing === app._id || app.status === 'reviewing'}
                  >
                    👀 Revue
                  </button>
                  <button
                    className="btn-stage"
                    onClick={() => handleStatusChange(app._id, 'shortlisted')}
                    disabled={processing === app._id || app.status === 'shortlisted'}
                  >
                    ⭐ Shortlist
                  </button>
                  <button
                    className="btn-stage"
                    onClick={() => handleStatusChange(app._id, 'interview_scheduled')}
                    disabled={processing === app._id}
                  >
                    📅 Entretien
                  </button>
                  <button
                    className="btn-accept"
                    onClick={() => handleStatusChange(app._id, 'accepted')}
                    disabled={processing === app._id}
                  >
                    {processing === app._id ? '⏳' : '✅'} Accepter
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleStatusChange(app._id, 'rejected')}
                    disabled={processing === app._id}
                  >
                    {processing === app._id ? '⏳' : '❌'} Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecruiterApplicationsList
