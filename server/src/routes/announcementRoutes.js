import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { announcementValidator } from '../validators/index.js';

const router = express.Router();

router.get('/', authenticate, getAnnouncements);
router.post('/', authenticate, authorize('hr_admin'), announcementValidator, createAnnouncement);
router.patch('/:id', authenticate, authorize('hr_admin'), updateAnnouncement);
router.delete('/:id', authenticate, authorize('hr_admin'), deleteAnnouncement);

export default router;

