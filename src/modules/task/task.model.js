import mongoose from 'mongoose';
import { TASK_STATUS, TASK_PRIORITY, TASK_CATEGORY, RECURRING_TYPE, COLLECTION_NAME } from './task.constants.js';

const taskSchema = new mongoose.Schema(
  {
    taskNumber: {
      type: String,
      required: [true, 'Task number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Task number cannot exceed 20 characters'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [300, 'Task title cannot exceed 300 characters'],
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: null
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
      index: true
    },
    category: {
      type: String,
      enum: Object.values(TASK_CATEGORY),
      default: TASK_CATEGORY.DEVELOPMENT,
      index: true
    },
    labels: [{
      type: String,
      trim: true,
      maxlength: [50, 'Label cannot exceed 50 characters']
    }],
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, 'Estimated hours cannot be negative']
    },
    spentHours: {
      type: Number,
      default: 0,
      min: [0, 'Spent hours cannot be negative']
    },
    startDate: {
      type: Date,
      default: null,
      index: true
    },
    dueDate: {
      type: Date,
      default: null,
      index: true
    },
    completedAt: {
      type: Date,
      default: null
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot exceed 100']
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true
    },
    subTasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileSize: Number,
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    commentsCount: {
      type: Number,
      default: 0
    },
    checklistCount: {
      type: Number,
      default: 0
    },
    workLogCount: {
      type: Number,
      default: 0
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringType: {
      type: String,
      enum: Object.values(RECURRING_TYPE),
      default: null
    },
    isOverdue: {
      type: Boolean,
      default: false,
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

taskSchema.index({ taskNumber: 1, isDeleted: 1 }, { unique: true, sparse: true });
taskSchema.index({ title: 1, isDeleted: 1 });
taskSchema.index({ project: 1, status: 1, isDeleted: 1 });
taskSchema.index({ assignedTo: 1, status: 1, isDeleted: 1 });
taskSchema.index({ department: 1, status: 1, isDeleted: 1 });
taskSchema.index({ status: 1, priority: 1, isDeleted: 1 });
taskSchema.index({ dueDate: 1, status: 1, isDeleted: 1 });
taskSchema.index({ parentTask: 1, isDeleted: 1 });
taskSchema.index({ isDeleted: 1, isActive: 1 });
taskSchema.index({ isOverdue: 1, isDeleted: 1 });

taskSchema.virtual('isCompleted').get(function() {
  return this.status === TASK_STATUS.COMPLETED;
});

taskSchema.virtual('isInProgress').get(function() {
  return this.status === TASK_STATUS.IN_PROGRESS;
});

taskSchema.virtual('isBlocked').get(function() {
  return this.status === TASK_STATUS.BLOCKED;
});

taskSchema.virtual('isOverdueCalculated').get(function() {
  if (this.status === TASK_STATUS.COMPLETED || this.status === TASK_STATUS.CANCELLED) {
    return false;
  }
  if (!this.dueDate) {
    return false;
  }
  return new Date() > this.dueDate;
});

taskSchema.virtual('remainingHours').get(function() {
  return Math.max(0, this.estimatedHours - this.spentHours);
});

taskSchema.virtual('hasSubTasks').get(function() {
  return this.subTasks && this.subTasks.length > 0;
});

taskSchema.virtual('hasDependencies').get(function() {
  return this.dependencies && this.dependencies.length > 0;
});

taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === TASK_STATUS.COMPLETED) {
    this.completedAt = new Date();
    this.completionPercentage = 100;
  }
  
  if (this.isModified('dueDate') || this.isModified('status')) {
    this.isOverdue = this.isOverdueCalculated;
  }
  
  next();
});

taskSchema.statics.findActive = function() {
  return this.find({ isActive: true, isDeleted: false });
};

taskSchema.statics.findArchived = function() {
  return this.find({ isArchived: true, isDeleted: false });
};

taskSchema.statics.findByProject = function(projectId) {
  return this.find({ project: projectId, isDeleted: false });
};

taskSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ assignedTo: employeeId, isDeleted: false });
};

taskSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, isDeleted: false });
};

taskSchema.statics.findByStatus = function(status) {
  return this.find({ status: status, isDeleted: false });
};

taskSchema.statics.findByPriority = function(priority) {
  return this.find({ priority: priority, isDeleted: false });
};

taskSchema.statics.findByCategory = function(category) {
  return this.find({ category: category, isDeleted: false });
};

taskSchema.statics.findOverdue = function() {
  return this.find({
    isDeleted: false,
    isActive: true,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });
};

taskSchema.statics.findDueSoon = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return this.find({
    isDeleted: false,
    isActive: true,
    dueDate: { $gte: new Date(), $lte: date },
    status: { $nin: ['completed', 'cancelled'] }
  });
};

taskSchema.statics.findByParent = function(parentTaskId) {
  return this.find({ parentTask: parentTaskId, isDeleted: false });
};

taskSchema.methods.addSubTask = function(taskId) {
  if (!this.subTasks.includes(taskId)) {
    this.subTasks.push(taskId);
  }
  return this.save();
};

taskSchema.methods.removeSubTask = function(taskId) {
  this.subTasks = this.subTasks.filter(id => id.toString() !== taskId.toString());
  return this.save();
};

taskSchema.methods.addDependency = function(taskId) {
  if (!this.dependencies.includes(taskId)) {
    this.dependencies.push(taskId);
  }
  return this.save();
};

taskSchema.methods.removeDependency = function(taskId) {
  this.dependencies = this.dependencies.filter(id => id.toString() !== taskId.toString());
  return this.save();
};

taskSchema.methods.archive = function() {
  this.isArchived = true;
  this.isActive = false;
  return this.save();
};

taskSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.isActive = true;
  return this.save();
};

taskSchema.methods.updateProgress = function(percentage) {
  this.completionPercentage = Math.min(100, Math.max(0, percentage));
  if (this.completionPercentage === 100 && this.status !== TASK_STATUS.COMPLETED) {
    this.status = TASK_STATUS.REVIEW;
  }
  return this.save();
};

taskSchema.methods.updateSpentHours = function(hours) {
  this.spentHours += hours;
  if (this.estimatedHours > 0) {
    this.completionPercentage = Math.min(100, (this.spentHours / this.estimatedHours) * 100);
  }
  return this.save();
};

// Optimized compound indexes for analytics and dashboard queries
taskSchema.index({ assignedTo: 1, status: 1, isDeleted: 1 });
taskSchema.index({ assignedTo: 1, dueDate: 1, isDeleted: 1 });
taskSchema.index({ project: 1, status: 1, isDeleted: 1 });
taskSchema.index({ project: 1, priority: 1, isDeleted: 1 });
taskSchema.index({ department: 1, status: 1, isDeleted: 1 });
taskSchema.index({ status: 1, priority: 1, isDeleted: 1 });
taskSchema.index({ category: 1, status: 1, isDeleted: 1 });
taskSchema.index({ createdAt: 1, status: 1, isDeleted: 1 });
taskSchema.index({ completedAt: 1, isDeleted: 1 });
taskSchema.index({ dueDate: 1, status: 1, isDeleted: 1, isArchived: 1 });
taskSchema.index({ assignedTo: 1, createdAt: 1, isDeleted: 1 });
taskSchema.index({ project: 1, createdAt: 1, isDeleted: 1 });
taskSchema.index({ department: 1, createdAt: 1, isDeleted: 1 });
taskSchema.index({ assignedTo: 1, project: 1, isDeleted: 1 });
taskSchema.index({ labels: 1, isDeleted: 1 });
taskSchema.index({ title: 'text', description: 'text', taskNumber: 'text' });
taskSchema.index({ reviewer: 1, status: 1, isDeleted: 1 });
taskSchema.index({ parentTask: 1, isDeleted: 1 });
taskSchema.index({ dependencies: 1, isDeleted: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
