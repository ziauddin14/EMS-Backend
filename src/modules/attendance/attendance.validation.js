import { z } from 'zod';
import { ATTENDANCE_STATUS, APPROVAL_STATUS } from './attendance.constants.js';

export const createAttendanceSchema = z.object({
  employee: z.string().min(1, 'Employee ID is required'),
  attendanceDate: z.string().min(1, 'Attendance date is required'),
  officeShift: z.string().optional(),
  attendanceStatus: z.enum(Object.values(ATTENDANCE_STATUS)).optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  workingMinutes: z.number().int().min(0).optional(),
  workingHours: z.number().min(0).optional(),
  breakMinutes: z.number().int().min(0).optional(),
  lateMinutes: z.number().int().min(0).optional(),
  earlyExitMinutes: z.number().int().min(0).optional(),
  overtimeMinutes: z.number().int().min(0).optional(),
  remarks: z.string().max(500).optional(),
  approvalStatus: z.enum(Object.values(APPROVAL_STATUS)).optional(),
  adjustmentRequested: z.boolean().optional(),
  adjustmentReason: z.string().max(500).optional(),
  isHoliday: z.boolean().optional(),
  isWeekend: z.boolean().optional(),
  isManualEntry: z.boolean().optional(),
  location: z.object({
    type: z.enum(['office', 'remote', 'field', 'client_site']).optional(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional()
    }).optional(),
    address: z.string().optional(),
    geoFenceVerified: z.boolean().optional()
  }).optional(),
  device: z.object({
    type: z.enum(['web', 'mobile', 'biometric', 'kiosk', 'api']).optional(),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

export const updateAttendanceSchema = z.object({
  officeShift: z.string().optional(),
  attendanceStatus: z.enum(Object.values(ATTENDANCE_STATUS)).optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  workingMinutes: z.number().int().min(0).optional(),
  workingHours: z.number().min(0).optional(),
  breakMinutes: z.number().int().min(0).optional(),
  lateMinutes: z.number().int().min(0).optional(),
  earlyExitMinutes: z.number().int().min(0).optional(),
  overtimeMinutes: z.number().int().min(0).optional(),
  remarks: z.string().max(500).optional(),
  approvalStatus: z.enum(Object.values(APPROVAL_STATUS)).optional(),
  adjustmentRequested: z.boolean().optional(),
  adjustmentReason: z.string().max(500).optional(),
  isHoliday: z.boolean().optional(),
  isWeekend: z.boolean().optional(),
  isManualEntry: z.boolean().optional(),
  location: z.object({
    type: z.enum(['office', 'remote', 'field', 'client_site']).optional(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional()
    }).optional(),
    address: z.string().optional(),
    geoFenceVerified: z.boolean().optional()
  }).optional(),
  device: z.object({
    type: z.enum(['web', 'mobile', 'biometric', 'kiosk', 'api']).optional(),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

export const requestAdjustmentSchema = z.object({
  adjustmentReason: z.string().min(1, 'Adjustment reason is required').max(500)
});

export const rejectAttendanceSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required').max(500)
});

export const bulkCreateAttendanceSchema = z.object({
  attendances: z.array(createAttendanceSchema).min(1, 'At least one attendance record is required')
});

export const bulkUpdateAttendanceSchema = z.object({
  filter: z.record(z.any()).min(1, 'Filter is required'),
  updateData: z.record(z.any()).min(1, 'Update data is required')
});

export const bulkDeleteAttendanceSchema = z.object({
  filter: z.record(z.any()).min(1, 'Filter is required')
});

export const attendanceIdSchema = z.object({
  id: z.string().min(1, 'Attendance ID is required')
});

export const employeeIdSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const shiftIdSchema = z.object({
  shiftId: z.string().min(1, 'Shift ID is required')
});

export const attendanceStatusSchema = z.object({
  status: z.enum(Object.values(ATTENDANCE_STATUS))
});

export const dateRangeSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required')
});

export const checkInSchema = z.object({
  location: z.object({
    type: z.enum(['office', 'remote', 'field', 'client_site']).optional(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional()
    }).optional(),
    address: z.string().optional(),
    geoFenceVerified: z.boolean().optional()
  }).optional(),
  device: z.object({
    type: z.enum(['web', 'mobile', 'biometric', 'kiosk', 'api']).optional(),
    deviceId: z.string().optional(),
    deviceName: z.string().optional()
  }).optional(),
  remarks: z.string().max(500).optional()
});

export const checkOutSchema = z.object({
  location: z.object({
    type: z.enum(['office', 'remote', 'field', 'client_site']).optional(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional()
    }).optional(),
    address: z.string().optional(),
    geoFenceVerified: z.boolean().optional()
  }).optional(),
  device: z.object({
    type: z.enum(['web', 'mobile', 'biometric', 'kiosk', 'api']).optional(),
    deviceId: z.string().optional(),
    deviceName: z.string().optional()
  }).optional(),
  remarks: z.string().max(500).optional()
});

export const breakStartSchema = z.object({
  reason: z.string().max(500).optional(),
  type: z.enum(['regular', 'lunch', 'prayer', 'medical', 'personal']).optional()
});

export const breakEndSchema = z.object({
  remarks: z.string().max(500).optional()
});

export const monthlyAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12)
});

export const departmentAttendanceSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required')
});

export const statisticsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  departmentId: z.string().optional(),
  employeeId: z.string().optional()
});

export const summarySchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required')
});

export const todayAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const trendSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  days: z.number().int().min(1).max(365).optional().default(30)
});
