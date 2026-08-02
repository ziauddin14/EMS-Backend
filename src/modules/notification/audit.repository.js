import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import AuditLog from './auditLog.model.js';

class AuditRepository {
  constructor() {
    this.logger = Logger;
    this.auditLogModel = AuditLog;
  }

  // Generic Find with Projection
  async find(filter = {}, projection = null, options = {}) {
    try {
      let query = this.auditLogModel.find(filter);
      
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
      let query = this.auditLogModel.findOne(filter);
      
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
      return await this.auditLogModel.countDocuments(filter);
    } catch (error) {
      this.logger.error('Error in count:', error);
      throw new AppError('Count operation failed', 500);
    }
  }

  // Generic Exists
  async exists(filter = {}) {
    try {
      return await this.auditLogModel.exists(filter);
    } catch (error) {
      this.logger.error('Error in exists:', error);
      throw new AppError('Exists operation failed', 500);
    }
  }

  // Create Audit Log
  async create(auditLogData) {
    try {
      const auditLog = await this.auditLogModel.create(auditLogData);
      return auditLog;
    } catch (error) {
      this.logger.error('Error creating audit log:', error);
      throw new AppError('Audit log creation failed', 500);
    }
  }

  // Bulk Create Audit Logs
  async bulkCreate(auditLogsData) {
    try {
      const auditLogs = await this.auditLogModel.insertMany(auditLogsData, { ordered: false });
      return auditLogs;
    } catch (error) {
      this.logger.error('Error creating bulk audit logs:', error);
      throw new AppError('Bulk audit log creation failed', 500);
    }
  }

  // Update Audit Log
  async update(id, updateData) {
    try {
      const auditLog = await this.auditLogModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return auditLog;
    } catch (error) {
      this.logger.error('Error updating audit log:', error);
      throw new AppError('Audit log update failed', 500);
    }
  }

  // Bulk Update Audit Logs
  async bulkUpdate(filter, updateData) {
    try {
      const result = await this.auditLogModel.updateMany(filter, { $set: updateData });
      return result;
    } catch (error) {
      this.logger.error('Error updating bulk audit logs:', error);
      throw new AppError('Bulk audit log update failed', 500);
    }
  }

