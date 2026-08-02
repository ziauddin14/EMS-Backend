import AsyncHandler from '../../core/middleware/asyncHandler.js';
import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import auditService from './audit.service.js';
import NotificationUtils from './notification.utils.js';

class AuditDashboardController {
  // Audit Dashboard
  getAuditDashboard = AsyncHandler(async (req, res) => {
    const today = NotificationUtils.startOfDay();
    const tomorrow = NotificationUtils.endOfDay();

    const [
      todayAudits,
      recentAudits,
      auditStatistics,
      failedActions,
      highImpactActions,
      moduleBreakdown,
      actionBreakdown
    ] = await Promise.all([
      auditService.repository.find(
        {
          timestamp: { $gte: today, $lte: tomorrow },
          isDeleted: false
        },
        null,
        { sort: { timestamp: -1 }, lean: true }
      ),
      auditService.repository.find(
        { isDeleted: false },
        null,
        { sort: { timestamp: -1 }, limit: 20, lean: true }
      ),
      auditService.getAuditStatistics(null, null),
      auditService.getFailedActions(10),
      auditService.getHighImpactActions(10),
      auditService.getModuleBreakdown(null, null),
      auditService.getActionBreakdown(null, null)
    ]);

    const dashboard = {
      summary: {
        today: todayAudits.length,
        recent: recentAudits.length,
        statistics: auditStatistics,
        failed: failedActions.length,
        highImpact: highImpactActions.length
      },
      todayAudits,
      recentAudits,
      failedActions,
      highImpactActions,
      moduleBreakdown,
      actionBreakdown
    };

    return ApiResponse.success(res, dashboard, 'Audit dashboard retrieved');
  });

  // Audit Timeline
  getAuditTimeline = AsyncHandler(async (req, res) => {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = { isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const result = await auditService.repository.paginate(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { timestamp: -1 }
    });

    return ApiResponse.success(res, result, 'Audit timeline retrieved');
  });

  // User Activity Timeline (Audit)
  getUserActivityTimeline = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const timeline = await auditService.getUserActivity(userId, startDate, endDate);

    return ApiResponse.success(res, timeline, 'User audit timeline retrieved');
  });

  // Module Activity (Audit)
  getModuleActivity = AsyncHandler(async (req, res) => {
    const { module } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module, isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    const statistics = await auditService.getAuditStatistics(startDate, endDate);

    return ApiResponse.success(res, {
      activities,
      statistics,
      module
    }, 'Module audit activity retrieved');
  });

  // Security Events
  getSecurityEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'authentication', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    const loginCount = await auditService.repository.count({ ...filter, action: 'login' });
    const logoutCount = await auditService.repository.count({ ...filter, action: 'logout' });
    const failedLogins = await auditService.repository.count({ ...filter, action: 'login', status: 'failed' });

    return ApiResponse.success(res, {
      activities,
      statistics: {
        total: activities.length,
        logins: loginCount,
        logouts: logoutCount,
        failedLogins
      }
    }, 'Security events retrieved');
  });

  // Authentication Events (Audit)
  getAuthenticationEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'authentication', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Authentication audit events retrieved');
  });

  // Employee Events (Audit)
  getEmployeeEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'employee', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Employee audit events retrieved');
  });

  // Attendance Events (Audit)
  getAttendanceEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'attendance', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Attendance audit events retrieved');
  });

  // Task Events (Audit)
  getTaskEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'task', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Task audit events retrieved');
  });

  // Meeting Events (Audit)
  getMeetingEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'meeting', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Meeting audit events retrieved');
  });

  // KPI Events (Audit)
  getKPIEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'kpi', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'KPI audit events retrieved');
  });

  // Settings Events (Audit)
  getSettingsEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'settings', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Settings audit events retrieved');
  });

  // Executive Events (Audit)
  getExecutiveEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'executive', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await auditService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Executive audit events retrieved');
  });

  // Audit Analytics
  getAuditAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'daily' } = req.query;

    const [
      timeSeries,
      statistics,
      actionBreakdown,
      moduleBreakdown,
      failedActions,
      highImpactActions
    ] = await Promise.all([
      auditService.getTimeSeriesData(startDate, endDate, granularity, null, null),
      auditService.getAuditStatistics(startDate, endDate),
      auditService.getActionBreakdown(startDate, endDate),
      auditService.getModuleBreakdown(startDate, endDate),
      auditService.getFailedActions(50),
      auditService.getHighImpactActions(50)
    ]);

    const analytics = {
      timeSeries,
      statistics,
      actionBreakdown,
      moduleBreakdown,
      failedActions,
      highImpactActions,
      trends: await this.getAuditTrends()
    };

    return ApiResponse.success(res, analytics, 'Audit analytics retrieved');
  });

  // Entity History
  getEntityHistory = AsyncHandler(async (req, res) => {
    const { entity, entityId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const history = await auditService.getEntityHistory(entity, entityId, limit);

    return ApiResponse.success(res, history, 'Entity history retrieved');
  });

  // Recent Activity
  getRecentActivity = AsyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const module = req.query.module;

    const activities = await auditService.getRecentActivity(limit, module);

    return ApiResponse.success(res, activities, 'Recent audit activity retrieved');
  });

  // Helper: Get Audit Trends
  async getAuditTrends() {
    const monthAgo = NotificationUtils.addDays(new Date(), -30);
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: monthAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1, count: -1 }
      }
    ];

    return await auditService.repository.aggregate(pipeline);
  }
}

const auditDashboardController = new AuditDashboardController();
export default auditDashboardController;
