/**
 * MongoDB Index Optimization for Notification Module
 * 
 * Optimized indexes for supporting:
 * - 100,000+ employees
 * - Millions of notifications
 * - Millions of audit records
 * - Millions of activity logs
 * 
 * Index Strategy:
 * - Compound indexes for common query patterns
 * - Partial indexes for filtered queries
 * - TTL indexes for data retention
 * - Sparse indexes where applicable
 */

import Notification from './notification.model.js';
import NotificationPreference from './notificationPreference.model.js';
import AuditLog from './auditLog.model.js';
import ActivityLog from './activityLog.model.js';

class IndexOptimizer {
  /**
   * Create all optimized indexes for the notification module
   */
  async createOptimizedIndexes() {
    try {
      await this.createNotificationIndexes();
      await this.createNotificationPreferenceIndexes();
      await this.createAuditLogIndexes();
      await this.createActivityLogIndexes();
      
      console.log('All optimized indexes created successfully');
    } catch (error) {
      console.error('Error creating optimized indexes:', error);
      throw error;
    }
  }

  /**
   * Notification Indexes
   * Optimized for recipient-based queries, filtering, and sorting
   */
  async createNotificationIndexes() {
    // Primary query pattern: recipient + read status + created date
    await Notification.collection.createIndex(
      { recipient: 1, readStatus: 1, createdAt: -1 },
      { name: 'idx_recipient_read_created' }
    );

    // Department-based queries
    await Notification.collection.createIndex(
      { department: 1, createdAt: -1 },
      { name: 'idx_department_created' }
    );

    // Priority-based queries for critical notifications
    await Notification.collection.createIndex(
      { priority: 1, readStatus: 1, createdAt: -1 },
      { name: 'idx_priority_read_created' }
    );

    // Category-based filtering
    await Notification.collection.createIndex(
      { category: 1, createdAt: -1 },
      { name: 'idx_category_created' }
    );

    // Module-based queries
    await Notification.collection.createIndex(
      { module: 1, createdAt: -1 },
      { name: 'idx_module_created' }
    );

    // Reference-based queries
    await Notification.collection.createIndex(
      { referenceType: 1, referenceId: 1, createdAt: -1 },
      { name: 'idx_reference_created' }
    );

    // Scheduled notifications
    await Notification.collection.createIndex(
      { scheduledAt: 1, status: 1 },
      { name: 'idx_scheduled_status', partialFilterExpression: { scheduledAt: { $exists: true } } }
    );

    // Expired notifications cleanup
    await Notification.collection.createIndex(
      { expiredAt: 1 },
      { name: 'idx_expired_ttl', expireAfterSeconds: 0, partialFilterExpression: { expiredAt: { $exists: true } } }
    );

    // Status-based queries
    await Notification.collection.createIndex(
      { status: 1, createdAt: -1 },
      { name: 'idx_status_created' }
    );

    // Delivery tracking
    await Notification.collection.createIndex(
      { delivered: 1, deliveredAt: -1 },
      { name: 'idx_delivered_deliveredAt' }
    );

    // Channel-based queries
    await Notification.collection.createIndex(
      { channels: 1, createdAt: -1 },
      { name: 'idx_channels_created' }
    );

    // Soft delete queries
    await Notification.collection.createIndex(
      { isDeleted: 1, deletedAt: -1 },
      { name: 'idx_deleted_deletedAt' }
    );

    // Created by tracking
    await Notification.collection.createIndex(
      { createdBy: 1, createdAt: -1 },
      { name: 'idx_createdBy_created' }
    );

    // Compound index for dashboard queries
    await Notification.collection.createIndex(
      { recipient: 1, category: 1, priority: 1, createdAt: -1 },
      { name: 'idx_recipient_category_priority_created' }
    );

    // TTL for old notifications (2 years retention)
    await Notification.collection.createIndex(
      { createdAt: 1 },
      { name: 'idx_created_ttl', expireAfterSeconds: 63072000 }
    );
  }

