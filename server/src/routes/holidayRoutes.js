import express from 'express';
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
} from '../controllers/holidayController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/', authenticate, getHolidays);
router.post('/', authenticate, authorize('hr_admin'), createHoliday);
router.patch('/:id', authenticate, authorize('hr_admin'), updateHoliday);
router.delete('/:id', authenticate, authorize('hr_admin'), deleteHoliday);

export default router;

