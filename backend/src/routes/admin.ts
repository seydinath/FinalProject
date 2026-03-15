import { Router, Response } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { User } from '../models/User'
import { JobOffer } from '../models/JobOffer'
import { JobApplication } from '../models/JobApplication'
import { JobOfferRequest } from '../models/JobOfferRequest'

const router = Router()

async function requireAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false
  const user = await User.findById(userId)
  return !!(user?.isAdmin || user?.userType === 'admin')
}

async function getAdminCount(): Promise<number> {
  return User.countDocuments({
    $or: [{ isAdmin: true }, { userType: 'admin' }],
  })
}

function isUserAdminRecord(user: any): boolean {
  return !!(user?.isAdmin || user?.userType === 'admin')
}

router.get('/users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const users = await User.find({}).sort({ createdAt: -1 })

    res.json({
      total: users.length,
      users: users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        type: u.userType,
        isAdmin: !!u.isAdmin || u.userType === 'admin',
        status: u.moderationStatus || 'active',
        joinDate: u.createdAt,
        lastActive: u.updatedAt,
      })),
    })
  } catch (error: any) {
    console.error('Admin users error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch users' })
  }
})

router.patch('/users/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { status } = req.body as { status?: 'active' | 'suspended' | 'banned' }
    if (!status || !['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { moderationStatus: status },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      message: 'User status updated',
      user: {
        id: String(user._id),
        status: user.moderationStatus || 'active',
      },
    })
  } catch (error: any) {
    console.error('Admin update user status error:', error)
    res.status(500).json({ error: error.message || 'Failed to update user status' })
  }
})

router.patch('/users/:id/role', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { userType } = req.body as { userType?: 'job_seeker' | 'recruiter' }
    if (!userType || !['job_seeker', 'recruiter'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const currentType = user.userType
    if (currentType === userType) {
      return res.json({
        message: 'User role unchanged',
        user: {
          id: String(user._id),
          type: user.userType,
          isAdmin: isUserAdminRecord(user),
        },
      })
    }

    if (currentType === 'recruiter' && userType === 'job_seeker') {
      const [jobOffersCount, requestsCount] = await Promise.all([
        JobOffer.countDocuments({ recruiter: user._id }),
        JobOfferRequest.countDocuments({ recruiterId: user._id }),
      ])

      if (jobOffersCount > 0 || requestsCount > 0) {
        return res.status(400).json({
          error: 'Cannot switch recruiter to job seeker while recruiter records exist',
        })
      }
    }

    if (currentType === 'job_seeker' && userType === 'recruiter') {
      const applicationsCount = await JobApplication.countDocuments({ candidateId: user._id })
      if (applicationsCount > 0) {
        return res.status(400).json({
          error: 'Cannot switch job seeker to recruiter while candidate applications exist',
        })
      }
    }

    user.userType = userType
    await user.save()

    res.json({
      message: 'User role updated',
      user: {
        id: String(user._id),
        type: user.userType,
        isAdmin: isUserAdminRecord(user),
      },
    })
  } catch (error: any) {
    console.error('Admin update user role error:', error)
    res.status(500).json({ error: error.message || 'Failed to update user role' })
  }
})

router.patch('/users/:id/admin-rights', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { isAdmin, fallbackUserType } = req.body as {
      isAdmin?: boolean
      fallbackUserType?: 'job_seeker' | 'recruiter'
    }

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: 'Invalid admin rights value' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const currentlyAdmin = isUserAdminRecord(user)
    if (currentlyAdmin === isAdmin) {
      return res.json({
        message: 'Admin rights unchanged',
        user: {
          id: String(user._id),
          type: user.userType,
          isAdmin: currentlyAdmin,
        },
      })
    }

    if (!isAdmin) {
      if (req.params.id === req.userId) {
        return res.status(400).json({ error: 'Cannot remove your own admin rights' })
      }

      const adminCount = await getAdminCount()
      if (currentlyAdmin && adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove admin rights from the last admin' })
      }

      user.isAdmin = false
      if (user.userType === 'admin') {
        if (!fallbackUserType || !['job_seeker', 'recruiter'].includes(fallbackUserType)) {
          return res.status(400).json({ error: 'fallbackUserType is required for legacy admin users' })
        }
        user.userType = fallbackUserType
      }
    } else {
      user.isAdmin = true
    }

    await user.save()

    res.json({
      message: 'Admin rights updated',
      user: {
        id: String(user._id),
        type: user.userType,
        isAdmin: isUserAdminRecord(user),
      },
    })
  } catch (error: any) {
    console.error('Admin update admin rights error:', error)
    res.status(500).json({ error: error.message || 'Failed to update admin rights' })
  }
})

