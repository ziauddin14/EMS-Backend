import { z } from 'zod';
import { DOCUMENT_TYPE, DOCUMENT_STATUS, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './employeeDocument.constants.js';

export const uploadDocumentSchema = z.object({
  employee: z.string().min(1, 'Employee reference is required'),
  documentType: z.enum(Object.values(DOCUMENT_TYPE), { required_error: 'Document type is required' }),
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  cloudinaryPublicId: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL'),
  originalFileName: z.string().min(1, 'Original file name is required'),
  fileSize: z.number().min(1, 'File size is required').max(MAX_FILE_SIZE, `File size cannot exceed ${MAX_FILE_SIZE} bytes`),
  mimeType: z.enum(ALLOWED_FILE_TYPES, { required_error: 'Invalid file type' }),
  expiryDate: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Expiry date must be a future date'),
  issueDate: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid issue date')
});

export const updateDocumentSchema = z.object({
  documentType: z.enum(Object.values(DOCUMENT_TYPE)).optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  cloudinaryPublicId: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL').optional(),
  originalFileName: z.string().min(1, 'Original file name is required').optional(),
  fileSize: z.number().min(1, 'File size is required').max(MAX_FILE_SIZE, `File size cannot exceed ${MAX_FILE_SIZE} bytes`).optional(),
  mimeType: z.enum(ALLOWED_FILE_TYPES).optional(),
  expiryDate: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Expiry date must be a future date'),
  issueDate: z.string().or(z.date()).optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid issue date')
});

export const replaceDocumentSchema = z.object({
  cloudinaryPublicId: z.string().optional(),
  fileUrl: z.string().url('Invalid file URL'),
  originalFileName: z.string().min(1, 'Original file name is required'),
  fileSize: z.number().min(1, 'File size is required').max(MAX_FILE_SIZE, `File size cannot exceed ${MAX_FILE_SIZE} bytes`),
  mimeType: z.enum(ALLOWED_FILE_TYPES, { required_error: 'Invalid file type' })
});

export const documentSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query cannot exceed 100 characters')
});

export const documentFilterSchema = z.object({
  employee: z.string().optional(),
  documentType: z.enum(Object.values(DOCUMENT_TYPE)).optional(),
  status: z.enum(Object.values(DOCUMENT_STATUS)).optional(),
  isVerified: z.string().optional().transform((val) => val === 'true'),
  uploadedBy: z.string().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const documentIdSchema = z.object({
  id: z.string().min(1, 'Document ID is required')
});

export const employeeIdSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required')
});

export const documentTypeSchema = z.object({
  type: z.enum(Object.values(DOCUMENT_TYPE), { required_error: 'Document type is required' })
});

export const documentStatusSchema = z.object({
  status: z.enum(Object.values(DOCUMENT_STATUS), { required_error: 'Document status is required' })
});

export const daysSchema = z.object({
  days: z.string().optional().transform((val) => val ? parseInt(val) : 30)
});
