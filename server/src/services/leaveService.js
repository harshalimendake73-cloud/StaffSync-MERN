import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';

export const checkOverlappingLeave = async (employeeId, startDate, endDate, excludeId = null) => {
  const query = {
    employee: employeeId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await LeaveRequest.findOne(query);
  return !!existing;
};

export const getOrCreateLeaveBalance = async (employeeId, year = new Date().getFullYear()) => {
  let balance = await LeaveBalance.findOne({ employee: employeeId, year });
  if (!balance) {
    balance = await LeaveBalance.create({
      employee: employeeId,
      year,
      casual: { total: 12, used: 0, pending: 0 },
      sick: { total: 10, used: 0, pending: 0 },
      earned: { total: 15, used: 0, pending: 0 },
      unpaid: { total: 30, used: 0, pending: 0 }
    });
  }
  return balance;
};

export const deductLeaveBalance = async (employeeId, leaveType, days, year = new Date().getFullYear()) => {
  const balance = await getOrCreateLeaveBalance(employeeId, year);
  if (!balance[leaveType]) {
    throw new Error(`Invalid leave type: ${leaveType}`);
  }

  // Atomically update used and decrease pending
  balance[leaveType].used = (balance[leaveType].used || 0) + days;
  balance[leaveType].pending = Math.max(0, (balance[leaveType].pending || 0) - days);
  await balance.save();
  return balance;
};

export const revertLeaveBalance = async (employeeId, leaveType, days, year = new Date().getFullYear()) => {
  const balance = await getOrCreateLeaveBalance(employeeId, year);
  if (balance[leaveType]) {
    balance[leaveType].used = Math.max(0, (balance[leaveType].used || 0) - days);
    await balance.save();
  }
  return balance;
};

