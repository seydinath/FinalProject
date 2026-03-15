import mongoose from 'mongoose'
import { config } from './env'

export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongoUri)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error('MongoDB Connection Error:', error)
    process.exit(1)
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect()
    console.log('MongoDB Disconnected')
  } catch (error) {
    console.error('MongoDB Disconnection Error:', error)
    process.exit(1)
  }
}
