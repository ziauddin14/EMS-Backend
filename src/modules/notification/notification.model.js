import mongoose from 'mongoose';
import { NOTIFICATION_TYPE, NOTIFICATION_PRIORITY, NOTIFICATION_CATEGORY, NOTIFICATION_CHANNEL, NOTIFICATION_STATUS, READ_STATUS, REFERENCE_TYPE } from './notification.constants.js';

const notificationSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 5000,
    trim: true
  },
  
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPE),
    default: NOTIFICATION_TYPE.INFO
  },
  
  priority: {
    type: String,
    enum: Object.values(NOTIFICATION_PRIORITY),
    default: NOTIFICATION_PRIORITY.NORMAL
  },
  
  category: {
    type: String,
    enum: Object.values(NOTIFICATION_CATEGORY),
    required: true
  },
  
  // Sender Information
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  senderName: {
    type: String,
    trim: true
  },
  
  // Recipient Information
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  recipientName: {
    type: String,
    required: true
  },
  
  recipientEmail: {
    type: String,
    required: true
  },
  
  // Organizational Context
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    default: null
  },
  
  // Reference Information
  module: {
    type: String,
    required: true,
    trim: true
  },
  
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  referenceType: {
    type: String,
    enum: Object.values(REFERENCE_TYPE),
    default: null
  },
  
  // Read Status
  readStatus: {
    type: String,
    enum: Object.values(READ_STATUS),
    default: READ_STATUS.UNREAD
  },
  
  readAt: {
    type: Date,
    default: null
  },
  
  // Delivery Status
  status: {
    type: String,
    enum: Object.values(NOTIFICATION_STATUS),
    default: NOTIFICATION_STATUS.PENDING
  },
  
  delivered: {
    type: Boolean,
    default: false
  },
  
  deliveredAt: {
    type: Date,
    default: null
  },
  
  // Scheduling
  scheduledAt: {
    type: Date,
    default: null
  },
  
  expiredAt: {
    type: Date,
    default: null
  },
  
  // Channels
  channels: [{
    type: String,
    enum: Object.values(NOTIFICATION_CHANNEL)
  }],
  
  // Attachments
  attachments: [{
    name: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Template
  template: {
    type: String,
    default: null
  },
  
  // Retry Information
  retryCount: {
    type: Number,
    default: 0
  },
  
  lastRetryAt: {
    type: Date,
    default: null
  },
  
  // Error Information
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
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
  },
  
  // Audit Fields
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
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, readStatus: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, category: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ module: 1, referenceId: 1 });
notificationSchema.index({ department: 1, createdAt: -1 });
notificationSchema.index({ branch: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ isDeleted: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiredAt: 1 }, { sparse: true });

// Virtuals
notificationSchema.virtual('isExpired').get(function() {
  return this.expiredAt && new Date() > this.expiredAt;
});

notificationSchema.virtual('isScheduled').get(function() {
  return this.scheduledAt && new Date() < this.scheduledAt;
});

notificationSchema.virtual('canRetry').get(function() {
  return this.status === NOTIFICATION_STATUS.FAILED && this.retryCount < 3;
});

// Methods
notificationSchema.methods.markAsRead = function() {
  this.readStatus = READ_STATUS.READ;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsUnread = function() {
  this.readStatus = READ_STATUS.UNREAD;
  this.readAt = null;
  return this.save();
};

notificationSchema.methods.archive = function() {
  this.readStatus = READ_STATUS.ARCHIVED;
  return this.save();
};

notificationSchema.methods.markAsDelivered = function() {
  this.status = NOTIFICATION_STATUS.DELIVERED;
  this.delivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsFailed = function(error) {
  this.status = NOTIFICATION_STATUS.FAILED;
  this.error = error;
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsSent = function() {
  this.status = NOTIFICATION_STATUS.SENT;
  return this.save();
};

notificationSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

notificationSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return this.save();
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
notificationSchema.statics.getUnreadCount = function(recipientId) {
  return this.countDocuments({
    recipient: recipientId,
    readStatus: READ_STATUS.UNREAD,
    isDeleted: false
  });
};

notificationSchema.statics.getPendingCount = function(recipientId) {
  return this.countDocuments({
    recipient: recipientId,
    status: NOTIFICATION_STATUS.PENDING,
    isDeleted: false
  });
};

notificationSchema.statics.getFailedCount = function(recipientId) {
  return this.countDocuments({
    recipient: recipientId,
    status: NOTIFICATION_STATUS.FAILED,
    isDeleted: false
  });
};

notificationSchema.statics.markAllAsRead = function(recipientId) {
  return this.updateMany(
    {
      recipient: recipientId,
      readStatus: READ_STATUS.UNREAD,
      isDeleted: false
    },
    {
      readStatus: READ_STATUS.READ,
      readAt: new Date()
    }
  );
};

notificationSchema.statics.archiveAll = function(recipientId) {
  return this.updateMany(
    {
      recipient: recipientId,
      readStatus: READ_STATUS.READ,
      isDeleted: false
    },
    {
      readStatus: READ_STATUS.ARCHIVED
    }
  );
};

notificationSchema.statics.deleteExpired = function() {
  return this.deleteMany({
    expiredAt: { $lt: new Date() },
    isDeleted: false
  });
};

notificationSchema.statics.getScheduledNotifications = function() {
  return this.find({
    status: NOTIFICATION_STATUS.PENDING,
    scheduledAt: { $lte: new Date() },
    isDeleted: false
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
