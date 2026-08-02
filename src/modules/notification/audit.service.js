import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import auditRepository from './audit.repository.js';
import NotificationHelpers from './notification.helpers.js';
import NotificationUtils from './notification.utils.js';
import { AUDIT_ACTION } from './notification.constants.js';

class AuditService {
  constructor() {
    this.logger = Logger;
    this.repository = auditRepository;
    this.helpers = NotificationHelpers;
    this.utils = NotificationUtils;
  }

  // Create Audit Log
  async createAuditLog(auditLogData) {
    try {
      const auditLog = await this.repository.create(auditLogData);
      
      this.logger.info(`Audit log created: ${auditLog._id} - ${auditLog.module}:${auditLog.action}`);
      
      return this.helpers.formatAuditLog(auditLog);
    } catch (error) {
      this.logger.error('Error creating audit log:', error);
      throw error instanceof AppError ? error : new AppError('Audit log creation failed', 500);
    }
  }

  // Bulk Create Audit Logs
  async bulkCreateAuditLogs(auditLogsData) {
    try {
      const auditLogs = await this.repository.bulkCreate(auditLogsData);
      
      this.logger.info(`Bulk audit logs created: ${auditLogs.length}`);
      
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error creating bulk audit logs:', error);
      throw error instanceof AppError ? error : new AppError('Bulk audit log creation failed', 500);
    }
  }

  // Get Audit Logs
  async getAuditLogs(filters = {}, pagination = {}) {
    try {
      const filter = {
        isDeleted: false,
        ...filters
      };
      
      const result = await this.repository.paginate(filter, pagination);
      
      result.data = this.helpers.formatAuditLogList(result.data);
      
      return result;
    } catch (error) {
      this.logger.error('Error getting audit logs:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit logs', 500);
    }
  }

  // Get Audit Log by ID
  async getAuditLogById(auditLogId) {
    try {
      const filter = {
        _id: auditLogId,
        isDeleted: false
      };
      
      const auditLog = await this.repository.findOne(filter);
      
      if (!auditLog) {
        throw new AppError('Audit log not found', 404);
      }
      
      return this.helpers.formatAuditLog(auditLog);
    } catch (error) {
      this.logger.error('Error getting audit log by ID:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit log', 500);
    }
  }

  // Get Audit Logs by Entity
  async getAuditLogsByEntity(entity, entityId, limit = 100) {
    try {
      const auditLogs = await this.repository.getByEntity(entity, entityId, limit);
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error getting audit logs by entity:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit logs by entity', 500);
    }
  }

  // Get Audit Logs by Module
  async getAuditLogsByModule(module, limit = 100) {
    try {
      const auditLogs = await this.repository.getByModule(module, limit);
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error getting audit logs by module:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit logs by module', 500);
    }
  }

  // Get Audit Logs by User
  async getAuditLogsByUser(userId, limit = 100) {
    try {
      const auditLogs = await this.repository.getByUser(userId, limit);
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error getting audit logs by user:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit logs by user', 500);
    }
  }

  // Get Audit Logs by Action
  async getAuditLogsByAction(action, limit = 100) {
    try {
      const auditLogs = await this.repository.getByAction(action, limit);
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error getting audit logs by action:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit logs by action', 500);
    }
  }

  // Get Audit Logs by Date Range
  async getAuditLogsByDateRange(startDate, endDate, limit = 100) {
    try {
      const auditLogs = await this.repository.getByDateRange(startDate, endDate, limit);
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error getting audit logs by date range:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit logs by date range', 500);
    }
  }

  // Get Audit Logs by Session
  async getAuditLogsBySession(sessionId, limit = 100) {
    try {
      const auditLogs = await this.repository.getBySession(sessionId, limit);
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error getting audit logs by session:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit logs by session', 500);
    }
  }

  // Get Audit Logs by IP Address
  async getAuditLogsByIpAddress(ipAddress, limit = 100) {
    try {
      const auditLogs = await this.repository.getByIpAddress(ipAddress, limit);
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error getting audit logs by IP address:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit logs by IP address', 500);
    }
  }

  // Get Failed Actions
  async getFailedActions(limit = 100) {
    try {
      const auditLogs = await this.repository.getFailedActions(limit);
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error getting failed actions:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get failed actions', 500);
    }
  }

