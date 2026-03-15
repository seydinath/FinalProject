import { Router, Response } from 'express'
import mongoose from 'mongoose'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { SupportConversation } from '../models/SupportConversation'
import { SupportMessage } from '../models/SupportMessage'
import { User } from '../models/User'
import { createNotification, createNotifications } from '../services/notification'
import { emitSupportConversation, emitSupportMessage } from '../services/realtime'

const router = Router()

async function requireAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false
  const user = await User.findById(userId).select('isAdmin userType')
  return !!(user?.isAdmin || user?.userType === 'admin')
}

async function resolveThreadUserId(req: AuthRequest, isAdmin: boolean): Promise<string | null> {
  if (!req.userId) return null
  if (!isAdmin) return req.userId

  const rawUserId = typeof req.query.userId === 'string'
    ? req.query.userId
    : typeof req.body?.userId === 'string'
      ? req.body.userId
      : null

  if (!rawUserId || !mongoose.Types.ObjectId.isValid(rawUserId)) {
    return null
  }

  return rawUserId
}

function serializeMessage(message: any) {
  const sender = message.senderId && typeof message.senderId === 'object'
    ? {
        id: String(message.senderId._id || message.senderId.id || ''),
        name: message.senderId.name || '',
        email: message.senderId.email || '',
      }
    : {
        id: String(message.senderId || ''),
        name: '',
        email: '',
      }

  return {
    _id: String(message._id),
    userId: String(message.userId),
    senderRole: message.senderRole,
    sender,
    message: message.message,
    readByUserAt: message.readByUserAt,
    readByAdminAt: message.readByAdminAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  }
}

function serializeConversation(conversation: any, extra?: Record<string, unknown>) {
  return {
    userId: String(conversation.userId?._id || conversation.userId),
    status: conversation.status || 'open',
    resolvedAt: conversation.resolvedAt,
    resolvedBy: conversation.resolvedBy
      ? {
          id: String(conversation.resolvedBy._id || conversation.resolvedBy),
          name: conversation.resolvedBy.name || '',
          email: conversation.resolvedBy.email || '',
        }
      : null,
    lastMessageAt: conversation.lastMessageAt,
    ...extra,
  }
}

async function ensureConversation(userId: string) {
  return SupportConversation.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    {
      $setOnInsert: {
        userId: new mongoose.Types.ObjectId(userId),
        status: 'open',
      },
      $set: {
        lastMessageAt: new Date(),
      },
    },
    { upsert: true, new: true }
  )
}

async function buildConversationSummary(userId: string) {
  const [conversation, user, latestMessage, unreadCount] = await Promise.all([
    SupportConversation.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate('resolvedBy', 'name email'),
    User.findById(userId).select('name email userType'),
    SupportMessage.findOne({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 }),
    SupportMessage.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      senderRole: 'user',
      readByAdminAt: null,
    }),
  ])

  return {
    userId,
    userName: user?.name || 'Utilisateur',
    userEmail: user?.email || '',
    userType: user?.userType || 'job_seeker',
    unreadCount,
    lastMessage: latestMessage?.message || '',
    lastSenderRole: latestMessage?.senderRole || 'user',
    lastMessageAt: latestMessage?.createdAt || conversation?.lastMessageAt || new Date(),
    status: conversation?.status || 'open',
    resolvedAt: conversation?.resolvedAt || null,
    resolvedBy: conversation?.resolvedBy
      ? {
          id: String((conversation.resolvedBy as any)._id),
          name: (conversation.resolvedBy as any).name || '',
          email: (conversation.resolvedBy as any).email || '',
        }
      : null,
  }
}

router.get('/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const [unreadMessages, openConversations] = await Promise.all([
      SupportMessage.countDocuments({ senderRole: 'user', readByAdminAt: null }),
      SupportConversation.countDocuments({ status: 'open' }),
    ])

    res.json({ unreadMessages, openConversations })
  } catch (error: any) {
    console.error('Error fetching support summary:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch support summary' })
  }
})

router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const latestMessages = await SupportMessage.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'name email userType')
      .lean()

    const conversationsState = await SupportConversation.find({})
      .populate('resolvedBy', 'name email')
      .lean()

    const unreadRows = await SupportMessage.aggregate([
      {
        $match: {
          senderRole: 'user',
          readByAdminAt: null,
        },
      },
      {
        $group: {
          _id: '$userId',
          unreadCount: { $sum: 1 },
        },
      },
    ])

    const unreadMap = new Map(unreadRows.map((row) => [String(row._id), Number(row.unreadCount || 0)]))
    const conversationMap = new Map(conversationsState.map((item: any) => [String(item.userId), item]))
    const seen = new Set<string>()

    const conversations = latestMessages.reduce<any[]>((accumulator, item: any) => {
      const user = item.userId
      const userId = String(user?._id || item.userId)
      if (!userId || seen.has(userId)) {
        return accumulator
      }

      seen.add(userId)
      accumulator.push({
        userId,
        userName: user?.name || 'Utilisateur',
        userEmail: user?.email || '',
        userType: user?.userType || 'job_seeker',
        unreadCount: unreadMap.get(userId) || 0,
        lastMessage: item.message,
        lastSenderRole: item.senderRole,
        lastMessageAt: item.createdAt,
        status: conversationMap.get(userId)?.status || 'open',
        resolvedAt: conversationMap.get(userId)?.resolvedAt || null,
        resolvedBy: conversationMap.get(userId)?.resolvedBy
          ? {
              id: String((conversationMap.get(userId) as any).resolvedBy._id),
              name: (conversationMap.get(userId) as any).resolvedBy.name || '',
              email: (conversationMap.get(userId) as any).resolvedBy.email || '',
            }
          : null,
      })
      return accumulator
    }, [])

    res.json({ conversations })
  } catch (error: any) {
    console.error('Error fetching support conversations:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch support conversations' })
  }
})

