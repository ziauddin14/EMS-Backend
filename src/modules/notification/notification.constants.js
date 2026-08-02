// Notification Module Constants

// Notification Types
export const NOTIFICATION_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ALERT: 'alert',
  REMINDER: 'reminder',
  ANNOUNCEMENT: 'announcement',
  SYSTEM: 'system'
};

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
};

// Notification Category
export const NOTIFICATION_CATEGORY = {
  AUTHENTICATION: 'authentication',
  EMPLOYEE: 'employee',
  ATTENDANCE: 'attendance',
  TASK: 'task',
  PROJECT: 'project',
  MEETING: 'meeting',
  KPI: 'kpi',
  PERFORMANCE: 'performance',
  EXECUTIVE: 'executive',
  REPORT: 'report',
  SYSTEM: 'system',
  SECURITY: 'security',
  COMPLIANCE: 'compliance',
  HR: 'hr',
  FINANCE: 'finance',
  IT: 'it',
  OPERATIONS: 'operations'
};

// Notification Channels
export const NOTIFICATION_CHANNEL = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  WHATSAPP: 'whatsapp',
  SLACK: 'slack',
  TEAMS: 'teams',
  DISCORD: 'discord',
  WEBHOOK: 'webhook'
};

// Notification Status
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

// Read Status
export const READ_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived'
};

// Notification Reference Types
export const REFERENCE_TYPE = {
  EMPLOYEE: 'employee',
  ATTENDANCE: 'attendance',
  TASK: 'task',
  PROJECT: 'project',
  MEETING: 'meeting',
  KPI: 'kpi',
  REPORT: 'report',
  DEPARTMENT: 'department',
  BRANCH: 'branch',
  ORGANIZATION: 'organization',
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  SETTING: 'setting'
};

// Digest Frequency
export const DIGEST_FREQUENCY = {
  IMMEDIATE: 'immediate',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  NEVER: 'never'
};

// Quiet Hours
export const QUIET_HOURS = {
  START: '22:00',
  END: '08:00',
  TIMEZONE: 'UTC'
};

// Mute Duration
export const MUTE_DURATION = {
  ONE_HOUR: '1h',
  SIX_HOURS: '6h',
  TWELVE_HOURS: '12h',
  ONE_DAY: '1d',
  ONE_WEEK: '1w',
  PERMANENT: 'permanent'
};

// Notification TTL (Time To Live)
export const NOTIFICATION_TTL = {
  ONE_DAY: 86400000,
  ONE_WEEK: 604800000,
  ONE_MONTH: 2592000000,
  PERMANENT: null
};

// Audit Action Types
export const AUDIT_ACTION = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  IMPORT: 'import',
  APPROVE: 'approve',
  REJECT: 'reject',
  ARCHIVE: 'archive',
  RESTORE: 'restore',
  BULK_CREATE: 'bulk_create',
  BULK_UPDATE: 'bulk_update',
  BULK_DELETE: 'bulk_delete'
};

// Audit Modules
export const AUDIT_MODULE = {
  AUTHENTICATION: 'authentication',
  EMPLOYEE: 'employee',
  ATTENDANCE: 'attendance',
  TASK: 'task',
  PROJECT: 'project',
  MEETING: 'meeting',
  KPI: 'kpi',
  PERFORMANCE: 'performance',
  EXECUTIVE: 'executive',
  NOTIFICATION: 'notification',
  SETTINGS: 'settings',
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  DEPARTMENT: 'department',
  BRANCH: 'branch',
  ORGANIZATION: 'organization'
};

// Activity Types
export const ACTIVITY_TYPE = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  ATTENDANCE_CHECK_IN: 'attendance_check_in',
  ATTENDANCE_CHECK_OUT: 'attendance_check_out',
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  PROJECT_CREATED: 'project_created',
  PROJECT_COMPLETED: 'project_completed',
  MEETING_SCHEDULED: 'meeting_scheduled',
  MEETING_COMPLETED: 'meeting_completed',
  KPI_SUBMITTED: 'kpi_submitted',
  KPI_APPROVED: 'kpi_approved',
  REPORT_GENERATED: 'report_generated',
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed',
  NOTIFICATION_SENT: 'notification_sent',
  SYSTEM_EVENT: 'system_event'
};

// Activity Modules
export const ACTIVITY_MODULE = {
  AUTHENTICATION: 'authentication',
  EMPLOYEE: 'employee',
  ATTENDANCE: 'attendance',
  TASK: 'task',
  PROJECT: 'project',
  MEETING: 'meeting',
  KPI: 'kpi',
  PERFORMANCE: 'performance',
  EXECUTIVE: 'executive',
  NOTIFICATION: 'notification',
  SETTINGS: 'settings',
  PROFILE: 'profile',
  SYSTEM: 'system'
};

// Notification Templates
export const NOTIFICATION_TEMPLATE = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  TASK_ASSIGNED: 'task_assigned',
  TASK_DUE_SOON: 'task_due_soon',
  TASK_OVERDUE: 'task_overdue',
  MEETING_INVITATION: 'meeting_invitation',
  MEETING_REMINDER: 'meeting_reminder',
  KPI_SUBMISSION_REMINDER: 'kpi_submission_reminder',
  PERFORMANCE_REVIEW: 'performance_review',
  REPORT_READY: 'report_ready',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SECURITY_ALERT: 'security_alert'
};

// Notification Limits
export const NOTIFICATION_LIMITS = {
  MAX_RECIPIENTS_PER_NOTIFICATION: 1000,
  MAX_ATTACHMENTS: 5,
  MAX_ATTACHMENT_SIZE: 10485760, // 10MB
  MAX_TITLE_LENGTH: 200,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_METADATA_SIZE: 10000
};

// Notification Retry Configuration
export const NOTIFICATION_RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  EXPONENTIAL_BACKOFF: true
};

// Notification Queue Configuration
export const NOTIFICATION_QUEUE = {
  BATCH_SIZE: 100,
  PROCESSING_INTERVAL: 1000, // 1 second
  MAX_QUEUE_SIZE: 10000
};

// Export all constants as a single object
export const NOTIFICATION_CONSTANTS = {
  NOTIFICATION_TYPE,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
  READ_STATUS,
  REFERENCE_TYPE,
  DIGEST_FREQUENCY,
  QUIET_HOURS,
  MUTE_DURATION,
  NOTIFICATION_TTL,
  AUDIT_ACTION,
  AUDIT_MODULE,
  ACTIVITY_TYPE,
  ACTIVITY_MODULE,
  NOTIFICATION_TEMPLATE,
  NOTIFICATION_LIMITS,
  NOTIFICATION_RETRY,
  NOTIFICATION_QUEUE
};