  // Get High Impact Actions
  async getHighImpactActions(limit = 100) {
    try {
      const auditLogs = await this.repository.getHighImpactActions(limit);
      return this.helpers.formatAuditLogList(auditLogs);
    } catch (error) {
      this.logger.error('Error getting high impact actions:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get high impact actions', 500);
    }
  }

  // Get Audit Statistics
  async getAuditStatistics(startDate, endDate) {
    try {
      const statistics = await this.repository.getAuditStatistics(startDate, endDate);
      return statistics;
    } catch (error) {
      this.logger.error('Error getting audit statistics:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get audit statistics', 500);
    }
  }

  // Get Action Breakdown
  async getActionBreakdown(startDate, endDate) {
    try {
      const breakdown = await this.repository.getActionBreakdown(startDate, endDate);
      return breakdown;
    } catch (error) {
      this.logger.error('Error getting action breakdown:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get action breakdown', 500);
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

  // Get User Activity
  async getUserActivity(userId, startDate, endDate) {
    try {
      const activities = await this.repository.getUserActivity(userId, startDate, endDate);
      return this.helpers.formatAuditLogList(activities);
    } catch (error) {
      this.logger.error('Error getting user activity:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get user activity', 500);
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

  // Get Entity History
  async getEntityHistory(entity, entityId, limit = 50) {
    try {
      const history = await this.repository.getEntityHistory(entity, entityId, limit);
      return this.helpers.formatAuditLogList(history);
    } catch (error) {
      this.logger.error('Error getting entity history:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get entity history', 500);
    }
  }

  // Get Recent Activity
  async getRecentActivity(limit = 50, module = null) {
    try {
      const activities = await this.repository.getRecentActivity(limit, module);
      return this.helpers.formatAuditLogList(activities);
    } catch (error) {
      this.logger.error('Error getting recent activity:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get recent activity', 500);
    }
  }

  // Get Time Series Data
  async getTimeSeriesData(startDate, endDate, granularity = 'daily', module = null, action = null) {
    try {
      const data = await this.repository.getTimeSeriesData(startDate, endDate, granularity, module, action);
      return data;
    } catch (error) {
      this.logger.error('Error getting time series data:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get time series data', 500);
    }
  }

  // Cleanup Old Logs
  async cleanupOldLogs(retentionDays = 730) {
    try {
      const result = await this.repository.cleanupOldLogs(retentionDays);
      this.logger.info(`Cleaned up old audit logs: ${result.deletedCount}`);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error('Error cleaning up old logs:', error);
      throw error instanceof AppError ? error : new AppError('Failed to cleanup old logs', 500);
    }
  }

  // Helper: Create Audit Log from Request
  async createAuditLogFromRequest(req, module, action, entity, entityId, oldData = null, newData = null, impact = 'low') {
    try {
      const auditLogData = {
        module,
        action,
        entity,
        entityId,
        oldData,
        newData,
        performedBy: req.user?._id,
        performedByName: req.user?.name || 'System',
        performedByEmail: req.user?.email || 'system',
        performedByRole: req.user?.role,
        ipAddress: this.utils.anonymizeIP(req.ip),
        userAgent: req.headers['user-agent'],
        device: this.utils.parseUserAgent(req.headers['user-agent']),
        sessionId: req.sessionID || null,
        impact,
        status: 'success'
      };
      
      return await this.createAuditLog(auditLogData);
    } catch (error) {
      this.logger.error('Error creating audit log from request:', error);
      // Don't throw error to avoid breaking the main operation
      return null;
    }
  }

  // Helper: Log Create Action
  async logCreate(req, module, entity, entityId, data) {
    return await this.createAuditLogFromRequest(
      req,
      module,
      AUDIT_ACTION.CREATE,
      entity,
      entityId,
      null,
      data,
      'low'
    );
  }

  // Helper: Log Update Action
  async logUpdate(req, module, entity, entityId, oldData, newData) {
    return await this.createAuditLogFromRequest(
      req,
      module,
      AUDIT_ACTION.UPDATE,
      entity,
      entityId,
      oldData,
      newData,
      'medium'
    );
  }

  // Helper: Log Delete Action
  async logDelete(req, module, entity, entityId, oldData) {
    return await this.createAuditLogFromRequest(
      req,
      module,
      AUDIT_ACTION.DELETE,
      entity,
      entityId,
      oldData,
      null,
      'high'
    );
  }

  // Helper: Log Login Action
  async logLogin(req, userId, userName, userEmail) {
    const auditLogData = {
      module: 'authentication',
      action: AUDIT_ACTION.LOGIN,
      entity: 'user',
      entityId: userId,
      performedBy: userId,
      performedByName: userName,
      performedByEmail: userEmail,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      impact: 'medium',
      status: 'success'
    };
    
    return await this.createAuditLog(auditLogData);
  }

  // Helper: Log Logout Action
  async logLogout(req, userId, userName, userEmail) {
    const auditLogData = {
      module: 'authentication',
      action: AUDIT_ACTION.LOGOUT,
      entity: 'user',
      entityId: userId,
      performedBy: userId,
      performedByName: userName,
      performedByEmail: userEmail,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      impact: 'low',
      status: 'success'
    };
    
    return await this.createAuditLog(auditLogData);
  }

  // Helper: Log Export Action
  async logExport(req, module, entity, entityId = null) {
    return await this.createAuditLogFromRequest(
      req,
      module,
      AUDIT_ACTION.EXPORT,
      entity,
      entityId,
      null,
      null,
      'medium'
    );
  }

  // Helper: Log Import Action
  async logImport(req, module, entity, data) {
    return await this.createAuditLogFromRequest(
      req,
      module,
      AUDIT_ACTION.IMPORT,
      entity,
      null,
      null,
      data,
      'high'
    );
  }

  // Helper: Log Bulk Create Action
  async logBulkCreate(req, module, entity, count, data) {
    const auditLogData = {
      module,
      action: AUDIT_ACTION.BULK_CREATE,
      entity,
      entityId: null,
      oldData: null,
      newData: { count, data },
      performedBy: req.user?._id,
      performedByName: req.user?.name || 'System',
      performedByEmail: req.user?.email || 'system',
      performedByRole: req.user?.role,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      impact: 'medium',
      status: 'success'
    };
    
    return await this.createAuditLog(auditLogData);
  }

  // Helper: Log Bulk Update Action
  async logBulkUpdate(req, module, entity, filter, updateData) {
    const auditLogData = {
      module,
      action: AUDIT_ACTION.BULK_UPDATE,
      entity,
      entityId: null,
      oldData: { filter },
      newData: { updateData },
      performedBy: req.user?._id,
      performedByName: req.user?.name || 'System',
      performedByEmail: req.user?.email || 'system',
      performedByRole: req.user?.role,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      impact: 'high',
      status: 'success'
    };
    
    return await this.createAuditLog(auditLogData);
  }

  // Helper: Log Bulk Delete Action
  async logBulkDelete(req, module, entity, filter) {
    const auditLogData = {
      module,
      action: AUDIT_ACTION.BULK_DELETE,
      entity,
      entityId: null,
      oldData: { filter },
      newData: null,
      performedBy: req.user?._id,
      performedByName: req.user?.name || 'System',
      performedByEmail: req.user?.email || 'system',
      performedByRole: req.user?.role,
      ipAddress: this.utils.anonymizeIP(req.ip),
      userAgent: req.headers['user-agent'],
      device: this.utils.parseUserAgent(req.headers['user-agent']),
      sessionId: req.sessionID || null,
      impact: 'critical',
      status: 'success'
    };
    
    return await this.createAuditLog(auditLogData);
  }

  // Export Audit Logs
  async exportAuditLogs(filters = {}, format = 'json') {
    try {
      const auditLogs = await this.repository.find(filters, null, { lean: true });
      
      if (format === 'csv') {
        const csv = this.utils.toCSV(auditLogs);
        return csv;
      } else if (format === 'json') {
        const json = this.utils.toJSON(auditLogs);
        return json;
      } else {
        throw new AppError('Unsupported export format', 400);
      }
    } catch (error) {
      this.logger.error('Error exporting audit logs:', error);
      throw error instanceof AppError ? error : new AppError('Failed to export audit logs', 500);
    }
  }
}

const auditService = new AuditService();
export default auditService;
