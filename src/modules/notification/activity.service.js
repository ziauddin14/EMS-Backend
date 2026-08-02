import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import activityRepository from './activity.repository.js';
import NotificationHelpers from './notification.helpers.js';
import NotificationUtils from './notification.utils.js';
import { ACTIVITY_TYPE, ACTIVITY_MODULE } from './notification.constants.js';

class ActivityService {
  constructor() {
    this.logger = Logger;
    this.repository = activityRepository;
    this.helpers = NotificationHelpers;
    this.utils = NotificationUtils;
  }

  // Create Activity Log
  async createActivityLog(activityLogData) {
    try {
      const activityLog = await this.repository.create(activityLogData);
      
      this.logger.info(`Activity log created: ${activityLog._id} - ${activityLog.module}:${activityLog.type}`);
      
      return this.helpers.formatActivityLog(activityLog);
    } catch (error) {
      this.logger.error('Error creating activity log:', error);
      throw error instanceof AppError ? error : new AppError('Activity log creation failed', 500);
    }
  }

  // Bulk Create Activity Logs
  async bulkCreateActivityLogs(activityLogsData) {
    try {
      const activityLogs = await this.repository.bulkCreate(activityLogsData);
      
      this.logger.info(`Bulk activity logs created: ${activityLogs.length}`);
      
      return this.helpers.formatActivityLogList(activityLogs);
    } catch (error) {
      this.logger.error('Error creating bulk activity logs:', error);
      throw error instanceof AppError ? error : new AppError('Bulk activity log creation failed', 500);
    }
  }

  // Get Activity Logs
  async getActivityLogs(filters = {}, pagination = {}) {
    try {
      const filter = {
        isDeleted: false,
        ...filters
      };
      
      const result = await this.repository.paginate(filter, pagination);
      
      result.data = this.helpers.formatActivityLogList(result.data);
      
      return result;
    } catch (error) {
      this.logger.error('Error getting activity logs:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity logs', 500);
    }
  }

  // Get Activity Log by ID
  async getActivityLogById(activityLogId) {
    try {
      const filter = {
        _id: activityLogId,
        isDeleted: false
      };
      
      const activityLog = await this.repository.findOne(filter);
      
      if (!activityLog) {
        throw new AppError('Activity log not found', 404);
      }
      
      return this.helpers.formatActivityLog(activityLog);
    } catch (error) {
      this.logger.error('Error getting activity log by ID:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity log', 500);
    }
  }

  // Get Activity Logs by User
  async getActivityLogsByUser(userId, limit = 100) {
    try {
      const activityLogs = await this.repository.getByUser(userId, limit);
      return this.helpers.formatActivityLogList(activityLogs);
    } catch (error) {
      this.logger.error('Error getting activity logs by user:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity logs by user', 500);
    }
  }

  // Get Activity Logs by Type
  async getActivityLogsByType(type, limit = 100) {
    try {
      const activityLogs = await this.repository.getByType(type, limit);
      return this.helpers.formatActivityLogList(activityLogs);
    } catch (error) {
      this.logger.error('Error getting activity logs by type:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity logs by type', 500);
    }
  }

  // Get Activity Logs by Module
  async getActivityLogsByModule(module, limit = 100) {
    try {
      const activityLogs = await this.repository.getByModule(module, limit);
      return this.helpers.formatActivityLogList(activityLogs);
    } catch (error) {
      this.logger.error('Error getting activity logs by module:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity logs by module', 500);
    }
  }

  // Get Activity Logs by Entity
  async getActivityLogsByEntity(entity, entityId, limit = 100) {
    try {
      const activityLogs = await this.repository.getByEntity(entity, entityId, limit);
      return this.helpers.formatActivityLogList(activityLogs);
    } catch (error) {
      this.logger.error('Error getting activity logs by entity:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity logs by entity', 500);
    }
  }

