import { Router, Response } from 'express'
import mongoose from 'mongoose'
import { JobApplication } from '../models/JobApplication'
import { JobOffer } from '../models/JobOffer'
import { User } from '../models/User'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { validateBody, validateObjectIdParam } from '../middleware/validation'
import { createNotification } from '../services/notification'
import { calculateJobMatch } from '../services/matching'

const router = Router()

type ApplicationPipelineStatus = 'applied' | 'reviewing' | 'shortlisted' | 'interview_scheduled' | 'accepted' | 'rejected'

async function requireAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false
  const user = await User.findById(userId)
  return !!(user?.isAdmin || user?.userType === 'admin')
}

function applyPipelineStatus(
  application: any,
  status: ApplicationPipelineStatus,
  recruiterNote?: string,
  interviewDate?: string
) {
  const now = new Date()
  application.status = status
  application.updatedAt = now

  if (recruiterNote !== undefined) {
    application.recruiterNote = recruiterNote
  }

  if (!Array.isArray(application.statusHistory)) {
    application.statusHistory = []
  }

  application.statusHistory.push({
    status,
    changedAt: now,
    note: recruiterNote,
  })

  if (status === 'reviewing') {
    application.reviewedAt = now
  }

  if (status === 'shortlisted') {
    application.shortlistedAt = now
  }

  if (status === 'interview_scheduled') {
    application.interviewScheduledAt = now
    application.interviewDate = interviewDate ? new Date(interviewDate) : application.interviewDate
  }

  if (status === 'accepted') {
    application.acceptedAt = now
    application.validatedByRecruiterAt = now
  }

  if (status === 'rejected') {
    application.rejectedAt = now
  }
}

async function notifyCandidateForPipelineStatus(application: any, jobOffer: any, status: ApplicationPipelineStatus) {
  if (status === 'accepted') {
    await createNotification({
      userId: String(application.candidateId),
      type: 'application_accepted',
      title: 'Candidature acceptee',
      message: `Bonne nouvelle ! Votre candidature pour "${jobOffer.title}" a ete acceptee.`,
      link: '/job-seeker-applications',
      metadata: {
        applicationId: String(application._id),
        jobOfferId: String(jobOffer._id),
      },
    })
    return
  }

  if (status === 'rejected') {
    await createNotification({
      userId: String(application.candidateId),
      type: 'application_rejected',
      title: 'Candidature non retenue',
      message: `Votre candidature pour "${jobOffer.title}" n'a pas ete retenue cette fois.`,
      link: '/job-seeker-applications',
      metadata: {
        applicationId: String(application._id),
        jobOfferId: String(jobOffer._id),
      },
    })
    return
  }

  const statusLabels: Record<ApplicationPipelineStatus, string> = {
    applied: 'Candidature recue',
    reviewing: 'Candidature en revue',
    shortlisted: 'Candidature presélectionnée',
    interview_scheduled: 'Entretien planifie',
    accepted: 'Candidature acceptee',
    rejected: 'Candidature rejetee',
  }

  await createNotification({
    userId: String(application.candidateId),
    type: 'system',
    title: statusLabels[status],
    message: `Le statut de votre candidature pour "${jobOffer.title}" est maintenant : ${statusLabels[status].toLowerCase()}.`,
    link: '/job-seeker-applications',
    metadata: {
      applicationId: String(application._id),
      jobOfferId: String(jobOffer._id),
      status,
    },
  })
}

