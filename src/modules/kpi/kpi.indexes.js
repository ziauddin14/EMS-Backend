import Logger from '../../core/utils/logger.js';

class KPIIndexes {
  constructor() {
    this.logger = Logger;
  }

  // Create optimized indexes for KPI collection
  async createKPIIndexes() {
    const KPI = (await import('./kpi.model.js')).default;
    
    const indexes = [
      // Single field indexes
      { key: { employee: 1 }, options: { name: 'idx_employee' } },
      { key: { department: 1 }, options: { name: 'idx_department' } },
      { key: { designation: 1 }, options: { name: 'idx_designation' } },
      { key: { reportingManager: 1 }, options: { name: 'idx_reportingManager' } },
      { key: { year: 1 }, options: { name: 'idx_year' } },
      { key: { month: 1 }, options: { name: 'idx_month' } },
      { key: { quarter: 1 }, options: { name: 'idx_quarter' } },
      { key: { evaluationPeriod: 1 }, options: { name: 'idx_evaluationPeriod' } },
      { key: { overallScore: 1 }, options: { name: 'idx_overallScore' } },
      { key: { performanceGrade: 1 }, options: { name: 'idx_performanceGrade' } },
      { key: { performanceStatus: 1 }, options: { name: 'idx_performanceStatus' } },
      { key: { status: 1 }, options: { name: 'idx_status' } },
      { key: { approvalStatus: 1 }, options: { name: 'idx_approvalStatus' } },
      { key: { isDeleted: 1 }, options: { name: 'idx_isDeleted' } },
      { key: { createdAt: 1 }, options: { name: 'idx_createdAt' } },
      { key: { updatedAt: 1 }, options: { name: 'idx_updatedAt' } },
      
      // Compound indexes for common query patterns
      { key: { employee: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_employee_year_deleted' } },
      { key: { employee: 1, year: 1, month: 1, isDeleted: 1 }, options: { name: 'idx_employee_year_month_deleted' } },
      { key: { employee: 1, year: 1, quarter: 1, isDeleted: 1 }, options: { name: 'idx_employee_year_quarter_deleted' } },
      { key: { department: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_department_year_deleted' } },
      { key: { department: 1, year: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_department_year_status_deleted' } },
      { key: { reportingManager: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_manager_year_deleted' } },
      { key: { year: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_year_status_deleted' } },
      { key: { year: 1, approvalStatus: 1, isDeleted: 1 }, options: { name: 'idx_year_approvalStatus_deleted' } },
      { key: { year: 1, performanceGrade: 1, isDeleted: 1 }, options: { name: 'idx_year_grade_deleted' } },
      { key: { year: 1, overallScore: -1, isDeleted: 1 }, options: { name: 'idx_year_score_deleted' } },
      { key: { department: 1, year: 1, overallScore: -1, isDeleted: 1 }, options: { name: 'idx_dept_year_score_deleted' } },
      { key: { startDate: 1, endDate: 1, isDeleted: 1 }, options: { name: 'idx_dateRange_deleted' } },
      { key: { createdAt: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_createdAt_status_deleted' } },
      
      // Sparse indexes for optional fields
      { key: { project: 1 }, options: { name: 'idx_project', sparse: true } },
      { key: { team: 1 }, options: { name: 'idx_team', sparse: true } },
      
      // TTL index for archived records (optional - 2 years)
      { key: { archivedAt: 1 }, options: { name: 'idx_archivedAt_ttl', expireAfterSeconds: 63072000, sparse: true } }
    ];

    for (const index of indexes) {
      try {
        await KPI.collection.createIndex(index.key, index.options);
        this.logger.info(`Created index: ${index.options.name}`);
      } catch (error) {
        if (error.code !== 85) { // Ignore duplicate index error
          this.logger.error(`Failed to create index ${index.options.name}:`, error);
        }
      }
    }
  }

  // Create optimized indexes for Goal collection
  async createGoalIndexes() {
    const Goal = (await import('./goal.model.js')).default;
    
    const indexes = [
      // Single field indexes
      { key: { owner: 1 }, options: { name: 'idx_goal_owner' } },
      { key: { department: 1 }, options: { name: 'idx_goal_department' } },
      { key: { project: 1 }, options: { name: 'idx_goal_project' } },
      { key: { reviewer: 1 }, options: { name: 'idx_goal_reviewer' } },
      { key: { reportingManager: 1 }, options: { name: 'idx_goal_manager' } },
      { key: { type: 1 }, options: { name: 'idx_goal_type' } },
      { key: { priority: 1 }, options: { name: 'idx_goal_priority' } },
      { key: { status: 1 }, options: { name: 'idx_goal_status' } },
      { key: { approvalStatus: 1 }, options: { name: 'idx_goal_approvalStatus' } },
      { key: { dueDate: 1 }, options: { name: 'idx_goal_dueDate' } },
      { key: { startDate: 1 }, options: { name: 'idx_goal_startDate' } },
      { key: { isDeleted: 1 }, options: { name: 'idx_goal_isDeleted' } },
      { key: { createdAt: 1 }, options: { name: 'idx_goal_createdAt' } },
      
      // Compound indexes
      { key: { owner: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_goal_owner_status_deleted' } },
      { key: { department: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_goal_dept_status_deleted' } },
      { key: { reviewer: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_goal_reviewer_status_deleted' } },
      { key: { project: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_goal_project_status_deleted' } },
      { key: { owner: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_goal_owner_year_deleted' } },
      { key: { department: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_goal_dept_year_deleted' } },
      { key: { dueDate: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_goal_dueDate_status_deleted' } },
      { key: { status: 1, priority: 1, isDeleted: 1 }, options: { name: 'idx_goal_status_priority_deleted' } },
      { key: { parentGoal: 1, isDeleted: 1 }, options: { name: 'idx_goal_parent_deleted' } },
      { key: { createdAt: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_goal_created_status_deleted' } },
      
      // Sparse indexes
      { key: { team: 1 }, options: { name: 'idx_goal_team', sparse: true } }
    ];

    for (const index of indexes) {
      try {
        await Goal.collection.createIndex(index.key, index.options);
        this.logger.info(`Created index: ${index.options.name}`);
      } catch (error) {
        if (error.code !== 85) {
          this.logger.error(`Failed to create index ${index.options.name}:`, error);
        }
      }
    }
  }

  // Create optimized indexes for Performance collection
  async createPerformanceIndexes() {
    const Performance = (await import('./performance.model.js')).default;
    
    const indexes = [
      // Single field indexes
      { key: { employee: 1 }, options: { name: 'idx_perf_employee' } },
      { key: { department: 1 }, options: { name: 'idx_perf_department' } },
      { key: { designation: 1 }, options: { name: 'idx_perf_designation' } },
      { key: { reportingManager: 1 }, options: { name: 'idx_perf_manager' } },
      { key: { periodType: 1 }, options: { name: 'idx_perf_periodType' } },
      { key: { year: 1 }, options: { name: 'idx_perf_year' } },
      { key: { month: 1 }, options: { name: 'idx_perf_month' } },
      { key: { quarter: 1 }, options: { name: 'idx_perf_quarter' } },
      { key: { promotionEligible: 1 }, options: { name: 'idx_perf_promotionEligible' } },
      { key: { bonusEligible: 1 }, options: { name: 'idx_perf_bonusEligible' } },
      { key: { appraisalEligible: 1 }, options: { name: 'idx_perf_appraisalEligible' } },
      { key: { approvalStatus: 1 }, options: { name: 'idx_perf_approvalStatus' } },
      { key: { isDeleted: 1 }, options: { name: 'idx_perf_isDeleted' } },
      { key: { createdAt: 1 }, options: { name: 'idx_perf_createdAt' } },
      
      // Compound indexes
      { key: { employee: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_perf_employee_year_deleted' } },
      { key: { employee: 1, year: 1, periodType: 1, isDeleted: 1 }, options: { name: 'idx_perf_employee_year_period_deleted' } },
      { key: { department: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_perf_dept_year_deleted' } },
      { key: { department: 1, year: 1, approvalStatus: 1, isDeleted: 1 }, options: { name: 'idx_perf_dept_year_approval_deleted' } },
      { key: { reportingManager: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_perf_manager_year_deleted' } },
      { key: { designation: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_perf_desig_year_deleted' } },
      { key: { year: 1, approvalStatus: 1, isDeleted: 1 }, options: { name: 'idx_perf_year_approval_deleted' } },
      { key: { year: 1, promotionEligible: 1, isDeleted: 1 }, options: { name: 'idx_perf_year_promotion_deleted' } },
      { key: { year: 1, bonusEligible: 1, isDeleted: 1 }, options: { name: 'idx_perf_year_bonus_deleted' } },
      { key: { 'yearlyPerformance.overallScore': -1, year: 1, isDeleted: 1 }, options: { name: 'idx_perf_score_year_deleted' } },
      { key: { department: 1, 'yearlyPerformance.overallScore': -1, year: 1, isDeleted: 1 }, options: { name: 'idx_perf_dept_score_year_deleted' } },
      { key: { createdAt: 1, approvalStatus: 1, isDeleted: 1 }, options: { name: 'idx_perf_created_approval_deleted' } }
    ];

    for (const index of indexes) {
      try {
        await Performance.collection.createIndex(index.key, index.options);
        this.logger.info(`Created index: ${index.options.name}`);
      } catch (error) {
        if (error.code !== 85) {
          this.logger.error(`Failed to create index ${index.options.name}:`, error);
        }
      }
    }
  }

  // Create optimized indexes for Appraisal collection
  async createAppraisalIndexes() {
    const Appraisal = (await import('./appraisal.model.js')).default;
    
    const indexes = [
      // Single field indexes
      { key: { employee: 1 }, options: { name: 'idx_appraisal_employee' } },
      { key: { department: 1 }, options: { name: 'idx_appraisal_department' } },
      { key: { designation: 1 }, options: { name: 'idx_appraisal_designation' } },
      { key: { reportingManager: 1 }, options: { name: 'idx_appraisal_manager' } },
      { key: { hrReviewer: 1 }, options: { name: 'idx_appraisal_hr' } },
      { key: { ceoReviewer: 1 }, options: { name: 'idx_appraisal_ceo' } },
      { key: { year: 1 }, options: { name: 'idx_appraisal_year' } },
      { key: { type: 1 }, options: { name: 'idx_appraisal_type' } },
      { key: { status: 1 }, options: { name: 'idx_appraisal_status' } },
      { key: { approvalStatus: 1 }, options: { name: 'idx_appraisal_approvalStatus' } },
      { key: { isDeleted: 1 }, options: { name: 'idx_appraisal_isDeleted' } },
      { key: { createdAt: 1 }, options: { name: 'idx_appraisal_createdAt' } },
      
      // Compound indexes
      { key: { employee: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_appraisal_employee_year_deleted' } },
      { key: { department: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_appraisal_dept_year_deleted' } },
      { key: { reportingManager: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_appraisal_manager_year_deleted' } },
      { key: { hrReviewer: 1, year: 1, isDeleted: 1 }, options: { name: 'idx_appraisal_hr_year_deleted' } },
      { key: { year: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_appraisal_year_status_deleted' } },
      { key: { year: 1, approvalStatus: 1, isDeleted: 1 }, options: { name: 'idx_appraisal_year_approval_deleted' } },
      { key: { year: 1, 'promotion.eligible': 1, isDeleted: 1 }, options: { name: 'idx_appraisal_year_promotion_deleted' } },
      { key: { year: 1, 'increment.eligible': 1, isDeleted: 1 }, options: { name: 'idx_appraisal_year_increment_deleted' } },
      { key: { year: 1, 'bonus.eligible': 1, isDeleted: 1 }, options: { name: 'idx_appraisal_year_bonus_deleted' } },
      { key: { year: 1, trainingRequired: 1, isDeleted: 1 }, options: { name: 'idx_appraisal_year_training_deleted' } },
      { key: { finalRating: -1, year: 1, isDeleted: 1 }, options: { name: 'idx_appraisal_rating_year_deleted' } }
    ];

    for (const index of indexes) {
      try {
        await Appraisal.collection.createIndex(index.key, index.options);
        this.logger.info(`Created index: ${index.options.name}`);
      } catch (error) {
        if (error.code !== 85) {
          this.logger.error(`Failed to create index ${index.options.name}:`, error);
        }
      }
    }
  }

  // Create optimized indexes for Reward collection
  async createRewardIndexes() {
    const Reward = (await import('./reward.model.js')).default;
    
    const indexes = [
      // Single field indexes
      { key: { recipient: 1 }, options: { name: 'idx_reward_recipient' } },
      { key: { department: 1 }, options: { name: 'idx_reward_department' } },
      { key: { project: 1 }, options: { name: 'idx_reward_project' } },
      { key: { team: 1 }, options: { name: 'idx_reward_team' } },
      { key: { issuedBy: 1 }, options: { name: 'idx_reward_issuedBy' } },
      { key: { issuedDate: 1 }, options: { name: 'idx_reward_issuedDate' } },
      { key: { type: 1 }, options: { name: 'idx_reward_type' } },
      { key: { status: 1 }, options: { name: 'idx_reward_status' } },
      { key: { approvalStatus: 1 }, options: { name: 'idx_reward_approvalStatus' } },
      { key: { points: 1 }, options: { name: 'idx_reward_points' } },
      { key: { isDeleted: 1 }, options: { name: 'idx_reward_isDeleted' } },
      { key: { createdAt: 1 }, options: { name: 'idx_reward_createdAt' } },
      
      // Compound indexes
      { key: { recipient: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_reward_recipient_status_deleted' } },
      { key: { department: 1, issuedDate: 1, isDeleted: 1 }, options: { name: 'idx_reward_dept_date_deleted' } },
      { key: { department: 1, type: 1, isDeleted: 1 }, options: { name: 'idx_reward_dept_type_deleted' } },
      { key: { issuedBy: 1, issuedDate: 1, isDeleted: 1 }, options: { name: 'idx_reward_issuer_date_deleted' } },
      { key: { project: 1, issuedDate: 1, isDeleted: 1 }, options: { name: 'idx_reward_project_date_deleted' } },
      { key: { team: 1, issuedDate: 1, isDeleted: 1 }, options: { name: 'idx_reward_team_date_deleted' } },
      { key: { type: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_reward_type_status_deleted' } },
      { key: { status: 1, approvalStatus: 1, isDeleted: 1 }, options: { name: 'idx_reward_status_approval_deleted' } },
      { key: { points: -1, issuedDate: 1, isDeleted: 1 }, options: { name: 'idx_reward_points_date_deleted' } },
      { key: { issuedDate: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_reward_date_status_deleted' } },
      { key: { effectiveDate: 1, isDeleted: 1 }, options: { name: 'idx_reward_effectiveDate_deleted' } },
      { key: { nominatedBy: 1, isDeleted: 1 }, options: { name: 'idx_reward_nominatedBy_deleted' } },
      { key: { category: 1, isDeleted: 1 }, options: { name: 'idx_reward_category_deleted' } }
    ];

    for (const index of indexes) {
      try {
        await Reward.collection.createIndex(index.key, index.options);
        this.logger.info(`Created index: ${index.options.name}`);
      } catch (error) {
        if (error.code !== 85) {
          this.logger.error(`Failed to create index ${index.options.name}:`, error);
        }
      }
    }
  }

  // Create optimized indexes for Warning collection
  async createWarningIndexes() {
    const Warning = (await import('./warning.model.js')).default;
    
    const indexes = [
      // Single field indexes
      { key: { employee: 1 }, options: { name: 'idx_warning_employee' } },
      { key: { department: 1 }, options: { name: 'idx_warning_department' } },
      { key: { issuer: 1 }, options: { name: 'idx_warning_issuer' } },
      { key: { issuedDate: 1 }, options: { name: 'idx_warning_issuedDate' } },
      { key: { type: 1 }, options: { name: 'idx_warning_type' } },
      { key: { severity: 1 }, options: { name: 'idx_warning_severity' } },
      { key: { status: 1 }, options: { name: 'idx_warning_status' } },
      { key: { approvalStatus: 1 }, options: { name: 'idx_warning_approvalStatus' } },
      { key: { resolved: 1 }, options: { name: 'idx_warning_resolved' } },
      { key: { appealed: 1 }, options: { name: 'idx_warning_appealed' } },
      { key: { escalated: 1 }, options: { name: 'idx_warning_escalated' } },
      { key: { isDeleted: 1 }, options: { name: 'idx_warning_isDeleted' } },
      { key: { createdAt: 1 }, options: { name: 'idx_warning_createdAt' } },
      
      // Compound indexes
      { key: { employee: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_warning_employee_status_deleted' } },
      { key: { department: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_warning_dept_status_deleted' } },
      { key: { issuer: 1, issuedDate: 1, isDeleted: 1 }, options: { name: 'idx_warning_issuer_date_deleted' } },
      { key: { type: 1, severity: 1, isDeleted: 1 }, options: { name: 'idx_warning_type_severity_deleted' } },
      { key: { type: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_warning_type_status_deleted' } },
      { key: { severity: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_warning_severity_status_deleted' } },
      { key: { status: 1, resolved: 1, isDeleted: 1 }, options: { name: 'idx_warning_status_resolved_deleted' } },
      { key: { appealed: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_warning_appealed_status_deleted' } },
      { key: { issuedDate: 1, status: 1, isDeleted: 1 }, options: { name: 'idx_warning_date_status_deleted' } },
      { key: { validityEndDate: 1, isDeleted: 1 }, options: { name: 'idx_warning_validity_deleted' } },
      { key: { followUpRequired: 1, isDeleted: 1 }, options: { name: 'idx_warning_followUp_deleted' } }
    ];

    for (const index of indexes) {
      try {
        await Warning.collection.createIndex(index.key, index.options);
        this.logger.info(`Created index: ${index.options.name}`);
      } catch (error) {
        if (error.code !== 85) {
          this.logger.error(`Failed to create index ${index.options.name}:`, error);
        }
      }
    }
  }

  // Create all KPI module indexes
  async createAllIndexes() {
    this.logger.info('Starting index creation for KPI module...');
    
    await Promise.all([
      this.createKPIIndexes(),
      this.createGoalIndexes(),
      this.createPerformanceIndexes(),
      this.createAppraisalIndexes(),
      this.createRewardIndexes(),
      this.createWarningIndexes()
    ]);
    
    this.logger.info('KPI module index creation completed');
  }

  // Drop all KPI module indexes (useful for testing)
  async dropAllIndexes() {
    this.logger.info('Dropping all indexes for KPI module...');
    
    const models = [
      (await import('./kpi.model.js')).default,
      (await import('./goal.model.js')).default,
      (await import('./performance.model.js')).default,
      (await import('./appraisal.model.js')).default,
      (await import('./reward.model.js')).default,
      (await import('./warning.model.js')).default
    ];

    for (const model of models) {
      try {
        await model.collection.dropIndexes();
        this.logger.info(`Dropped indexes for ${model.collection.name}`);
      } catch (error) {
        this.logger.error(`Failed to drop indexes for ${model.collection.name}:`, error);
      }
    }
    
    this.logger.info('KPI module index drop completed');
  }
}

const kpiIndexes = new KPIIndexes();
export default kpiIndexes;