  // Get Activity Logs by Date Range
  async getActivityLogsByDateRange(startDate, endDate, limit = 100) {
    try {
      const activityLogs = await this.repository.getByDateRange(startDate, endDate, limit);
      return this.helpers.formatActivityLogList(activityLogs);
    } catch (error) {
      this.logger.error('Error getting activity logs by date range:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity logs by date range', 500);
    }
  }

  // Get Activity Logs by Session
  async getActivityLogsBySession(sessionId, limit = 100) {
    try {
      const activityLogs = await this.repository.getBySession(sessionId, limit);
      return this.helpers.formatActivityLogList(activityLogs);
    } catch (error) {
      this.logger.error('Error getting activity logs by session:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity logs by session', 500);
    }
  }

  // Get Activity Logs by Tag
  async getActivityLogsByTag(tag, limit = 100) {
    try {
      const activityLogs = await this.repository.getByTag(tag, limit);
      return this.helpers.formatActivityLogList(activityLogs);
    } catch (error) {
      this.logger.error('Error getting activity logs by tag:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity logs by tag', 500);
    }
  }

  // Get Login Activities
  async getLoginActivities(userId, limit = 50) {
    try {
      const activities = await this.repository.getLoginActivities(userId, limit);
      return this.helpers.formatActivityLogList(activities);
    } catch (error) {
      this.logger.error('Error getting login activities:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get login activities', 500);
    }
  }

  // Get Logout Activities
  async getLogoutActivities(userId, limit = 50) {
    try {
      const activities = await this.repository.getLogoutActivities(userId, limit);
      return this.helpers.formatActivityLogList(activities);
    } catch (error) {
      this.logger.error('Error getting logout activities:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get logout activities', 500);
    }
  }

  // Get Failed Activities
  async getFailedActivities(limit = 100) {
    try {
      const activities = await this.repository.getFailedActivities(limit);
      return this.helpers.formatActivityLogList(activities);
    } catch (error) {
      this.logger.error('Error getting failed activities:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get failed activities', 500);
    }
  }

  // Get Activity Statistics
  async getActivityStatistics(startDate, endDate) {
    try {
      const statistics = await this.repository.getActivityStatistics(startDate, endDate);
      return statistics;
    } catch (error) {
      this.logger.error('Error getting activity statistics:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity statistics', 500);
    }
  }

  // Get Type Breakdown
  async getTypeBreakdown(startDate, endDate) {
    try {
      const breakdown = await this.repository.getTypeBreakdown(startDate, endDate);
      return breakdown;
    } catch (error) {
      this.logger.error('Error getting type breakdown:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get type breakdown', 500);
    }
  }

  // Get Module Breakdown
  async getModuleBreakdown(startDate, endDate) {
    try {
      const breakdown = await this.repository.getModuleBreakdown(startDate, endDate);
      return breakdown;
    } catch (error) {
      this.logger.error('Error getting module breakdown:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get module breakdown', 500);
    }
  }

  // Get User Activity Timeline
  async getUserActivityTimeline(userId, startDate, endDate) {
    try {
      const activities = await this.repository.getUserActivityTimeline(userId, startDate, endDate);
      return this.helpers.formatActivityLogList(activities);
    } catch (error) {
      this.logger.error('Error getting user activity timeline:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get user activity timeline', 500);
    }
  }

  // Get Active Sessions
  async getActiveSessions() {
    try {
      const sessions = await this.repository.getActiveSessions();
      return this.helpers.formatActivityLogList(sessions);
    } catch (error) {
      this.logger.error('Error getting active sessions:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get active sessions', 500);
    }
  }

  // Get User Login History
  async getUserLoginHistory(userId, days = 30) {
    try {
      const history = await this.repository.getUserLoginHistory(userId, days);
      return this.helpers.formatActivityLogList(history);
    } catch (error) {
      this.logger.error('Error getting user login history:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get user login history', 500);
    }
  }

  // Get User Activity Summary
  async getUserActivitySummary(userId, startDate, endDate) {
    try {
      const summary = await this.repository.getUserActivitySummary(userId, startDate, endDate);
      return summary;
    } catch (error) {
      this.logger.error('Error getting user activity summary:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get user activity summary', 500);
    }
  }

