import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import notificationRepository from './notification.repository.js';
import NotificationHelpers from './notification.helpers.js';
import NotificationUtils from './notification.utils.js';
import { NOTIFICATION_STATUS, READ_STATUS, DIGEST_FREQUENCY } from './notification.constants.js';

class NotificationService {
  constructor() {
    this.logger = Logger;
    this.repository = notificationRepository;
    this.helpers = NotificationHelpers;
    this.utils = NotificationUtils;
  }

  // Create Notification
  async createNotification(notificationData, userId) {
    try {
      // Get recipient preferences
      const preferences = await this.repository.getOrCreatePreference(notificationData.recipient);
      
      // Check if muted
      if (this.helpers.isMuted(preferences) && !this.helpers.shouldBypassMute(notificationData, preferences)) {
        // Still create but mark as muted
        notificationData.metadata = notificationData.metadata || {};
        notificationData.metadata.muted = true;
      }
      
      // Select channels based on preferences
      const channels = this.helpers.selectChannels(notificationData, preferences);
      notificationData.channels = channels;
      
      // Set created by
      notificationData.createdBy = userId;
      
      // Create notification
      const notification = await this.repository.create(notificationData);
      
      this.logger.info(`Notification created: ${notification._id}`);
      
      return notification;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      throw error instanceof AppError ? error : new AppError('Notification creation failed', 500);
    }
  }

  // Bulk Create Notifications
  async bulkCreateNotifications(notificationsData, userId) {
    try {
      // Process each notification with preferences
      const processedNotifications = [];
      
      for (const notificationData of notificationsData) {
        const preferences = await this.repository.getOrCreatePreference(notificationData.recipient);
        
        if (this.helpers.isMuted(preferences) && !this.helpers.shouldBypassMute(notificationData, preferences)) {
          notificationData.metadata = notificationData.metadata || {};
          notificationData.metadata.muted = true;
        }
        
        const channels = this.helpers.selectChannels(notificationData, preferences);
        notificationData.channels = channels;
        notificationData.createdBy = userId;
        
        processedNotifications.push(notificationData);
      }
      
      const notifications = await this.repository.bulkCreate(processedNotifications);
      
      this.logger.info(`Bulk notifications created: ${notifications.length}`);
      
      return notifications;
    } catch (error) {
      this.logger.error('Error creating bulk notifications:', error);
      throw error instanceof AppError ? error : new AppError('Bulk notification creation failed', 500);
    }
  }

  // Get Notifications
  async getNotifications(recipientId, filters = {}, pagination = {}) {
    try {
      const filter = {
        recipient: recipientId,
        isDeleted: false,
        ...filters
      };
      
      const result = await this.repository.paginate(filter, pagination);
      
      result.data = this.helpers.formatNotificationList(result.data);
      
      return result;
    } catch (error) {
      this.logger.error('Error getting notifications:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get notifications', 500);
    }
  }

  // Get Notification by ID
  async getNotificationById(notificationId, recipientId) {
    try {
      const filter = {
        _id: notificationId,
        recipient: recipientId,
        isDeleted: false
      };
      
      const notification = await this.repository.findOne(filter);
      
      if (!notification) {
        throw new AppError('Notification not found', 404);
      }
      
      return this.helpers.formatNotification(notification);
    } catch (error) {
      this.logger.error('Error getting notification by ID:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get notification', 500);
    }
  }

  // Mark as Read
  async markAsRead(notificationId, recipientId) {
    try {
      const filter = {
        _id: notificationId,
        recipient: recipientId,
        isDeleted: false
      };
      
      const notification = await this.repository.findOne(filter);
      
      if (!notification) {
        throw new AppError('Notification not found', 404);
      }
      
      await notification.markAsRead();
      
      this.logger.info(`Notification marked as read: ${notificationId}`);
      
      return this.helpers.formatNotification(notification);
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      throw error instanceof AppError ? error : new AppError('Failed to mark notification as read', 500);
    }
  }

  // Mark Multiple as Read
  async markMultipleAsRead(notificationIds, recipientId) {
    try {
      const filter = {
        _id: { $in: notificationIds },
        recipient: recipientId,
        readStatus: READ_STATUS.UNREAD,
        isDeleted: false
      };
      
      const result = await this.repository.bulkUpdate(filter, {
        readStatus: READ_STATUS.READ,
        readAt: new Date()
      });
      
      this.logger.info(`Multiple notifications marked as read: ${result.modifiedCount}`);
      
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      this.logger.error('Error marking multiple notifications as read:', error);
      throw error instanceof AppError ? error : new AppError('Failed to mark notifications as read', 500);
    }
  }

