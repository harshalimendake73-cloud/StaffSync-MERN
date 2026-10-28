/**
 * StaffSync Timezone & Attendance Calculations
 * Standard Work Hours: 09:00 - 18:00 (9 hours total, 8 work hours + 1 hr break)
 * Late threshold: After 09:30 is marked Late
 * Half-day threshold: Duration < 4.5 hours is Half Day
 * Standard Present threshold: Duration >= 7.5 hours is Present
 * Overnight Shift Policy:
 * Check-ins after 18:00 local time can be flagged as overnight shifts.
 * The session spans into the next day and attributes to the start date's workday cycle.
 */

export const getOrgDateString = (date = new Date()) => {
  // Configurable organization timezone via process.env.TIMEZONE or default UTC/local
  const tz = process.env.TIMEZONE || 'UTC';
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date); // outputs YYYY-MM-DD
  } catch (e) {
    return date.toISOString().split('T')[0];
  }
};

export const calculateAttendanceStatus = (checkInTime, checkOutTime = null, isOvernight = false) => {
  const checkIn = new Date(checkInTime);
  const hour = checkIn.getUTCHours();
  const minute = checkIn.getUTCMinutes();

  let initialStatus = 'present';
  // If check-in after 9:30 AM for standard shifts
  if (!isOvernight && (hour > 9 || (hour === 9 && minute > 30))) {
    initialStatus = 'late';
  }

  if (!checkOutTime) {
    return initialStatus;
  }

  const checkOut = new Date(checkOutTime);
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 4) {
    return 'half_day';
  }
  return initialStatus;
};

export const calculateDurationMinutes = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return 0;
  const start = new Date(checkInTime).getTime();
  const end = new Date(checkOutTime).getTime();
  const diffMs = Math.max(0, end - start);
  return Math.round(diffMs / (1000 * 60));
};

