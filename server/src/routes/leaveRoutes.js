import express from 'express';
import {
  getLeaves,
  getLeaveById,
  applyLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getMyLeaveBalance
} from '../controllers/leaveController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { leaveApplicationValidator, leaveReviewValidator } from '../validators/index.js';

const router = express.Router();

router.get('/', authenticate, getLeaves);
router.post('/', authenticate, leaveApplicationValidator, applyLeave);
router.get('/balance/me', authenticate, getMyLeaveBalance);
router.get('/:id', authenticate, getLeaveById);
router.patch('/:id/approve', authenticate, authorize('hr_admin', 'manager'), leaveReviewValidator, approveLeave);
router.patch('/:id/reject', authenticate, authorize('hr_admin', 'manager'), leaveReviewValidator, rejectLeave);
router.patch('/:id/cancel', authenticate, cancelLeave);

export default router;

