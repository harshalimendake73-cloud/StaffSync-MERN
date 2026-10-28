import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus
} from '../controllers/employeeController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, authorizeManagerOrAdminForEmployee } from '../middleware/role.js';
import { createEmployeeValidator, updateEmployeeValidator } from '../validators/index.js';

const router = express.Router();

router.get('/', authenticate, getEmployees);
router.post('/', authenticate, authorize('hr_admin'), createEmployeeValidator, createEmployee);
router.get('/:id', authenticate, getEmployeeById);
router.patch('/:id', authenticate, authorizeManagerOrAdminForEmployee, updateEmployeeValidator, updateEmployee);
router.patch('/:id/status', authenticate, authorize('hr_admin'), updateEmployeeStatus);

export default router;

