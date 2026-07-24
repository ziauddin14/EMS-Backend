import { z } from 'zod';

export const dashboardFilterSchema = z.object({
  department: z.string().optional(),
  designation: z.string().optional(),
  reportingManager: z.string().optional(),
  employmentType: z.string().optional(),
  employmentStatus: z.string().optional(),
  employmentStage: z.string().optional(),
  organizationLevel: z.string().optional(),
  workLocation: z.string().optional(),
  gender: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const managerIdSchema = z.object({
  managerId: z.string().min(1, 'Manager ID is required')
});

export const departmentIdSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required')
});

export const employeeIdSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const teamLeadIdSchema = z.object({
  teamLeadId: z.string().min(1, 'Team lead ID is required')
});

export const chartTypeSchema = z.object({
  chartType: z.enum(['hiring_trend', 'resignation_trend', 'department_distribution', 'designation_distribution', 'gender_distribution', 'age_distribution', 'employment_type', 'lifecycle_stage', 'organization_growth'])
});

export const roleSchema = z.object({
  role: z.enum(['ceo', 'hr', 'manager', 'department_head', 'team_lead', 'employee'])
});
