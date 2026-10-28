import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['hr_admin', 'manager', 'employee'],
      default: 'employee',
      required: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    employeeProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeProfile'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model('User', userSchema);

