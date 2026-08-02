import AsyncHandler from '../../core/middleware/asyncHandler.js';
import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import notificationService from './notification.service.js';
import activityService from './activity.service.js';
import auditService from './audit.service.js';
import NotificationUtils from './notification.utils.js';
import { NOTIFICATION_PRIORITY, NOTIFICATION_STATUS, READ_STATUS } from './notification.constants.js';

class NotificationDashboardController {
  // Employee Notification Dashboard
  getEmployeeDashboard = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = NotificationUtils.startOfDay();
    const tomorrow = NotificationUtils.endOfDay();

    const [
      unreadCount,
      readCount,
      priorityCount,
      todayCount,
      recentNotifications,
      actionRequired
    ] = await Promise.all([
      notificationService.getUnreadCount(userId),
      notificationService.repository.count({ recipient: userId, readStatus: READ_STATUS.READ, isDeleted: false }),
      notificationService.repository.count({
        recipient: userId,
        priority: { $in: [NOTIFICATION_PRIORITY.HIGH, NOTIFICATION_PRIORITY.URGENT, NOTIFICATION_PRIORITY.CRITICAL] },
        readStatus: READ_STATUS.UNREAD,
        isDeleted: false
      }),
      notificationService.repository.count({
        recipient: userId,
        createdAt: { $gte: today, $lte: tomorrow },
        isDeleted: false
      }),
      notificationService.repository.find(
        { recipient: userId, isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 10, lean: true }
      ),
      notificationService.repository.find(
        {
          recipient: userId,
          readStatus: READ_STATUS.UNREAD,
          category: { $in: ['task', 'approval', 'meeting', 'kpi'] },
          isDeleted: false
        },
        null,
        { sort: { priority: -1, createdAt: -1 }, limit: 5, lean: true }
      )
    ]);

    const dashboard = {
      summary: {
        unread: unreadCount.unreadCount,
        read: readCount,
        priority: priorityCount,
        today: todayCount,
        total: unreadCount.unreadCount + readCount
      },
      recent: recentNotifications,
      actionRequired,
      trends: {
        weekly: await this.getWeeklyTrends(userId),
        category: await notificationService.getCategoryBreakdown(userId, null, null)
      }
    };

