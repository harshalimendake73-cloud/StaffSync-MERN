import mongoose from 'mongoose';

const balanceBucketSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0, min: 0 },
    used: { type: Number, default: 0, min: 0 },
    pending: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
      index: true
    },
    casual: { type: balanceBucketSchema, default: () => ({ total: 12, used: 0, pending: 0 }) },
    sick: { type: balanceBucketSchema, default: () => ({ total: 10, used: 0, pending: 0 }) },
    earned: { type: balanceBucketSchema, default: () => ({ total: 15, used: 0, pending: 0 }) },
    unpaid: { type: balanceBucketSchema, default: () => ({ total: 30, used: 0, pending: 0 }) }
  },
  {
    timestamps: true
  }
);

leaveBalanceSchema.index({ employee: 1, year: 1 }, { unique: true });

export default mongoose.model('LeaveBalance', leaveBalanceSchema);

