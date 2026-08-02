import AsyncHandler from '../../core/middleware/asyncHandler.js';
import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import activityService from './activity.service.js';
import NotificationUtils from './notification.utils.js';

class ActivityDashboardController {
  // Activity Dashboard
  getActivityDashboard = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = NotificationUtils.startOfDay();
    const tomorrow = NotificationUtils.endOfDay();

    const [
      todayActivities,
      weeklyActivities,
      recentActivities,
      activitySummary,
      activeSessions
    ] = await Promise.all([
      activityService.repository.find(
        {
          user: userId,
          timestamp: { $gte: today, $lte: tomorrow },
          isDeleted: false
        },
        null,
        { sort: { timestamp: -1 }, lean: true }
      ),
      this.getWeeklyActivitySummary(userId),
      activityService.repository.find(
        { user: userId, isDeleted: false },
        null,
        { sort: { timestamp: -1 }, limit: 20, lean: true }
      ),
      activityService.getUserActivitySummary(userId, null, null),
      activityService.getActiveSessions()
    ]);

    const dashboard = {
      summary: {
        today: todayActivities.length,
        weekly: weeklyActivities.total,
        recent: recentActivities.length,
        activeSessions: activeSessions.length
      },
      todayActivities,
      weeklyActivities,
      recentActivities,
      activitySummary,
      activeSessions,
      moduleBreakdown: await activityService.getModuleBreakdown(null, null),
      typeBreakdown: await activityService.getTypeBreakdown(null, null)
    };

    return ApiResponse.success(res, dashboard, 'Activity dashboard retrieved');
  });

  // Activity Timeline
  getActivityTimeline = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = { user: userId, isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const result = await activityService.repository.paginate(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { timestamp: -1 }
    });

    return ApiResponse.success(res, result, 'Activity timeline retrieved');
  });

  // Activity Analytics
  getActivityAnalytics = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate, granularity = 'daily' } = req.query;

    const [
      timeSeries,
      heatmap,
      summary,
      moduleBreakdown,
      typeBreakdown
    ] = await Promise.all([
      activityService.getTimeSeriesData(startDate, endDate, granularity, null, null),
      activityService.getActivityHeatmap(userId, startDate, endDate),
      activityService.getUserActivitySummary(userId, startDate, endDate),
      activityService.getModuleBreakdown(startDate, endDate),
      activityService.getTypeBreakdown(startDate, endDate)
    ]);

    const analytics = {
      timeSeries,
      heatmap,
      summary,
      moduleBreakdown,
      typeBreakdown,
      trends: await this.getActivityTrends(userId)
    };

    return ApiResponse.success(res, analytics, 'Activity analytics retrieved');
  });

  // User Activity Timeline
  getUserActivityTimeline = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const timeline = await activityService.getUserActivityTimeline(userId, startDate, endDate);

    return ApiResponse.success(res, timeline, 'User activity timeline retrieved');
  });

  // Module Activity
  getModuleActivity = AsyncHandler(async (req, res) => {
    const { module } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module, isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    const statistics = await activityService.getActivityStatistics(startDate, endDate);

    return ApiResponse.success(res, {
      activities,
      statistics,
      module
    }, 'Module activity retrieved');
  });

  // Authentication Events
  getAuthenticationEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'authentication', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    const loginCount = await activityService.repository.count({ ...filter, type: 'login' });
    const logoutCount = await activityService.repository.count({ ...filter, type: 'logout' });

    return ApiResponse.success(res, {
      activities,
      statistics: {
        total: activities.length,
        logins: loginCount,
        logouts: logoutCount
      }
    }, 'Authentication events retrieved');
  });

  // Employee Events
  getEmployeeEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'employee', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Employee events retrieved');
  });

  // Attendance Events
  getAttendanceEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'attendance', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    const checkInCount = await activityService.repository.count({ ...filter, type: 'attendance_check_in' });
    const checkOutCount = await activityService.repository.count({ ...filter, type: 'attendance_check_out' });

    return ApiResponse.success(res, {
      activities,
      statistics: {
        total: activities.length,
        checkIns: checkInCount,
        checkOuts: checkOutCount
      }
    }, 'Attendance events retrieved');
  });

  // Task Events
  getTaskEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'task', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Task events retrieved');
  });

  // Meeting Events
  getMeetingEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'meeting', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Meeting events retrieved');
  });

  // KPI Events
  getKPIEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'kpi', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'KPI events retrieved');
  });

  // Settings Events
  getSettingsEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'settings', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Settings events retrieved');
  });

  // Executive Events
  getExecutiveEvents = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;

    const filter = { module: 'executive', isDeleted: false };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const activities = await activityService.repository.find(
      filter,
      null,
      { sort: { timestamp: -1 }, limit: parseInt(limit), lean: true }
    );

    return ApiResponse.success(res, { activities }, 'Executive events retrieved');
  });

  // Activity Leaderboard
  getActivityLeaderboard = AsyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 10 } = req.query;

    const leaderboard = await activityService.getActivityLeaderboard(startDate, endDate, parseInt(limit));

    return ApiResponse.success(res, leaderboard, 'Activity leaderboard retrieved');
  });

  // Helper: Get Weekly Activity Summary
  async getWeeklyActivitySummary(userId) {
    const weekAgo = NotificationUtils.addDays(new Date(), -7);
    const pipeline = [
      {
        $match: {
          user: userId,
          timestamp: { $gte: weekAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const result = await activityService.repository.aggregate(pipeline);
    return {
      total: result.reduce((sum, day) => sum + day.count, 0),
      daily: result
    };
  }

  // Helper: Get Activity Trends
  async getActivityTrends(userId) {
    const monthAgo = NotificationUtils.addDays(new Date(), -30);
    const pipeline = [
      {
        $match: {
          user: userId,
          timestamp: { $gte: monthAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await activityService.repository.aggregate(pipeline);
  }
}

const activityDashboardController = new ActivityDashboardController();
export default activityDashboardController;
