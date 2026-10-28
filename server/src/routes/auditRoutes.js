import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/', authenticate, authorize('hr_admin'), getAuditLogs);

export default router;

