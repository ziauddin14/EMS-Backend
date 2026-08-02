// Notification & Audit Foundation Module
// This module provides comprehensive notification, audit logging, and activity tracking functionality

// Export Models
export { default as Notification } from './notification.model.js';
export { default as NotificationPreference } from './notificationPreference.model.js';
export { default as AuditLog } from './auditLog.model.js';
export { default as ActivityLog } from './activityLog.model.js';

// Export Constants
export { default as NOTIFICATION_CONSTANTS } from './notification.constants.js';

// Export Permissions
export { default as NOTIFICATION_PERMISSIONS } from './notification.permissions.js';

// Export Validation Schemas
export { notificationValidationSchemas } from './notification.validation.js';

// Export Helpers
export { default as NotificationHelpers } from './notification.helpers.js';

// Export Utilities
export { default as NotificationUtils } from './notification.utils.js';

// Export Repositories
export { default as notificationRepository } from './notification.repository.js';
export { default as auditRepository } from './audit.repository.js';
export { default as activityRepository } from './activity.repository.js';

// Export Services
export { default as notificationService } from './notification.service.js';
export { default as auditService } from './audit.service.js';
export { default as activityService } from './activity.service.js';
export { default as analyticsService } from './analytics.service.js';
export { default as reportsService } from './reports.service.js';

// Export Controllers
export { default as notificationController } from './notification.controller.js';
export { default as auditController } from './audit.controller.js';
export { default as activityController } from './activity.controller.js';
export { default as notificationDashboardController } from './notificationDashboard.controller.js';
export { default as activityDashboardController } from './activityDashboard.controller.js';
export { default as auditDashboardController } from './auditDashboard.controller.js';
export { default as executiveMonitoringController } from './executiveMonitoring.controller.js';

// Export Routes
export { default as notificationRoutes } from './notification.routes.js';
export { default as dashboardRoutes } from './dashboard.routes.js';

// Export Real-time Architecture
export { default as realTimeArchitecture } from './realtime/realtimeArchitecture.js';

// Export Optimization
export { default as indexOptimizer } from './indexes.js';
export { default as AggregationOptimizer } from './aggregationOptimization.js';
export { default as RepositoryOptimizer } from './repositoryOptimization.js';

// Export Security
export { default as NotificationSecurity } from './security.js';

// Module Info
export const moduleInfo = {
  name: 'Notification & Audit Foundation',
  version: '1.0.0',
  description: 'Comprehensive notification, audit logging, and activity tracking module with dashboards, analytics, and reporting',
  features: [
    'Multi-channel notifications (email, SMS, push, in-app, WhatsApp, Slack, Teams, Discord)',
    'User notification preferences with channel, category, and priority settings',
    'Mute and quiet hours functionality',
    'Digest frequency options (immediate, hourly, daily, weekly, monthly)',
    'Comprehensive audit logging with change tracking',
    'Activity logging for user actions and system events',
    'Time series analytics and statistics',
    'Export functionality (CSV, JSON)',
    'Soft delete with restore capability',
    'RBAC permission system',
    'Employee, Manager, HR, and CEO dashboards',
    'Activity timeline and analytics',
    'Audit timeline and analytics',
    'Executive monitoring dashboard',
    'Daily, weekly, monthly, and compliance reports',
    'Chart-ready analytics APIs',
    'Activity heatmap and leaderboard',
    'Optimized MongoDB indexes for 100,000+ employees',
    'Future-ready architecture for messaging/event systems'
  ],
  models: ['Notification', 'NotificationPreference', 'AuditLog', 'ActivityLog'],
  repositories: ['notificationRepository', 'auditRepository', 'activityRepository'],
  services: ['notificationService', 'auditService', 'activityService', 'analyticsService', 'reportsService'],
  controllers: ['notificationController', 'auditController', 'activityController', 'notificationDashboardController', 'activityDashboardController', 'auditDashboardController', 'executiveMonitoringController'],
  routes: ['notificationRoutes', 'dashboardRoutes'],
  optimization: ['indexOptimizer', 'AggregationOptimizer', 'RepositoryOptimizer'],
  security: ['NotificationSecurity'],
  realTime: ['realTimeArchitecture']
};
