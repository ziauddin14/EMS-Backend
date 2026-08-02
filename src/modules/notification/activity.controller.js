import AsyncHandler from '../../core/middleware/asyncHandler.js';
import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import activityService from './activity.service.js';
import { notificationValidationSchemas } from './notification.validation.js';

class ActivityController {
  // Create Activity Log
  createActivityLog = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.activityLogSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const activityLog = await activityService.createActivityLog(value);
    
    return ApiResponse.success(res, activityLog, 'Activity log created successfully', 201);
  });

  // Bulk Create Activity Logs
  bulkCreateActivityLogs = AsyncHandler(async (req, res) => {
    const activityLogsData = req.body.activityLogs;
    
    if (!Array.isArray(activityLogsData) || activityLogsData.length === 0) {
      throw new AppError('Activity logs array is required', 400);
    }
    
    const activityLogs = await activityService.bulkCreateActivityLogs(activityLogsData);
    
    return ApiResponse.success(res, activityLogs, 'Bulk activity logs created successfully', 201);
  });

  // Get Activity Logs
  getActivityLogs = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.activityLogQuerySchema.safeParse(req.query);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const filters = {
      user: value.user,
      type: value.type,
      module: value.module,
      entity: value.entity,
      entityId: value.entityId,
      sessionId: value.sessionId,
      ipAddress: value.ipAddress,
      tag: value.tag,
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
    
    const result = await activityService.getActivityLogs(filters, pagination);
    
    return ApiResponse.success(res, result, 'Activity logs retrieved successfully');
  });

  // Get Activity Log by ID
  getActivityLogById = AsyncHandler(async (req, res) => {
    const { activityLogId } = req.params;
    
    const activityLog = await activityService.getActivityLogById(activityLogId);
    
    return ApiResponse.success(res, activityLog, 'Activity log retrieved successfully');
  });

  // Get Activity Logs by User
  getActivityLogsByUser = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const activityLogs = await activityService.getActivityLogsByUser(userId, limit);
    
    return ApiResponse.success(res, activityLogs, 'Activity logs retrieved successfully');
  });

  // Get Activity Logs by Type
  getActivityLogsByType = AsyncHandler(async (req, res) => {
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const activityLogs = await activityService.getActivityLogsByType(type, limit);
    
    return ApiResponse.success(res, activityLogs, 'Activity logs retrieved successfully');
  });

  // Get Activity Logs by Module
  getActivityLogsByModule = AsyncHandler(async (req, res) => {
    const { module } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const activityLogs = await activityService.getActivityLogsByModule(module, limit);
    
    return ApiResponse.success(res, activityLogs, 'Activity logs retrieved successfully');
  });

  // Get Activity Logs by Entity
  getActivityLogsByEntity = AsyncHandler(async (req, res) => {
    const { entity, entityId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const activityLogs = await activityService.getActivityLogsByEntity(entity, entityId, limit);
    
    return ApiResponse.success(res, activityLogs, 'Activity logs retrieved successfully');
  });

  // Get Activity Logs by Date Range
  getActivityLogsByDateRange = AsyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const limit = parseInt(req.query.limit) || 100;
    
    const activityLogs = await activityService.getActivityLogsByDateRange(startDate, endDate, limit);
    
    return ApiResponse.success(res, activityLogs, 'Activity logs retrieved successfully');
  });

  // Get Activity Logs by Session
  getActivityLogsBySession = AsyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const activityLogs = await activityService.getActivityLogsBySession(sessionId, limit);
    
    return ApiResponse.success(res, activityLogs, 'Activity logs retrieved successfully');
  });

  // Get Activity Logs by Tag
  getActivityLogsByTag = AsyncHandler(async (req, res) => {
    const { tag } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const activityLogs = await activityService.getActivityLogsByTag(tag, limit);
    
    return ApiResponse.success(res, activityLogs, 'Activity logs retrieved successfully');
  });

  // Get Login Activities
  getLoginActivities = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const activities = await activityService.getLoginActivities(userId, limit);
    
    return ApiResponse.success(res, activities, 'Login activities retrieved successfully');
  });

  // Get Logout Activities
  getLogoutActivities = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const activities = await activityService.getLogoutActivities(userId, limit);
    
    return ApiResponse.success(res, activities, 'Logout activities retrieved successfully');
  });

  // Get Failed Activities
  getFailedActivities = AsyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    
    const activities = await activityService.getFailedActivities(limit);
    
    return ApiResponse.success(res, activities, 'Failed activities retrieved successfully');
  });

  // Get Activity Statistics
  getActivityStatistics = AsyncHandler(async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const statistics = await activityService.getActivityStatistics(startDate, endDate);
    
    return ApiResponse.success(res, statistics, 'Activity statistics retrieved successfully');
  });

  // Get Type Breakdown
  getTypeBreakdown = AsyncHandler(async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const breakdown = await activityService.getTypeBreakdown(startDate, endDate);
    
    return ApiResponse.success(res, breakdown, 'Type breakdown retrieved successfully');
  });

  // Get Module Breakdown
  getModuleBreakdown = AsyncHandler(async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const breakdown = await activityService.getModuleBreakdown(startDate, endDate);
    
    return ApiResponse.success(res, breakdown, 'Module breakdown retrieved successfully');
  });

  // Get User Activity Timeline
  getUserActivityTimeline = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const activities = await activityService.getUserActivityTimeline(userId, startDate, endDate);
    
    return ApiResponse.success(res, activities, 'User activity timeline retrieved successfully');
  });

  // Get Active Sessions
  getActiveSessions = AsyncHandler(async (req, res) => {
    const sessions = await activityService.getActiveSessions();
    
    return ApiResponse.success(res, sessions, 'Active sessions retrieved successfully');
  });

  // Get User Login History
  getUserLoginHistory = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    const history = await activityService.getUserLoginHistory(userId, days);
    
    return ApiResponse.success(res, history, 'User login history retrieved successfully');
  });

  // Get User Activity Summary
  getUserActivitySummary = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const summary = await activityService.getUserActivitySummary(userId, startDate, endDate);
    
    return ApiResponse.success(res, summary, 'User activity summary retrieved successfully');
  });

  // Get Entity Activity History
  getEntityActivityHistory = AsyncHandler(async (req, res) => {
    const { entity, entityId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const history = await activityService.getEntityActivityHistory(entity, entityId, limit);
    
    return ApiResponse.success(res, history, 'Entity activity history retrieved successfully');
  });

  // Get Recent Activity
  getRecentActivity = AsyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const module = req.query.module;
    
    const activities = await activityService.getRecentActivity(limit, module);
    
    return ApiResponse.success(res, activities, 'Recent activity retrieved successfully');
  });

  // Get Time Series Data
  getTimeSeriesData = AsyncHandler(async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const granularity = req.query.granularity || 'daily';
    const module = req.query.module;
    const type = req.query.type;
    
    const data = await activityService.getTimeSeriesData(startDate, endDate, granularity, module, type);
    
    return ApiResponse.success(res, data, 'Time series data retrieved successfully');
  });

  // Get Activity Heatmap
  getActivityHeatmap = AsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const heatmap = await activityService.getActivityHeatmap(userId, startDate, endDate);
    
    return ApiResponse.success(res, heatmap, 'Activity heatmap retrieved successfully');
  });

  // Get Activity Leaderboard
  getActivityLeaderboard = AsyncHandler(async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const limit = parseInt(req.query.limit) || 10;
    
    const leaderboard = await activityService.getActivityLeaderboard(startDate, endDate, limit);
    
    return ApiResponse.success(res, leaderboard, 'Activity leaderboard retrieved successfully');
  });

  // Cleanup Old Logs (Admin only)
  cleanupOldLogs = AsyncHandler(async (req, res) => {
    const retentionDays = parseInt(req.query.retentionDays) || 365;
    
    const result = await activityService.cleanupOldLogs(retentionDays);
    
    return ApiResponse.success(res, result, 'Old activity logs cleaned up');
  });

  // Export Activity Logs
  exportActivityLogs = AsyncHandler(async (req, res) => {
    const format = req.query.format || 'json';
    const filters = {
      user: req.query.user,
      type: req.query.type,
      module: req.query.module,
      entity: req.query.entity,
      entityId: req.query.entityId
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filters.timestamp = {};
      if (req.query.startDate) filters.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.timestamp.$lte = new Date(req.query.endDate);
    }
    
    const data = await activityService.exportActivityLogs(filters, format);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
      return res.send(data);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.json');
      return res.send(data);
    }
  });
}

const activityController = new ActivityController();
export default activityController;
