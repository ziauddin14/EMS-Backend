import mongoose from 'mongoose';
import { APPRAISAL_TYPE, APPRAISAL_STATUS, RECOMMENDATION_TYPE, APPROVAL_STATUS, COLLECTION_NAME } from './kpi.constants.js';

const appraisalSchema = new mongoose.Schema(
  {
    appraisalNumber: {
      type: String,
      required: [true, 'Appraisal number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Appraisal number cannot exceed 20 characters'],
      index: true
    },
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
      required: [true, 'Reporting manager is required'],
      index: true
    },
    hrReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    ceoReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    appraisalPeriod: {
      type: String,
      required: [true, 'Appraisal period is required'],
      index: true
    },
    periodType: {
      type: String,
      enum: ['monthly', 'quarterly', 'half_yearly', 'yearly'],
      required: [true, 'Period type is required'],
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
    type: {
      type: String,
      enum: Object.values(APPRAISAL_TYPE),
      required: [true, 'Appraisal type is required'],
      index: true
    },
    status: {
      type: String,
      enum: Object.values(APPRAISAL_STATUS),
      default: APPRAISAL_STATUS.DRAFT,
      index: true
    },
    approvalStatus: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.PENDING,
      index: true
    },
    // Self appraisal
    selfAppraisal: {
      achievements: [{
        type: String,
        trim: true,
        maxlength: [500, 'Achievement cannot exceed 500 characters']
      }],
      challenges: [{
        type: String,
        trim: true,
        maxlength: [500, 'Challenge cannot exceed 500 characters']
      }],
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
      goalsAchieved: {
        type: Number,
        min: 0,
        default: 0
      },
      goalsMissed: {
        type: Number,
        min: 0,
        default: 0
      },
      selfRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      comments: {
        type: String,
        trim: true,
        maxlength: [2000, 'Comments cannot exceed 2000 characters'],
        default: null
      },
      submittedAt: {
        type: Date,
        default: null
      }
    },
    // Manager appraisal
    managerAppraisal: {
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
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
      reviewedAt: {
        type: Date,
        default: null
      }
    },
    // HR appraisal
    hrAppraisal: {
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      comments: {
        type: String,
        trim: true,
        maxlength: [2000, 'Comments cannot exceed 2000 characters'],
        default: null
      },
      reviewedAt: {
        type: Date,
        default: null
      }
    },
    // CEO review
    ceoReview: {
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      comments: {
        type: String,
        trim: true,
        maxlength: [2000, 'Comments cannot exceed 2000 characters'],
        default: null
      },
      reviewedAt: {
        type: Date,
        default: null
      }
    },
    // Final rating
    finalRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      index: true
    },
    finalGrade: {
      type: String,
      trim: true,
      maxlength: [10, 'Final grade cannot exceed 10 characters'],
      default: null,
      index: true
    },
    // Recommendations
    recommendations: [{
      type: {
        type: String,
        enum: Object.values(RECOMMENDATION_TYPE),
        required: true
      },
      description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
      },
      effectiveDate: {
        type: Date,
        default: null
      },
      approved: {
        type: Boolean,
        default: false
      }
    }],
    // Promotion details
    promotion: {
      eligible: {
        type: Boolean,
        default: false
      },
      recommendedLevel: {
        type: String,
        trim: true,
        maxlength: [100, 'Recommended level cannot exceed 100 characters'],
        default: null
      },
      recommendedDesignation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designation',
        default: null
      },
      effectiveDate: {
        type: Date,
        default: null
      }
    },
    // Increment details
    increment: {
      eligible: {
        type: Boolean,
        default: false
      },
      currentPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      recommendedPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      effectiveDate: {
        type: Date,
        default: null
      }
    },
    // Bonus details
    bonus: {
      eligible: {
        type: Boolean,
        default: false
      },
      recommendedAmount: {
        type: Number,
        min: 0,
        default: 0
      },
      effectiveDate: {
        type: Date,
        default: null
      }
    },
    // Training requirements
    trainingRequired: {
      type: Boolean,
      default: false
    },
    trainingRecommendations: [{
      trainingType: {
        type: String,
        trim: true,
        maxlength: [100, 'Training type cannot exceed 100 characters']
      },
      description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      },
      targetDate: {
        type: Date,
        default: null
      }
    }],
    // Performance notes
    performanceNotes: {
      type: String,
      trim: true,
      maxlength: [3000, 'Performance notes cannot exceed 3000 characters'],
      default: null
    },
    // Attachments
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
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Approval tracking
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    approvedAt: {
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
    collection: COLLECTION_NAME.APPRAISAL
  }
);

