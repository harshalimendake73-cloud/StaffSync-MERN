import User from '../models/User.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Announcement from '../models/Announcement.js';
import TrainingProgram from '../models/TrainingProgram.js';
import TrainingEnrollment from '../models/TrainingEnrollment.js';
import Holiday from '../models/Holiday.js';
import { getOrgDateString, calculateDurationMinutes } from '../utils/timezone.js';
import { getOrCreateLeaveBalance } from '../services/leaveService.js';

export const getHRDashboardStats = async (req, res, next) => {
  try {
    const todayStr = getOrgDateString();
    const currentYear = new Date().getFullYear();

    // 1. Employee stats
    const totalActiveEmployees = await User.countDocuments({ isActive: true, role: { $in: ['employee', 'manager', 'hr_admin'] } });

    // 2. Attendance stats today
    const presentTodayCount = await Attendance.countDocuments({
      date: todayStr,
      status: { $in: ['present', 'late', 'half_day'] }
    });
    const onLeaveTodayCount = await Attendance.countDocuments({
      date: todayStr,
      status: 'on_leave'
    });
    const absentTodayCount = Math.max(0, totalActiveEmployees - presentTodayCount - onLeaveTodayCount);
    const attendancePercentage = totalActiveEmployees > 0
      ? Math.round((presentTodayCount / totalActiveEmployees) * 100)
      : 0;

    // 3. Leave request stats
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' });
    const approvedLeaves = await LeaveRequest.countDocuments({ status: 'approved' });
    const rejectedLeaves = await LeaveRequest.countDocuments({ status: 'rejected' });

    // 4. Department distribution
    const departments = await Department.find({ isActive: true });
    const departmentDistribution = await Promise.all(
      departments.map(async (dept) => {
        const count = await EmployeeProfile.countDocuments({ department: dept._id });
        return {
          id: dept._id,
          name: dept.name,
          code: dept.code,
          count
        };
      })
    );

    // 5. Attendance weekly trends (last 7 days)
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getOrgDateString(d);
      const count = await Attendance.countDocuments({
        date: dStr,
        status: { $in: ['present', 'late', 'half_day'] }
      });
      trends.push({
        date: dStr,
        present: count,
        total: totalActiveEmployees
      });
    }

    // 6. Recent leave applications
    const recentLeaves = await LeaveRequest.find()
      .populate({
        path: 'employee',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName employeeId avatar department', populate: { path: 'department', select: 'name' } }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Upcoming holidays
    const upcomingHolidays = await Holiday.find({
      date: { $gte: new Date(todayStr) }
    })
      .sort({ date: 1 })
      .limit(4);

    // 8. Recent announcements
    const recentAnnouncements = await Announcement.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(4);

    // 9. Upcoming training programs
    const upcomingTrainings = await TrainingProgram.find({
      startDate: { $gte: new Date() }
    })
      .sort({ startDate: 1 })
      .limit(4);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalActiveEmployees,
          presentToday: presentTodayCount,
          absentToday: absentTodayCount,
          onLeaveToday: onLeaveTodayCount,
          attendancePercentage,
          pendingLeaves,
          approvedLeaves,
          rejectedLeaves
        },
        departmentDistribution,
        attendanceTrends: trends,
        recentLeaves,
        upcomingHolidays,
        recentAnnouncements,
        upcomingTrainings
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerDashboardStats = async (req, res, next) => {
  try {
    const todayStr = getOrgDateString();

    // Assigned team members
    const teamProfiles = await EmployeeProfile.find({ reportingManager: req.user._id })
      .populate('department', 'name code')
      .populate('user', 'isActive email');

    const teamUserIds = teamProfiles.map((p) => p.user?._id).filter(Boolean);
    const teamSize = teamProfiles.length;

    // Team attendance today
    const teamAttendanceToday = await Attendance.find({
      employee: { $in: teamUserIds },
      date: todayStr
    }).populate({
      path: 'employee',
      populate: { path: 'employeeProfile', select: 'firstName lastName avatar' }
    });

    const presentTeamCount = teamAttendanceToday.filter((a) =>
      ['present', 'late', 'half_day'].includes(a.status)
    ).length;

    // Pending team leave requests
    const pendingTeamLeaves = await LeaveRequest.find({
      employee: { $in: teamUserIds },
      status: 'pending'
    })
      .populate({
        path: 'employee',
        populate: { path: 'employeeProfile', select: 'firstName lastName employeeId avatar designation' }
      })
      .sort({ createdAt: -1 });

    // Recent team approval activity
    const recentApprovals = await LeaveRequest.find({
      employee: { $in: teamUserIds },
      status: { $in: ['approved', 'rejected'] }
    })
      .populate({
        path: 'employee',
        populate: { path: 'employeeProfile', select: 'firstName lastName avatar' }
      })
      .sort({ reviewedAt: -1 })
      .limit(5);

    // Upcoming trainings created or assigned
    const upcomingTrainings = await TrainingProgram.find({
      $or: [{ createdBy: req.user._id }, { department: { $in: teamProfiles.map((t) => t.department?._id).filter(Boolean) } }]
    })
      .sort({ startDate: 1 })
      .limit(4);

    // Training completion progress for team
    const teamEnrollments = await TrainingEnrollment.find({
      employee: { $in: teamUserIds }
    }).populate('training', 'title');

    const completedTrainingsCount = teamEnrollments.filter((e) => e.status === 'completed').length;
    const inProgressTrainingsCount = teamEnrollments.filter((e) => e.status === 'in_progress').length;

    res.status(200).json({
      success: true,
      data: {
        teamSize,
        teamAttendanceSummary: {
          presentToday: presentTeamCount,
          absentToday: Math.max(0, teamSize - presentTeamCount),
          attendancePercentage: teamSize > 0 ? Math.round((presentTeamCount / teamSize) * 100) : 0,
          todayRecords: teamAttendanceToday
        },
        pendingTeamLeavesCount: pendingTeamLeaves.length,
        pendingTeamLeaves,
        recentApprovals,
        upcomingTrainings,
        trainingStats: {
          totalEnrollments: teamEnrollments.length,
          completed: completedTrainingsCount,
          inProgress: inProgressTrainingsCount
        },
        teamMembers: teamProfiles
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDashboardStats = async (req, res, next) => {
  try {
    const todayStr = getOrgDateString();
    const currentYear = new Date().getFullYear();

    // 1. Today's attendance
    const todayAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: todayStr
    });

    let currentDuration = 0;
    if (todayAttendance) {
      if (todayAttendance.checkOut) {
        currentDuration = todayAttendance.durationMinutes;
      } else if (todayAttendance.checkIn) {
        currentDuration = calculateDurationMinutes(todayAttendance.checkIn, new Date());
      }
    }

    // 2. Leave balances
    const leaveBalance = await getOrCreateLeaveBalance(req.user._id, currentYear);

    // 3. Pending & recent leave applications
    const recentLeaves = await LeaveRequest.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Recent attendance history (last 10 days)
    const recentAttendance = await Attendance.find({ employee: req.user._id })
      .sort({ date: -1 })
      .limit(10);

    // 5. Upcoming holidays
    const upcomingHolidays = await Holiday.find({
      date: { $gte: new Date(todayStr) }
    })
      .sort({ date: 1 })
      .limit(4);

    // 6. Announcements matching employee
    const profile = await EmployeeProfile.findOne({ user: req.user._id });
    const deptId = profile ? profile.department : null;

    const announcements = await Announcement.find({
      status: 'published',
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'role', targetRole: req.user.role },
        ...(deptId ? [{ targetAudience: 'department', targetDepartment: deptId }] : [])
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(4);

    // 7. Enrolled trainings
    const enrollments = await TrainingEnrollment.find({ employee: req.user._id })
      .populate('training')
      .sort({ enrolledAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      data: {
        todayAttendance: {
          session: todayAttendance,
          isCheckedIn: !!todayAttendance && !todayAttendance.checkOut,
          isCheckedOut: !!todayAttendance && !!todayAttendance.checkOut,
          currentDurationMinutes: currentDuration
        },
        leaveBalance,
        recentLeaves,
        recentAttendance,
        upcomingHolidays,
        announcements,
        enrolledTrainings: enrollments
      }
    });
  } catch (error) {
    next(error);
  }
};

