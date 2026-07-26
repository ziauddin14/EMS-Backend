import mongoose from 'mongoose';
import { POLICY_STATUS, COLLECTION_NAME } from './attendancePolicy.constants.js';

const attendancePolicySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters']
    },
    policyName: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
      maxlength: [200, 'Policy name cannot exceed 200 characters']
    },
    graceMinutes: {
      type: Number,
      default: 15,
      min: [0, 'Grace minutes cannot be negative'],
      max: [60, 'Grace minutes cannot exceed 60']
    },
    lateAfterMinutes: {
      type: Number,
      default: 30,
      min: [0, 'Late after minutes cannot be negative'],
      max: [120, 'Late after minutes cannot exceed 120']
    },
    halfDayMinutes: {
      type: Number,
      default: 240,
      min: [0, 'Half day minutes cannot be negative'],
      max: [480, 'Half day minutes cannot exceed 480']
    },
    minimumWorkingMinutes: {
      type: Number,
      default: 480,
      min: [0, 'Minimum working minutes cannot be negative'],
      max: [1440, 'Minimum working minutes cannot exceed 1440']
    },
    maximumWorkingMinutes: {
      type: Number,
      default: 1440,
      min: [0, 'Maximum working minutes cannot be negative'],
      max: [2880, 'Maximum working minutes cannot exceed 2880']
    },
    allowOvertime: {
      type: Boolean,
      default: true
    },
    maximumOvertimeMinutes: {
      type: Number,
      default: 240,
      min: [0, 'Maximum overtime minutes cannot be negative'],
      max: [480, 'Maximum overtime minutes cannot exceed 480']
    },
    allowRemoteAttendance: {
      type: Boolean,
      default: false
    },
    allowWeekendAttendance: {
      type: Boolean,
      default: false
    },
    allowHolidayAttendance: {
      type: Boolean,
      default: false
    },
    allowManualAttendance: {
      type: Boolean,
      default: false
    },
    allowAttendanceCorrection: {
      type: Boolean,
      default: true
    },
    maximumCorrectionDays: {
      type: Number,
      default: 7,
      min: [0, 'Maximum correction days cannot be negative'],
      max: [30, 'Maximum correction days cannot exceed 30']
    },
    requireManagerApproval: {
      type: Boolean,
      default: true
    },
    requireHRApproval: {
      type: Boolean,
      default: false
    },
    latePenaltyEnabled: {
      type: Boolean,
      default: false
    },
    autoAbsentEnabled: {
      type: Boolean,
      default: true
    },
    workingDays: [{
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6]
    }],
    timezone: {
      type: String,
      default: 'UTC',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
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

attendancePolicySchema.index({ companyName: 1, policyName: 1, isDeleted: 1 });
attendancePolicySchema.index({ isActive: 1, isDeleted: 1 });
attendancePolicySchema.index({ createdAt: -1 });

attendancePolicySchema.virtual('isStrict').get(function() {
  return this.latePenaltyEnabled && this.autoAbsentEnabled;
});

attendancePolicySchema.virtual('isFlexible').get(function() {
  return this.allowRemoteAttendance && this.allowWeekendAttendance;
});

attendancePolicySchema.methods.isActive = function() {
  return this.isActive && !this.isDeleted;
};

attendancePolicySchema.methods.canBeDeleted = function() {
  return !this.isActive;
};

attendancePolicySchema.methods.getWorkingDaysCount = function() {
  return this.workingDays.length;
};

attendancePolicySchema.methods.isWorkingDay = function(day) {
  return this.workingDays.includes(day);
};

attendancePolicySchema.statics.findActive = function() {
  return this.findOne({ isActive: true, isDeleted: false });
};

attendancePolicySchema.statics.findAllActive = function() {
  return this.find({ isActive: true, isDeleted: false }).sort({ createdAt: -1 });
};

attendancePolicySchema.statics.findByCompany = function(companyName) {
  return this.find({ companyName, isDeleted: false }).sort({ createdAt: -1 });
};

attendancePolicySchema.statics.findByStatus = function(status) {
  return this.find({ isActive: status, isDeleted: false }).sort({ createdAt: -1 });
};

attendancePolicySchema.statics.countByStatus = function(status) {
  return this.countDocuments({ isActive: status, isDeleted: false });
};

attendancePolicySchema.query.active = function() {
  return this.where({ isActive: true, isDeleted: false });
};

attendancePolicySchema.query.byCompany = function(companyName) {
  return this.where({ companyName, isDeleted: false });
};

attendancePolicySchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

attendancePolicySchema.pre('save', function(next) {
  if (this.workingDays.length === 0) {
    this.workingDays = [1, 2, 3, 4, 5];
  }
  next();
});

attendancePolicySchema.methods.toJSON = function() {
  const policy = this.toObject();
  delete policy.__v;
  return policy;
};

const AttendancePolicy = mongoose.model('AttendancePolicy', attendancePolicySchema);

export default AttendancePolicy;
