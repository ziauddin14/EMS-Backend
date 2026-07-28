import mongoose from 'mongoose';
import { KPI_STATUS, KPI_GRADE, KPI_PERFORMANCE_STATUS, EVALUATION_PERIOD, APPROVAL_STATUS, COLLECTION_NAME } from './kpi.constants.js';

const kpiSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
      index: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designation',
      default: null,
      index: true
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    evaluationPeriod: {
      type: String,
      enum: Object.values(EVALUATION_PERIOD),
      required: [true, 'Evaluation period is required'],
      index: true
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      default: null,
      index: true
    },
    quarter: {
      type: Number,
      min: 1,
      max: 4,
      default: null,
      index: true
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      index: true
    },
    scores: {
      attendance: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      task: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      productivity: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      quality: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      discipline: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      projectContribution: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      meetingParticipation: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      reviewScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      innovation: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      learning: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      communication: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true
    },
    performanceGrade: {
      type: String,
      enum: Object.values(KPI_GRADE),
      default: null,
      index: true
    },
    performanceStatus: {
      type: String,
      enum: Object.values(KPI_PERFORMANCE_STATUS),
      default: null,
      index: true
    },
    rank: {
      type: Number,
      default: null,
      index: true
    },
    totalEmployees: {
      type: Number,
      default: 0
    },
    percentile: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [2000, 'Remarks cannot exceed 2000 characters'],
      default: null
    },
    achievements: [{
      type: String,
      trim: true,
      maxlength: [500, 'Achievement cannot exceed 500 characters']
    }],
    improvements: [{
      type: String,
      trim: true,
      maxlength: [500, 'Improvement cannot exceed 500 characters']
    }],
    attachments: [{
      fileName: {
        type: String,
        required: true,
        trim: true
      },
      fileUrl: {
        type: String,
        required: true
      },
      fileType: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    evidence: [{
      type: String,
      trim: true,
      maxlength: [1000, 'Evidence cannot exceed 1000 characters']
    }],
    status: {
      type: String,
      enum: Object.values(KPI_STATUS),
      default: KPI_STATUS.DRAFT,
      index: true
    },
    approvalStatus: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.PENDING,
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Rejection reason cannot exceed 1000 characters'],
      default: null
    },
    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME.KPI
  }
);

// Compound indexes for performance optimization
kpiSchema.index({ employee: 1, year: 1, month: 1, isDeleted: 1 }, { unique: true });
kpiSchema.index({ employee: 1, year: 1, quarter: 1, isDeleted: 1 }, { unique: true, sparse: true });
kpiSchema.index({ department: 1, year: 1, month: 1, isDeleted: 1 });
kpiSchema.index({ department: 1, year: 1, quarter: 1, isDeleted: 1 });
kpiSchema.index({ reportingManager: 1, year: 1, month: 1, isDeleted: 1 });
kpiSchema.index({ evaluationPeriod: 1, year: 1, isDeleted: 1 });
kpiSchema.index({ status: 1, approvalStatus: 1, isDeleted: 1 });
kpiSchema.index({ performanceGrade: 1, year: 1, isDeleted: 1 });
kpiSchema.index({ overallScore: 1, year: 1, isDeleted: 1 });
kpiSchema.index({ rank: 1, year: 1, isDeleted: 1 });
kpiSchema.index({ startDate: 1, endDate: 1, isDeleted: 1 });
kpiSchema.index({ createdAt: 1, status: 1, isDeleted: 1 });
kpiSchema.index({ approvedAt: 1, isDeleted: 1 });
kpiSchema.index({ reviewedAt: 1, isDeleted: 1 });

// Static methods
kpiSchema.statics.findByEmployee = function(employeeId, options = {}) {
  const { year, month, quarter, evaluationPeriod } = options;
  const filter = { employee: employeeId, isDeleted: false };
  
  if (year) filter.year = year;
  if (month) filter.month = month;
  if (quarter) filter.quarter = quarter;
  if (evaluationPeriod) filter.evaluationPeriod = evaluationPeriod;
  
  return this.find(filter).sort({ year: -1, month: -1 });
};

kpiSchema.statics.findByDepartment = function(departmentId, options = {}) {
  const { year, month, quarter, evaluationPeriod } = options;
  const filter = { department: departmentId, isDeleted: false };
  
  if (year) filter.year = year;
  if (month) filter.month = month;
  if (quarter) filter.quarter = quarter;
  if (evaluationPeriod) filter.evaluationPeriod = evaluationPeriod;
  
  return this.find(filter).sort({ year: -1, month: -1 });
};

kpiSchema.statics.findByManager = function(managerId, options = {}) {
  const { year, month, quarter, evaluationPeriod } = options;
  const filter = { reportingManager: managerId, isDeleted: false };
  
  if (year) filter.year = year;
  if (month) filter.month = month;
  if (quarter) filter.quarter = quarter;
  if (evaluationPeriod) filter.evaluationPeriod = evaluationPeriod;
  
  return this.find(filter).sort({ year: -1, month: -1 });
};

kpiSchema.statics.findByPeriod = function(year, periodType, periodValue) {
  const filter = { year, isDeleted: false };
  
  if (periodType === 'monthly') {
    filter.month = periodValue;
  } else if (periodType === 'quarterly') {
    filter.quarter = periodValue;
  }
  
  return this.find(filter).sort({ overallScore: -1 });
};

