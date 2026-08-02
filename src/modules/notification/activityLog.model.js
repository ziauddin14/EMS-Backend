import mongoose from 'mongoose';
import { ACTIVITY_TYPE, ACTIVITY_MODULE } from './notification.constants.js';

const activityLogSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  userName: {
    type: String,
    required: true
  },
  
  userEmail: {
    type: String,
    required: true
  },
  
  userRole: {
    type: String,
    default: null
  },
  
  // Activity Information
  type: {
    type: String,
    enum: Object.values(ACTIVITY_TYPE),
    required: true
  },
  
  module: {
    type: String,
    enum: Object.values(ACTIVITY_MODULE),
    required: true
  },
  
  // Activity Details
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    maxlength: 1000
  },
  
  // Entity Reference
  entity: {
    type: String,
    default: null
  },
  
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  // Activity Data
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Request Information
  ipAddress: {
    type: String,
    default: null
  },
  
  userAgent: {
    type: String,
    default: null
  },
  
  // Device Information
  device: {
    type: {
      type: String,
      default: null
    },
    browser: {
      type: String,
      default: null
    },
    os: {
      type: String,
      default: null
    },
    osVersion: {
      type: String,
      default: null
    }
  },
  
  // Location Information
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
    timezone: String
  },
  
  // Session Information
  sessionId: {
    type: String,
    default: null
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Additional Context
  context: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Related Activities
  relatedActivities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityLog'
  }],
  
  // Tags
  tags: [String],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'cancelled'],
    default: 'active'
  },
  
  // Duration (for activities that take time)
  duration: {
    type: Number,
    default: null
  },
  
  // Result
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Error Information
  error: {
    message: String,
    code: String,
    stack: String
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date,
    default: null
  },
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ type: 1, timestamp: -1 });
activityLogSchema.index({ module: 1, timestamp: -1 });
activityLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ sessionId: 1 });
activityLogSchema.index({ ipAddress: 1 });
activityLogSchema.index({ status: 1, timestamp: -1 });
activityLogSchema.index({ tags: 1 });
activityLogSchema.index({ isDeleted: 1 });

// TTL index for old activity logs (optional - 1 year retention)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Virtuals
activityLogSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

activityLogSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

activityLogSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

activityLogSchema.virtual('isAuthenticationActivity').get(function() {
  return this.type === ACTIVITY_TYPE.LOGIN || this.type === ACTIVITY_TYPE.LOGOUT;
});

// Methods
activityLogSchema.methods.addRelatedActivity = function(activityId) {
  this.relatedActivities.push(activityId);
  return this.save();
};

activityLogSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

activityLogSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

activityLogSchema.methods.setContext = function(key, value) {
  if (!this.context) {
    this.context = new Map();
  }
  this.context.set(key, value);
  return this.save();
};

activityLogSchema.methods.complete = function(result) {
  this.status = 'completed';
  this.result = result;
  if (this.timestamp) {
    this.duration = Date.now() - this.timestamp.getTime();
  }
  return this.save();
};

activityLogSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.error = {
    message: error.message,
    code: error.code,
    stack: error.stack
  };
  if (this.timestamp) {
    this.duration = Date.now() - this.timestamp.getTime();
  }
  return this.save();
};

activityLogSchema.methods.cancel = function() {
  this.status = 'cancelled';
  if (this.timestamp) {
    this.duration = Date.now() - this.timestamp.getTime();
  }
  return this.save();
};

// Pre-save middleware
activityLogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
activityLogSchema.statics.getByUser = function(userId, limit = 100) {
  return this.find({
    user: userId,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getByType = function(type, limit = 100) {
  return this.find({
    type,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getByModule = function(module, limit = 100) {
  return this.find({
    module,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getByEntity = function(entity, entityId, limit = 100) {
  return this.find({
    entity,
    entityId,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getByDateRange = function(startDate, endDate, limit = 100) {
  return this.find({
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getBySession = function(sessionId, limit = 100) {
  return this.find({
    sessionId,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getByTag = function(tag, limit = 100) {
  return this.find({
    tags: tag,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getLoginActivities = function(userId, limit = 50) {
  return this.find({
    user: userId,
    type: ACTIVITY_TYPE.LOGIN,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getLogoutActivities = function(userId, limit = 50) {
  return this.find({
    user: userId,
    type: ACTIVITY_TYPE.LOGOUT,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getFailedActivities = function(limit = 100) {
  return this.find({
    status: 'failed',
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

activityLogSchema.statics.getActivityStatistics = function(startDate, endDate) {
  const matchStage = {
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
};

activityLogSchema.statics.getTypeBreakdown = function(startDate, endDate) {
  const matchStage = {
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

activityLogSchema.statics.getModuleBreakdown = function(startDate, endDate) {
  const matchStage = {
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$module',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

activityLogSchema.statics.getUserActivityTimeline = function(userId, startDate, endDate) {
  const matchStage = {
    user: userId,
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.find(matchStage)
    .sort({ timestamp: -1 })
    .lean();
};

activityLogSchema.statics.getActiveSessions = function() {
  const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
  
  return this.find({
    type: ACTIVITY_TYPE.LOGIN,
    timestamp: { $gte: cutoffTime },
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .lean();
};

activityLogSchema.statics.getUserLoginHistory = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    user: userId,
    type: ACTIVITY_TYPE.LOGIN,
    timestamp: { $gte: startDate },
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .lean();
};

// Cleanup old logs
activityLogSchema.statics.cleanupOldLogs = function(retentionDays = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
    isDeleted: false
  });
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