// ✅ Apply to a job offer (job seeker)
router.post('/:jobOfferId/apply', authenticateToken, validateObjectIdParam('jobOfferId'), validateBody([
  { field: 'candidatePhone', type: 'string', required: false, maxLength: 30 },
  { field: 'candidateLocation', type: 'string', required: false, maxLength: 120 },
  { field: 'candidateCoverLetter', type: 'string', required: false, maxLength: 5000 },
]), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.userType !== 'job_seeker') {
      return res.status(403).json({ error: 'Only job seekers can apply to jobs' })
    }

    // Check if job offer exists and is open
    const jobOffer = await JobOffer.findById(req.params.jobOfferId)
    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' })
    }

    if (jobOffer.publicationStatus !== 'approved' || jobOffer.status !== 'open') {
      return res.status(400).json({ error: 'This job offer is not available' })
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      jobOfferId: req.params.jobOfferId,
      candidateId: req.userId,
    })

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this position' })
    }

    const {
      candidatePhone,
      candidateLocation,
      candidateExperience,
      candidateSkills,
      candidateCoverLetter,
    } = req.body

    const application = new JobApplication({
      jobOfferId: new mongoose.Types.ObjectId(req.params.jobOfferId),
      candidateId: new mongoose.Types.ObjectId(req.userId),
      candidateName: user?.name || '',
      candidateEmail: user?.email || '',
      candidatePhone,
      candidateCvUrl: user?.profile?.cvUrl,
      candidateLocation,
      candidateExperience: candidateExperience ?? user?.profile?.yearsOfExperience ?? 0,
      candidateSkills: candidateSkills || user?.profile?.skills || [],
      candidateCoverLetter,
      status: 'applied',
      ...(() => {
        const match = calculateJobMatch(user?.profile || {}, jobOffer)
        return {
          matchScore: match.score,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          matchReasons: match.reasons,
          statusHistory: [{ status: 'applied', changedAt: new Date(), note: 'Application submitted' }],
        }
      })(),
    })

    await application.save()

    await createNotification({
      userId: String(jobOffer.recruiter),
      type: 'application_submitted',
      title: 'Nouvelle candidature',
      message: `${application.candidateName} a postule a l'offre "${jobOffer.title}".`,
      link: '/recruiter-applications',
      metadata: {
        applicationId: String(application._id),
        jobOfferId: String(jobOffer._id),
      },
    })

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    })
  } catch (error: any) {
    console.error('Error submitting application:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/recruiter/pipeline-dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.userType !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can access this dashboard' })
    }

    const offers = await JobOffer.find({ recruiter: req.userId }).sort({ createdAt: -1 })
    const offerIds = offers.map((offer) => offer._id)
    const applications = await JobApplication.find({ jobOfferId: { $in: offerIds } })
      .populate('jobOfferId', 'title companyName location status publicationStatus requiredSkills positionsAvailable')
      .populate('candidateId', 'name email profile')
      .sort({ createdAt: -1 })

    const byStatus = {
      applied: 0,
      reviewing: 0,
      shortlisted: 0,
      interview_scheduled: 0,
      accepted: 0,
      rejected: 0,
    }

    for (const app of applications) {
      if (app.status in byStatus) {
        byStatus[app.status as keyof typeof byStatus] += 1
      }
    }

    const offersWithPipeline = offers.map((offer) => {
      const offerApps = applications.filter((app: any) => String(app.jobOfferId?._id || app.jobOfferId) === String(offer._id))
      return {
        jobOfferId: String(offer._id),
        title: offer.title,
        companyName: offer.companyName,
        location: offer.location,
        publicationStatus: offer.publicationStatus,
        status: offer.status,
        positionsAvailable: offer.positionsAvailable,
        applicationsCount: offerApps.length,
        averageMatchScore: offerApps.length
          ? Math.round(offerApps.reduce((sum: number, app: any) => sum + Number(app.matchScore || 0), 0) / offerApps.length)
          : 0,
        pipelineCounts: {
          applied: offerApps.filter((app: any) => app.status === 'applied').length,
          reviewing: offerApps.filter((app: any) => app.status === 'reviewing').length,
          shortlisted: offerApps.filter((app: any) => app.status === 'shortlisted').length,
          interview_scheduled: offerApps.filter((app: any) => app.status === 'interview_scheduled').length,
          accepted: offerApps.filter((app: any) => app.status === 'accepted').length,
          rejected: offerApps.filter((app: any) => app.status === 'rejected').length,
        },
        topCandidates: offerApps
          .sort((left: any, right: any) => Number(right.matchScore || 0) - Number(left.matchScore || 0))
          .slice(0, 5),
      }
    })

    const averageMatchScore = applications.length
      ? Math.round(applications.reduce((sum, app: any) => sum + Number(app.matchScore || 0), 0) / applications.length)
      : 0

    res.json({
      summary: {
        activeOffers: offers.filter((offer) => offer.status === 'open' && offer.publicationStatus === 'approved').length,
        totalOffers: offers.length,
        totalApplications: applications.length,
        averageMatchScore,
        byStatus,
      },
      offers: offersWithPipeline,
      recentApplications: applications.slice(0, 10),
    })
  } catch (error: any) {
    console.error('Error fetching recruiter pipeline dashboard:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch recruiter dashboard' })
  }
})

