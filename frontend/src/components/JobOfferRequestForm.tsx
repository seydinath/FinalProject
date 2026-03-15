import React, { useState } from 'react'
import { submitJobOfferRequest } from '../services/jobOfferRequestService'
import { useLanguage } from '../utils/LanguageContext'
import { jobTitleOptions, locationOptions } from '../utils/i18n'
import '../styles/forms.css'

const OTHER_JOB_TITLE_VALUE = '__other__'

interface JobOfferRequestFormProps {
  onSuccess?: () => void
  onClose?: () => void
}

export const JobOfferRequestForm: React.FC<JobOfferRequestFormProps> = ({ onSuccess, onClose }) => {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    customJobTitle: '',
    location: '',
    salary: '',
    numberOfPositions: '',
    jobDuration: 'permanent' as const,
    experienceRequired: '',
    description: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const isOtherJobTitle = formData.jobTitle === OTHER_JOB_TITLE_VALUE
    const resolvedJobTitle = isOtherJobTitle ? formData.customJobTitle.trim() : formData.jobTitle.trim()

    // Validation
    if (!formData.companyName || !resolvedJobTitle || !formData.location || !formData.salary || !formData.numberOfPositions) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    try {
      const result = await submitJobOfferRequest({
        companyName: formData.companyName,
        jobTitle: resolvedJobTitle,
        customJobTitle: isOtherJobTitle ? formData.customJobTitle.trim() : undefined,
        location: formData.location,
        salary: parseInt(formData.salary),
        numberOfPositions: parseInt(formData.numberOfPositions),
        jobDuration: formData.jobDuration,
        experienceRequired: formData.experienceRequired ? parseInt(formData.experienceRequired) : undefined,
        description: formData.description,
      })

      if (result) {
        setSuccess(true)
        setFormData({
          companyName: '',
          jobTitle: '',
          customJobTitle: '',
          location: '',
          salary: '',
          numberOfPositions: '',
          jobDuration: 'permanent',
          experienceRequired: '',
          description: '',
        })

        setTimeout(() => {
          if (onSuccess) onSuccess()
          if (onClose) onClose()
        }, 2000)
      } else {
        setError('Erreur lors de la soumission de la demande')
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="job-offer-request-form modern-form-shell">
      <h2>📋 Soumettez une Offre d'Emploi</h2>
      <p className="form-subtitle">Votre demande sera examinée par notre équipe d'administration</p>

      {error && <div className="form-error">{error}</div>}
      {success && (
        <div className="form-success">
          ✅ Demande soumise avec succès! En attente d'approbation...
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid modern-form">
        <div className="form-group">
          <label htmlFor="companyName">Nom de l'Entreprise *</label>
          <input
            id="companyName"
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Ex: TechCorp Senegal"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobTitle">Type de poste *</label>
          <select
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            required
          >
            <option value="">{language === 'fr' ? 'Selectionnez un type de poste' : 'Select a position type'}</option>
            {(jobTitleOptions[language as 'fr' | 'en'] || jobTitleOptions.fr).map((jobTitle) => (
              <option key={jobTitle} value={jobTitle}>{jobTitle}</option>
            ))}
            <option value={OTHER_JOB_TITLE_VALUE}>{language === 'fr' ? 'Autre' : 'Other'}</option>
          </select>
        </div>

        {formData.jobTitle === OTHER_JOB_TITLE_VALUE && (
          <div className="form-group">
            <label htmlFor="customJobTitle">{language === 'fr' ? 'Titre du poste' : 'Job title'} *</label>
            <input
              id="customJobTitle"
              type="text"
              name="customJobTitle"
              value={formData.customJobTitle}
              onChange={handleChange}
              placeholder={language === 'fr' ? 'Ex: Responsable Logistique' : 'Ex: Logistics Manager'}
              required
              minLength={3}
              maxLength={140}
            />
            <small className="form-help-text">
              {language === 'fr' ? 'Saisissez le titre exact du poste a publier.' : 'Enter the exact job title to publish.'}
            </small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="location">Lieu *</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          >
            <option value="">{language === 'fr' ? 'Selectionnez une ville' : 'Select a city'}</option>
            {(locationOptions[language as 'fr' | 'en'] || locationOptions.fr).map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="salary">Salaire (FCFA) *</label>
          <input
            id="salary"
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="Ex: 150000"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="numberOfPositions">Nombre de Postes *</label>
          <input
            id="numberOfPositions"
            type="number"
            name="numberOfPositions"
            value={formData.numberOfPositions}
            onChange={handleChange}
            placeholder="Ex: 5"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobDuration">Type de Contrat *</label>
          <select
            id="jobDuration"
            name="jobDuration"
            value={formData.jobDuration}
            onChange={handleChange}
            required
          >
            <option value="permanent">Permanent</option>
            <option value="contract">Contrat (CDD)</option>
            <option value="temporary">Temporaire</option>
            <option value="part-time">Temps Partiel</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="experienceRequired">Années d'Expérience Requises</label>
          <input
            id="experienceRequired"
            type="number"
            name="experienceRequired"
            value={formData.experienceRequired}
            onChange={handleChange}
            placeholder="Ex: 2"
            min="0"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description du Poste</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez les responsabilités, qualifications, et autres détails importants..."
            rows={4}
          />
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Chargement...' : '📤 Soumettre la Demande'}
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

export default JobOfferRequestForm
