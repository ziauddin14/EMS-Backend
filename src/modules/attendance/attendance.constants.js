export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  LEAVE: 'leave',
  HOLIDAY: 'holiday',
  WEEKEND: 'weekend',
  REMOTE: 'remote',
  WORK_FROM_HOME: 'work_from_home',
  ON_DUTY: 'on_duty',
  OVERTIME: 'overtime',
  PENDING: 'pending'
};

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const SHIFT_TYPE = {
  MORNING: 'morning',
  EVENING: 'evening',
  NIGHT: 'night',
  FLEXIBLE: 'flexible',
  REMOTE: 'remote',
  GENERAL: 'general'
};

export const WEEK_DAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

export const COLLECTION_NAME = 'attendances';

export const ATTENDANCE_MESSAGES = {
  ATTENDANCE_CREATED: 'Attendance record created successfully',
  ATTENDANCE_UPDATED: 'Attendance record updated successfully',
  ATTENDANCE_DELETED: 'Attendance record deleted successfully',
  ATTENDANCE_RESTORED: 'Attendance record restored successfully',
  ATTENDANCE_NOT_FOUND: 'Attendance record not found',
  ATTENDANCE_ALREADY_EXISTS: 'Attendance record already exists for this date',
  INVALID_ATTENDANCE_DATE: 'Invalid attendance date',
  FUTURE_ATTENDANCE_NOT_ALLOWED: 'Future attendance records are not allowed',
  INVALID_CHECK_IN_TIME: 'Invalid check-in time',
  INVALID_CHECK_OUT_TIME: 'Invalid check-out time',
  CHECK_OUT_BEFORE_CHECK_IN: 'Check-out time cannot be before check-in time'
};
