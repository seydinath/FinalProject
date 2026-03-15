import mongoose from 'mongoose'

const JobApplicationSchema = new mongoose.Schema(
  {
    jobOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOffer',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
    },
    candidateEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    candidatePhone: String,
    candidateCvUrl: String,
    candidateLocation: String,
    candidateExperience: {
      type: Number,
      min: 0,
    },
    candidateSkills: [String],
    candidateCoverLetter: String,
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'],
      default: 'applied',
    },
    recruiterNote: String,
    reviewedAt: Date,
    shortlistedAt: Date,
    interviewScheduledAt: Date,
    interviewDate: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    validatedByRecruiterAt: Date,
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    matchedSkills: [String],
    missingSkills: [String],
    matchReasons: [String],
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    appliedAt: {
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

export const JobApplication = mongoose.model('JobApplication', JobApplicationSchema)