    return ApiResponse.success(res, dashboard, 'Employee dashboard retrieved');
  });

  // Manager Dashboard
  getManagerDashboard = AsyncHandler(async (req, res) => {
    const managerId = req.user._id;
    const department = req.user.department;
    const today = NotificationUtils.startOfDay();
    const tomorrow = NotificationUtils.endOfDay();

    const [
      teamNotifications,
      teamActivities,
      criticalAlerts,
      unreadTeamNotifications
    ] = await Promise.all([
      notificationService.repository.find(
        { department, isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 20, lean: true }
      ),
      activityService.repository.find(
        { module: 'employee', isDeleted: false },
        null,
        { sort: { timestamp: -1 }, limit: 20, lean: true }
      ),
      notificationService.repository.find(
        {
          department,
          priority: { $in: [NOTIFICATION_PRIORITY.URGENT, NOTIFICATION_PRIORITY.CRITICAL] },
          isDeleted: false
        },
        null,
        { sort: { createdAt: -1 }, limit: 10, lean: true }
      ),
      notificationService.repository.count({
        department,
        readStatus: READ_STATUS.UNREAD,
        isDeleted: false
      })
    ]);

    const dashboard = {
      summary: {
        teamNotifications: teamNotifications.length,
        teamActivities: teamActivities.length,
        criticalAlerts: criticalAlerts.length,
        unreadTeam: unreadTeamNotifications
      },
      teamNotifications,
      teamActivities,
      criticalAlerts,
      departmentBreakdown: await this.getDepartmentBreakdown(department)
    };

    return ApiResponse.success(res, dashboard, 'Manager dashboard retrieved');
  });

  // HR Dashboard
  getHRDashboard = AsyncHandler(async (req, res) => {
    const today = NotificationUtils.startOfDay();
    const tomorrow = NotificationUtils.endOfDay();

    const [
      organizationNotifications,
      departmentNotifications,
      employeeActivities,
      auditSummary,
      lateAttendanceAlerts,
      leaveAlerts,
      performanceAlerts,
      meetingAlerts
    ] = await Promise.all([
      notificationService.repository.find(
        { isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 30, lean: true }
      ),
      notificationService.repository.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      activityService.repository.find(
        { module: 'employee', isDeleted: false },
        null,
        { sort: { timestamp: -1 }, limit: 30, lean: true }
      ),
      auditService.repository.getAuditStatistics(null, null),
      notificationService.repository.find(
        { category: 'attendance', isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 10, lean: true }
      ),
      notificationService.repository.find(
        { category: 'leave', isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 10, lean: true }
      ),
      notificationService.repository.find(
        { category: 'performance', isDeleted: false },
        null,
        { sort: { onCreate: -1 }, limit: 10, lean: true }
      ),
      notificationService.repository.find(
        { category: 'meeting', isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 10, lean: true }
      )
    ]);

    const dashboard = {
      summary: {
        organizationNotifications: organizationNotifications.length,
        departmentNotifications: departmentNotifications.length,
        employeeActivities: employeeActivities.length,
        auditSummary,
        lateAttendance: lateAttendanceAlerts.length,
        leaveAlerts: leaveAlerts.length,
        performanceAlerts: performanceAlerts.length,
        meetingAlerts: meetingAlerts.length
      },
      organizationNotifications,
      departmentNotifications,
      employeeActivities,
      lateAttendanceAlerts,
      leaveAlerts,
      performanceAlerts,
      meetingAlerts
    };

    return ApiResponse.success(res, dashboard, 'HR dashboard retrieved');
  });

  // CEO Dashboard
  getCEODashboard = AsyncHandler(async (req, res) => {
    const [
      organizationActivityFeed,
      criticalEvents,
      securityAlerts,
      auditOverview,
      executiveNotifications,
      executiveTimeline,
      systemHealthAlerts,
      organizationRiskAlerts
    ] = await Promise.all([
      activityService.repository.find(
        { isDeleted: false },
        null,
        { sort: { timestamp: -1 }, limit: 50, lean: true }
      ),
      notificationService.repository.find(
        {
          priority: { $in: [NOTIFICATION_PRIORITY.URGENT, NOTIFICATION_PRIORITY.CRITICAL] },
          isDeleted: false
        },
        null,
        { sort: { createdAt: -1 }, limit: 20, lean: true }
      ),
      auditService.repository.getFailedActions(20),
      auditService.repository.getAuditStatistics(null, null),
      notificationService.repository.find(
        { category: 'executive', isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 20, lean: true }
      ),
      activityService.repository.find(
        { module: 'executive', isDeleted: false },
        null,
        { sort: { timestamp: -1 }, limit: 30, lean: true }
      ),
      notificationService.repository.find(
        { category: 'system', isDeleted: false },
        null,
        { sort: { createdAt: -1 }, limit: 15, lean: true }
      ),
      auditService.repository.getHighImpactActions(15)
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
      organizationRiskAlerts
    };

    return ApiResponse.success(res, dashboard, 'CEO dashboard retrieved');
  });

  // Notification Center
  getNotificationCenter = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
      category,
      type,
      priority,
      readStatus,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { recipient: userId, isDeleted: false };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (readStatus) filter.readStatus = readStatus;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await notificationService.repository.paginate(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    });

    const statistics = await notificationService.getNotificationStatistics(userId, startDate, endDate);

    return ApiResponse.success(res, {
      notifications: result.data,
      pagination: result.pagination,
      statistics,
      categories: await this.getNotificationCategories(userId),
      filters: { category, type, priority, readStatus, startDate, endDate, search }
    }, 'Notification center retrieved');
  });

  // Notification History
  getNotificationHistory = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = { recipient: userId, isDeleted: false };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const result = await notificationService.repository.paginate(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    });

    return ApiResponse.success(res, result, 'Notification history retrieved');
  });

  // Notification Timeline
  getNotificationTimeline = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate, granularity = 'daily' } = req.query;

    const timeline = await notificationService.getTimeSeriesData(userId, startDate, endDate, granularity);

    return ApiResponse.success(res, timeline, 'Notification timeline retrieved');
  });

  // Helper: Get Weekly Trends
  async getWeeklyTrends(userId) {
    const weekAgo = NotificationUtils.addDays(new Date(), -7);
    const pipeline = [
      {
        $match: {
          recipient: userId,
          createdAt: { $gte: weekAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          read: {
            $sum: { $cond: [{ $eq: ['$readStatus', 'read'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await notificationService.repository.aggregate(pipeline);
  }

  // Helper: Get Department Breakdown
  async getDepartmentBreakdown(department) {
    const pipeline = [
      { $match: { department, isDeleted: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$readStatus', 'unread'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await notificationService.repository.aggregate(pipeline);
  }

  // Helper: Get Notification Categories
  async getNotificationCategories(userId) {
    const pipeline = [
      { $match: { recipient: userId, isDeleted: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$readStatus', 'unread'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await notificationService.repository.aggregate(pipeline);
  }
}

const notificationDashboardController = new NotificationDashboardController();
export default notificationDashboardController;
