import mongoose from 'mongoose'

const SupportConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
      required: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
)

export const SupportConversation = mongoose.model('SupportConversation', SupportConversationSchema)