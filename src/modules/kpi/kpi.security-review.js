import Logger from '../../core/utils/logger.js';

class KPISecurityReview {
  constructor() {
    this.logger = Logger;
  }

  // Review RBAC implementation
  async reviewRBAC() {
    this.logger.info('Starting RBAC security review...');

    const review = {
      status: 'passed',
      findings: [],
      recommendations: []
    };

    // Check if permissions are defined
    try {
      const { KPI_PERMISSIONS, ROLE_PERMISSIONS } = await import('./kpi.permissions.js');
      
      review.findings.push({
        category: 'RBAC',
        status: 'passed',
        message: 'KPI permissions are properly defined',
        details: {
          totalPermissions: Object.keys(KPI_PERMISSIONS).length,
          rolesDefined: Object.keys(ROLE_PERMISSIONS).length
        }
      });

      // Verify critical permissions exist
      const criticalPermissions = [
        'KPI_VIEW_ALL',
        'KPI_MANAGE',
        'KPI_HR',
        'KPI_EXECUTIVE',
        'PERFORMANCE_VIEW_ALL',
        'PERFORMANCE_MANAGE',
        'APPRAISAL_VIEW_ALL',
        'APPRAISAL_MANAGE',
        'REWARD_VIEW_ALL',
        'REWARD_MANAGE',
        'WARNING_VIEW_ALL',
        'WARNING_MANAGE'
      ];

      criticalPermissions.forEach(perm => {
        if (KPI_PERMISSIONS[perm]) {
          review.findings.push({
            category: 'RBAC',
            status: 'passed',
            message: `Critical permission ${perm} exists`
          });
        } else {
          review.findings.push({
            category: 'RBAC',
            status: 'warning',
            message: `Critical permission ${perm} is missing`
          });
          review.status = 'warning';
        }
      });

    } catch (error) {
      review.findings.push({
        category: 'RBAC',
        status: 'failed',
        message: 'Failed to load permissions file',
        error: error.message
      });
      review.status = 'failed';
    }

    return review;
  }

  // Review permission middleware usage
  async reviewPermissionMiddleware() {
    this.logger.info('Reviewing permission middleware usage...');

    const review = {
      status: 'passed',
      findings: [],
      recommendations: []
    };

    try {
      const fs = await import('fs');
      const routesContent = fs.readFileSync('d:/Own Project/EMS/ems-backend/src/modules/kpi/kpi.routes.js', 'utf8');
      
      // Check if requirePermission is used
      if (routesContent.includes('requirePermission')) {
        review.findings.push({
          category: 'Middleware',
          status: 'passed',
          message: 'Permission middleware is used in routes'
        });
      } else {
        review.findings.push({
          category: 'Middleware',
          status: 'warning',
          message: 'Permission middleware may not be properly applied to all routes'
        });
        review.recommendations.push({
          category: 'Middleware',
          message: 'Ensure all sensitive routes use requirePermission middleware'
        });
        review.status = 'warning';
      }

      // Check if authenticate is used
      if (routesContent.includes('authenticate')) {
        review.findings.push({
          category: 'Middleware',
          status: 'passed',
          message: 'Authentication middleware is used in routes'
        });
      } else {
        review.findings.push({
          category: 'Middleware',
          status: 'failed',
          message: 'Authentication middleware is missing from routes'
        });
        review.status = 'failed';
      }

    } catch (error) {
      review.findings.push({
        category: 'Middleware',
        status: 'failed',
        message: 'Failed to review middleware usage',
        error: error.message
      });
      review.status = 'failed';
    }

    return review;
  }

  // Review ownership validation
  async reviewOwnershipValidation() {
    this.logger.info('Reviewing ownership validation...');

    const review = {
      status: 'passed',
      findings: [],
      recommendations: []
    };

    try {
      const controllerContent = await this.readFile('d:/Own Project/EMS/ems-backend/src/modules/kpi/dashboard.controller.js');
      
      // Check for ownership validation patterns
      if (controllerContent.includes('req.user.userId !==') || 
          controllerContent.includes('req.user.userId === employeeId')) {
        review.findings.push({
          category: 'Ownership',
          status: 'passed',
          message: 'Ownership validation is implemented in controllers'
        });
      } else {
        review.findings.push({
          category: 'Ownership',
          status: 'warning',
          message: 'Ownership validation may be missing in some controllers'
        });
        review.recommendations.push({
          category: 'Ownership',
          message: 'Implement ownership validation for employee-specific data access'
        });
        review.status = 'warning';
      }

    } catch (error) {
      review.findings.push({
        category: 'Ownership',
        status: 'failed',
        message: 'Failed to review ownership validation',
        error: error.message
      });
      review.status = 'failed';
    }

    return review;
  }

