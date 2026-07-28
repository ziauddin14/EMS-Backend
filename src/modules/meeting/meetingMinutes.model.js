import mongoose from 'mongoose';
import { MINUTES_APPROVAL_STATUS } from './meeting.constants.js';

const meetingMinutesSchema = new mongoose.Schema({
  // Meeting Reference
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
    unique: true,
    index: true
  },
  
  // Summary
  summary: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  
  // Discussion
  discussion: {
    type: String,
    trim: true,
    maxlength: 10000
  },
  
  // Decisions
  decisions: [{
    topic: String,
    decision: String,
    agreedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }],
    timestamp: Date
  }],
  
  // Risks
  risks: [{
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    mitigation: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  }],
  
  // Action Items Reference
  actionItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActionItem'
  }],
  
  // Follow Up
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // Approval
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  approvedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  approvalStatus: {
    type: String,
    enum: Object.values(MINUTES_APPROVAL_STATUS),
    default: MINUTES_APPROVAL_STATUS.DRAFT,
    index: true
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    uploadedAt: Date
  }],
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  deletedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
meetingMinutesSchema.index({ meeting: 1, isDeleted: 1 });
meetingMinutesSchema.index({ approvalStatus: 1, isDeleted: 1 });
meetingMinutesSchema.index({ preparedBy: 1, isDeleted: 1 });
meetingMinutesSchema.index({ followUpDate: 1, isDeleted: 1 });

// Static Methods
meetingMinutesSchema.statics.findByMeeting = function(meetingId) {
  return this.findOne({
    meeting: meetingId,
    isDeleted: false
  })
  .populate('meeting', '_id title startTime endTime')
  .populate('preparedBy', '_id firstName lastName employeeId')
  .populate('approvedBy', '_id firstName lastName employeeId')
  .populate('actionItems')
  .lean();
};

meetingMinutesSchema.statics.findByPreparedBy = function(preparedById, options = {}) {
  const { filter = {}, sort = { createdAt: -1 }, limit = 100 } = options;
  return this.find({
    preparedBy: preparedById,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('meeting', '_id title startTime endTime')
  .populate('preparedBy', '_id firstName lastName employeeId')
  .populate('approvedBy', '_id firstName lastName employeeId')
  .lean();
};

meetingMinutesSchema.statics.findByApprovalStatus = function(status, options = {}) {
  const { filter = {}, sort = { createdAt: -1 }, limit = 100 } = options;
  return this.find({
    approvalStatus: status,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('meeting', '_id title startTime endTime')
  .populate('preparedBy', '_id firstName lastName employeeId')
  .populate('approvedBy', '_id firstName lastName employeeId')
  .lean();
};

meetingMinutesSchema.statics.findPendingFollowUp = function(options = {}) {
  const { filter = {}, limit = 50 } = options;
  const today = new Date();
  return this.find({
    followUpDate: { $lte: today },
    approvalStatus: MINUTES_APPROVAL_STATUS.APPROVED,
    isDeleted: false,
    ...filter
  })
  .sort({ followUpDate: 1 })
  .limit(limit)
  .populate('meeting', '_id title startTime endTime')
  .populate('preparedBy', '_id firstName lastName employeeId')
  .lean();
};

// Instance Methods
meetingMinutesSchema.methods.submitForReview = function() {
  this.approvalStatus = MINUTES_APPROVAL_STATUS.PENDING_REVIEW;
  return this.save();
};

meetingMinutesSchema.methods.approve = function(approverId) {
  if (!this.approvedBy.includes(approverId)) {
    this.approvedBy.push(approverId);
  }
  this.approvalStatus = MINUTES_APPROVAL_STATUS.APPROVED;
  this.approvedAt = new Date();
  return this.save();
};

meetingMinutesSchema.methods.reject = function(approverId, reason) {
  if (!this.approvedBy.includes(approverId)) {
    this.approvedBy.push(approverId);
  }
  this.approvalStatus = MINUTES_APPROVAL_STATUS.REJECTED;
  this.rejectionReason = reason;
  return this.save();
};

meetingMinutesSchema.methods.finalize = function() {
  this.approvalStatus = MINUTES_APPROVAL_STATUS.APPROVED;
  this.approvedAt = new Date();
  return this.save();
};

meetingMinutesSchema.methods.addActionItem = function(actionItemId) {
  if (!this.actionItems.includes(actionItemId)) {
    this.actionItems.push(actionItemId);
  }
  return this.save();
};

meetingMinutesSchema.methods.removeActionItem = function(actionItemId) {
  this.actionItems = this.actionItems.filter(id => id.toString() !== actionItemId.toString());
  return this.save();
};

const MeetingMinutes = mongoose.model('MeetingMinutes', meetingMinutesSchema);

export default MeetingMinutes;
