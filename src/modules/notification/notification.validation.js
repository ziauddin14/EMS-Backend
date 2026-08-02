import { z } from 'zod';
import { NOTIFICATION_TYPE, NOTIFICATION_PRIORITY, NOTIFICATION_CATEGORY, NOTIFICATION_CHANNEL, NOTIFICATION_STATUS, READ_STATUS, REFERENCE_TYPE, DIGEST_FREQUENCY, MUTE_DURATION, AUDIT_ACTION, AUDIT_MODULE, ACTIVITY_TYPE, ACTIVITY_MODULE } from './notification.constants.js';

// Notification Validation Schemas
export const notificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  type: z.enum(Object.values(NOTIFICATION_TYPE)).optional(),
  priority: z.enum(Object.values(NOTIFICATION_PRIORITY)).optional(),
  category: z.enum(Object.values(NOTIFICATION_CATEGORY)),
  sender: z.string().optional(),
  senderName: z.string().optional(),
  recipient: z.string().min(1),
  recipientName: z.string().min(1),
  recipientEmail: z.string().email(),
  department: z.string().optional(),
  branch: z.string().optional(),
  module: z.string().min(1),
  referenceId: z.string().optional(),
  referenceType: z.enum(Object.values(REFERENCE_TYPE)).optional(),
  readStatus: z.enum(Object.values(READ_STATUS)).optional(),
  scheduledAt: z.date().optional(),
  expiredAt: z.date().optional(),
  channels: z.array(z.enum(Object.values(NOTIFICATION_CHANNEL))).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    size: z.number().max(10485760),
    mimeType: z.string()
  })).max(5).optional(),
  metadata: z.record(z.any()).optional(),
  template: z.string().optional()
});

export const bulkNotificationSchema = z.object({
  notifications: z.array(notificationSchema).min(1).max(1000)
});

export const notificationUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(5000).optional(),
  type: z.enum(Object.values(NOTIFICATION_TYPE)).optional(),
  priority: z.enum(Object.values(NOTIFICATION_PRIORITY)).optional(),
  category: z.enum(Object.values(NOTIFICATION_CATEGORY)).optional(),
  readStatus: z.enum(Object.values(READ_STATUS)).optional(),
  status: z.enum(Object.values(NOTIFICATION_STATUS)).optional(),
  expiredAt: z.date().optional()
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1)
});

export const markAllReadSchema = z.object({
  recipient: z.string().min(1)
});

export const archiveNotificationSchema = z.object({
  notificationIds: z.array(z.string()).min(1)
});

export const deleteNotificationSchema = z.object({
  notificationIds: z.array(z.string()).min(1)
});

export const restoreNotificationSchema = z.object({
  notificationIds: z.array(z.string()).min(1)
});

// Notification Preference Validation Schemas
export const notificationPreferenceSchema = z.object({
  user: z.string().min(1),
  email: z.object({
    enabled: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    priority: z.array(z.string()).optional()
  }).optional(),
  sms: z.object({
    enabled: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    priority: z.array(z.string()).optional()
  }).optional(),
  push: z.object({
    enabled: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    priority: z.array(z.string()).optional()
  }).optional(),
  inApp: z.object({
    enabled: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    priority: z.array(z.string()).optional()
  }).optional(),
  whatsapp: z.object({
    enabled: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    priority: z.array(z.string()).optional()
  }).optional(),
  slack: z.object({
    enabled: z.boolean().optional(),
    webhookUrl: z.string().url().optional(),
    channels: z.array(z.string()).optional()
  }).optional(),
  teams: z.object({
    enabled: z.boolean().optional(),
    webhookUrl: z.string().url().optional(),
    teams: z.array(z.string()).optional()
  }).optional(),
  discord: z.object({
    enabled: z.boolean().optional(),
    webhookUrl: z.string().url().optional(),
    channels: z.array(z.string()).optional()
  }).optional(),
  isMuted: z.boolean().optional(),
  muteDuration: z.enum(Object.values(MUTE_DURATION)).optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  quietHoursTimezone: z.string().optional(),
  digestFrequency: z.enum(Object.values(DIGEST_FREQUENCY)).optional(),
  digestCategories: z.array(z.string()).optional(),
  language: z.string().optional(),
  emailSettings: z.object({
    primaryEmail: z.string().email().optional(),
    additionalEmails: z.array(z.string().email()).optional(),
    digestEmail: z.string().email().optional()
  }).optional(),
  smsSettings: z.object({
    phoneNumber: z.string().optional(),
    countryCode: z.string().optional()
  }).optional()
});

