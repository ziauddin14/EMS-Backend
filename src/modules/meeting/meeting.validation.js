import { z } from 'zod';
import { MEETING_TYPE, MEETING_CATEGORY, MEETING_MODE, MEETING_PLATFORM, MEETING_PRIORITY, MEETING_STATUS, RECURRING_PATTERN, AGENDA_STATUS, ATTENDANCE_STATUS, ACTION_ITEM_PRIORITY, ACTION_ITEM_STATUS } from './meeting.constants.js';

// Meeting Validation Schemas
export const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional(),
  type: z.enum(Object.values(MEETING_TYPE), { required_error: 'Meeting type is required' }),
  category: z.enum(Object.values(MEETING_CATEGORY)).optional(),
  mode: z.enum(Object.values(MEETING_MODE), { required_error: 'Meeting mode is required' }),
  platform: z.enum(Object.values(MEETING_PLATFORM)).optional(),
  department: z.string().optional(),
  branch: z.string().optional(),
  project: z.string().optional(),
  organizer: z.string({ required_error: 'Organizer is required' }),
  host: z.string().optional(),
  participants: z.array(z.string()).optional(),
  guests: z.array(z.object({
    name: z.string().min(1, 'Guest name is required'),
    email: z.string().email('Invalid email format').optional(),
    organization: z.string().optional()
  })).optional(),
  meetingRoom: z.string().optional(),
  onlineMeetingUrl: z.string().url('Invalid URL format').optional(),
  meetingPassword: z.string().optional(),
  startTime: z.date({ required_error: 'Start time is required' }),
  endTime: z.date({ required_error: 'End time is required' }),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration must not exceed 480 minutes').optional(),
  timezone: z.string().optional(),
  priority: z.enum(Object.values(MEETING_PRIORITY)).optional(),
  status: z.enum(Object.values(MEETING_STATUS)).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  agenda: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().url('Invalid URL format'),
    fileSize: z.number().optional(),
    uploadedBy: z.string().optional(),
    uploadedAt: z.date().optional()
  })).optional(),
  notes: z.string().max(5000, 'Notes must not exceed 5000 characters').optional(),
  tags: z.array(z.string()).optional(),
  recordingUrl: z.string().url('Invalid URL format').optional(),
  transcriptUrl: z.string().url('Invalid URL format').optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.enum(Object.values(RECURRING_PATTERN)).optional(),
  recurringEndDate: z.date().optional(),
  parentMeeting: z.string().optional()
}).refine(data => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime']
});

export const updateMeetingSchema = createMeetingSchema.partial();

export const cancelMeetingSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must not exceed 500 characters')
});

export const rescheduleMeetingSchema = z.object({
  newStartTime: z.date({ required_error: 'New start time is required' }),
  newEndTime: z.date({ required_error: 'New end time is required' })
}).refine(data => data.newEndTime > data.newStartTime, {
  message: 'New end time must be after new start time',
  path: ['newEndTime']
});

export const duplicateMeetingSchema = z.object({
  newStartTime: z.date({ required_error: 'New start time is required' }),
  newEndTime: z.date({ required_error: 'New end time is required' })
}).refine(data => data.newEndTime > data.newStartTime, {
  message: 'New end time must be after new start time',
  path: ['newEndTime']
});

export const addParticipantSchema = z.object({
  participantId: z.string({ required_error: 'Participant ID is required' })
});

export const removeParticipantSchema = z.object({
  participantId: z.string({ required_error: 'Participant ID is required' })
});

// Agenda Validation Schemas
export const createAgendaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional(),
  meeting: z.string({ required_error: 'Meeting ID is required' }),
  sequence: z.number().min(1, 'Sequence must be at least 1').optional(),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute').max(480, 'Estimated time must not exceed 480 minutes'),
  presenter: z.string().optional(),
  discussionPoints: z.array(z.string()).optional(),
  decisionRequired: z.boolean().optional(),
  notes: z.string().max(5000, 'Notes must not exceed 5000 characters').optional(),
  status: z.enum(Object.values(AGENDA_STATUS)).optional()
});

export const updateAgendaSchema = createAgendaSchema.partial();

export const reorderAgendasSchema = z.object({
  agendaOrders: z.array(z.object({
    agendaId: z.string({ required_error: 'Agenda ID is required' }),
    sequence: z.number().min(1, 'Sequence must be at least 1')
  })).min(1, 'At least one agenda item is required')
});

