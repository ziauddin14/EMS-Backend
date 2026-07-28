import mongoose from 'mongoose';
import { ACTION_ITEM_PRIORITY, ACTION_ITEM_STATUS } from './meeting.constants.js';

const actionItemSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // Assignment
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  assignedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    index: true
  },
  
  // Meeting Reference
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    index: true
  },
  minutes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingMinutes',
    index: true
  },
  
  // Timeline
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  completedAt: {
    type: Date
  },
  
  // Priority and Status
  priority: {
    type: String,
    enum: Object.values(ACTION_ITEM_PRIORITY),
    default: ACTION_ITEM_PRIORITY.MEDIUM,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(ACTION_ITEM_STATUS),
    default: ACTION_ITEM_STATUS.NOT_STARTED,
    index: true
  },
  
  // Progress
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Evidence
  evidence: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    uploadedAt: Date
  }],
  
  // Remarks
  remarks: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // Follow-up
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
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
actionItemSchema.index({ assignedEmployee: 1, status: 1, isDeleted: 1 });
actionItemSchema.index({ assignedDepartment: 1, status: 1, isDeleted: 1 });
actionItemSchema.index({ meeting: 1, isDeleted: 1 });
actionItemSchema.index({ minutes: 1, isDeleted: 1 });
actionItemSchema.index({ dueDate: 1, status: 1, isDeleted: 1 });
actionItemSchema.index({ priority: 1, status: 1, isDeleted: 1 });
actionItemSchema.index({ status: 1, isDeleted: 1 });

