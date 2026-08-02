import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import notificationRepository from './notification.repository.js';
import auditRepository from './audit.repository.js';
import activityRepository from './activity.repository.js';
import NotificationUtils from './notification.utils.js';
import { NOTIFICATION_PRIORITY, READ_STATUS, NOTIFICATION_STATUS } from './notification.constants.js';

class AnalyticsService {
  constructor() {
    this.logger = Logger;
    this.notificationRepo = notificationRepository;
    this.auditRepo = auditRepository;
    this.activityRepo = activityRepository;
    this.utils = NotificationUtils;
  }

  // Notification Analytics
  async getNotificationAnalytics(startDate, endDate, granularity = 'daily') {
    try {
      const matchStage = this.buildDateMatch(startDate, endDate, 'notification');

      const [
        timeSeries,
        readRate,
        deliveryRate,
        categoryBreakdown,
        priorityBreakdown,
        channelBreakdown,
        departmentBreakdown
      ] = await Promise.all([
        this.getNotificationTimeSeries(matchStage, granularity),
        this.getNotificationReadRate(matchStage),
        this.getNotificationDeliveryRate(matchStage),
        this.getNotificationCategoryBreakdown(matchStage),
        this.getNotificationPriorityBreakdown(matchStage),
        this.getNotificationChannelBreakdown(matchStage),
        this.getNotificationDepartmentBreakdown(matchStage)
      ]);

      return {
        timeSeries,
        metrics: {
          readRate,
          deliveryRate,
          total: await this.notificationRepo.count(matchStage)
        },
        breakdowns: {
          category: categoryBreakdown,
          priority: priorityBreakdown,
          channel: channelBreakdown,
          department: departmentBreakdown
        }
      };
    } catch (error) {
      this.logger.error('Error getting notification analytics:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get notification analytics', 500);
    }
  }

  // Activity Analytics
  async getActivityAnalytics(startDate, endDate, granularity = 'daily') {
    try {
      const matchStage = this.buildDateMatch(startDate, endDate, 'activity');

      const [
        timeSeries,
        typeBreakdown,
        moduleBreakdown,
        statusBreakdown,
        userActivity,
        departmentActivity
      ] = await Promise.all([
        this.getActivityTimeSeries(matchStage, granularity),
        this.getActivityTypeBreakdown(matchStage),
        this.getActivityModuleBreakdown(matchStage),
        this.getActivityStatusBreakdown(matchStage),
        this.getUserActivitySummary(matchStage),
        this.getDepartmentActivitySummary(matchStage)
      ]);

      return {
        timeSeries,
        metrics: {
          total: await this.activityRepo.count(matchStage),
          completed: await this.activityRepo.count({ ...matchStage, status: 'completed' }),
          failed: await this.activityRepo.count({ ...matchStage, status: 'failed' })
        },
        breakdowns: {
          type: typeBreakdown,
          module: moduleBreakdown,
          status: statusBreakdown
        },
        summaries: {
          userActivity,
          departmentActivity
        }
      };
    } catch (error) {
      this.logger.error('Error getting activity analytics:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity analytics', 500);
    }
  }

  // Audit Analytics
  async getAuditAnalytics(startDate, endDate, granularity = 'daily') {
    try {
      const matchStage = this.buildDateMatch(startDate, endDate, 'audit');

      const [
        timeSeries,
        actionBreakdown,
        moduleBreakdown,
        impactBreakdown,
        statusBreakdown,
        securityTrends
      ] = await Promise.all([
        this.getAuditTimeSeries(matchStage, granularity),
        this.getAuditActionBreakdown(matchStage),
        this.getAuditModuleBreakdown(matchStage),
        this.getAuditImpactBreakdown(matchStage),
        this.getAuditStatusBreakdown(matchStage),
        this.getSecurityTrends(matchStage)
      ]);

      return {
        timeSeries,
        metrics: {
          total: await this.auditRepo.count(matchStage),
          successful: await this.auditRepo.count({ ...matchStage, status: 'success' }),
          failed: await this.auditRepo.count({ ...matchStage, status: 'failed' }),
          highImpact: await this.auditRepo.count({ ...matchStage, impact: 'high' }),
          criticalImpact: await this.auditRepo.count({ ...matchStage, impact: 'critical' })
        },
        breakdowns: {
          action: actionBreakdown,
          module: moduleBreakdown,
          impact: impactBreakdown,
          status: statusBreakdown
        },
        security: securityTrends
      };
    } catch (error) {
      this.logger.error('Error getting audit analytics:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit analytics', 500);
    }
  }

