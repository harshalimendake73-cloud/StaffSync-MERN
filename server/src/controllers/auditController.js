import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetEntity, page = 1, limit = 20 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (targetEntity) query.targetEntity = targetEntity;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate({
        path: 'performedBy',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: logs,
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