  /**
   * Notification Preference Indexes
   * Optimized for user preference lookups
   */
  async createNotificationPreferenceIndexes() {
    // Primary lookup: user
    await NotificationPreference.collection.createIndex(
      { user: 1 },
      { name: 'idx_user', unique: true }
    );

    // Device token lookups
    await NotificationPreference.collection.createIndex(
      { 'deviceTokens.token': 1 },
      { name: 'idx_deviceToken' }
    );

    // Platform-based device token queries
    await NotificationPreference.collection.createIndex(
      { 'deviceTokens.platform': 1 },
      { name: 'idx_devicePlatform' }
    );

    // Mute status queries
    await NotificationPreference.collection.createIndex(
      { isMuted: 1, muteEnd: 1 },
      { name: 'idx_muted_muteEnd', partialFilterExpression: { isMuted: true } }
    );

    // Soft delete
    await NotificationPreference.collection.createIndex(
      { isDeleted: 1, deletedAt: -1 },
      { name: 'idx_deleted_deletedAt' }
    );
  }

  /**
   * Audit Log Indexes
   * Optimized for audit trail queries and compliance reporting
   */
  async createAuditLogIndexes() {
    // Primary query pattern: module + action + timestamp
    await AuditLog.collection.createIndex(
      { module: 1, action: 1, timestamp: -1 },
      { name: 'idx_module_action_timestamp' }
    );

    // User-based audit queries
    await AuditLog.collection.createIndex(
      { performedBy: 1, timestamp: -1 },
      { name: 'idx_performedBy_timestamp' }
    );

    // Entity-based queries
    await AuditLog.collection.createIndex(
      { entity: 1, entityId: 1, timestamp: -1 },
      { name: 'idx_entity_entityId_timestamp' }
    );

    // Session-based queries
    await AuditLog.collection.createIndex(
      { sessionId: 1, timestamp: -1 },
      { name: 'idx_sessionId_timestamp' }
    );

    // IP address tracking
    await AuditLog.collection.createIndex(
      { ipAddress: 1, timestamp: -1 },
      { name: 'idx_ipAddress_timestamp' }
    );

    // Status-based queries
    await AuditLog.collection.createIndex(
      { status: 1, timestamp: -1 },
      { name: 'idx_status_timestamp' }
    );

    // Impact-based queries
    await AuditLog.collection.createIndex(
      { impact: 1, timestamp: -1 },
      { name: 'idx_impact_timestamp' }
    );

    // Failed action queries
    await AuditLog.collection.createIndex(
      { status: 1, action: 1, timestamp: -1 },
      { name: 'idx_status_action_timestamp', partialFilterExpression: { status: 'failed' } }
    );

    // High impact queries
    await AuditLog.collection.createIndex(
      { impact: 1, timestamp: -1 },
      { name: 'idx_impact_timestamp', partialFilterExpression: { impact: { $in: ['high', 'critical'] } } }
    );

    // Soft delete
    await AuditLog.collection.createIndex(
      { isDeleted: 1, deletedAt: -1 },
      { name: 'idx_deleted_deletedAt' }
    );

    // Compound index for compliance reports
    await AuditLog.collection.createIndex(
      { module: 1, timestamp: -1, impact: 1 },
      { name: 'idx_module_timestamp_impact' }
    );

    // TTL for old audit logs (2 years retention)
    await AuditLog.collection.createIndex(
      { timestamp: 1 },
      { name: 'idx_timestamp_ttl', expireAfterSeconds: 63072000 }
    );

    // Date range queries
    await AuditLog.collection.createIndex(
      { timestamp: -1 },
      { name: 'idx_timestamp' }
    );
  }

