import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Ne pas inclure par défaut dans les requêtes
    },
    name: {
      type: String,
      required: true,
    },
    avatar: String,
    userType: {
      type: String,
      enum: ['recruiter', 'job_seeker', 'admin'],
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
    },
    profile: {
      headline: String,
      bio: String,
      phone: String,
      location: String,
      skills: [String],
      yearsOfExperience: {
        type: Number,
        default: 0,
        min: 0,
      },
      expectations: String,
      languages: [String],
      availability: {
        type: String,
        enum: ['immediate', '2-weeks', '1-month', 'negotiable'],
        default: 'negotiable',
      },
      desiredDomain: String,
      cvUrl: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpiresAt: {
      type: Date,
      select: false,
    },
    emailVerifiedAt: Date,
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

export const User = mongoose.model('User', UserSchema)