  // Notification Time Series
  async getNotificationTimeSeries(matchStage, granularity) {
    const dateFormat = this.getDateFormat(granularity);

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$readStatus', READ_STATUS.UNREAD] }, 1, 0] }
          },
          read: {
            $sum: { $cond: [{ $eq: ['$readStatus', READ_STATUS.READ] }, 1, 0] }
          },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', NOTIFICATION_STATUS.DELIVERED] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', NOTIFICATION_STATUS.FAILED] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await this.notificationRepo.aggregate(pipeline);
  }

  // Activity Time Series
  async getActivityTimeSeries(matchStage, granularity) {
    const dateFormat = this.getDateFormat(granularity);

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' }
          },
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  // Audit Time Series
  async getAuditTimeSeries(matchStage, granularity) {
    const dateFormat = this.getDateFormat(granularity);

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' }
          },
          total: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          highImpact: {
            $sum: { $cond: [{ $eq: ['$impact', 'high'] }, 1, 0] }
          },
          criticalImpact: {
            $sum: { $cond: [{ $eq: ['$impact', 'critical'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await this.auditRepo.aggregate(pipeline);
  }

  // Notification Read Rate
  async getNotificationReadRate(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          read: {
            $sum: { $cond: [{ $eq: ['$readStatus', READ_STATUS.READ] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          readRate: {
            $multiply: [
              { $divide: ['$read', '$total'] },
              100
            ]
          }
        }
      }
    ];

    const result = await this.notificationRepo.aggregate(pipeline);
    return result[0]?.readRate || 0;
  }

  // Notification Delivery Rate
  async getNotificationDeliveryRate(matchStage) {
    const pipeline = [
     { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', NOTIFICATION_STATUS.DELIVERED] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          deliveryRate: {
            $multiply: [
              { $divide: ['$delivered', '$total'] },
              100
            ]
          }
        }
      }
    ];

    const result = await this.notificationRepo.aggregate(pipeline);
    return result[0]?.deliveryRate || 0;
  }

  // Notification Category Breakdown
  async getNotificationCategoryBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$readStatus', READ_STATUS.UNREAD] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.notificationRepo.aggregate(pipeline);
  }

  // Notification Priority Breakdown
  async getNotificationPriorityBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$readStatus', READ_STATUS.UNREAD] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.notificationRepo.aggregate(pipeline);
  }

  // Notification Channel Breakdown
  async getNotificationChannelBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $unwind: '$channels'
      },
      {
        $group: {
          _id: '$channels',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.notificationRepo.aggregate(pipeline);
  }

  // Notification Department Breakdown
  async getNotificationDepartmentBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$readStatus', READ_STATUS.UNREAD] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.notificationRepo.aggregate(pipeline);
  }

  // Activity Type Breakdown
  async getActivityTypeBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  // Activity Module Breakdown
  async getActivityModuleBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$module',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  // Activity Status Breakdown
  async getActivityStatusBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  // User Activity Summary
  async getUserActivitySummary(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          userName: { $first: '$userName' },
          userEmail: { $first: '$userEmail' },
          userRole: { $first: '$userRole' },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          modules: { $addToSet: '$module' }
        }
      },
      {
        $sort: { total: -1 }
      },
      { $limit: 50 }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  // Department Activity Summary
  async getDepartmentActivitySummary(matchStage) {
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

    return await this.activityRepo.aggregate(pipeline);
  }

  // Audit Action Breakdown
  async getAuditActionBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.auditRepo.aggregate(pipeline);
  }

  // Audit Module Breakdown
  async getAuditModuleBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$module',
          count: { $sum: 1 },
          highImpact: {
            $sum: { $cond: [{ $eq: ['$impact', 'high'] }, 1, 0] }
          },
          criticalImpact: {
            $sum: { $cond: [{ $eq: ['$impact', 'critical'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.auditRepo.aggregate(pipeline);
  }

  // Audit Impact Breakdown
  async getAuditImpactBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$impact',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.auditRepo.aggregate(pipeline);
  }

  // Audit Status Breakdown
  async getAuditStatusBreakdown(matchStage) {
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.auditRepo.aggregate(pipeline);
  }

  // Security Trends
  async getSecurityTrends(matchStage) {
    const securityMatch = { ...matchStage, module: 'authentication' };

    const pipeline = [
      { $match: securityMatch },
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

    return await this.auditRepo.aggregate(pipeline);
  }

  // Heatmap Data
  async getActivityHeatmap(userId, startDate, endDate) {
    const matchStage = {
      user: userId,
      isDeleted: false
    };

    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            hour: { $hour: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1, '_id.hour': 1 } }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  // Leaderboard
  async getActivityLeaderboard(startDate, endDate, limit = 10) {
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
          _id: '$user',
          userName: { $first: '$userName' },
          userEmail: { $first: '$userEmail' },
          userRole: { $first: '$userRole' },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { total: -1 }
      },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          user: '$_id',
          userName: 1,
          userEmail: 1,
          userRole: 1,
          total: 1,
          completed: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completed', '$total'] },
              100
            ]
          }
        }
      }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  // Helper: Build Date Match Stage
  buildDateMatch(startDate, endDate, type) {
    const matchStage = { isDeleted: false };

    if (startDate || endDate) {
      const dateField = type === 'notification' ? 'createdAt' : 'timestamp';
      matchStage[dateField] = {};
      if (startDate) matchStage[dateField].$gte = new Date(startDate);
      if (endDate) matchStage[dateField].$lte = new Date(endDate);
    }

    return matchStage;
  }

  // Helper: Get Date Format
  getDateFormat(granularity) {
    const formats = {
      hourly: '%Y-%m-%d-%H',
      daily: '%Y-%m-%d',
      weekly: '%Y-%U',
      monthly: '%Y-%m'
    };
    return formats[granularity] || '%Y-%m-%d';
  }

  // Chart Ready APIs
  async getChartData(type, startDate, endDate, granularity = 'daily') {
    try {
      switch (type) {
        case 'notification':
          return await this.getNotificationAnalytics(startDate, endDate, granularity);
        case 'activity':
          return await this.getActivityAnalytics(startDate, endDate, granularity);
        case 'audit':
          return await this.getAuditAnalytics(startDate, endDate, granularity);
        default:
          throw new AppError('Invalid chart type', 400);
      }
    } catch (error) {
      this.logger.error('Error getting chart data:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get chart data', 500);
    }
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
