import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    checkIn: {
      type: Date,
      required: true
    },
    checkOut: {
      type: Date
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day', 'on_leave'],
      default: 'present',
      index: true
    },
    shiftType: {
      type: String,
      enum: ['standard', 'overnight'],
      default: 'standard'
    },
    isOvernight: {
      type: Boolean,
      default: false
    },
    correctedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    correctionReason: {
      type: String,
      default: '',
      trim: true
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

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);

