import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    targetAudience: {
      type: String,
      enum: ['all', 'department', 'role'],
      default: 'all',
      index: true
    },
    targetDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    targetRole: {
      type: String,
      enum: ['hr_admin', 'manager', 'employee']
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Announcement', announcementSchema);