// Compound indexes for performance optimization
appraisalSchema.index({ employee: 1, year: 1, periodType: 1, isDeleted: 1 }, { unique: true });
appraisalSchema.index({ employee: 1, year: 1, quarter: 1, isDeleted: 1 }, { unique: true, sparse: true });
appraisalSchema.index({ department: 1, year: 1, periodType: 1, isDeleted: 1 });
appraisalSchema.index({ reportingManager: 1, year: 1, periodType: 1, isDeleted: 1 });
appraisalSchema.index({ hrReviewer: 1, year: 1, isDeleted: 1 });
appraisalSchema.index({ ceoReviewer: 1, year: 1, isDeleted: 1 });
appraisalSchema.index({ type: 1, status: 1, isDeleted: 1 });
appraisalSchema.index({ status: 1, approvalStatus: 1, isDeleted: 1 });
appraisalSchema.index({ finalRating: 1, year: 1, isDeleted: 1 });
appraisalSchema.index({ finalGrade: 1, year: 1, isDeleted: 1 });
appraisalSchema.index({ startDate: 1, endDate: 1, isDeleted: 1 });
appraisalSchema.index({ createdAt: 1, status: 1, isDeleted: 1 });
appraisalSchema.index({ approvedAt: 1, isDeleted: 1 });

// Static methods
appraisalSchema.statics.findByEmployee = function(employeeId, options = {}) {
  const { year, periodType, status, type } = options;
  const filter = { employee: employeeId, isDeleted: false };
  
  if (year) filter.year = year;
  if (periodType) filter.periodType = periodType;
  if (status) filter.status = status;
  if (type) filter.type = type;
  
  return this.find(filter).sort({ year: -1, startDate: -1 });
};

appraisalSchema.statics.findByDepartment = function(departmentId, options = {}) {
  const { year, periodType, status } = options;
  const filter = { department: departmentId, isDeleted: false };
  
  if (year) filter.year = year;
  if (periodType) filter.periodType = periodType;
  if (status) filter.status = status;
  
  return this.find(filter).sort({ year: -1, startDate: -1 });
};

appraisalSchema.statics.findByManager = function(managerId, options = {}) {
  const { year, periodType, status } = options;
  const filter = { reportingManager: managerId, isDeleted: false };
  
  if (year) filter.year = year;
  if (periodType) filter.periodType = periodType;
  if (status) filter.status = status;
  
  return this.find(filter).sort({ year: -1, startDate: -1 });
};

appraisalSchema.statics.findByHR = function(hrId, options = {}) {
  const { year, status } = options;
  const filter = { hrReviewer: hrId, isDeleted: false };
  
  if (year) filter.year = year;
  if (status) filter.status = status;
  
  return this.find(filter).sort({ year: -1, startDate: -1 });
};

appraisalSchema.statics.findByStatus = function(status, options = {}) {
  const { department, year, approvalStatus } = options;
  const filter = { status, isDeleted: false };
  
  if (department) filter.department = department;
  if (year) filter.year = year;
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  
  return this.find(filter).sort({ year: -1, startDate: -1 });
};

appraisalSchema.statics.findByPeriod = function(year, periodType, periodValue) {
  const filter = { year, periodType, isDeleted: false };
  
  if (periodType === 'monthly') {
    filter.month = periodValue;
  } else if (periodType === 'quarterly') {
    filter.quarter = periodValue;
  }
  
  return this.find(filter).sort({ finalRating: -1 });
};

