import { NOTIFICATION_TYPE, NOTIFICATION_PRIORITY, NOTIFICATION_CATEGORY, NOTIFICATION_STATUS, READ_STATUS, DIGEST_FREQUENCY, MUTE_DURATION, AUDIT_ACTION, ACTIVITY_TYPE } from './notification.constants.js';

class NotificationHelpers {
  // Notification Type Helpers
  static getNotificationTypeLabel(type) {
    const labels = {
      [NOTIFICATION_TYPE.INFO]: 'Information',
      [NOTIFICATION_TYPE.SUCCESS]: 'Success',
      [NOTIFICATION_TYPE.WARNING]: 'Warning',
      [NOTIFICATION_TYPE.ERROR]: 'Error',
      [NOTIFICATION_TYPE.ALERT]: 'Alert',
      [NOTIFICATION_TYPE.REMINDER]: 'Reminder',
      [NOTIFICATION_TYPE.ANNOUNCEMENT]: 'Announcement',
      [NOTIFICATION_TYPE.SYSTEM]: 'System'
    };
    return labels[type] || type;
  }

  static getNotificationTypeColor(type) {
    const colors = {
      [NOTIFICATION_TYPE.INFO]: '#3b82f6',
      [NOTIFICATION_TYPE.SUCCESS]: '#10b981',
      [NOTIFICATION_TYPE.WARNING]: '#f59e0b',
      [NOTIFICATION_TYPE.ERROR]: '#ef4444',
      [NOTIFICATION_TYPE.ALERT]: '#dc2626',
      [NOTIFICATION_TYPE.REMINDER]: '#8b5cf6',
      [NOTIFICATION_TYPE.ANNOUNCEMENT]: '#06b6d4',
      [NOTIFICATION_TYPE.SYSTEM]: '#6b7280'
    };
    return colors[type] || '#6b7280';
  }

  // Priority Helpers
  static getPriorityLabel(priority) {
    const labels = {
      [NOTIFICATION_PRIORITY.LOW]: 'Low',
      [NOTIFICATION_PRIORITY.NORMAL]: 'Normal',
      [NOTIFICATION_PRIORITY.HIGH]: 'High',
      [NOTIFICATION_PRIORITY.URGENT]: 'Urgent',
      [NOTIFICATION_PRIORITY.CRITICAL]: 'Critical'
    };
    return labels[priority] || priority;
  }

  static getPriorityColor(priority) {
    const colors = {
      [NOTIFICATION_PRIORITY.LOW]: '#6b7280',
      [NOTIFICATION_PRIORITY.NORMAL]: '#3b82f6',
      [NOTIFICATION_PRIORITY.HIGH]: '#f59e0b',
      [NOTIFICATION_PRIORITY.URGENT]: '#ef4444',
      [NOTIFICATION_PRIORITY.CRITICAL]: '#dc2626'
    };
    return colors[priority] || '#6b7280';
  }

  static getPriorityWeight(priority) {
    const weights = {
      [NOTIFICATION_PRIORITY.LOW]: 1,
      [NOTIFICATION_PRIORITY.NORMAL]: 2,
      [NOTIFICATION_PRIORITY.HIGH]: 3,
      [NOTIFICATION_PRIORITY.URGENT]: 4,
      [NOTIFICATION_PRIORITY.CRITICAL]: 5
    };
    return weights[priority] || 2;
  }

  // Status Helpers
  static getStatusLabel(status) {
    const labels = {
      [NOTIFICATION_STATUS.PENDING]: 'Pending',
      [NOTIFICATION_STATUS.SENT]: 'Sent',
      [NOTIFICATION_STATUS.DELIVERED]: 'Delivered',
      [NOTIFICATION_STATUS.FAILED]: 'Failed',
      [NOTIFICATION_STATUS.EXPIRED]: 'Expired'
    };
    return labels[status] || status;
  }

