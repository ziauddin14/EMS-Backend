import express from 'express';
import { authenticate } from '../../core/middleware/auth.js';
import { authorize } from '../../core/middleware/authorization.js';
import { NOTIFICATION_PERMISSIONS, AUDIT_PERMISSIONS, ACTIVITY_PERMISSIONS } from './notification.permissions.js';
import notificationController from './notification.controller.js';
import auditController from './audit.controller.js';
import activityController from './activity.controller.js';

const router = express.Router();

// ==================== NOTIFICATION ROUTES ====================

// Create Notification
router.post(
  '/notifications',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.CREATE]),
  notificationController.createNotification
);

// Bulk Create Notifications
router.post(
  '/notifications/bulk',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.CREATE]),
  notificationController.bulkCreateNotifications
);

// Get Notifications
router.get(
  '/notifications',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.getNotifications
);

// Get Notification by ID
router.get(
  '/notifications/:notificationId',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.getNotificationById
);

// Mark as Read
router.patch(
  '/notifications/:notificationId/read',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.markAsRead
);

// Mark Multiple as Read
router.patch(
  '/notifications/read/bulk',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.markMultipleAsRead
);

// Mark All as Read
router.patch(
  '/notifications/read/all',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.markAllAsRead
);

// Archive Notification
router.patch(
  '/notifications/:notificationId/archive',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.archiveNotification
);

// Archive Multiple Notifications
router.patch(
  '/notifications/archive/bulk',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.archiveMultipleNotifications
);

// Archive All
router.patch(
  '/notifications/archive/all',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.archiveAll
);

// Delete Notification
router.delete(
  '/notifications/:notificationId',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.DELETE]),
  notificationController.deleteNotification
);

// Delete Multiple Notifications
router.delete(
  '/notifications/bulk',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.DELETE]),
  notificationController.deleteMultipleNotifications
);

// Restore Notification
router.patch(
  '/notifications/:notificationId/restore',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.RESTORE]),
  notificationController.restoreNotification
);

// Get Unread Count
router.get(
  '/notifications/unread/count',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.getUnreadCount
);

// Get Notification Statistics
router.get(
  '/notifications/statistics',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.getNotificationStatistics
);

// Get Category Breakdown
router.get(
  '/notifications/statistics/category',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.getCategoryBreakdown
);

// Get Type Breakdown
router.get(
  '/notifications/statistics/type',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.getTypeBreakdown
);

// Get Priority Breakdown
router.get(
  '/notifications/statistics/priority',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.getPriorityBreakdown
);

// Get Time Series Data
router.get(
  '/notifications/statistics/timeseries',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.getTimeSeriesData
);

// ==================== NOTIFICATION PREFERENCES ROUTES ====================

// Get Preferences
router.get(
  '/notifications/preferences',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.getPreferences
);

// Update Preferences
router.put(
  '/notifications/preferences',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.updatePreferences
);

// Add Device Token
router.post(
  '/notifications/preferences/device-token',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.addDeviceToken
);

// Remove Device Token
router.delete(
  '/notifications/preferences/device-token',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.removeDeviceToken
);

// Mute Notifications
router.post(
  '/notifications/preferences/mute',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.muteNotifications
);

// Unmute Notifications
router.post(
  '/notifications/preferences/unmute',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.unmuteNotifications
);

// Set Category Preference
router.post(
  '/notifications/preferences/category',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.setCategoryPreference
);

// Set Priority Preference
router.post(
  '/notifications/preferences/priority',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.UPDATE]),
  notificationController.setPriorityPreference
);

// ==================== ADMIN NOTIFICATION ROUTES ====================

// Process Scheduled Notifications
router.post(
  '/notifications/admin/process-scheduled',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.ADMIN]),
  notificationController.processScheduledNotifications
);

// Delete Expired Notifications
router.delete(
  '/notifications/admin/expired',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.ADMIN]),
  notificationController.deleteExpiredNotifications
);

// Retry Failed Notifications
router.post(
  '/notifications/admin/retry-failed',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.ADMIN]),
  notificationController.retryFailedNotifications
);

// Generate Digest
router.get(
  '/notifications/digest',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationController.generateDigest
);

// ==================== AUDIT LOG ROUTES ====================

// Create Audit Log
router.post(
  '/audit/logs',
  authenticate,
  authorize([AUDIT_PERMISSIONS.CREATE]),
  auditController.createAuditLog
);

// Bulk Create Audit Logs
router.post(
  '/audit/logs/bulk',
  authenticate,
  authorize([AUDIT_PERMISSIONS.CREATE]),
  auditController.bulkCreateAuditLogs
);

// Get Audit Logs
router.get(
  '/audit/logs',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditLogs
);

// Get Audit Log by ID
router.get(
  '/audit/logs/:auditLogId',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditLogById
);

// Get Audit Logs by Entity
router.get(
  '/audit/logs/entity/:entity/:entityId',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditLogsByEntity
);

// Get Audit Logs by Module
router.get(
  '/audit/logs/module/:module',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditLogsByModule
);

// Get Audit Logs by User
router.get(
  '/audit/logs/user/:userId',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditLogsByUser
);

