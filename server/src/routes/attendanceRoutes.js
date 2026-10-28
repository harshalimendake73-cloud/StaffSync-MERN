import express from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAttendance,
  getAttendanceSummary,
  exportAttendanceCSV,
  correctAttendance
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.post('/check-in', authenticate, checkIn);
router.patch('/check-out', authenticate, checkOut);
router.get('/me', authenticate, getMyAttendance);
router.get('/', authenticate, getAttendance);
router.get('/reports/summary', authenticate, getAttendanceSummary);
router.get('/export', authenticate, exportAttendanceCSV);
router.patch('/:id/correct', authenticate, authorize('hr_admin'), correctAttendance);

export default router;