  // Review input validation
  async reviewInputValidation() {
    this.logger.info('Reviewing input validation...');

    const review = {
      status: 'passed',
      findings: [],
      recommendations: []
    };

    try {
      const { validate, kpiValidation, goalValidation } = await import('./kpi.validation.js');
      
      review.findings.push({
        category: 'Validation',
        status: 'passed',
        message: 'Validation functions are defined'
      });

      // Check if validation is used in controllers
      const controllerContent = await this.readFile('d:/Own Project/EMS/ems-backend/src/modules/kpi/kpi.controller.js');
      
      if (controllerContent.includes('validate') || controllerContent.includes('kpiValidation')) {
        review.findings.push({
          category: 'Validation',
          status: 'passed',
          message: 'Validation is used in controllers'
        });
      } else {
        review.findings.push({
          category: 'Validation',
          status: 'warning',
          message: 'Validation may not be consistently applied in controllers'
        });
        review.recommendations.push({
          category: 'Validation',
          message: 'Ensure all input is validated before processing'
        });
        review.status = 'warning';
      }

    } catch (error) {
      review.findings.push({
        category: 'Validation',
        status: 'warning',
        message: 'Validation file may not exist or be properly configured',
        error: error.message
      });
      review.status = 'warning';
    }

    return review;
  }

  // Review soft delete implementation
  async reviewSoftDelete() {
    this.logger.info('Reviewing soft delete implementation...');

    const review = {
      status: 'passed',
      findings: [],
      recommendations: []
    };

    const models = [
      'kpi.model.js',
      'goal.model.js',
      'appraisal.model.js',
      'performance.model.js',
      'reward.model.js',
      'warning.model.js'
    ];

    for (const modelFile of models) {
      try {
        const modelContent = await this.readFile(`d:/Own Project/EMS/ems-backend/src/modules/kpi/${modelFile}`);
        
        if (modelContent.includes('isDeleted') && 
            modelContent.includes('deletedAt') && 
            modelContent.includes('deletedBy')) {
          review.findings.push({
            category: 'SoftDelete',
            status: 'passed',
            message: `Soft delete fields are present in ${modelFile}`
          });
        } else {
          review.findings.push({
            category: 'SoftDelete',
            status: 'warning',
            message: `Soft delete fields may be incomplete in ${modelFile}`
          });
          review.status = 'warning';
        }

      } catch (error) {
        review.findings.push({
          category: 'SoftDelete',
          status: 'warning',
          message: `Failed to review ${modelFile}`,
          error: error.message
        });
      }
    }

    return review;
  }

  // Review audit trail implementation
  async reviewAuditTrail() {
    this.logger.info('Reviewing audit trail implementation...');

    const review = {
      status: 'passed',
      findings: [],
      recommendations: []
    };

    const models = [
      'kpi.model.js',
      'goal.model.js',
      'appraisal.model.js',
      'performance.model.js',
      'reward.model.js',
      'warning.model.js'
    ];

    for (const modelFile of models) {
      try {
        const modelContent = await this.readFile(`d:/Own Project/EMS/ems-backend/src/modules/kpi/${modelFile}`);
        
        const auditFields = ['createdBy', 'updatedBy', 'createdAt', 'updatedAt'];
        const missingFields = auditFields.filter(field => !modelContent.includes(field));
        
        if (missingFields.length === 0) {
          review.findings.push({
            category: 'AuditTrail',
            status: 'passed',
            message: `All audit fields are present in ${modelFile}`
          });
        } else {
          review.findings.push({
            category: 'AuditTrail',
            status: 'warning',
            message: `Missing audit fields in ${modelFile}: ${missingFields.join(', ')}`
          });
          review.status = 'warning';
        }

      } catch (error) {
        review.findings.push({
          category: 'AuditTrail',
          status: 'warning',
          message: `Failed to review ${modelFile}`,
          error: error.message
        });
      }
    }

    return review;
  }

