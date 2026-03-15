import mongoose from 'mongoose'

const SupportMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1500,
      trim: true,
    },
    readByUserAt: {
      type: Date,
      default: null,
    },
    readByAdminAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

SupportMessageSchema.index({ userId: 1, createdAt: -1 })

export const SupportMessage = mongoose.model('SupportMessage', SupportMessageSchema)