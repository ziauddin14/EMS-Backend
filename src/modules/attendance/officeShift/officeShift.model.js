import mongoose from 'mongoose';
import { SHIFT_STATUS, SHIFT_TYPE, COLLECTION_NAME } from './officeShift.constants.js';

const officeShiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shift name is required'],
      trim: true,
      maxlength: [100, 'Shift name cannot exceed 100 characters']
    },
    code: {
      type: String,
      required: [true, 'Shift code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    workingHours: {
      type: Number,
      required: [true, 'Working hours is required'],
      min: [0, 'Working hours cannot be negative'],
      max: [24, 'Working hours cannot exceed 24']
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
    breakDuration: {
      type: Number,
      default: 60,
      min: [0, 'Break duration cannot be negative'],
      max: [180, 'Break duration cannot exceed 180']
    },
    allowFlexibleCheckIn: {
      type: Boolean,
      default: false
    },
    allowFlexibleCheckOut: {
      type: Boolean,
      default: false
    },
    allowOvertime: {
      type: Boolean,
      default: true
    },
    allowNightShift: {
      type: Boolean,
      default: false
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    weeklyOff: [{
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6]
    }],
    color: {
      type: String,
      trim: true,
      default: null
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

officeShiftSchema.index({ code: 1 });
officeShiftSchema.index({ name: 1, isDeleted: 1 });
officeShiftSchema.index({ isDefault: 1, isDeleted: 1 });
officeShiftSchema.index({ isActive: 1, isDeleted: 1 });
officeShiftSchema.index({ createdAt: -1 });

officeShiftSchema.virtual('shiftType').get(function() {
  const startHour = parseInt(this.startTime.split(':')[0]);
  const endHour = parseInt(this.endTime.split(':')[0]);

  if (this.allowNightShift) {
    return SHIFT_TYPE.NIGHT;
  }
  if (this.allowFlexibleCheckIn && this.allowFlexibleCheckOut) {
    return SHIFT_TYPE.FLEXIBLE;
  }
  if (startHour >= 6 && startHour < 12) {
    return SHIFT_TYPE.MORNING;
  }
  if (startHour >= 12 && startHour < 18) {
    return SHIFT_TYPE.EVENING;
  }
  if (startHour >= 18 || startHour < 6) {
    return SHIFT_TYPE.NIGHT;
  }
  return SHIFT_TYPE.GENERAL;
});

officeShiftSchema.virtual('isNightShift').get(function() {
  return this.allowNightShift || this.shiftType === SHIFT_TYPE.NIGHT;
});

officeShiftSchema.virtual('isFlexible').get(function() {
  return this.allowFlexibleCheckIn || this.allowFlexibleCheckOut;
});

officeShiftSchema.methods.isActive = function() {
  return this.isActive && !this.isDeleted;
};

officeShiftSchema.methods.canBeDeleted = async function() {
  const Attendance = mongoose.model('Attendance');
  const count = await Attendance.countDocuments({ officeShift: this._id, isDeleted: false });
  return count === 0 && !this.isDefault;
};

officeShiftSchema.methods.hasEmployees = async function() {
  const Attendance = mongoose.model('Attendance');
  const count = await Attendance.countDocuments({ officeShift: this._id, isDeleted: false });
  return count > 0;
};

officeShiftSchema.methods.getEmployeeCount = async function() {
  const Attendance = mongoose.model('Attendance');
  return Attendance.countDocuments({ officeShift: this._id, isDeleted: false });
};

officeShiftSchema.methods.setAsDefault = async function() {
  await this.constructor.updateMany(
    { isDefault: true, isDeleted: false },
    { isDefault: false }
  );
  this.isDefault = true;
  return this.save();
};

officeShiftSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase(), isDeleted: false });
};

officeShiftSchema.statics.findDefault = function() {
  return this.findOne({ isDefault: true, isDeleted: false });
};

officeShiftSchema.statics.findActive = function() {
  return this.find({ isActive: true, isDeleted: false }).sort({ isDefault: -1, name: 1 });
};

officeShiftSchema.statics.findByStatus = function(status) {
  return this.find({ isActive: status, isDeleted: false }).sort({ name: 1 });
};

officeShiftSchema.statics.findByType = function(type) {
  return this.find({ isDeleted: false }).sort({ name: 1 });
};

officeShiftSchema.statics.countByStatus = function(status) {
  return this.countDocuments({ isActive: status, isDeleted: false });
};

officeShiftSchema.query.byCode = function(code) {
  return this.where({ code: code.toUpperCase(), isDeleted: false });
};

officeShiftSchema.query.active = function() {
  return this.where({ isActive: true, isDeleted: false });
};

officeShiftSchema.query.default = function() {
  return this.where({ isDefault: true, isDeleted: false });
};

officeShiftSchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

officeShiftSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase();
  }

  if (this.isModified('startTime') || this.isModified('endTime')) {
    const startParts = this.startTime.split(':').map(Number);
    const endParts = this.endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    if (!this.allowNightShift && endMinutes < startMinutes) {
      return next(new Error('End time cannot be before start time for non-night shifts'));
    }
  }

  next();
});

officeShiftSchema.methods.toJSON = function() {
  const shift = this.toObject();
  delete shift.__v;
  return shift;
};

const OfficeShift = mongoose.model('OfficeShift', officeShiftSchema);

export default OfficeShift;
