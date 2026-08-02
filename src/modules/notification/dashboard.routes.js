import express from 'express';
import { authenticate } from '../../core/middleware/auth.js';
import { authorize } from '../../core/middleware/authorization.js';
import { NOTIFICATION_PERMISSIONS, AUDIT_PERMISSIONS, ACTIVITY_PERMISSIONS } from './notification.permissions.js';
import notificationDashboardController from './notificationDashboard.controller.js';
import activityDashboardController from './activityDashboard.controller.js';
import auditDashboardController from './auditDashboard.controller.js';
import executiveMonitoringController from './executiveMonitoring.controller.js';

const router = express.Router();

// ==================== NOTIFICATION DASHBOARD ROUTES ====================

// Employee Dashboard
router.get(
  '/dashboard/employee',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationDashboardController.getEmployeeDashboard
);

// Manager Dashboard
router.get(
  '/dashboard/manager',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationDashboardController.getManagerDashboard
);

// HR Dashboard
router.get(
  '/dashboard/hr',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationDashboardController.getHRDashboard
);

// CEO Dashboard
router.get(
  '/dashboard/ceo',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationDashboardController.getCEODashboard
);

// Notification Center
router.get(
  '/notifications/center',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationDashboardController.getNotificationCenter
);

// Notification History
router.get(
  '/notifications/history',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationDashboardController.getNotificationHistory
);

// Notification Timeline
router.get(
  '/notifications/timeline',
  authenticate,
  authorize([NOTIFICATION_PERMISSIONS.READ]),
  notificationDashboardController.getNotificationTimeline
);

// ==================== ACTIVITY DASHBOARD ROUTES ====================

// Activity Dashboard
router.get(
  '/activities/dashboard',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getActivityDashboard
);

// Activity Timeline
router.get(
  '/activities/timeline',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getActivityTimeline
);

// Activity Analytics
router.get(
  '/activities/analytics',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getActivityAnalytics
);

// User Activity Timeline
router.get(
  '/activities/user/:userId/timeline',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getUserActivityTimeline
);

// Module Activity
router.get(
  '/activities/module/:module',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getModuleActivity
);

// Authentication Events
router.get(
  '/activities/authentication/events',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getAuthenticationEvents
);

// Employee Events
router.get(
  '/activities/employee/events',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getEmployeeEvents
);

// Attendance Events
router.get(
  '/activities/attendance/events',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getAttendanceEvents
);

// Task Events
router.get(
  '/activities/task/events',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getTaskEvents
);

// Meeting Events
router.get(
  '/activities/meeting/events',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getMeetingEvents
);

// KPI Events
router.get(
  '/activities/kpi/events',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getKPIEvents
);

// Settings Events
router.get(
  '/activities/settings/events',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getSettingsEvents
);

// Executive Events
router.get(
  '/activities/executive/events',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getExecutiveEvents
);

// Activity Leaderboard
router.get(
  '/activities/leaderboard',
  authenticate,
  authorize([ACTIVITY_PERMISSIONS.READ]),
  activityDashboardController.getActivityLeaderboard
);

// ==================== AUDIT DASHBOARD ROUTES ====================

// Audit Dashboard
router.get(
  '/audit/dashboard',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getAuditDashboard
);

// Audit Timeline
router.get(
  '/audit/timeline',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getAuditTimeline
);

// User Activity Timeline (Audit)
router.get(
  '/audit/user/:userId/timeline',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getUserActivityTimeline
);

// Module Activity (Audit)
router.get(
  '/audit/module/:module',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getModuleActivity
);

// Security Events
router.get(
  '/audit/security/events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getSecurityEvents
);

// Authentication Events (Audit)
router.get(
  '/audit/authentication/events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getAuthenticationEvents
);

// Employee Events (Audit)
router.get(
  '/audit/employee/events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getEmployeeEvents
);

// Attendance Events (Audit)
router.get(
  '/audit/attendance/events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getAttendanceEvents
);

// Task Events (Audit)
router.get(
  '/audit/task/events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getTaskEvents
);

// Meeting Events (Audit)
router.get(
  '/audit/meeting/events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getMeetingEvents
);

// KPI Events (Audit)
router.get(
  '/audit/kpi/events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getKPIEvents
);

// Settings Events (Audit)
router.get(
  '/audit/settings/events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getSettingsEvents
);

// Executive Events (Audit)
router.get(
  '/audit/executive/events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getExecutiveEvents
);

// Audit Analytics
router.get(
  '/audit/analytics',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getAuditAnalytics
);

// Entity History
router.get(
  '/audit/entity/:entity/:entityId/history',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getEntityHistory
);

// Recent Activity
router.get(
  '/audit/recent',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  auditDashboardController.getRecentActivity
);

// ==================== EXECUTIVE MONITORING ROUTES ====================

// Executive Monitoring Dashboard
router.get(
  '/executive/monitoring',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getExecutiveMonitoring
);

// Organization Activity Feed
router.get(
  '/executive/activity-feed',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getOrganizationActivityFeed
);

// Critical Events
router.get(
  '/executive/critical-events',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getCriticalEvents
);

// Security Alerts
router.get(
  '/executive/security-alerts',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getSecurityAlerts
);

// Audit Overview
router.get(
  '/executive/audit-overview',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getAuditOverview
);

// Executive Notifications
router.get(
  '/executive/notifications',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getExecutiveNotifications
);

// Executive Timeline
router.get(
  '/executive/timeline',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getExecutiveTimeline
);

// System Health Alerts
router.get(
  '/executive/system-health',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getSystemHealthAlerts
);

// Organization Risk Alerts
router.get(
  '/executive/risk-alerts',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getOrganizationRiskAlerts
);

// Department Summary
router.get(
  '/executive/department-summary',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getDepartmentSummary
);

// User Activity Summary
router.get(
  '/executive/user-activity-summary',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getUserActivitySummary
);

// Executive Analytics
router.get(
  '/executive/analytics',
  authenticate,
  authorize([AUDIT_PERMISSIONS.READ]),
  executiveMonitoringController.getExecutiveAnalytics
);

export default router;
