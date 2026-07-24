import mongoose from 'mongoose';
import { DOCUMENT_STATUS, COLLECTION_NAME } from './employeeDocument.constants.js';

const employeeDocumentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: Object.values({ CNIC: 'cnic', PASSPORT: 'passport', RESUME: 'resume', CV: 'cv', APPOINTMENT_LETTER: 'appointment_letter', EMPLOYMENT_AGREEMENT: 'employment_agreement', OFFER_LETTER: 'offer_letter', EXPERIENCE_LETTER: 'experience_letter', EDUCATIONAL_CERTIFICATE: 'educational_certificate', PROFESSIONAL_CERTIFICATE: 'professional_certificate', SALARY_SLIP: 'salary_slip', PERFORMANCE_REVIEW: 'performance_review', WARNING_LETTER: 'warning_letter', PROMOTION_LETTER: 'promotion_letter', MEDICAL_CERTIFICATE: 'medical_certificate', OTHER: 'other' }),
      index: true
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
      default: null
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required']
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true
    },
    expiryDate: {
      type: Date,
      default: null
    },
    issueDate: {
      type: Date,
      default: null
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
      index: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    version: {
      type: Number,
      default: 1
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.PENDING,
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

employeeDocumentSchema.index({ employee: 1, documentType: 1, isDeleted: 1 });
employeeDocumentSchema.index({ employee: 1, isDeleted: 1 });
employeeDocumentSchema.index({ documentType: 1, isDeleted: 1 });
employeeDocumentSchema.index({ status: 1, isDeleted: 1 });
employeeDocumentSchema.index({ uploadedBy: 1, isDeleted: 1 });
employeeDocumentSchema.index({ isVerified: 1, isDeleted: 1 });
employeeDocumentSchema.index({ expiryDate: 1, isDeleted: 1 });
employeeDocumentSchema.index({ createdAt: -1 });

employeeDocumentSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

employeeDocumentSchema.virtual('isExpiringSoon').get(function() {
  if (!this.expiryDate) return false;
  const daysUntilExpiry = Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
});

employeeDocumentSchema.virtual('fileSizeInMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

employeeDocumentSchema.virtual('fileExtension').get(function() {
  if (!this.originalFileName) return '';
  return this.originalFileName.split('.').pop().toLowerCase();
});

employeeDocumentSchema.methods.isActive = function() {
  return this.status === DOCUMENT_STATUS.VERIFIED && !this.isDeleted && !this.isExpired;
};

employeeDocumentSchema.methods.canBeDeleted = function() {
  return !this.isVerified;
};

employeeDocumentSchema.methods.canBeVerified = function() {
  return this.status === DOCUMENT_STATUS.PENDING && !this.isDeleted;
};

employeeDocumentSchema.methods.markAsVerified = function(verifiedBy) {
  this.isVerified = true;
  this.status = DOCUMENT_STATUS.VERIFIED;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
};

employeeDocumentSchema.methods.incrementVersion = function() {
  this.version += 1;
};

employeeDocumentSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ employee: employeeId, isDeleted: false }).sort({ createdAt: -1 });
};

employeeDocumentSchema.statics.findByEmployeeAndType = function(employeeId, documentType) {
  return this.findOne({ employee: employeeId, documentType, isDeleted: false });
};

employeeDocumentSchema.statics.findByDocumentType = function(documentType) {
  return this.find({ documentType, isDeleted: false }).sort({ createdAt: -1 });
};

employeeDocumentSchema.statics.findByStatus = function(status) {
  return this.find({ status, isDeleted: false }).sort({ createdAt: -1 });
};

employeeDocumentSchema.statics.findVerified = function() {
  return this.find({ isVerified: true, isDeleted: false }).sort({ createdAt: -1 });
};

employeeDocumentSchema.statics.findPending = function() {
  return this.find({ status: DOCUMENT_STATUS.PENDING, isDeleted: false }).sort({ createdAt: -1 });
};

employeeDocumentSchema.statics.findExpired = function() {
  return this.find({ expiryDate: { $lt: new Date() }, isDeleted: false }).sort({ expiryDate: 1 });
};

employeeDocumentSchema.statics.findExpiringSoon = function(days = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return this.find({
    expiryDate: { $gte: new Date(), $lte: expiryDate },
    isDeleted: false
  }).sort({ expiryDate: 1 });
};

employeeDocumentSchema.statics.countByEmployee = function(employeeId) {
  return this.countDocuments({ employee: employeeId, isDeleted: false });
};

employeeDocumentSchema.statics.countByType = function(documentType) {
  return this.countDocuments({ documentType, isDeleted: false });
};

employeeDocumentSchema.statics.countByStatus = function(status) {
  return this.countDocuments({ status, isDeleted: false });
};

employeeDocumentSchema.query.byEmployee = function(employeeId) {
  return this.where({ employee: employeeId, isDeleted: false });
};

employeeDocumentSchema.query.byDocumentType = function(documentType) {
  return this.where({ documentType, isDeleted: false });
};

employeeDocumentSchema.query.byStatus = function(status) {
  return this.where({ status, isDeleted: false });
};

employeeDocumentSchema.query.verified = function() {
  return this.where({ isVerified: true, isDeleted: false });
};

employeeDocumentSchema.query.pending = function() {
  return this.where({ status: DOCUMENT_STATUS.PENDING, isDeleted: false });
};

employeeDocumentSchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

employeeDocumentSchema.pre('save', function(next) {
  if (this.isModified('expiryDate') && this.expiryDate) {
    if (this.expiryDate < new Date()) {
      this.status = DOCUMENT_STATUS.EXPIRED;
    }
  }
  next();
});

employeeDocumentSchema.methods.toJSON = function() {
  const document = this.toObject();
  delete document.__v;
  delete document.cloudinaryPublicId;
  return document;
};

const EmployeeDocument = mongoose.model('EmployeeDocument', employeeDocumentSchema);

export default EmployeeDocument;
