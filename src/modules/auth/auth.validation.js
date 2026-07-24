import { z } from 'zod';
import { USER_ROLES, USER_STATUS, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from './auth.constants.js';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`).max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`),
  phone: z.string().optional(),
  role: z.enum(Object.values(USER_ROLES)).optional(),
  employeeId: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`).max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`)
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`).max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`)
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters').optional(),
  phone: z.string().optional(),
  avatar: z.object({
    public_id: z.string().optional(),
    url: z.string().optional()
  }).optional()
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters').optional(),
  phone: z.string().optional(),
  avatar: z.object({
    public_id: z.string().optional(),
    url: z.string().optional()
  }).optional(),
  role: z.enum(Object.values(USER_ROLES)).optional(),
  status: z.enum(Object.values(USER_STATUS)).optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional()
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});
