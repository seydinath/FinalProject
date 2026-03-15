import mongoose from 'mongoose'

const ApplicationSchema = new mongoose.Schema(
  {
    jobOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOffer',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    message: String,
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export const Application = mongoose.model('Application', ApplicationSchema)
