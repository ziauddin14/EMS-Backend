import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    hashedRefreshToken: {
      type: String,
      required: true
    },
    deviceId: {
      type: String,
      required: true,
      index: true
    },
    deviceName: {
      type: String,
      default: null
    },
    browser: {
      type: String,
      default: null
    },
    operatingSystem: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    tokenFamily: {
      type: String,
      required: true,
      index: true
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
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
    }
  },
  {
    timestamps: true,
    collection: 'sessions'
  }
);

sessionSchema.index({ userId: 1, isRevoked: 1 });
sessionSchema.index({ userId: 1, expiresAt: 1 });
sessionSchema.index({ tokenFamily: 1, isRevoked: 1 });
sessionSchema.index({ expiresAt: 1, isRevoked: 1 });

sessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

sessionSchema.methods.isActive = function() {
  return !this.isRevoked && !this.isExpired();
};

sessionSchema.statics.findActiveByUser = function(userId) {
  return this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).sort({ lastUsedAt: -1 });
};

sessionSchema.statics.findByTokenFamily = function(tokenFamily) {
  return this.find({ tokenFamily }).sort({ createdAt: -1 });
};

sessionSchema.statics.countActiveByUser = function(userId) {
  return this.countDocuments({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
