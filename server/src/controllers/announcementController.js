import Announcement from '../models/Announcement.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const { status, priority, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'hr_admin') {
      if (status) query.status = status;
    } else {
      query.status = 'published';

      const profile = await EmployeeProfile.findOne({ user: req.user._id });
      const deptId = profile ? profile.department : null;

      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'role', targetRole: req.user.role },
        ...(deptId ? [{ targetAudience: 'department', targetDepartment: deptId }] : [])
      ];
    }

    if (priority) query.priority = priority;

    const announcements = await Announcement.find(query)
      .populate({
        path: 'author',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      })
      .populate('targetDepartment', 'name code')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: announcements
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetAudience, targetDepartment, targetRole, priority, status } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      targetAudience: targetAudience || 'all',
      targetDepartment: targetDepartment || null,
      targetRole: targetRole || null,
      priority: priority || 'normal',
      status: status || 'published',
      publishedAt: status === 'draft' ? null : new Date(),
      author: req.user._id
    });

    await logAuditEvent({
      action: 'ANNOUNCEMENT_CREATED',
      performedBy: req.user._id,
      targetEntity: 'Announcement',
      entityId: announcement._id,
      details: { title, priority, targetAudience },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await logAuditEvent({
      action: 'ANNOUNCEMENT_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'Announcement',
      entityId: announcement._id,
      details: req.body,
      req
    });

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await logAuditEvent({
      action: 'ANNOUNCEMENT_DELETED',
      performedBy: req.user._id,
      targetEntity: 'Announcement',
      entityId: id,
      details: { title: announcement.title },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

