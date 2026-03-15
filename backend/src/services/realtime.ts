import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { config } from '../config/env'
import { User } from '../models/User'

let io: Server | null = null

function getTokenFromSocket(socket: Socket): string | null {
  const authToken = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : null
  if (authToken) return authToken

  const headerToken = typeof socket.handshake.headers.authorization === 'string'
    ? socket.handshake.headers.authorization.split(' ')[1]
    : null

  return headerToken || null
}

function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret as string) as { userId?: string }
    return decoded.userId || null
  } catch {
    return null
  }
}

async function isAdminUser(userId: string): Promise<boolean> {
  const user = await User.findById(userId).select('isAdmin userType')
  return !!(user?.isAdmin || user?.userType === 'admin')
}

export function initRealtime(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  })

  io.use(async (socket, next) => {
    const token = getTokenFromSocket(socket)
    if (!token) {
      return next(new Error('Unauthorized: missing token'))
    }

    const userId = getUserIdFromToken(token)
    if (!userId) {
      return next(new Error('Unauthorized: invalid token'))
    }

    socket.data.userId = userId
    socket.data.isAdmin = await isAdminUser(userId)
    return next()
  })

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string
    socket.join(`user:${userId}`)

    if (socket.data.isAdmin) {
      socket.join('admins')
    }

    socket.on('disconnect', () => {
      // Socket.IO handles cleanup automatically.
    })
  })

  return io
}

export function emitUserNotification(userId: string, notification: unknown) {
  if (!io) return
  io.to(`user:${userId}`).emit('notification:new', notification)
}

export function emitSupportMessage(threadUserId: string, payload: unknown) {
  if (!io) return
  io.to(`user:${threadUserId}`).emit('support:message', payload)
  io.to('admins').emit('support:message', payload)
}

export function emitSupportConversation(threadUserId: string, payload: unknown) {
  if (!io) return
  io.to(`user:${threadUserId}`).emit('support:conversation', payload)
  io.to('admins').emit('support:conversation', payload)
}
