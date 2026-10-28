import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import LeaveBalance from '../models/LeaveBalance.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getEmployees = async (req, res, next) => {
  try {
    const {
      search,
      department,
      role,
      employmentStatus,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // If manager, filter to own assigned team plus self, unless requesting public directory
    if (req.user.role === 'manager' && req.query.teamOnly === 'true') {
      const teamProfiles = await EmployeeProfile.find({ reportingManager: req.user._id }).select('user');
      const teamUserIds = teamProfiles.map((p) => p.user);
      teamUserIds.push(req.user._id);
      query.user = { $in: teamUserIds };
    }

    if (department) {
      query.department = department;
    }
    if (role) {
      query.role = role;
    }
    if (employmentStatus) {
      query.employmentStatus = employmentStatus;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await EmployeeProfile.countDocuments(query);
    const employees = await EmployeeProfile.find(query)
      .populate('department', 'name code')
      .populate({
        path: 'reportingManager',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      })
      .populate('user', 'isActive email role')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum);

    // Filter by user.isActive if specified
    let filteredEmployees = employees;
    if (isActive !== undefined) {
      const activeBool = isActive === 'true';
      filteredEmployees = employees.filter((emp) => emp.user && emp.user.isActive === activeBool);
    }

    res.status(200).json({
      success: true,
      data: filteredEmployees,
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

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by profile ID or User ID
    const employee = await EmployeeProfile.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { user: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { employeeId: id }]
    })
      .populate('department', 'name code')
      .populate({
        path: 'reportingManager',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      })
      .populate('user', 'isActive email role');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found'
      });
    }

    // Role-based privacy restriction: Regular employees can only view their own full profile
    if (
      req.user.role === 'employee' &&
      employee.user &&
      employee.user._id.toString() !== req.user._id.toString()
    ) {
      // Return public directory view only (redacting private contact & emergency details)
      return res.status(200).json({
        success: true,
        data: {
          _id: employee._id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          avatar: employee.avatar,
          joiningDate: employee.joiningDate,
          reportingManager: employee.reportingManager
        }
      });
    }

    // Managers can only view full details of their team or themselves
    if (
      req.user.role === 'manager' &&
      employee.user &&
      employee.user._id.toString() !== req.user._id.toString() &&
      (!employee.reportingManager || employee.reportingManager._id.toString() !== req.user._id.toString())
    ) {
      return res.status(200).json({
        success: true,
        data: {
          _id: employee._id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          avatar: employee.avatar,
          joiningDate: employee.joiningDate,
          reportingManager: employee.reportingManager
        }
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      password = 'StaffSync@2026',
      phone,
      department,
      designation,
      role = 'employee',
      joiningDate,
      employmentStatus = 'full_time',
      reportingManager,
      address,
      emergencyContact
    } = req.body;

    // Check existing email or employee ID
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const existingId = await EmployeeProfile.findOne({ employeeId });
    if (existingId) {
      return res.status(409).json({ success: false, message: 'Employee ID already exists' });
    }

    // Hash default password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      role,
      isActive: true
    });

    const profile = await EmployeeProfile.create({
      user: user._id,
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      role,
      joiningDate: joiningDate || new Date(),
      employmentStatus,
      reportingManager: reportingManager || null,
      address: address || {},
      emergencyContact: emergencyContact || {}
    });

    user.employeeProfile = profile._id;
    await user.save();

    // Create default leave balance for current year
    const currentYear = new Date().getFullYear();
    await LeaveBalance.create({
      employee: user._id,
      year: currentYear,
      casual: { total: 12, used: 0, pending: 0 },
      sick: { total: 10, used: 0, pending: 0 },
      earned: { total: 15, used: 0, pending: 0 },
      unpaid: { total: 30, used: 0, pending: 0 }
    });

    await logAuditEvent({
      action: 'EMPLOYEE_CREATED',
      performedBy: req.user._id,
      targetEntity: 'EmployeeProfile',
      entityId: profile._id,
      details: { employeeId, email, role, department },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const profile = await EmployeeProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Employees cannot modify role, employmentStatus, or reportingManager
    if (req.user.role === 'employee') {
      delete updates.role;
      delete updates.employmentStatus;
      delete updates.reportingManager;
      delete updates.department;
      delete updates.employeeId;
    }

    // If role changed by HR admin, synchronize with User document
    if (updates.role && req.user.role === 'hr_admin') {
      await User.findByIdAndUpdate(profile.user, { role: updates.role });
    }

    Object.assign(profile, updates);
    await profile.save();

    await logAuditEvent({
      action: 'EMPLOYEE_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'EmployeeProfile',
      entityId: profile._id,
      details: updates,
      req
    });

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, employmentStatus } = req.body;

    const profile = await EmployeeProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (isActive !== undefined) {
      await User.findByIdAndUpdate(profile.user, { isActive });
    }

    if (employmentStatus) {
      profile.employmentStatus = employmentStatus;
      await profile.save();
    }

    await logAuditEvent({
      action: 'EMPLOYEE_STATUS_CHANGED',
      performedBy: req.user._id,
      targetEntity: 'EmployeeProfile',
      entityId: profile._id,
      details: { isActive, employmentStatus },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Employee status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

