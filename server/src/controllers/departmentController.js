import Department from '../models/Department.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate({
        path: 'head',
        select: 'email employeeProfile',
        populate: { path: 'employeeProfile', select: 'firstName lastName designation' }
      })
      .sort({ name: 1 });

    // Count employees per department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await EmployeeProfile.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          employeeCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: departmentsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, head } = req.body;

    const existingName = await Department.findOne({
      $or: [{ name: new RegExp(`^${name}$`, 'i') }, { code: code.toUpperCase() }]
    });

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: 'A department with this name or code already exists'
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      head: head || null
    });

    await logAuditEvent({
      action: 'DEPARTMENT_CREATED',
      performedBy: req.user._id,
      targetEntity: 'Department',
      entityId: department._id,
      details: { name, code },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description, head, isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (head !== undefined) department.head = head || null;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    await logAuditEvent({
      action: 'DEPARTMENT_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'Department',
      entityId: department._id,
      details: { name, code, isActive },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employeeCount = await EmployeeProfile.countDocuments({ department: id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${employeeCount} employee(s) are currently assigned to it. Reassign employees first.`
      });
    }

    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await logAuditEvent({
      action: 'DEPARTMENT_DELETED',
      performedBy: req.user._id,
      targetEntity: 'Department',
      entityId: id,
      details: { name: department.name },
      req
    });

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