appraisalSchema.statics.getTopPerformers = function(year, limit = 10) {
  return this.find({
    year,
    isDeleted: false,
    status: APPRAISAL_STATUS.COMPLETED,
    approvalStatus: APPROVAL_STATUS.APPROVED
  })
    .sort({ finalRating: -1 })
    .limit(limit)
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

appraisalSchema.statics.getLowPerformers = function(year, limit = 10) {
  return this.find({
    year,
    isDeleted: false,
    status: APPRAISAL_STATUS.COMPLETED,
    approvalStatus: APPROVAL_STATUS.APPROVED
  })
    .sort({ finalRating: 1 })
    .limit(limit)
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

appraisalSchema.statics.getDepartmentAverage = function(departmentId, year) {
  const filter = { department: departmentId, year, isDeleted: false, status: APPRAISAL_STATUS.COMPLETED };
  return this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$department',
        averageRating: { $avg: '$finalRating' },
        totalEmployees: { $sum: 1 },
        maxRating: { $max: '$finalRating' },
        minRating: { $min: '$finalRating' }
      }
    }
  ]);
};

appraisalSchema.statics.getPromotionEligible = function(year) {
  return this.find({
    year,
    isDeleted: false,
    status: APPRAISAL_STATUS.COMPLETED,
    approvalStatus: APPROVAL_STATUS.APPROVED,
    'promotion.eligible': true
  })
    .sort({ finalRating: -1 })
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

appraisalSchema.statics.getIncrementEligible = function(year) {
  return this.find({
    year,
    isDeleted: false,
    status: APPRAISAL_STATUS.COMPLETED,
    approvalStatus: APPROVAL_STATUS.APPROVED,
    'increment.eligible': true
  })
    .sort({ finalRating: -1 })
    .populate('employee', 'firstName lastName employeeId')
    .populate('department', 'name');
};

// Instance methods
appraisalSchema.methods.submit = function() {
  this.status = APPRAISAL_STATUS.SUBMITTED;
  this.selfAppraisal.submittedAt = new Date();
  return this.save();
};

appraisalSchema.methods.managerReview = function(rating, comments) {
  this.managerAppraisal.rating = rating;
  this.managerAppraisal.comments = comments;
  this.managerAppraisal.reviewedAt = new Date();
  this.status = APPRAISAL_STATUS.UNDER_REVIEW;
  return this.save();
};

appraisalSchema.methods.hrReview = function(rating, comments) {
  this.hrAppraisal.rating = rating;
  this.hrAppraisal.comments = comments;
  this.hrAppraisal.reviewedAt = new Date();
  return this.save();
};

appraisalSchema.methods.ceoReview = function(rating, comments) {
  this.ceoReview.rating = rating;
  this.ceoReview.comments = comments;
  this.ceoReview.reviewedAt = new Date();
  return this.save();
};

appraisalSchema.methods.calculateFinalRating = function() {
  const ratings = [];
  if (this.selfAppraisal.selfRating > 0) ratings.push(this.selfAppraisal.selfRating);
  if (this.managerAppraisal.rating > 0) ratings.push(this.managerAppraisal.rating);
  if (this.hrAppraisal.rating > 0) ratings.push(this.hrAppraisal.rating);
  if (this.ceoReview.rating > 0) ratings.push(this.ceoReview.rating);
  
  if (ratings.length > 0) {
    this.finalRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    this.finalRating = Math.round(this.finalRating * 100) / 100;
  }
  
  return this.save();
};

appraisalSchema.methods.finalize = function() {
  this.status = APPRAISAL_STATUS.COMPLETED;
  this.approvalStatus = APPROVAL_STATUS.APPROVED;
  this.approvedAt = new Date();
  return this.calculateFinalRating();
};

appraisalSchema.methods.approve = function(approverId) {
  this.approvalStatus = APPROVAL_STATUS.APPROVED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  return this.save();
};

appraisalSchema.methods.reject = function(approverId, reason) {
  this.approvalStatus = APPROVAL_STATUS.REJECTED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

appraisalSchema.methods.addRecommendation = function(recommendationData) {
  this.recommendations.push(recommendationData);
  return this.save();
};

appraisalSchema.methods.addTrainingRecommendation = function(trainingData) {
  this.trainingRecommendations.push(trainingData);
  this.trainingRequired = true;
  return this.save();
};

const Appraisal = mongoose.model('Appraisal', appraisalSchema);

export default Appraisal;
