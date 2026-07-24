import { z } from 'zod';

export const assignManagerSchema = z.object({
  managerId: z.string().optional()
});

export const changeManagerSchema = z.object({
  managerId: z.string().optional()
});

export const assignSecondaryManagerSchema = z.object({
  secondaryManagerId: z.string().optional()
});

export const setDepartmentHeadSchema = z.object({
  isHead: z.boolean({ required_error: 'isHead is required' })
});

export const setTeamLeadSchema = z.object({
  isLead: z.boolean({ required_error: 'isLead is required' })
});

export const employeeIdSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const departmentIdSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required')
});

export const organizationLevelSchema = z.object({
  level: z.string().transform((val) => parseInt(val)).refine((val) => val >= 0, 'Level must be a non-negative integer')
});

export const validateHierarchyChangeSchema = z.object({
  managerId: z.string().optional()
});