// Static Methods
actionItemSchema.statics.findByAssignedEmployee = function(employeeId, options = {}) {
  const { filter = {}, sort = { dueDate: 1 }, limit = 100 } = options;
  return this.find({
    assignedEmployee: employeeId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('assignedEmployee', '_id firstName lastName employeeId')
  .populate('assignedDepartment', '_id name')
  .populate('meeting', '_id title startTime endTime')
  .populate('minutes', '_id summary')
  .lean();
};

actionItemSchema.statics.findByAssignedDepartment = function(departmentId, options = {}) {
  const { filter = {}, sort = { dueDate: 1 }, limit = 100 } = options;
  return this.find({
    assignedDepartment: departmentId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('assignedEmployee', '_id firstName lastName employeeId')
  .populate('assignedDepartment', '_id name')
  .populate('meeting', '_id title startTime endTime')
  .lean();
};

actionItemSchema.statics.findByMeeting = function(meetingId, options = {}) {
  const { filter = {}, sort = { priority: -1, dueDate: 1 } } = options;
  return this.find({
    meeting: meetingId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .populate('assignedEmployee', '_id firstName lastName employeeId')
  .populate('assignedDepartment', '_id name')
  .lean();
};

actionItemSchema.statics.findByMinutes = function(minutesId, options = {}) {
  const { filter = {}, sort = { priority: -1, dueDate: 1 } } = options;
  return this.find({
    minutes: minutesId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .populate('assignedEmployee', '_id firstName lastName employeeId')
  .populate('assignedDepartment', '_id name')
  .lean();
};

actionItemSchema.statics.findByStatus = function(status, options = {}) {
  const { filter = {}, sort = { dueDate: 1 }, limit = 100 } = options;
  return this.find({
    status,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('assignedEmployee', '_id firstName lastName employeeId')
  .populate('assignedDepartment', '_id name')
  .populate('meeting', '_id title startTime endTime')
  .lean();
};

actionItemSchema.statics.findByPriority = function(priority, options = {}) {
  const { filter = {}, sort = { dueDate: 1 }, limit = 100 } = options;
  return this.find({
    priority,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('assignedEmployee', '_id firstName lastName employeeId')
  .populate('assignedDepartment', '_id name')
  .populate('meeting', '_id title startTime endTime')
  .lean();
};

actionItemSchema.statics.findOverdue = function(options = {}) {
  const { filter = {}, limit = 100 } = options;
  const today = new Date();
  return this.find({
    dueDate: { $lt: today },
    status: { $ne: ACTION_ITEM_STATUS.COMPLETED },
    isDeleted: false,
    ...filter
  })
  .sort({ dueDate: 1 })
  .limit(limit)
  .populate('assignedEmployee', '_id firstName lastName employeeId')
  .populate('assignedDepartment', '_id name')
  .populate('meeting', '_id title startTime endTime')
  .lean();
};

actionItemSchema.statics.findDueSoon = function(days = 7, options = {}) {
  const { filter = {}, limit = 100 } = options;
  const today = new Date();
  const dueDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return this.find({
    dueDate: { $gte: today, $lte: dueDate },
    status: { $ne: ACTION_ITEM_STATUS.COMPLETED },
    isDeleted: false,
    ...filter
  })
  .sort({ dueDate: 1 })
  .limit(limit)
  .populate('assignedEmployee', '_id firstName lastName employeeId')
  .populate('assignedDepartment', '_id name')
  .populate('meeting', '_id title startTime endTime')
  .lean();
};

actionItemSchema.statics.findByDateRange = function(startDate, endDate, options = {}) {
  const { filter = {}, sort = { dueDate: 1 }, limit = 100 } = options;
  return this.find({
    dueDate: { $gte: startDate, $lte: endDate },
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('assignedEmployee', '_id firstName lastName employeeId')
  .populate('assignedDepartment', '_id name')
  .populate('meeting', '_id title startTime endTime')
  .lean();
};

actionItemSchema.statics.getDepartmentActionItemStats = function(departmentId) {
  return this.aggregate([
    {
      $match: {
        assignedDepartment: departmentId,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        averageCompletion: { $avg: '$completionPercentage' }
      }
    }
  ]);
};

actionItemSchema.statics.getEmployeeActionItemStats = function(employeeId) {
  return this.aggregate([
    {
      $match: {
        assignedEmployee: employeeId,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        averageCompletion: { $avg: '$completionPercentage' }
      }
    }
  ]);
};

// Instance Methods
actionItemSchema.methods.start = function() {
  this.status = ACTION_ITEM_STATUS.IN_PROGRESS;
  return this.save();
};

actionItemSchema.methods.updateProgress = function(percentage) {
  this.completionPercentage = Math.min(100, Math.max(0, percentage));
  
  if (this.completionPercentage === 100) {
    this.status = ACTION_ITEM_STATUS.COMPLETED;
    this.completedAt = new Date();
  } else if (this.completionPercentage > 0 && this.status === ACTION_ITEM_STATUS.NOT_STARTED) {
    this.status = ACTION_ITEM_STATUS.IN_PROGRESS;
  }
  
  return this.save();
};

actionItemSchema.methods.complete = function() {
  this.status = ACTION_ITEM_STATUS.COMPLETED;
  this.completionPercentage = 100;
  this.completedAt = new Date();
  return this.save();
};

actionItemSchema.methods.close = function() {
  this.status = ACTION_ITEM_STATUS.COMPLETED;
  this.completedAt = new Date();
  return this.save();
};

actionItemSchema.methods.putOnHold = function(reason) {
  this.status = ACTION_ITEM_STATUS.ON_HOLD;
  this.remarks = reason || this.remarks;
  return this.save();
};

actionItemSchema.methods.cancel = function(reason) {
  this.status = ACTION_ITEM_STATUS.CANCELLED;
  this.remarks = reason || this.remarks;
  return this.save();
};

actionItemSchema.methods.markOverdue = function() {
  const today = new Date();
  if (this.dueDate < today && this.status !== ACTION_ITEM_STATUS.COMPLETED) {
    this.status = ACTION_ITEM_STATUS.OVERDUE;
  }
  return this.save();
};

actionItemSchema.methods.addEvidence = function(evidence) {
  this.evidence.push(evidence);
  return this.save();
};

actionItemSchema.methods.removeEvidence = function(evidenceId) {
  this.evidence = this.evidence.filter(e => e._id.toString() !== evidenceId.toString());
  return this.save();
};

actionItemSchema.methods.setFollowUp = function(followUpDate, notes) {
  this.followUpDate = followUpDate;
  this.followUpNotes = notes;
  return this.save();
};

const ActionItem = mongoose.model('ActionItem', actionItemSchema);

export default ActionItem;
