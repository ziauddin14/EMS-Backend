import mongoose from 'mongoose';
import { WARNING_TYPE, WARNING_SEVERITY, WARNING_STATUS, APPROVAL_STATUS, COLLECTION_NAME } from './kpi.constants.js';

const warningSchema = new mongoose.Schema(
  {
    warningNumber: {
      type: String,
      required: [true, 'Warning number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Warning number cannot exceed 20 characters'],
      index: true
    },
    type: {
      type: String,
      enum: Object.values(WARNING_TYPE),
      required: [true, 'Warning type is required'],
      index: true
    },
    severity: {
      type: String,
      enum: Object.values(WARNING_SEVERITY),
      required: [true, 'Warning severity is required'],
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
      default: null,
      index: true
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Issuer is required'],
      index: true
    },
    issuedDate: {
      type: Date,
      required: [true, 'Issued date is required'],
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [2000, 'Reason cannot exceed 2000 characters']
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
      default: null,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: null
    },
    // Incident details
    incidentDate: {
      type: Date,
      default: null,
      index: true
    },
    incidentLocation: {
      type: String,
      trim: true,
      maxlength: [200, 'Incident location cannot exceed 200 characters'],
      default: null
    },
    witnesses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }],
    // Policy violation details
    policyViolated: {
      type: String,
      trim: true,
      maxlength: [200, 'Policy violated cannot exceed 200 characters'],
      default: null
    },
    policySection: {
      type: String,
      trim: true,
      maxlength: [100, 'Policy section cannot exceed 100 characters'],
      default: null
    },
    // Consequences
    consequences: [{
      type: String,
      trim: true,
      maxlength: [300, 'Consequence cannot exceed 300 characters']
    }],
    // Status tracking
    status: {
      type: String,
      enum: Object.values(WARNING_STATUS),
      default: WARNING_STATUS.ISSUED,
      index: true
    },
    approvalStatus: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.APPROVED,
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
    // Resolution details
    resolved: {
      type: Boolean,
      default: false,
      index: true
    },
    resolutionDate: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Resolution notes cannot exceed 2000 characters'],
      default: null
    },
    correctiveActions: [{
      action: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Corrective action cannot exceed 500 characters']
      },
      targetDate: {
        type: Date,
        required: true
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date,
        default: null
      }
    }],
    // Appeal details
    appealed: {
      type: Boolean,
      default: false
    },
    appealDate: {
      type: Date,
      default: null
    },
    appealReason: {
      type: String,
      trim: true,
      maxlength: [2000, 'Appeal reason cannot exceed 2000 characters'],
      default: null
    },
    appealStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appealReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    appealReviewedAt: {
      type: Date,
      default: null
    },
    appealDecision: {
      type: String,
      trim: true,
      maxlength: [1000, 'Appeal decision cannot exceed 1000 characters'],
      default: null
    },
    // Escalation details
    escalated: {
      type: Boolean,
      default: false
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    escalatedAt: {
      type: Date,
      default: null
    },
    escalationReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Escalation reason cannot exceed 1000 characters'],
      default: null
    },
    // Validity period
    validUntil: {
      type: Date,
      default: null
    },
    expires: {
      type: Boolean,
      default: false
    },
    expiryDate: {
      type: Date,
      default: null
    },
    // Impact on performance
    affectsPerformance: {
      type: Boolean,
      default: true
    },
    performanceImpact: {
      type: String,
      trim: true,
      maxlength: [500, 'Performance impact cannot exceed 500 characters'],
      default: null
    },
    scoreDeduction: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
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
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Comments
    comments: [{
      comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
      },
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Follow-up required
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: {
      type: Date,
      default: null
    },
    followUpCompleted: {
      type: Boolean,
      default: false
    },
    followUpNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Follow-up notes cannot exceed 1000 characters'],
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
    collection: COLLECTION_NAME.WARNING
  }
);

// Compound indexes for performance optimization
warningSchema.index({ employee: 1, issuedDate: 1, isDeleted: 1 });
warningSchema.index({ employee: 1, type: 1, isDeleted: 1 });
warningSchema.index({ employee: 1, severity: 1, isDeleted: 1 });
warningSchema.index({ employee: 1, status: 1, isDeleted: 1 });
warningSchema.index({ department: 1, issuedDate: 1, isDeleted: 1 });
warningSchema.index({ department: 1, type: 1, isDeleted: 1 });
warningSchema.index({ issuedBy: 1, issuedDate: 1, isDeleted: 1 });
warningSchema.index({ type: 1, severity: 1, isDeleted: 1 });
warningSchema.index({ type: 1, status: 1, isDeleted: 1 });
warningSchema.index({ severity: 1, status: 1, isDeleted: 1 });
warningSchema.index({ status: 1, resolved: 1, isDeleted: 1 });
warningSchema.index({ incidentDate: 1, isDeleted: 1 });
warningSchema.index({ issuedDate: 1, status: 1, isDeleted: 1 });
warningSchema.index({ validUntil: 1, isDeleted: 1 });
warningSchema.index({ expiryDate: 1, isDeleted: 1 });
warningSchema.index({ createdAt: 1, status: 1, isDeleted: 1 });
warningSchema.index({ resolved: 1, resolutionDate: 1, isDeleted: 1 });
warningSchema.index({ appealed: 1, appealStatus: 1, isDeleted: 1 });
warningSchema.index({ escalated: 1, isDeleted: 1 });
warningSchema.index({ category: 1, isDeleted: 1 });

