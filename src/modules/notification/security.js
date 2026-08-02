/**
 * Security Improvements for Notification Module
 * 
 * Comprehensive security measures for the Notification & Audit Foundation
 * Following enterprise security best practices
 */

class NotificationSecurity {
  /**
   * Security Validation Checklist
   */
  static getSecurityChecklist() {
    return {
      authentication: 'JWT validation implemented',
      authorization: 'RBAC permission middleware implemented',
      ownershipValidation: 'User ownership validation for notifications',
      inputValidation: 'Zod validation schemas for all inputs',
      outputSanitization: 'Sanitize sensitive data in responses',
      auditTrail: 'Comprehensive audit logging',
      sessionValidation: 'Session validation for sensitive operations',
      rateLimiting: 'Rate limiting for API endpoints',
      dataEncryption: 'Encryption at rest and in transit',
      ipWhitelisting: 'IP whitelisting for admin operations',
      sqlInjectionPrevention: 'NoSQL injection prevention',
      xssPrevention: 'XSS prevention in user content',
      csrfProtection: 'CSRF token validation',
      secureHeaders: 'Security headers implementation',
      logging: 'Security event logging',
      monitoring: 'Real-time security monitoring'
    };
  }

  /**
   * Input Validation Rules
   */
  static getInputValidationRules() {
    return {
      notification: {
        title: {
          maxLength: 200,
          minLength: 1,
          pattern: /^[a-zA-Z0-9\s\-_.,!?@#$%&*()]+$/,
          sanitize: true
        },
        message: {
          maxLength: 5000,
          minLength: 1,
          sanitize: true,
          stripHtml: true
        },
        recipient: {
          type: 'ObjectId',
          required: true,
          validate: true
        },
        priority: {
          enum: ['low', 'normal', 'high', 'urgent', 'critical'],
          default: 'normal'
        },
        category: {
          enum: ['task', 'approval', 'meeting', 'kpi', 'attendance', 'leave', 'performance', 'system', 'executive', 'security'],
          required: true
        },
        channels: {
          type: ['string'],
          enum: ['email', 'sms', 'push', 'in_app', 'whatsapp', 'slack', 'teams', 'discord'],
          validate: true
        }
      },
      auditLog: {
        module: {
          enum: ['authentication', 'employee', 'attendance', 'task', 'meeting', 'kpi', 'settings', 'executive'],
          required: true
        },
        action: {
          enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'bulk_create', 'bulk_update', 'bulk_delete'],
          required: true
        },
        entity: {
          type: 'string',
          maxLength: 100
        },
        entityId: {
          type: 'ObjectId',
          validate: true
        },
        ipAddress: {
          type: 'string',
          pattern: /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/,
          anonymize: true
        }
      },
      activityLog: {
        type: {
          enum: ['login', 'logout', 'attendance_check_in', 'attendance_check_out', 'task_created', 'task_completed', 'profile_updated', 'settings_changed'],
          required: true
        },
        module: {
          enum: ['authentication', 'employee', 'attendance', 'task', 'meeting', 'kpi', 'settings', 'executive'],
          required: true
        },
        title: {
          maxLength: 200,
          sanitize: true
        },
        description: {
          maxLength: 1000,
          sanitize: true,
          stripHtml: true
        }
      }
    };
  }

  /**
   * Output Sanitization Rules
   */
  static getOutputSanitizationRules() {
    return {
      notification: {
        excludeSensitiveFields: ['metadata.internal', 'metadata.system'],
        maskEmail: true,
        maskPhone: true,
        sanitizeHtml: true,
        limitFields: ['_id', 'recipient', 'title', 'message', 'priority', 'category', 'readStatus', 'createdAt']
      },
      auditLog: {
        excludeSensitiveFields: ['oldData.password', 'newData.password', 'oldData.token', 'newData.token'],
        maskEmail: true,
        maskPhone: true,
        limitFields: ['_id', 'module', 'action', 'entity', 'entityId', 'performedBy', 'performedByName', 'timestamp', 'status']
      },
      activityLog: {
        excludeSensitiveFields: ['data.password', 'data.token', 'data.ssn'],
        maskEmail: true,
        maskPhone: true,
        limitFields: ['_id', 'user', 'userName', 'type', 'module', 'title', 'timestamp', 'status']
      }
    };
  }

