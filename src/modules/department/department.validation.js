import { z } from 'zod';
import { DEPARTMENT_STATUS } from './department.constants.js';

export const createDepartmentSchema = z.object({
  departmentName: z.string().min(1, 'Department name is required').max(100, 'Department name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  parentDepartment: z.string().optional(),
  departmentHead: z.string().optional(),
  departmentEmail: z.string().email('Invalid department email').optional(),
  departmentPhone: z.string().max(20, 'Department phone cannot exceed 20 characters').optional(),
  officeLocation: z.string().max(100, 'Office location cannot exceed 100 characters').optional(),
  colorCode: z.string().max(20, 'Color code cannot exceed 20 characters').optional(),
  displayOrder: z.number().int().min(0, 'Display order must be a non-negative integer').optional(),
  status: z.enum(Object.values(DEPARTMENT_STATUS)).optional()
});

export const updateDepartmentSchema = z.object({
  departmentName: z.string().min(1, 'Department name is required').max(100, 'Department name cannot exceed 100 characters').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  parentDepartment: z.string().optional(),
  departmentHead: z.string().optional(),
  departmentEmail: z.string().email('Invalid department email').optional(),
  departmentPhone: z.string().max(20, 'Department phone cannot exceed 20 characters').optional(),
  officeLocation: z.string().max(100, 'Office location cannot exceed 100 characters').optional(),
  colorCode: z.string().max(20, 'Color code cannot exceed 20 characters').optional(),
  displayOrder: z.number().int().min(0, 'Display order must be a non-negative integer').optional(),
  status: z.enum(Object.values(DEPARTMENT_STATUS)).optional()
});

export const departmentSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query cannot exceed 100 characters')
});

export const departmentFilterSchema = z.object({
  status: z.enum(Object.values(DEPARTMENT_STATUS)).optional(),
  parentDepartment: z.string().optional(),
  departmentHead: z.string().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const updateDepartmentStatusSchema = z.object({
  status: z.enum(Object.values(DEPARTMENT_STATUS), { required_error: 'Status is required' })
});

export const updateDepartmentHeadSchema = z.object({
  departmentHeadId: z.string().min(1, 'Department head ID is required')
});

export const updateParentDepartmentSchema = z.object({
  parentDepartmentId: z.string().optional()
});

export const departmentIdSchema = z.object({
  id: z.string().min(1, 'Department ID is required')
});

export const departmentCodeSchema = z.object({
  code: z.string().min(1, 'Department code is required')
});

export const parentIdSchema = z.object({
  parentId: z.string().min(1, 'Parent department ID is required')
});

export const statusSchema = z.object({
  status: z.enum(Object.values(DEPARTMENT_STATUS), { required_error: 'Status is required' })
});
