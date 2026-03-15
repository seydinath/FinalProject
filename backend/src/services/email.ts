import nodemailer from 'nodemailer'
import { config } from '../config/env'

type SendEmailInput = {
  to: string
  subject: string
  text: string
  html?: string
}

let transporterCache: nodemailer.Transporter | null = null

export function isEmailServiceConfigured(): boolean {
  return Boolean(config.emailHost && config.emailPort && config.emailUser && config.emailPass)
}

function getTransporter(): nodemailer.Transporter | null {
  if (transporterCache) return transporterCache

  if (!isEmailServiceConfigured()) {
    return null
  }

  transporterCache = nodemailer.createTransport({
    host: config.emailHost,
    port: Number(config.emailPort),
    secure: Number(config.emailPort) === 465,
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  })

  return transporterCache
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    // Email is optional in local/dev environments.
    return false
  }

  try {
    await transporter.sendMail({
      from: config.emailFrom,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    })
    return true
  } catch (error) {
    console.error('Failed to send email notification:', error)
    return false
  }
}
