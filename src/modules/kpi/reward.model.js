import mongoose from 'mongoose';
import { REWARD_TYPE, REWARD_STATUS, APPROVAL_STATUS, COLLECTION_NAME } from './kpi.constants.js';

const rewardSchema = new mongoose.Schema(
  {
    rewardNumber: {
      type: String,
      required: [true, 'Reward number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Reward number cannot exceed 20 characters'],
      index: true
    },
    type: {
      type: String,
      enum: Object.values(REWARD_TYPE),
      required: [true, 'Reward type is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Reward title is required'],
      trim: true,
      maxlength: [300, 'Reward title cannot exceed 300 characters'],
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Recipient is required'],
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
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Issuer is required'],
      index: true
    },
    issuedDate: {
      type: Date,
      required: [true, 'Issued date is required'],
      index: true
    },
    effectiveDate: {
      type: Date,
      default: null,
      index: true
    },
    expiryDate: {
      type: Date,
      default: null
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [1000, 'Reason cannot exceed 1000 characters']
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
      default: null,
      index: true
    },
    points: {
      type: Number,
      min: 0,
      default: 0,
      index: true
    },
    monetaryValue: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      trim: true,
      maxlength: [10, 'Currency cannot exceed 10 characters'],
      default: 'USD'
    },
    status: {
      type: String,
      enum: Object.values(REWARD_STATUS),
      default: REWARD_STATUS.PENDING,
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
    // Nomination details
    nominatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    nominatedAt: {
      type: Date,
      default: null
    },
    nominationReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Nomination reason cannot exceed 1000 characters'],
      default: null
    },
    // Achievement details
    achievement: {
      type: String,
      trim: true,
      maxlength: [500, 'Achievement cannot exceed 500 characters'],
      default: null
    },
    metrics: [{
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Metric name cannot exceed 100 characters']
      },
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        trim: true,
        maxlength: [50, 'Unit cannot exceed 50 characters'],
        default: null
      }
    }],
    // Recognition details
    recognitionLevel: {
      type: String,
      enum: ['individual', 'team', 'department', 'organization'],
      default: 'individual'
    },
    publicRecognition: {
      type: Boolean,
      default: true
    },
    announcementChannel: {
      type: String,
      trim: true,
      maxlength: [100, 'Announcement channel cannot exceed 100 characters'],
      default: null
    },
    // Certificate details
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Certificate number cannot exceed 50 characters'],
      default: null
    },
    certificateUrl: {
      type: String,
      trim: true,
      default: null
    },
    // Gift/Prize details
    giftType: {
      type: String,
      trim: true,
      maxlength: [100, 'Gift type cannot exceed 100 characters'],
      default: null
    },
    giftDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Gift description cannot exceed 500 characters'],
      default: null
    },
    giftValue: {
      type: Number,
      min: 0,
      default: 0
    },
    // Additional benefits
    additionalBenefits: [{
      type: String,
      trim: true,
      maxlength: [300, 'Additional benefit cannot exceed 300 characters']
    }],
    // Attachments
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
    // Comments
    comments: [{
      comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
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
    collection: COLLECTION_NAME.REWARD
  }
);

// Compound indexes for performance optimization
rewardSchema.index({ recipient: 1, issuedDate: 1, isDeleted: 1 });
rewardSchema.index({ recipient: 1, type: 1, isDeleted: 1 });
rewardSchema.index({ recipient: 1, status: 1, isDeleted: 1 });
rewardSchema.index({ department: 1, issuedDate: 1, isDeleted: 1 });
rewardSchema.index({ department: 1, type: 1, isDeleted: 1 });
rewardSchema.index({ issuedBy: 1, issuedDate: 1, isDeleted: 1 });
rewardSchema.index { project: 1, issuedDate: 1, isDeleted: 1 });
rewardSchema.index({ team: 1, issuedDate: 1, isDeleted: 1 });
rewardSchema.index({ type: 1, status: 1, isDeleted: 1 });
rewardSchema.index({ status: 1, approvalStatus: 1, isDeleted: 1 });
rewardSchema.index({ points: 1, issuedDate: 1, isDeleted: 1 });
rewardSchema.index({ issuedDate: 1, status: 1, isDeleted: 1 });
rewardSchema.index({ effectiveDate: 1, isDeleted: 1 });
rewardSchema.index({ createdAt: 1, status: 1, isDeleted: 1 });
rewardSchema.index({ approvedAt: 1, isDeleted: 1 });
rewardSchema.index({ nominatedBy: 1, isDeleted: 1 });
rewardSchema.index({ category: 1, isDeleted: 1 });

