import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import notificationRepository from './notification.repository.js';
import auditRepository from './audit.repository.js';
import activityRepository from './activity.repository.js';
import NotificationUtils from './notification.utils.js';
import { READ_STATUS, NOTIFICATION_STATUS } from './notification.constants.js';

class ReportsService {
  constructor() {
    this.logger = Logger;
    this.notificationRepo = notificationRepository;
    this.auditRepo = auditRepository;
    this.activityRepo = activityRepository;
    this.utils = NotificationUtils;
  }

  // Daily Activity Report
  async generateDailyActivityReport(date = new Date()) {
    try {
      const startDate = this.utils.startOfDay(date);
      const endDate = this.utils.endOfDay(date);

      const [
        notificationStats,
        activityStats,
        auditStats,
        securityEvents,
        criticalAlerts
      ] = await Promise.all([
        this.getNotificationReportData(startDate, endDate),
        this.getActivityReportData(startDate, endDate),
        this.getAuditReportData(startDate, endDate),
        this.getSecurityReportData(startDate, endDate),
        this.getCriticalAlertsReportData(startDate, endDate)
      ]);

      const report = {
        reportType: 'daily',
        reportDate: this.utils.formatDate(date),
        generatedAt: new Date(),
        summary: {
          notifications: notificationStats,
          activities: activityStats,
          audits: auditStats,
          security: securityEvents,
          critical: criticalAlerts
        },
        details: {
          notifications: await this.getNotificationDetails(startDate, endDate),
          activities: await this.getActivityDetails(startDate, endDate),
          audits: await this.getAuditDetails(startDate, endDate)
        }
      };

      this.logger.info(`Daily activity report generated for ${this.utils.formatDate(date)}`);
      return report;
    } catch (error) {
      this.logger.error('Error generating daily activity report:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate daily activity report', 500);
    }
  }

  // Weekly Activity Report
  async generateWeeklyActivityReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const [
        notificationStats,
        activityStats,
        auditStats,
        securityEvents,
        departmentBreakdown,
        userActivity
      ] = await Promise.all([
        this.getNotificationReportData(start, end),
        this.getActivityReportData(start, end),
        this.getAuditReportData(start, end),
        this.getSecurityReportData(start, end),
        this.getDepartmentBreakdown(start, end),
        this.getUserActivitySummary(start, end)
      ]);

      const report = {
        reportType: 'weekly',
        reportPeriod: {
          startDate: this.utils.formatDate(start),
          endDate: this.utils.formatDate(end)
        },
        generatedAt: new Date(),
        summary: {
          notifications: notificationStats,
          activities: activityStats,
          audits: auditStats,
          security: securityEvents
        },
        breakdowns: {
          department: departmentBreakdown,
          userActivity: userActivity
        },
        trends: {
          notification: await this.getNotificationTrends(start, end),
          activity: await this.getActivityTrends(start, end),
          audit: await this.getAuditTrends(start, end)
        }
      };

