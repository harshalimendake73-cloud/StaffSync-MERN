import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import { checkOverlappingLeave, getOrCreateLeaveBalance, deductLeaveBalance } from '../services/leaveService.js';
import { createNotification } from '../services/notificationService.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    // Role-based visibility
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      if (req.query.scope === 'me') {
        query.employee = req.user._id;
      } else {
        // Find assigned team members
        const teamProfiles = await EmployeeProfile.find({ reportingManager: req.user._id }).select('user');
        const teamUserIds = teamProfiles.map((p) => p.user);
        teamUserIds.push(req.user._id); // include manager's own
        query.employee = { $in: teamUserIds };
      }
    }
    // HR Admin can view all or filter by employee

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await LeaveRequest.countDocuments(query);
    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'employee',
        select: 'email employeeProfile',
        populate: {
          path: 'employeeProfile',
          select: 'firstName lastName employeeId designation avatar department',
          populate: { path: 'department', select: 'name code' }
        }
      })
      .populate({
        path: 'reviewedBy',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaveById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await LeaveRequest.findById(id)
      .populate({
        path: 'employee',
        select: 'email employeeProfile',
        populate: {
          path: 'employeeProfile',
          select: 'firstName lastName employeeId designation avatar department reportingManager',
          populate: { path: 'department', select: 'name code' }
        }
      })
      .populate({
        path: 'reviewedBy',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Role check
    if (req.user.role === 'employee' && leave.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user._id;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    // Calculate total days inclusive
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check overlapping leave
    const isOverlapping = await checkOverlappingLeave(employeeId, start, end);
    if (isOverlapping) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending or approved leave request during these dates'
      });
    }

    // Check balance
    const currentYear = start.getFullYear();
    const balance = await getOrCreateLeaveBalance(employeeId, currentYear);
    const available = (balance[leaveType]?.total || 0) - (balance[leaveType]?.used || 0) - (balance[leaveType]?.pending || 0);

    if (leaveType !== 'unpaid' && available < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${available} days, Requested: ${totalDays} days`
      });
    }

    const leaveRequest = await LeaveRequest.create({
      employee: employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: 'pending'
    });

    // Mark pending in balance
    if (balance[leaveType]) {
      balance[leaveType].pending = (balance[leaveType].pending || 0) + totalDays;
      await balance.save();
    }

    // Notify reporting manager if present
    const profile = await EmployeeProfile.findOne({ user: employeeId });
    if (profile && profile.reportingManager) {
      await createNotification({
        recipient: profile.reportingManager,
        sender: employeeId,
        title: 'New Leave Application',
        message: `${profile.firstName} ${profile.lastName} has applied for ${totalDays} day(s) of ${leaveType} leave.`,
        link: '/leaves/approvals',
        type: 'leave'
      });
    }

    await logAuditEvent({
      action: 'LEAVE_APPLIED',
      performedBy: employeeId,
      targetEntity: 'LeaveRequest',
      entityId: leaveRequest._id,
      details: { leaveType, totalDays, startDate, endDate },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    next(error);
  }
};

export const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment = '' } = req.body;

    const leave = await LeaveRequest.findById(id).populate('employee');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve leave request that is already ${leave.status}`
      });
    }

    // Role check: Only HR Admin or the employee's reporting manager can approve
    if (req.user.role === 'manager') {
      const profile = await EmployeeProfile.findOne({ user: leave.employee._id });
      if (!profile || !profile.reportingManager || profile.reportingManager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are only authorized to approve leave for your assigned team members'
        });
      }
    }

    leave.status = 'approved';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewComment = comment;
    await leave.save();

    // Deduct balance
    const year = new Date(leave.startDate).getFullYear();
    await deductLeaveBalance(leave.employee._id, leave.leaveType, leave.totalDays, year);

    // Notify employee
    await createNotification({
      recipient: leave.employee._id,
      sender: req.user._id,
      title: 'Leave Request Approved',
      message: `Your ${leave.leaveType} leave request for ${leave.totalDays} day(s) has been approved.`,
      link: '/leaves/apply',
      type: 'leave'
    });

    await logAuditEvent({
      action: 'LEAVE_APPROVED',
      performedBy: req.user._id,
      targetEntity: 'LeaveRequest',
      entityId: leave._id,
      details: { employee: leave.employee._id, leaveType: leave.leaveType, days: leave.totalDays, comment },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Leave request approved successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

export const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment = '' } = req.body;

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject leave request that is already ${leave.status}`
      });
    }

    if (req.user.role === 'manager') {
      const profile = await EmployeeProfile.findOne({ user: leave.employee });
      if (!profile || !profile.reportingManager || profile.reportingManager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are only authorized to review leave for your assigned team members'
        });
      }
    }

    leave.status = 'rejected';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewComment = comment;
    await leave.save();

    // Revert pending count in balance
    const year = new Date(leave.startDate).getFullYear();
    const balance = await getOrCreateLeaveBalance(leave.employee, year);
    if (balance[leave.leaveType]) {
      balance[leave.leaveType].pending = Math.max(0, (balance[leave.leaveType].pending || 0) - leave.totalDays);
      await balance.save();
    }

    // Notify employee
    await createNotification({
      recipient: leave.employee,
      sender: req.user._id,
      title: 'Leave Request Rejected',
      message: `Your ${leave.leaveType} leave request was rejected. Reason: ${comment || 'No comment provided'}`,
      link: '/leaves/apply',
      type: 'leave'
    });

    await logAuditEvent({
      action: 'LEAVE_REJECTED',
      performedBy: req.user._id,
      targetEntity: 'LeaveRequest',
      entityId: leave._id,
      details: { comment },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Leave request rejected',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

export const cancelLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own leave requests' });
    }

    if (leave.status === 'cancelled' || leave.status === 'rejected') {
      return res.status(400).json({ success: false, message: `Leave is already ${leave.status}` });
    }

    const previousStatus = leave.status;
    leave.status = 'cancelled';
    await leave.save();

    const year = new Date(leave.startDate).getFullYear();
    const balance = await getOrCreateLeaveBalance(leave.employee, year);

    if (previousStatus === 'pending' && balance[leave.leaveType]) {
      balance[leave.leaveType].pending = Math.max(0, (balance[leave.leaveType].pending || 0) - leave.totalDays);
      await balance.save();
    } else if (previousStatus === 'approved' && balance[leave.leaveType]) {
      balance[leave.leaveType].used = Math.max(0, (balance[leave.leaveType].used || 0) - leave.totalDays);
      await balance.save();
    }

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaveBalance = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const balance = await getOrCreateLeaveBalance(req.user._id, year);

    res.status(200).json({
      success: true,
      data: balance
    });
  } catch (error) {
    next(error);
  }
};

