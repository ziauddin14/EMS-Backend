export const TASK_STATUS = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  TESTING: 'testing',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled'
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const TASK_CATEGORY = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  BUG: 'bug',
  RESEARCH: 'research',
  DOCUMENTATION: 'documentation',
  MEETING: 'meeting',
  DESIGN: 'design',
  DEPLOYMENT: 'deployment',
  SUPPORT: 'support',
  OTHER: 'other'
};

export const RECURRING_TYPE = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

export const ACTIVITY_TYPE = {
  DEVELOPMENT: 'development',
  MEETING: 'meeting',
  RESEARCH: 'research',
  LEARNING: 'learning',
  REVIEW: 'review',
  TESTING: 'testing',
  SUPPORT: 'support'
};

export const COLLECTION_NAME = 'tasks';

export const TASK_MESSAGES = {
  NOT_FOUND: 'Task not found',
  ALREADY_EXISTS: 'Task with this number already exists',
  CREATED: 'Task created successfully',
  UPDATED: 'Task updated successfully',
  DELETED: 'Task deleted successfully',
  RESTORED: 'Task restored successfully',
  INVALID_STATUS: 'Invalid task status',
  INVALID_PRIORITY: 'Invalid task priority',
  INVALID_CATEGORY: 'Invalid task category',
  INVALID_DATES: 'Invalid date range',
  INVALID_COMPLETION: 'Invalid completion percentage',
  TASK_HAS_SUBTASKS: 'Cannot delete task with active subtasks',
  TASK_HAS_DEPENDENCIES: 'Cannot delete task with active dependencies'
};