  /**
   * Activity Log Indexes
   * Optimized for activity tracking and analytics
   */
  async createActivityLogIndexes() {
    // Primary query pattern: user + timestamp
    await ActivityLog.collection.createIndex(
      { user: 1, timestamp: -1 },
      { name: 'idx_user_timestamp' }
    );

    // Type-based queries
    await ActivityLog.collection.createIndex(
      { type: 1, timestamp: -1 },
      { name: 'idx_type_timestamp' }
    );

    // Module-based queries
    await ActivityLog.collection.createIndex(
      { module: 1, timestamp: -1 },
      { name: 'idx_module_timestamp' }
    );

    // Entity-based queries
    await ActivityLog.collection.createIndex(
      { entity: 1, entityId: 1, timestamp: -1 },
      { name: 'idx_entity_entityId_timestamp' }
    );

    // Session-based queries
    await ActivityLog.collection.createIndex(
      { sessionId: 1, timestamp: -1 },
      { name: 'idx_sessionId_timestamp' }
    );

    // Status-based queries
    await ActivityLog.collection.createIndex(
      { status: 1, timestamp: -1 },
      { name: 'idx_status_timestamp' }
    );

    // Tag-based queries
    await ActivityLog.collection.createIndex(
      { tags: 1, timestamp: -1 },
      { name: 'idx_tags_timestamp' }
    );

    // Failed activity queries
    await ActivityLog.collection.createIndex(
      { status: 1, timestamp: -1 },
      { name: 'idx_status_timestamp', partialFilterExpression: { status: 'failed' } }
    );

    // Authentication activity queries
    await ActivityLog.collection.createIndex(
      { type: 1, module: 1, timestamp: -1 },
      { name: 'idx_type_module_timestamp', partialFilterExpression: { module: 'authentication' } }
    );

    // Soft delete
    await ActivityLog.collection.createIndex(
      { isDeleted: 1, deletedAt: -1 },
      { name: 'idx_deleted_deletedAt' }
    );

    // Compound index for analytics
    await ActivityLog.collection.createIndex(
      { module: 1, type: 1, timestamp: -1 },
      { name: 'idx_module_type_timestamp' }
    );

    // TTL for old activity logs (1 year retention)
    await ActivityLog.collection.createIndex(
      { timestamp: 1 },
      { name: 'idx_timestamp_ttl', expireAfterSeconds: 31536000 }
    );

    // Date range queries
    await ActivityLog.collection.createIndex(
      { timestamp: -1 },
      { name: 'idx_timestamp' }
    );

    // Heatmap queries (hourly breakdown)
    await ActivityLog.collection.createIndex(
      { user: 1, timestamp: -1 },
      { name: 'idx_user_timestamp_heatmap' }
    );
  }

  /**
   * Drop all custom indexes (for cleanup)
   */
  async dropCustomIndexes() {
    try {
      const collections = [
        Notification.collection,
        NotificationPreference.collection,
        AuditLog.collection,
        ActivityLog.collection
      ];

      for (const collection of collections) {
        const indexes = await collection.listIndexes();
        for (const index of indexes) {
          if (index.name !== '_id_') {
            await collection.dropIndex(index.name);
          }
        }
      }

      console.log('All custom indexes dropped');
    } catch (error) {
      console.error('Error dropping custom indexes:', error);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats() {
    const stats = {
      notification: await this.getCollectionIndexStats(Notification.collection),
      notificationPreference: await this.getCollectionIndexStats(NotificationPreference.collection),
      auditLog: await this.getCollectionIndexStats(AuditLog.collection),
      activityLog: await this.getCollectionIndexStats(ActivityLog.collection)
    };

    return stats;
  }

  async getCollectionIndexStats(collection) {
    const indexes = await collection.listIndexes();
    return {
      count: indexes.length,
      indexes: indexes.map(idx => ({
        name: idx.name,
        keys: Object.keys(idx.key).join(', ')
      }))
    };
  }

  /**
   * Analyze query performance and suggest indexes
   */
  async analyzeQueryPerformance() {
    // This would typically use MongoDB's explain() on slow queries
    // Placeholder for future implementation
    return {
      recommendations: [
        'Use covered queries where possible',
        'Limit result sets with pagination',
        'Use projection to return only needed fields',
        'Avoid large skip values in pagination'
      ]
    };
  }
}

const indexOptimizer = new IndexOptimizer();
export default indexOptimizer;
