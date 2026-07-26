import { z } from 'zod';

export const createPolicySchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  policyName: z.string().min(1, 'Policy name is required').max(200),
  graceMinutes: z.number().int().min(0).max(60).optional(),
  lateAfterMinutes: z.number().int().min(0).max(120).optional(),
  halfDayMinutes: z.number().int().min(0).max(480).optional(),
  minimumWorkingMinutes: z.number().int().min(0).max(1440).optional(),
  maximumWorkingMinutes: z.number().int().min(0).max(2880).optional(),
  allowOvertime: z.boolean().optional(),
  maximumOvertimeMinutes: z.number().int().min(0).max(480).optional(),
  allowRemoteAttendance: z.boolean().optional(),
  allowWeekendAttendance: z.boolean().optional(),
  allowHolidayAttendance: z.boolean().optional(),
  allowManualAttendance: z.boolean().optional(),
  allowAttendanceCorrection: z.boolean().optional(),
  maximumCorrectionDays: z.number().int().min(0).max(30).optional(),
  requireManagerApproval: z.boolean().optional(),
  requireHRApproval: z.boolean().optional(),
  latePenaltyEnabled: z.boolean().optional(),
  autoAbsentEnabled: z.boolean().optional(),
  workingDays: z.array(z.number().int().min(0).max(6)).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional()
}).refine(data => {
  if (data.minimumWorkingMinutes && data.maximumWorkingMinutes) {
    return data.minimumWorkingMinutes <= data.maximumWorkingMinutes;
  }
  return true;
}, {
  message: 'Minimum working minutes cannot be greater than maximum working minutes',
  path: ['minimumWorkingMinutes']
});

export const updatePolicySchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  policyName: z.string().min(1).max(200).optional(),
  graceMinutes: z.number().int().min(0).max(60).optional(),
  lateAfterMinutes: z.number().int().min(0).max(120).optional(),
  halfDayMinutes: z.number().int().min(0).max(480).optional(),
  minimumWorkingMinutes: z.number().int().min(0).max(1440).optional(),
  maximumWorkingMinutes: z.number().int().min(0).max(2880).optional(),
  allowOvertime: z.boolean().optional(),
  maximumOvertimeMinutes: z.number().int().min(0).max(480).optional(),
  allowRemoteAttendance: z.boolean().optional(),
  allowWeekendAttendance: z.boolean().optional(),
  allowHolidayAttendance: z.boolean().optional(),
  allowManualAttendance: z.boolean().optional(),
  allowAttendanceCorrection: z.boolean().optional(),
  maximumCorrectionDays: z.number().int().min(0).max(30).optional(),
  requireManagerApproval: z.boolean().optional(),
  requireHRApproval: z.boolean().optional(),
  latePenaltyEnabled: z.boolean().optional(),
  autoAbsentEnabled: z.boolean().optional(),
  workingDays: z.array(z.number().int().min(0).max(6)).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional()
});

export const policyIdSchema = z.object({
  id: z.string().min(1, 'Policy ID is required')
});

export const policyStatusSchema = z.object({
  status: z.enum(['true', 'false'])
});
