import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { config } from '../config/env'

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

export function initRealtime(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = getTokenFromSocket(socket)
    if (!token) {
      return next(new Error('Unauthorized: missing token'))
    }

    const userId = getUserIdFromToken(token)
    if (!userId) {
      return next(new Error('Unauthorized: invalid token'))
    }

    socket.data.userId = userId
    return next()
  })

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string
    socket.join(`user:${userId}`)

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