router.get('/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = await requireAdmin(req.userId)
    const threadUserId = await resolveThreadUserId(req, isAdmin)

    if (!threadUserId) {
      return res.status(400).json({ error: 'A valid userId is required' })
    }

    const messages = await SupportMessage.find({ userId: new mongoose.Types.ObjectId(threadUserId) })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate('senderId', 'name email')

    const user = await User.findById(threadUserId).select('name email userType')
    const conversation = await SupportConversation.findOne({ userId: new mongoose.Types.ObjectId(threadUserId) })
      .populate('resolvedBy', 'name email')

    res.json({
      threadUser: user
        ? {
            id: String(user._id),
            name: user.name,
            email: user.email,
            userType: user.userType,
          }
        : null,
      conversation: conversation ? serializeConversation(conversation) : null,
      messages: messages.map(serializeMessage),
    })
  } catch (error: any) {
    console.error('Error fetching support messages:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch support messages' })
  }
})

router.patch('/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = await requireAdmin(req.userId)
    const threadUserId = await resolveThreadUserId(req, isAdmin)

    if (!threadUserId) {
      return res.status(400).json({ error: 'A valid userId is required' })
    }

    const query = {
      userId: new mongoose.Types.ObjectId(threadUserId),
      ...(isAdmin
        ? { senderRole: 'user', readByAdminAt: null }
        : { senderRole: 'admin', readByUserAt: null }),
    }

    const update = isAdmin
      ? { readByAdminAt: new Date() }
      : { readByUserAt: new Date() }

    const result = await SupportMessage.updateMany(query, update)
    res.json({ modifiedCount: result.modifiedCount })
  } catch (error: any) {
    console.error('Error marking support thread as read:', error)
    res.status(500).json({ error: error.message || 'Failed to update support thread' })
  }
})

router.post('/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const trimmedMessage = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
    if (!trimmedMessage || trimmedMessage.length > 1500) {
      return res.status(400).json({ error: 'Message must contain between 1 and 1500 characters' })
    }

    const isAdmin = await requireAdmin(req.userId)
    const threadUserId = await resolveThreadUserId(req, isAdmin)

    if (!threadUserId) {
      return res.status(400).json({ error: 'A valid userId is required' })
    }

    const threadUser = await User.findById(threadUserId).select('name email')
    if (!threadUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const conversation = await ensureConversation(threadUserId)

    if (conversation.status === 'resolved') {
      conversation.status = 'open'
      conversation.set('resolvedAt', null)
      conversation.set('resolvedBy', null)
      conversation.lastMessageAt = new Date()
      await conversation.save()
    }

    const message = await SupportMessage.create({
      userId: new mongoose.Types.ObjectId(threadUserId),
      senderId: new mongoose.Types.ObjectId(req.userId),
      senderRole: isAdmin ? 'admin' : 'user',
      message: trimmedMessage,
      readByUserAt: isAdmin ? null : new Date(),
      readByAdminAt: isAdmin ? new Date() : null,
    })

    await message.populate('senderId', 'name email')
    conversation.lastMessageAt = message.createdAt
    await conversation.save()

    const serializedConversation = await buildConversationSummary(threadUserId)
    const serializedMessage = serializeMessage(message)

    emitSupportMessage(threadUserId, {
      message: serializedMessage,
      conversation: serializedConversation,
    })

    emitSupportConversation(threadUserId, serializedConversation)

    if (isAdmin) {
      await createNotification({
        userId: threadUserId,
        type: 'support_reply',
        title: 'Reponse de l\'administration',
        message: trimmedMessage.length > 120 ? `${trimmedMessage.slice(0, 117)}...` : trimmedMessage,
        link: '/notifications',
        metadata: { channel: 'support' },
      })
    } else {
      const admins = await User.find({ $or: [{ isAdmin: true }, { userType: 'admin' }] }).select('_id')
      await createNotifications(
        admins.map((admin) => ({
          userId: String(admin._id),
          type: 'support_message',
          title: `Nouveau message support de ${threadUser.name}`,
          message: trimmedMessage.length > 120 ? `${trimmedMessage.slice(0, 117)}...` : trimmedMessage,
          link: '/user-management',
          metadata: { channel: 'support', threadUserId },
        }))
      )
    }

    res.status(201).json({ message: serializedMessage, conversation: serializedConversation })
  } catch (error: any) {
    console.error('Error sending support message:', error)
    res.status(500).json({ error: error.message || 'Failed to send support message' })
  }
})

router.patch('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!await requireAdmin(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { userId, status } = req.body as { userId?: string; status?: 'open' | 'resolved' }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'A valid userId is required' })
    }

    if (!status || !['open', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const conversation = await ensureConversation(userId)
    conversation.status = status
    conversation.set('resolvedAt', status === 'resolved' ? new Date() : null)
    conversation.set(
      'resolvedBy',
      status === 'resolved' && req.userId
        ? new mongoose.Types.ObjectId(req.userId)
        : null
    )
    await conversation.save()
    await conversation.populate('resolvedBy', 'name email')

    const payload = await buildConversationSummary(userId)
    emitSupportConversation(userId, payload)

    if (status === 'resolved') {
      await createNotification({
        userId,
        type: 'system',
        title: 'Conversation support resolue',
        message: 'Votre conversation avec l\'administration a ete marquee comme resolue.',
        link: '/notifications',
        metadata: { channel: 'support', status: 'resolved' },
      })
    }

    res.json({ conversation: payload })
  } catch (error: any) {
    console.error('Error updating support conversation status:', error)
    res.status(500).json({ error: error.message || 'Failed to update support conversation status' })
  }
})

export default router