  // Mark All as Read
  async markAllAsRead(recipientId) {
    try {
      const result = await this.repository.markAllAsRead(recipientId);
      
      this.logger.info(`All notifications marked as read for recipient: ${recipientId}`);
      
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      this.logger.error('Error marking all notifications as read:', error);
      throw error instanceof AppError ? error : new AppError('Failed to mark all notifications as read', 500);
    }
  }

  // Archive Notification
  async archiveNotification(notificationId, recipientId) {
    try {
      const filter = {
        _id: notificationId,
        recipient: recipientId,
        isDeleted: false
      };
      
      const notification = await this.repository.findOne(filter);
      
      if (!notification) {
        throw new AppError('Notification not found', 404);
      }
      
      await notification.archive();
      
      this.logger.info(`Notification archived: ${notificationId}`);
      
      return this.helpers.formatNotification(notification);
    } catch (error) {
      this.logger.error('Error archiving notification:', error);
      throw error instanceof AppError ? error : new AppError('Failed to archive notification', 500);
    }
  }

  // Archive Multiple Notifications
  async archiveMultipleNotifications(notificationIds, recipientId) {
    try {
      const filter = {
        _id: { $in: notificationIds },
        recipient: recipientId,
        readStatus: READ_STATUS.READ,
        isDeleted: false
      };
      
      const result = await this.repository.bulkUpdate(filter, {
        readStatus: READ_STATUS.ARCHIVED
      });
      
      this.logger.info(`Multiple notifications archived: ${result.modifiedCount}`);
      
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      this.logger.error('Error archiving multiple notifications:', error);
      throw error instanceof AppError ? error : new AppError('Failed to archive notifications', 500);
    }
  }

  // Archive All
  async archiveAll(recipientId) {
    try {
      const result = await this.repository.archiveAll(recipientId);
      
      this.logger.info(`All notifications archived for recipient: ${recipientId}`);
      
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      this.logger.error('Error archiving all notifications:', error);
      throw error instanceof AppError ? error : new AppError('Failed to archive all notifications', 500);
    }
  }

  // Delete Notification (Soft Delete)
  async deleteNotification(notificationId, recipientId, userId) {
    try {
      const filter = {
        _id: notificationId,
        recipient: recipientId,
        isDeleted: false
      };
      
      const notification = await this.repository.findOne(filter);
      
      if (!notification) {
        throw new AppError('Notification not found', 404);
      }
      
      await this.repository.delete(notificationId, userId);
      
      this.logger.info(`Notification deleted: ${notificationId}`);
      
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting notification:', error);
      throw error instanceof AppError ? error : new AppError('Failed to delete notification', 500);
    }
  }

  // Delete Multiple Notifications (Soft Delete)
  async deleteMultipleNotifications(notificationIds, recipientId, userId) {
    try {
      const filter = {
        _id: { $in: notificationIds },
        recipient: recipientId,
        isDeleted: false
      };
      
      const result = await this.repository.bulkDelete(filter, userId);
      
      this.logger.info(`Multiple notifications deleted: ${result.modifiedCount}`);
      
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      this.logger.error('Error deleting multiple notifications:', error);
      throw error instanceof AppError ? error : new AppError('Failed to delete notifications', 500);
    }
  }

  // Restore Notification
  async restoreNotification(notificationId, recipientId) {
    try {
      const filter = {
        _id: notificationId,
        recipient: recipientId,
        isDeleted: true
      };
      
      const notification = await this.repository.findOne(filter);
      
      if (!notification) {
        throw new AppError('Notification not found', 404);
      }
      
      await this.repository.restore(notificationId);
      
      this.logger.info(`Notification restored: ${notificationId}`);
      
      return this.helpers.formatNotification(notification);
    } catch (error) {
      this.logger.error('Error restoring notification:', error);
      throw error instanceof AppError ? error : new AppError('Failed to restore notification', 500);
    }
  }

  // Get Unread Count
  async getUnreadCount(recipientId) {
    try {
      const count = await this.repository.getUnreadCount(recipientId);
      return { unreadCount: count };
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get unread count', 500);
    }
  }

