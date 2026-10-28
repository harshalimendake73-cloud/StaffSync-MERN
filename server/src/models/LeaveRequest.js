import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'earned', 'unpaid'],
      required: true,
      index: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0.5
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    reviewComment: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

leaveRequestSchema.index({ employee: 1, startDate: 1, endDate: 1 });

export default mongoose.model('LeaveRequest', leaveRequestSchema);

