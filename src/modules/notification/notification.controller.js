import AsyncHandler from '../../core/middleware/asyncHandler.js';
import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import notificationService from './notification.service.js';
import { notificationValidationSchemas } from './notification.validation.js';

class NotificationController {
  // Create Notification
  createNotification = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.notificationSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const notification = await notificationService.createNotification(value, req.user._id);
    
    return ApiResponse.success(res, notification, 'Notification created successfully', 201);
  });

  // Bulk Create Notifications
  bulkCreateNotifications = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.bulkNotificationSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const notifications = await notificationService.bulkCreateNotifications(value.notifications, req.user._id);
    
    return ApiResponse.success(res, notifications, 'Bulk notifications created successfully', 201);
  });

  // Get Notifications
  getNotifications = AsyncHandler(async (req, res) => {
    const recipientId = req.user._id;
    const filters = {
      type: req.query.type,
      priority: req.query.priority,
      category: req.query.category,
      readStatus: req.query.readStatus,
      status: req.query.status,
      module: req.query.module,
      referenceId: req.query.referenceId,
      referenceType: req.query.referenceType,
      department: req.query.department,
      branch: req.query.branch
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filters.createdAt = {};
      if (req.query.startDate) filters.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.createdAt.$lte = new Date(req.query.endDate);
    }
    
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: req.query.sort ? { [req.query.sort]: -1 } : { createdAt: -1 }
    };
    
    const result = await notificationService.getNotifications(recipientId, filters, pagination);
    
    return ApiResponse.success(res, result, 'Notifications retrieved successfully');
  });

  // Get Notification by ID
  getNotificationById = AsyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const recipientId = req.user._id;
    
    const notification = await notificationService.getNotificationById(notificationId, recipientId);
    
    return ApiResponse.success(res, notification, 'Notification retrieved successfully');
  });

  // Mark as Read
  markAsRead = AsyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const recipientId = req.user._id;
    
    const notification = await notificationService.markAsRead(notificationId, recipientId);
    
    return ApiResponse.success(res, notification, 'Notification marked as read');
  });

  // Mark Multiple as Read
  markMultipleAsRead = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.markReadSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const recipientId = req.user._id;
    const result = await notificationService.markMultipleAsRead(value.notificationIds, recipientId);
    
    return ApiResponse.success(res, result, 'Notifications marked as read');
  });

  // Mark All as Read
  markAllAsRead = AsyncHandler(async (req, res) => {
    const recipientId = req.user._id;
    const result = await notificationService.markAllAsRead(recipientId);
    
    return ApiResponse.success(res, result, 'All notifications marked as read');
  });

  // Archive Notification
  archiveNotification = AsyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const recipientId = req.user._id;
    
    const notification = await notificationService.archiveNotification(notificationId, recipientId);
    
    return ApiResponse.success(res, notification, 'Notification archived');
  });

  // Archive Multiple Notifications
  archiveMultipleNotifications = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.archiveNotificationSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const recipientId = req.user._id;
    const result = await notificationService.archiveMultipleNotifications(value.notificationIds, recipientId);
    
    return ApiResponse.success(res, result, 'Notifications archived');
  });

  // Archive All
  archiveAll = AsyncHandler(async (req, res) => {
    const recipientId = req.user._id;
    const result = await notificationService.archiveAll(recipientId);
    
    return ApiResponse.success(res, result, 'All notifications archived');
  });

  // Delete Notification
  deleteNotification = AsyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const recipientId = req.user._id;
    const userId = req.user._id;
    
    const result = await notificationService.deleteNotification(notificationId, recipientId, userId);
    
    return ApiResponse.success(res, result, 'Notification deleted');
  });

  // Delete Multiple Notifications
  deleteMultipleNotifications = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.deleteNotificationSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const recipientId = req.user._id;
    const userId = req.user._id;
    const result = await notificationService.deleteMultipleNotifications(value.notificationIds, recipientId, userId);
    
    return ApiResponse.success(res, result, 'Notifications deleted');
  });

  // Restore Notification
  restoreNotification = AsyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const recipientId = req.user._id;
    
    const notification = await notificationService.restoreNotification(notificationId, recipientId);
    
    return ApiResponse.success(res, notification, 'Notification restored');
  });

  // Get Unread Count
  getUnreadCount = AsyncHandler(async (req, res) => {
    const recipientId = req.user._id;
    const result = await notificationService.getUnreadCount(recipientId);
    
    return ApiResponse.success(res, result, 'Unread count retrieved');
  });

  // Get Notification Statistics
  getNotificationStatistics = AsyncHandler(async (req, res) => {
    const recipientId = req.user._id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const statistics = await notificationService.getNotificationStatistics(recipientId, startDate, endDate);
    
    return ApiResponse.success(res, statistics, 'Notification statistics retrieved');
  });

  // Get Category Breakdown
  getCategoryBreakdown = AsyncHandler(async (req, res) => {
    const recipientId = req.user._id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const breakdown = await notificationService.getCategoryBreakdown(recipientId, startDate, endDate);
    
    return ApiResponse.success(res, breakdown, 'Category breakdown retrieved');
  });

  // Get Type Breakdown
  getTypeBreakdown = AsyncHandler(async (req, res) => {
    const recipientId = req.user._id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const breakdown = await notificationService.getTypeBreakdown(recipientId, startDate, endDate);
    
    return ApiResponse.success(res, breakdown, 'Type breakdown retrieved');
  });

  // Get Priority Breakdown
  getPriorityBreakdown = AsyncHandler(async (req, res) => {
    const recipientId = req.user._id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const breakdown = await notificationService.getPriorityBreakdown(recipientId, startDate, endDate);
    
    return ApiResponse.success(res, breakdown, 'Priority breakdown retrieved');
  });

  // Get Time Series Data
  getTimeSeriesData = AsyncHandler(async (req, res) => {
    const recipientId = req.user._id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const granularity = req.query.granularity || 'daily';
    
    const data = await notificationService.getTimeSeriesData(recipientId, startDate, endDate, granularity);
    
    return ApiResponse.success(res, data, 'Time series data retrieved');
  });

  // Get Preferences
  getPreferences = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const preferences = await notificationService.getPreferences(userId);
    
    return ApiResponse.success(res, preferences, 'Preferences retrieved');
  });

  // Update Preferences
  updatePreferences = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const preferences = await notificationService.updatePreferences(userId, req.body);
    
    return ApiResponse.success(res, preferences, 'Preferences updated');
  });

  // Add Device Token
  addDeviceToken = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.deviceTokenSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const userId = req.user._id;
    const preferences = await notificationService.addDeviceToken(userId, value.token, value.platform, value.deviceId);
    
    return ApiResponse.success(res, preferences, 'Device token added');
  });

  // Remove Device Token
  removeDeviceToken = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { token } = req.body;
    
    const preferences = await notificationService.removeDeviceToken(userId, token);
    
    return ApiResponse.success(res, preferences, 'Device token removed');
  });

  // Mute Notifications
  muteNotifications = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.muteSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const userId = req.user._id;
    const preferences = await notificationService.muteNotifications(userId, value.duration);
    
    return ApiResponse.success(res, preferences, 'Notifications muted');
  });

  // Unmute Notifications
  unmuteNotifications = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const preferences = await notificationService.unmuteNotifications(userId);
    
    return ApiResponse.success(res, preferences, 'Notifications unmuted');
  });

  // Set Category Preference
  setCategoryPreference = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.categoryPreferenceSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const userId = req.user._id;
    const preferences = await notificationService.setCategoryPreference(
      userId,
      value.category,
      value.enabled,
      value.channels,
      value.digest
    );
    
    return ApiResponse.success(res, preferences, 'Category preference set');
  });

  // Set Priority Preference
  setPriorityPreference = AsyncHandler(async (req, res) => {
    const { error, value } = notificationValidationSchemas.priorityPreferenceSchema.safeParse(req.body);
    
    if (error) {
      throw new AppError(error.errors[0].message, 400);
    }
    
    const userId = req.user._id;
    const preferences = await notificationService.setPriorityPreference(
      userId,
      value.priority,
      value.enabled,
      value.channels,
      value.sound
    );
    
    return ApiResponse.success(res, preferences, 'Priority preference set');
  });

  // Process Scheduled Notifications (Admin only)
  processScheduledNotifications = AsyncHandler(async (req, res) => {
    const result = await notificationService.processScheduledNotifications();
    
    return ApiResponse.success(res, result, 'Scheduled notifications processed');
  });

  // Delete Expired Notifications (Admin only)
  deleteExpiredNotifications = AsyncHandler(async (req, res) => {
    const result = await notificationService.deleteExpiredNotifications();
    
    return ApiResponse.success(res, result, 'Expired notifications deleted');
  });

  // Retry Failed Notifications (Admin only)
  retryFailedNotifications = AsyncHandler(async (req, res) => {
    const result = await notificationService.retryFailedNotifications();
    
    return ApiResponse.success(res, result, 'Failed notifications retried');
  });

  // Generate Digest
  generateDigest = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const category = req.query.category;
    
    const digest = await notificationService.generateDigest(userId, category);
    
    if (!digest) {
      return ApiResponse.success(res, null, 'No digest generated');
    }
    
    return ApiResponse.success(res, digest, 'Digest generated');
  });
}

const notificationController = new NotificationController();
export default notificationController;
