import EmployeeProfile from '../models/EmployeeProfile.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient privileges for this resource'
      });
    }

    next();
  };
};

// Check if current user is either HR Admin or the reporting manager of the employee
export const authorizeManagerOrAdminForEmployee = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (req.user.role === 'hr_admin') {
      return next();
    }

    const targetUserId = req.params.employeeId || req.params.id || req.body.employeeId;
    if (!targetUserId) {
      return next();
    }

    // Check if the current user is the target user
    if (req.user._id.toString() === targetUserId.toString()) {
      return next();
    }

    if (req.user.role === 'manager') {
      const employeeProfile = await EmployeeProfile.findOne({
        $or: [{ user: targetUserId }, { _id: targetUserId }]
      });

      if (
        employeeProfile &&
        employeeProfile.reportingManager &&
        employeeProfile.reportingManager.toString() === req.user._id.toString()
      ) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: You are not authorized to view or modify this employee record'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

