import { Router, Response } from 'express'
import mongoose from 'mongoose'
import { JobOffer } from '../models/JobOffer'
import { User } from '../models/User'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { validateBody, validateObjectIdParam } from '../middleware/validation'

const router = Router()

// ✅ Helper to check if user is admin
async function isUserAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false
  const user = await User.findById(userId)
  return user?.isAdmin || user?.userType === 'admin'
}

// ✅ Create job offer (recruiter only)
router.post('/', authenticateToken, validateBody([
  { field: 'title', type: 'string', required: true, minLength: 3, maxLength: 140 },
  { field: 'description', type: 'string', required: true, minLength: 10, maxLength: 5000 },
  { field: 'positionsAvailable', type: 'number', required: true, min: 1, max: 10000 },
]), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.userType !== 'recruiter' && !user?.isAdmin) {
      return res.status(403).json({ error: 'Only recruiters can post jobs' })
    }

    const {
      title,
      description,
      positionsAvailable,
      companyName,
      location,
      startDate,
      endDate,
      requiredSkills,
      salaryRange,
    } = req.body

    if (!title || !description || !positionsAvailable) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const jobOffer = new JobOffer({
      title,
      description,
      companyName: companyName || 'JobConnect Partner',
      recruiter: new mongoose.Types.ObjectId(req.userId),
      positionsAvailable,
      location,
      startDate,
      endDate,
      requiredSkills: requiredSkills || [],
      salaryRange,
      publicationStatus: 'pending',
      status: 'open'
    })

    await jobOffer.save()

    res.status(201).json({
      message: 'Job offer created and pending approval',
      jobOffer: jobOffer,
    })
  } catch (error) {
    console.error('Create job offer error:', error)
    res.status(500).json({ error: 'Failed to create job offer' })
  }
})

// ✅ Get all PUBLIC job offers (only approved + open)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { location, skills, limit = 50, offset = 0 } = req.query

    const filter: any = { 
      publicationStatus: 'approved',
      status: 'open'
    }

    if (location) {
      filter.location = { $regex: location as string, $options: 'i' }
    }

    if (skills) {
        const skillsArray = (skills as string).split(',')
        filter.requiredSkills = { $in: skillsArray }
      }

    const jobOffers = await JobOffer.find(filter)
      .populate('recruiter', 'name email profile')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))

    const total = await JobOffer.countDocuments(filter)

    res.json({
      data: jobOffers,
      total,
      offset: parseInt(offset as string),
      limit: parseInt(limit as string)
    })
  } catch (error) {
    console.error('Get job offers error:', error)
    res.status(500).json({ error: 'Failed to fetch job offers' })
  }
})

// ✅ Get MY job offers (recruiter only)
router.get('/recruiter/my-offers', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const jobOffers = await JobOffer.find({ recruiter: new mongoose.Types.ObjectId(req.userId) })
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })

    res.json(jobOffers)
  } catch (error) {
    console.error('Get recruiter offers error:', error)
    res.status(500).json({ error: 'Failed to fetch your job offers' })
  }
})

// ✅ Get ADMIN: Pending job offers for moderation
router.get('/admin/pending', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await isUserAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin only' })
    }

    const pendingOffers = await JobOffer.find({ publicationStatus: 'pending' })
      .populate('recruiter', 'name email profile')
      .sort({ createdAt: -1 })

    res.json(pendingOffers)
  } catch (error) {
    console.error('Get pending offers error:', error)
    res.status(500).json({ error: 'Failed to fetch pending offers' })
  }
})

// ✅ Get ADMIN: All job offers (any status)
router.get('/admin/all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await isUserAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin only' })
    }

    const { publicationStatus, status } = req.query
    const filter: any = {}

    if (publicationStatus) filter.publicationStatus = publicationStatus
    if (status) filter.status = status

    const allOffers = await JobOffer.find(filter)
      .populate('recruiter', 'name email profile')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(allOffers)
  } catch (error) {
    console.error('Get all offers error:', error)
    res.status(500).json({ error: 'Failed to fetch offers' })
  }
})

// ✅ Get job offer by ID (with auth check)
router.get('/:id', validateObjectIdParam('id'), async (req: AuthRequest, res: Response) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id)
      .populate('recruiter', 'name email profile')
      .populate('approvedBy', 'name email')

    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' })
    }

    // If not approved, only recruiter or admin can see
    if (jobOffer.publicationStatus !== 'approved') {
      const isAdmin = await isUserAdmin(req.userId || '')
      const isRecruiter = jobOffer.recruiter._id.toString() === req.userId
      
      if (!isAdmin && !isRecruiter) {
        return res.status(404).json({ error: 'Job offer not found' })
      }
    }

    res.json(jobOffer)
  } catch (error) {
    console.error('Get job offer error:', error)
    res.status(500).json({ error: 'Failed to fetch job offer' })
  }
})

// ✅ ADMIN: Approve job offer
router.patch('/:id/approve', authenticateToken, validateObjectIdParam('id'), async (req: AuthRequest, res: Response) => {
  try {
    if (!await isUserAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin only' })
    }

    const jobOffer = await JobOffer.findByIdAndUpdate(
      req.params.id,
      {
        publicationStatus: 'approved',
        approvedBy: new mongoose.Types.ObjectId(req.userId),
        approvedAt: new Date()
      },
      { new: true }
    ).populate('recruiter', 'name email')

    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' })
    }

    res.json({
      message: 'Job offer approved',
      jobOffer
    })
  } catch (error) {
    console.error('Approve job offer error:', error)
    res.status(500).json({ error: 'Failed to approve job offer' })
  }
})

// ✅ ADMIN: Reject job offer
router.patch('/:id/reject', authenticateToken, validateObjectIdParam('id'), validateBody([
  { field: 'reason', type: 'string', required: true, minLength: 3, maxLength: 300 },
]), async (req: AuthRequest, res: Response) => {
  try {
    if (!await isUserAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin only' })
    }

    const { reason } = req.body
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' })
    }

    const jobOffer = await JobOffer.findByIdAndUpdate(
      req.params.id,
      {
        publicationStatus: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date()
      },
      { new: true }
    ).populate('recruiter', 'name email')

    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' })
    }

    res.json({
      message: 'Job offer rejected',
      jobOffer
    })
  } catch (error) {
    console.error('Reject job offer error:', error)
    res.status(500).json({ error: 'Failed to reject job offer' })
  }
})

export default router

