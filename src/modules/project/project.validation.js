import { z } from 'zod';
import { PROJECT_STATUS, PROJECT_PRIORITY } from './project.constants.js';

export const createProjectSchema = z.object({
  projectCode: z.string().min(1, 'Project code is required').max(20, 'Project code cannot exceed 20 characters').toUpperCase(),
  name: z.string().min(1, 'Project name is required').max(200, 'Project name cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  client: z.string().optional(),
  department: z.string().optional(),
  projectManager: z.string().min(1, 'Project manager is required'),
  teamLeads: z.array(z.string()).optional(),
  members: z.array(z.string()).optional(),
  status: z.enum(Object.values(PROJECT_STATUS)).optional(),
  priority: z.enum(Object.values(PROJECT_PRIORITY)).optional(),
  startDate: z.string().or(z.date()).refine(val => new Date(val) <= new Date(), {
    message: 'Start date cannot be in the future'
  }),
  expectedEndDate: z.string().or(z.date()),
  estimatedHours: z.number().min(0, 'Estimated hours cannot be negative').optional(),
  budget: z.number().min(0, 'Budget cannot be negative').optional(),
  tags: z.array(z.string().max(50)).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional()
}).refine(data => {
  if (data.startDate && data.expectedEndDate) {
    return new Date(data.startDate) <= new Date(data.expectedEndDate);
  }
  return true;
}, {
  message: 'Start date must be before or equal to expected end date'
});

export const updateProjectSchema = z.object({
  projectCode: z.string().min(1).max(20).toUpperCase().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  client: z.string().optional(),
  department: z.string().optional(),
  projectManager: z.string().optional(),
  teamLeads: z.array(z.string()).optional(),
  members: z.array(z.string()).optional(),
  status: z.enum(Object.values(PROJECT_STATUS)).optional(),
  priority: z.enum(Object.values(PROJECT_PRIORITY)).optional(),
  startDate: z.string().or(z.date()).optional(),
  expectedEndDate: z.string().or(z.date()).optional(),
  actualEndDate: z.string().or(z.date()).optional(),
  estimatedHours: z.number().min(0).optional(),
  spentHours: z.number().min(0).optional(),
  progress: z.number().min(0).max(100).optional(),
  budget: z.number().min(0).optional(),
  tags: z.array(z.string().max(50)).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isArchived: z.boolean().optional(),
  isActive: z.boolean().optional()
}).refine(data => {
  if (data.startDate && data.expectedEndDate) {
    return new Date(data.startDate) <= new Date(data.expectedEndDate);
  }
  return true;
}, {
  message: 'Start date must be before or equal to expected end date'
});

export const projectIdSchema = z.object({
  id: z.string().min(1, 'Project ID is required')
});

export const departmentIdSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required')
});

export const managerIdSchema = z.object({
  managerId: z.string().min(1, 'Manager ID is required')
});

export const employeeIdSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const statusSchema = z.object({
  status: z.enum(Object.values(PROJECT_STATUS))
});

export const prioritySchema = z.object({
  priority: z.enum(Object.values(PROJECT_PRIORITY))
});

export const addMemberSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const removeMemberSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const addTeamLeadSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const removeTeamLeadSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const searchSchema = z.object({
  q: z.string().min(1, 'Search term is required'),
  limit: z.number().min(1).max(100).optional(),
  skip: z.number().min(0).optional()
});
