import mongoose from 'mongoose'

const JobOfferRequestSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    numberOfPositions: {
      type: Number,
      required: true,
      min: 1,
    },
    jobDuration: {
      type: String,
      required: true,
      enum: ['temporary', 'permanent', 'contract', 'part-time'],
    },
    experienceRequired: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export const JobOfferRequest = mongoose.model('JobOfferRequest', JobOfferRequestSchema)