// Static methods
rewardSchema.statics.findByRecipient = function(recipientId, options = {}) {
  const { type, status, year, startDate, endDate } = options;
  const filter = { recipient: recipientId, isDeleted: false };
  
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (year) {
    const start = new Dateyear, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  if (startDate && endDate) {
    filter.issuedDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

rewardSchema.statics.findByDepartment = function(departmentId, options = {}) {
  const { type, status, year } = options;
  const filter = { department: departmentId, isDeleted: false };
  
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

rewardSchema.statics.findByIssuer = function(issuerId, options = {}) {
  const { type, status, year } = options;
  const filter = { issuedBy: issuerId, isDeleted: false };
  
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

rewardSchema.statics.findByType = function(type, options = {}) {
  const { status, department, year } = options;
  const filter = { type, isDeleted: false };
  
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

rewardSchema.statics.findByStatus = function(status, options = {}) {
  const { department, type, year } = options;
  const filter = { status, isDeleted: false };
  
  if (department) filter.department = department;
  if (type) filter.type = type;
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    filter.issuedDate = { $gte: start, $lte: end };
  }
  
  return this.find(filter).sort({ issuedDate: -1 });
};

rewardSchema.statics.findByProject = function(projectId, options = {}) {
  const { status, type } = options;
  const filter = { project: projectId, isDeleted: false };
  
  if (status) filter.status = status;
  if (type) filter.type = type;
  
  return this.find(filter).sort({ issuedDate: -1 });
};

rewardSchema.statics.findByTeam = function(teamId, options = {}) {
  const { status, type } = options;
  const filter = { team: teamId, isDeleted: false };
  
  if (status) filter.status = status;
  if (type) filter.type = type;
  
  return this.find(filter).sort({ issuedDate: -1 });
};

rewardSchema.statics.getTopRewarded = function(year, limit = 10) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        issuedDate: { $gte: start, $lte: end },
        isDeleted: false,
        status: REWARD_STATUS.ISSUED
      }
    },
    {
      $group: {
        _id: '$recipient',
        totalRewards: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        totalValue: { $sum: '$monetaryValue' }
      }
    },
    { $sort: { totalPoints: -1 } },
    { $limit: limit }
  ]);
};

rewardSchema.statics.getDepartmentRewards = function(departmentId, year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        department: departmentId,
        issuedDate: { $gte: start, $lte: end },
        isDeleted: false,
        status: REWARD_STATUS.ISSUED
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        totalValue: { $sum: '$monetaryValue' }
      }
    }
  ]);
};

rewardSchema.statics.getRewardStats = function(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        issuedDate: { $gte: start, $lte: end },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        issued: { $sum: { $cond: [{ $eq: ['$status', REWARD_STATUS.ISSUED] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', REWARD_STATUS.PENDING] }, 1, 0] } },
        totalPoints: { $sum: '$points' },
        totalValue: { $sum: '$monetaryValue' }
      }
    }
  ]);
};

// Instance methods
rewardSchema.methods.approve = function(approverId) {
  this.status = REWARD_STATUS.APPROVED;
  this.approvalStatus = APPROVAL_STATUS.APPROVED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  return this.save();
};

rewardSchema.methods.issue = function() {
  this.status = REWARD_STATUS.ISSUED;
  this.approvalStatus = APPROVAL_STATUS.APPROVED;
  this.effectiveDate = this.effectiveDate || new Date();
  return this.save();
};

rewardSchema.methods.reject = function(approverId, reason) {
  this.status = REWARD_STATUS.REJECTED;
  this.approvalStatus = APPROVAL_STATUS.REJECTED;
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

rewardSchema.methods.cancel = function(reason) {
  this.status = REWARD_STATUS.CANCELLED;
  this.rejectionReason = reason;
  return this.save();
};

rewardSchema.methods.addComment = function(comment, addedBy) {
  this.comments.push({
    comment,
    addedBy,
    addedAt: new Date()
  });
  return this.save();
};

rewardSchema.methods.issueCertificate = function(certificateNumber, certificateUrl) {
  this.certificateIssued = true;
  this.certificateNumber = certificateNumber;
  this.certificateUrl = certificateUrl;
  return this.save();
};

rewardSchema.methods.nominate = function(nominatedBy, reason) {
  this.nominatedBy = nominatedBy;
  this.nominatedAt = new Date();
  this.nominationReason = reason;
  return this.save();
};

const Reward = mongoose.model('Reward', rewardSchema);

export default Reward;
