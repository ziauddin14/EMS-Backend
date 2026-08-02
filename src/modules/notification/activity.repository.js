import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import ActivityLog from './activityLog.model.js';

class ActivityRepository {
  constructor() {
    this.logger = Logger;
    this.activityLogModel = ActivityLog;
  }

  // Generic Find with Projection
  async find(filter = {}, projection = null, options = {}) {
    try {
      let query = this.activityLogModel.find(filter);
      
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
      let query = this.activityLogModel.findOne(filter);
      
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
      return await this.activityLogModel.countDocuments(filter);
    } catch (error) {
      this.logger.error('Error in count:', error);
      throw new AppError('Count operation failed', 500);
    }
  }

  // Generic Exists
  async exists(filter = {}) {
    try {
      return await this.activityLogModel.exists(filter);
    } catch (error) {
      this.logger.error('Error in exists:', error);
      throw new AppError('Exists operation failed', 500);
    }
  }

  // Create Activity Log
  async create(activityLogData) {
    try {
      const activityLog = await this.activityLogModel.create(activityLogData);
      return activityLog;
    } catch (error) {
      this.logger.error('Error creating activity log:', error);
      throw new AppError('Activity log creation failed', 500);
    }
  }

  // Bulk Create Activity Logs
  async bulkCreate(activityLogsData) {
    try {
      const activityLogs = await this.activityLogModel.insertMany(activityLogsData, { ordered: false });
      return activityLogs;
    } catch (error) {
      this.logger.error('Error creating bulk activity logs:', error);
      throw new AppError('Bulk activity log creation failed', 500);
    }
  }

  // Update Activity Log
  async update(id, updateData) {
    try {
      const activityLog = await this.activityLogModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return activityLog;
    } catch (error) {
      this.logger.error('Error updating activity log:', error);
      throw new AppError('Activity log update failed', 500);
    }
  }

  // Bulk Update Activity Logs
  async bulkUpdate(filter, updateData) {
    try {
      const result = await this.activityLogModel.updateMany(filter, { $set: updateData });
      return result;
    } catch (error) {
      this.logger.error('Error updating bulk activity logs:', error);
      throw new AppError('Bulk activity log update failed', 500);
    }
  }

  // Delete Activity Log (Soft Delete)
  async delete(id, deletedBy) {
    try {
      const activityLog = await this.activityLogModel.findByIdAndUpdate(
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
      return activityLog;
    } catch (error) {
      this.logger.error('Error deleting activity log:', error);
      throw new AppError('Activity log deletion failed', 500);
    }
  }

  // Bulk Delete Activity Logs (Soft Delete)
  async bulkDelete(filter, deletedBy) {
    try {
      const result = await this.activityLogModel.updateMany(filter, {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy
        }
      });
      return result;
    } catch (error) {
      this.logger.error('Error deleting bulk activity logs:', error);
      throw new AppError('Bulk activity log deletion failed', 500);
    }
  }

  // Pagination
  async paginate(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { timestamp: -1 }, projection = null } = options;
    
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

  // Get By User
  async getByUser(userId, limit = 100) {
    try {
      return await this.activityLogModel.getByUser(userId, limit);
    } catch (error) {
      this.logger.error('Error getting activity logs by user:', error);
      throw new AppError('Failed to get activity logs by user', 500);
    }
  }

  // Get By Type
  async getByType(type, limit = 100) {
    try {
      return await this.activityLogModel.getByType(type, limit);
    } catch (error) {
      this.logger.error('Error getting activity logs by type:', error);
      throw new AppError('Failed to get activity logs by type', 500);
    }
  }

  // Get By Module
  async getByModule(module, limit = 100) {
    try {
      return await this.activityLogModel.getByModule(module, limit);
    } catch (error) {
      this.logger.error('Error getting activity logs by module:', error);
      throw new AppError('Failed to get activity logs by module', 500);
    }
  }

