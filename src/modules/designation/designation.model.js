import mongoose from 'mongoose';
import { DESIGNATION_STATUS, COLLECTION_NAME, DESIGNATION_CODE_PREFIX, DESIGNATION_CODE_PADDING } from './designation.constants.js';

const designationSchema = new mongoose.Schema(
  {
    designationCode: {
      type: String,
      required: [true, 'Designation code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    designationName: {
      type: String,
      required: [true, 'Designation name is required'],
      trim: true,
      maxlength: [100, 'Designation name cannot exceed 100 characters']
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    hierarchyLevel: {
      type: Number,
      default: 0,
      index: true
    },
    jobGrade: {
      type: String,
      trim: true,
      default: null
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null
    },
    minimumSalary: {
      type: Number,
      default: null
    },
    maximumSalary: {
      type: Number,
      default: null
    },
    employmentTypesAllowed: [{
      type: String,
      enum: ['full_time', 'part_time', 'intern', 'contract', 'freelancer']
    }],
    defaultPermissions: [{
      type: String
    }],
    status: {
      type: String,
      enum: Object.values(DESIGNATION_STATUS),
      default: DESIGNATION_STATUS.ACTIVE,
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0
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

designationSchema.index({ designationCode: 1 });
designationSchema.index({ designationName: 1, isDeleted: 1 });
designationSchema.index({ department: 1, isDeleted: 1 });
designationSchema.index({ hierarchyLevel: 1, isDeleted: 1 });
designationSchema.index({ jobGrade: 1, isDeleted: 1 });
designationSchema.index({ status: 1, isDeleted: 1 });
designationSchema.index({ displayOrder: 1, isDeleted: 1 });
designationSchema.index({ createdAt: -1 });

designationSchema.virtual('salaryRange').get(function() {
  if (this.minimumSalary === null && this.maximumSalary === null) return null;
  return {
    minimum: this.minimumSalary,
    maximum: this.maximumSalary
  };
});

designationSchema.virtual('isSenior').get(function() {
  return this.hierarchyLevel >= 5;
});

designationSchema.virtual('isJunior').get(function() {
  return this.hierarchyLevel <= 2;
});

designationSchema.virtual('isManagement').get(function() {
  return this.hierarchyLevel >= 4;
});

designationSchema.methods.isActive = function() {
  return this.status === DESIGNATION_STATUS.ACTIVE && !this.isDeleted;
};

designationSchema.methods.hasEmployees = async function() {
  const Employee = mongoose.model('Employee');
  const count = await Employee.countDocuments({ designation: this._id, isDeleted: false });
  return count > 0;
};

designationSchema.methods.getEmployeeCount = async function() {
  const Employee = mongoose.model('Employee');
  return Employee.countDocuments({ designation: this._id, isDeleted: false });
};

designationSchema.methods.canBeDeleted = async function() {
  const hasEmployees = await this.hasEmployees();
  return !hasEmployees;
};

designationSchema.methods.isSalaryInRange = function(salary) {
  if (this.minimumSalary === null && this.maximumSalary === null) return true;
  if (this.minimumSalary !== null && salary < this.minimumSalary) return false;
  if (this.maximumSalary !== null && salary > this.maximumSalary) return false;
  return true;
};

designationSchema.methods.allowsEmploymentType = function(type) {
  if (!this.employmentTypesAllowed || this.employmentTypesAllowed.length === 0) return true;
  return this.employmentTypesAllowed.includes(type);
};

designationSchema.statics.findByCode = function(designationCode) {
  return this.findOne({ designationCode: designationCode.toUpperCase(), isDeleted: false });
};

designationSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, isDeleted: false }).sort({ displayOrder: 1, hierarchyLevel: -1, designationName: 1 });
};

designationSchema.statics.findByHierarchyLevel = function(level) {
  return this.find({ hierarchyLevel: level, isDeleted: false }).sort({ displayOrder: 1, designationName: 1 });
};

designationSchema.statics.findByJobGrade = function(grade) {
  return this.find({ jobGrade: grade, isDeleted: false }).sort({ displayOrder: 1, designationName: 1 });
};

designationSchema.statics.findByStatus = function(status) {
  return this.find({ status, isDeleted: false }).sort({ displayOrder: 1, hierarchyLevel: -1, designationName: 1 });
};

designationSchema.statics.findActive = function() {
  return this.find({ status: DESIGNATION_STATUS.ACTIVE, isDeleted: false }).sort({ displayOrder: 1, hierarchyLevel: -1, designationName: 1 });
};

designationSchema.statics.findByHierarchyRange = function(minLevel, maxLevel) {
  return this.find({ hierarchyLevel: { $gte: minLevel, $lte: maxLevel }, isDeleted: false }).sort({ hierarchyLevel: -1, displayOrder: 1, designationName: 1 });
};

designationSchema.statics.countByStatus = function(status) {
  return this.countDocuments({ status, isDeleted: false });
};

designationSchema.statics.countByDepartment = function(departmentId) {
  return this.countDocuments({ department: departmentId, isDeleted: false });
};

designationSchema.statics.countByHierarchyLevel = function(level) {
  return this.countDocuments({ hierarchyLevel: level, isDeleted: false });
};

designationSchema.statics.generateDesignationCode = async function() {
  const lastDesignation = await this.findOne().sort({ createdAt: -1 }).select('designationCode');
  let lastNumber = 0;
  
  if (lastDesignation && lastDesignation.designationCode) {
    const lastNumStr = lastDesignation.designationCode.replace(DESIGNATION_CODE_PREFIX, '');
    lastNumber = parseInt(lastNumStr, 10) || 0;
  }
  
  const nextNumber = lastNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(DESIGNATION_CODE_PADDING, '0');
  return `${DESIGNATION_CODE_PREFIX}${paddedNumber}`;
};

designationSchema.query.byDepartment = function(departmentId) {
  return this.where({ department: departmentId, isDeleted: false });
};

designationSchema.query.byHierarchyLevel = function(level) {
  return this.where({ hierarchyLevel: level, isDeleted: false });
};

designationSchema.query.byJobGrade = function(grade) {
  return this.where({ jobGrade: grade, isDeleted: false });
};

designationSchema.query.byStatus = function(status) {
  return this.where({ status, isDeleted: false });
};

designationSchema.query.active = function() {
  return this.where({ status: DESIGNATION_STATUS.ACTIVE, isDeleted: false });
};

designationSchema.query.management = function() {
  return this.where({ hierarchyLevel: { $gte: 4 }, isDeleted: false });
};

designationSchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

designationSchema.pre('save', async function(next) {
  if (this.isModified('designationCode')) {
    this.designationCode = this.designationCode.toUpperCase();
  }
  
  if (this.isModified('minimumSalary') || this.isModified('maximumSalary')) {
    if (this.minimumSalary !== null && this.maximumSalary !== null && this.minimumSalary > this.maximumSalary) {
      return next(new Error('Minimum salary cannot be greater than maximum salary'));
    }
  }
  
  next();
});

designationSchema.methods.toJSON = function() {
  const designation = this.toObject();
  delete designation.__v;
  return designation;
};

const Designation = mongoose.model('Designation', designationSchema);

export default Designation;