// ✅ Get job offer applications (recruiter only)
router.get('/:jobOfferId/applications', authenticateToken, validateObjectIdParam('jobOfferId'), async (req: AuthRequest, res: Response) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.jobOfferId)
    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' })
    }

    // Check if user is the recruiter for this job
    if (jobOffer.recruiter.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to view these applications' })
    }

    const applications = await JobApplication.find({ jobOfferId: req.params.jobOfferId })
      .populate('candidateId', 'name email profile')
      .sort({ appliedAt: -1 })

    res.json({
      total: applications.length,
      jobOfferId: req.params.jobOfferId,
      applications,
    })
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Get all recruiter's job applications (for all their posted jobs)
router.get('/recruiter/all-applications', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.userType !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can access this' })
    }

    // Get all job offers posted by this recruiter
    const jobOffers = await JobOffer.find({ recruiter: req.userId })
    const jobOfferIds = jobOffers.map((j) => j._id)

    // Get all applications for these job offers
    const applications = await JobApplication.find({ jobOfferId: { $in: jobOfferIds } })
      .populate('jobOfferId', 'title companyName location')
      .populate('candidateId', 'name email profile')
      .sort({ appliedAt: -1 })

    res.json({
      total: applications.length,
      applications,
    })
  } catch (error: any) {
    console.error('Error fetching recruiter applications:', error)
    res.status(500).json({ error: error.message })
  }
})