  // Get By Entity
  async getByEntity(entity, entityId, limit = 100) {
    try {
      return await this.activityLogModel.getByEntity(entity, entityId, limit);
    } catch (error) {
      this.logger.error('Error getting activity logs by entity:', error);
      throw new AppError('Failed to get activity logs by entity', 500);
    }
  }

  // Get By Date Range
  async getByDateRange(startDate, endDate, limit = 100) {
    try {
      return await this.activityLogModel.getByDateRange(startDate, endDate, limit);
    } catch (error) {
      this.logger.error('Error getting activity logs by date range:', error);
      throw new AppError('Failed to get activity logs by date range', 500);
    }
  }

  // Get By Session
  async getBySession(sessionId, limit = 100) {
    try {
      return await this.activityLogModel.getBySession(sessionId, limit);
    } catch (error) {
      this.logger.error('Error getting activity logs by session:', error);
      throw new AppError('Failed to get activity logs by session', 500);
    }
  }

  // Get By Tag
  async getByTag(tag, limit = 100) {
    try {
      return await this.activityLogModel.getByTag(tag, limit);
    } catch (error) {
      this.logger.error('Error getting activity logs by tag:', error);
      throw new AppError('Failed to get activity logs by tag', 500);
    }
  }

  // Get Login Activities
  async getLoginActivities(userId, limit = 50) {
    try {
      return await this.activityLogModel.getLoginActivities(userId, limit);
    } catch (error) {
      this.logger.error('Error getting login activities:', error);
      throw new AppError('Failed to get login activities', 500);
    }
  }

  // Get Logout Activities
  async getLogoutActivities(userId, limit = 50) {
    try {
      return await this.activityLogModel.getLogoutActivities(userId, limit);
    } catch (error) {
      this.logger.error('Error getting logout activities:', error);
      throw new AppError('Failed to get logout activities', 500);
    }
  }

  // Get Failed Activities
  async getFailedActivities(limit = 100) {
    try {
      return await this.activityLogModel.getFailedActivities(limit);
    } catch (error) {
      this.logger.error('Error getting failed activities:', error);
      throw new AppError('Failed to get failed activities', 500);
    }
  }

