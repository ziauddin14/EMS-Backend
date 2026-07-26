import mongoose from 'mongoose';
import { ATTENDANCE_STATUS, APPROVAL_STATUS, COLLECTION_NAME } from './attendance.constants.js';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true
    },
    attendanceDate: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true
    },
    officeShift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfficeShift',
      default: null,
      index: true
    },
    attendanceStatus: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PENDING,
      index: true
    },
    checkIn: {
      type: Date,
      default: null
    },
    checkOut: {
      type: Date,
      default: null
    },
    workingMinutes: {
      type: Number,
      default: 0
    },
    workingHours: {
      type: Number,
      default: 0
    },
    breakMinutes: {
      type: Number,
      default: 0
    },
    lateMinutes: {
      type: Number,
      default: 0
    },
    earlyExitMinutes: {
      type: Number,
      default: 0
    },
    overtimeMinutes: {
      type: Number,
      default: 0
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: null
    },
    approvalStatus: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.APPROVED,
      index: true
    },
    adjustmentRequested: {
      type: Boolean,
      default: false
    },
    adjustmentReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Adjustment reason cannot exceed 500 characters'],
      default: null
    },
    isHoliday: {
      type: Boolean,
      default: false,
      index: true
    },
    isWeekend: {
      type: Boolean,
      default: false,
      index: true
    },
    isManualEntry: {
      type: Boolean,
      default: false
    },
    location: {
      type: {
        type: String,
        enum: ['office', 'remote', 'field', 'client_site'],
        default: 'office'
      },
      coordinates: {
        latitude: {
          type: Number,
          default: null
        },
        longitude: {
          type: Number,
          default: null
        }
      },
      address: {
        type: String,
        trim: true,
        default: null
      },
      geoFenceVerified: {
        type: Boolean,
        default: false
      }
    },
    device: {
      type: {
        type: String,
        enum: ['web', 'mobile', 'biometric', 'kiosk', 'api'],
        default: 'web'
      },
      deviceId: {
        type: String,
        trim: true,
        default: null
      },
      deviceName: {
        type: String,
        trim: true,
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
      }
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

attendanceSchema.index({ employee: 1, attendanceDate: 1, isDeleted: 1 }, { unique: true, sparse: true });
attendanceSchema.index({ attendanceDate: 1, attendanceStatus: 1, isDeleted: 1 });
attendanceSchema.index({ officeShift: 1, attendanceDate: 1, isDeleted: 1 });
attendanceSchema.index({ approvalStatus: 1, isDeleted: 1 });
attendanceSchema.index({ checkIn: 1, isDeleted: 1 });
attendanceSchema.index({ checkOut: 1, isDeleted: 1 });
attendanceSchema.index({ createdAt: -1 });
attendanceSchema.index({ employee: 1, attendanceDate: -1 });
attendanceSchema.index({ attendanceDate: -1, attendanceStatus: 1, isDeleted: 1 });
attendanceSchema.index({ attendanceDate: -1, approvalStatus: 1, isDeleted: 1 });
attendanceSchema.index({ attendanceStatus: 1, attendanceDate: -1 });
attendanceSchema.index({ approvalStatus: 1, adjustmentRequested: 1 });
attendanceSchema.index({ isDeleted: 1, attendanceDate: -1 });
attendanceSchema.index({ 'breaks.startTime': 1, 'breaks.endTime': 1 });
attendanceSchema.index({ overtimeMinutes: 1, attendanceDate: -1 });
attendanceSchema.index({ lateMinutes: 1, attendanceDate: -1 });

attendanceSchema.virtual('isPresent').get(function() {
  return this.attendanceStatus === ATTENDANCE_STATUS.PRESENT;
});

attendanceSchema.virtual('isAbsent').get(function() {
  return this.attendanceStatus === ATTENDANCE_STATUS.ABSENT;
});

attendanceSchema.virtual('isLate').get(function() {
  return this.attendanceStatus === ATTENDANCE_STATUS.LATE;
});

attendanceSchema.virtual('isHalfDay').get(function() {
  return this.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY;
});

attendanceSchema.virtual('hasCheckIn').get(function() {
  return this.checkIn !== null;
});

attendanceSchema.virtual('hasCheckOut').get(function() {
  return this.checkOut !== null;
});

attendanceSchema.virtual('isComplete').get(function() {
  return this.checkIn !== null && this.checkOut !== null;
});

attendanceSchema.virtual('isPendingApproval').get(function() {
  return this.approvalStatus === APPROVAL_STATUS.PENDING;
});

attendanceSchema.virtual('checkInTime').get(function() {
  if (!this.checkIn) return null;
  return this.checkIn.toLocaleTimeString();
});

attendanceSchema.virtual('checkOutTime').get(function() {
  if (!this.checkOut) return null;
  return this.checkOut.toLocaleTimeString();
});

attendanceSchema.methods.isActive = function() {
  return !this.isDeleted;
};

attendanceSchema.methods.needsApproval = function() {
  return this.approvalStatus === APPROVAL_STATUS.PENDING || this.adjustmentRequested;
};

attendanceSchema.methods.canBeEdited = function() {
  return !this.isDeleted && this.approvalStatus !== APPROVAL_STATUS.APPROVED;
};

attendanceSchema.methods.canBeDeleted = function() {
  return !this.isDeleted && this.approvalStatus !== APPROVAL_STATUS.APPROVED;
};

attendanceSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ employee: employeeId, isDeleted: false }).sort({ attendanceDate: -1 });
};

