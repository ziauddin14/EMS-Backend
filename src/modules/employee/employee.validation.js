import { z } from 'zod';
import { EMPLOYMENT_STATUS, EMPLOYMENT_TYPE, GENDER, MARITAL_STATUS, BLOOD_GROUP } from './employee.constants.js';

export const createEmployeeSchema = z.object({
  user: z.string().min(1, 'User reference is required'),
  department: z.string().optional(),
  designation: z.string().optional(),
  reportingManager: z.string().optional(),
  employmentType: z.enum(Object.values(EMPLOYMENT_TYPE), { required_error: 'Employment type is required' }),
  employmentStatus: z.enum(Object.values(EMPLOYMENT_STATUS)).optional(),
  joiningDate: z.string().or(z.date()).refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid joining date'),
  probationEndDate: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid probation end date'),
  confirmationDate: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid confirmation date'),
  workLocation: z.string().max(100, 'Work location cannot exceed 100 characters').optional(),
  officeShift: z.string().max(50, 'Office shift cannot exceed 50 characters').optional(),
  officialEmail: z.string().email('Invalid official email').optional(),
  officialPhone: z.string().max(20, 'Official phone cannot exceed 20 characters').optional(),
  emergencyContact: z.string().max(100, 'Emergency contact name cannot exceed 100 characters').optional(),
  emergencyPhone: z.string().max(20, 'Emergency phone cannot exceed 20 characters').optional(),
  emergencyRelation: z.string().max(50, 'Emergency relation cannot exceed 50 characters').optional(),
  gender: z.enum(Object.values(GENDER)).optional(),
  dateOfBirth: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date of birth'),
  maritalStatus: z.enum(Object.values(MARITAL_STATUS)).optional(),
  nationality: z.string().max(50, 'Nationality cannot exceed 50 characters').optional(),
  bloodGroup: z.enum(Object.values(BLOOD_GROUP)).optional(),
  cnicNumber: z.string().max(20, 'CNIC number cannot exceed 20 characters').optional(),
  currentAddress: z.string().max(500, 'Current address cannot exceed 500 characters').optional(),
  permanentAddress: z.string().max(500, 'Permanent address cannot exceed 500 characters').optional(),
  profilePhoto: z.object({
    public_id: z.string().optional(),
    url: z.string().optional()
  }).optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional()
});

export const updateEmployeeSchema = z.object({
  department: z.string().optional(),
  designation: z.string().optional(),
  reportingManager: z.string().optional(),
  employmentType: z.enum(Object.values(EMPLOYMENT_TYPE)).optional(),
  employmentStatus: z.enum(Object.values(EMPLOYMENT_STATUS)).optional(),
  joiningDate: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid joining date'),
  probationEndDate: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid probation end date'),
  confirmationDate: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid confirmation date'),
  workLocation: z.string().max(100, 'Work location cannot exceed 100 characters').optional(),
  officeShift: z.string().max(50, 'Office shift cannot exceed 50 characters').optional(),
  officialEmail: z.string().email('Invalid official email').optional(),
  officialPhone: z.string().max(20, 'Official phone cannot exceed 20 characters').optional(),
  emergencyContact: z.string().max(100, 'Emergency contact name cannot exceed 100 characters').optional(),
  emergencyPhone: z.string().max(20, 'Emergency phone cannot exceed 20 characters').optional(),
  emergencyRelation: z.string().max(50, 'Emergency relation cannot exceed 50 characters').optional(),
  gender: z.enum(Object.values(GENDER)).optional(),
  dateOfBirth: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date of birth'),
  maritalStatus: z.enum(Object.values(MARITAL_STATUS)).optional(),
  nationality: z.string().max(50, 'Nationality cannot exceed 50 characters').optional(),
  bloodGroup: z.enum(Object.values(BLOOD_GROUP)).optional(),
  cnicNumber: z.string().max(20, 'CNIC number cannot exceed 20 characters').optional(),
  currentAddress: z.string().max(500, 'Current address cannot exceed 500 characters').optional(),
  permanentAddress: z.string().max(500, 'Permanent address cannot exceed 500 characters').optional(),
  profilePhoto: z.object({
    public_id: z.string().optional(),
    url: z.string().optional()
  }).optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional()
});

export const employeeSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query cannot exceed 100 characters')
});

export const employeeFilterSchema = z.object({
  department: z.string().optional(),
  designation: z.string().optional(),
  reportingManager: z.string().optional(),
  employmentStatus: z.enum(Object.values(EMPLOYMENT_STATUS)).optional(),
  employmentType: z.enum(Object.values(EMPLOYMENT_TYPE)).optional(),
  gender: z.enum(Object.values(GENDER)).optional(),
  maritalStatus: z.enum(Object.values(MARITAL_STATUS)).optional(),
  bloodGroup: z.enum(Object.values(BLOOD_GROUP)).optional(),
  workLocation: z.string().optional(),
  joiningDateFrom: z.string().or(z.date()).optional(),
  joiningDateTo: z.string().or(z.date()).optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const updateEmploymentStatusSchema = z.object({
  status: z.enum(Object.values(EMPLOYMENT_STATUS), { required_error: 'Employment status is required' })
});

export const updateReportingManagerSchema = z.object({
  reportingManagerId: z.string().min(1, 'Reporting manager ID is required')
});

export const updateDepartmentSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required')
});

export const updateDesignationSchema = z.object({
  designationId: z.string().min(1, 'Designation ID is required')
});

export const employeeNumberSchema = z.object({
  employeeNumber: z.string().min(1, 'Employee number is required')
});

export const employeeIdSchema = z.object({
  id: z.string().min(1, 'Employee ID is required')
});

export const departmentIdSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required')
});

export const designationIdSchema = z.object({
  designationId: z.string().min(1, 'Designation ID is required')
});

export const statusSchema = z.object({
  status: z.enum(Object.values(EMPLOYMENT_STATUS), { required_error: 'Status is required' })
});

export const typeSchema = z.object({
  type: z.enum(Object.values(EMPLOYMENT_TYPE), { required_error: 'Employment type is required' })
});

export const managerIdSchema = z.object({
  managerId: z.string().min(1, 'Manager ID is required')
});
