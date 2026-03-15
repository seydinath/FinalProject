import express from 'express'
import cors from 'cors'
import path from 'path'
import { config } from './config/env'
import { connectDB } from './config/database'
import { initRedis, closeRedis } from './services/redis'
import authRoutes from './routes/auth'
import jobOfferRoutes from './routes/jobOffers'
import jobOfferRequestRoutes from './routes/jobOfferRequests'
import applicationRoutes from './routes/applications'
import candidatesRoutes from './routes/candidates'
import adminRoutes from './routes/admin'
import notificationRoutes from './routes/notifications'
import { initRealtime } from './services/realtime'

export const app = express()

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'JobConnect API is running' })
})

// Routes
app.use('/auth', authRoutes)
app.use('/job-offers', jobOfferRoutes)
app.use('/job-offer-requests', jobOfferRequestRoutes)
app.use('/applications', applicationRoutes)
app.use('/candidates', candidatesRoutes)
app.use('/admin', adminRoutes)
app.use('/notifications', notificationRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

// Start server
async function startServer() {
  try {
    await connectDB()
    
    // Initialize Redis without blocking server startup
    initRedis().catch(err => {
      console.warn('⚠️ Redis initialization failed (optional service):', err)
    })
    
    const server = app.listen(config.port, () => {
      console.log(`🚀 JobConnect API running on port ${config.port}`)
      console.log(`Environment: ${config.nodeEnv}`)
    })

    initRealtime(server)

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server')
      server.close(async () => {
        await closeRedis()
        console.log('HTTP server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server')
      server.close(async () => {
        await closeRedis()
        console.log('HTTP server closed')
        process.exit(0)
      })
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer()
}