  /**
   * Ownership Validation Rules
   */
  static getOwnershipValidationRules() {
    return {
      notification: {
        read: 'User can only read their own notifications',
        update: 'User can only update their own notifications',
        delete: 'User can only delete their own notifications',
        admin: 'Admin can access all notifications',
        manager: 'Manager can access department notifications'
      },
      auditLog: {
        read: 'Users can read audit logs based on permissions',
        admin: 'Admin can access all audit logs',
        manager: 'Manager can access department audit logs'
      },
      activityLog: {
        read: 'Users can read their own activity logs',
        admin: 'Admin can access all activity logs',
        manager: 'Manager can access department activity logs'
      }
    };
  }

  /**
   * Rate Limiting Rules
   */
  static getRateLimitingRules() {
    return {
      notification: {
        create: { windowMs: 60000, max: 100 },
        bulkCreate: { windowMs: 60000, max: 10 },
        read: { windowMs: 60000, max: 1000 },
        update: { windowMs: 60000, max: 200 },
        delete: { windowMs: 60000, max: 50 }
      },
      audit: {
        create: { windowMs: 60000, max: 500 },
        read: { windowMs: 60000, max: 1000 },
        export: { windowMs: 600000, max: 5 }
      },
      activity: {
        create: { windowMs: 60000, max: 500 },
        read: { windowMs: 60000, max: 1000 },
        export: { windowMs: 600000, max: 5 }
      },
      dashboard: {
        read: { windowMs: 60000, max: 300 },
        analytics: { windowMs: 60000, max: 100 }
      }
    };
  }

  /**
   * Data Encryption Rules
   */
  static getDataEncryptionRules() {
    return {
      atRest: {
        encryption: 'AES-256',
        fields: ['metadata.sensitive', 'oldData.password', 'newData.password'],
        keyRotation: '90 days'
      },
      inTransit: {
        protocol: 'TLS 1.3',
        certificate: 'Valid SSL certificate'
      },
      hashing: {
        algorithm: 'SHA-256',
        fields: ['ipAddress', 'sessionId']
      }
    };
  }

  /**
   * Audit Trail Rules
   */
  static getAuditTrailRules() {
    return {
      logAllOperations: true,
      logReadAccess: true,
      logWriteAccess: true,
      logFailedAttempts: true,
      logPermissionDenials: true,
      logDataAccess: true,
      logExportOperations: true,
      logAdminOperations: true,
      retentionPeriod: '2 years',
      immutable: true,
      signed: true
    };
  }

  /**
   * Session Validation Rules
   */
  static getSessionValidationRules() {
    return {
      validateSession: true,
      checkSessionExpiry: true,
      checkSessionIP: true,
      checkSessionUserAgent: true,
      invalidateOnPasswordChange: true,
      invalidateOnRoleChange: true,
      sessionTimeout: '30 minutes',
      absoluteTimeout: '8 hours',
      concurrentSessions: 3
    };
  }

  /**
   * Security Headers
   */
  static getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * IP Whitelisting Rules
   */
  static getIPWhitelistingRules() {
    return {
      adminOperations: true,
      exportOperations: true,
      bulkOperations: true,
      whitelist: ['192.168.1.0/24', '10.0.0.0/8'],
      blacklist: ['0.0.0.0/8', '169.254.0.0/16'],
      rateLimitExceeded: true,
      suspiciousActivity: true
    };
  }

  /**
   * NoSQL Injection Prevention
   */
  static getNoSQLInjectionPrevention() {
    return {
      validateInput: true,
      sanitizeInput: true,
      useParameterizedQueries: true,
      avoidEval: true,
      avoidFunctionConstructor: true,
      validateObjectIds: true,
      limitQueryDepth: true,
      useSchemaValidation: true
    };
  }

