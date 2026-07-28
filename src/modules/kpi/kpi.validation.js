import { z } from 'zod';
import { KPI_STATUS, KPI_GRADE, EVALUATION_PERIOD, GOAL_TYPE, GOAL_PRIORITY, GOAL_STATUS, APPRAISAL_TYPE, APPRAISAL_STATUS, RECOMMENDATION_TYPE, REWARD_TYPE, REWARD_STATUS, WARNING_TYPE, WARNING_SEVERITY, WARNING_STATUS } from './kpi.constants.js';

// KPI Validation Schemas
const kpiSchema = z.object({
  kpiNumber: z.string().min(1).max(20).optional(),
  employee: z.string().min(1),
  department: z.string().optional(),
  designation: z.string().optional(),
  reportingManager: z.string().optional(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  evaluationPeriod: z.enum(Object.values(EVALUATION_PERIOD)),
  kpiData: z.array(z.object({
    category: z.string().min(1),
    weightage: z.number().min(0).max(100),
    targetValue: z.number(),
    actualValue: z.number().optional(),
    score: z.number().min(0).max(100).optional(),
    description: z.string().optional()
  })).optional(),
  overallScore: z.number().min(0).max(100).optional(),
  performanceGrade: z.enum(Object.values(KPI_GRADE)).optional(),
  status: z.enum(Object.values(KPI_STATUS)).default(KPI_STATUS.DRAFT),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  comments: z.array(z.object({
    comment: z.string().min(1),
    addedBy: z.string().min(1),
    addedAt: z.date().optional()
  })).optional(),
  attachments: z.array(z.object({
    fileName: z.string().min(1),
    fileUrl: z.string().url(),
    fileType: z.string().min(1),
    fileSize: z.number().positive(),
    uploadedAt: z.date().optional()
  })).optional()
});

// Goal Validation Schemas
const goalSchema = z.object({
  goalNumber: z.string().min(1).max(20).optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  owner: z.string().min(1),
  department: z.string().optional(),
  project: z.string().optional(),
  reviewer: z.string().optional(),
  reportingManager: z.string().optional(),
  type: z.enum(Object.values(GOAL_TYPE)),
  priority: z.enum(Object.values(GOAL_PRIORITY)).default('medium'),
  startDate: z.date(),
  dueDate: z.date(),
  targetValue: z.number().optional(),
  currentValue: z.number().optional(),
  completionPercentage: z.number().min(0).max(100).default(0),
  weightage: z.number().min(0).max(100).default(0),
  status: z.enum(Object.values(GOAL_STATUS)).default(GOAL_STATUS.ACTIVE),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  keyResults: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    targetValue: z.number(),
    currentValue: z.number().optional(),
    completed: z.boolean().default(false),
    dueDate: z.date().optional()
  })).optional(),
  milestones: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    targetDate: z.date(),
    completed: z.boolean().default(false)
  })).optional(),
  dependencies: z.array(z.string()).optional(),
  subGoals: z.array(z.string()).optional(),
  progressNotes: z.array(z.object({
    note: z.string().min(1),
    addedBy: z.string().min(1),
    addedAt: z.date().optional()
  })).optional(),
  attachments: z.array(z.object({
    fileName: z.string().min(1),
    fileUrl: z.string().url(),
    fileType: z.string().min(1),
    fileSize: z.number().positive()
  })).optional()
});

