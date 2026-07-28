import mongoose from 'mongoose';
import { GOAL_TYPE, GOAL_PRIORITY, GOAL_STATUS, APPROVAL_STATUS, COLLECTION_NAME } from './kpi.constants.js';

const goalSchema = new mongoose.Schema(
  {
    goalNumber: {
      type: String,
      required: [true, 'Goal number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Goal number cannot exceed 20 characters'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [300, 'Goal title cannot exceed 300 characters'],
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: null
    },
    type: {
      type: String,
      enum: Object.values(GOAL_TYPE),
      required: [true, 'Goal type is required'],
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Goal owner is required'],
      index: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    priority: {
      type: String,
      enum: Object.values(GOAL_PRIORITY),
      default: GOAL_PRIORITY.MEDIUM,
      index: true
    },
    weightage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: 0
    },
    currentValue: {
      type: Number,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      trim: true,
      maxlength: [50, 'Unit cannot exceed 50 characters'],
      default: null
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true
    },
    status: {
      type: String,
      enum: Object.values(GOAL_STATUS),
      default: GOAL_STATUS.NOT_STARTED,
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
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Rejection reason cannot exceed 1000 characters'],
      default: null
    },
    keyResults: [{
      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Key result description cannot exceed 500 characters']
      },
      targetValue: {
        type: Number,
        required: true,
        min: 0
      },
      currentValue: {
        type: Number,
        default: 0,
        min: 0
      },
      unit: {
        type: String,
        trim: true,
        maxlength: [50, 'Unit cannot exceed 50 characters'],
        default: null
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
    milestones: [{
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Milestone title cannot exceed 200 characters']
      },
      description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Milestone description cannot exceed 1000 characters'],
        default: null
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
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    }],
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters']
    }],
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
      default: null,
      index: true
    },
    alignment: {
      type: String,
      trim: true,
      maxlength: [200, 'Alignment cannot exceed 200 characters'],
      default: null
    },
    successCriteria: {
      type: String,
      trim: true,
      maxlength: [2000, 'Success criteria cannot exceed 2000 characters'],
      default: null
    },
    challenges: [{
      type: String,
      trim: true,
      maxlength: [500, 'Challenge cannot exceed 500 characters']
    }],
    supportNeeded: {
      type: String,
      trim: true,
      maxlength: [1000, 'Support needed cannot exceed 1000 characters'],
      default: null
    },
    progressNotes: [{
      note: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Progress note cannot exceed 1000 characters']
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
    parentGoal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null
    },
    subGoals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    }],
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
    collection: COLLECTION_NAME.GOAL
  }
);

// Compound indexes for performance optimization
goalSchema.index({ owner: 1, year: 1, isDeleted: 1 });
goalSchema.index({ owner: 1, status: 1, isDeleted: 1 });
goalSchema.index({ owner: 1, dueDate: 1, isDeleted: 1 });
goalSchema.index({ department: 1, status: 1, isDeleted: 1 });
goalSchema.index({ department: 1, type: 1, isDeleted: 1 });
goalSchema.index({ reviewer: 1, status: 1, isDeleted: 1 });
goalSchema.index({ reportingManager: 1, status: 1, isDeleted: 1 });
goalSchema.index({ project: 1, status: 1, isDeleted: 1 });
goalSchema.index({ type: 1, status: 1, isDeleted: 1 });
goalSchema.index({ priority: 1, status: 1, isDeleted: 1 });
goalSchema.index({ status: 1, approvalStatus: 1, isDeleted: 1 });
goalSchema.index({ startDate: 1, dueDate: 1, isDeleted: 1 });
goalSchema.index({ dueDate: 1, status: 1, isDeleted: 1 });
goalSchema.index({ createdAt: 1, status: 1, isDeleted: 1 });
goalSchema.index({ parentGoal: 1, isDeleted: 1 });
goalSchema.index({ tags: 1, isDeleted: 1 });
goalSchema.index({ category: 1, isDeleted: 1 });

// Static methods
goalSchema.statics.findByOwner = function(ownerId, options = {}) {
  const { status, type, year, priority } = options;
  const filter = { owner: ownerId, isDeleted: false };
  
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    filter.startDate = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(filter).sort({ dueDate: 1 });
};

goalSchema.statics.findByDepartment = function(departmentId, options = {}) {
  const { status, type, year } = options;
  const filter = { department: departmentId, isDeleted: false };
  
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    filter.startDate = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(filter).sort({ dueDate: 1 });
};

goalSchema.statics.findByReviewer = function(reviewerId, options = {}) {
  const { status, approvalStatus } = options;
  const filter = { reviewer: reviewerId, isDeleted: false };
  
  if (status) filter.status = status;
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  
  return this.find(filter).sort({ dueDate: 1 });
};

goalSchema.statics.findByProject = function(projectId, options = {}) {
  const { status } = options;
  const filter = { project: projectId, isDeleted: false };
  
  if (status) filter.status = status;
  
  return this.find(filter).sort({ dueDate: 1 });
};

