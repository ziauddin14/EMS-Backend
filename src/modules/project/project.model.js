import mongoose from 'mongoose';
import { PROJECT_STATUS, PROJECT_PRIORITY, COLLECTION_NAME } from './project.constants.js';

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      required: [true, 'Project code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Project code cannot exceed 20 characters'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
      index: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Project manager is required'],
      index: true
    },
    teamLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }],
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }],
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNING,
      index: true
    },
    priority: {
      type: String,
      enum: Object.values(PROJECT_PRIORITY),
      default: PROJECT_PRIORITY.MEDIUM,
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    expectedEndDate: {
      type: Date,
      required: [true, 'Expected end date is required'],
      index: true
    },
    actualEndDate: {
      type: Date,
      default: null,
      index: true
    },
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
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100']
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative']
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters']
    }],
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileSize: Number,
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    color: {
      type: String,
      default: '#3B82F6',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Invalid color format']
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

projectSchema.index({ projectCode: 1, isDeleted: 1 }, { unique: true, sparse: true });
projectSchema.index({ name: 1, isDeleted: 1 });
projectSchema.index({ department: 1, status: 1, isDeleted: 1 });
projectSchema.index({ projectManager: 1, isDeleted: 1 });
projectSchema.index({ status: 1, priority: 1, isDeleted: 1 });
projectSchema.index({ startDate: 1, expectedEndDate: 1, isDeleted: 1 });
projectSchema.index({ isDeleted: 1, isActive: 1 });

projectSchema.virtual('isOverdue').get(function() {
  if (this.status === PROJECT_STATUS.COMPLETED || this.status === PROJECT_STATUS.CANCELLED) {
    return false;
  }
  return new Date() > this.expectedEndDate;
});

projectSchema.virtual('isOnTrack').get(function() {
  if (this.status === PROJECT_STATUS.COMPLETED) {
    return true;
  }
  if (this.status === PROJECT_STATUS.CANCELLED || this.status === PROJECT_STATUS.ON_HOLD) {
    return false;
  }
  const today = new Date();
  const totalDuration = this.expectedEndDate - this.startDate;
  const elapsed = today - this.startDate;
  const expectedProgress = (elapsed / totalDuration) * 100;
  return this.progress >= expectedProgress;
});

projectSchema.virtual('remainingHours').get(function() {
  return Math.max(0, this.estimatedHours - this.spentHours);
});

projectSchema.virtual('budgetUtilization').get(function() {
  if (this.budget === 0) return 0;
  return ((this.spentHours / this.estimatedHours) * 100).toFixed(2);
});

projectSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === PROJECT_STATUS.COMPLETED) {
    this.actualEndDate = new Date();
    this.progress = 100;
  }
  next();
});

projectSchema.statics.findActive = function() {
  return this.find({ isActive: true, isDeleted: false });
};

projectSchema.statics.findArchived = function() {
  return this.find({ isArchived: true, isDeleted: false });
};

projectSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, isDeleted: false });
};

projectSchema.statics.findByProjectManager = function(managerId) {
  return this.find({ projectManager: managerId, isDeleted: false });
};

projectSchema.statics.findByMember = function(employeeId) {
  return this.find({ members: employeeId, isDeleted: false });
};

projectSchema.statics.findByStatus = function(status) {
  return this.find({ status: status, isDeleted: false });
};

projectSchema.statics.findByPriority = function(priority) {
  return this.find({ priority: priority, isDeleted: false });
};

projectSchema.methods.addMember = function(employeeId) {
  if (!this.members.includes(employeeId)) {
    this.members.push(employeeId);
  }
  return this.save();
};

projectSchema.methods.removeMember = function(employeeId) {
  this.members = this.members.filter(id => id.toString() !== employeeId.toString());
  return this.save();
};

projectSchema.methods.addTeamLead = function(employeeId) {
  if (!this.teamLeads.includes(employeeId)) {
    this.teamLeads.push(employeeId);
  }
  return this.save();
};

projectSchema.methods.removeTeamLead = function(employeeId) {
  this.teamLeads = this.teamLeads.filter(id => id.toString() !== employeeId.toString());
  return this.save();
};

projectSchema.methods.archive = function() {
  this.isArchived = true;
  this.isActive = false;
  return this.save();
};

projectSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.isActive = true;
  return this.save();
};

projectSchema.methods.calculateProgress = function() {
  return this.progress;
};

projectSchema.methods.updateSpentHours = function(hours) {
  this.spentHours += hours;
  if (this.estimatedHours > 0) {
    this.progress = Math.min(100, (this.spentHours / this.estimatedHours) * 100);
  }
  return this.save();
};

// Optimized compound indexes for analytics and dashboard queries
projectSchema.index({ projectManager: 1, status: 1, isDeleted: 1 });
projectSchema.index({ department: 1, status: 1, isDeleted: 1 });
projectSchema.index({ status: 1, priority: 1, isDeleted: 1 });
projectSchema.index({ createdAt: 1, status: 1, isDeleted: 1 });
projectSchema.index({ startDate: 1, endDate: 1, isDeleted: 1 });
projectSchema.index({ teamLeads: 1, isDeleted: 1 });
projectSchema.index({ members: 1, isDeleted: 1 });
projectSchema.index({ name: 'text', projectCode: 'text', description: 'text' });
projectSchema.index({ projectManager: 1, createdAt: 1, isDeleted: 1 });
projectSchema.index({ department: 1, createdAt: 1, isDeleted: 1 });
projectSchema.index({ status: 1, progress: 1, isDeleted: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
