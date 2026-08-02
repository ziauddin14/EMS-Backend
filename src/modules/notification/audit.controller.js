import AsyncHandler from '../../core/middleware/asyncHandler.js';
import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import auditService from './audit.service.js';
import { notificationValidationSchemas } from './notification.validation.js';

class AuditController {
  // Create Audit Log
  createAuditLog = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.auditLogSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const auditLog = await auditService.createAuditLog(value);
    
    return ApiResponse.success(res, auditLog, 'Audit log created successfully', 201);
  });

  // Bulk Create Audit Logs
  bulkCreateAuditLogs = AsyncHandler(async (req, res) => {
    const auditLogsData = req.body.auditLogs;
    
    if (!Array.isArray(auditLogsData) || auditLogsData.length === 0) {
      throw new AppError('Audit logs array is required', 400);
    }
    
    const auditLogs = await auditService.bulkCreateAuditLogs(auditLogsData);
    
    return ApiResponse.success(res, auditLogs, 'Bulk audit logs created successfully', 201);
  });

  // Get Audit Logs
  getAuditLogs = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.auditLogQuerySchema.safeParse(req.query);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const filters = {
      module: value.module,
      action: value.action,
      entity: value.entity,
      entityId: value.entityId,
      performedBy: value.performedBy,
      sessionId: value.sessionId,
      ipAddress: value.ipAddress,
      impact: value.impact,
      status: value.status
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    // Date range filter
    if (value.startDate || value.endDate) {
      filters.timestamp = {};
      if (value.startDate) filters.timestamp.$gte = new Date(value.startDate);
      if (value.endDate) filters.timestamp.$lte = new Date(value.endDate);
    }
    
    const pagination = {
      page: value.page || 1,
      limit: value.limit || 10,
      sort: { timestamp: -1 }
    };
    
    const result = await auditService.getAuditLogs(filters, pagination);
    
    return ApiResponse.success(res, result, 'Audit logs retrieved successfully');
  });

  // Get Audit Log by ID
  getAuditLogById = AsyncHandler(async (req, res) => {
    const { auditLogId } = req.params;
    
    const auditLog = await auditService.getAuditLogById(auditLogId);
    
    return ApiResponse.success(res, auditLog, 'Audit log retrieved successfully');
  });

  // Get Audit Logs by Entity
  getAuditLogsByEntity = AsyncHandler(async (req, res) => {
    const { entity, entityId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const auditLogs = await auditService.getAuditLogsByEntity(entity, entityId, limit);
    
    return ApiResponse.success(res, auditLogs, 'Audit logs retrieved successfully');
  });

  // Get Audit Logs by Module
  getAuditLogsByModule = AsyncHandler(async (req, res) => {
    const { module } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const auditLogs = await auditService.getAuditLogsByModule(module, limit);
    
    return ApiResponse.success(res, auditLogs, 'Audit logs retrieved successfully');
  });

  // Get Audit Logs by User
  getAuditLogsByUser = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const auditLogs = await auditService.getAuditLogsByUser(userId, limit);
    
    return ApiResponse.success(res, auditLogs, 'Audit logs retrieved successfully');
  });

  // Get Audit Logs by Action
  getAuditLogsByAction = AsyncHandler(async (req, res) => {
    const { action } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const auditLogs = await auditService.getAuditLogsByAction(action, limit);
    
    return ApiResponse.success(res, auditLogs, 'Audit logs retrieved successfully');
  });

  // Get Audit Logs by Date Range
  getAuditLogsByDateRange = AsyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const limit = parseInt(req.query.limit) || 100;
    
    const auditLogs = await auditService.getAuditLogsByDateRange(startDate, endDate, limit);
    
    return ApiResponse.success(res, auditLogs, 'Audit logs retrieved successfully');
  });

  // Get Audit Logs by Session
  getAuditLogsBySession = AsyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const auditLogs = await auditService.getAuditLogsBySession(sessionId, limit);
    
    return ApiResponse.success(res, auditLogs, 'Audit logs retrieved successfully');
  });

  // Get Audit Logs by IP Address
  getAuditLogsByIpAddress = AsyncHandler(async (req, res) => {
    const { ipAddress } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const auditLogs = await auditService.getAuditLogsByIpAddress(ipAddress, limit);
    
    return ApiResponse.success(res, auditLogs, 'Audit logs retrieved successfully');
  });

  // Get Failed Actions
  getFailedActions = AsyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    
    const auditLogs = await auditService.getFailedActions(limit);
    
    return ApiResponse.success(res, auditLogs, 'Failed actions retrieved successfully');
  });

  // Get High Impact Actions
  getHighImpactActions = AsyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    
    const auditLogs = await auditService.getHighImpactActions(limit);
    
    return ApiResponse.success(res, auditLogs, 'High impact actions retrieved successfully');
  });

  // Get Audit Statistics
  getAuditStatistics = AsyncHandler(async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const statistics = await auditService.getAuditStatistics(startDate, endDate);
    
    return ApiResponse.success(res, statistics, 'Audit statistics retrieved successfully');
  });

  // Get Action Breakdown
  getActionBreakdown = AsyncHandler(async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const breakdown = await auditService.getActionBreakdown(startDate, endDate);
    
    return ApiResponse.success(res, breakdown, 'Action breakdown retrieved successfully');
  });

  // Get Module Breakdown
  getModuleBreakdown = AsyncHandler(async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const breakdown = await auditService.getModuleBreakdown(startDate, endDate);
    
    return ApiResponse.success(res, breakdown, 'Module breakdown retrieved successfully');
  });

  // Get User Activity
  getUserActivity = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const activities = await auditService.getUserActivity(userId, startDate, endDate);
    
    return ApiResponse.success(res, activities, 'User activity retrieved successfully');
  });

  // Get User Activity Summary
  getUserActivitySummary = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const summary = await auditService.getUserActivitySummary(userId, startDate, endDate);
    
    return ApiResponse.success(res, summary, 'User activity summary retrieved successfully');
  });

  // Get Entity History
  getEntityHistory = AsyncHandler(async (req, res) => {
    const { entity, entityId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const history = await auditService.getEntityHistory(entity, entityId, limit);
    
    return ApiResponse.success(res, history, 'Entity history retrieved successfully');
  });

  // Get Recent Activity
  getRecentActivity = AsyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const module = req.query.module;
    
    const activities = await auditService.getRecentActivity(limit, module);
    
    return ApiResponse.success(res, activities, 'Recent activity retrieved successfully');
  });

  // Get Time Series Data
  getTimeSeriesData = AsyncHandler(async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const granularity = req.query.granularity || 'daily';
    const module = req.query.module;
    const action = req.query.action;
    
    const data = await auditService.getTimeSeriesData(startDate, endDate, granularity, module, action);
    
    return ApiResponse.success(res, data, 'Time series data retrieved successfully');
  });

  // Cleanup Old Logs (Admin only)
  cleanupOldLogs = AsyncHandler(async (req, res) => {
    const retentionDays = parseInt(req.query.retentionDays) || 730;
    
    const result = await auditService.cleanupOldLogs(retentionDays);
    
    return ApiResponse.success(res, result, 'Old audit logs cleaned up');
  });

  // Export Audit Logs
  exportAuditLogs = AsyncHandler(async (req, res) => {
    const format = req.query.format || 'json';
    const filters = {
      module: req.query.module,
      action: req.query.action,
      entity: req.query.entity,
      entityId: req.query.entityId,
      performedBy: req.query.performedBy
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filters.timestamp = {};
      if (req.query.startDate) filters.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.timestamp.$lte = new Date(req.query.endDate);
    }
    
    const data = await auditService.exportAuditLogs(filters, format);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      return res.send(data);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json');
      return res.send(data);
    }
  });
}

const auditController = new AuditController();
export default auditController;