// Appraisal Validation Schemas
const appraisalSchema = z.object({
  appraisalNumber: z.string().min(1).max(20).optional(),
  employee: z.string().min(1),
  department: z.string().optional(),
  designation: z.string().optional(),
  reportingManager: z.string().optional(),
  hrReviewer: z.string().optional(),
  ceoReviewer: z.string().optional(),
  type: z.enum(Object.values(APPRAISAL_TYPE)),
  year: z.number().int().min(2000).max(2100),
  periodType: z.enum(['monthly', 'quarterly', 'yearly']).default('yearly'),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(Object.values(APPRAISAL_STATUS)).default(APPRAISAL_STATUS.DRAFT),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  selfAppraisal: z.object({
    rating: z.number().min(0).max(100).optional(),
    comments: z.string().max(2000).optional(),
    achievements: z.string().max(2000).optional(),
    improvements: z.string().max(2000).optional()
  }).optional(),
  managerAppraisal: z.object({
    rating: z.number().min(0).max(100).optional(),
    comments: z.string().max(2000).optional(),
    strengths: z.string().max(2000).optional(),
    weaknesses: z.string().max(2000).optional()
  }).optional(),
  hrAppraisal: z.object({
    rating: z.number().min(0).max(100).optional(),
    comments: z.string().max(2000).optional(),
    recommendations: z.string().max(2000).optional()
  }).optional(),
  ceoAppraisal: z.object({
    rating: z.number().min(0).max(100).optional(),
    comments: z.string().max(2000).optional()
  }).optional(),
  finalRating: z.number().min(0).max(100).optional(),
  finalGrade: z.enum(Object.values(KPI_GRADE)).optional(),
  recommendations: z.array(z.object({
    type: z.enum(Object.values(RECOMMENDATION_TYPE)),
    description: z.string().min(1),
    approved: z.boolean().default(false)
  })).optional(),
  promotion: z.object({
    eligible: z.boolean().default(false),
    recommendedLevel: z.string().optional(),
    comments: z.string().optional()
  }).optional(),
  increment: z.object({
    eligible: z.boolean().default(false),
    percentage: z.number().min(0).max(100).optional(),
    amount: z.number().optional(),
    comments: z.string().optional()
  }).optional(),
  bonus: z.object({
    eligible: z.boolean().default(false),
    percentage: z.number().min(0).max(100).optional(),
    amount: z.number().optional(),
    comments: z.string().optional()
  }).optional(),
  training: z.array(z.object({
    course: z.string().min(1),
    type: z.string().min(1),
    duration: z.string().optional(),
    mandatory: z.boolean().default(false)
  })).optional(),
  attachments: z.array(z.object({
    fileName: z.string().min(1),
    fileUrl: z.string().url(),
    fileType: z.string().min(1),
    fileSize: z.number().positive()
  })).optional()
});

// Performance Validation Schemas
const performanceSchema = z.object({
  employee: z.string().min(1),
  department: z.string().optional(),
  designation: z.string().optional(),
  reportingManager: z.string().optional(),
  year: z.number().int().min(2000).max(2100),
  periodType: z.enum(['monthly', 'quarterly', 'yearly']).default('yearly'),
  startDate: z.date(),
  endDate: z.date(),
  monthlyPerformance: z.array(z.object({
    month: z.number().int().min(1).max(12),
    score: z.number().min(0).max(100).optional(),
    attendanceScore: z.number().min(0).max(100).optional(),
    productivityScore: z.number().min(0).max(100).optional(),
    qualityScore: z.number().min(0).max(100).optional(),
    notes: z.string().optional()
  })).optional(),
  quarterlyPerformance: z.array(z.object({
    quarter: z.number().int().min(1).max(4),
    score: z.number().min(0).max(100).optional(),
    notes: z.string().optional()
  })).optional(),
  yearlyPerformance: z.object({
    overallScore: z.number().min(0).max(100).optional(),
    attendanceScore: z.number().min(0).max(100).optional(),
    productivityScore: z.number().min(0).max(100).optional(),
    qualityScore: z.number().min(0).max(100).optional(),
    improvementPercentage: z.number().optional(),
    growthPercentage: z.number().optional(),
    trend: z.enum(['improving', 'stable', 'declining']).optional(),
    ranking: z.number().int().optional(),
    percentile: z.number().min(0).max(100).optional(),
    notes: z.string().optional()
  }).optional(),
  promotionEligible: z.boolean().default(false),
  bonusEligible: z.boolean().default(false),
  appraisalEligible: z.boolean().default(false),
  performanceMetrics: z.array(z.object({
    metric: z.string().min(1),
    value: z.number(),
    target: z.number().optional(),
    unit: z.string().optional()
  })).optional(),
  notes: z.string().max(2000).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('pending')
});

