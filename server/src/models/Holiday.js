import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
      index: true
    }
  },
  {
    timestamps: true
  }
);

holidaySchema.index({ date: 1, name: 1 }, { unique: true });

export default mongoose.model('Holiday', holidaySchema);