goalSchema.statics.findByType = function(type, options = {}) {
  const { status, department } = options;
  const filter = { type, isDeleted: false };
  
  if (status) filter.status = status;
  if (department) filter.department = department;
  
  return this.find(filter).sort({ dueDate: 1 });
};

goalSchema.statics.findByStatus = function(status, options = {}) {
  const { department, owner, priority } = options;
  const filter = { status, isDeleted: false };
  
  if (department) filter.department = department;
  if (owner) filter.owner = owner;
  if (priority) filter.priority = priority;
  
  return this.find(filter).sort({ dueDate: 1 });
};

goalSchema.statics.findOverdue = function(options = {}) {
  const { department, owner } = options;
  const filter = {
    dueDate: { $lt: new Date() },
    status: { $nin: [GOAL_STATUS.COMPLETED, GOAL_STATUS.CANCELLED] },
    isDeleted: false
  };
  
  if (department) filter.department = department;
  if (owner) filter.owner = owner;
  
  return this.find(filter).sort({ dueDate: 1 });
};

goalSchema.statics.findDueSoon = function(days = 7, options = {}) {
  const { department, owner } = options;
  const date = new Date();
  date.setDate(date.getDate() + days);
  
  const filter = {
    dueDate: { $gte: new Date(), $lte: date },
    status: { $nin: [GOAL_STATUS.COMPLETED, GOAL_STATUS.CANCELLED] },
    isDeleted: false
  };
  
  if (department) filter.department = department;
  if (owner) filter.owner = owner;
  
  return this.find(filter).sort({ dueDate: 1 });
};

goalSchema.statics.findByParent = function(parentGoalId) {
  return this.find({ parentGoal: parentGoalId, isDeleted: false }).sort({ dueDate: 1 });
};

goalSchema.statics.getDepartmentGoalSummary = function(departmentId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        department: departmentId,
        startDate: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalWeightage: { $sum: '$weightage' },
        avgCompletion: { $avg: '$completionPercentage' }
      }
    }
  ]);
};

goalSchema.statics.getOwnerGoalSummary = function(ownerId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        owner: ownerId,
        startDate: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalWeightage: { $sum: '$weightage' },
        avgCompletion: { $avg: '$completionPercentage' }
      }
    }
  ]);
};

// Instance methods
goalSchema.methods.updateProgress = function(currentValue) {
  this.currentValue = currentValue;
  this.completionPercentage = Math.min(100, (currentValue / this.targetValue) * 100);
  this.completionPercentage = Math.round(this.completionPercentage * 100) / 100;
  
  if (this.completionPercentage >= 100 && this.status !== GOAL_STATUS.COMPLETED) {
    this.status = GOAL_STATUS.COMPLETED;
  } else if (this.completionPercentage > 0 && this.status === GOAL_STATUS.NOT_STARTED) {
    this.status = GOAL_STATUS.IN_PROGRESS;
  }
  
  return this.save();
};

goalSchema.methods.complete = function() {
  this.status = GOAL_STATUS.COMPLETED;
  this.completionPercentage = 100;
  this.currentValue = this.targetValue;
  return this.save();
};

goalSchema.methods.cancel = function(reason) {
  this.status = GOAL_STATUS.CANCELLED;
  this.rejectionReason = reason;
  return this.save();
};

goalSchema.methods.approve = function(approverId) {
  this.approvalStatus = APPROVAL_STATUS.APPROVED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  return this.save();
};

goalSchema.methods.reject = function(approverId, reason) {
  this.approvalStatus = APPROVAL_STATUS.REJECTED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

goalSchema.methods.addKeyResult = function(keyResultData) {
  this.keyResults.push(keyResultData);
  return this.save();
};

goalSchema.methods.updateKeyResult = function(keyResultId, updateData) {
  const keyResult = this.keyResults.id(keyResultId);
  if (keyResult) {
    Object.assign(keyResult, updateData);
    return this.save();
  }
  throw new Error('Key result not found');
};

goalSchema.methods.addMilestone = function(milestoneData) {
  this.milestones.push(milestoneData);
  return this.save();
};

goalSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.completed = true;
    milestone.completedAt = new Date();
    return this.save();
  }
  throw new Error('Milestone not found');
};

goalSchema.methods.addProgressNote = function(note, addedBy) {
  this.progressNotes.push({
    note,
    addedBy,
    addedAt: new Date()
  });
  return this.save();
};

goalSchema.methods.addDependency = function(goalId) {
  if (!this.dependencies.includes(goalId)) {
    this.dependencies.push(goalId);
  }
  return this.save();
};

goalSchema.methods.removeDependency = function(goalId) {
  this.dependencies = this.dependencies.filter(id => id.toString() !== goalId.toString());
  return this.save();
};

goalSchema.methods.addSubGoal = function(goalId) {
  if (!this.subGoals.includes(goalId)) {
    this.subGoals.push(goalId);
  }
  return this.save();
};

goalSchema.methods.removeSubGoal = function(goalId) {
  this.subGoals = this.subGoals.filter(id => id.toString() !== goalId.toString());
  return this.save();
};

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
