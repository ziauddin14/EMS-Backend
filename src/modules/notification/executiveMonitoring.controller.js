import AsyncHandler from '../../core/middleware/asyncHandler.js';
import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import notificationService from './notification.service.js';
import activityService from './activity.service.js';
import auditService from './audit.service.js';
import NotificationUtils from './notification.utils.js';
import { NOTIFICATION_PRIORITY } from './notification.constants.js';

class ExecutiveMonitoringController {
  // Executive Monitoring Dashboard
  getExecutiveMonitoring = AsyncHandler(async (req, res) => {
    const today = NotificationUtils.startOfDay();
    const tomorrow = NotificationUtils.endOfDay();

    const [
      organizationActivityFeed,
      criticalEvents,
      securityAlerts,
      auditOverview,
      executiveNotifications,
      executiveTimeline,
      systemHealthAlerts,
      organizationRiskAlerts,
      departmentSummary,
      userActivitySummary
    ] = await Promise.all([
      activityService.repository.find(
        { isDeleted: false },
        null,
        { sort: { timestamp: -1 }, limit: 100, lean: true }
      ),
      notificationService.repository.find(
        {
          priority: { $in: [NOTIFICATION_PRIORITY.URGENT, NOTIFICATION_PRIORITY.CRITICAL] },
          isDeleted: false
        },
        null,
        { sort: { createdAt: -1 }, limit: 30, lean: true }
      ),
      auditService.repository.find(
        {
          module: 'authentication',
          status: 'failed',
          isDeleted: false
        },
        null,
        { sort: { timestamp: -1 }, limit: 20, lean: true }
      ),
      auditService.getAuditStatistics(null, null),
      notificationService.repository.find(
        { category: 'executive', isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 30, lean: true }
      ),
      activityService.repository.find(
        { module: 'executive', isDeleted: false },
        null,
        { sort: { timestamp: -1 }, limit: 50, lean: true }
      ),
      notificationService.repository.find(
        { category: 'system', isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 20, lean: true }
      ),
      auditService.repository.find(
        {
          impact: { $in: ['high', 'critical'] },
          isDeleted: false
        },
        null,
        { sort: { timestamp: -1 }, limit: 30, lean: true }
      ),
      this.getDepartmentSummary(),
      this.getUserActivitySummary()
    ]);

    const dashboard = {
      summary: {
        activityFeed: organizationActivityFeed.length,
        criticalEvents: criticalEvents.length,
        securityAlerts: securityAlerts.length,
        auditOverview,
        executiveNotifications: executiveNotifications.length,
        systemHealth: systemHealthAlerts.length,
        riskAlerts: organizationRiskAlerts.length
      },
      organizationActivityFeed,
      criticalEvents,
      securityAlerts,
      auditOverview,
      executiveNotifications,
      executiveTimeline,
      systemHealthAlerts,
      organizationRiskAlerts,
      departmentSummary,
      userActivitySummary,
      trends: {
        notification: await notificationService.getTimeSeriesData(null, null, 'daily', null, null),
        activity: await activityService.getTimeSeriesData(null, null, 'daily', null, null),
        audit: await auditService.getTimeSeriesData(null, null, 'daily', null, null)
      }
    };

    return ApiResponse.success(res, dashboard, 'Executive monitoring dashboard retrieved');
  });

