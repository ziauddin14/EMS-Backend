import mongoose from 'mongoose';
import { MEETING_TYPE, MEETING_CATEGORY, MEETING_MODE, MEETING_PLATFORM, MEETING_PRIORITY, MEETING_STATUS, APPROVAL_STATUS, RECURRING_PATTERN } from './meeting.constants.js';

const meetingSchema = new mongoose.Schema({
  // Basic Information
  meetingCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
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
  
  // Meeting Classification
  type: {
    type: String,
    enum: Object.values(MEETING_TYPE),
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: Object.values(MEETING_CATEGORY),
    default: MEETING_CATEGORY.INTERNAL,
    index: true
  },
  mode: {
    type: String,
    enum: Object.values(MEETING_MODE),
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: Object.values(MEETING_PLATFORM),
    default: MEETING_PLATFORM.OTHER
  },
  
  // Organizational Context
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    index: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    index: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  
  // People
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    index: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  guests: [{
    name: String,
    email: String,
    organization: String
  }],
  
  // Meeting Details
  meetingRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeetingRoom'
  },
  onlineMeetingUrl: {
    type: String,
    trim: true
  },
  meetingPassword: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15,
    max: 480
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  priority: {
    type: String,
    enum: Object.values(MEETING_PRIORITY),
    default: MEETING_PRIORITY.MEDIUM,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(MEETING_STATUS),
    default: MEETING_STATUS.DRAFT,
    index: true
  },
  approvalStatus: {
    type: String,
    enum: Object.values(APPROVAL_STATUS),
    default: APPROVAL_STATUS.APPROVED
  },
  
  // Agenda
  agenda: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agenda'
  }],
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    uploadedAt: Date
  }],
  
  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  
  // Tags
  tags: [{
    type: String,
    trim: true
  }],
  
  // Recording
  recordingUrl: {
    type: String,
    trim: true
  },
  transcriptUrl: {
    type: String,
    trim: true
  },
  
  // Recurring
  isRecurring: {
    type: Boolean,
    default: false,
    index: true
  },
  recurringPattern: {
    type: String,
    enum: Object.values(RECURRING_PATTERN)
  },
  recurringEndDate: {
    type: Date
  },
  parentMeeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    index: true
  },
  
  // Statistics
  totalParticipants: {
    type: Number,
    default: 0
  },
  actualAttendees: {
    type: Number,
    default: 0
  },
  attendanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
meetingSchema.index({ organizer: 1, startTime: 1, isDeleted: 1 });
meetingSchema.index({ department: 1, startTime: 1, isDeleted: 1 });
meetingSchema.index({ project: 1, startTime: 1, isDeleted: 1 });
meetingSchema.index({ participants: 1, startTime: 1, isDeleted: 1 });
meetingSchema.index({ status: 1, startTime: 1, isDeleted: 1 });
meetingSchema.index({ startTime: 1, endTime: 1, isDeleted: 1 });
meetingSchema.index({ type: 1, status: 1, isDeleted: 1 });
meetingSchema.index({ priority: 1, status: 1, isDeleted: 1 });
meetingSchema.index({ isRecurring: 1, parentMeeting: 1, isDeleted: 1 });

