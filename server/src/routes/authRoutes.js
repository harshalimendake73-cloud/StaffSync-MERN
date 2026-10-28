import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from '../validators/index.js';

const router = express.Router();

// Rate limiting on sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, resetPassword);
router.patch('/change-password', authenticate, changePasswordValidator, changePassword);

export default router;

