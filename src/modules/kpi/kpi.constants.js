export const KPI_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived'
};

export const KPI_GRADE = {
  EXCELLENT: 'A+',
  VERY_GOOD: 'A',
  GOOD: 'B+',
  SATISFACTORY: 'B',
  AVERAGE: 'C',
  BELOW_AVERAGE: 'D',
  POOR: 'E'
};

export const KPI_PERFORMANCE_STATUS = {
  EXCEEDS_EXPECTATIONS: 'exceeds_expectations',
  MEETS_EXPECTATIONS: 'meets_expectations',
  NEEDS_IMPROVEMENT: 'needs_improvement',
  UNSATISFACTORY: 'unsatisfactory'
};

export const EVALUATION_PERIOD = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  HALF_YEARLY: 'half_yearly'
};

export const GOAL_TYPE = {
  PERSONAL: 'personal',
  DEPARTMENT: 'department',
  ORGANIZATION: 'organization',
  PROJECT: 'project'
};

export const GOAL_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const GOAL_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  ON_TRACK: 'on_track',
  AT_RISK: 'at_risk',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DEFERRED: 'deferred'
};

export const APPRAISAL_TYPE = {
  SELF: 'self',
  MANAGER: 'manager',
  HR: 'hr',
  CEO: 'ceo',
  PEER: 'peer',
  SUBORDINATE: 'subordinate',
  CLIENT: 'client'
};

export const APPRAISAL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

export const RECOMMENDATION_TYPE = {
  PROMOTION: 'promotion',
  INCREMENT: 'increment',
  BONUS: 'bonus',
  TRAINING: 'training',
  WARNING: 'warning',
  TERMINATION: 'termination',
  TRANSFER: 'transfer',
  NO_ACTION: 'no_action'
};

export const REWARD_TYPE = {
  EMPLOYEE_OF_MONTH: 'employee_of_month',
  EMPLOYEE_OF_QUARTER: 'employee_of_quarter',
  EMPLOYEE_OF_YEAR: 'employee_of_year',
  PERFORMANCE_BONUS: 'performance_bonus',
  SPOT_AWARD: 'spot_award',
  LONG_SERVICE_AWARD: 'long_service_award',
  INNOVATION_AWARD: 'innovation_award',
  TEAM_AWARD: 'team_award',
  EXCELLENCE_AWARD: 'excellence_award',
  CUSTOM: 'custom'
};

export const REWARD_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  ISSUED: 'issued',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const WARNING_TYPE = {
  VERBAL: 'verbal',
  WRITTEN: 'written',
  FINAL: 'final',
  SUSPENSION: 'suspension'
};

export const WARNING_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const WARNING_STATUS = {
  ISSUED: 'issued',
  RESOLVED: 'resolved',
  APPEALED: 'appealed',
  ESCALATED: 'escalated'
};

export const PERFORMANCE_TREND = {
  IMPROVING: 'improving',
  STABLE: 'stable',
  DECLINING: 'declining',
  VOLATILE: 'volatile'
};

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const COLLECTION_NAME = {
  KPI: 'kpis',
  GOAL: 'goals',
  PERFORMANCE: 'performances',
  APPRAISAL: 'appraisals',
  REWARD: 'rewards',
  WARNING: 'warnings'
};

export const KPI_WEIGHTAGE = {
  ATTENDANCE: 10,
  TASK_COMPLETION: 20,
  PRODUCTIVITY: 15,
  QUALITY: 15,
  DISCIPLINE: 10,
  PROJECT_CONTRIBUTION: 10,
  MEETING_PARTICIPATION: 5,
  INNOVATION: 5,
  LEARNING: 5,
  COMMUNICATION: 5
};

export const SCORE_RANGE = {
  EXCELLENT: { min: 90, max: 100 },
  VERY_GOOD: { min: 80, max: 89 },
  GOOD: { min: 70, max: 79 },
  SATISFACTORY: { min: 60, max: 69 },
  AVERAGE: { min: 50, max: 59 },
  BELOW_AVERAGE: { min: 40, max: 49 },
  POOR: { min: 0, max: 39 }
};

export const MAX_SCORE = 100;
export const MIN_SCORE = 0;
