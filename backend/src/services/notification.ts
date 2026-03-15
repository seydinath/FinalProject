import mongoose from 'mongoose'
import { Notification } from '../models/Notification'
import { User } from '../models/User'
import { emitUserNotification } from './realtime'
import { sendEmail } from './email'

type NotificationType =
  | 'application_submitted'
  | 'application_accepted'
  | 'application_rejected'
  | 'job_request_approved'
  | 'job_request_rejected'
  | 'system'

export type CreateNotificationInput = {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, unknown>
}

async function sendNotificationEmail(userId: string, title: string, message: string, link?: string) {
  try {
    const user = await User.findById(userId).select('email name')
    if (!user?.email) return

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const actionUrl = link ? `${appUrl}${link}` : appUrl

    await sendEmail({
      to: user.email,
      subject: `[JobConnect] ${title}`,
      text: `${message}\n\nVoir sur JobConnect: ${actionUrl}`,
      html: `<p>${message}</p><p><a href="${actionUrl}">Voir sur JobConnect</a></p>`,
    })
  } catch (error) {
    // Optional side-effect: never break API flow.
    console.error('Failed to send notification email:', error)
  }
}

function shouldSendEmail(type: NotificationType): boolean {
  return [
    'application_submitted',
    'application_accepted',
    'application_rejected',
    'job_request_approved',
    'job_request_rejected',
  ].includes(type)
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(input.userId),
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata || {},
      readAt: null,
    })

    emitUserNotification(input.userId, notification)

    if (shouldSendEmail(input.type)) {
      await sendNotificationEmail(input.userId, input.title, input.message, input.link)
    }

    return notification
  } catch (error) {
    // Notifications should not break core business flows.
    console.error('Failed to create notification:', error)
    return null
  }
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  if (!inputs.length) return []

  try {
    const docs = inputs.map((input) => ({
      userId: new mongoose.Types.ObjectId(input.userId),
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata || {},
      readAt: null,
    }))

    const created = await Notification.insertMany(docs, { ordered: false })

    for (const notification of created) {
      emitUserNotification(String(notification.userId), notification)
    }

    const emailTasks = inputs
      .filter((item) => shouldSendEmail(item.type))
      .map((item) => sendNotificationEmail(item.userId, item.title, item.message, item.link))

    await Promise.all(emailTasks)

    return created
  } catch (error) {
    console.error('Failed to create notifications:', error)
    return []
  }
}
