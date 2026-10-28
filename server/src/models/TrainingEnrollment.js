import mongoose from 'mongoose';

const trainingEnrollmentSchema = new mongoose.Schema(
  {
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingProgram',
      required: true,
      index: true
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed', 'dropped'],
      default: 'enrolled',
      index: true
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

trainingEnrollmentSchema.index({ training: 1, employee: 1 }, { unique: true });

export default mongoose.model('TrainingEnrollment', trainingEnrollmentSchema);