router.patch('/:applicationId/status', authenticateToken, validateObjectIdParam('applicationId'), validateBody([
  { field: 'status', type: 'string', required: true, enum: ['reviewing', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'] },
  { field: 'recruiterNote', type: 'string', required: false, maxLength: 600 },
  { field: 'interviewDate', type: 'string', required: false, maxLength: 80 },
]), async (req: AuthRequest, res: Response) => {
  try {
    const application = await JobApplication.findById(req.params.applicationId)
    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const jobOffer = await JobOffer.findById(application.jobOfferId)
    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' })
    }

    if (jobOffer.recruiter.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this application' })
    }

    const { status, recruiterNote, interviewDate } = req.body as {
      status: ApplicationPipelineStatus
      recruiterNote?: string
      interviewDate?: string
    }

    applyPipelineStatus(application, status, recruiterNote, interviewDate)
    await application.save()
    await notifyCandidateForPipelineStatus(application, jobOffer, status)

    res.json({
      message: 'Application status updated',
      application,
    })
  } catch (error: any) {
    console.error('Error updating application status:', error)
    res.status(500).json({ error: error.message || 'Failed to update application status' })
  }
})

// ✅ Accept application (recruiter only)
router.post('/:applicationId/accept', authenticateToken, validateObjectIdParam('applicationId'), async (req: AuthRequest, res: Response) => {
  try {
    const application = await JobApplication.findById(req.params.applicationId)
    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    // Verify recruiter is the one who posted this job
    const jobOffer = await JobOffer.findById(application.jobOfferId)
    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' })
    }

    if (jobOffer.recruiter.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to accept this application' })
    }

    if (application.status !== 'applied') {
      return res.status(400).json({ error: 'Can only accept pending applications' })
    }

    applyPipelineStatus(application, 'accepted')
    await application.save()

    await notifyCandidateForPipelineStatus(application, jobOffer, 'accepted')

    res.json({
      message: 'Application accepted',
      application,
    })
  } catch (error: any) {
    console.error('Error accepting application:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Reject application (recruiter only)
router.post('/:applicationId/reject', authenticateToken, validateObjectIdParam('applicationId'), async (req: AuthRequest, res: Response) => {
  try {
    const application = await JobApplication.findById(req.params.applicationId)
    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    // Verify recruiter is the one who posted this job
    const jobOffer = await JobOffer.findById(application.jobOfferId)
    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' })
    }

    if (jobOffer.recruiter.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to reject this application' })
    }

    if (application.status !== 'applied') {
      return res.status(400).json({ error: 'Can only reject pending applications' })
    }

    applyPipelineStatus(application, 'rejected')
    await application.save()

    await notifyCandidateForPipelineStatus(application, jobOffer, 'rejected')

    res.json({
      message: 'Application rejected',
      application,
    })
  } catch (error: any) {
    console.error('Error rejecting application:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/job-seeker/opportunity-dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.userType !== 'job_seeker') {
      return res.status(403).json({ error: 'Only job seekers can access this dashboard' })
    }

    const applications = await JobApplication.find({ candidateId: req.userId })
      .populate('jobOfferId', 'title companyName location salary numberOfPositions requiredSkills experienceRequired status publicationStatus')
      .sort({ appliedAt: -1 })

    const appliedJobIds = applications.map((application) => application.jobOfferId)
    const openOffers = await JobOffer.find({
      publicationStatus: 'approved',
      status: 'open',
      _id: { $nin: appliedJobIds },
    })
      .sort({ createdAt: -1 })
      .limit(40)

    const recommendedJobs = openOffers
      .map((offer) => {
        const match = calculateJobMatch(user.profile || {}, offer)
        return {
          ...offer.toObject(),
          matchScore: match.score,
          matchReasons: match.reasons,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        }
      })
      .sort((left, right) => right.matchScore - left.matchScore)
      .slice(0, 6)

    const applicationsByStatus = {
      applied: applications.filter((app) => app.status === 'applied').length,
      reviewing: applications.filter((app) => app.status === 'reviewing').length,
      shortlisted: applications.filter((app) => app.status === 'shortlisted').length,
      interview_scheduled: applications.filter((app) => app.status === 'interview_scheduled').length,
      accepted: applications.filter((app) => app.status === 'accepted').length,
      rejected: applications.filter((app) => app.status === 'rejected').length,
    }

    const profile = (user.profile || {}) as Record<string, any>
    const profileChecks = [
      profile.headline,
      profile.bio,
      profile.location,
      Array.isArray(profile.skills) && profile.skills.length > 0,
      profile.yearsOfExperience !== undefined,
      profile.desiredDomain,
      profile.cvUrl,
      profile.phone,
    ]
    const profileCompletion = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100)

    res.json({
      summary: {
        totalApplications: applications.length,
        activeApplications: applications.filter((app) => ['applied', 'reviewing', 'shortlisted', 'interview_scheduled'].includes(app.status)).length,
        interviewsScheduled: applicationsByStatus.interview_scheduled,
        acceptedApplications: applicationsByStatus.accepted,
        profileCompletion,
        recommendationCount: recommendedJobs.length,
      },
      applicationsByStatus,
      recentApplications: applications.slice(0, 6),
      recommendedJobs,
    })
  } catch (error: any) {
    console.error('Error fetching opportunity dashboard:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch opportunity dashboard' })
  }
})

// ✅ Get my applications (job seeker)
router.get('/my-applications', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.userType !== 'job_seeker') {
      return res.status(403).json({ error: 'Only job seekers can access this' })
    }

    const applications = await JobApplication.find({ candidateId: req.userId })
      .populate('jobOfferId', 'title companyName location salary numberOfPositions')
      .sort({ appliedAt: -1 })

    res.json({
      total: applications.length,
      applications,
    })
  } catch (error: any) {
    console.error('Error fetching my applications:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Delete my own application (job seeker)
router.delete('/:applicationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.userType !== 'job_seeker') {
      return res.status(403).json({ error: 'Only job seekers can delete applications' })
    }

    const application = await JobApplication.findById(req.params.applicationId)
    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    if (application.candidateId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this application' })
    }

    await JobApplication.findByIdAndDelete(req.params.applicationId)

    res.json({ message: 'Application deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting application:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Admin dashboard summary
router.get('/admin/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const [totalApplications, pendingApplications, acceptedApplications, rejectedApplications] = await Promise.all([
      JobApplication.countDocuments(),
      JobApplication.countDocuments({ status: 'applied' }),
      JobApplication.countDocuments({ status: 'accepted' }),
      JobApplication.countDocuments({ status: 'rejected' }),
    ])

    res.json({
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
    })
  } catch (error: any) {
    console.error('Error fetching admin summary:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Admin: applicants grouped by job offer
router.get('/admin/applicants-by-job', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const applications = await JobApplication.find()
      .populate('jobOfferId', 'title companyName location recruiter')
      .populate('candidateId', 'name email profile')
      .sort({ appliedAt: -1 })

    const byJob: Record<string, any> = {}
    for (const app of applications) {
      const offer: any = app.jobOfferId
      if (!offer) continue
      const jobId = String(offer._id)
      if (!byJob[jobId]) {
        byJob[jobId] = {
          jobOfferId: jobId,
          title: offer.title,
          companyName: offer.companyName,
          location: offer.location,
          totalApplicants: 0,
          applicants: [],
        }
      }
      byJob[jobId].totalApplicants += 1
      byJob[jobId].applicants.push(app)
    }

    res.json({
      totalJobs: Object.keys(byJob).length,
      jobs: Object.values(byJob),
    })
  } catch (error: any) {
    console.error('Error fetching applicants by job:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Admin: candidates validated by recruiters
router.get('/admin/validated-candidates', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const applications = await JobApplication.find({ status: 'accepted' })
      .populate('jobOfferId', 'title companyName location recruiter')
      .populate('candidateId', 'name email profile')
      .sort({ validatedByRecruiterAt: -1, acceptedAt: -1 })

    res.json({
      total: applications.length,
      candidates: applications,
    })
  } catch (error: any) {
    console.error('Error fetching validated candidates:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