// Reward Validation Schemas
const rewardSchema = z.object({
  rewardNumber: z.string().min(1).max(20).optional(),
  type: z.enum(Object.values(REWARD_TYPE)),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  recipient: z.string().min(1),
  department: z.string().optional(),
  project: z.string().optional(),
  team: z.string().optional(),
  issuedBy: z.string().min(1),
  issuedDate: z.date(),
  reason: z.string().min(1).max(2000),
  category: z.string().max(100).optional(),
  points: z.number().min(0).optional(),
  monetaryValue: z.number().min(0).optional(),
  status: z.enum(Object.values(REWARD_STATUS)).default(REWARD_STATUS.PENDING),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  nominatedBy: z.string().optional(),
  nominationDate: z.date().optional(),
  achievements: z.array(z.string()).optional(),
  recognition: z.string().max(1000).optional(),
  certificate: z.object({
    issued: z.boolean().default(false),
    certificateNumber: z.string().optional(),
    issuedDate: z.date().optional()
  }).optional(),
  gifts: z.array(z.object({
    name: z.string().min(1),
    value: z.number().min(0),
    description: z.string().optional()
  })).optional(),
  attachments: z.array(z.object({
    fileName: z.string().min(1),
    fileUrl: z.string().url(),
    fileType: z.string().min(1),
    fileSize: z.number().positive()
  })).optional(),
  comments: z.array(z.object({
    comment: z.string().min(1),
    addedBy: z.string().min(1),
    addedAt: z.date().optional()
  })).optional()
});

// Warning Validation Schemas
const warningSchema = z.object({
  warningNumber: z.string().min(1).max(20).optional(),
  type: z.enum(Object.values(WARNING_TYPE)),
  severity: z.enum(Object.values(WARNING_SEVERITY)),
  employee: z.string().min(1),
  department: z.string().optional(),
  issuedBy: z.string().min(1),
  issuedDate: z.date(),
  reason: z.string().min(1).max(2000),
  category: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  incidentDate: z.date().optional(),
  incidentLocation: z.string().max(200).optional(),
  witnesses: z.array(z.string()).optional(),
  policyViolated: z.string().max(200).optional(),
  policySection: z.string().max(100).optional(),
  consequences: z.array(z.string().max(300)).optional(),
  status: z.enum(Object.values(WARNING_STATUS)).default(WARNING_STATUS.ISSUED),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('approved'),
  resolved: z.boolean().default(false),
  resolutionDate: z.date().optional(),
  resolvedBy: z.string().optional(),
  resolutionNotes: z.string().max(2000).optional(),
  correctiveActions: z.array(z.object({
    action: z.string().min(1).max(500),
    targetDate: z.date(),
    completed: z.boolean().default(false),
    completedAt: z.date().optional()
  })).optional(),
  appealed: z.boolean().default(false),
  appealDate: z.date().optional(),
  appealReason: z.string().max(2000).optional(),
  appealStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  appealReviewedBy: z.string().optional(),
  appealReviewedAt: z.date().optional(),
  appealDecision: z.string().max(1000).optional(),
  escalated: z.boolean().default(false),
  escalatedTo: z.string().optional(),
  escalatedAt: z.date().optional(),
  escalationReason: z.string().max(1000).optional(),
  validUntil: z.date().optional(),
  expires: z.boolean().default(false),
  expiryDate: z.date().optional(),
  affectsPerformance: z.boolean().default(true),
  performanceImpact: z.string().max(500).optional(),
  scoreDeduction: z.number().min(0).max(100).default(0),
  attachments: z.array(z.object({
    fileName: z.string().min(1),
    fileUrl: z.string().url(),
    fileType: z.string().min(1),
    fileSize: z.number().positive()
  })).optional(),
  comments: z.array(z.object({
    comment: z.string().min(1).max(500),
    addedBy: z.string().min(1),
    addedAt: z.date().optional()
  })).optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.date().optional(),
  followUpCompleted: z.boolean().default(false),
  followUpNotes: z.string().max(1000).optional()
});

// Export all validation schemas
export const kpiValidation = kpiSchema;
export const goalValidation = goalSchema;
export const appraisalValidation = appraisalSchema;
export const performanceValidation = performanceSchema;
export const rewardValidation = rewardSchema;
export const warningValidation = warningSchema;

// Validation middleware helper
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors
    });
  }
};
