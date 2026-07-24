export const COLLECTION_NAME = 'employees';

export const EMPLOYMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  PROBATION: 'probation',
  ON_LEAVE: 'on_leave',
  RESIGNED: 'resigned',
  TERMINATED: 'terminated',
  SUSPENDED: 'suspended'
};

export const EMPLOYMENT_TYPE = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  INTERN: 'intern',
  CONTRACT: 'contract',
  FREELANCER: 'freelancer'
};

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say'
};

export const MARITAL_STATUS = {
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed'
};

export const BLOOD_GROUP = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
  UNKNOWN: 'unknown'
};

export const EMPLOYEE_MESSAGES = {
  EMPLOYEE_CREATED: 'Employee created successfully',
  EMPLOYEE_UPDATED: 'Employee updated successfully',
  EMPLOYEE_DELETED: 'Employee deleted successfully',
  EMPLOYEE_RESTORED: 'Employee restored successfully',
  EMPLOYEE_NOT_FOUND: 'Employee not found',
  EMPLOYEE_ALREADY_EXISTS: 'Employee already exists',
  EMPLOYEE_NUMBER_EXISTS: 'Employee number already exists',
  USER_ALREADY_LINKED: 'User is already linked to an employee',
  INVALID_EMPLOYMENT_STATUS: 'Invalid employment status',
  INVALID_EMPLOYMENT_TYPE: 'Invalid employment type',
  INVALID_GENDER: 'Invalid gender',
  INVALID_MARITAL_STATUS: 'Invalid marital status',
  INVALID_BLOOD_GROUP: 'Invalid blood group',
  CANNOT_DELETE_ACTIVE_EMPLOYEE: 'Cannot delete active employee',
  CANNOT_DELETE_SELF: 'Cannot delete your own employee record'
};

export const EMPLOYEE_NUMBER_PREFIX = 'EMP';
export const EMPLOYEE_NUMBER_PADDING = 4;
