import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY, TASK_CATEGORY, RECURRING_TYPE } from './task.constants.js';

export const createTaskSchema = z.object({
  taskNumber: z.string().min(1, 'Task number is required').max(20, 'Task number cannot exceed 20 characters').toUpperCase(),
  title: z.string().min(1, 'Task title is required').max(300, 'Task title cannot exceed 300 characters'),
  description: z.string().max(5000, 'Description cannot exceed 5000 characters').optional(),
  project: z.string().optional(),
  department: z.string().optional(),
  assignedBy: z.string().optional(),
  assignedTo: z.string().optional(),
  reviewer: z.string().optional(),
  priority: z.enum(Object.values(TASK_PRIORITY)).optional(),
  status: z.enum(Object.values(TASK_STATUS)).optional(),
  category: z.enum(Object.values(TASK_CATEGORY)).optional(),
  labels: z.array(z.string().max(50)).optional(),
  estimatedHours: z.number().min(0, 'Estimated hours cannot be negative').optional(),
  startDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  parentTask: z.string().optional(),
  subTasks: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurringType: z.enum(Object.values(RECURRING_TYPE)).optional()
}).refine(data => {
  if (data.startDate && data.dueDate) {
    return new Date(data.startDate) <= new Date(data.dueDate);
  }
  return true;
}, {
  message: 'Start date must be before or equal to due date'
});

export const updateTaskSchema = z.object({
  taskNumber: z.string().min(1).max(20).toUpperCase().optional(),
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  project: z.string().optional(),
  department: z.string().optional(),
  assignedBy: z.string().optional(),
  assignedTo: z.string().optional(),
  reviewer: z.string().optional(),
  priority: z.enum(Object.values(TASK_PRIORITY)).optional(),
  status: z.enum(Object.values(TASK_STATUS)).optional(),
  category: z.enum(Object.values(TASK_CATEGORY)).optional(),
  labels: z.array(z.string().max(50)).optional(),
  estimatedHours: z.number().min(0).optional(),
  spentHours: z.number().min(0).optional(),
  startDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  completedAt: z.string().or(z.date()).optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  parentTask: z.string().optional(),
  subTasks: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurringType: z.enum(Object.values(RECURRING_TYPE)).optional(),
  isArchived: z.boolean().optional(),
  isActive: z.boolean().optional()
}).refine(data => {
  if (data.startDate && data.dueDate) {
    return new Date(data.startDate) <= new Date(data.dueDate);
  }
  return true;
}, {
  message: 'Start date must be before or equal to due date'
});

export const taskIdSchema = z.object({
  id: z.string().min(1, 'Task ID is required')
});

export const projectIdSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required')
});

export const employeeIdSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const departmentIdSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required')
});

export const statusSchema = z.object({
  status: z.enum(Object.values(TASK_STATUS))
});

export const prioritySchema = z.object({
  priority: z.enum(Object.values(TASK_PRIORITY))
});

export const categorySchema = z.object({
  category: z.enum(Object.values(TASK_CATEGORY))
});

export const parentTaskIdSchema = z.object({
  parentTaskId: z.string().min(1, 'Parent task ID is required')
});

export const addSubTaskSchema = z.object({
  subTaskId: z.string().min(1, 'Subtask ID is required')
});

export const removeSubTaskSchema = z.object({
  subTaskId: z.string().min(1, 'Subtask ID is required')
});

export const addDependencySchema = z.object({
  dependencyId: z.string().min(1, 'Dependency ID is required')
});

export const removeDependencySchema = z.object({
  dependencyId: z.string().min(1, 'Dependency ID is required')
});

export const updateProgressSchema = z.object({
  percentage: z.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100')
});

export const updateSpentHoursSchema = z.object({
  hours: z.number().min(0, 'Hours cannot be negative')
});

export const searchSchema = z.object({
  q: z.string().min(1, 'Search term is required'),
  limit: z.number().min(1).max(100).optional(),
  skip: z.number().min(0).optional()
});
