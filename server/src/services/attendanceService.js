import Attendance from '../models/Attendance.js';
import { getOrgDateString, calculateAttendanceStatus, calculateDurationMinutes } from '../utils/timezone.js';

export const processCheckIn = async (userId, options = {}) => {
  const todayStr = getOrgDateString();
  const now = new Date();

  // Check if session already exists today
  const existingToday = await Attendance.findOne({ employee: userId, date: todayStr });
  if (existingToday) {
    if (existingToday.checkOut) {
      throw new Error('You have already completed your attendance session for today.');
    }
    throw new Error('You have already checked in for today.');
  }

  // Check if an overnight shift is active from yesterday
  const activeSession = await Attendance.findOne({
    employee: userId,
    checkOut: null
  });
  if (activeSession) {
    throw new Error('You have an active ongoing attendance session. Please check out first.');
  }

  const isOvernight = options.isOvernight || now.getUTCHours() >= 18;
  const status = calculateAttendanceStatus(now, null, isOvernight);

  const attendance = await Attendance.create({
    employee: userId,
    date: todayStr,
    checkIn: now,
    status,
    shiftType: isOvernight ? 'overnight' : 'standard',
    isOvernight,
    notes: options.notes || ''
  });

  return attendance;
};

export const processCheckOut = async (userId, options = {}) => {
  const now = new Date();

  // Find the open attendance session
  const activeSession = await Attendance.findOne({
    employee: userId,
    checkOut: null
  }).sort({ checkIn: -1 });

  if (!activeSession) {
    throw new Error('No active check-in found to check out from.');
  }

  activeSession.checkOut = now;
  activeSession.durationMinutes = calculateDurationMinutes(activeSession.checkIn, now);
  activeSession.status = calculateAttendanceStatus(
    activeSession.checkIn,
    now,
    activeSession.isOvernight
  );

  if (options.notes) {
    activeSession.notes = activeSession.notes
      ? `${activeSession.notes} | ${options.notes}`
      : options.notes;
  }

  await activeSession.save();
  return activeSession;
};

export const getTodayAttendance = async (userId) => {
  const todayStr = getOrgDateString();
  return Attendance.findOne({ employee: userId, date: todayStr });
};