  // Get Entity Activity History
  async getEntityActivityHistory(entity, entityId, limit = 50) {
    try {
      const history = await this.repository.getEntityActivityHistory(entity, entityId, limit);
      return this.helpers.formatActivityLogList(history);
    } catch (error) {
      this.logger.error('Error getting entity activity history:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get entity activity history', 500);
    }
  }

  // Get Recent Activity
  async getRecentActivity(limit = 50, module = null) {
    try {
      const activities = await this.repository.getRecentActivity(limit, module);
      return this.helpers.formatActivityLogList(activities);
    } catch (error) {
      this.logger.error('Error getting recent activity:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get recent activity', 500);
    }
  }

  // Get Time Series Data
  async getTimeSeriesData(startDate, endDate, granularity = 'daily', module = null, type = null) {
    try {
      const data = await this.repository.getTimeSeriesData(startDate, endDate, granularity, module, type);
      return data;
    } catch (error) {
      this.logger.error('Error getting time series data:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get time series data', 500);
    }
  }

  // Get Activity Heatmap
  async getActivityHeatmap(userId, startDate, endDate) {
    try {
      const heatmap = await this.repository.getActivityHeatmap(userId, startDate, endDate);
      return heatmap;
    } catch (error) {
      this.logger.error('Error getting activity heatmap:', error) ;
      throw error instanceof AppError ? error : new AppError('Failed to get activity heatmap', 500);
    }
  }

  // Get Activity Leaderboard
  async getActivityLeaderboard(startDate, endDate, limit = 10) {
    try {
      const leaderboard = await this.repository.getActivityLeaderboard(startDate, endDate, limit);
      return leaderboard;
    } catch (error) {
      this.logger.error('Error getting activity leaderboard:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get activity leaderboard', 500);
    }
  }

  // Cleanup Old Logs
  async cleanupOldLogs(retentionDays = 365) {
    try {
      const result = await this.repository.cleanupOldLogs(retentionDays);
      this.logger.info(`Cleaned up old activity logs: ${result.deletedCount}`);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error('Error cleaning up old logs:', error);
      throw error instanceof AppError ? error : new AppError('Failed to cleanup old logs', 500);
    }
  }

  // Helper: Create Activity Log from Request
  async createActivityLogFromRequest(req, type, module, title, description = null, entity = null, entityId = null, data = {}) {
    try {
      const activityLogData = {
        user: req.user?._id,
        userName: req.user?.name || 'System',
        userEmail: req.user?.email || 'system',
        userRole: req.user?.role,
        type,
        module,
        title,
        description,
        entity,
        entityId,
        data,
        ipAddress: this.utils.anonymizeIP(req.ip),
        userAgent: req.headers['user-agent'],
        device: this.utils.parseUserAgent(req.headers['user-agent']),
        sessionId: req.sessionID || null,
        status: 'active'
      };
      
      return await this.createActivityLog(activityLogData);
    } catch (error) {
      this.logger.error('Error creating activity log from request:', error);
      // Don't throw error to avoid breaking the main operation
      return null;
    }
  }

  // Helper: Log Login
  async logLogin(req, userId, userName, userEmail) {
    const activityLogData = {
      user: userId,
      userName,
      userEmail,
      type: ACTIVITY_TYPE.LOGIN,
      module: ACTIVITY_MODULE.AUTHENTICATION,
      title: 'User logged in',
      description: `${userName} logged into the system`,
      entity: 'user',
      entityId: userId,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      status: 'completed'
    };
    
    return await this.createActivityLog(activityLogData);
  }

  // Helper: Log Logout
  async logLogout(req, userId, userName, userEmail) {
    const activityLogData = {
      user: userId,
      userName,
      userEmail,
      type: ACTIVITY_TYPE.LOGOUT,
      module: ACTIVITY_MODULE.AUTHENTICATION,
      title: 'User logged out',
      description: `${userName} logged out of the system`,
      entity: 'user',
      entityId: userId,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      status: 'completed'
    };
    
    return await this.createActivityLog(activityLogData);
  }