attendanceSchema.statics.findByEmployeeAndDate = function(employeeId, attendanceDate) {
  const date = new Date(attendanceDate);
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  return this.findOne({
    employee: employeeId,
    attendanceDate: { $gte: startOfDay, $lte: endOfDay },
    isDeleted: false
  });
};

attendanceSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    isDeleted: false
  }).sort({ attendanceDate: 1 });
};

attendanceSchema.statics.findByShift = function(shiftId) {
  return this.find({ officeShift: shiftId, isDeleted: false }).sort({ attendanceDate: -1 });
};

attendanceSchema.statics.findByStatus = function(status) {
  return this.find({ attendanceStatus: status, isDeleted: false }).sort({ attendanceDate: -1 });
};

attendanceSchema.statics.findByApprovalStatus = function(approvalStatus) {
  return this.find({ approvalStatus, isDeleted: false }).sort({ attendanceDate: -1 });
};

attendanceSchema.statics.findPendingApprovals = function() {
  return this.find({ approvalStatus: APPROVAL_STATUS.PENDING, isDeleted: false }).sort({ attendanceDate: -1 });
};

attendanceSchema.statics.findAdjustmentRequests = function() {
  return this.find({ adjustmentRequested: true, isDeleted: false }).sort({ attendanceDate: -1 });
};

attendanceSchema.statics.countByEmployee = function(employeeId) {
  return this.countDocuments({ employee: employeeId, isDeleted: false });
};

attendanceSchema.statics.countByStatus = function(status) {
  return this.countDocuments({ attendanceStatus: status, isDeleted: false });
};

attendanceSchema.statics.countByDate = function(date) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  return this.countDocuments({
    attendanceDate: { $gte: startOfDay, $lte: endOfDay },
    isDeleted: false
  });
};

attendanceSchema.statics.existsForEmployeeAndDate = function(employeeId, attendanceDate) {
  const date = new Date(attendanceDate);
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  return this.exists({
    employee: employeeId,
    attendanceDate: { $gte: startOfDay, $lte: endOfDay },
    isDeleted: false
  });
};

attendanceSchema.query.byEmployee = function(employeeId) {
  return this.where({ employee: employeeId, isDeleted: false });
};

attendanceSchema.query.byDate = function(date) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  return this.where({ attendanceDate: { $gte: startOfDay, $lte: endOfDay }, isDeleted: false });
};

attendanceSchema.query.byShift = function(shiftId) {
  return this.where({ officeShift: shiftId, isDeleted: false });
};

attendanceSchema.query.byStatus = function(status) {
  return this.where({ attendanceStatus: status, isDeleted: false });
};

attendanceSchema.query.byApprovalStatus = function(approvalStatus) {
  return this.where({ approvalStatus, isDeleted: false });
};

attendanceSchema.query.pendingApproval = function() {
  return this.where({ approvalStatus: APPROVAL_STATUS.PENDING, isDeleted: false });
};

attendanceSchema.query.adjustmentRequested = function() {
  return this.where({ adjustmentRequested: true, isDeleted: false });
};

attendanceSchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const checkInTime = new Date(this.checkIn);
    const checkOutTime = new Date(this.checkOut);
    
    if (checkOutTime < checkInTime) {
      return next(new Error('Check-out time cannot be before check-in time'));
    }
    
    const diffMs = checkOutTime - checkInTime;
    this.workingMinutes = Math.floor(diffMs / 60000);
    this.workingHours = parseFloat((this.workingMinutes / 60).toFixed(2));
  }
  
  next();
});

attendanceSchema.methods.toJSON = function() {
  const attendance = this.toObject();
  delete attendance.__v;
  return attendance;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
