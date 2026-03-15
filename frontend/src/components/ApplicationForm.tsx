import React, { useState } from 'react'
import { applyToJobOffer } from '../services/applicationService'
import '../styles/forms.css'

interface ApplicationFormProps {
  jobOfferId: string
  jobTitle: string
  companyName: string
  onSuccess?: () => void
  onClose?: () => void
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  jobOfferId,
  jobTitle,
  companyName,
  onSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    candidatePhone: '',
    candidateLocation: '',
    candidateExperience: '',
    candidateSkills: '',
    candidateCoverLetter: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // Validation
    if (!formData.candidatePhone) {
      setError('Le numéro de téléphone est obligatoire')
      setLoading(false)
      return
    }

    try {
      const result = await applyToJobOffer(jobOfferId, {
        candidatePhone: formData.candidatePhone,
        candidateLocation: formData.candidateLocation,
        candidateExperience: formData.candidateExperience
          ? parseInt(formData.candidateExperience)
          : undefined,
        candidateSkills: formData.candidateSkills
          ? formData.candidateSkills.split(',').map((s) => s.trim())
          : undefined,
        candidateCoverLetter: formData.candidateCoverLetter,
      })

      if (result) {
        setSuccess(true)
        setFormData({
          candidatePhone: '',
          candidateLocation: '',
          candidateExperience: '',
          candidateSkills: '',
          candidateCoverLetter: '',
        })

        setTimeout(() => {
          if (onSuccess) onSuccess()
          if (onClose) onClose()
        }, 2000)
      } else {
        setError('Erreur lors de la soumission de votre candidature')
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="application-form">
      <h2>📝 Postulez pour ce Poste</h2>
      <div className="job-info">
        <p>
          <strong>Entreprise:</strong> {companyName}
        </p>
        <p>
          <strong>Poste:</strong> {jobTitle}
        </p>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && (
        <div className="form-success">
          ✅ Candidature envoyée avec succès! Le recruteur vous contactera bientôt.
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="candidatePhone">Numéro de Téléphone *</label>
          <input
            id="candidatePhone"
            type="tel"
            name="candidatePhone"
            value={formData.candidatePhone}
            onChange={handleChange}
            placeholder="Ex: +221 77 123 45 67"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="candidateLocation">Lieu actuel</label>
          <input
            id="candidateLocation"
            type="text"
            name="candidateLocation"
            value={formData.candidateLocation}
            onChange={handleChange}
            placeholder="Ex: Dakar, Thiès..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="candidateExperience">Années d'Expérience</label>
          <input
            id="candidateExperience"
            type="number"
            name="candidateExperience"
            value={formData.candidateExperience}
            onChange={handleChange}
            placeholder="Ex: 3"
            min="0"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="candidateSkills">Compétences (séparées par des virgules)</label>
          <textarea
            id="candidateSkills"
            name="candidateSkills"
            value={formData.candidateSkills}
            onChange={handleChange}
            placeholder="Ex: JavaScript, React, Node.js, MongoDB"
            rows={2}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="candidateCoverLetter">Lettre de Motivation</label>
          <textarea
            id="candidateCoverLetter"
            name="candidateCoverLetter"
            value={formData.candidateCoverLetter}
            onChange={handleChange}
            placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
            rows={4}
          />
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Chargement...' : '✉️ Envoyer ma Candidature'}
          </button>
          {onClose && (
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ApplicationForm
