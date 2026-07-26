import mongoose from 'mongoose';

const COLLECTION_NAME = 'activityTimelines';

const activityTimelineSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: ['task', 'project', 'checklist', 'comment', 'worklog'],
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
      index: true
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'create',
        'update',
        'delete',
        'restore',
        'archive',
        'unarchive',
        'assign',
        'reassign',
        'status_change',
        'priority_change',
        'add_dependency',
        'remove_dependency',
        'add_subtask',
        'remove_subtask',
        'add_checklist',
        'update_checklist',
        'delete_checklist',
        'add_comment',
        'update_comment',
        'delete_comment',
        'start_work',
        'stop_work',
        'add_attachment',
        'remove_attachment'
      ],
      index: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performed by is required'],
      index: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    fieldChanged: {
      type: String,
      default: null
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null
    },
    userAgent: {
      type: String,
      trim: true,
      default: null
    },
    device: {
      type: String,
      trim: true,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

activityTimelineSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activityTimelineSchema.index({ performedBy: 1, createdAt: -1 });
activityTimelineSchema.index({ action: 1, createdAt: -1 });
activityTimelineSchema.index({ createdAt: -1 });

activityTimelineSchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({ entityType, entityId })
    .populate('performedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

activityTimelineSchema.statics.findByTask = function(taskId) {
  return this.find({ entityType: 'task', entityId: taskId })
    .populate('performedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

activityTimelineSchema.statics.findByProject = function(projectId) {
  return this.find({ entityType: 'project', entityId: projectId })
    .populate('performedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

activityTimelineSchema.statics.findByUser = function(userId) {
  return this.find({ performedBy: userId })
    .populate('performedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

activityTimelineSchema.statics.createActivity = function(activityData) {
  return this.create(activityData);
};

const ActivityTimeline = mongoose.model('ActivityTimeline', activityTimelineSchema);

export default ActivityTimeline;