// Get Audit Logs by Action
router.get(
  '/audit/logs/action/:action',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditLogsByAction
);

// Get Audit Logs by Date Range
router.get(
  '/audit/logs/date-range',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditLogsByDateRange
);

// Get Audit Logs by Session
router.get(
  '/audit/logs/session/:sessionId',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditLogsBySession
);

// Get Audit Logs by IP Address
router.get(
  '/audit/logs/ip/:ipAddress',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditLogsByIpAddress
);

// Get Failed Actions
router.get(
  '/audit/logs/failed',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getFailedActions
);

// Get High Impact Actions
router.get(
  '/audit/logs/high-impact',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getHighImpactActions
);

// Get Audit Statistics
router.get(
  '/audit/logs/statistics',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getAuditStatistics
);

// Get Action Breakdown
router.get(
  '/audit/logs/statistics/action',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getActionBreakdown
);

// Get Module Breakdown
router.get(
  '/audit/logs/statistics/module',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getModuleBreakdown
);

// Get User Activity
router.get(
  '/audit/logs/user/:userId/activity',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getUserActivity
);

// Get User Activity Summary
router.get(
  '/audit/logs/user/:userId/summary',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getUserActivitySummary
);

// Get Entity History
router.get(
  '/audit/logs/entity/:entity/:entityId/history',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getEntityHistory
);

// Get Recent Activity
router.get(
  '/audit/logs/recent',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getRecentActivity
);

// Get Time Series Data
router.get(
  '/audit/logs/statistics/timeseries',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.getTimeSeriesData
);

// Cleanup Old Logs (Admin only)
router.delete(
  '/audit/logs/cleanup',
  authenticate,
  authorize([AUDIT_PERMISSIONS.ADMIN]),
  auditController.cleanupOldLogs
);

// Export Audit Logs
router.get(
  '/audit/logs/export',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditController.exportAuditLogs
);

// ==================== ACTIVITY LOG ROUTES ====================

// Create Activity Log
router.post(
  '/activity/logs',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.CREATE]),
  activityController.createActivityLog
);

// Bulk Create Activity Logs
router.post(
  '/activity/logs/bulk',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.CREATE]),
  activityController.bulkCreateActivityLogs
);

// Get Activity Logs
router.get(
  '/activity/logs',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLogs
);

// Get Activity Log by ID
router.get(
  '/activity/logs/:activityLogId',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLogById
);

// Get Activity Logs by User
router.get(
  '/activity/logs/user/:userId',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLogsByUser
);

// Get Activity Logs by Type
router.get(
  '/activity/logs/type/:type',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLogsByType
);

// Get Activity Logs by Module
router.get(
  '/activity/logs/module/:module',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLogsByModule
);

// Get Activity Logs by Entity
router.get(
  '/activity/logs/entity/:entity/:entityId',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLogsByEntity
);

// Get Activity Logs by Date Range
router.get(
  '/activity/logs/date-range',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLogsByDateRange
);

// Get Activity Logs by Session
router.get(
  '/activity/logs/session/:sessionId',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLogsBySession
);

// Get Activity Logs by Tag
router.get(
  '/activity/logs/tag/:tag',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLogsByTag
);

// Get Login Activities
router.get(
  '/activity/logs/user/:userId/login',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getLoginActivities
);

// Get Logout Activities
router.get(
  '/activity/logs/user/:userId/logout',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getLogoutActivities
);

// Get Failed Activities
router.get(
  '/activity/logs/failed',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getFailedActivities
);

// Get Activity Statistics
router.get(
  '/activity/logs/statistics',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityStatistics
);

// Get Type Breakdown
router.get(
  '/activity/logs/statistics/type',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getTypeBreakdown
);

// Get Module Breakdown
router.get(
  '/activity/logs/statistics/module',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getModuleBreakdown
);

// Get User Activity Timeline
router.get(
  '/activity/logs/user/:userId/timeline',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getUserActivityTimeline
);

// Get Active Sessions
router.get(
  '/activity/logs/sessions/active',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActiveSessions
);

// Get User Login History
router.get(
  '/activity/logs/user/:userId/login-history',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getUserLoginHistory
);

// Get User Activity Summary
router.get(
  '/activity/logs/user/:userId/summary',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getUserActivitySummary
);

// Get Entity Activity History
router.get(
  '/activity/logs/entity/:entity/:entityId/history',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getEntityActivityHistory
);

// Get Recent Activity
router.get(
  '/activity/logs/recent',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getRecentActivity
);

// Get Time Series Data
router.get(
  '/activity/logs/statistics/timeseries',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getTimeSeriesData
);

// Get Activity Heatmap
router.get(
  '/activity/logs/user/:userId/heatmap',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityHeatmap
);

// Get Activity Leaderboard
router.get(
  '/activity/logs/leaderboard',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.getActivityLeaderboard
);

// Cleanup Old Logs (Admin only)
router.delete(
  '/activity/logs/cleanup',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.ADMIN]),
  activityController.cleanupOldLogs
);

// Export Activity Logs
router.get(
  '/activity/logs/export',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityController.exportActivityLogs
);

export default router;
