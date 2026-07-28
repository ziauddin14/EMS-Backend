import mongoose from 'mongoose';
import { AGENDA_STATUS } from './meeting.constants.js';

const agendaSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // Meeting Reference
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
    index: true
  },
  
  // Agenda Details
  sequence: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true,
    min: 1,
    max: 480
  },
  presenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    index: true
  },
  
  // Content
  discussionPoints: [{
    type: String,
    trim: true
  }],
  decisionRequired: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  
  // Status
  status: {
    type: String,
    enum: Object.values(AGENDA_STATUS),
    default: AGENDA_STATUS.DRAFT,
    index: true
  },
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  deletedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
agendaSchema.index({ meeting: 1, sequence: 1, isDeleted: 1 });
agendaSchema.index({ meeting: 1, status: 1, isDeleted: 1 });
agendaSchema.index({ presenter: 1, isDeleted: 1 });

// Static Methods
agendaSchema.statics.findByMeeting = function(meetingId, options = {}) {
  const { filter = {}, sort = { sequence: 1 } } = options;
  return this.find({
    meeting: meetingId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .populate('presenter', '_id firstName lastName employeeId')
  .lean();
};

agendaSchema.statics.findByPresenter = function(presenterId, options = {}) {
  const { filter = {}, sort = { createdAt: -1 }, limit = 100 } = options;
  return this.find({
    presenter: presenterId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('meeting', '_id title startTime endTime')
  .lean();
};

agendaSchema.statics.findByStatus = function(status, options = {}) {
  const { filter = {}, sort = { createdAt: -1 }, limit = 100 } = options;
  return this.find({
    status,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('meeting', '_id title startTime endTime')
  .populate('presenter', '_id firstName lastName employeeId')
  .lean();
};

// Instance Methods
agendaSchema.methods.approve = function(approvedBy) {
  this.status = AGENDA_STATUS.APPROVED;
  this.updatedBy = approvedBy;
  return this.save();
};

agendaSchema.methods.start = function() {
  this.status = AGENDA_STATUS.IN_PROGRESS;
  return this.save();
};

agendaSchema.methods.complete = function() {
  this.status = AGENDA_STATUS.COMPLETED;
  return this.save();
};

agendaSchema.methods.cancel = function() {
  this.status = AGENDA_STATUS.CANCELLED;
  return this.save();
};

const Agenda = mongoose.model('Agenda', agendaSchema);

export default Agenda;
