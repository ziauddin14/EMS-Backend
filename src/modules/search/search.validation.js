import { z } from 'zod';

export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query cannot exceed 100 characters')
});

export const filterSchema = z.object({
  department: z.string().optional(),
  designation: z.string().optional(),
  reportingManager: z.string().optional(),
  employmentType: z.string().optional(),
  employmentStatus: z.string().optional(),
  employmentStage: z.string().optional(),
  organizationLevel: z.string().optional(),
  workLocation: z.string().optional(),
  officeShift: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  isConfirmed: z.string().optional(),
  isOnProbation: z.string().optional(),
  isResigned: z.string().optional(),
  isTerminated: z.string().optional(),
  isDepartmentHead: z.string().optional(),
  isTeamLead: z.string().optional(),
  joiningDateFrom: z.string().optional(),
  joiningDateTo: z.string().optional(),
  ageFrom: z.string().optional(),
  ageTo: z.string().optional(),
  createdDateFrom: z.string().optional(),
  createdDateTo: z.string().optional(),
  updatedDateFrom: z.string().optional(),
  updatedDateTo: z.string().optional(),
  includeDeleted: z.string().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const sortSchema = z.object({
  sortBy: z.string().min(1, 'Sort field is required'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const bulkOperationSchema = z.object({
  employeeIds: z.array(z.string()).min(1, 'At least one employee ID is required')
});

export const bulkChangeDepartmentSchema = z.object({
  employeeIds: z.array(z.string()).min(1, 'At least one employee ID is required'),
  newDepartmentId: z.string().min(1, 'New department ID is required')
});

export const bulkChangeDesignationSchema = z.object({
  employeeIds: z.array(z.string()).min(1, 'At least one employee ID is required'),
  newDesignationId: z.string().min(1, 'New designation ID is required')
});

export const exportSchema = z.object({
  format: z.enum(['json', 'csv', 'excel']).default('json')
});

export const departmentIdSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required')
});
