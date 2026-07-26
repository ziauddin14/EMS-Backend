import { z } from 'zod';
import { SHIFT_TYPE } from './officeShift.constants.js';

export const createShiftSchema = z.object({
  name: z.string().min(1, 'Shift name is required').max(100),
  code: z.string().min(1, 'Shift code is required'),
  description: z.string().max(500).optional(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  workingHours: z.number().min(0).max(24),
  graceMinutes: z.number().int().min(0).max(60).optional(),
  lateAfterMinutes: z.number().int().min(0).max(120).optional(),
  halfDayMinutes: z.number().int().min(0).max(480).optional(),
  minimumWorkingMinutes: z.number().int().min(0).max(1440).optional(),
  breakDuration: z.number().int().min(0).max(180).optional(),
  allowFlexibleCheckIn: z.boolean().optional(),
  allowFlexibleCheckOut: z.boolean().optional(),
  allowOvertime: z.boolean().optional(),
  allowNightShift: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  weeklyOff: z.array(z.number().int().min(0).max(6)).optional(),
  color: z.string().optional()
}).refine(data => {
  if (!data.allowNightShift) {
    const startParts = data.startTime.split(':').map(Number);
    const endParts = data.endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    return endMinutes >= startMinutes;
  }
  return true;
}, {
  message: 'End time cannot be before start time for non-night shifts',
  path: ['endTime']
});

export const updateShiftSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).optional(),
  description: z.string().max(500).optional(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  workingHours: z.number().min(0).max(24).optional(),
  graceMinutes: z.number().int().min(0).max(60).optional(),
  lateAfterMinutes: z.number().int().min(0).max(120).optional(),
  halfDayMinutes: z.number().int().min(0).max(480).optional(),
  minimumWorkingMinutes: z.number().int().min(0).max(1440).optional(),
  breakDuration: z.number().int().min(0).max(180).optional(),
  allowFlexibleCheckIn: z.boolean().optional(),
  allowFlexibleCheckOut: z.boolean().optional(),
  allowOvertime: z.boolean().optional(),
  allowNightShift: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  weeklyOff: z.array(z.number().int().min(0).max(6)).optional(),
  color: z.string().optional()
});

export const shiftIdSchema = z.object({
  id: z.string().min(1, 'Shift ID is required')
});

export const shiftCodeSchema = z.object({
  code: z.string().min(1, 'Shift code is required')
});

export const shiftStatusSchema = z.object({
  status: z.enum(['true', 'false'])
});
