// Meeting Types
export const MEETING_TYPE = {
  ONE_ON_ONE: 'one_on_one',
  TEAM: 'team',
  DEPARTMENT: 'department',
  PROJECT: 'project',
  ALL_HANDS: 'all_hands',
  BOARD: 'board',
  CLIENT: 'client',
  TRAINING: 'training',
  INTERVIEW: 'interview',
  REVIEW: 'review',
  BRAINSTORM: 'brainstorm',
  STANDUP: 'standup',
  RETROSPECTIVE: 'retrospective'
};

// Meeting Categories
export const MEETING_CATEGORY = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  MIXED: 'mixed',
  CONFIDENTIAL: 'confidential',
  PUBLIC: 'public'
};

// Meeting Modes
export const MEETING_MODE = {
  IN_PERSON: 'in_person',
  ONLINE: 'online',
  HYBRID: 'hybrid'
};

// Meeting Platforms
export const MEETING_PLATFORM = {
  GOOGLE_MEET: 'google_meet',
  ZOOM: 'zoom',
  MICROSOFT_TEAMS: 'microsoft_teams',
  WEBEX: 'webex',
  SKYPE: 'skype',
  OTHER: 'other'
};

// Meeting Priority
export const MEETING_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Meeting Status
export const MEETING_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
  NO_SHOW: 'no_show'
};

// Approval Status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Agenda Status
export const AGENDA_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Minutes Approval Status
export const MINUTES_APPROVAL_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  NO_SHOW: 'no_show'
};

// Action Item Priority
export const ACTION_ITEM_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Action Item Status
export const ACTION_ITEM_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue'
};

// Recurring Patterns
export const RECURRING_PATTERN = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BI_WEEKLY: 'bi_weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
};

// Meeting Duration Limits
export const MEETING_DURATION_LIMITS = {
  MIN_DURATION: 15, // minutes
  MAX_DURATION: 480, // 8 hours
  DEFAULT_DURATION: 60 // 1 hour
};

// Meeting Capacity Limits
export const MEETING_CAPACITY = {
  ONE_ON_ONE: 2,
  SMALL_TEAM: 10,
  TEAM: 25,
  DEPARTMENT: 50,
  ALL_HANDS: 500,
  BOARD: 20
};

// Timezones
export const SUPPORTED_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney'
];

// Default Timezone
export const DEFAULT_TIMEZONE = 'UTC';

// Meeting Code Format
export const MEETING_CODE_FORMAT = 'MTG-{YYYYMMDD}-{XXXX}';

// Action Item Weightage
export const ACTION_ITEM_WEIGHTAGE = {
  COMPLETION: 0.5,
  TIMELINESS: 0.3,
  QUALITY: 0.2
};

// Participation Score Factors
export const PARTICIPATION_SCORE_WEIGHTAGE = {
  ATTENDANCE: 0.4,
  TIMELINESS: 0.2,
  ENGAGEMENT: 0.3,
  CONTRIBUTION: 0.1
};

// Meeting Statistics
export const MEETING_STATISTICS = {
  ATTENDANCE_RATE_THRESHOLD: 80, // percentage
  COMPLETION_RATE_THRESHOLD: 90, // percentage
  ACTION_ITEM_COMPLETION_THRESHOLD: 85 // percentage
};

// Export all constants as a single object for convenience
export const MEETING_CONSTANTS = {
  TYPE: MEETING_TYPE,
  CATEGORY: MEETING_CATEGORY,
  MODE: MEETING_MODE,
  PLATFORM: MEETING_PLATFORM,
  PRIORITY: MEETING_PRIORITY,
  STATUS: MEETING_STATUS,
  APPROVAL_STATUS,
  AGENDA_STATUS,
  MINUTES_APPROVAL_STATUS,
  ATTENDANCE_STATUS,
  ACTION_ITEM_PRIORITY,
  ACTION_ITEM_STATUS,
  RECURRING_PATTERN,
  DURATION_LIMITS: MEETING_DURATION_LIMITS,
  CAPACITY: MEETING_CAPACITY,
  TIMEZONES: SUPPORTED_TIMEZONES,
  DEFAULT_TIMEZONE,
  CODE_FORMAT: MEETING_CODE_FORMAT,
  ACTION_ITEM_WEIGHTAGE,
  PARTICIPATION_SCORE_WEIGHTAGE,
  STATISTICS: MEETING_STATISTICS
};
