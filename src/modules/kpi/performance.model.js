import mongoose from 'mongoose';
import { PERFORMANCE_TREND, APPROVAL_STATUS, COLLECTION_NAME } from './kpi.constants.js';

const performanceSchema = new mongoose.Schema(
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
    periodType: {
      type: String,
      enum: ['monthly', 'quarterly', 'half_yearly', 'yearly'],
      required: [true, 'Period type is required'],
      index: true
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
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
    // Monthly performance
    monthlyPerformance: [{
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      grade: {
        type: String,
        trim: true,
        maxlength: [10, 'Grade cannot exceed 10 characters'],
        default: null
      },
      rank: {
        type: Number,
        default: null
      },
      tasksCompleted: {
        type: Number,
        default: 0
      },
      tasksMissed: {
        type: Number,
        default: 0
      },
      attendancePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      productivityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    }],
    // Quarterly performance
    quarterlyPerformance: [{
      quarter: {
        type: Number,
        required: true,
        min: 1,
        max: 4
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      grade: {
        type: String,
        trim: true,
        maxlength: [10, 'Grade cannot exceed 10 characters'],
        default: null
      },
      rank: {
        type: Number,
        default: null
      },
      improvementPercentage: {
        type: Number,
        default: 0
      },
      goalsAchieved: {
        type: Number,
        default: 0
      },
      goalsMissed: {
        type: Number,
        default: 0
      }
    }],
    // Yearly performance
    yearlyPerformance: {
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      grade: {
        type: String,
        trim: true,
        maxlength: [10, 'Grade cannot exceed 10 characters'],
        default: null
      },
      rank: {
        type: Number,
        default: null
      },
      percentile: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      totalEmployees: {
        type: Number,
        default: 0
      },
      improvementPercentage: {
        type: Number,
        default: 0
      },
      growthPercentage: {
        type: Number,
        default: 0
      },
      trend: {
        type: String,
        enum: Object.values(PERFORMANCE_TREND),
        default: PERFORMANCE_TREND.STABLE
      },
      averageMonthlyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      bestMonth: {
        type: Number,
        min: 1,
        max: 12,
        default: null
      },
      worstMonth: {
        type: Number,
        min: 1,
        max: 12,
        default: null
      }
    },
    // Historical performance
    historicalPerformance: [{
      year: {
        type: Number,
        required: true
      },
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      grade: {
        type: String,
        trim: true,
        maxlength: [10, 'Grade cannot exceed 10 characters'],
        default: null
      },
      rank: {
        type: Number,
        default: null
      },
      growthPercentage: {
        type: Number,
        default: 0
      }
    }],
    // Eligibility flags
    promotionEligible: {
      type: Boolean,
      default: false,
      index: true
    },
    bonusEligible: {
      type: Boolean,
      default: false,
      index: true
    },
    appraisalEligible: {
      type: Boolean,
      default: false,
      index: true
    },
    // Performance metrics
    totalTasksCompleted: {
      type: Number,
      default: 0
    },
    totalTasksMissed: {
      type: Number,
      default: 0
    },
    totalGoalsAchieved: {
      type: Number,
      default: 0
    },
    totalGoalsMissed: {
      type: Number,
      default: 0
    },
    averageAttendance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    averageProductivity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    averageQuality: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    // Ranking data
    departmentRank: {
      type: Number,
      default: null
    },
    organizationRank: {
      type: Number,
      default: null
    },
    designationRank: {
      type: Number,
      default: null
    },
    // Performance notes
    strengths: [{
      type: String,
      trim: true,
      maxlength: [300, 'Strength cannot exceed 300 characters']
    }],
    weaknesses: [{
      type: String,
      trim: true,
      maxlength: [300, 'Weakness cannot exceed 300 characters']
    }],
    achievements: [{
      type: String,
      trim: true,
      maxlength: [500, 'Achievement cannot exceed 500 characters']
    }],
    areasForImprovement: [{
      type: String,
      trim: true,
      maxlength: [500, 'Area for improvement cannot exceed 500 characters']
    }],
    comments: {
      type: String,
      trim: true,
      maxlength: [2000, 'Comments cannot exceed 2000 characters'],
      default: null
    },
    // Approval tracking
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
    collection: COLLECTION_NAME.PERFORMANCE
  }
);

// Compound indexes for performance optimization
performanceSchema.index({ employee: 1, year: 1, periodType: 1, isDeleted: 1 }, { unique: true });
performanceSchema.index({ employee: 1, year: 1, month: 1, isDeleted: 1 }, { unique: true, sparse: true });
performanceSchema.index({ employee: 1, year: 1, quarter: 1, isDeleted: 1 }, { unique: true, sparse: true });
performanceSchema.index({ department: 1, year: 1, periodType: 1, isDeleted: 1 });
performanceSchema.index({ reportingManager: 1, year: 1, periodType: 1, isDeleted: 1 });
performanceSchema.index({ designation: 1, year: 1, periodType: 1, isDeleted: 1 });
performanceSchema.index({ promotionEligible: 1, year: 1, isDeleted: 1 });
performanceSchema.index({ bonusEligible: 1, year: 1, isDeleted: 1 });
performanceSchema.index({ appraisalEligible: 1, year: 1, isDeleted: 1 });
performanceSchema.index({ approvalStatus: 1, year: 1, isDeleted: 1 });
performanceSchema.index({ 'yearlyPerformance.grade': 1, year: 1, isDeleted: 1 });
performanceSchema.index({ organizationRank: 1, year: 1, isDeleted: 1 });
performanceSchema.index({ departmentRank: 1, year: 1, isDeleted: 1 });
performanceSchema.index({ startDate: 1, endDate: 1, isDeleted: 1 });
performanceSchema.index({ createdAt: 1, year: 1, isDeleted: 1 });
performanceSchema.index({ approvedAt: 1, isDeleted: 1 });

// Static methods
performanceSchema.statics.findByEmployee = function(employeeId, options = {}) {
  const { year, periodType } = options;
  const filter = { employee: employeeId, isDeleted: false };
  
  if (year) filter.year = year;
  if (periodType) filter.periodType = periodType;
  
  return this.find(filter).sort({ year: -1, startDate: -1 });
};

performanceSchema.statics.findByDepartment = function(departmentId, options = {}) {
  const { year, periodType } = options;
  const filter = { department: departmentId, isDeleted: false };
  
  if (year) filter.year = year;
  if (periodType) filter.periodType = periodType;
  
  return this.find(filter).sort({ year: -1, startDate: -1 });
};

performanceSchema.statics.findByManager = function(managerId, options = {}) {
  const { year, periodType } = options;
  const filter = { reportingManager: managerId, isDeleted: false };
  
  if (year) filter.year = year;
  if (periodType) filter.periodType = periodType;
  
  return this.find(filter).sort({ year: -1, startDate: -1 });
};

performanceSchema.statics.findByDesignation = function(designationId, options = {}) {
  const { year, periodType } = options;
  const filter = { designation: designationId, isDeleted: false };
  
  if (year) filter.year = year;
  if (periodType) filter.periodType = periodType;
  
  return this.find(filter).sort({ year: -1, startDate: -1 });
};

performanceSchema.statics.findByYear = function(year, options = {}) {
  const { department, periodType } = options;
  const filter = { year, isDeleted: false };
  
  if (department) filter.department = department;
  if (periodType) filter.periodType = periodType;
  
  return this.find(filter).sort({ 'yearlyPerformance.overallScore': -1 });
};

performanceSchema.statics.getTopPerformers = function(year, limit = 10) {
  return this.find({
    year,
    isDeleted: false,
    approvalStatus: APPROVAL_STATUS.APPROVED
  })
    .sort({ 'yearlyPerformance.overallScore': -1 })
    .limit(limit)
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

performanceSchema.statics.getLowPerformers = function(year, limit = 10) {
  return this.find({
    year,
    isDeleted: false,
    approvalStatus: APPROVAL_STATUS.APPROVED
  })
    .sort({ 'yearlyPerformance.overallScore': 1 })
    .limit(limit)
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

performanceSchema.statics.getPromotionEligible = function(year) {
  return this.find({
    year,
    isDeleted: false,
    promotionEligible: true,
    approvalStatus: APPROVAL_STATUS.APPROVED
  })
    .sort({ 'yearlyPerformance.overallScore': -1 })
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

performanceSchema.statics.getBonusEligible = function(year) {
  return this.find({
    year,
    isDeleted: false,
    bonusEligible: true,
    approvalStatus: APPROVAL_STATUS.APPROVED
  })
    .sort({ 'yearlyPerformance.overallScore': -1 })
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

performanceSchema.statics.getDepartmentRankings = function(departmentId, year) {
  return this.find({
    department: departmentId,
    year,
    isDeleted: false,
    approvalStatus: APPROVAL_STATUS.APPROVED
  })
    .sort({ 'yearlyPerformance.overallScore': -1 })
    .populate('employee', 'firstName lastName employeeId');
};

performanceSchema.statics.getDesignationRankings = function(designationId, year) {
  return this.find({
    designation: designationId,
    year,
    isDeleted: false,
    approvalStatus: APPROVAL_STATUS.APPROVED
  })
    .sort({ 'yearlyPerformance.overallScore': -1 })
    .populate('employee', 'firstName lastName employeeId');
};

performanceSchema.statics.getHistoricalTrend = function(employeeId, years = 5) {
  const startYear = new Date().getFullYear() - years;
  return this.find({
    employee: employeeId,
    year: { $gte: startYear },
    isDeleted: false,
    approvalStatus: APPROVAL_STATUS.APPROVED
  }).sort({ year: 1 });
};

performanceSchema.statics.getDepartmentAverage = function(departmentId, year) {
  const filter = { department: departmentId, year, isDeleted: false, approvalStatus: APPROVAL_STATUS.APPROVED };
  return this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$department',
        averageScore: { $avg: '$yearlyPerformance.overallScore' },
        totalEmployees: { $sum: 1 },
        maxScore: { $max: '$yearlyPerformance.overallScore' },
        minScore: { $min: '$yearlyPerformance.overallScore' },
        promotionEligibleCount: { $sum: { $cond: ['$promotionEligible', 1, 0] } },
        bonusEligibleCount: { $sum: { $cond: ['$bonusEligible', 1, 0] } }
      }
    }
  ]);
};

// Instance methods
performanceSchema.methods.addMonthlyPerformance = function(monthData) {
  this.monthlyPerformance.push(monthData);
  return this.save();
};

performanceSchema.methods.addQuarterlyPerformance = function(quarterData) {
  this.quarterlyPerformance.push(quarterData);
  return this.save();
};

performanceSchema.methods.calculateYearlyPerformance = function() {
  const monthlyScores = this.monthlyPerformance.map(m => m.score);
  const quarterlyScores = this.quarterlyPerformance.map(q => q.score);
  
  if (monthlyScores.length > 0) {
    this.yearlyPerformance.averageMonthlyScore = monthlyScores.reduce((sum, score) => sum + score, 0) / monthlyScores.length;
  }
  
  if (quarterlyScores.length > 0) {
    this.yearlyPerformance.overallScore = quarterlyScores.reduce((sum, score) => sum + score, 0) / quarterlyScores.length;
  }
  
  return this.save();
};

performanceSchema.methods.determineTrend = function() {
  const scores = this.monthlyPerformance.map(m => m.score);
  if (scores.length < 2) {
    this.yearlyPerformance.trend = PERFORMANCE_TREND.STABLE;
    return this.save();
  }
  
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 5) {
    this.yearlyPerformance.trend = PERFORMANCE_TREND.IMPROVING;
  } else if (difference < -5) {
    this.yearlyPerformance.trend = PERFORMANCE_TREND.DECLINING;
  } else {
    this.yearlyPerformance.trend = PERFORMANCE_TREND.STABLE;
  }
  
  return this.save();
};

performanceSchema.methods.approve = function(approverId) {
  this.approvalStatus = APPROVAL_STATUS.APPROVED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  return this.save();
};

performanceSchema.methods.reject = function(approverId, reason) {
  this.approvalStatus = APPROVAL_STATUS.REJECTED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

performanceSchema.methods.setPromotionEligible = function(eligible) {
  this.promotionEligible = eligible;
  return this.save();
};

performanceSchema.methods.setBonusEligible = function(eligible) {
  this.bonusEligible = eligible;
  return this.save();
};

performanceSchema.methods.setAppraisalEligible = function(eligible) {
  this.appraisalEligible = eligible;
  return this.save();
};

const Performance = mongoose.model('Performance', performanceSchema);

export default Performance;