// Static methods
warningSchema.statics.findByEmployee = function(employeeId, options = {}) {
  const { type, severity, status, year, startDate, endDate } = options;
  const filter = { employee: employeeId, isDeleted: false };
  
  if (type) filter.type = type;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  if (startDate && endDate) {
    filter.issuedDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

warningSchema.statics.findByDepartment = function(departmentId, options = {}) {
  const { type, severity, status, year } = options;
  const filter = { department: departmentId, isDeleted: false };
  
  if (type) filter.type = type;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

warningSchema.statics.findByIssuer = function(issuerId, options = {}) {
  const { type, severity, status, year } = options;
  const filter = { issuedBy: issuerId, isDeleted: false };
  
  if (type) filter.type = type;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

warningSchema.statics.findByType = function(type, options = {}) {
  const { severity, status, department, year } = options;
  const filter = { type, isDeleted: false };
  
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

warningSchema.statics.findBySeverity = function(severity, options = {}) {
  const { type, status, department, year } = options;
  const filter = { severity, isDeleted: false };
  
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

warningSchema.statics.findByStatus = function(status, options = {}) {
  const { department, type, severity, year } = options;
  const filter = { status, isDeleted: false };
  
  if (department) filter.department = department;
  if (type) filter.type = type;
  if (severity) filter.severity = severity;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

warningSchema.statics.findUnresolved = function(options = {}) {
  const { department, severity, year } = options;
  const filter = { resolved: false, isDeleted: false };
  
  if (department) filter.department = department;
  if (severity) filter.severity = severity;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ severity: -1, issuedDate: -1 });
};

warningSchema.statics.findPendingAppeals = function(options = {}) {
  const { department, year } = options;
  const filter = { appealed: true, appealStatus: 'pending', isDeleted: false };
  
  if (department) filter.department = department;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ appealDate: -1 });
};

warningSchema.statics.findExpired = function() {
  const now = new Date();
  return this.find({
    expires: true,
    expiryDate: { $lt: now },
    isDeleted: false
  }).sort({ expiryDate: 1 });
};

warningSchema.statics.findPendingFollowUp = function() {
  const now = new Date();
  return this.find({
    followUpRequired: true,
    followUpCompleted: false,
    followUpDate: { $lte: now },
    isDeleted: false
  }).sort({ followUpDate: 1 });
};

warningSchema.statics.getEmployeeWarningCount = function(employeeId, year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        employee: employeeId,
        issuedDate: { $gte: start, $lte: end },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalDeduction: { $sum: '$scoreDeduction' }
      }
    }
  ]);
};

warningSchema.statics.getDepartmentWarningStats = function(departmentId, year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        department: departmentId,
        issuedDate: { $gte: start, $lte: end },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        resolved: { $sum: { $cond: ['$resolved', 1, 0] } },
        appealed: { $sum: { $cond: ['$appealed', 1, 0] } }
      }
    }
  ]);
};

warningSchema.statics.getSeverityStats = function(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        issuedDate: { $gte: start, $lte: end },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 },
        resolved: { $sum: { $cond: ['$resolved', 1, 0] } }
      }
    }
  ]);
};

// Instance methods
warningSchema.methods.resolve = function(resolverId, notes) {
  this.resolved = true;
  this.resolutionDate = new Date();
  this.resolvedBy = resolverId;
  this.resolutionNotes = notes;
  this.status = WARNING_STATUS.RESOLVED;
  return this.save();
};

warningSchema.methods.appeal = function(reason) {
  this.appealed = true;
  this.appealDate = new Date();
  this.appealReason = reason;
  this.appealStatus = 'pending';
  return this.save();
};

warningSchema.methods.reviewAppeal = function(reviewerId, decision) {
  this.appealReviewedBy = reviewerId;
  this.appealReviewedAt = new Date();
  this.appealDecision = decision;
  this.appealStatus = decision ? 'approved' : 'rejected';
  return this.save();
};

warningSchema.methods.escalate = function(escalatedTo, reason) {
  this.escalated = true;
  this.escalatedTo = escalatedTo;
  this.escalatedAt = new Date();
  this.escalationReason = reason;
  this.status = WARNING_STATUS.ESCALATED;
  return this.save();
};

warningSchema.methods.addCorrectiveAction = function(actionData) {
  this.correctiveActions.push(actionData);
  return this.save();
};

warningSchema.methods.completeCorrectiveAction = function(actionId) {
  const action = this.correctiveActions.id(actionId);
  if (action) {
    action.completed = true;
    action.completedAt = new Date();
    return this.save();
  }
  throw new Error('Corrective action not found');
};

warningSchema.methods.addComment = function(comment, addedBy) {
  this.comments.push({
    comment,
    addedBy,
    addedAt: new Date()
  });
  return this.save();
};

warningSchema.methods.setFollowUp = function(followUpDate, notes) {
  this.followUpRequired = true;
  this.followUpDate = followUpDate;
  this.followUpNotes = notes;
  return this.save();
};

warningSchema.methods.completeFollowUp = function(notes) {
  this.followUpCompleted = true;
  this.followUpNotes = notes;
  return this.save();
};

warningSchema.methods.expire = function() {
  this.expires = true;
  this.expiryDate = new Date();
  return this.save();
};

const Warning = mongoose.model('Warning', warningSchema);

export default Warning;