  // Get Notification Statistics
  async getNotificationStatistics(recipientId, startDate, endDate) {
    try {
      const statistics = await this.repository.getStatistics(recipientId, startDate, endDate);
      return statistics;
    } catch (error) {
      this.logger.error('Error getting notification statistics:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get notification statistics', 500);
    }
  }

  // Get Category Breakdown
  async getCategoryBreakdown(recipientId, startDate, endDate) {
    try {
      const breakdown = await this.repository.getCategoryBreakdown(recipientId, startDate, endDate);
      return breakdown;
    } catch (error) {
      this.logger.error('Error getting category breakdown:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get category breakdown', 500);
    }
  }

  // Get Type Breakdown
  async getTypeBreakdown(recipientId, startDate, endDate) {
    try {
      const breakdown = await this.repository.getTypeBreakdown(recipientId, startDate, endDate);
      return breakdown;
    } catch (error) {
      this.logger.error('Error getting type breakdown:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get type breakdown', 500);
    }
  }

  // Get Priority Breakdown
  async getPriorityBreakdown(recipientId, startDate, endDate) {
    try {
      const breakdown = await this.repository.getPriorityBreakdown(recipientId, startDate, endDate);
      return breakdown;
    } catch (error) {
      this.logger.error('Error getting priority breakdown:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get priority breakdown', 500);
    }
  }

  // Get Time Series Data
  async getTimeSeriesData(recipientId, startDate, endDate, granularity = 'daily') {
    try {
      const data = await this.repository.getTimeSeriesData(recipientId, startDate, endDate, granularity);
      return data;
    } catch (error) {
      this.logger.error('Error getting time series data:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get time series data', 500);
    }
  }

  // Notification Preferences
  async getPreferences(userId) {
    try {
      const preference = await this.repository.getOrCreatePreference(userId);
      return this.helpers.formatNotificationPreference(preference);
    } catch (error) {
      this.logger.error('Error getting preferences:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get preferences', 500);
    }
  }

  async updatePreferences(userId, preferenceData) {
    try {
      const preference = await this.repository.updatePreference(userId, preferenceData);
      return this.helpers.formatNotificationPreference(preference);
    } catch (error) {
      this.logger.error('Error updating preferences:', error);
      throw error instanceof AppError ? error : new AppError('Failed to update preferences', 500);
    }
  }

  async addDeviceToken(userId, token, platform, deviceId) {
    try {
      const preference = await this.repository.getOrCreatePreference(userId);
      await preference.addDeviceToken(token, platform, deviceId);
      return this.helpers.formatNotificationPreference(preference);
    } catch (error) {
      this.logger.error('Error adding device token:', error);
      throw error instanceof AppError ? error : new AppError('Failed to add device token', 500);
    }
  }

  async removeDeviceToken(userId, token) {
    try {
      const preference = await this.repository.getPreference(userId);
      if (!preference) {
        throw new AppError('Preference not found', 404);
      }
      await preference.removeDeviceToken(token);
      return this.helpers.formatNotificationPreference(preference);
    } catch (error) {
      this.logger.error('Error removing device token:', error);
      throw error instanceof AppError ? error : new AppError('Failed to remove device token', 500);
    }
  }

  async muteNotifications(userId, duration) {
    try {
      const preference = await this.repository.getOrCreatePreference(userId);
      await preference.mute(duration);
      return this.helpers.formatNotificationPreference(preference);
    } catch (error) {
      this.logger.error('Error muting notifications:', error);
      throw error instanceof AppError ? error : new AppError('Failed to mute notifications', 500);
    }
  }

  async unmuteNotifications(userId) {
    try {
      const preference = await this.repository.getPreference(userId);
      if (!preference) {
        throw new AppError('Preference not found', 404);
      }
      await preference.unmute();
      return this.helpers.formatNotificationPreference(preference);
    } catch (error) {
      this.logger.error('Error unmuting notifications:', error);
      throw error instanceof AppError ? error : new AppError('Failed to unmute notifications', 500);
    }
  }

  async setCategoryPreference(userId, category, enabled, channels, digest) {
    try {
      const preference = await this.repository.getOrCreatePreference(userId);
      await preference.setCategoryPreference(category, enabled, channels, digest);
      return this.helpers.formatNotificationPreference(preference);
    } catch (error) {
      this.logger.error('Error setting category preference:', error);
      throw error instanceof AppError ? error : new AppError('Failed to set category preference', 500);
    }
  }

