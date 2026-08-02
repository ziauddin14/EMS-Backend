import mongoose from 'mongoose';
import { AUDIT_ACTION, AUDIT_MODULE } from './notification.constants.js';

const auditLogSchema = new mongoose.Schema({
  // Module Information
  module: {
    type: String,
    enum: Object.values(AUDIT_MODULE),
    required: true
  },
  
  // Action Information
  action: {
    type: String,
    enum: Object.values(AUDIT_ACTION),
    required: true
  },
  
  // Entity Information
  entity: {
    type: String,
    required: true
  },
  
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Data Changes
  oldData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  newData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Performed By
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  performedByName: {
    type: String,
    required: true
  },
  
  performedByEmail: {
    type: String,
    required: true
  },
  
  performedByRole: {
    type: String,
    default: null
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
  
  // Changes Summary
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  
  // Impact Assessment
  impact: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  
  // Related Entities
  relatedEntities: [{
    entity: String,
    entityId: mongoose.Schema.Types.ObjectId
  }],
  
  // Status
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success'
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
auditLogSchema.index({ module: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ entityId: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ sessionId: 1 });
auditLogSchema.index({ ipAddress: 1 });
auditLogSchema.index({ status: 1, timestamp: -1 });
auditLogSchema.index({ impact: 1, timestamp: -1 });
auditLogSchema.index({ isDeleted: 1 });

// TTL index for old audit logs (optional - 2 years retention)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

// Virtuals
auditLogSchema.virtual('hasChanges').get(function() {
  return this.changes && this.changes.length > 0;
});

auditLogSchema.virtual('isCreate').get(function() {
  return this.action === AUDIT_ACTION.CREATE || this.action === AUDIT_ACTION.BULK_CREATE;
});

auditLogSchema.virtual('isUpdate').get(function() {
  return this.action === AUDIT_ACTION.UPDATE || this.action === AUDIT_ACTION.BULK_UPDATE;
});

auditLogSchema.virtual('isDelete').get(function() {
  return this.action === AUDIT_ACTION.DELETE || this.action === AUDIT_ACTION.BULK_DELETE;
});

// Methods
auditLogSchema.methods.addChange = function(field, oldValue, newValue) {
  this.changes.push({
    field,
    oldValue,
    newValue
  });
  return this.save();
};

auditLogSchema.methods.addRelatedEntity = function(entity, entityId) {
  this.relatedEntities.push({
    entity,
    entityId
  });
  return this.save();
};

auditLogSchema.methods.setContext = function(key, value) {
  if (!this.context) {
    this.context = new Map();
  }
  this.context.set(key, value);
  return this.save();
};

auditLogSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.error = {
    message: error.message,
    code: error.code,
    stack: error.stack
  };
  return this.save();
};

auditLogSchema.methods.markAsPartial = function() {
  this.status = 'partial';
  return this.save();
};

// Pre-save middleware
auditLogSchema.pre('save', function(next) {
  // Auto-generate changes from oldData and newData if not provided
  if (!this.changes || this.changes.length === 0) {
    if (this.oldData && this.newData) {
      this.changes = this.generateChanges(this.oldData, this.newData);
    }
  }
  next();
});

// Instance method to generate changes
auditLogSchema.methods.generateChanges = function(oldData, newData) {
  const changes = [];
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  
  allKeys.forEach(key => {
    const oldValue = oldData?.[key];
    const newValue = newData?.[key];
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue
      });
    }
  });
  
  return changes;
};

// Static methods
auditLogSchema.statics.getByEntity = function(entity, entityId, limit = 100) {
  return this.find({
    entity,
    entityId,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

auditLogSchema.statics.getByModule = function(module, limit = 100) {
  return this.find({
    module,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

auditLogSchema.statics.getByUser = function(userId, limit = 100) {
  return this.find({
    performedBy: userId,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

auditLogSchema.statics.getByAction = function(action, limit = 100) {
  return this.find({
    action,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

auditLogSchema.statics.getByDateRange = function(startDate, endDate, limit = 100) {
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

auditLogSchema.statics.getBySession = function(sessionId, limit = 100) {
  return this.find({
    sessionId,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

auditLogSchema.statics.getByIpAddress = function(ipAddress, limit = 100) {
  return this.find({
    ipAddress,
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

auditLogSchema.statics.getFailedActions = function(limit = 100) {
  return this.find({
    status: 'failed',
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

auditLogSchema.statics.getHighImpactActions = function(limit = 100) {
  return this.find({
    impact: { $in: ['high', 'critical'] },
    isDeleted: false
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

auditLogSchema.statics.getAuditStatistics = function(startDate, endDate) {
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
        successful: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        partial: {
          $sum: { $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] }
        },
        highImpact: {
          $sum: { $cond: [{ $eq: ['$impact', 'high'] }, 1, 0] }
        },
        criticalImpact: {
          $sum: { $cond: [{ $eq: ['$impact', 'critical'] }, 1, 0] }
        }
      }
    }
  ]);
};

auditLogSchema.statics.getActionBreakdown = function(startDate, endDate) {
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
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

auditLogSchema.statics.getModuleBreakdown = function(startDate, endDate) {
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

auditLogSchema.statics.getUserActivity = function(userId, startDate, endDate) {
  const matchStage = {
    performedBy: userId,
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

// Cleanup old logs
auditLogSchema.statics.cleanupOldLogs = function(retentionDays = 730) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
    isDeleted: false
  });
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
