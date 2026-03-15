import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'application_submitted',
        'application_accepted',
        'application_rejected',
        'job_request_approved',
        'job_request_rejected',
        'support_message',
        'support_reply',
        'system',
      ],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
      maxlength: 160,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    link: {
      type: String,
      maxlength: 300,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

export const Notification = mongoose.model('Notification', NotificationSchema)
