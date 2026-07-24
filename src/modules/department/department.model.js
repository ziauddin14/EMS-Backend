import mongoose from 'mongoose';
import { DEPARTMENT_STATUS, COLLECTION_NAME, DEPARTMENT_CODE_PREFIX, DEPARTMENT_CODE_PADDING } from './department.constants.js';

const departmentSchema = new mongoose.Schema(
  {
    departmentCode: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null
    },
    parentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    departmentHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true
    },
    departmentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    departmentPhone: {
      type: String,
      trim: true,
      default: null
    },
    officeLocation: {
      type: String,
      trim: true,
      default: null
    },
    colorCode: {
      type: String,
      trim: true,
      default: null
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(DEPARTMENT_STATUS),
      default: DEPARTMENT_STATUS.ACTIVE,
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

departmentSchema.index({ departmentCode: 1 });
departmentSchema.index({ departmentName: 1, isDeleted: 1 });
departmentSchema.index({ parentDepartment: 1, isDeleted: 1 });
departmentSchema.index({ departmentHead: 1, isDeleted: 1 });
departmentSchema.index({ status: 1, isDeleted: 1 });
departmentSchema.index({ displayOrder: 1, isDeleted: 1 });
departmentSchema.index({ createdAt: -1 });

departmentSchema.virtual('hasChildren').get(function() {
  return this.parentDepartment !== null;
});

departmentSchema.virtual('isRoot').get(function() {
  return this.parentDepartment === null;
});

departmentSchema.virtual('level').get(async function() {
  if (!this.parentDepartment) return 0;
  let level = 0;
  let current = this;
  while (current.parentDepartment) {
    level++;
    current = await this.constructor.findById(current.parentDepartment);
    if (!current) break;
  }
  return level;
});

departmentSchema.methods.isActive = function() {
  return this.status === DEPARTMENT_STATUS.ACTIVE && !this.isDeleted;
};

departmentSchema.methods.hasChildDepartments = async function() {
  const count = await this.constructor.countDocuments({ parentDepartment: this._id, isDeleted: false });
  return count > 0;
};

departmentSchema.methods.hasEmployees = async function() {
  const Employee = mongoose.model('Employee');
  const count = await Employee.countDocuments({ department: this._id, isDeleted: false });
  return count > 0;
};

departmentSchema.methods.getEmployeeCount = async function() {
  const Employee = mongoose.model('Employee');
  return Employee.countDocuments({ department: this._id, isDeleted: false });
};

departmentSchema.methods.getChildDepartments = async function() {
  return this.constructor.find({ parentDepartment: this._id, isDeleted: false }).sort({ displayOrder: 1, departmentName: 1 });
};

departmentSchema.methods.getHierarchyPath = async function() {
  const path = [this];
  let current = this;
  while (current.parentDepartment) {
    current = await this.constructor.findById(current.parentDepartment);
    if (!current) break;
    path.unshift(current);
  }
  return path;
};

departmentSchema.methods.canBeDeleted = async function() {
  const hasChildren = await this.hasChildDepartments();
  const hasEmployees = await this.hasEmployees();
  return !hasChildren && !hasEmployees;
};

departmentSchema.statics.findByCode = function(departmentCode) {
  return this.findOne({ departmentCode: departmentCode.toUpperCase(), isDeleted: false });
};

departmentSchema.statics.findByDepartmentHead = function(headId) {
  return this.findOne({ departmentHead: headId, isDeleted: false });
};

departmentSchema.statics.findByParentDepartment = function(parentId) {
  return this.find({ parentDepartment: parentId, isDeleted: false }).sort({ displayOrder: 1, departmentName: 1 });
};

departmentSchema.statics.findRootDepartments = function() {
  return this.find({ parentDepartment: null, isDeleted: false }).sort({ displayOrder: 1, departmentName: 1 });
};

departmentSchema.statics.findByStatus = function(status) {
  return this.find({ status, isDeleted: false }).sort({ displayOrder: 1, departmentName: 1 });
};

departmentSchema.statics.findActive = function() {
  return this.find({ status: DEPARTMENT_STATUS.ACTIVE, isDeleted: false }).sort({ displayOrder: 1, departmentName: 1 });
};

departmentSchema.statics.countByStatus = function(status) {
  return this.countDocuments({ status, isDeleted: false });
};

departmentSchema.statics.generateDepartmentCode = async function() {
  const lastDepartment = await this.findOne().sort({ createdAt: -1 }).select('departmentCode');
  let lastNumber = 0;
  
  if (lastDepartment && lastDepartment.departmentCode) {
    const lastNumStr = lastDepartment.departmentCode.replace(DEPARTMENT_CODE_PREFIX, '');
    lastNumber = parseInt(lastNumStr, 10) || 0;
  }
  
  const nextNumber = lastNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(DEPARTMENT_CODE_PADDING, '0');
  return `${DEPARTMENT_CODE_PREFIX}${paddedNumber}`;
};

departmentSchema.statics.buildTree = async function() {
  const departments = await this.find({ isDeleted: false }).sort({ displayOrder: 1, departmentName: 1 });
  const departmentMap = {};
  const roots = [];

  departments.forEach(dept => {
    departmentMap[dept._id.toString()] = { ...dept.toObject(), children: [] };
  });

  departments.forEach(dept => {
    if (dept.parentDepartment && departmentMap[dept.parentDepartment.toString()]) {
      departmentMap[dept.parentDepartment.toString()].children.push(departmentMap[dept._id.toString()]);
    } else {
      roots.push(departmentMap[dept._id.toString()]);
    }
  });

  return roots;
};

departmentSchema.query.byParent = function(parentId) {
  return this.where({ parentDepartment: parentId, isDeleted: false });
};

departmentSchema.query.byDepartmentHead = function(headId) {
  return this.where({ departmentHead: headId, isDeleted: false });
};

departmentSchema.query.byStatus = function(status) {
  return this.where({ status, isDeleted: false });
};

departmentSchema.query.active = function() {
  return this.where({ status: DEPARTMENT_STATUS.ACTIVE, isDeleted: false });
};

departmentSchema.query.root = function() {
  return this.where({ parentDepartment: null, isDeleted: false });
};

departmentSchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

departmentSchema.pre('save', async function(next) {
  if (this.isModified('departmentCode')) {
    this.departmentCode = this.departmentCode.toUpperCase();
  }
  next();
});

departmentSchema.methods.toJSON = function() {
  const department = this.toObject();
  delete department.__v;
  return department;
};

const Department = mongoose.model('Department', departmentSchema);

export default Department;