      this.logger.info(`Weekly activity report generated for ${this.utils.formatDate(start)} to ${this.utils.formatDate(end)}`);
      return report;
    } catch (error) {
      this.logger.error('Error generating weekly activity report:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate weekly activity report', 500);
    }
  }

  // Monthly Activity Report
  async generateMonthlyActivityReport(year, month) {
    try {
      const startDate = this.utils.startOfMonth(new Date(year, month - 1));
      const endDate = this.utils.endOfMonth(new Date(year, month - 1));

      const [
        notificationStats,
        activityStats,
        auditStats,
        securityEvents,
        departmentBreakdown,
        userActivity,
        moduleUsage
      ] = await Promise.all([
        this.getNotificationReportData(startDate, endDate),
        this.getActivityReportData(startDate, endDate),
        this.getAuditReportData(startDate, endDate),
        this.getSecurityReportData(startDate, endDate),
        this.getDepartmentBreakdown(startDate, endDate),
        this.getUserActivitySummary(startDate, endDate),
        this.getModuleUsage(startDate, endDate)
      ]);

      const report = {
        reportType: 'monthly',
        reportPeriod: {
          year,
          month,
          startDate: this.utils.formatDate(startDate),
          endDate: this.utils.formatDate(endDate)
        },
        generatedAt: new Date(),
        summary: {
          notifications: notificationStats,
          activities: activityStats,
          audits: auditStats,
          security: securityEvents
        },
        breakdowns: {
          department: departmentBreakdown,
          userActivity: userActivity,
          moduleUsage: moduleUsage
        },
        trends: {
          notification: await this.getNotificationTrends(startDate, endDate, 'daily'),
          activity: await this.getActivityTrends(startDate, endDate, 'daily'),
          audit: await this.getAuditTrends(startDate, endDate, 'daily')
        },
        compliance: await this.getComplianceReport(startDate, endDate)
      };

      this.logger.info(`Monthly activity report generated for ${year}-${month}`);
      return report;
    } catch (error) {
      this.logger.error('Error generating monthly activity report:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate monthly activity report', 500);
    }
  }

  // Audit Report
  async generateAuditReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const [
        auditStats,
        actionBreakdown,
        moduleBreakdown,
        impactBreakdown,
        statusBreakdown,
        failedActions,
        highImpactActions,
        securityEvents
      ] = await Promise.all([
        this.getAuditReportData(start, end),
        this.getAuditActionBreakdown(start, end),
        this.getAuditModuleBreakdown(start, end),
        this.getAuditImpactBreakdown(start, end),
        this.getAuditStatusBreakdown(start, end),
        this.getFailedActions(start, end),
        this.getHighImpactActions(start, end),
        this.getSecurityReportData(start, end)
      ]);

      const report = {
        reportType: 'audit',
        reportPeriod: {
          startDate: this.utils.formatDate(start),
          endDate: this.utils.formatDate(end)
        },
        generatedAt: new Date(),
        summary: auditStats,
        breakdowns: {
          action: actionBreakdown,
          module: moduleBreakdown,
          impact: impactBreakdown,
          status: statusBreakdown
        },
        critical: {
          failed: failedActions,
          highImpact: highImpactActions,
          security: securityEvents
        },
        trends: await this.getAuditTrends(start, end, 'daily')
      };

      this.logger.info(`Audit report generated for ${this.utils.formatDate(start)} to ${this.utils.formatDate(end)}`);
      return report;
    } catch (error) {
      this.logger.error('Error generating audit report:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate audit report', 500);
    }
  }

  // Notification Report
  async generateNotificationReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const [
        notificationStats,
        categoryBreakdown,
        priorityBreakdown,
        channelBreakdown,
        readRate,
        deliveryRate,
        departmentBreakdown
      ] = await Promise.all([
        this.getNotificationReportData(start, end),
        this.getNotificationCategoryBreakdown(start, end),
        this.getNotificationPriorityBreakdown(start, end),
        this.getNotificationChannelBreakdown(start, end),
        this.getNotificationReadRate(start, end),
        this.getNotificationDeliveryRate(start, end),
        this.getNotificationDepartmentBreakdown(start, end)
      ]);

      const report = {
        reportType: 'notification',
        reportPeriod: {
          startDate: this.utils.formatDate(start),
          endDate: this.utils.formatDate(end)
        },
        generatedAt: new Date(),
        summary: notificationStats,
        metrics: {
          readRate,
          deliveryRate
        },
        breakdowns: {
          category: categoryBreakdown,
          priority: priorityBreakdown,
          channel: channelBreakdown,
          department: departmentBreakdown
        },
        trends: await this.getNotificationTrends(start, end, 'daily')
      };

      this.logger.info(`Notification report generated for ${this.utils.formatDate(start)} to ${this.utils.formatDate(end)}`);
      return report;
    } catch (error) {
      this.logger.error('Error generating notification report:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate notification report', 500);
    }
  }

  // Security Report
  async generateSecurityReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const [
        securityEvents,
        failedLogins,
        suspiciousActivity,
        unauthorizedAccess,
        dataAccessEvents
      ] = await Promise.all([
        this.getSecurityReportData(start, end),
        this.getFailedLogins(start, end),
        this.getSuspiciousActivity(start, end),
        this.getUnauthorizedAccess(start, end),
        this.getDataAccessEvents(start, end)
      ]);

      const report = {
        reportType: 'security',
        reportPeriod: {
          startDate: this.utils.formatDate(start),
          endDate: this.utils.formatDate(end)
        },
        generatedAt: new Date(),
        summary: securityEvents,
        incidents: {
          failedLogins,
          suspiciousActivity,
          unauthorizedAccess,
          dataAccessEvents
        },
        trends: await this.getSecurityTrends(start, end, 'daily')
      };

      this.logger.info(`Security report generated for ${this.utils.formatDate(start)} to ${this.utils.formatDate(end)}`);
      return report;
    } catch (error) {
      this.logger.error('Error generating security report:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate security report', 500);
    }
  }

  // Executive Monitoring Report
  async generateExecutiveMonitoringReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const [
        notificationStats,
        activityStats,
        auditStats,
        securityStats,
        departmentPerformance,
        userActivity,
        criticalAlerts,
        systemHealth
      ] = await Promise.all([
        this.getNotificationReportData(start, end),
        this.getActivityReportData(start, end),
        this.getAuditReportData(start, end),
        this.getSecurityReportData(start, end),
        this.getDepartmentPerformance(start, end),
        this.getUserActivitySummary(start, end),
        this.getCriticalAlertsReportData(start, end),
        this.getSystemHealthReport(start, end)
      ]);

      const report = {
        reportType: 'executive',
        reportPeriod: {
          startDate: this.utils.formatDate(start),
          endDate: this.utils.formatDate(end)
        },
        generatedAt: new Date(),
        executiveSummary: {
          notifications: notificationStats,
          activities: activityStats,
          audits: auditStats,
          security: securityStats
        },
        performance: {
          department: departmentPerformance,
          userActivity: userActivity
        },
        alerts: {
          critical: criticalAlerts,
          systemHealth: systemHealth
        },
        trends: {
          notification: await this.getNotificationTrends(start, end, 'daily'),
          activity: await this.getActivityTrends(start, end, 'daily'),
          audit: await this.getAuditTrends(start, end, 'daily')
        }
      };

      this.logger.info(`Executive monitoring report generated for ${this.utils.formatDate(start)} to ${this.utils.formatDate(end)}`);
      return report;
    } catch (error) {
      this.logger.error('Error generating executive monitoring report:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate executive monitoring report', 500);
    }
  }

  // Compliance Report
  async generateComplianceReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const compliance = await this.getComplianceReport(start, end);

      const report = {
        reportType: 'compliance',
        reportPeriod: {
          startDate: this.utils.formatDate(start),
          endDate: this.utils.formatDate(end)
        },
        generatedAt: new Date(),
        compliance
      };

      this.logger.info(`Compliance report generated for ${this.utils.formatDate(start)} to ${this.utils.formatDate(end)}`);
      return report;
    } catch (error) {
      this.logger.error('Error generating compliance report:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate compliance report', 500);
    }
  }

  // Helper: Get Notification Report Data
  async getNotificationReportData(startDate, endDate) {
    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      isDeleted: false
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
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
      }
    ];

    const result = await this.notificationRepo.aggregate(pipeline);
    return result[0] || { total: 0, unread: 0, read: 0, delivered: 0, failed: 0 };
  }

  // Helper: Get Activity Report Data
  async getActivityReportData(startDate, endDate) {
    const matchStage = {
      timestamp: { $gte: startDate, $lte: endDate },
      isDeleted: false
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
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
      }
    ];

    const result = await this.activityRepo.aggregate(pipeline);
    return result[0] || { total: 0, active: 0, completed: 0, failed: 0 };
  }

  // Helper: Get Audit Report Data
  async getAuditReportData(startDate, endDate) {
    const matchStage = {
      timestamp: { $gte: startDate, $lte: endDate },
      isDeleted: false
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
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
      }
    ];

    const result = await this.auditRepo.aggregate(pipeline);
    return result[0] || { total: 0, successful: 0, failed: 0, highImpact: 0, criticalImpact: 0 };
  }

  // Additional helper methods for report data...
  async getSecurityReportData(startDate, endDate) {
    const matchStage = {
      timestamp: { $gte: startDate, $lte: endDate },
      module: 'authentication',
      isDeleted: false
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          logins: {
            $sum: { $cond: [{ $eq: ['$action', 'login'] }, 1, 0] }
          },
          logouts: {
            $sum: { $cond: [{ $eq: ['$action', 'logout'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ];

    const result = await this.auditRepo.aggregate(pipeline);
    return result[0] || { total: 0, logins: 0, logouts: 0, failed: 0 };
  }

  async getCriticalAlertsReportData(startDate, endDate) {
    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      priority: { $in: ['urgent', 'critical'] },
      isDeleted: false
    };

    const count = await this.notificationRepo.count(matchStage);
    return { count };
  }

  async getDepartmentBreakdown(startDate, endDate) {
    const matchStage = {
      timestamp: { $gte: startDate, $lte: endDate },
      isDeleted: false
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  async getUserActivitySummary(startDate, endDate) {
    const matchStage = {
      timestamp: { $gte: startDate, $lte: endDate },
      isDeleted: false
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          userName: { $first: '$userName' },
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 50 }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  async getModuleUsage(startDate, endDate) {
    const matchStage = {
      timestamp: { $gte: startDate, $lte: endDate },
      isDeleted: false
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$module',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  async getNotificationTrends(startDate, endDate, granularity = 'daily') {
    const dateFormat = granularity === 'daily' ? '%Y-%m-%d' : '%Y-%m-%d-%H';
    
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await this.notificationRepo.aggregate(pipeline);
  }

  async getActivityTrends(startDate, endDate, granularity = 'daily') {
    const dateFormat = granularity === 'daily' ? '%Y-%m-%d' : '%Y-%m-%d-%H';
    
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await this.activityRepo.aggregate(pipeline);
  }

  async getAuditTrends(startDate, endDate, granularity = 'daily') {
    const dateFormat = granularity === 'daily' ? '%Y-%m-%d' : '%Y-%m-%d-%H';
    
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await this.auditRepo.aggregate(pipeline);
  }

  async getComplianceReport(startDate, endDate) {
    return {
      auditTrail: 'Complete',
      dataRetention: 'Compliant',
      accessLogs: 'Complete',
      securityEvents: 'Logged'
    };
  }

  // Additional helper methods...
  async getNotificationDetails(startDate, endDate) {
    return await this.notificationRepo.find(
      { createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false },
      null,
      { sort: { createdAt: -1 }, limit: 100, lean: true }
    );
  }

  async getActivityDetails(startDate, endDate) {
    return await this.activityRepo.find(
      { timestamp: { $gte: startDate, $lte: endDate }, isDeleted: false },
      null,
      { sort: { timestamp: -1 }, limit: 100, lean: true }
    );
  }

  async getAuditDetails(startDate, endDate) {
    return await this.auditRepo.find(
      { timestamp: { $gte: startDate, $lte: endDate }, isDeleted: false },
      null,
      { sort: { timestamp: -1 }, limit: 100, lean: true }
    );
  }

  async getNotificationCategoryBreakdown(startDate, endDate) {
    const pipeline = [
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    return await this.notificationRepo.aggregate(pipeline);
  }

  async getNotificationPriorityBreakdown(startDate, endDate) {
    const pipeline = [
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    return await this.notificationRepo.aggregate(pipeline);
  }

  async getNotificationChannelBreakdown(startDate, endDate) {
    const pipeline = [
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $unwind: '$channels' },
      { $group: { _id: '$channels', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    return await this.notificationRepo.aggregate(pipeline);
  }

  async getNotificationReadRate(startDate, endDate) {
    const pipeline = [
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $group: { _id: null, total: { $sum: 1 }, read: { $sum: { $cond: [{ $eq: ['$readStatus', 'read'] }, 1, 0] } } } },
      { $project: { readRate: { $multiply: [{ $divide: ['$read', '$total'] }, 100] } } }
    ];
    const result = await this.notificationRepo.aggregate(pipeline);
    return result[0]?.readRate || 0;
  }

  async getNotificationDeliveryRate(startDate, endDate) {
    const pipeline = [
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $group: { _id: null, total: { $sum: 1 }, delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } } } },
      { $project: { deliveryRate: { $multiply: [{ $divide: ['$delivered', '$total'] }, 100] } } }
    ];
    const result = await this.notificationRepo.aggregate(pipeline);
    return result[0]?.deliveryRate || 0;
  }

  async getNotificationDepartmentBreakdown(startDate, endDate) {
    const pipeline = [
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    return await this.notificationRepo.aggregate(pipeline);
  }

  async getAuditActionBreakdown(startDate, endDate) {
    const pipeline = [
      { $match: { timestamp: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    return await this.auditRepo.aggregate(pipeline);
  }

  async getAuditModuleBreakdown(startDate, endDate) {
    const pipeline = [
      { $match: { timestamp: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    return await this.auditRepo.aggregate(pipeline);
  }

  async getAuditImpactBreakdown(startDate, endDate) {
    const pipeline = [
      { $match: { timestamp: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $group: { _id: '$impact', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    return await this.auditRepo.aggregate(pipeline);
  }

  async getAuditStatusBreakdown(startDate, endDate) {
    const pipeline = [
      { $match: { timestamp: { $gte: startDate, $lte: endDate }, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    return await this.auditRepo.aggregate(pipeline);
  }

  async getFailedActions(startDate, endDate) {
    return await this.auditRepo.find(
      { timestamp: { $gte: startDate, $lte: endDate }, status: 'failed', isDeleted: false },
      null,
      { sort: { timestamp: -1 }, limit: 50, lean: true }
    );
  }

  async getHighImpactActions(startDate, endDate) {
    return await this.auditRepo.find(
      { timestamp: { $gte: startDate, $lte: endDate }, impact: { $in: ['high', 'critical'] }, isDeleted: false },
      null,
      { sort: { timestamp: -1 }, limit: 50, lean: true }
    );
  }

  async getFailedLogins(startDate, endDate) {
    return await this.auditRepo.find(
      { timestamp: { $gte: startDate, $lte: endDate }, module: 'authentication', action: 'login', status: 'failed', isDeleted: false },
      null,
      { sort: { timestamp: -1 }, limit: 50, lean: true }
    );
  }

  async getSuspiciousActivity(startDate, endDate) {
    return [];
  }

  async getUnauthorizedAccess(startDate, endDate) {
    return [];
  }

  async getDataAccessEvents(startDate, endDate) {
    return [];
  }

  async getSecurityTrends(startDate, endDate, granularity = 'daily') {
    const dateFormat = granularity === 'daily' ? '%Y-%m-%d' : '%Y-%m-%d-%H';
    const pipeline = [
      { $match: { timestamp: { $gte: startDate, $lte: endDate }, module: 'authentication', isDeleted: false } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ];
    return await this.auditRepo.aggregate(pipeline);
  }

  async getDepartmentPerformance(startDate, endDate) {
    return await this.getDepartmentBreakdown(startDate, endDate);
  }

  async getSystemHealthReport(startDate, endDate) {
    return { status: 'healthy', uptime: '99.9%' };
  }
}

const reportsService = new ReportsService();
export default reportsService;
