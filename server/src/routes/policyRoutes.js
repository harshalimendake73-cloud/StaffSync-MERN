import express from 'express';
import {
  getLeavePolicies,
  createOrUpdateLeavePolicy
} from '../controllers/policyController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/', authenticate, getLeavePolicies);
router.post('/', authenticate, authorize('hr_admin'), createOrUpdateLeavePolicy);

export default router;

