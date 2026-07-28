import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from './meeting.constants.js';

const meetingAttendanceSchema = new mongoose.Schema({
  // Meeting Reference
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
    index: true
  },
  
  // Employee Reference
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  
  // Check In/Out
  checkIn: {
    type: Date,
    index: true
  },
  checkOut: {
    type: Date
  },
  
  // Attendance Status
  status: {
    type: String,
    enum: Object.values(ATTENDANCE_STATUS),
    default: ATTENDANCE_STATUS.ABSENT,
    index: true
  },
  
  // Late/Early Leave
  lateMinutes: {
    type: Number,
    default: 0,
    min: 0
  },
  leftEarly: {
    type: Boolean,
    default: false
  },
  
  // Duration
  duration: {
    type: Number, // in minutes
    default: 0,
    min: 0
  },
  
  // Participation
  participationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Remarks
  remarks: {
    type: String,
    trim: true,
    maxlength: 1000
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
meetingAttendanceSchema.index({ meeting: 1, employee: 1, isDeleted: 1 }, { unique: true });
meetingAttendanceSchema.index({ meeting: 1, status: 1, isDeleted: 1 });
meetingAttendanceSchema.index({ employee: 1, checkIn: 1, isDeleted: 1 });
meetingAttendanceSchema.index({ checkIn: 1, isDeleted: 1 });
meetingAttendanceSchema.index({ status: 1, isDeleted: 1 });

// Static Methods
meetingAttendanceSchema.statics.findByMeeting = function(meetingId, options = {}) {
  const { filter = {}, sort = { checkIn: 1 } } = options;
  return this.find({
    meeting: meetingId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .populate('employee', '_id firstName lastName employeeId')
  .lean();
};

meetingAttendanceSchema.statics.findByEmployee = function(employeeId, options = {}) {
  const { filter = {}, sort = { checkIn: -1 }, limit = 100 } = options;
  return this.find({
    employee: employeeId,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('meeting', '_id title startTime endTime')
  .lean();
};

meetingAttendanceSchema.statics.findByStatus = function(status, options = {}) {
  const { filter = {}, sort = { checkIn: -1 }, limit = 100 } = options;
  return this.find({
    status,
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('meeting', '_id title startTime endTime')
  .populate('employee', '_id firstName lastName employeeId')
  .lean();
};

meetingAttendanceSchema.statics.findByDateRange = function(startDate, endDate, options = {}) {
  const { filter = {}, sort = { checkIn: -1 }, limit = 100 } = options;
  return this.find({
    checkIn: { $gte: startDate, $lte: endDate },
    isDeleted: false,
    ...filter
  })
  .sort(sort)
  .limit(limit)
  .populate('meeting', '_id title startTime endTime')
  .populate('employee', '_id firstName lastName employeeId')
  .lean();
};

meetingAttendanceSchema.statics.getMeetingAttendanceStats = function(meetingId) {
  return this.aggregate([
    {
      $match: {
        meeting: meetingId,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        averageParticipation: { $avg: '$participationScore' }
      }
    }
  ]);
};

meetingAttendanceSchema.statics.getEmployeeAttendanceStats = function(employeeId, startDate, endDate) {
  const matchStage = {
    employee: employeeId,
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchStage.checkIn = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    {
      $match: matchStage
    },
    {
      $group: {
        _id: null,
        totalMeetings: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.PRESENT] }, 1, 0] }
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.ABSENT] }, 1, 0] }
        },
        lateCount: {
          $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.LATE] }, 1, 0] }
        },
        averageParticipation: { $avg: '$participationScore' },
        totalLateMinutes: { $sum: '$lateMinutes' }
      }
    }
  ]);
};

// Instance Methods
meetingAttendanceSchema.methods.checkIn = function(checkInTime) {
  this.checkIn = checkInTime || new Date();
  this.status = ATTENDANCE_STATUS.PRESENT;
  
  // Check if late (more than 5 minutes after meeting start)
  const Meeting = mongoose.model('Meeting');
  return Meeting.findById(this.meeting).then(meeting => {
    if (meeting && meeting.startTime) {
      const lateThreshold = new Date(meeting.startTime.getTime() + 5 * 60 * 1000);
      if (this.checkIn > lateThreshold) {
        this.lateMinutes = Math.round((this.checkIn - meeting.startTime) / (1000 * 60));
        this.status = ATTENDANCE_STATUS.LATE;
      }
    }
    return this.save();
  });
};

meetingAttendanceSchema.methods.checkOut = function(checkOutTime) {
  this.checkOut = checkOutTime || new Date();
  
  if (this.checkIn) {
    this.duration = Math.round((this.checkOut - this.checkIn) / (1000 * 60));
  }
  
  // Check if left early
  const Meeting = mongoose.model('Meeting');
  return Meeting.findById(this.meeting).then(meeting => {
    if (meeting && meeting.endTime) {
      const earlyThreshold = new Date(meeting.endTime.getTime() - 5 * 60 * 1000);
      if (this.checkOut < earlyThreshold) {
        this.leftEarly = true;
      }
    }
    return this.save();
  });
};

meetingAttendanceSchema.methods.markAbsent = function(reason) {
  this.status = ATTENDANCE_STATUS.ABSENT;
  this.remarks = reason || this.remarks;
  return this.save();
};

meetingAttendanceSchema.methods.markExcused = function(reason) {
  this.status = ATTENDANCE_STATUS.EXCUSED;
  this.remarks = reason || this.remarks;
  return this.save();
};

meetingAttendanceSchema.methods.markNoShow = function() {
  this.status = ATTENDANCE_STATUS.NO_SHOW;
  return this.save();
};

meetingAttendanceSchema.methods.updateParticipationScore = function(score) {
  this.participationScore = Math.min(100, Math.max(0, score));
  return this.save();
};

meetingAttendanceSchema.methods.calculateDuration = function() {
  if (this.checkIn && this.checkOut) {
    this.duration = Math.round((this.checkOut - this.checkIn) / (1000 * 60));
  }
  return this.save();
};

const MeetingAttendance = mongoose.model('MeetingAttendance', meetingAttendanceSchema);

export default MeetingAttendance;