  /**
   * XSS Prevention
   */
  static getXSSPrevention() {
    return {
      sanitizeUserInput: true,
      encodeOutput: true,
      useContentSecurityPolicy: true,
      disableInlineScripts: true,
      validateHtml: true,
      stripDangerousTags: true,
      useDOMPurify: true,
      escapeSpecialChars: true
    };
  }

  /**
   * CSRF Protection
   */
  static getCSRFProtection() {
    return {
      useCSRFToken: true,
      validateToken: true,
      tokenExpiry: '1 hour',
      tokenRefresh: true,
      sameSite: 'strict',
      secure: true
    };
  }

  /**
   * Security Event Logging
   */
  static getSecurityEventLogging() {
    return {
      logFailedLogins: true,
      logSuccessfulLogins: true,
      logPermissionDenials: true,
      logDataAccess: true,
      logExportOperations: true,
      logAdminOperations: true,
      logBulkOperations: true,
      logRateLimitExceeded: true,
      logSuspiciousActivity: true,
      logIPBlacklistHits: true,
      logSessionHijackingAttempts: true
    };
  }

  /**
   * Real-time Security Monitoring
   */
  static getSecurityMonitoring() {
    return {
      monitorFailedLogins: true,
      monitorPermissionDenials: true,
      monitorDataAccess: true,
      monitorBulkOperations: true,
      monitorExportOperations: true,
      monitorAdminOperations: true,
      alertOnAnomalies: true,
      alertOnThresholds: true,
      alertOnBlacklistHits: true,
      alertOnSuspiciousPatterns: true,
      realTimeAlerts: true
    };
  }

  /**
   * Data Retention Policy
   */
  static getDataRetentionPolicy() {
    return {
      notifications: '2 years',
      auditLogs: '2 years',
      activityLogs: '1 year',
      preferences: 'Indefinite',
      archivedData: '5 years',
      complianceData: '7 years',
      autoDelete: true,
      manualArchive: true
    };
  }

  /**
   * Compliance Requirements
   */
  static getComplianceRequirements() {
    return {
      GDPR: {
        dataMinimization: true,
        rightToAccess: true,
        rightToErasure: true,
        dataPortability: true,
        consentManagement: true,
        breachNotification: true
      },
      SOC2: {
        accessControl: true,
        auditTrail: true,
        dataEncryption: true,
        changeManagement: true,
        incidentResponse: true
      },
      HIPAA: {
        phiProtection: true,
        accessControl: true,
        auditTrail: true,
        businessAssociateAgreement: true,
        breachNotification: true
      }
    };
  }

  /**
   * Security Best Practices
   */
  static getSecurityBestPractices() {
    return {
      principleOfLeastPrivilege: 'Users have minimum required permissions',
      defenseInDepth: 'Multiple layers of security',
      failSecure: 'System fails in secure state',
      secureByDefault: 'Default configurations are secure',
      minimalAttackSurface: 'Reduce exposed functionality',
      regularUpdates: 'Keep dependencies updated',
      securityTraining: 'Regular security awareness training',
      penetrationTesting: 'Regular penetration testing',
      codeReview: 'Security-focused code review',
      incidentResponse: 'Documented incident response plan',
      disasterRecovery: 'Backup and recovery procedures'
    };
  }

  /**
   * Security Metrics
   */
  static getSecurityMetrics() {
    return {
      failedLoginAttempts: 'Track failed login attempts',
      permissionDenials: 'Track permission denials',
      dataAccessViolations: 'Track data access violations',
      suspiciousActivities: 'Track suspicious activities',
      securityIncidents: 'Track security incidents',
      falsePositives: 'Track false positive alerts',
      responseTime: 'Track security alert response time',
      remediationTime: 'Track security issue remediation time'
    };
  }
}

export default NotificationSecurity;
