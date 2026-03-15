import mongoose from 'mongoose'

const JobOfferSchema = new mongoose.Schema(
  {
    jobOfferRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOfferRequest',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      default: 'JobConnect Partner',
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    positionsAvailable: {
      type: Number,
      required: true,
      min: 1,
    },
    location: String,
    startDate: Date,
    endDate: Date,
    jobDuration: {
      type: String,
      enum: ['temporary', 'permanent', 'contract', 'part-time'],
    },
    experienceRequired: {
      type: Number,
      default: 0,
      min: 0,
    },
    requiredSkills: [String],
    salary: Number,
    salaryRange: {
      min: Number,
      max: Number,
      currency: String,
    },
    // Publication status: 'pending' = awaiting admin approval
    publicationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Job status: open/closed/filled
    status: {
      type: String,
      enum: ['open', 'closed', 'filled'],
      default: 'open',
    },
    rejectionReason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: Date,
    approvedAt: Date,
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication',
      },
    ],
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

export const JobOffer = mongoose.model('JobOffer', JobOfferSchema)