  // Helper: Log Attendance Check In
  async logAttendanceCheckIn(req, userId, userName, attendanceId) {
    const activityLogData = {
      user: userId,
      userName,
      userEmail: req.user?.email,
      type: ACTIVITY_TYPE.ATTENDANCE_CHECK_IN,
      module: ACTIVITY_MODULE.ATTENDANCE,
      title: 'Attendance check-in',
      description: `${userName} checked in`,
      entity: 'attendance',
      entityId: attendanceId,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      status: 'completed'
    };
    
    return await this.createActivityLog(activityLogData);
  }

  // Helper: Log Attendance Check Out
  async logAttendanceCheckOut(req, userId, userName, attendanceId) {
    const activityLogData = {
      user: userId,
      userName,
      userEmail: req.user?.email,
      type: ACTIVITY_TYPE.ATTENDANCE_CHECK_OUT,
      module: ACTIVITY_MODULE.ATTENDANCE,
      title: 'Attendance check-out',
      description: `${userName} checked out`,
      entity: 'attendance',
      entityId: attendanceId,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      status: 'completed'
    };
    
    return await this.createActivityLog(activityLogData);
  }

  // Helper: Log Task Created
  async logTaskCreated(req, userId, userName, taskId, taskTitle) {
    const activityLogData = {
      user: userId,
      userName,
      userEmail: req.user?.email,
      type: ACTIVITY_TYPE.TASK_CREATED,
      module: ACTIVITY_MODULE.EMPLOYEE,
      title: 'Task created',
      description: `Task "${taskTitle}" was created by ${userName}`,
      entity: 'task',
      entityId: taskId,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      status: 'completed'
    };
    
    return await this.createActivityLog(activityLogData);
  }

  // Helper: Log Task Completed
  async logTaskCompleted(req, userId, userName, taskId, taskTitle) {
    const activityLogData = {
      user: userId,
      userName,
      userEmail: req.user?.email,
      type: ACTIVITY_TYPE.TASK_COMPLETED,
      module: ACTIVITY_MODULE.EMPLOYEE,
      title: 'Task completed',
      description: `Task "${taskTitle}" was completed by ${userName}`,
      entity: 'task',
      entityId: taskId,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      status: 'completed'
    };
    
    return await this.createActivityLog(activityLogData);
  }

  // Helper: Log Profile Update
  async logProfileUpdate(req, userId, userName) {
    const activityLogData = {
      user: userId,
      userName,
      userEmail: req.user?.email,
      type: ACTIVITY_TYPE.PROFILE_UPDATED,
      module: ACTIVITY_MODULE.PROFILE,
      title: 'Profile updated',
      description: `${userName} updated their profile`,
      entity: 'user',
      entityId: userId,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      status: 'completed'
    };
    
    return await this.createActivityLog(activityLogData);
  }

  // Helper: Log Settings Change
  async logSettingsChange(req, userId, userName, setting) {
    const activityLogData = {
      user: userId,
      userName,
      userEmail: req.user?.email,
      type: ACTIVITY_TYPE.SETTINGS_CHANGED,
      module: ACTIVITY_MODULE.SETTINGS,
      title: 'Settings changed',
      description: `${userName} changed ${setting} setting`,
      entity: 'setting',
      entityId: null,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      status: 'completed'
    };
    
    return await this.createActivityLog(activityLogData);
  }

  // Export Activity Logs
  async exportActivityLogs(filters = {}, format = 'json') {
    try {
      const activityLogs = await this.repository.find(filters, null, { lean: true });
      
      if (format === 'csv') {
        const csv = this.utils.toCSV(activityLogs);
        return csv;
      } else if (format === 'json') {
        const json = this.utils.toJSON(activityLogs);
        return json;
      } else {
        throw new AppError('Unsupported export format', 400);
      }
    } catch (error) {
      this.logger.error('Error exporting activity logs:', error);
      throw error instanceof AppError ? error : new AppError('Failed to export activity logs', 500);
    }
  }
}

const activityService = new ActivityService();
export default activityService;