// Static Methods
meetingSchema.statics.findByOrganizer = function(organizerId, options = {}) {
  const { filter = {}, sort = { startTime: -1 }, limit = 100, skip = 0 } = options;
  return this.find({
    organizer: organizerId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .skip(skip)
  .populate('organizer', '_id firstName lastName employeeId')
  .populate('host', '_id firstName lastName employeeId')
  .populate('participants', '_id firstName lastName employeeId')
  .populate('department', '_id name')
  .populate('project', '_id name')
  .lean();
};

meetingSchema.statics.findByParticipant = function(participantId, options = {}) {
  const { filter = {}, sort = { startTime: -1 }, limit = 100, skip = 0 } = options;
  return this.find({
    participants: participantId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .skip(skip)
  .populate('organizer', '_id firstName lastName employeeId')
  .populate('host', '_id firstName lastName employeeId')
  .populate('participants', '_id firstName lastName employeeId')
  .populate('department', '_id name')
  .populate('project', '_id name')
  .lean();
};

meetingSchema.statics.findByDepartment = function(departmentId, options = {}) {
  const { filter = {}, sort = { startTime: -1 }, limit = 100, skip = 0 } = options;
  return this.find({
    department: departmentId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .skip(skip)
  .populate('organizer', '_id firstName lastName employeeId')
  .populate('host', '_id firstName lastName employeeId')
  .populate('participants', '_id firstName lastName employeeId')
  .populate('department', '_id name')
  .populate('project', '_id name')
  .lean();
};

meetingSchema.statics.findByProject = function(projectId, options = {}) {
  const { filter = {}, sort = { startTime: -1 }, limit = 100, skip = 0 } = options;
  return this.find({
    project: projectId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .skip(skip)
  .populate('organizer', '_id firstName lastName employeeId')
  .populate('host', '_id firstName lastName employeeId')
  .populate('participants', '_id firstName lastName employeeId')
  .populate('department', '_id name')
  .populate('project', '_id name')
  .lean();
};

meetingSchema.statics.findByDateRange = function(startDate, endDate, options = {}) {
  const { filter = {}, sort = { startTime: 1 }, limit = 100, skip = 0 } = options;
  return this.find({
    startTime: { $gte: startDate, $lte: endDate },
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .skip(skip)
  .populate('organizer', '_id firstName lastName employeeId')
  .populate('host', '_id firstName lastName employeeId')
  .populate('participants', '_id firstName lastName employeeId')
  .populate('department', '_id name')
  .populate('project', '_id name')
  .lean();
};

meetingSchema.statics.findByStatus = function(status, options = {}) {
  const { filter = {}, sort = { startTime: -1 }, limit = 100, skip = 0 } = options;
  return this.find({
    status,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .skip(skip)
  .populate('organizer', '_id firstName lastName employeeId')
  .populate('host', '_id firstName lastName employeeId')
  .populate('participants', '_id firstName lastName employeeId')
  .populate('department', '_id name')
  .populate('project', '_id name')
  .lean();
};

meetingSchema.statics.findUpcoming = function(options = {}) {
  const { filter = {}, limit = 20 } = options;
  const now = new Date();
  return this.find({
    startTime: { $gte: now },
    status: MEETING_STATUS.SCHEDULED,
    isDeleted: false,
    ...filter
  })
  .sort({ startTime: 1 })
  .limit(limit)
  .populate('organizer', '_id firstName lastName employeeId')
  .populate('host', '_id firstName lastName employeeId')
  .populate('participants', '_id firstName lastName employeeId')
  .populate('department', '_id name')
  .populate('project', '_id name')
  .lean();
};

meetingSchema.statics.findPast = function(options = {}) {
  const { filter = {}, limit = 20 } = options;
  const now = new Date();
  return this.find({
    endTime: { $lt: now },
    status: { $in: [MEETING_STATUS.COMPLETED, MEETING_STATUS.CANCELLED] },
    isDeleted: false,
    ...filter
  })
  .sort({ startTime: -1 })
  .limit(limit)
  .populate('organizer', '_id firstName lastName employeeId')
  .populate('host', '_id firstName lastName employeeId')
  .populate('participants', '_id firstName lastName employeeId')
  .populate('department', '_id name')
  .populate('project', '_id name')
  .lean();
};

meetingSchema.statics.findRecurring = function(parentMeetingId, options = {}) {
  const { filter = {}, sort = { startTime: 1 } } = options;
  return this.find({
    parentMeeting: parentMeetingId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .populate('organizer', '_id firstName lastName employeeId')
  .populate('host', '_id firstName lastName employeeId')
  .populate('participants', '_id firstName lastName employeeId')
  .populate('department', '_id name')
  .populate('project', '_id name')
  .lean();
};

// Instance Methods
meetingSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = MEETING_STATUS.CANCELLED;
  this.updatedBy = cancelledBy;
  this.notes = this.notes ? `${this.notes}\n\nCancellation Reason: ${reason}` : `Cancellation Reason: ${reason}`;
  return this.save();
};

meetingSchema.methods.reschedule = function(newStartTime, newEndTime, rescheduledBy) {
  this.startTime = newStartTime;
  this.endTime = newEndTime;
  this.duration = Math.round((newEndTime - newStartTime) / (1000 * 60));
  this.updatedBy = rescheduledBy;
  return this.save();
};

meetingSchema.methods.start = function() {
  this.status = MEETING_STATUS.IN_PROGRESS;
  return this.save();
};

meetingSchema.methods.complete = function() {
  this.status = MEETING_STATUS.COMPLETED;
  return this.save();
};

meetingSchema.methods.addParticipant = function(participantId) {
  if (!this.participants.includes(participantId)) {
    this.participants.push(participantId);
    this.totalParticipants = this.participants.length;
  }
  return this.save();
};

meetingSchema.methods.removeParticipant = function(participantId) {
  this.participants = this.participants.filter(p => p.toString() !== participantId.toString());
  this.totalParticipants = this.participants.length;
  return this.save();
};

meetingSchema.methods.updateAttendanceStats = function(actualAttendees) {
  this.actualAttendees = actualAttendees;
  this.attendanceRate = this.totalParticipants > 0 
    ? Math.round((actualAttendees / this.totalParticipants) * 100) 
    : 0;
  return this.save();
};

meetingSchema.methods.generateMeetingCode = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  this.meetingCode = `MTG-${year}${month}${day}-${random}`;
  return this.save();
};

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
