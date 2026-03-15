import { Router, Response } from 'express'
import mongoose from 'mongoose'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { Notification } from '../models/Notification'
import { validateObjectIdParam } from '../middleware/validation'

const router = Router()

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit || 30), 100)
    const page = Math.max(Number(req.query.page || 1), 1)
    const unreadOnly = String(req.query.unreadOnly || 'false') === 'true'
    const type = typeof req.query.type === 'string' ? req.query.type : 'all'

    const filter: any = {
      userId: new mongoose.Types.ObjectId(req.userId),
    }

    if (unreadOnly) {
      filter.readAt = null
    }

    if (type !== 'all') {
      filter.type = type
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const unreadCount = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(req.userId),
      readAt: null,
    })

    res.json({
      notifications,
      unreadCount,
      page,
      hasMore: notifications.length === limit,
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' })
  }
})

router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(req.userId),
      readAt: null,
    })

    res.json({ unreadCount })
  } catch (error: any) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch unread count' })
  }
})

router.patch('/:id/read', authenticateToken, validateObjectIdParam('id'), async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
        userId: new mongoose.Types.ObjectId(req.userId),
      },
      { readAt: new Date() },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    res.json({ notification })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ error: error.message || 'Failed to update notification' })
  }
})

router.patch('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(req.userId),
        readAt: null,
      },
      { readAt: new Date() }
    )

    res.json({ modifiedCount: result.modifiedCount })
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({ error: error.message || 'Failed to update notifications' })
  }
})

export default router
