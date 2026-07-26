export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived'
};

export const PROJECT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const COLLECTION_NAME = 'projects';

export const PROJECT_MESSAGES = {
  NOT_FOUND: 'Project not found',
  ALREADY_EXISTS: 'Project with this code already exists',
  CREATED: 'Project created successfully',
  UPDATED: 'Project updated successfully',
  DELETED: 'Project deleted successfully',
  RESTORED: 'Project restored successfully',
  INVALID_STATUS: 'Invalid project status',
  INVALID_PRIORITY: 'Invalid project priority',
  INVALID_DATES: 'Invalid date range',
  PROJECT_HAS_TASKS: 'Cannot delete project with active tasks'
};
