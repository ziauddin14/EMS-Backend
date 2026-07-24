import mongoose from 'mongoose';
import { EMPLOYMENT_STATUS, EMPLOYMENT_TYPE, GENDER, MARITAL_STATUS, BLOOD_GROUP, COLLECTION_NAME, EMPLOYEE_NUMBER_PREFIX, EMPLOYEE_NUMBER_PADDING } from './employee.constants.js';

const employeeSchema = new mongoose.Schema(
  {
    employeeNumber: {
      type: String,
      required: [true, 'Employee number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designation',
      default: null,
      index: true
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    secondaryManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    departmentHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    organizationLevel: {
      type: Number,
      default: 0,
      index: true
    },
    reportingPath: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }],
    isDepartmentHead: {
      type: Boolean,
      default: false,
      index: true
    },
    isTeamLead: {
      type: Boolean,
      default: false,
      index: true
    },
    directReportCount: {
      type: Number,
      default: 0
    },
    employmentType: {
      type: String,
      enum: Object.values(EMPLOYMENT_TYPE),
      required: [true, 'Employment type is required'],
      index: true
    },
    employmentStatus: {
      type: String,
      enum: Object.values(EMPLOYMENT_STATUS),
      default: EMPLOYMENT_STATUS.PENDING,
      index: true
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      index: true
    },
    probationEndDate: {
      type: Date,
      default: null
    },
    confirmationDate: {
      type: Date,
      default: null
    },
    employmentStage: {
      type: String,
      enum: ['application', 'offer_released', 'offer_accepted', 'pre_joining', 'joined', 'probation', 'confirmed', 'transferred', 'promoted', 'on_leave', 'suspended', 'resigned', 'notice_period', 'relieved', 'terminated', 'retired', 'rehired'],
      default: 'joined'
    },
    probationStartDate: {
      type: Date,
      default: null
    },
    noticePeriodDays: {
      type: Number,
      default: 30
    },
    noticeStartDate: {
      type: Date,
      default: null
    },
    lastWorkingDate: {
      type: Date,
      default: null
    },
    exitDate: {
      type: Date,
      default: null
    },
    terminationReason: {
      type: String,
      trim: true,
      default: null
    },
    resignationReason: {
      type: String,
      trim: true,
      default: null
    },
    promotionHistory: [{
      designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designation'
      },
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      },
      effectiveDate: Date,
      salary: Number,
      promotedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    transferHistory: [{
      fromDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      },
      toDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      },
      effectiveDate: Date,
      transferredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String
    }],
    employmentHistory: [{
      stage: String,
      effectiveDate: Date,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      remarks: String
    }],
    isConfirmed: {
      type: Boolean,
      default: false
    },
    isOnProbation: {
      type: Boolean,
      default: false
    },
    isResigned: {
      type: Boolean,
      default: false
    },
    isTerminated: {
      type: Boolean,
      default: false
    },
    workLocation: {
      type: String,
      trim: true,
      default: null
    },
    officeShift: {
      type: String,
      trim: true,
      default: null
    },
    officialEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      index: true
    },
    officialPhone: {
      type: String,
      trim: true,
      default: null
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: null
    },
    emergencyPhone: {
      type: String,
      trim: true,
      default: null
    },
    emergencyRelation: {
      type: String,
      trim: true,
      default: null
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      default: null
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    maritalStatus: {
      type: String,
      enum: Object.values(MARITAL_STATUS),
      default: null
    },
    nationality: {
      type: String,
      trim: true,
      default: null
    },
    bloodGroup: {
      type: String,
      enum: Object.values(BLOOD_GROUP),
      default: null
    },
    cnicNumber: {
      type: String,
      trim: true,
      default: null
    },
    currentAddress: {
      type: String,
      trim: true,
      default: null
    },
    permanentAddress: {
      type: String,
      trim: true,
      default: null
    },
    profilePhoto: {
      public_id: {
        type: String,
        default: null
      },
      url: {
        type: String,
        default: null
      }
    },
    notes: {
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
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

employeeSchema.index({ employeeNumber: 1 });
employeeSchema.index({ user: 1, isDeleted: 1 });
employeeSchema.index({ department: 1, isDeleted: 1 });
employeeSchema.index({ designation: 1, isDeleted: 1 });
employeeSchema.index({ employmentStatus: 1, isDeleted: 1 });
employeeSchema.index({ employmentType: 1, isDeleted: 1 });
employeeSchema.index({ joiningDate: 1, isDeleted: 1 });
employeeSchema.index({ reportingManager: 1, isDeleted: 1 });
employeeSchema.index({ secondaryManager: 1, isDeleted: 1 });
employeeSchema.index({ departmentHead: 1, isDeleted: 1 });
employeeSchema.index({ organizationLevel: 1, isDeleted: 1 });
employeeSchema.index({ isDepartmentHead: 1, isDeleted: 1 });
employeeSchema.index({ isTeamLead: 1, isDeleted: 1 });
employeeSchema.index({ employmentStage: 1, isDeleted: 1 });
employeeSchema.index({ isConfirmed: 1, isDeleted: 1 });
employeeSchema.index({ isOnProbation: 1, isDeleted: 1 });
employeeSchema.index({ isResigned: 1, isDeleted: 1 });
employeeSchema.index({ isTerminated: 1, isDeleted: 1 });
employeeSchema.index({ officialEmail: 1, isDeleted: 1 });
employeeSchema.index({ createdAt: -1 });

employeeSchema.virtual('fullName').get(function() {
  return this.user?.fullName || '';
});

employeeSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

employeeSchema.virtual('isProbation').get(function() {
  return this.employmentStatus === EMPLOYMENT_STATUS.PROBATION;
});

employeeSchema.virtual('isConfirmed').get(function() {
  return this.confirmationDate !== null && this.confirmationDate <= new Date();
});

employeeSchema.virtual('yearsOfService').get(function() {
  if (!this.joiningDate) return 0;
  const today = new Date();
  const joining = new Date(this.joiningDate);
  const diffTime = Math.abs(today - joining);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
});

employeeSchema.methods.isActive = function() {
  return this.employmentStatus === EMPLOYMENT_STATUS.ACTIVE && !this.isDeleted;
};

employeeSchema.methods.isOnProbation = function() {
  return this.employmentStatus === EMPLOYMENT_STATUS.PROBATION;
};

employeeSchema.methods.canBeDeleted = function() {
  return this.employmentStatus !== EMPLOYMENT_STATUS.ACTIVE;
};

employeeSchema.methods.getProbationStatus = function() {
  if (this.employmentStatus !== EMPLOYMENT_STATUS.PROBATION || !this.probationEndDate) {
    return null;
  }
  const today = new Date();
  const endDate = new Date(this.probationEndDate);
  if (today > endDate) {
    return 'probation_expired';
  }
  const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  return daysRemaining <= 7 ? 'probation_ending_soon' : 'probation_active';
};

employeeSchema.statics.findByEmployeeNumber = function(employeeNumber) {
  return this.findOne({ employeeNumber: employeeNumber.toUpperCase(), isDeleted: false });
};

employeeSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId, isDeleted: false });
};

employeeSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, isDeleted: false });
};

employeeSchema.statics.findByReportingManager = function(managerId) {
  return this.find({ reportingManager: managerId, isDeleted: false });
};

employeeSchema.statics.findByEmploymentStatus = function(status) {
  return this.find({ employmentStatus: status, isDeleted: false });
};

employeeSchema.statics.findByEmploymentType = function(type) {
  return this.find({ employmentType: type, isDeleted: false });
};

employeeSchema.statics.findActive = function() {
  return this.find({ employmentStatus: EMPLOYMENT_STATUS.ACTIVE, isDeleted: false });
};

employeeSchema.statics.countByDepartment = function(departmentId) {
  return this.countDocuments({ department: departmentId, isDeleted: false });
};

employeeSchema.statics.countByStatus = function(status) {
  return this.countDocuments({ employmentStatus: status, isDeleted: false });
};

employeeSchema.statics.countByType = function(type) {
  return this.countDocuments({ employmentType: type, isDeleted: false });
};

employeeSchema.statics.generateEmployeeNumber = async function() {
  const lastEmployee = await this.findOne().sort({ createdAt: -1 }).select('employeeNumber');
  let lastNumber = 0;
  
  if (lastEmployee && lastEmployee.employeeNumber) {
    const lastNumStr = lastEmployee.employeeNumber.replace(EMPLOYEE_NUMBER_PREFIX, '');
    lastNumber = parseInt(lastNumStr, 10) || 0;
  }
  
  const nextNumber = lastNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(EMPLOYEE_NUMBER_PADDING, '0');
  return `${EMPLOYEE_NUMBER_PREFIX}${paddedNumber}`;
};

employeeSchema.query.byDepartment = function(departmentId) {
  return this.where({ department: departmentId, isDeleted: false });
};

employeeSchema.query.byDesignation = function(designationId) {
  return this.where({ designation: designationId, isDeleted: false });
};

employeeSchema.query.byReportingManager = function(managerId) {
  return this.where({ reportingManager: managerId, isDeleted: false });
};

employeeSchema.query.byEmploymentStatus = function(status) {
  return this.where({ employmentStatus: status, isDeleted: false });
};

employeeSchema.query.byEmploymentType = function(type) {
  return this.where({ employmentType: type, isDeleted: false });
};

employeeSchema.query.active = function() {
  return this.where({ employmentStatus: EMPLOYMENT_STATUS.ACTIVE, isDeleted: false });
};

employeeSchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

employeeSchema.pre('save', async function(next) {
  if (this.isModified('employeeNumber')) {
    this.employeeNumber = this.employeeNumber.toUpperCase();
  }
  next();
});

employeeSchema.methods.toJSON = function() {
  const employee = this.toObject();
  delete employee.__v;
  return employee;
};

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
