import express from 'express';
import {
  getHRDashboardStats,
  getManagerDashboardStats,
  getEmployeeDashboardStats
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/hr', authenticate, authorize('hr_admin'), getHRDashboardStats);
router.get('/manager', authenticate, authorize('manager', 'hr_admin'), getManagerDashboardStats);
router.get('/employee', authenticate, getEmployeeDashboardStats);

export default router;

