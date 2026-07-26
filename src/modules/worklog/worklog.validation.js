import { z } from 'zod';
import { ACTIVITY_TYPE } from '../task/task.constants.js';

export const createWorkLogSchema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  task: z.string().min(1, 'Task is required'),
  project: z.string().optional(),
  workDate: z.string().or(z.date()),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  activityType: z.enum(Object.values(ACTIVITY_TYPE)).optional(),
  billable: z.boolean().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
}).refine(data => {
  if (data.startTime && data.endTime) {
    return new Date(data.startTime) <= new Date(data.endTime);
  }
  return true;
}, {
  message: 'Start time must be before or equal to end time'
});

export const updateWorkLogSchema = z.object({
  employee: z.string().optional(),
  task: z.string().optional(),
  project: z.string().optional(),
  workDate: z.string().or(z.date()).optional(),
  startTime: z.string().or(z.date()).optional(),
  endTime: z.string().or(z.date()).optional(),
  description: z.string().max(2000).optional(),
  activityType: z.enum(Object.values(ACTIVITY_TYPE)).optional(),
  billable: z.boolean().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
}).refine(data => {
  if (data.startTime && data.endTime) {
    return new Date(data.startTime) <= new Date(data.endTime);
  }
  return true;
}, {
  message: 'Start time must be before or equal to end time'
});

export const workLogIdSchema = z.object({
  id: z.string().min(1, 'Work log ID is required')
});

export const employeeIdSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const taskIdSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required')
});

export const projectIdSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required')
});

export const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});

export const billableSchema = z.object({
  billable: z.string().refine(val => val === 'true' || val === 'false', {
    message: 'Billable must be true or false'
  })
});

export const dateRangeSchema = z.object({
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date())
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Start date must be before or equal to end date'
});