  // Get Activity Statistics
  async getActivityStatistics(startDate, endDate) {
    try {
      return await this.activityLogModel.getActivityStatistics(startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting activity statistics:', error);
      throw new AppError('Failed to get activity statistics', 500);
    }
  }

  // Get Type Breakdown
  async getTypeBreakdown(startDate, endDate) {
    try {
      return await this.activityLogModel.getTypeBreakdown(startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting type breakdown:', error);
      throw new AppError('Failed to get type breakdown', 500);
    }
  }

  // Get Module Breakdown
  async getModuleBreakdown(startDate, endDate) {
    try {
      return await this.activityLogModel.getModuleBreakdown(startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting module breakdown:', error);
      throw new AppError('Failed to get module breakdown', 500);
    }
  }

  // Get User Activity Timeline
  async getUserActivityTimeline(userId, startDate, endDate) {
    try {
      return await this.activityLogModel.getUserActivityTimeline(userId, startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting user activity timeline:', error);
      throw new AppError('Failed to get user activity timeline', 500);
    }
  }

  // Get Active Sessions
  async getActiveSessions() {
    try {
      return await this.activityLogModel.getActiveSessions();
    } catch (error) {
      this.logger.error('Error getting active sessions:', error);
      throw new AppError('Failed to get active sessions', 500);
    }
  }

  // Get User Login History
  async getUserLoginHistory(userId, days = 30) {
    try {
      return await this.activityLogModel.getUserLoginHistory(userId, days);
    } catch (error) {
      this.logger.error('Error getting user login history:', error);
      throw new AppError('Failed to get user login history', 500);
    }
  }

  // Cleanup Old Logs
  async cleanupOldLogs(retentionDays = 365) {
    try {
      return await this.activityLogModel.cleanupOldLogs(retentionDays);
    } catch (error) {
      this.logger.error('Error cleaning up old logs:', error);
      throw new AppError('Failed to cleanup old logs', 500);
    }
  }

  // Aggregation Methods
  async aggregate(pipeline, options = {}) {
    try {
      const { allowDiskUse = true, maxTimeMS = 30000 } = options;
      
      const result = await this.activityLogModel.aggregate(pipeline, {
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
      
      const cursor = this.activityLogModel.aggregate(pipeline, {
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

  // Time Series Analytics
  async getTimeSeriesData(startDate, endDate, granularity = 'daily', module = null, type = null) {
    try {
      const matchStage = {
        isDeleted: false
      };
      
      if (startDate && endDate) {
        matchStage.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      if (module) {
        matchStage.module = module;
      }
      
      if (type) {
        matchStage.type = type;
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
                date: '$timestamp'
              }
            },
            count: { $sum: 1 },
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
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting time series data:', error);
      throw new AppError('Failed to get time series data', 500);
    }
  }

  // User Activity Summary
  async getUserActivitySummary(userId, startDate, endDate) {
    try {
      const matchStage = {
        user: userId,
        isDeleted: false
      };
      
      if (startDate && endDate) {
        matchStage.timestamp = {
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
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            uniqueModules: {
              $addToSet: '$module'
            },
            uniqueTypes: {
              $addToSet: '$type'
            },
            totalDuration: {
              $sum: { $ifNull: ['$duration', 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            active: 1,
            completed: 1,
            failed: 1,
            moduleCount: { $size: '$uniqueModules' },
            typeCount: { $size: '$uniqueTypes' },
            totalDuration: 1,
            avgDuration: { $divide: ['$totalDuration', '$total'] }
          }
        }
      ];
      
      const result = await this.aggregate(pipeline);
      return result[0] || {
        total: 0,
        active: 0,
        completed: 0,
        failed: 0,
        moduleCount: 0,
        typeCount: 0,
        totalDuration: 0,
        avgDuration: 0
      };
    } catch (error) {
      this.logger.error('Error getting user activity summary:', error);
      throw new AppError('Failed to get user activity summary', 500);
    }
  }

  // Entity Activity History
  async getEntityActivityHistory(entity, entityId, limit = 50) {
    try {
      const pipeline = [
        {
          $match: {
            entity,
            entityId,
            isDeleted: false
          }
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: 1,
            type: 1,
            module: 1,
            user: 1,
            userName: 1,
            timestamp: 1,
            status: 1,
            duration: 1,
            data: 1
          }
        }
      ];
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting entity activity history:', error);
      throw new AppError('Failed to get entity activity history', 500);
    }
  }

  // Recent Activity
  async getRecentActivity(limit = 50, module = null) {
    try {
      const matchStage = {
        isDeleted: false
      };
      
      if (module) {
        matchStage.module = module;
      }
      
      const pipeline = [
        { $match: matchStage },
        {
          $sort: { timestamp: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: 1,
            type: 1,
            module: 1,
            title: 1,
            user: 1,
            userName: 1,
            timestamp: 1,
            status: 1
          }
        }
      ];
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting recent activity:', error);
      throw new AppError('Failed to get recent activity', 500);
    }
  }

  // Activity Heatmap Data
  async getActivityHeatmap(userId, startDate, endDate) {
    try {
      const matchStage = {
        user: userId,
        isDeleted: false
      };
      
      if (startDate && endDate) {
        matchStage.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp'
                }
              },
              hour: {
                $hour: '$timestamp'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1, '_id.hour': 1 }
        }
      ];
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting activity heatmap:', error);
      throw new AppError('Failed to get activity heatmap', 500);
    }
  }

  // Activity Leaderboard
  async getActivityLeaderboard(startDate, endDate, limit = 10) {
    try {
      const matchStage = {
        isDeleted: false
      };
      
      if (startDate && endDate) {
        matchStage.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
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
        {
          $limit: limit
        },
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
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting activity leaderboard:', error);
      throw new AppError('Failed to get activity leaderboard', 500);
    }
  }
}

const activityRepository = new ActivityRepository();
export default activityRepository;
