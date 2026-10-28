import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '1h' } // automatic cleanup after expiry
    },
    used: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('PasswordResetToken', passwordResetTokenSchema);

