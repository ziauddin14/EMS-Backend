export const SHIFT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

export const SHIFT_TYPE = {
  MORNING: 'morning',
  EVENING: 'evening',
  NIGHT: 'night',
  FLEXIBLE: 'flexible',
  REMOTE: 'remote',
  GENERAL: 'general'
};

export const COLLECTION_NAME = 'office_shifts';

export const SHIFT_MESSAGES = {
  SHIFT_CREATED: 'Office shift created successfully',
  SHIFT_UPDATED: 'Office shift updated successfully',
  SHIFT_DELETED: 'Office shift deleted successfully',
  SHIFT_RESTORED: 'Office shift restored successfully',
  SHIFT_NOT_FOUND: 'Office shift not found',
  SHIFT_ALREADY_EXISTS: 'Office shift with this code already exists',
  SHIFT_HAS_EMPLOYEES: 'Cannot delete shift with assigned employees',
  INVALID_TIME_FORMAT: 'Invalid time format',
  INVALID_WORKING_HOURS: 'Invalid working hours',
  START_AFTER_END: 'Start time cannot be after end time',
  CANNOT_DELETE_DEFAULT_SHIFT: 'Cannot delete default shift'
};
