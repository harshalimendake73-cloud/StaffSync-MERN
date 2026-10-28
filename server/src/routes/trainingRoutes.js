import express from 'express';
import {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  enrollTraining,
  updateProgress,
  getMyTrainings
} from '../controllers/trainingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { trainingProgramValidator } from '../validators/index.js';

const router = express.Router();

router.get('/', authenticate, getTrainings);
router.get('/my/enrollments', authenticate, getMyTrainings);
router.get('/:id', authenticate, getTrainingById);
router.post('/', authenticate, authorize('hr_admin', 'manager'), trainingProgramValidator, createTraining);
router.patch('/:id', authenticate, authorize('hr_admin', 'manager'), updateTraining);
router.post('/:id/enroll', authenticate, enrollTraining);
router.patch('/:id/progress', authenticate, updateProgress);

export default router;

