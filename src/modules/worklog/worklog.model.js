import mongoose from 'mongoose';
import { ACTIVITY_TYPE } from '../task/task.constants.js';

const COLLECTION_NAME = 'worklogs';

const worklogSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
      index: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task is required'],
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true
    },
    workDate: {
      type: Date,
      required: [true, 'Work date is required'],
      index: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      index: true
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null
    },
    activityType: {
      type: String,
      enum: Object.values(ACTIVITY_TYPE),
      default: ACTIVITY_TYPE.DEVELOPMENT,
      index: true
    },
    billable: {
      type: Boolean,
      default: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileSize: Number,
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
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

worklogSchema.index({ employee: 1, workDate: 1, isDeleted: 1 });
worklogSchema.index({ task: 1, workDate: 1, isDeleted: 1 });
worklogSchema.index({ project: 1, workDate: 1, isDeleted: 1 });
worklogSchema.index({ workDate: 1, status: 1, isDeleted: 1 });
worklogSchema.index({ employee: 1, status: 1, isDeleted: 1 });
worklogSchema.index({ billable: 1, isDeleted: 1 });
worklogSchema.index({ isDeleted: 1, workDate: -1 });

worklogSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const duration = (new Date(this.endTime) - new Date(this.startTime)) / (1000 * 60);
    this.duration = Math.max(0, duration);
  }
  next();
});

worklogSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ employee: employeeId, isDeleted: false });
};

worklogSchema.statics.findByTask = function(taskId) {
  return this.find({ task: taskId, isDeleted: false });
};

worklogSchema.statics.findByProject = function(projectId) {
  return this.find({ project: projectId, isDeleted: false });
};

worklogSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    workDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    isDeleted: false
  });
};

worklogSchema.statics.findByEmployeeAndDateRange = function(employeeId, startDate, endDate) {
  return this.find({
    employee: employeeId,
    workDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    isDeleted: false
  });
};

worklogSchema.statics.findByStatus = function(status) {
  return this.find({ status: status, isDeleted: false });
};

worklogSchema.statics.findByBillable = function(billable) {
  return this.find({ billable: billable, isDeleted: false });
};

// Optimized compound indexes for analytics and dashboard queries
worklogSchema.index({ employee: 1, workDate: 1, isDeleted: 1 });
worklogSchema.index({ task: 1, workDate: 1, isDeleted: 1 });
worklogSchema.index({ project: 1, workDate: 1, isDeleted: 1 });
worklogSchema.index({ employee: 1, billable: 1, isDeleted: 1 });
worklogSchema.index({ workDate: 1, billable: 1, isDeleted: 1 });
worklogSchema.index({ employee: 1, activityType: 1, isDeleted: 1 });
worklogSchema.index({ startTime: 1, endTime: 1, isDeleted: 1 });
worklogSchema.index({ createdAt: 1, workDate: 1, isDeleted: 1 });
worklogSchema.index({ employee: 1, createdAt: 1, isDeleted: 1 });
worklogSchema.index({ project: 1, createdAt: 1, isDeleted: 1 });

const WorkLog = mongoose.model('WorkLog', worklogSchema);

export default WorkLog;