router.delete('/users/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' })
    }

    const existing = await User.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (isUserAdminRecord(existing)) {
      const adminCount = await getAdminCount()
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin account' })
      }
    }

    await User.findByIdAndDelete(req.params.id)

    res.json({ message: 'User deleted' })
  } catch (error: any) {
    console.error('Admin delete user error:', error)
    res.status(500).json({ error: error.message || 'Failed to delete user' })
  }
})

router.get('/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const [
      totalUsers,
      totalJobSeekers,
      totalRecruiters,
      totalAdmins,
      totalJobs,
      totalOpenJobs,
      totalPendingRequests,
      totalApplications,
      acceptedApplications,
      rejectedApplications,
      pendingApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ userType: 'job_seeker' }),
      User.countDocuments({ userType: 'recruiter' }),
      User.countDocuments({ userType: 'admin' }),
      JobOffer.countDocuments(),
      JobOffer.countDocuments({ status: 'open', publicationStatus: 'approved' }),
      JobOfferRequest.countDocuments({ status: 'pending' }),
      JobApplication.countDocuments(),
      JobApplication.countDocuments({ status: 'accepted' }),
      JobApplication.countDocuments({ status: 'rejected' }),
      JobApplication.countDocuments({ status: 'applied' }),
    ])

    const keyMetrics = {
      totalUsers,
      totalJobs,
      totalOpenJobs,
      totalPendingRequests,
      totalApplications,
      conversionRate: totalApplications > 0 ? Number(((acceptedApplications / totalApplications) * 100).toFixed(2)) : 0,
    }

    const usersByType = [
      { label: 'job_seeker', value: totalJobSeekers },
      { label: 'recruiter', value: totalRecruiters },
      { label: 'admin', value: totalAdmins },
    ]

    const applicationsByStatus = [
      { label: 'applied', value: pendingApplications },
      { label: 'accepted', value: acceptedApplications },
      { label: 'rejected', value: rejectedApplications },
    ]

    const jobsByPublication = [
      { label: 'pending', value: await JobOffer.countDocuments({ publicationStatus: 'pending' }) },
      { label: 'approved', value: await JobOffer.countDocuments({ publicationStatus: 'approved' }) },
      { label: 'rejected', value: await JobOffer.countDocuments({ publicationStatus: 'rejected' }) },
    ]

    res.json({
      keyMetrics,
      usersByType,
      applicationsByStatus,
      jobsByPublication,
    })
  } catch (error: any) {
    console.error('Admin analytics error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch analytics' })
  }
})

router.get('/reports', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const [
      totalUsers,
      totalRecruiters,
      totalJobSeekers,
      totalJobs,
      totalPendingRequests,
      totalApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ userType: 'recruiter' }),
      User.countDocuments({ userType: 'job_seeker' }),
      JobOffer.countDocuments(),
      JobOfferRequest.countDocuments({ status: 'pending' }),
      JobApplication.countDocuments(),
      JobApplication.countDocuments({ status: 'accepted' }),
      JobApplication.countDocuments({ status: 'rejected' }),
    ])

    const reports = [
      {
        id: 'users-overview',
        title: 'Users Overview',
        type: 'user',
        generatedDate: new Date().toISOString(),
        status: 'completed',
        description: 'Live user distribution from database',
        metrics: {
          totalUsers,
          totalRecruiters,
          totalJobSeekers,
          totalAdmins: Math.max(totalUsers - totalRecruiters - totalJobSeekers, 0),
        },
      },
      {
        id: 'jobs-overview',
        title: 'Jobs Overview',
        type: 'job',
        generatedDate: new Date().toISOString(),
        status: 'completed',
        description: 'Live job and request state from database',
        metrics: {
          totalJobs,
          pendingJobRequests: totalPendingRequests,
          approvedJobs: await JobOffer.countDocuments({ publicationStatus: 'approved' }),
          rejectedJobs: await JobOffer.countDocuments({ publicationStatus: 'rejected' }),
        },
      },
      {
        id: 'applications-overview',
        title: 'Applications Overview',
        type: 'engagement',
        generatedDate: new Date().toISOString(),
        status: 'completed',
        description: 'Live application funnel from database',
        metrics: {
          totalApplications,
          acceptedApplications,
          rejectedApplications,
          pendingApplications: Math.max(totalApplications - acceptedApplications - rejectedApplications, 0),
        },
      },
    ]

    res.json({
      total: reports.length,
      reports,
    })
  } catch (error: any) {
    console.error('Admin reports error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch reports' })
  }
})

export default router
