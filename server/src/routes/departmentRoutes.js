import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { departmentValidator } from '../validators/index.js';

const router = express.Router();

router.get('/', authenticate, getDepartments);
router.post('/', authenticate, authorize('hr_admin'), departmentValidator, createDepartment);
router.patch('/:id', authenticate, authorize('hr_admin'), updateDepartment);
router.delete('/:id', authenticate, authorize('hr_admin'), deleteDepartment);

export default router;