kpiSchema.statics.findByGrade = function(grade, year) {
  const filter = { performanceGrade: grade, isDeleted: false };
  if (year) filter.year = year;
  return this.find(filter).sort({ year: -1, month: -1 });
};

kpiSchema.statics.findByStatus = function(status, approvalStatus) {
  const filter = { status, isDeleted: false };
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  return this.find(filter).sort({ createdAt: -1 });
};

kpiSchema.statics.getTopPerformers = function(year, limit = 10) {
  return this.find({ year, isDeleted: false, status: KPI_STATUS.APPROVED })
    .sort({ overallScore: -1 })
    .limit(limit)
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

kpiSchema.statics.getLowPerformers = function(year, limit = 10) {
  return this.find({ year, isDeleted: false, status: KPI_STATUS.APPROVED })
    .sort({ overallScore: 1 })
    .limit(limit)
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

kpiSchema.statics.getDepartmentAverage = function(departmentId, year) {
  const filter = { department: departmentId, year, isDeleted: false, status: KPI_STATUS.APPROVED };
  return this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$department',
        averageScore: { $avg: '$overallScore' },
        totalEmployees: { $sum: 1 },
        maxScore: { $max: '$overallScore' },
        minScore: { $min: '$overallScore' }
      }
    }
  ]);
};

kpiSchema.statics.getYearlyTrend = function(employeeId, years = 5) {
  const startYear = new Date().getFullYear() - years;
  return this.find({
    employee: employeeId,
    year: { $gte: startYear },
    isDeleted: false,
    status: KPI_STATUS.APPROVED
  }).sort({ year: 1, month: 1 });
};

// Instance methods
kpiSchema.methods.calculateOverallScore = function() {
  const { KPI_WEIGHTAGE } = await import('./kpi.constants.js');
  const scores = this.scores;
  
  this.overallScore = (
    (scores.attendance * KPI_WEIGHTAGE.ATTENDANCE / 100) +
    (scores.task * KPI_WEIGHTAGE.TASK_COMPLETION / 100) +
    (scores.productivity * KPI_WEIGHTAGE.PRODUCTIVITY / 100) +
    (scores.quality * KPI_WEIGHTAGE.QUALITY / 100) +
    (scores.discipline * KPI_WEIGHTAGE.DISCIPLINE / 100) +
    (scores.projectContribution * KPI_WEIGHTAGE.PROJECT_CONTRIBUTION / 100) +
    (scores.meetingParticipation * KPI_WEIGHTAGE.MEETING_PARTICIPATION / 100) +
    (scores.reviewScore * 0.05) +
    (scores.innovation * KPI_WEIGHTAGE.INNOVATION / 100) +
    (scores.learning * KPI_WEIGHTAGE.LEARNING / 100) +
    (scores.communication * KPI_WEIGHTAGE.COMMUNICATION / 100)
  );
  
  this.overallScore = Math.round(this.overallScore * 100) / 100;
  return this.save();
};

kpiSchema.methods.determineGrade = function() {
  const { SCORE_RANGE, KPI_GRADE } = await import('./kpi.constants.js');
  const score = this.overallScore;
  
  if (score >= SCORE_RANGE.EXCELLENT.min && score <= SCORE_RANGE.EXCELLENT.max) {
    this.performanceGrade = KPI_GRADE.EXCELLENT;
  } else if (score >= SCORE_RANGE.VERY_GOOD.min && score <= SCORE_RANGE.VERY_GOOD.max) {
    this.performanceGrade = KPI_GRADE.VERY_GOOD;
  } else if (score >= SCORE_RANGE.GOOD.min && score <= SCORE_RANGE.GOOD.max) {
    this.performanceGrade = KPI_GRADE.GOOD;
  } else if (score >= SCORE_RANGE.SATISFACTORY.min && score <= SCORE_RANGE.SATISFACTORY.max) {
    this.performanceGrade = KPI_GRADE.SATISFACTORY;
  } else if (score >= SCORE_RANGE.AVERAGE.min && score <= SCORE_RANGE.AVERAGE.max) {
    this.performanceGrade = KPI_GRADE.AVERAGE;
  } else if (score >= SCORE_RANGE.BELOW_AVERAGE.min && score <= SCORE_RANGE.BELOW_AVERAGE.max) {
    this.performanceGrade = KPI_GRADE.BELOW_AVERAGE;
  } else {
    this.performanceGrade = KPI_GRADE.POOR;
  }
  
  return this.save();
};

kpiSchema.methods.approve = function(approverId) {
  this.status = KPI_STATUS.APPROVED;
  this.approvalStatus = APPROVAL_STATUS.APPROVED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  return this.save();
};

kpiSchema.methods.reject = function(approverId, reason) {
  this.status = KPI_STATUS.REJECTED;
  this.approvalStatus = APPROVAL_STATUS.REJECTED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

kpiSchema.methods.submitForReview = function() {
  this.status = KPI_STATUS.UNDER_REVIEW;
  this.approvalStatus = APPROVAL_STATUS.PENDING;
  return this.save();
};

kpiSchema.methods.archive = function() {
  this.status = KPI_STATUS.ARCHIVED;
  return this.save();
};

const KPI = mongoose.model('KPI', kpiSchema);

export default KPI;
