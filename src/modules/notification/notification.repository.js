import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import Notification from './notification.model.js';
import NotificationPreference from './notificationPreference.model.js';

class NotificationRepository {
  constructor() {
    this.logger = Logger;
    this.notificationModel = Notification;
    this.preferenceModel = NotificationPreference;
  }

  // Generic Find with Projection
  async find(filter = {}, projection = null, options = {}) {
    try {
      let query = this.notificationModel.find(filter);
      
      if (projection) {
        query = query.select(projection);
      }
      
      if (options.lean) {
        query = query.lean();
      }
      
      if (options.sort) {
        query = query.sort(options.sort);
      }
      
      if (options.skip) {
        query = query.skip(options.skip);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.populate) {
        query = query.populate(options.populate);
      }
      
      return await query;
    } catch (error) {
      this.logger.error('Error in find:', error);
      throw new AppError('Find operation failed', 500);
    }
  }

  // Generic Find One
  async findOne(filter = {}, projection = null, options = {}) {
    try {
      let query = this.notificationModel.findOne(filter);
      
      if (projection) {
        query = query.select(projection);
      }
      
      if (options.lean) {
        query = query.lean();
      }
      
      if (options.populate) {
        query = query.populate(options.populate);
      }
      
      return await query;
    } catch (error) {
      this.logger.error('Error in findOne:', error);
      throw new AppError('FindOne operation failed', 500);
    }
  }

  // Generic Count
  async count(filter = {}) {
    try {
      return await this.notificationModel.countDocuments(filter);
    } catch (error) {
      this.logger.error('Error in count:', error);
      throw new AppError('Count operation failed', 500);
    }
  }

  // Generic Exists
  async exists(filter = {}) {
    try {
      return await this.notificationModel.exists(filter);
    } catch (error) {
      this.logger.error('Error in exists:', error);
      throw new AppError('Exists operation failed', 500);
    }
  }

  // Create Notification
  async create(notificationData) {
    try {
      const notification = await this.notificationModel.create(notificationData);
      return notification;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      throw new AppError('Notification creation failed', 500);
    }
  }

  // Bulk Create Notifications
  async bulkCreate(notificationsData) {
    try {
      const notifications = await this.notificationModel.insertMany(notificationsData, { ordered: false });
      return notifications;
    } catch (error) {
      this.logger.error('Error creating bulk notifications:', error);
      throw new AppError('Bulk notification creation failed', 500);
    }
  }

  // Update Notification
  async update(id, updateData) {
    try {
      const notification = await this.notificationModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return notification;
    } catch (error) {
      this.logger.error('Error updating notification:', error);
      throw new AppError('Notification update failed', 500);
    }
  }

  // Bulk Update Notifications
  async bulkUpdate(filter, updateData) {
    try {
      const result = await this.notificationModel.updateMany(filter, { $set: updateData });
      return result;
    } catch (error) {
      this.logger.error('Error updating bulk notifications:', error);
      throw new AppError('Bulk notification update failed', 500);
    }
  }

