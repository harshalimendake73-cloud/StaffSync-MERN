import mongoose from 'mongoose';

const employeeProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true
    },
    designation: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['hr_admin', 'manager', 'employee'],
      default: 'employee'
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    employmentStatus: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern', 'probation', 'terminated'],
      default: 'full_time',
      index: true
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: '' }
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

employeeProfileSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeProfileSchema.set('toJSON', { virtuals: true });
employeeProfileSchema.set('toObject', { virtuals: true });

export default mongoose.model('EmployeeProfile', employeeProfileSchema);

