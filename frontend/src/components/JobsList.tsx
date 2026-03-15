import { useState, useMemo, useEffect, useCallback } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { useAuth } from '../utils/AuthContext'
import { useLoadingState } from '../hooks/useLoadingState'
import { useFilters, useJobs } from '../hooks/useRedux'
import { getJobOffers, type JobOffer } from '../services/jobOfferService'
import { ApplicationForm } from './ApplicationForm'
import { jobCategoryOptions, locationOptions } from '../utils/i18n'
import { SkeletonGrid, ProgressBar } from './Loading'
import { SelectInput } from './SelectInput'
import { UndoRedoButtons } from './UndoRedoButtons'
import { useToast } from '../utils/ToastContext'

interface JobsListProps {
  onOpenAuth?: () => void
}

export function JobsList({ onOpenAuth }: JobsListProps) {
  const { t, language } = useLanguage()
  const { isLoggedIn, userType } = useAuth()
  const { progress, startLoading, stopLoading } = useLoadingState({ delay: 300 })
  const { filters, setSearchTerm, setLocationFilter } = useFilters()
  const { appliedJobs, applyToJob } = useJobs()
  const { addToast } = useToast()
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [totalJobs, setTotalJobs] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null)

  // Load jobs on mount and when filters change
  useEffect(() => {
    loadJobs()
  }, [])

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        // Undo will be handled by useHistory hook
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        // Redo will be handled by useHistory hook
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loadJobs = async () => {
    try {
      setIsLoadingJobs(true)
      setError(null)
      startLoading()

      const response = await getJobOffers({
        limit: 50,
        offset: 0,
        location: filters.locationFilter || undefined
      })

      setJobs(response.data)
      setTotalJobs(response.total)
    } catch (err) {
      console.error('Failed to load jobs:', err)
      setError(language === 'fr' ? 'Erreur lors du chargement des offres' : 'Failed to load job offers')
      addToast(language === 'fr' ? 'Erreur lors du chargement' : 'Error loading jobs', 'error')
    } finally {
      setIsLoadingJobs(false)
      stopLoading()
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchTerm = filters.searchTerm.toLowerCase()
      const locationFilter = filters.locationFilter.toLowerCase()

      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm))
      
      const matchesLocation = !locationFilter || 
        (job.location?.toLowerCase() || '').includes(locationFilter)
      
      return matchesSearch && matchesLocation
    })
  }, [filters.searchTerm, filters.locationFilter, jobs])

  const handleApply = useCallback(async (job: JobOffer) => {
    if (!isLoggedIn) {
      addToast(language === 'fr' ? 'Veuillez vous connecter' : 'Please sign in', 'warning')
      if (onOpenAuth) onOpenAuth()
      return
    }

    if (userType !== 'job_seeker') {
      addToast(language === 'fr' ? 'Seuls les chercheurs d\'emploi peuvent postuler' : 'Only job seekers can apply', 'warning')
      return
    }

    if (appliedJobs.includes(job._id)) {
      addToast(language === 'fr' ? 'Vous avez déjà postulé' : 'Already applied', 'info')
      return
    }

    // Open application form modal
    setSelectedJob(job)
    setShowApplicationForm(true)
  }, [isLoggedIn, userType, appliedJobs, onOpenAuth, language, addToast])

  const handleApplicationSuccess = () => {
    if (selectedJob) {
      applyToJob(selectedJob._id)
      addToast(language === 'fr' ? 'Candidature envoyée!' : 'Application submitted!', 'success')
    }
    setShowApplicationForm(false)
    setSelectedJob(null)
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [setSearchTerm])

  const handleLocationChange = useCallback((value: string) => {
    setLocationFilter(value)
    // Reload jobs with new location filter
  }, [setLocationFilter])

  const currentJobOptions = jobCategoryOptions[language as keyof typeof jobCategoryOptions] || jobCategoryOptions.fr
  const currentLocationOptions = locationOptions[language as keyof typeof locationOptions] || locationOptions.fr

  const formatSalary = (offer: JobOffer) => {
    if (!offer.salaryRange) return null
    const { min, max, currency } = offer.salaryRange
    return `${min?.toLocaleString()} - ${max?.toLocaleString()} ${currency || 'XOF'}`
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')
    } catch {
      return dateString
    }
  }

  return (
    <section id="jobs" className="jobs-section">
      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowApplicationForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ApplicationForm
              jobOfferId={selectedJob._id}
              jobTitle={selectedJob.title}
              companyName={selectedJob.companyName || selectedJob.recruiter?.name || 'Unknown'}
              onSuccess={handleApplicationSuccess}
              onClose={() => {
                setShowApplicationForm(false)
                setSelectedJob(null)
              }}
            />
          </div>
        </div>
      )}

      <div className="jobs-header">
        <div className="header-content">
          <h2>{t('jobsList.title')}</h2>
          <p style={{opacity: 0.8, marginTop: '10px'}}>
            {language === 'fr' 
              ? 'Découvrez les meilleures opportunités temporaires et événementielles au Sénégal'
              : 'Discover the best temporary and event-based opportunities in Senegal'}
          </p>
          <p style={{opacity: 0.6, marginTop: '8px', fontSize: '14px'}}>
            {totalJobs} {language === 'fr' ? 'offre(s) disponible(s)' : 'offer(s) available'}
          </p>
        </div>
        
        {/* Undo/Redo buttons */}
        <UndoRedoButtons showLabels={true} />
      </div>

      <div className="search-filters">
        <SelectInput
          label={`💼 ${t('jobsList.searchByJob')}`}
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          options={[
            { value: '', label: t('jobsList.searchByJob') },
            ...currentJobOptions.map(option => ({ value: option, label: option }))
          ]}
        />

        <SelectInput
          label={`📍 ${t('jobsList.location')}`}
          value={filters.locationFilter}
          onChange={(e) => handleLocationChange(e.target.value)}
          options={[
            { value: '', label: t('jobsList.location') },
            ...currentLocationOptions.map(option => ({ value: option, label: option }))
          ]}
        />
      </div>

      {error && (
        <div className="alert-error" style={{
          background: 'rgba(255, 87, 51, 0.1)',
          border: '1px solid rgba(255, 87, 51, 0.3)',
          color: '#ff5733',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {isLoadingJobs ? (
        <>
          <ProgressBar value={progress} max={100} showLabel={true} animated={true} />
          <SkeletonGrid count={4} />
        </>
      ) : filteredJobs.length === 0 ? (
        <div className="no-jobs">
          <p>{t('jobsList.noJobs')}</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="positions-badge">
                  {job.positionsAvailable} {t('jobsList.positions')}
                </span>
              </div>

              <p className="job-company">{job.recruiter?.name || 'Unknown'}</p>

              <p className="job-description">{job.description}</p>

              <div className="job-info">
                {job.location && (
                  <div className="info-item">
                    <span className="icon">📍</span>
                    <span>{job.location}</span>
                  </div>
                )}
                {job.createdAt && (
                  <div className="info-item">
                    <span className="icon">📅</span>
                    <span>{formatDate(job.createdAt)}</span>
                  </div>
                )}
              </div>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="job-skills">
                  {job.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}

              {job.salaryRange && (
                <div className="salary-info">
                  💰 {formatSalary(job)} {t('jobsList.dailyRate')}
                </div>
              )}

              <button
                className={`btn-apply ${appliedJobs.includes(job._id) ? 'applied' : ''} ${!isLoggedIn ? 'login-required' : ''}`}
                onClick={() => handleApply(job)}
                disabled={appliedJobs.includes(job._id)}
              >
                {appliedJobs.includes(job._id) 
                  ? t('jobsList.applied') 
                  : t('jobsList.apply')}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
