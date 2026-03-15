import { Router, Response } from 'express'
import mongoose from 'mongoose'
import { JobOfferRequest } from '../models/JobOfferRequest'
import { JobOffer } from '../models/JobOffer'
import { User } from '../models/User'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { createNotification } from '../services/notification'

const router = Router()

const OTHER_JOB_TITLE_VALUES = new Set(['__other__', 'other', 'autre'])

// ✅ Create job offer request (recruiter)
router.post('/request', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.userType !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can submit job offer requests' })
    }

    const {
      companyName,
      jobTitle,
      customJobTitle,
      location,
      salary,
      numberOfPositions,
      jobDuration,
      experienceRequired,
      description,
    } = req.body

    const normalizedJobTitle = typeof jobTitle === 'string' ? jobTitle.trim() : ''
    const normalizedCustomJobTitle = typeof customJobTitle === 'string' ? customJobTitle.trim() : ''
    const useCustomJobTitle = OTHER_JOB_TITLE_VALUES.has(normalizedJobTitle.toLowerCase())
    const resolvedJobTitle = useCustomJobTitle ? normalizedCustomJobTitle : normalizedJobTitle

    if (!companyName || !resolvedJobTitle || !location || !salary || !numberOfPositions || !jobDuration) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (resolvedJobTitle.length < 3 || resolvedJobTitle.length > 140) {
      return res.status(400).json({ error: 'Job title must be between 3 and 140 characters' })
    }

    const jobOfferRequest = new JobOfferRequest({
      recruiterId: req.userId,
      companyName,
      jobTitle: resolvedJobTitle,
      location,
      salary,
      numberOfPositions,
      jobDuration,
      experienceRequired: experienceRequired || 0,
      description,
      status: 'pending',
    })

    await jobOfferRequest.save()

    res.status(201).json({
      message: 'Job offer request submitted for approval',
      jobOfferRequest,
    })
  } catch (error: any) {
    console.error('Error creating job offer request:', error)
    res.status(500).json({ error: error.message || 'Failed to create job offer request' })
  }
})

// ✅ Get all pending requests (admin only)
router.get('/admin/pending-requests', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user?.isAdmin && user?.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const pendingRequests = await JobOfferRequest.find({ status: 'pending' })
      .populate('recruiterId', 'name email profile')
      .sort({ createdAt: -1 })

    res.json({
      total: pendingRequests.length,
      requests: pendingRequests,
    })
  } catch (error: any) {
    console.error('Error fetching pending requests:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Get admin history (all requests - admin only)
router.get('/admin/all-requests', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user?.isAdmin && user?.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const allRequests = await JobOfferRequest.find()
      .populate('recruiterId', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })

    res.json({
      total: allRequests.length,
      requests: allRequests,
    })
  } catch (error: any) {
    console.error('Error fetching all requests:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Approve job offer request (admin only) - creates JobOffer
router.post('/admin/requests/:id/approve', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user?.isAdmin && user?.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const jobOfferRequest = await JobOfferRequest.findById(req.params.id)
    if (!jobOfferRequest) {
      return res.status(404).json({ error: 'Job offer request not found' })
    }

    if (jobOfferRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Can only approve pending requests' })
    }

    // Update request status
    jobOfferRequest.status = 'approved'
    jobOfferRequest.approvedBy = new mongoose.Types.ObjectId(req.userId)
    jobOfferRequest.approvedAt = new Date()
    await jobOfferRequest.save()

    // Create JobOffer from request
    const jobOffer = new JobOffer({
      jobOfferRequestId: jobOfferRequest._id,
      title: jobOfferRequest.jobTitle,
      description: jobOfferRequest.description || `Job at ${jobOfferRequest.companyName}`,
      companyName: jobOfferRequest.companyName,
      recruiter: jobOfferRequest.recruiterId,
      numberOfPositions: jobOfferRequest.numberOfPositions,
      positionsAvailable: jobOfferRequest.numberOfPositions,
      location: jobOfferRequest.location,
      jobDuration: jobOfferRequest.jobDuration,
      experienceRequired: jobOfferRequest.experienceRequired,
      salary: jobOfferRequest.salary,
      publicationStatus: 'approved',
      status: 'open',
      approvedBy: new mongoose.Types.ObjectId(req.userId),
      approvedAt: new Date(),
    })

    await jobOffer.save()

    await createNotification({
      userId: String(jobOfferRequest.recruiterId),
      type: 'job_request_approved',
      title: 'Demande approuvee',
      message: `Votre demande d'offre "${jobOfferRequest.jobTitle}" a ete approuvee et publiee.`,
      link: '/dashboard',
      metadata: {
        jobOfferRequestId: String(jobOfferRequest._id),
        jobOfferId: String(jobOffer._id),
      },
    })

    res.json({
      message: 'Job offer request approved and published',
      jobOfferRequest,
      jobOffer,
    })
  } catch (error: any) {
    console.error('Error approving job offer request:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Reject job offer request (admin only)
router.post('/admin/requests/:id/reject', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user?.isAdmin && user?.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { rejectionReason } = req.body

    const jobOfferRequest = await JobOfferRequest.findById(req.params.id)
    if (!jobOfferRequest) {
      return res.status(404).json({ error: 'Job offer request not found' })
    }

    if (jobOfferRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Can only reject pending requests' })
    }

    jobOfferRequest.status = 'rejected'
    jobOfferRequest.rejectionReason = rejectionReason || 'No reason provided'
    await jobOfferRequest.save()

    await createNotification({
      userId: String(jobOfferRequest.recruiterId),
      type: 'job_request_rejected',
      title: 'Demande rejetee',
      message: `Votre demande d'offre "${jobOfferRequest.jobTitle}" a ete rejetee. Motif: ${jobOfferRequest.rejectionReason}.`,
      link: '/dashboard',
      metadata: {
        jobOfferRequestId: String(jobOfferRequest._id),
      },
    })

    res.json({
      message: 'Job offer request rejected',
      jobOfferRequest,
    })
  } catch (error: any) {
    console.error('Error rejecting job offer request:', error)
    res.status(500).json({ error: error.message })
  }
})

// ✅ Get recruiter's job offer requests
router.get('/my-requests', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const requests = await JobOfferRequest.find({ recruiterId: req.userId }).sort({ createdAt: -1 })

    res.json({
      total: requests.length,
      requests,
    })
  } catch (error: any) {
    console.error('Error fetching recruiter requests:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
