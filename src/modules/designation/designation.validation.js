import { z } from 'zod';
import { DESIGNATION_STATUS } from './designation.constants.js';

export const createDesignationSchema = z.object({
  designationName: z.string().min(1, 'Designation name is required').max(100, 'Designation name cannot exceed 100 characters'),
  department: z.string().optional(),
  hierarchyLevel: z.number().int().min(0, 'Hierarchy level must be a non-negative integer').optional(),
  jobGrade: z.string().max(20, 'Job grade cannot exceed 20 characters').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  minimumSalary: z.number().min(0, 'Minimum salary must be a non-negative number').optional(),
  maximumSalary: z.number().min(0, 'Maximum salary must be a non-negative number').optional(),
  employmentTypesAllowed: z.array(z.enum(['full_time', 'part_time', 'intern', 'contract', 'freelancer'])).optional(),
  defaultPermissions: z.array(z.string()).optional(),
  status: z.enum(Object.values(DESIGNATION_STATUS)).optional(),
  displayOrder: z.number().int().min(0, 'Display order must be a non-negative integer').optional()
}).refine((data) => {
  if (data.minimumSalary !== null && data.maximumSalary !== null && data.minimumSalary > data.maximumSalary) {
    return false;
  }
  return true;
}, { message: 'Minimum salary cannot be greater than maximum salary' });

export const updateDesignationSchema = z.object({
  designationName: z.string().min(1, 'Designation name is required').max(100, 'Designation name cannot exceed 100 characters').optional(),
  department: z.string().optional(),
  hierarchyLevel: z.number().int().min(0, 'Hierarchy level must be a non-negative integer').optional(),
  jobGrade: z.string().max(20, 'Job grade cannot exceed 20 characters').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  minimumSalary: z.number().min(0, 'Minimum salary must be a non-negative number').optional(),
  maximumSalary: z.number().min(0, 'Maximum salary must be a non-negative number').optional(),
  employmentTypesAllowed: z.array(z.enum(['full_time', 'part_time', 'intern', 'contract', 'freelancer'])).optional(),
  defaultPermissions: z.array(z.string()).optional(),
  status: z.enum(Object.values(DESIGNATION_STATUS)).optional(),
  displayOrder: z.number().int().min(0, 'Display order must be a non-negative integer').optional()
}).refine((data) => {
  if (data.minimumSalary !== null && data.maximumSalary !== null && data.minimumSalary > data.maximumSalary) {
    return false;
  }
  return true;
}, { message: 'Minimum salary cannot be greater than maximum salary' });

export const designationSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query cannot exceed 100 characters')
});

export const designationFilterSchema = z.object({
  status: z.enum(Object.values(DESIGNATION_STATUS)).optional(),
  department: z.string().optional(),
  hierarchyLevel: z.number().int().min(0).optional(),
  jobGrade: z.string().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const updateDesignationStatusSchema = z.object({
  status: z.enum(Object.values(DESIGNATION_STATUS), { required_error: 'Status is required' })
});

export const updateDesignationDepartmentSchema = z.object({
  departmentId: z.string().optional()
});

export const updateDesignationHierarchySchema = z.object({
  hierarchyLevel: z.number().int().min(0, 'Hierarchy level must be a non-negative integer')
});

export const updateSalaryRangeSchema = z.object({
  minimumSalary: z.number().min(0, 'Minimum salary must be a non-negative number').optional(),
  maximumSalary: z.number().min(0, 'Maximum salary must be a non-negative number').optional()
}).refine((data) => {
  if (data.minimumSalary !== null && data.maximumSalary !== null && data.minimumSalary > data.maximumSalary) {
    return false;
  }
  return true;
}, { message: 'Minimum salary cannot be greater than maximum salary' });

export const designationIdSchema = z.object({
  id: z.string().min(1, 'Designation ID is required')
});

export const designationCodeSchema = z.object({
  code: z.string().min(1, 'Designation code is required')
});

export const departmentIdSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required')
});

export const hierarchyLevelSchema = z.object({
  level: z.string().transform((val) => parseInt(val))
});

export const jobGradeSchema = z.object({
  grade: z.string().min(1, 'Job grade is required')
});

export const statusSchema = z.object({
  status: z.enum(Object.values(DESIGNATION_STATUS), { required_error: 'Status is required' })
});

export const hierarchyRangeSchema = z.object({
  minLevel: z.string().transform((val) => parseInt(val)),
  maxLevel: z.string().transform((val) => parseInt(val))
});
