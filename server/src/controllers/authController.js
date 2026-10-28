import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate({
      path: 'employeeProfile',
      populate: { path: 'department', select: 'name code' }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact HR.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    setAuthCookie(res, token);

    await logAuditEvent({
      action: 'USER_LOGIN',
      performedBy: user._id,
      targetEntity: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeProfile: user.employeeProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAuditEvent({
        action: 'USER_LOGOUT',
        performedBy: req.user._id,
        targetEntity: 'User',
        entityId: req.user._id,
        req
      });
    }
    clearAuthCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'employeeProfile',
      populate: [
        { path: 'department', select: 'name code' },
        { path: 'reportingManager', select: 'email employeeProfile' }
      ]
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        employeeProfile: user.employeeProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // For security, do not disclose if user exists, but for dev demo return instructions
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been generated.'
      });
    }

    // Generate random reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Invalidate existing tokens
    await PasswordResetToken.deleteMany({ user: user._id });

    // Save token with 1 hour expiry
    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    await logAuditEvent({
      action: 'PASSWORD_RESET_REQUESTED',
      performedBy: user._id,
      targetEntity: 'User',
      entityId: user._id,
      details: { email },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link generated successfully.',
      // In development demo, return the token so the user can test the reset workflow directly
      resetToken: rawToken,
      resetUrl: `/reset-password?token=${rawToken}`
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is invalid or has expired.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(resetRecord.user, { passwordHash: newPasswordHash });

    resetRecord.used = true;
    await resetRecord.save();

    await logAuditEvent({
      action: 'PASSWORD_RESET_COMPLETED',
      performedBy: resetRecord.user,
      targetEntity: 'User',
      entityId: resetRecord.user,
      req
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await logAuditEvent({
      action: 'PASSWORD_CHANGED',
      performedBy: user._id,
      targetEntity: 'User',
      entityId: user._id,
      req
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

