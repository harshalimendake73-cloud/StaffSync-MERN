import mongoose from 'mongoose';

const trainingProgramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    instructor: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    durationHours: {
      type: Number,
      required: true,
      min: 1
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 20
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('TrainingProgram', trainingProgramSchema);

