import mongoose from 'mongoose';

const leavePolicySchema = new mongoose.Schema(
  {
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'earned', 'unpaid'],
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    annualQuota: {
      type: Number,
      required: true,
      min: 0,
      default: 10
    },
    maxConsecutiveDays: {
      type: Number,
      default: 14
    },
    carryForwardMax: {
      type: Number,
      default: 5
    },
    requiresProofDays: {
      type: Number,
      default: 3
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('LeavePolicy', leavePolicySchema);