  // Organization Activity Feed
  getOrganizationActivityFeed = AsyncHandler(async (req, res) => {
    const { limit = 100, module } = req.query;

    const filter = { isDeleted: false };
    if (module) filter.module = module;

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, activities, 'Organization activity feed retrieved');
  });

  // Critical Events
  getCriticalEvents = AsyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const events = await notificationService.repository.find(
      {
        priority: { $in: [NOTIFICATION_PRIORITY.URGENT, NOTIFICATION_PRIORITY.CRITICAL] },
        isDeleted: false
      },
      null,
      { sort: { createdAt: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, events, 'Critical events retrieved');
  });

  // Security Alerts
  getSecurityAlerts = AsyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const alerts = await auditService.repository.find(
      {
        module: 'authentication',
        status: 'failed',
        isDeleted: false
      },
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, alerts, 'Security alerts retrieved');
  });

  // Audit Overview
  getAuditOverview = AsyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const overview = await auditService.getAuditStatistics(startDate, endDate);

    return ApiResponse.success(res, overview, 'Audit overview retrieved');
  });

  // Executive Notifications
  getExecutiveNotifications = AsyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const notifications = await notificationService.repository.find(
      { category: 'executive', isDeleted: false },
      null,
      { sort: { createdAt: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, notifications, 'Executive notifications retrieved');
  });

  // Executive Timeline
  getExecutiveTimeline = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'executive', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const timeline = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, timeline, 'Executive timeline retrieved');
  });

  // System Health Alerts
  getSystemHealthAlerts = AsyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const alerts = await notificationService.repository.find(
      { category: 'system', isDeleted: false },
      null,
      { sort: { createdAt: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, alerts, 'System health alerts retrieved');
  });

  // Organization Risk Alerts
  getOrganizationRiskAlerts = AsyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const alerts = await auditService.repository.find(
      {
        impact: { $in: ['high', 'critical'] },
        isDeleted: false
      },
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, alerts, 'Organization risk alerts retrieved');
  });

  // Department Summary
  getDepartmentSummary = AsyncHandler(async (req, res) => {
    const summary = await this.getDepartmentSummary();

    return ApiResponse.success(res, summary, 'Department summary retrieved');
  });

  // User Activity Summary
  getUserActivitySummary = AsyncHandler(async (req, res) => {
    const summary = await this.getUserActivitySummary();

    return ApiResponse.success(res, summary, 'User activity summary retrieved');
  });

  // Executive Analytics
  getExecutiveAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'daily' } = req.query;

    const [
      notificationTrends,
      activityTrends,
      auditTrends,
      securityTrends,
      moduleUsage,
      departmentActivity
    ] = await Promise.all([
      notificationService.getTimeSeriesData(null, startDate, endDate, granularity),
      activityService.getTimeSeriesData(startDate, endDate, granularity, null, null),
      auditService.getTimeSeriesData(startDate, endDate, granularity, null, null),
      this.getSecurityTrends(startDate, endDate),
      activityService.getModuleBreakdown(startDate, endDate),
      this.getDepartmentActivity(startDate, endDate)
    ]);

    const analytics = {
      notificationTrends,
      activityTrends,
      auditTrends,
      securityTrends,
      moduleUsage,
      departmentActivity,
      keyMetrics: await this.getKeyMetrics()
    };

    return ApiResponse.success(res, analytics, 'Executive analytics retrieved');
  });

  // Helper: Get Department Summary
  async getDepartmentSummary() {
    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$department',
          notificationCount: {
            $sum: {
              $cond: [{ $eq: ['$category', 'notification'] }, 1, 0]
            }
          },
          activityCount: {
            $sum: {
              $cond: [{ $eq: ['$module', 'activity'] }, 1, 0]
            }
          },
          auditCount: {
            $sum: {
              $cond: [{ $eq: ['$module', 'audit'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { notificationCount: -1 } }
    ];

    return await activityService.repository.aggregate(pipeline);
  }

  // Helper: Get User Activity Summary
  async getUserActivitySummary() {
    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$user',
          userName: { $first: '$userName' },
          userEmail: { $first: '$userEmail' },
          userRole: { $first: '$userRole' },
          total: { $sum: 1 },
          modules: { $addToSet: '$module' }
        }
      },
      {
        $sort: { total: -1 }
      },
      { $limit: 50 }
    ];

    return await activityService.repository.aggregate(pipeline);
  }

  // Helper: Get Security Trends
  async getSecurityTrends(startDate, endDate) {
    const filter = { module: 'authentication', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await auditService.repository.aggregate(pipeline);
  }

  // Helper: Get Department Activity
  async getDepartmentActivity(startDate, endDate) {
    const matchStage = { isDeleted: false };

    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          modules: { $addToSet: '$module' }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await activityService.repository.aggregate(pipeline);
  }

  // Helper: Get Key Metrics
  async getKeyMetrics() {
    const today = NotificationUtils.startOfDay();
    const tomorrow = NotificationUtils.endOfDay();

    const [
      todayNotifications,
      todayActivities,
      todayAudits,
      activeUsers,
      criticalAlerts,
      failedLogins
    ] = await Promise.all([
      notificationService.repository.count({
        createdAt: { $gte: today, $lte: tomorrow },
        isDeleted: false
      }),
      activityService.repository.count({
        timestamp: { $gte: today, $lte: tomorrow },
        isDeleted: false
      }),
      auditService.repository.count({
        timestamp: { $gte: today, $lte: tomorrow },
        isDeleted: false
      }),
      activityService.repository.count({
        timestamp: { $gte: today, $lte: tomorrow },
        type: 'login',
        isDeleted: false
      }),
      notificationService.repository.count({
        priority: { $in: [NOTIFICATION_PRIORITY.URGENT, NOTIFICATION_PRIORITY.CRITICAL] },
        isDeleted: false
      }),
      auditService.repository.count({
        module: 'authentication',
        action: 'login',
        status: 'failed',
        timestamp: { $gte: today, $lte: tomorrow },
        isDeleted: false
      })
    ]);

    return {
      todayNotifications,
      todayActivities,
      todayAudits,
      activeUsers,
      criticalAlerts,
      failedLogins
    };
  }
}

const executiveMonitoringController = new ExecutiveMonitoringController();
export default executiveMonitoringController;