  // Delete Audit Log (Soft Delete)
  async delete(id, deletedBy) {
    try {
      const auditLog = await this.auditLogModel.findByIdAndUpdate(
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
      return auditLog;
    } catch (error) {
      this.logger.error('Error deleting audit log:', error);
      throw new AppError('Audit log deletion failed', 500);
    }
  }

  // Bulk Delete Audit Logs (Soft Delete)
  async bulkDelete(filter, deletedBy) {
    try {
      const result = await this.auditLogModel.updateMany(filter, {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy
        }
      });
      return result;
    } catch (error) {
      this.logger.error('Error deleting bulk audit logs:', error);
      throw new AppError('Bulk audit log deletion failed', 500);
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

  // Get By Entity
  async getByEntity(entity, entityId, limit = 100) {
    try {
      return await this.auditLogModel.getByEntity(entity, entityId, limit);
    } catch (error) {
      this.logger.error('Error getting audit logs by entity:', error);
      throw new AppError('Failed to get audit logs by entity', 500);
    }
  }

  // Get By Module
  async getByModule(module, limit = 100) {
    try {
      return await this.auditLogModel.getByModule(module, limit);
    } catch (error) {
      this.logger.error('Error getting audit logs by module:', error);
      throw new AppError('Failed to get audit logs by module', 500);
    }
  }

  // Get By User
  async getByUser(userId, limit = 100) {
    try {
      return await this.auditLogModel.getByUser(userId, limit);
    } catch (error) {
      this.logger.error('Error getting audit logs by user:', error);
      throw new AppError('Failed to get audit logs by user', 500);
    }
  }

  // Get By Action
  async getByAction(action, limit = 100) {
    try {
      return await this.auditLogModel.getByAction(action, limit);
    } catch (error) {
      this.logger.error('Error getting audit logs by action:', error);
      throw new AppError('Failed to get audit logs by action', 500);
    }
  }

  // Get By Date Range
  async getByDateRange(startDate, endDate, limit = 100) {
    try {
      return await this.auditLogModel.getByDateRange(startDate, endDate, limit);
    } catch (error) {
      this.logger.error('Error getting audit logs by date range:', error);
      throw new AppError('Failed to get audit logs by date range', 500);
    }
  }

  // Get By Session
  async getBySession(sessionId, limit = 100) {
    try {
      return await this.auditLogModel.getBySession(sessionId, limit);
    } catch (error) {
      this.logger.error('Error getting audit logs by session:', error);
      throw new AppError('Failed to get audit logs by session', 500);
    }
  }

  // Get By IP Address
  async getByIpAddress(ipAddress, limit = 100) {
    try {
      return await this.auditLogModel.getByIpAddress(ipAddress, limit);
    } catch (error) {
      this.logger.error('Error getting audit logs by IP address:', error);
      throw new AppError('Failed to get audit logs by IP address', 500);
    }
  }

  // Get Failed Actions
  async getFailedActions(limit = 100) {
    try {
      return await this.auditLogModel.getFailedActions(limit);
    } catch (error) {
      this.logger.error('Error getting failed actions:', error);
      throw new AppError('Failed to get failed actions', 500);
    }
  }

  // Get High Impact Actions
  async getHighImpactActions(limit = 100) {
    try {
      return await this.auditLogModel.getHighImpactActions(limit);
    } catch (error) {
      this.logger.error('Error getting high impact actions:', error);
      throw new AppError('Failed to get high impact actions', 500);
    }
  }

  // Get Audit Statistics
  async getAuditStatistics(startDate, endDate) {
    try {
      return await this.auditLogModel.getAuditStatistics(startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting audit statistics:', error);
      throw new AppError('Failed to get audit statistics', 500);
    }
  }

  // Get Action Breakdown
  async getActionBreakdown(startDate, endDate) {
    try {
      return await this.auditLogModel.getActionBreakdown(startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting action breakdown:', error);
      throw new AppError('Failed to get action breakdown', 500);
    }
  }

  // Get Module Breakdown
  async getModuleBreakdown(startDate, endDate) {
    try {
      return await this.auditLogModel.getModuleBreakdown(startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting module breakdown:', error);
      throw new AppError('Failed to get module breakdown', 500);
    }
  }

  // Get User Activity
  async getUserActivity(userId, startDate, endDate) {
    try {
      return await this.auditLogModel.getUserActivity(userId, startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting user activity:', error);
      throw new AppError('Failed to get user activity', 500);
    }
  }

  // Cleanup Old Logs
  async cleanupOldLogs(retentionDays = 730) {
    try {
      return await this.auditLogModel.cleanupOldLogs(retentionDays);
    } catch (error) {
      this.logger.error('Error cleaning up old logs:', error);
      throw new AppError('Failed to cleanup old logs', 500);
    }
  }

  // Aggregation Methods
  async aggregate(pipeline, options = {}) {
    try {
      const { allowDiskUse = true, maxTimeMS = 30000 } = options;
      
      const result = await this.auditLogModel.aggregate(pipeline, {
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
      
      const cursor = this.auditLogModel.aggregate(pipeline, {
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
  async getTimeSeriesData(startDate, endDate, granularity = 'daily', module = null, action = null) {
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
      
      if (action) {
        matchStage.action = action;
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
            successful: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
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
        performedBy: userId,
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
            },
            uniqueModules: {
              $addToSet: '$module'
            },
            uniqueActions: {
              $addToSet: '$action'
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            successful: 1,
            failed: 1,
            highImpact: 1,
            criticalImpact: 1,
            moduleCount: { $size: '$uniqueModules' },
            actionCount: { $size: '$uniqueActions' }
          }
        }
      ];
      
      const result = await this.aggregate(pipeline);
      return result[0] || {
        total: 0,
        successful: 0,
        failed: 0,
        highImpact: 0,
        criticalImpact: 0,
        moduleCount: 0,
        actionCount: 0
      };
    } catch (error) {
      this.logger.error('Error getting user activity summary:', error);
      throw new AppError('Failed to get user activity summary', 500);
    }
  }

  // Entity History
  async getEntityHistory(entity, entityId, limit = 50) {
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
            action: 1,
            performedBy: 1,
            performedByName: 1,
            timestamp: 1,
            oldData: 1,
            newData: 1,
            changes: 1,
            status: 1,
            impact: 1
          }
        }
      ];
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting entity history:', error);
      throw new AppError('Failed to get entity history', 500);
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
            module: 1,
            action: 1,
            entity: 1,
            entityId: 1,
            performedBy: 1,
            performedByName: 1,
            timestamp: 1,
            status: 1,
            impact: 1
          }
        }
      ];
      
      return await this.aggregate(pipeline);
    } catch (error) {
      this.logger.error('Error getting recent activity:', error);
      throw new AppError('Failed to get recent activity', 500);
    }
  }
}

const auditRepository = new AuditRepository();
export default auditRepository;
