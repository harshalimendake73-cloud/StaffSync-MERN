import { Parser } from 'json2csv';
import Attendance from '../models/Attendance.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import { processCheckIn, processCheckOut, getTodayAttendance } from '../services/attendanceService.js';
import { getOrgDateString, calculateDurationMinutes } from '../utils/timezone.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const checkIn = async (req, res, next) => {
  try {
    const { isOvernight, notes } = req.body;
    const attendance = await processCheckIn(req.user._id, { isOvernight, notes });

    await logAuditEvent({
      action: 'ATTENDANCE_CHECK_IN',
      performedBy: req.user._id,
      targetEntity: 'Attendance',
      entityId: attendance._id,
      details: { date: attendance.date, checkIn: attendance.checkIn, status: attendance.status },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const attendance = await processCheckOut(req.user._id, { notes });

    await logAuditEvent({
      action: 'ATTENDANCE_CHECK_OUT',
      performedBy: req.user._id,
      targetEntity: 'Attendance',
      entityId: attendance._id,
      details: {
        date: attendance.date,
        checkOut: attendance.checkOut,
        durationMinutes: attendance.durationMinutes,
        status: attendance.status
      },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const today = await getTodayAttendance(req.user._id);

    // Recent 30 days
    const history = await Attendance.find({ employee: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: {
        today,
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, date, status, department, page = 1, limit = 15 } = req.query;
    const query = {};

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    // Role filtering
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamProfiles = await EmployeeProfile.find({ reportingManager: req.user._id }).select('user');
      const teamUserIds = teamProfiles.map((p) => p.user);
      teamUserIds.push(req.user._id);
      query.employee = { $in: teamUserIds };
    }

    // Department filtering
    if (department) {
      const deptProfiles = await EmployeeProfile.find({ department }).select('user');
      const deptUserIds = deptProfiles.map((p) => p.user);
      if (query.employee && query.employee.$in) {
        query.employee.$in = query.employee.$in.filter((id) =>
          deptUserIds.some((deptId) => deptId.toString() === id.toString())
        );
      } else {
        query.employee = { $in: deptUserIds };
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
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
        path: 'correctedBy',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      })
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: records,
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

export const getAttendanceSummary = async (req, res, next) => {
  try {
    const { month, year = new Date().getFullYear().toString() } = req.query;
    const prefix = month ? `${year}-${month.padStart(2, '0')}` : year;

    const query = {
      date: { $regex: `^${prefix}` }
    };

    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamProfiles = await EmployeeProfile.find({ reportingManager: req.user._id }).select('user');
      const teamUserIds = teamProfiles.map((p) => p.user);
      teamUserIds.push(req.user._id);
      query.employee = { $in: teamUserIds };
    }

    const records = await Attendance.find(query);

    const summary = {
      totalRecords: records.length,
      present: records.filter((r) => r.status === 'present').length,
      late: records.filter((r) => r.status === 'late').length,
      halfDay: records.filter((r) => r.status === 'half_day').length,
      absent: records.filter((r) => r.status === 'absent').length,
      onLeave: records.filter((r) => r.status === 'on_leave').length,
      totalHoursWorked: Math.round(
        records.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / 60
      )
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

export const exportAttendanceCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, date } = req.query;
    const query = {};

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamProfiles = await EmployeeProfile.find({ reportingManager: req.user._id }).select('user');
      const teamUserIds = teamProfiles.map((p) => p.user);
      teamUserIds.push(req.user._id);
      query.employee = { $in: teamUserIds };
    }

    const records = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'email employeeProfile',
        populate: {
          path: 'employeeProfile',
          select: 'firstName lastName employeeId designation department',
          populate: { path: 'department', select: 'name' }
        }
      })
      .sort({ date: -1 });

    const csvData = records.map((r) => {
      const p = r.employee?.employeeProfile;
      return {
        'Employee ID': p?.employeeId || 'N/A',
        'Employee Name': p ? `${p.firstName} ${p.lastName}` : 'N/A',
        Email: r.employee?.email || 'N/A',
        Department: p?.department?.name || 'N/A',
        Date: r.date,
        'Check-In': r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '',
        'Check-Out': r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '',
        'Duration (Minutes)': r.durationMinutes || 0,
        Status: r.status,
        Shift: r.shiftType,
        Notes: r.notes || ''
      };
    });

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance-report-${getOrgDateString()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const correctAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, status, correctionReason } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const previousData = {
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status,
      durationMinutes: attendance.durationMinutes
    };

    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut) attendance.checkOut = new Date(checkOut);
    if (status) attendance.status = status;

    if (attendance.checkIn && attendance.checkOut) {
      attendance.durationMinutes = calculateDurationMinutes(attendance.checkIn, attendance.checkOut);
    }

    attendance.correctedBy = req.user._id;
    attendance.correctionReason = correctionReason || 'Administrative adjustment';
    await attendance.save();

    await logAuditEvent({
      action: 'ATTENDANCE_CORRECTED',
      performedBy: req.user._id,
      targetEntity: 'Attendance',
      entityId: attendance._id,
      details: { previousData, updatedData: attendance, reason: correctionReason },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Attendance record corrected successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