// Minutes Validation Schemas
export const createMinutesSchema = z.object({
  meeting: z.string({ required_error: 'Meeting ID is required' }),
  summary: z.string().max(5000, 'Summary must not exceed 5000 characters').optional(),
  discussion: z.string().max(10000, 'Discussion must not exceed 10000 characters').optional(),
  decisions: z.array(z.object({
    topic: z.string().min(1, 'Topic is required'),
    decision: z.string().min(1, 'Decision is required'),
    agreedBy: z.array(z.string()).optional(),
    timestamp: z.date().optional()
  })).optional(),
  risks: z.array(z.object({
    description: z.string().min(1, 'Risk description is required'),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    mitigation: z.string().optional(),
    owner: z.string().optional()
  })).optional(),
  actionItems: z.array(z.string()).optional(),
  followUpDate: z.date().optional(),
  followUpNotes: z.string().max(2000, 'Follow-up notes must not exceed 2000 characters').optional(),
  attachments: z.array(z.object({
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().url('Invalid URL format'),
    fileSize: z.number().optional(),
    uploadedBy: z.string().optional(),
    uploadedAt: z.date().optional()
  })).optional()
});

export const updateMinutesSchema = createMinutesSchema.partial();

export const rejectMinutesSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must not exceed 500 characters')
});

export const addActionItemSchema = z.object({
  actionItemId: z.string({ required_error: 'Action item ID is required' })
});

export const removeActionItemSchema = z.object({
  actionItemId: z.string({ required_error: 'Action item ID is required' })
});

// Attendance Validation Schemas
export const createAttendanceSchema = z.object({
  meeting: z.string({ required_error: 'Meeting ID is required' }),
  employee: z.string({ required_error: 'Employee ID is required' }),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  status: z.enum(Object.values(ATTENDANCE_STATUS)).optional(),
  lateMinutes: z.number().min(0, 'Late minutes must be non-negative').optional(),
  leftEarly: z.boolean().optional(),
  duration: z.number().min(0, 'Duration must be non-negative').optional(),
  participationScore: z.number().min(0, 'Participation score must be between 0 and 100').max(100).optional(),
  remarks: z.string().max(1000, 'Remarks must not exceed 1000 characters').optional()
});

export const updateAttendanceSchema = createAttendanceSchema.partial();

export const checkInSchema = z.object({
  meetingId: z.string({ required_error: 'Meeting ID is required' }),
  employeeId: z.string({ required_error: 'Employee ID is required' }),
  checkInTime: z.date().optional()
});

export const checkOutSchema = z.object({
  meetingId: z.string({ required_error: 'Meeting ID is required' }),
  employeeId: z.string({ required_error: 'Employee ID is required' }),
  checkOutTime: z.date().optional()
});

export const markAbsentSchema = z.object({
  meetingId: z.string({ required_error: 'Meeting ID is required' }),
  employeeId: z.string({ required_error: 'Employee ID is required' }),
  reason: z.string().max(1000, 'Reason must not exceed 1000 characters').optional()
});

export const markExcusedSchema = z.object({
  meetingId: z.string({ required_error: 'Meeting ID is required' }),
  employeeId: z.string({ required_error: 'Employee ID is required' }),
  reason: z.string().max(1000, 'Reason must not exceed 1000 characters').optional()
});

export const markNoShowSchema = z.object({
  meetingId: z.string({ required_error: 'Meeting ID is required' }),
  employeeId: z.string({ required_error: 'Employee ID is required' })
});

export const updateParticipationScoreSchema = z.object({
  score: z.number().min(0, 'Score must be between 0 and 100').max(100, 'Score must be between 0 and 100')
});

export const bulkCheckInSchema = z.object({
  meetingId: z.string({ required_error: 'Meeting ID is required' }),
  employeeIds: z.array(z.string()).min(1, 'At least one employee ID is required')
});

export const bulkCheckOutSchema = z.object({
  meetingId: z.string({ required_error: 'Meeting ID is required' }),
  employeeIds: z.array(z.string()).min(1, 'At least one employee ID is required')
});

// Action Item Validation Schemas
export const createActionItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional(),
  assignedEmployee: z.string({ required_error: 'Assigned employee is required' }),
  assignedDepartment: z.string().optional(),
  meeting: z.string().optional(),
  minutes: z.string().optional(),
  dueDate: z.date({ required_error: 'Due date is required' }),
  completedAt: z.date().optional(),
  priority: z.enum(Object.values(ACTION_ITEM_PRIORITY)).optional(),
  status: z.enum(Object.values(ACTION_ITEM_STATUS)).optional(),
  completionPercentage: z.number().min(0, 'Completion percentage must be between 0 and 100').max(100).optional(),
  evidence: z.array(z.object({
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().url('Invalid URL format'),
    fileSize: z.number().optional(),
    uploadedBy: z.string().optional(),
    uploadedAt: z.date().optional()
  })).optional(),
  remarks: z.string().max(2000, 'Remarks must not exceed 2000 characters').optional(),
  followUpDate: z.date().optional(),
  followUpNotes: z.string().max(1000, 'Follow-up notes must not exceed 1000 characters').optional()
}).refine(data => new Date(data.dueDate) >= new Date(), {
  message: 'Due date cannot be in the past',
  path: ['dueDate']
});