  static getStatusColor(status) {
    const colors = {
      [NOTIFICATION_STATUS.PENDING]: '#f59e0b',
      [NOTIFICATION_STATUS.SENT]: '#3b82f6',
      [NOTIFICATION_STATUS.DELIVERED]: '#10b981',
      [NOTIFICATION_STATUS.FAILED]: '#ef4444',
      [NOTIFICATION_STATUS.EXPIRED]: '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  // Read Status Helpers
  static getReadStatusLabel(status) {
    const labels = {
      [READ_STATUS.UNREAD]: 'Unread',
      [READ_STATUS.READ]: 'Read',
      [READ_STATUS.ARCHIVED]: 'Archived'
    };
    return labels[status] || status;
  }

  // Category Helpers
  static getCategoryLabel(category) {
    const labels = {
      [NOTIFICATION_CATEGORY.AUTHENTICATION]: 'Authentication',
      [NOTIFICATION_CATEGORY.EMPLOYEE]: 'Employee',
      [NOTIFICATION_CATEGORY.ATTENDANCE]: 'Attendance',
      [NOTIFICATION_CATEGORY.TASK]: 'Task',
      [NOTIFICATION_CATEGORY.PROJECT]: 'Project',
      [NOTIFICATION_CATEGORY.MEETING]: 'Meeting',
      [NOTIFICATION_CATEGORY.KPI]: 'KPI',
      [NOTIFICATION_CATEGORY.PERFORMANCE]: 'Performance',
      [NOTIFICATION_CATEGORY.EXECUTIVE]: 'Executive',
      [NOTIFICATION_CATEGORY.REPORT]: 'Report',
      [NOTIFICATION_CATEGORY.SYSTEM]: 'System',
      [NOTIFICATION_CATEGORY.SECURITY]: 'Security',
      [NOTIFICATION_CATEGORY.COMPLIANCE]: 'Compliance',
      [NOTIFICATION_CATEGORY.HR]: 'HR',
      [NOTIFICATION_CATEGORY.FINANCE]: 'Finance',
      [NOTIFICATION_CATEGORY.IT]: 'IT',
      [NOTIFICATION_CATEGORY.OPERATIONS]: 'Operations'
    };
    return labels[category] || category;
  }

  static getCategoryIcon(category) {
    const icons = {
      [NOTIFICATION_CATEGORY.AUTHENTICATION]: 'lock',
      [NOTIFICATION_CATEGORY.EMPLOYEE]: 'users',
      [NOTIFICATION_CATEGORY.ATTENDANCE]: 'clock',
      [NOTIFICATION_CATEGORY.TASK]: 'check-square',
      [NOTIFICATION_CATEGORY.PROJECT]: 'folder',
      [NOTIFICATION_CATEGORY.MEETING]: 'calendar',
      [NOTIFICATION_CATEGORY.KPI]: 'bar-chart',
      [NOTIFICATION_CATEGORY.PERFORMANCE]: 'trending-up',
      [NOTIFICATION_CATEGORY.EXECUTIVE]: 'briefcase',
      [NOTIFICATION_CATEGORY.REPORT]: 'file-text',
      [NOTIFICATION_CATEGORY.SYSTEM]: 'settings',
      [NOTIFICATION_CATEGORY.SECURITY]: 'shield',
      [NOTIFICATION_CATEGORY.COMPLIANCE]: 'file-check',
      [NOTIFICATION_CATEGORY.HR]: 'heart',
      [NOTIFICATION_CATEGORY.FINANCE]: 'dollar-sign',
      [NOTIFICATION_CATEGORY.IT]: 'server',
      [NOTIFICATION_CATEGORY.OPERATIONS]: 'cog'
    };
    return icons[category] || 'bell';
  }

  // Digest Frequency Helpers
  static getDigestFrequencyLabel(frequency) {
    const labels = {
      [DIGEST_FREQUENCY.IMMEDIATE]: 'Immediate',
      [DIGEST_FREQUENCY.HOURLY]: 'Hourly',
      [DIGEST_FREQUENCY.DAILY]: 'Daily',
      [DIGEST_FREQUENCY.WEEKLY]: 'Weekly',
      [DIGEST_FREQUENCY.MONTHLY]: 'Monthly',
      [DIGEST_FREQUENCY.NEVER]: 'Never'
    };
    return labels[frequency] || frequency;
  }

  static getDigestFrequencyMinutes(frequency) {
    const minutes = {
      [DIGEST_FREQUENCY.IMMEDIATE]: 0,
      [DIGEST_FREQUENCY.HOURLY]: 60,
      [DIGEST_FREQUENCY.DAILY]: 1440,
      [DIGEST_FREQUENCY.WEEKLY]: 10080,
      [DIGEST_FREQUENCY.MONTHLY]: 43200,
      [DIGEST_FREQUENCY.NEVER]: null
    };
    return minutes[frequency] || 0;
  }

  // Mute Duration Helpers
  static getMuteDurationLabel(duration) {
    const labels = {
      [MUTE_DURATION.ONE_HOUR]: '1 Hour',
      [MUTE_DURATION.SIX_HOURS]: '6 Hours',
      [MUTE_DURATION.TWELVE_HOURS]: '12 Hours',
      [MUTE_DURATION.ONE_DAY]: '1 Day',
      [MUTE_DURATION.ONE_WEEK]: '1 Week',
      [MUTE_DURATION.PERMANENT]: 'Permanent'
    };
    return labels[duration] || duration;
  }

  static getMuteDurationMilliseconds(duration) {
    const milliseconds = {
      [MUTE_DURATION.ONE_HOUR]: 60 * 60 * 1000,
      [MUTE_DURATION.SIX_HOURS]: 6 * 60 * 60 * 1000,
      [MUTE_DURATION.TWELVE_HOURS]: 12 * 60 * 60 * 1000,
      [MUTE_DURATION.ONE_DAY]: 24 * 60 * 60 * 1000,
      [MUTE_DURATION.ONE_WEEK]: 7 * 24 * 60 * 60 * 1000,
      [MUTE_DURATION.PERMANENT]: null
    };
    return milliseconds[duration] || null;
  }

  // Audit Action Helpers
  static getAuditActionLabel(action) {
    const labels = {
      [AUDIT_ACTION.CREATE]: 'Create',
      [AUDIT_ACTION.READ]: 'Read',
      [AUDIT_ACTION.UPDATE]: 'Update',
      [AUDIT_ACTION.DELETE]: 'Delete',
      [AUDIT_ACTION.LOGIN]: 'Login',
      [AUDIT_ACTION.LOGOUT]: 'Logout',
      [AUDIT_ACTION.EXPORT]: 'Export',
      [AUDIT_ACTION.IMPORT]: 'Import',
      [AUDIT_ACTION.APPROVE]: 'Approve',
      [AUDIT_ACTION.REJECT]: 'Reject',
      [AUDIT_ACTION.ARCHIVE]: 'Archive',
      [AUDIT_ACTION.RESTORE]: 'Restore',
      [AUDIT_ACTION.BULK_CREATE]: 'Bulk Create',
      [AUDIT_ACTION.BULK_UPDATE]: 'Bulk Update',
      [AUDIT_ACTION.BULK_DELETE]: 'Bulk Delete'
    };
    return labels[action] || action;
  }

  // Activity Type Helpers
  static getActivityTypeLabel(type) {
    const labels = {
      [ACTIVITY_TYPE.LOGIN]: 'Login',
      [ACTIVITY_TYPE.LOGOUT]: 'Logout',
      [ACTIVITY_TYPE.ATTENDANCE_CHECK_IN]: 'Check In',
      [ACTIVITY_TYPE.ATTENDANCE_CHECK_OUT]: 'Check Out',
      [ACTIVITY_TYPE.TASK_CREATED]: 'Task Created',
      [ACTIVITY_TYPE.TASK_COMPLETED]: 'Task Completed',
      [ACTIVITY_TYPE.PROJECT_CREATED]: 'Project Created',
      [ACTIVITY_TYPE.PROJECT_COMPLETED]: 'Project Completed',
      [ACTIVITY_TYPE.MEETING_SCHEDULED]: 'Meeting Scheduled',
      [ACTIVITY_TYPE.MEETING_COMPLETED]: 'Meeting Completed',
      [ACTIVITY_TYPE.KPI_SUBMITTED]: 'KPI Submitted',
      [ACTIVITY_TYPE.KPI_APPROVED]: 'KPI Approved',
      [ACTIVITY_TYPE.REPORT_GENERATED]: 'Report Generated',
      [ACTIVITY_TYPE.PROFILE_UPDATED]: 'Profile Updated',
      [ACTIVITY_TYPE.SETTINGS_CHANGED]: 'Settings Changed',
      [ACTIVITY_TYPE.NOTIFICATION_SENT]: 'Notification Sent',
      [ACTIVITY_TYPE.SYSTEM_EVENT]: 'System Event'
    };
    return labels[type] || type;
  }

  static getActivityTypeIcon(type) {
    const icons = {
      [ACTIVITY_TYPE.LOGIN]: 'log-in',
      [ACTIVITY_TYPE.LOGOUT]: 'log-out',
      [ACTIVITY_TYPE.ATTENDANCE_CHECK_IN]: 'clock',
      [ACTIVITY_TYPE.ATTENDANCE_CHECK_OUT]: 'clock',
      [ACTIVITY_TYPE.TASK_CREATED]: 'plus-square',
      [ACTIVITY_TYPE.TASK_COMPLETED]: 'check-square',
      [ACTIVITY_TYPE.PROJECT_CREATED]: 'folder-plus',
      [ACTIVITY_TYPE.PROJECT_COMPLETED]: 'folder-check',
      [ACTIVITY_TYPE.MEETING_SCHEDULED]: 'calendar-plus',
      [ACTIVITY_TYPE.MEETING_COMPLETED]: 'calendar-check',
      [ACTIVITY_TYPE.KPI_SUBMITTED]: 'file-plus',
      [ACTIVITY_TYPE.KPI_APPROVED]: 'file-check',
      [ACTIVITY_TYPE.REPORT_GENERATED]: 'file-text',
      [ACTIVITY_TYPE.PROFILE_UPDATED]: 'user',
      [ACTIVITY_TYPE.SETTINGS_CHANGED]: 'settings',
      [ACTIVITY_TYPE.NOTIFICATION_SENT]: 'bell',
      [ACTIVITY_TYPE.SYSTEM_EVENT]: 'server'
    };
    return icons[type] || 'activity';
  }

  // Notification Formatting
  static formatNotification(notification) {
    return {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      typeLabel: this.getNotificationTypeLabel(notification.type),
      typeColor: this.getNotificationTypeColor(notification.type),
      priority: notification.priority,
      priorityLabel: this.getPriorityLabel(notification.priority),
      priorityColor: this.getPriorityColor(notification.priority),
      category: notification.category,
      categoryLabel: this.getCategoryLabel(notification.category),
      categoryIcon: this.getCategoryIcon(notification.category),
      sender: notification.sender,
      senderName: notification.senderName,
      recipient: notification.recipient,
      recipientName: notification.recipientName,
      readStatus: notification.readStatus,
      readStatusLabel: this.getReadStatusLabel(notification.readStatus),
      readAt: notification.readAt,
      status: notification.status,
      statusLabel: this.getStatusLabel(notification.status),
      statusColor: this.getStatusColor(notification.status),
      delivered: notification.delivered,
      deliveredAt: notification.deliveredAt,
      scheduledAt: notification.scheduledAt,
      expiredAt: notification.expiredAt,
      channels: notification.channels,
      attachments: notification.attachments,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    };
  }

  static formatNotificationList(notifications) {
    return notifications.map(notification => this.formatNotification(notification));
  }

  // Audit Log Formatting
  static formatAuditLog(auditLog) {
    return {
      id: auditLog._id,
      module: auditLog.module,
      action: auditLog.action,
      actionLabel: this.getAuditActionLabel(auditLog.action),
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      oldData: auditLog.oldData,
      newData: auditLog.newData,
      changes: auditLog.changes,
      performedBy: auditLog.performedBy,
      performedByName: auditLog.performedByName,
      performedByEmail: auditLog.performedByEmail,
      performedByRole: auditLog.performedByRole,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      device: auditLog.device,
      location: auditLog.location,
      sessionId: auditLog.sessionId,
      timestamp: auditLog.timestamp,
      context: auditLog.context,
      impact: auditLog.impact,
      relatedEntities: auditLog.relatedEntities,
      status: auditLog.status,
      error: auditLog.error
    };
  }

  static formatAuditLogList(auditLogs) {
    return auditLogs.map(auditLog => this.formatAuditLog(auditLog));
  }

  // Activity Log Formatting
  static formatActivityLog(activityLog) {
    return {
      id: activityLog._id,
      user: activityLog.user,
      userName: activityLog.userName,
      userEmail: activityLog.userEmail,
      userRole: activityLog.userRole,
      type: activityLog.type,
      typeLabel: this.getActivityTypeLabel(activityLog.type),
      typeIcon: this.getActivityTypeIcon(activityLog.type),
      module: activityLog.module,
      title: activityLog.title,
      description: activityLog.description,
      entity: activityLog.entity,
      entityId: activityLog.entityId,
      data: activityLog.data,
      ipAddress: activityLog.ipAddress,
      userAgent: activityLog.userAgent,
      device: activityLog.device,
      location: activityLog.location,
      sessionId: activityLog.sessionId,
      timestamp: activityLog.timestamp,
      context: activityLog.context,
      tags: activityLog.tags,
      status: activityLog.status,
      duration: activityLog.duration,
      result: activityLog.result,
      error: activityLog.error
    };
  }

  static formatActivityLogList(activityLogs) {
    return activityLogs.map(activityLog => this.formatActivityLog(activityLog));
  }

  // Notification Preference Formatting
  static formatNotificationPreference(preference) {
    return {
      id: preference._id,
      user: preference.user,
      email: preference.email,
      sms: preference.sms,
      push: preference.push,
      inApp: preference.inApp,
      whatsapp: preference.whatsapp,
      slack: preference.slack,
      teams: preference.teams,
      discord: preference.discord,
      isMuted: preference.isMuted,
      muteDuration: preference.muteDuration,
      muteDurationLabel: preference.muteDuration ? this.getMuteDurationLabel(preference.muteDuration) : null,
      muteStart: preference.muteStart,
      muteEnd: preference.muteEnd,
      quietHoursEnabled: preference.quietHoursEnabled,
      quietHoursStart: preference.quietHoursStart,
      quietHoursEnd: preference.quietHoursEnd,
      quietHoursTimezone: preference.quietHoursTimezone,
      digestFrequency: preference.digestFrequency,
      digestFrequencyLabel: this.getDigestFrequencyLabel(preference.digestFrequency),
      digestCategories: preference.digestCategories,
      language: preference.language,
      categoryPreferences: preference.categoryPreferences,
      priorityPreferences: preference.priorityPreferences,
      deviceTokens: preference.deviceTokens,
      emailSettings: preference.emailSettings,
      smsSettings: preference.smsSettings,
      createdAt: preference.createdAt,
      updatedAt: preference.updatedAt
    };
  }

  // Channel Validation
  static isValidChannel(channel) {
    const validChannels = ['email', 'sms', 'push', 'in_app', 'whatsapp', 'slack', 'teams', 'discord'];
    return validChannels.includes(channel);
  }

  // Quiet Hours Check
  static isQuietHours(preferences, currentTime = new Date()) {
    if (!preferences.quietHoursEnabled) return false;
    
    const startHour = parseInt(preferences.quietHoursStart.split(':')[0]);
    const endHour = parseInt(preferences.quietHoursEnd.split(':')[0]);
    const currentHour = currentTime.getHours();
    
    if (startHour < endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  // Mute Check
  static isMuted(preferences, currentTime = new Date()) {
    if (!preferences.isMuted) return false;
    if (!preferences.muteStart || !preferences.muteEnd) return false;
    
    return currentTime >= preferences.muteStart && currentTime <= preferences.muteEnd;
  }

  // Notification Priority Check
  static shouldBypassMute(notification, preferences) {
    const criticalPriorities = [NOTIFICATION_PRIORITY.URGENT, NOTIFICATION_PRIORITY.CRITICAL];
    return criticalPriorities.includes(notification.priority);
  }

  // Digest Check
  static shouldDigest(notification, preferences) {
    if (preferences.digestFrequency === DIGEST_FREQUENCY.IMMEDIATE) return false;
    if (preferences.digestCategories && preferences.digestCategories.length > 0) {
      return preferences.digestCategories.includes(notification.category);
    }
    return true;
  }

  // Channel Selection
  static selectChannels(notification, preferences) {
    if (this.isMuted(preferences) && !this.shouldBypassMute(notification, preferences)) {
      return ['in_app']; // Only in-app during mute
    }

    const enabledChannels = [];
    const channels = ['email', 'sms', 'push', 'in_app', 'whatsapp', 'slack', 'teams', 'discord'];

    for (const channel of channels) {
      if (preferences[channel] && preferences[channel].enabled) {
        const channelSettings = preferences[channel];
        
        // Check category filter
        if (channelSettings.categories && channelSettings.categories.length > 0) {
          if (!channelSettings.categories.includes(notification.category)) continue;
        }
        
        // Check priority filter
        if (channelSettings.priority && channelSettings.priority.length > 0) {
          if (!channelSettings.priority.includes(notification.priority)) continue;
        }
        
        enabledChannels.push(channel);
      }
    }

    return enabledChannels.length > 0 ? enabledChannels : ['in_app'];
  }
}

export default NotificationHelpers;
