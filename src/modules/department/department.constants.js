export const COLLECTION_NAME = 'departments';

export const DEPARTMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
};

export const DEPARTMENT_MESSAGES = {
  DEPARTMENT_CREATED: 'Department created successfully',
  DEPARTMENT_UPDATED: 'Department updated successfully',
  DEPARTMENT_DELETED: 'Department deleted successfully',
  DEPARTMENT_RESTORED: 'Department restored successfully',
  DEPARTMENT_NOT_FOUND: 'Department not found',
  DEPARTMENT_ALREADY_EXISTS: 'Department already exists',
  DEPARTMENT_CODE_EXISTS: 'Department code already exists',
  INVALID_PARENT_DEPARTMENT: 'Invalid parent department',
  CIRCULAR_HIERARCHY: 'Circular hierarchy detected',
  CANNOT_DELETE_WITH_CHILDREN: 'Cannot delete department with child departments',
  CANNOT_DELETE_WITH_EMPLOYEES: 'Cannot delete department with assigned employees',
  INVALID_DEPARTMENT_HEAD: 'Invalid department head'
};

export const DEPARTMENT_CODE_PREFIX = 'DEP';
export const DEPARTMENT_CODE_PADDING = 3;
