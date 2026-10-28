import Holiday from '../models/Holiday.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getHolidays = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const holidays = await Holiday.find({ year: parseInt(year, 10) }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: holidays
    });
  } catch (error) {
    next(error);
  }
};

export const createHoliday = async (req, res, next) => {
  try {
    const { name, date, description, isOptional } = req.body;
    const holidayDate = new Date(date);
    const year = holidayDate.getFullYear();

    const holiday = await Holiday.create({
      name,
      date: holidayDate,
      description,
      isOptional: !!isOptional,
      year
    });

    await logAuditEvent({
      action: 'HOLIDAY_CREATED',
      performedBy: req.user._id,
      targetEntity: 'Holiday',
      entityId: holiday._id,
      details: { name, date },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: holiday
    });
  } catch (error) {
    next(error);
  }
};

export const updateHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findByIdAndUpdate(id, req.body, { new: true });

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Holiday updated successfully',
      data: holiday
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findByIdAndDelete(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

