import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jobconnect',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  emailHost: process.env.EMAIL_HOST || '',
  emailPort: process.env.EMAIL_PORT || '587',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'no-reply@jobconnect.local',
}