export const updateActionItemSchema = createActionItemSchema.partial().refine(data => {
  if (data.dueDate) {
    return new Date(data.dueDate) >= new Date();
  }
  return true;
}, {
  message: 'Due date cannot be in the past',
  path: ['dueDate']
});

export const updateProgressSchema = z.object({
  percentage: z.number().min(0, 'Percentage must be between 0 and 100').max(100, 'Percentage must be between 0 and 100')
});

export const putOnHoldSchema = z.object({
  reason: z.string().max(1000, 'Reason must not exceed 1000 characters').optional()
});

export const cancelActionItemSchema = z.object({
  reason: z.string().max(1000, 'Reason must not exceed 1000 characters').optional()
});

export const addEvidenceSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Invalid URL format'),
  fileSize: z.number().optional(),
  uploadedBy: z.string().optional(),
  uploadedAt: z.date().optional()
});

export const removeEvidenceSchema = z.object({
  evidenceId: z.string({ required_error: 'Evidence ID is required' })
});

export const setFollowUpSchema = z.object({
  followUpDate: z.date().optional(),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional()
});

export const bulkUpdateStatusSchema = z.object({
  actionItemIds: z.array(z.string()).min(1, 'At least one action item ID is required'),
  status: z.enum(Object.values(ACTION_ITEM_STATUS), { required_error: 'Status is required' })
});

// Query Parameter Validation Schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val) || 1),
  limit: z.string().optional().transform(val => parseInt(val) || 10),
  skip: z.string().optional().transform(val => parseInt(val) || 0)
});

export const filterSchema = z.object({
  filter: z.string().optional().transform(val => val ? JSON.parse(val) : {}),
  sort: z.string().optional().transform(val => val ? JSON.parse(val) : {}),
  limit: z.string().optional().transform(val => parseInt(val) || 100),
  skip: z.string().optional().transform(val => parseInt(val) || 0)
});

export const dateRangeSchema = z.object({
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid start date').transform(val => new Date(val)),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid end date').transform(val => new Date(val))
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

export const daysSchema = z.object({
  days: z.string().optional().transform(val => parseInt(val) || 7)
});

// Export all validation schemas
export const meetingValidationSchemas = {
  createMeeting: createMeetingSchema,
  updateMeeting: updateMeetingSchema,
  cancelMeeting: cancelMeetingSchema,
  rescheduleMeeting: rescheduleMeetingSchema,
  duplicateMeeting: duplicateMeetingSchema,
  addParticipant: addParticipantSchema,
  removeParticipant: removeParticipantSchema,
  createAgenda: createAgendaSchema,
  updateAgenda: updateAgendaSchema,
  reorderAgendas: reorderAgendasSchema,
  createMinutes: createMinutesSchema,
  updateMinutes: updateMinutesSchema,
  rejectMinutes: rejectMinutesSchema,
  addActionItem: addActionItemSchema,
  removeActionItem: removeActionItemSchema,
  createAttendance: createAttendanceSchema,
  updateAttendance: updateAttendanceSchema,
  checkIn: checkInSchema,
  checkOut: checkOutSchema,
  markAbsent: markAbsentSchema,
  markExcused: markExcusedSchema,
  markNoShow: markNoShowSchema,
  updateParticipationScore: updateParticipationScoreSchema,
  bulkCheckIn: bulkCheckInSchema,
  bulkCheckOut: bulkCheckOutSchema,
  createActionItem: createActionItemSchema,
  updateActionItem: updateActionItemSchema,
  updateProgress: updateProgressSchema,
  putOnHold: putOnHoldSchema,
  cancelActionItem: cancelActionItemSchema,
  addEvidence: addEvidenceSchema,
  removeEvidence: removeEvidenceSchema,
  setFollowUp: setFollowUpSchema,
  bulkUpdateStatus: bulkUpdateStatusSchema,
  pagination: paginationSchema,
  filter: filterSchema,
  dateRange: dateRangeSchema,
  days: daysSchema
};
