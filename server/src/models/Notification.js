import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['leave', 'attendance', 'training', 'announcement', 'system'],
      default: 'system'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Notification', notificationSchema);

