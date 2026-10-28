import LeavePolicy from '../models/LeavePolicy.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getLeavePolicies = async (req, res, next) => {
  try {
    const policies = await LeavePolicy.find().sort({ leaveType: 1 });
    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateLeavePolicy = async (req, res, next) => {
  try {
    const { leaveType, title, annualQuota, maxConsecutiveDays, carryForwardMax, requiresProofDays, description, isActive } = req.body;

    const policy = await LeavePolicy.findOneAndUpdate(
      { leaveType },
      {
        leaveType,
        title: title || `${leaveType.toUpperCase()} Leave`,
        annualQuota,
        maxConsecutiveDays,
        carryForwardMax,
        requiresProofDays,
        description,
        isActive: isActive !== undefined ? isActive : true
      },
      { upsert: true, new: true, runValidators: true }
    );

    await logAuditEvent({
      action: 'LEAVE_POLICY_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'LeavePolicy',
      entityId: policy._id,
      details: { leaveType, annualQuota },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Leave policy saved successfully',
      data: policy
    });
  } catch (error) {
    next(error);
  }
};

