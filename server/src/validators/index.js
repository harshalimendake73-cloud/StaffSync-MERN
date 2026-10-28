import { body, param, query, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

export const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  validateRequest
];

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  validateRequest
];

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  validateRequest
];

export const createEmployeeValidator = [
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('role').isIn(['hr_admin', 'manager', 'employee']).withMessage('Valid role is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('department').notEmpty().withMessage('Department ID is required'),
  validateRequest
];

export const updateEmployeeValidator = [
  param('id').isMongoId().withMessage('Invalid employee ID'),
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim(),
  validateRequest
];

export const departmentValidator = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required'),
  validateRequest
];

export const leaveApplicationValidator = [
  body('leaveType')
    .isIn(['casual', 'sick', 'earned', 'unpaid'])
    .withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('reason').trim().isLength({ min: 5 }).withMessage('Reason must be at least 5 characters'),
  validateRequest
];

export const leaveReviewValidator = [
  param('id').isMongoId().withMessage('Invalid leave request ID'),
  body('comment').optional().trim(),
  validateRequest
];

export const announcementValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('targetAudience').optional().isIn(['all', 'department', 'role']),
  validateRequest
];

export const trainingProgramValidator = [
  body('title').trim().notEmpty().withMessage('Training title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('instructor').trim().notEmpty().withMessage('Instructor name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('durationHours').isInt({ min: 1 }).withMessage('Duration in hours must be at least 1'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  validateRequest
];