export const deviceTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().optional()
});

export const muteSchema = z.object({
  duration: z.enum(Object.values(MUTE_DURATION))
});

export const unmuteSchema = z.object({});

export const categoryPreferenceSchema = z.object({
  category: z.string().min(1),
  enabled: z.boolean(),
  channels: z.array(z.string()).optional(),
  digest: z.enum(Object.values(DIGEST_FREQUENCY)).optional()
});

export const priorityPreferenceSchema = z.object({
  priority: z.string().min(1),
  enabled: z.boolean(),
  channels: z.array(z.string()).optional(),
  sound: z.string().optional()
});

// Audit Log Validation Schemas
export const auditLogSchema = z.object({
  module: z.enum(Object.values(AUDIT_MODULE)),
  action: z.enum(Object.values(AUDIT_ACTION)),
  entity: z.string().min(1),
  entityId: z.string().min(1),
  oldData: z.any().optional(),
  newData: z.any().optional(),
  performedBy: z.string().min(1),
  performedByName: z.string().min(1),
  performedByEmail: z.string().email(),
  performedByRole: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  device: z.object({
    type: z.string().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    osVersion: z.string().optional()
  }).optional(),
  location: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    timezone: z.string().optional()
  }).optional(),
  sessionId: z.string().optional(),
  context: z.record(z.any()).optional(),
  impact: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  relatedEntities: z.array(z.object({
    entity: z.string(),
    entityId: z.string()
  })).optional()
});

export const auditLogQuerySchema = z.object({
  module: z.enum(Object.values(AUDIT_MODULE)).optional(),
  action: z.enum(Object.values(AUDIT_ACTION)).optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  performedBy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sessionId: z.string().optional(),
  ipAddress: z.string().optional(),
  impact: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['success', 'failed', 'partial']).optional(),
  limit: z.number().min(1).max(1000).optional(),
  page: z.number().min(1).optional()
});

// Activity Log Validation Schemas
export const activityLogSchema = z.object({
  user: z.string().min(1),
  userName: z.string().min(1),
  userEmail: z.string().email(),
  userRole: z.string().optional(),
  type: z.enum(Object.values(ACTIVITY_TYPE)),
  module: z.enum(Object.values(ACTIVITY_MODULE)),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  data: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  device: z.object({
    type: z.string().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    osVersion: z.string().optional()
  }).optional(),
  location: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    timezone: z.string().optional()
  }).optional(),
  sessionId: z.string().optional(),
  context: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'completed', 'failed', 'cancelled']).optional()
});

export const activityLogQuerySchema = z.object({
  user: z.string().optional(),
  type: z.enum(Object.values(ACTIVITY_TYPE)).optional(),
  module: z.enum(Object.values(ACTIVITY_MODULE)).optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sessionId: z.string().optional(),
  ipAddress: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['active', 'completed', 'failed', 'cancelled']).optional(),
  limit: z.number().min(1).max(1000).optional(),
  page: z.number().min(1).optional()
});

// Query Validation Schemas
export const notificationQuerySchema = z.object({
  recipient: z.string().optional(),
  type: z.enum(Object.values(NOTIFICATION_TYPE)).optional(),
  priority: z.enum(Object.values(NOTIFICATION_PRIORITY)).optional(),
  category: z.enum(Object.values(NOTIFICATION_CATEGORY)).optional(),
  readStatus: z.enum(Object.values(READ_STATUS)).optional(),
  status: z.enum(Object.values(NOTIFICATION_STATUS)).optional(),
  module: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.enum(Object.values(REFERENCE_TYPE)).optional(),
  department: z.string().optional(),
  branch: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
  sort: z.string().optional()
});

export const notificationPreferenceQuerySchema = z.object({
  user: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional()
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

// Date Range Schema
export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

// Export all schemas
export const notificationValidationSchemas = {
  notificationSchema,
  bulkNotificationSchema,
  notificationUpdateSchema,
  markReadSchema,
  markAllReadSchema,
  archiveNotificationSchema,
  deleteNotificationSchema,
  restoreNotificationSchema,
  notificationPreferenceSchema,
  deviceTokenSchema,
  muteSchema,
  unmuteSchema,
  categoryPreferenceSchema,
  priorityPreferenceSchema,
  auditLogSchema,
  auditLogQuerySchema,
  activityLogSchema,
  activityLogQuerySchema,
  notificationQuerySchema,
  notificationPreferenceQuerySchema,
  paginationSchema,
  dateRangeSchema
};
