import { z } from 'zod';

export const confirmEmployeeSchema = z.object({
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const startProbationSchema = z.object({
  probationEndDate: z.string().or(z.date()).refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Probation end date must be a future date'),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const completeProbationSchema = z.object({
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const promoteEmployeeSchema = z.object({
  newDesignationId: z.string().min(1, 'New designation ID is required'),
  salary: z.number().positive('Salary must be positive').optional(),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const transferEmployeeSchema = z.object({
  newDepartmentId: z.string().min(1, 'New department ID is required'),
  reason: z.string().min(1, 'Transfer reason is required').max(500, 'Reason cannot exceed 500 characters'),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const suspendEmployeeSchema = z.object({
  reason: z.string().min(1, 'Suspension reason is required').max(500, 'Reason cannot exceed 500 characters'),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const resumeEmployeeSchema = z.object({
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const resignEmployeeSchema = z.object({
  resignationReason: z.string().min(1, 'Resignation reason is required').max(500, 'Reason cannot exceed 500 characters'),
  noticePeriodDays: z.number().int('Notice period days must be an integer').positive('Notice period days must be positive').default(30),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const startNoticeSchema = z.object({
  lastWorkingDate: z.string().or(z.date()).refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Last working date must be a future date'),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const completeExitSchema = z.object({
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const terminateEmployeeSchema = z.object({
  terminationReason: z.string().min(1, 'Termination reason is required').max(500, 'Reason cannot exceed 500 characters'),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const rehireEmployeeSchema = z.object({
  newDesignationId: z.string().optional(),
  newDepartmentId: z.string().optional(),
  joiningDate: z.string().or(z.date()).refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date >= new Date();
  }, 'Joining date must be today or in the future'),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional()
});

export const employeeIdSchema = z.object({
  id: z.string().min(1, 'Employee ID is required')
});

export const employeeIdParamSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});
