import TrainingProgram from '../models/TrainingProgram.js';
import TrainingEnrollment from '../models/TrainingEnrollment.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getTrainings = async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const query = {};

    if (status) query.status = status;
    if (department) query.department = department;

    const trainings = await TrainingProgram.find(query)
      .populate('department', 'name code')
      .populate({
        path: 'createdBy',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      })
      .sort({ startDate: 1 });

    // Attach enrollment counts & user's enrollment status
    const trainingsWithEnrollment = await Promise.all(
      trainings.map(async (t) => {
        const enrolledCount = await TrainingEnrollment.countDocuments({
          training: t._id,
          status: { $ne: 'dropped' }
        });
        const myEnrollment = await TrainingEnrollment.findOne({
          training: t._id,
          employee: req.user._id
        });

        return {
          ...t.toObject(),
          enrolledCount,
          isEnrolled: !!myEnrollment,
          myEnrollmentStatus: myEnrollment ? myEnrollment.status : null,
          myProgressPercent: myEnrollment ? myEnrollment.progressPercent : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: trainingsWithEnrollment
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const training = await TrainingProgram.findById(id)
      .populate('department', 'name code')
      .populate({
        path: 'createdBy',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      });

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    const enrollments = await TrainingEnrollment.find({ training: id })
      .populate({
        path: 'employee',
        select: 'email employeeProfile',
        populate: {
          path: 'employeeProfile',
          select: 'firstName lastName employeeId designation avatar department',
          populate: { path: 'department', select: 'name code' }
        }
      })
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...training.toObject(),
        enrollments
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createTraining = async (req, res, next) => {
  try {
    const { title, description, instructor, startDate, endDate, durationHours, capacity, department, status } = req.body;

    const training = await TrainingProgram.create({
      title,
      description,
      instructor,
      startDate,
      endDate,
      durationHours,
      capacity,
      department: department || null,
      status: status || 'upcoming',
      createdBy: req.user._id
    });

    await logAuditEvent({
      action: 'TRAINING_CREATED',
      performedBy: req.user._id,
      targetEntity: 'TrainingProgram',
      entityId: training._id,
      details: { title, instructor, capacity },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: training
    });
  } catch (error) {
    next(error);
  }
};

export const updateTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const training = await TrainingProgram.findByIdAndUpdate(id, req.body, { new: true });

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    await logAuditEvent({
      action: 'TRAINING_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'TrainingProgram',
      entityId: training._id,
      details: req.body,
      req
    });

    res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      data: training
    });
  } catch (error) {
    next(error);
  }
};

export const enrollTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetUserId = req.body.employeeId || req.user._id;

    // Managers or HR can enroll others; employees can enroll themselves
    if (req.user.role === 'employee' && targetUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only enroll yourself' });
    }

    const training = await TrainingProgram.findById(id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    // Check capacity
    const activeCount = await TrainingEnrollment.countDocuments({
      training: id,
      status: { $ne: 'dropped' }
    });

    if (activeCount >= training.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Training program has reached maximum capacity'
      });
    }

    // Check duplicate enrollment
    const existing = await TrainingEnrollment.findOne({
      training: id,
      employee: targetUserId
    });

    if (existing) {
      if (existing.status === 'dropped') {
        existing.status = 'enrolled';
        existing.progressPercent = 0;
        await existing.save();
        return res.status(200).json({
          success: true,
          message: 'Re-enrolled in training program successfully',
          data: existing
        });
      }
      return res.status(409).json({
        success: false,
        message: 'Already enrolled in this training program'
      });
    }

    const enrollment = await TrainingEnrollment.create({
      training: id,
      employee: targetUserId,
      status: 'enrolled',
      progressPercent: 0
    });

    await logAuditEvent({
      action: 'TRAINING_ENROLLED',
      performedBy: req.user._id,
      targetEntity: 'TrainingEnrollment',
      entityId: enrollment._id,
      details: { trainingId: id, employeeId: targetUserId },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled in training program successfully',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { progressPercent, status, notes } = req.body;
    const targetUserId = req.body.employeeId || req.user._id;

    const enrollment = await TrainingEnrollment.findOne({
      training: id,
      employee: targetUserId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment record not found'
      });
    }

    if (progressPercent !== undefined) {
      enrollment.progressPercent = Math.min(100, Math.max(0, progressPercent));
      if (enrollment.progressPercent === 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      } else if (enrollment.progressPercent > 0 && enrollment.status === 'enrolled') {
        enrollment.status = 'in_progress';
      }
    }

    if (status) {
      enrollment.status = status;
      if (status === 'completed' && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
        enrollment.progressPercent = 100;
      }
    }

    if (notes !== undefined) {
      enrollment.notes = notes;
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Training progress updated successfully',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTrainings = async (req, res, next) => {
  try {
    const enrollments = await TrainingEnrollment.find({ employee: req.user._id })
      .populate({
        path: 'training',
        populate: { path: 'department', select: 'name code' }
      })
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