  // Delete Notification (Soft Delete)
  async delete(id, deletedBy) {
    try {
      const notification = await this.notificationModel.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy
          }
        },
        { new: true }
      );
      return notification;
    } catch (error) {
      this.logger.error('Error deleting notification:', error);
      throw new AppError('Notification deletion failed', 500);
    }
  }

  // Bulk Delete Notifications (Soft Delete)
  async bulkDelete(filter, deletedBy) {
    try {
      const result = await this.notificationModel.updateMany(filter, {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy
        }
      });
      return result;
    } catch (error) {
      this.logger.error('Error deleting bulk notifications:', error);
      throw new AppError('Bulk notification deletion failed', 500);
    }
  }

  // Restore Notification
  async restore(id) {
    try {
      const notification = await this.notificationModel.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: false,
            deletedAt: null,
            deletedBy: null
          }
        },
        { new: true }
      );
      return notification;
    } catch (error) {
      this.logger.error('Error restoring notification:', error);
      throw new AppError('Notification restoration failed', 500);
    }
  }

  // Pagination
  async paginate(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, projection = null } = options;
    
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.find(filter, projection, { skip, limit, sort, lean: true }),
      this.count(filter)
    ]);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Get Unread Count
  async getUnreadCount(recipientId) {
    try {
      return await this.notificationModel.getUnreadCount(recipientId);
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      throw new AppError('Failed to get unread count', 500);
    }
  }

  // Get Pending Count
  async getPendingCount(recipientId) {
    try {
      return await this.notificationModel.getPendingCount(recipientId);
    } catch (error) {
      this.logger.error('Error getting pending count:', error);
      throw new AppError('Failed to get pending count', 500);
    }
  }

  // Get Failed Count
  async getFailedCount(recipientId) {
    try {
      return await this.notificationModel.getFailedCount(recipientId);
    } catch (error) {
      this.logger.error('Error getting failed count:', error);
      throw new AppError('Failed to get failed count', 500);
    }
  }

  // Mark All As Read
  async markAllAsRead(recipientId) {
    try {
      return await this.notificationModel.markAllAsRead(recipientId);
    } catch (error) {
      this.logger.error('Error marking all as read:', error);
      throw new AppError('Failed to mark all as read', 500);
    }
  }

  // Archive All
  async archiveAll(recipientId) {
    try {
      return await this.notificationModel.archiveAll(recipientId);
    } catch (error) {
      this.logger.error('Error archiving all:', error);
      throw new AppError('Failed to archive all', 500);
    }
  }

  // Delete Expired
  async deleteExpired() {
    try {
      return await this.notificationModel.deleteExpired();
    } catch (error) {
      this.logger.error('Error deleting expired notifications:', error);
      throw new AppError('Failed to delete expired notifications', 500);
    }
  }

  // Get Scheduled Notifications
  async getScheduledNotifications() {
    try {
      return await this.notificationModel.getScheduledNotifications();
    } catch (error) {
      this.logger.error('Error getting scheduled notifications:', error);
      throw new AppError('Failed to get scheduled notifications', 500);
    }
  }

  // Notification Preference Methods
  async getPreference(userId) {
    try {
      return await this.preferenceModel.getByUser(userId);
    } catch (error) {
      this.logger.error('Error getting preference:', error);
      throw new AppError('Failed to get preference', 500);
    }
  }

  async createPreference(preferenceData) {
    try {
      const preference = await this.preferenceModel.create(preferenceData);
      return preference;
    } catch (error) {
      this.logger.error('Error creating preference:', error);
      throw new AppError('Preference creation failed', 500);
    }
  }

  async updatePreference(userId, updateData) {
    try {
      const preference = await this.preferenceModel.findOneAndUpdate(
        { user: userId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return preference;
    } catch (error) {
      this.logger.error('Error updating preference:', error);
      throw new AppError('Preference update failed', 500);
    }
  }

  async getOrCreatePreference(userId) {
    try {
      return await this.preferenceModel.getOrCreateDefault(userId);
    } catch (error) {
      this.logger.error('Error getting or creating preference:', error);
      throw new AppError('Failed to get or create preference', 500);
    }
  }

  async getActiveDeviceTokens(userId, platform = null) {
    try {
      return await this.preferenceModel.getActiveDeviceTokens(userId, platform);
    } catch (error) {
      this.logger.error('Error getting active device tokens:', error);
      throw new AppError('Failed to get active device tokens', 500);
    }
  }

  // Aggregation Methods
  async aggregate(pipeline, options = {}) {
    try {
      const { allowDiskUse = true, maxTimeMS = 30000 } = options;
      
      const result = await this.notificationModel.aggregate(pipeline, {
        allowDiskUse,
        maxTimeMS
      }).toArray();
      
      return result;
    } catch (error) {
      this.logger.error('Error in aggregation:', error);
      throw new AppError('Aggregation failed', 500);
    }
  }

  async aggregateWithCursor(pipeline, options = {}) {
    try {
      const { allowDiskUse = true, maxTimeMS = 30000, batchSize = 1000 } = options;
      
      const cursor = this.notificationModel.aggregate(pipeline, {
        allowDiskUse,
        maxTimeMS,
        cursor: { batchSize }
      });
      
      return cursor;
    } catch (error) {
      this.logger.error('Error in aggregation with cursor:', error);
      throw new AppError('Aggregation with cursor failed', 500);
    }
  }

  // Statistics Methods
  async getStatistics(recipientId, startDate, endDate) {
    try {
      const matchStage = {
        recipient: recipientId,
        isDeleted: false
      };
      
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: {
              $sum: { $cond: [{ $eq: ['$readStatus', 'unread'] }, 1, 0] }
            },
            read: {
              $sum: { $cond: [{ $eq: ['$readStatus', 'read'] }, 1, 0] }
            },
            archived: {
              $sum: { $cond: [{ $eq: ['$readStatus', 'archived'] }, 1, 0] }
            },
            delivered: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            highPriority: {
              $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
            },
            urgentPriority: {
              $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
            },
            criticalPriority: {
              $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
            }
          }
        }
      ];
      
      const result = await this.aggregate(pipeline);
      return result[0] || {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0,
        delivered: 0,
        failed: 0,
        highPriority: 0,
        urgentPriority: 0,
        criticalPriority: 0
      };
    } catch (error) {
      this.logger.error('Error getting statistics:', error);
      throw new AppError('Failed to get statistics', 500);
    }
  }

  async getCategoryBreakdown(recipientId, startDate, endDate) {
    try {
      const matchStage = {
        recipient: recipientId,
        isDeleted: false
      };
      
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            unread: {
              $sum: { $cond: [{ $eq: ['$readStatus', 'unread'] }, 1, 0] }
            }
          }
        },
        {
          $sort: { count: -1 }
        }
      ];
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting category breakdown:', error);
      throw new AppError('Failed to get category breakdown', 500);
    }
  }

  async getTypeBreakdown(recipientId, startDate, endDate) {
    try {
      const matchStage = {
        recipient: recipientId,
        isDeleted: false
      };
      
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ];
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting type breakdown:', error);
      throw new AppError('Failed to get type breakdown', 500);
    }
  }

  async getPriorityBreakdown(recipientId, startDate, endDate) {
    try {
      const matchStage = {
        recipient: recipientId,
        isDeleted: false
      };
      
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ];
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting priority breakdown:', error);
      throw new AppError('Failed to get priority breakdown', 500);
    }
  }

  // Time Series Analytics
  async getTimeSeriesData(recipientId, startDate, endDate, granularity = 'daily') {
    try {
      const matchStage = {
        recipient: recipientId,
        isDeleted: false
      };
      
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      let dateFormat;
      switch (granularity) {
        case 'hourly':
          dateFormat = '%Y-%m-%d-%H';
          break;
        case 'daily':
          dateFormat = '%Y-%m-%d';
          break;
        case 'weekly':
          dateFormat = '%Y-%U';
          break;
        case 'monthly':
          dateFormat = '%Y-%m';
          break;
        default:
          dateFormat = '%Y-%m-%d';
      }
      
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: '$createdAt'
              }
            },
            count: { $sum: 1 },
            unread: {
              $sum: { $cond: [{ $eq: ['$readStatus', 'unread'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ];
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting time series data:', error);
      throw new AppError('Failed to get time series data', 500);
    }
  }
}

const notificationRepository = new NotificationRepository();
export default notificationRepository;
