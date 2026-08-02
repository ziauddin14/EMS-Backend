import mongoose from 'mongoose';
import { NOTIFICATION_CHANNEL, DIGEST_FREQUENCY, MUTE_DURATION } from './notification.constants.js';

const notificationPreferenceSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Channel Preferences
  email: {
    enabled: {
      type: Boolean,
      default: true
    },
    categories: [{
      type: String
    }],
    priority: [{
      type: String
    }]
  },
  
  sms: {
    enabled: {
      type: Boolean,
      default: false
    },
    categories: [{
      type: String
    }],
    priority: [{
      type: String
    }]
  },
  
  push: {
    enabled: {
      type: Boolean,
      default: true
    },
    categories: [{
      type: String
    }],
    priority: [{
      type: String
    }]
  },
  
  inApp: {
    enabled: {
      type: Boolean,
      default: true
    },
    categories: [{
      type: String
    }],
    priority: [{
      type: String
    }]
  },
  
  // Future-ready channels
  whatsapp: {
    enabled: {
      type: Boolean,
      default: false
    },
    categories: [{
      type: String
    }],
    priority: [{
      type: String
    }]
  },
  
  slack: {
    enabled: {
      type: Boolean,
      default: false
    },
    webhookUrl: String,
    channels: [String]
  },
  
  teams: {
    enabled: {
      type: Boolean,
      default: false
    },
    webhookUrl: String,
    teams: [String]
  },
  
  discord: {
    enabled: {
      type: Boolean,
      default: false
    },
    webhookUrl: String,
    channels: [String]
  },
  
  // Mute Settings
  isMuted: {
    type: Boolean,
    default: false
  },
  
  muteDuration: {
    type: String,
    enum: Object.values(MUTE_DURATION),
    default: null
  },
  
  muteStart: {
    type: Date,
    default: null
  },
  
  muteEnd: {
    type: Date,
    default: null
  },
  
  // Quiet Hours
  quietHoursEnabled: {
    type: Boolean,
    default: true
  },
  
  quietHoursStart: {
    type: String,
    default: '22:00'
  },
  
  quietHoursEnd: {
    type: String,
    default: '08:00'
  },
  
  quietHoursTimezone: {
    type: String,
    default: 'UTC'
  },
  
  // Digest Settings
  digestFrequency: {
    type: String,
    enum: Object.values(DIGEST_FREQUENCY),
    default: DIGEST_FREQUENCY.IMMEDIATE
  },
  
  digestCategories: [{
    type: String
  }],
  
  // Language
  language: {
    type: String,
    default: 'en'
  },
  
  // Category-specific preferences
  categoryPreferences: {
    type: Map,
    of: {
      enabled: Boolean,
      channels: [String],
      digest: String
    },
    default: {}
  },
  
  // Priority-specific preferences
  priorityPreferences: {
    type: Map,
    of: {
      enabled: Boolean,
      channels: [String],
      sound: String
    },
    default: {}
  },
  
  // Device tokens for push notifications
  deviceTokens: [{
    token: String,
    platform: {
      type: String,
      enum: ['ios', 'android', 'web']
    },
    deviceId: String,
    isActive: {
      type: Boolean,
      default: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Email settings
  emailSettings: {
    primaryEmail: String,
    additionalEmails: [String],
    digestEmail: String
  },
  
  // SMS settings
  smsSettings: {
    phoneNumber: String,
    countryCode: String
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
notificationPreferenceSchema.index({ user: 1 }, { unique: true });
notificationPreferenceSchema.index({ isDeleted: 1 });
notificationPreferenceSchema.index({ 'deviceTokens.isActive': 1 });

// Virtuals
notificationPreferenceSchema.virtual('isMutedNow').get(function() {
  if (!this.isMuted) return false;
  if (!this.muteStart || !this.muteEnd) return false;
  const now = new Date();
  return now >= this.muteStart && now <= this.muteEnd;
});

notificationPreferenceSchema.virtual('isQuietHoursNow').get(function() {
  if (!this.quietHoursEnabled) return false;
  // This would need timezone-aware time comparison
  return true;
});

// Methods
notificationPreferenceSchema.methods.isChannelEnabled = function(channel) {
  const channelSetting = this[channel];
  return channelSetting && channelSetting.enabled;
};

notificationPreferenceSchema.methods.isCategoryEnabled = function(category, channel) {
  const channelSetting = this[channel];
  if (!channelSetting || !channelSetting.enabled) return false;
  
  if (channelSetting.categories && channelSetting.categories.length > 0) {
    return channelSetting.categories.includes(category);
  }
  
  return true;
};

notificationPreferenceSchema.methods.isPriorityEnabled = function(priority, channel) {
  const channelSetting = this[channel];
  if (!channelSetting || !channelSetting.enabled) return false;
  
  if (channelSetting.priority && channelSetting.priority.length > 0) {
    return channelSetting.priority.includes(priority);
  }
  
  return true;
};

notificationPreferenceSchema.methods.getEnabledChannels = function(category, priority) {
  const enabledChannels = [];
  
  const channels = ['email', 'sms', 'push', 'in_app', 'whatsapp', 'slack', 'teams', 'discord'];
  
  for (const channel of channels) {
    if (this.isChannelEnabled(channel) && 
        this.isCategoryEnabled(category, channel) && 
        this.isPriorityEnabled(priority, channel)) {
      enabledChannels.push(channel);
    }
  }
  
  return enabledChannels;
};

notificationPreferenceSchema.methods.addDeviceToken = function(token, platform, deviceId) {
  const existingToken = this.deviceTokens.find(dt => dt.token === token);
  
  if (existingToken) {
    existingToken.isActive = true;
    existingToken.lastUsed = new Date();
    existingToken.deviceId = deviceId;
  } else {
    this.deviceTokens.push({
      token,
      platform,
      deviceId,
      isActive: true,
      lastUsed: new Date()
    });
  }
  
  return this.save();
};

notificationPreferenceSchema.methods.removeDeviceToken = function(token) {
  this.deviceTokens = this.deviceTokens.filter(dt => dt.token !== token);
  return this.save();
};

notificationPreferenceSchema.methods.deactivateDeviceToken = function(token) {
  const tokenObj = this.deviceTokens.find(dt => dt.token === token);
  if (tokenObj) {
    tokenObj.isActive = false;
  }
  return this.save();
};

notificationPreferenceSchema.methods.mute = function(duration) {
  this.isMuted = true;
  this.muteDuration = duration;
  this.muteStart = new Date();
  
  const durationMap = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    'permanent': null
  };
  
  if (duration !== 'permanent' && durationMap[duration]) {
    this.muteEnd = new Date(Date.now() + durationMap[duration]);
  }
  
  return this.save();
};

notificationPreferenceSchema.methods.unmute = function() {
  this.isMuted = false;
  this.muteDuration = null;
  this.muteStart = null;
  this.muteEnd = null;
  return this.save();
};

notificationPreferenceSchema.methods.setCategoryPreference = function(category, enabled, channels, digest) {
  if (!this.categoryPreferences) {
    this.categoryPreferences = new Map();
  }
  
  this.categoryPreferences.set(category, {
    enabled,
    channels: channels || [],
    digest: digest || DIGEST_FREQUENCY.IMMEDIATE
  });
  
  return this.save();
};

notificationPreferenceSchema.methods.setPriorityPreference = function(priority, enabled, channels, sound) {
  if (!this.priorityPreferences) {
    this.priorityPreferences = new Map();
  }
  
  this.priorityPreferences.set(priority, {
    enabled,
    channels: channels || [],
    sound: sound || null
  });
  
  return this.save();
};

// Pre-save middleware
notificationPreferenceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
notificationPreferenceSchema.statics.getByUser = function(userId) {
  return this.findOne({
    user: userId,
    isDeleted: false
  });
};

notificationPreferenceSchema.statics.createDefault = function(userId) {
  return this.create({
    user: userId
  });
};

notificationPreferenceSchema.statics.getOrCreateDefault = async function(userId) {
  let preference = await this.getByUser(userId);
  
  if (!preference) {
    preference = await this.createDefault(userId);
  }
  
  return preference;
};

notificationPreferenceSchema.statics.getActiveDeviceTokens = function(userId, platform = null) {
  const query = {
    user: userId,
    'deviceTokens.isActive': true,
    isDeleted: false
  };
  
  if (platform) {
    query['deviceTokens.platform'] = platform;
  }
  
  return this.findOne(query).select('deviceTokens');
};

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

export default NotificationPreference;