  // Review business rules implementation
  async reviewBusinessRules() {
    this.logger.info('Reviewing business rules implementation...');

    const review = {
      status: 'passed',
      findings: [],
      recommendations: []
    };

    try {
      const serviceFiles = [
        'kpi.service.js',
        'goal.service.js',
        'appraisal.service.js',
        'reward.service.js',
        'warning.service.js'
      ];

      for (const serviceFile of serviceFiles) {
        const serviceContent = await this.readFile(`d:/Own Project/EMS/ems-backend/src/modules/kpi/${serviceFile}`);
        
        // Check for business rule patterns
        const hasValidation = serviceContent.includes('validate') || serviceContent.includes('if (!');
        const hasErrorHandling = serviceContent.includes('throw new AppError') || serviceContent.includes('throw new Error');
        
        if (hasValidation && hasErrorHandling) {
          review.findings.push({
            category: 'BusinessRules',
            status: 'passed',
            message: `Business rules and error handling found in ${serviceFile}`
          });
        } else {
          review.findings.push({
            category: 'BusinessRules',
            status: 'warning',
            message: `Business rules may be incomplete in ${serviceFile}`
          });
          review.recommendations.push({
            category: 'BusinessRules',
            message: `Ensure comprehensive validation and error handling in ${serviceFile}`
          });
          review.status = 'warning';
        }
      }

    } catch (error) {
      review.findings.push({
        category: 'BusinessRules',
        status: 'failed',
        message: 'Failed to review business rules',
        error: error.message
      });
      review.status = 'failed';
    }

    return review;
  }

  // Review session validation
  async reviewSessionValidation() {
    this.logger.info('Reviewing session validation...');

    const review = {
      status: 'passed',
      findings: [],
      recommendations: []
    };

    try {
      const authMiddleware = await this.readFile('d:/Own Project/EMS/ems-backend/src/modules/auth/auth.middleware.js');
      
      if (authMiddleware.includes('authenticate')) {
        review.findings.push({
          category: 'Session',
          status: 'passed',
          message: 'Authentication middleware is implemented'
        });
      } else {
        review.findings.push({
          category: 'Session',
          status: 'warning',
          message: 'Authentication middleware may not be properly implemented'
        });
        review.status = 'warning';
      }

    } catch (error) {
      review.findings.push({
        category: 'Session',
        status: 'warning',
        message: 'Failed to review session validation',
        error: error.message
      });
      review.status = 'warning';
    }

    return review;
  }

  // Run complete security review
  async runCompleteSecurityReview() {
    this.logger.info('Running complete KPI module security review...');

    const reviews = await Promise.all([
      this.reviewRBAC(),
      this.reviewPermissionMiddleware(),
      this.reviewOwnershipValidation(),
      this.reviewInputValidation(),
      this.reviewSoftDelete(),
      this.reviewAuditTrail(),
      this.reviewBusinessRules(),
      this.reviewSessionValidation()
    ]);

    const overallStatus = reviews.some(r => r.status === 'failed') ? 'failed' 
                        : reviews.some(r => r.status === 'warning') ? 'warning' 
                        : 'passed';

    const allFindings = reviews.flatMap(r => r.findings);
    const allRecommendations = reviews.flatMap(r => r.recommendations);

    return {
      overallStatus,
      timestamp: new Date(),
      reviews: {
        rbac: reviews[0],
        permissionMiddleware: reviews[1],
        ownershipValidation: reviews[2],
        inputValidation: reviews[3],
        softDelete: reviews[4],
        auditTrail: reviews[5],
        businessRules: reviews[6],
        sessionValidation: reviews[7]
      },
      summary: {
        totalFindings: allFindings.length,
        passedFindings: allFindings.filter(f => f.status === 'passed').length,
        warningFindings: allFindings.filter(f => f.status === 'warning').length,
        failedFindings: allFindings.filter(f => f.status === 'failed').length,
        totalRecommendations: allRecommendations.length
      },
      findings: allFindings,
      recommendations: allRecommendations
    };
  }

  // Helper method to read file
  async readFile(filePath) {
    const fs = await import('fs');
    return fs.readFileSync(filePath, 'utf8');
  }
}

const kpiSecurityReview = new KPISecurityReview();
export default kpiSecurityReview;