  async setPriorityPreference(userId, priority, enabled, channels, sound) {
    try {
      const preference = await this.repository.getOrCreatePreference(userId);
      await preference.setPriorityPreference(priority, enabled, channels, sound);
      return this.helpers.formatNotificationPreference(preference);
    } catch (error) {
      this.logger.error('Error setting priority preference:', error);
      throw error instanceof AppError ? error : new AppError('Failed to set priority preference', 500);
    }
  }

  // Process Scheduled Notifications
  async processScheduledNotifications() {
    try {
      const scheduledNotifications = await this.repository.getScheduledNotifications();
      
      const processed = [];
      
      for (const notification of scheduledNotifications) {
        // Check if expired
        if (notification.expiredAt && new Date() > notification.expiredAt) {
          await this.repository.update(notification._id, { status: NOTIFICATION_STATUS.EXPIRED });
          continue;
        }
        
        // Update status to sent
        await this.repository.update(notification._id, { status: NOTIFICATION_STATUS.SENT });
        processed.push(notification._id);
      }
      
      this.logger.info(`Processed scheduled notifications: ${processed.length}`);
      
      return { processedCount: processed.length };
    } catch (error) {
      this.logger.error('Error processing scheduled notifications:', error);
      throw error instanceof AppError ? error : new AppError('Failed to process scheduled notifications', 500);
    }
  }

  // Delete Expired Notifications
  async deleteExpiredNotifications() {
    try {
      const result = await this.repository.deleteExpired();
      this.logger.info(`Deleted expired notifications: ${result.deletedCount}`);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error('Error deleting expired notifications:', error);
      throw error instanceof AppError ? error : new AppError('Failed to delete expired notifications', 500);
    }
  }

  // Send Notification (Placeholder for actual channel sending)
  async sendNotification(notification) {
    try {
      // This is a placeholder for actual notification sending
      // In production, this would integrate with:
      // - Email service (SendGrid, etc.)
      // - SMS service (Twilio, etc.)
      // - Push notification service (FCM, OneSignal, etc.)
      // - In-app notification (WebSocket, SSE, etc.)
      // - WhatsApp (WhatsApp Cloud API)
      // - Slack (Slack API)
      // - Microsoft Teams (Teams API)
      // - Discord (Discord API)
      
      // For now, just mark as delivered
      if (notification.channels.includes('in_app')) {
        await notification.markAsDelivered();
      }
      
      this.logger.info(`Notification sent via channels: ${notification.channels.join(', ')}`);
      
      return notification;
    } catch (error) {
      this.logger.error('Error sending notification:', error);
      await notification.markAsFailed(error);
      throw error;
    }
  }

  // Retry Failed Notifications
  async retryFailedNotifications() {
    try {
      const filter = {
        status: NOTIFICATION_STATUS.FAILED,
        retryCount: { $lt: 3 },
        isDeleted: false
      };
      
      const failedNotifications = await this.repository.find(filter);
      
      const retried = [];
      
      for (const notification of failedNotifications) {
        try {
          await this.sendNotification(notification);
          retried.push(notification._id);
        } catch (error) {
          this.logger.error(`Failed to retry notification ${notification._id}:`, error);
        }
      }
      
      this.logger.info(`Retried failed notifications: ${retried.length}`);
      
      return { retriedCount: retried.length };
    } catch (error) {
      this.logger.error('Error retrying failed notifications:', error);
      throw error instanceof AppError ? error : new AppError('Failed to retry notifications', 500);
    }
  }

  // Generate Digest (Placeholder)
  async generateDigest(recipientId, category = null) {
    try {
      const preferences = await this.repository.getPreference(recipientId);
      
      if (!preferences || preferences.digestFrequency === DIGEST_FREQUENCY.IMMEDIATE) {
        return null;
      }
      
      const filter = {
        recipient: recipientId,
        readStatus: READ_STATUS.UNREAD,
        isDeleted: false
      };
      
      if (category) {
        filter.category = category;
      }
      
      const notifications = await this.repository.find(filter, null, { sort: { createdAt: -1 }, limit: 50 });
      
      if (notifications.length === 0) {
        return null;
      }
      
      // Mark as read after digest generation
      await this.repository.markAllAsRead(recipientId);
      
      this.logger.info(`Digest generated for recipient: ${recipientId}`);
      
      return {
        recipientId,
        notificationCount: notifications.length,
        notifications: this.helpers.formatNotificationList(notifications),
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Error generating digest:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate digest', 500);
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
