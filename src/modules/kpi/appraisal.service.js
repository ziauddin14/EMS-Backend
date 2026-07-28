import appraisalRepository from './appraisal.repository.js';
import { APPRAISAL_STATUS, APPRAISAL_TYPE, RECOMMENDATION_TYPE } from './kpi.constants.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import { determinePerformanceGrade, formatAppraisalNumber } from './kpi.helpers.js';

class AppraisalService {
  constructor() {
    this.repository = appraisalRepository;
    this.logger = Logger;
  }

  // Appraisal Creation Methods
  async createAppraisal(appraisalData, createdBy) {
    this.logger.info('Creating new appraisal');
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    if (appraisalData.employee) {
      const employeeExists = await Employee.exists({ _id: appraisalData.employee, isDeleted: false });
      if (!employeeExists) {
        throw new AppError('Employee not found', 404);
      }
    }

    if (appraisalData.department) {
      const departmentExists = await Department.exists({ _id: appraisalData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found', 404);
      }
    }

    if (appraisalData.reportingManager) {
      const managerExists = await Employee.exists({ _id: appraisalData.reportingManager, isDeleted: false });
      if (!managerExists) {
        throw new AppError('Reporting manager not found', 404);
      }
    }

    if (appraisalData.startDate && appraisalData.endDate) {
      if (new Date(appraisalData.startDate) > new Date(appraisalData.endDate)) {
        throw new AppError('Start date cannot be after end date', 400);
      }
    }

    // Generate appraisal number if not provided
    if (!appraisalData.appraisalNumber) {
      const year = appraisalData.year || new Date().getFullYear();
      const sequence = await this.repository.getSequenceNumber(year);
      appraisalData.appraisalNumber = formatAppraisalNumber(year, sequence);
    }

    appraisalData.status = APPRAISAL_STATUS.DRAFT;
    appraisalData.approvalStatus = 'pending';
    appraisalData.createdBy = createdBy;

    const appraisal = await this.repository.create(appraisalData);
    return appraisal;
  }

  async createSelfAppraisal(employeeId, appraisalData, createdBy) {
    this.logger.info(`Creating self appraisal for employee ${employeeId}`);
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    appraisalData.employee = employeeId;
    appraisalData.department = employee.department;
    appraisalData.designation = employee.designation;
    appraisalData.reportingManager = employee.reportingManager;
    appraisalData.type = APPRAISAL_TYPE.SELF;
    appraisalData.selfAppraisal = appraisalData.selfAppraisal || {};
    appraisalData.createdBy = createdBy;

    return await this.createAppraisal(appraisalData, createdBy);
  }

  async createManagerAppraisal(managerId, employeeId, appraisalData, createdBy) {
    this.logger.info(`Creating manager appraisal for employee ${employeeId}`);
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    appraisalData.employee = employeeId;
    appraisalData.department = employee.department;
    appraisalData.designation = employee.designation;
    appraisalData.reportingManager = employee.reportingManager;
    appraisalData.type = APPRAISAL_TYPE.MANAGER;
    appraisalData.managerAppraisal = appraisalData.managerAppraisal || {};
    appraisalData.createdBy = createdBy;

    return await this.createAppraisal(appraisalData, createdBy);
  }

  async createHRAppraisal(hrId, employeeId, appraisalData, createdBy) {
    this.logger.info(`Creating HR appraisal for employee ${employeeId}`);
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    appraisalData.employee = employeeId;
    appraisalData.department = employee.department;
    appraisalData.designation = employee.designation;
    appraisalData.reportingManager = employee.reportingManager;
    appraisalData.hrReviewer = hrId;
    appraisalData.type = APPRAISAL_TYPE.HR;
    appraisalData.hrAppraisal = appraisalData.hrAppraisal || {};
    appraisalData.createdBy = createdBy;

    return await this.createAppraisal(appraisalData, createdBy);
  }

  // Appraisal Submission Methods
  async submitAppraisal(appraisalId, updatedBy) {
    this.logger.info(`Submitting appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    if (appraisal.status === APPRAISAL_STATUS.SUBMITTED) {
      throw new AppError('Appraisal already submitted', 400);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      status: APPRAISAL_STATUS.SUBMITTED,
      submittedAt: new Date(),
      submittedBy: updatedBy,
      updatedBy
    });
    return updatedAppraisal;
  }

  async submitSelfAppraisal(appraisalId, selfAppraisalData, updatedBy) {
    this.logger.info(`Submitting self appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      selfAppraisal: {
        ...appraisal.selfAppraisal,
        ...selfAppraisalData,
        submittedAt: new Date()
      },
      updatedBy
    });
    return updatedAppraisal;
  }

  // Appraisal Review Methods
  async managerReview(appraisalId, managerId, reviewData) {
    this.logger.info(`Manager review for appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      managerAppraisal: {
        ...appraisal.managerAppraisal,
        ...reviewData,
        reviewedAt: new Date(),
        reviewedBy: managerId
      },
      updatedBy: managerId
    });
    return updatedAppraisal;
  }

  async hrReview(appraisalId, hrId, reviewData) {
    this.logger.info(`HR review for appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      hrAppraisal: {
        ...appraisal.hrAppraisal,
        ...reviewData,
        reviewedAt: new Date(),
        reviewedBy: hrId
      },
      updatedBy: hrId
    });
    return updatedAppraisal;
  }

  async ceoReview(appraisalId, ceoId, reviewData) {
    this.logger.info(`CEO review for appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      ceoAppraisal: {
        ...appraisal.ceoAppraisal,
        ...reviewData,
        reviewedAt: new Date(),
        reviewedBy: ceoId
      },
      updatedBy: ceoId
    });
    return updatedAppraisal;
  }

  // Appraisal CRUD Operations
  async updateAppraisal(appraisalId, updateData, updatedBy) {
    this.logger.info(`Updating appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const forbiddenFields = ['appraisalNumber', 'employee', 'createdBy', 'createdAt'];
    const updateFields = Object.keys(updateData);
    const hasForbiddenField = updateFields.some(field => forbiddenFields.includes(field));
    if (hasForbiddenField) {
      throw new AppError('Cannot update protected fields', 400);
    }

    updateData.updatedBy = updatedBy;
    const updatedAppraisal = await this.repository.updateById(appraisalId, updateData);
    return updatedAppraisal;
  }

  async deleteAppraisal(appraisalId, deletedBy) {
    this.logger.info(`Deleting appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    await this.repository.softDeleteById(appraisalId, deletedBy);
  }

  // Approval Methods
  async approveAppraisal(appraisalId, approverId) {
    this.logger.info(`Approving appraisal ${appraisalId} by ${approverId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    if (appraisal.approvalStatus === 'approved') {
      throw new AppError('Appraisal already approved', 400);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      approvalStatus: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      status: APPRAISAL_STATUS.APPROVED,
      updatedBy: approverId
    });
    return updatedAppraisal;
  }

  async rejectAppraisal(appraisalId, approverId, reason) {
    this.logger.info(`Rejecting appraisal ${appraisalId} by ${approverId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    if (appraisal.approvalStatus === 'approved') {
      throw new AppError('Cannot reject approved appraisal', 400);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      approvalStatus: 'rejected',
      rejectionReason: reason,
      approvedBy: approverId,
      approvedAt: new Date(),
      status: APPRAISAL_STATUS.REJECTED,
      updatedBy: approverId
    });
    return updatedAppraisal;
  }

  // Finalization Methods
  async finalizeAppraisal(appraisalId, updatedBy) {
    this.logger.info(`Finalizing appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    // Calculate final rating
    const finalRating = await this.calculateFinalRating(appraisalId);
    
    // Determine final grade
    const finalGrade = determinePerformanceGrade(finalRating);

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      finalRating,
      finalGrade,
      status: APPRAISAL_STATUS.FINALIZED,
      finalizedAt: new Date(),
      finalizedBy: updatedBy,
      updatedBy
    });
    return updatedAppraisal;
  }

  async calculateFinalRating(appraisalId) {
    this.logger.info(`Calculating final rating for appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    let totalScore = 0;
    let totalWeight = 0;

    // Self appraisal (20% weight)
    if (appraisal.selfAppraisal && appraisal.selfAppraisal.rating !== undefined) {
      totalScore += appraisal.selfAppraisal.rating * 0.2;
      totalWeight += 0.2;
    }

    // Manager appraisal (40% weight)
    if (appraisal.managerAppraisal && appraisal.managerAppraisal.rating !== undefined) {
      totalScore += appraisal.managerAppraisal.rating * 0.4;
      totalWeight += 0.4;
    }

    // HR appraisal (30% weight)
    if (appraisal.hrAppraisal && appraisal.hrAppraisal.rating !== undefined) {
      totalScore += appraisal.hrAppraisal.rating * 0.3;
      totalWeight += 0.3;
    }

    // CEO appraisal (10% weight)
    if (appraisal.ceoAppraisal && appraisal.ceoAppraisal.rating !== undefined) {
      totalScore += appraisal.ceoAppraisal.rating * 0.1;
      totalWeight += 0.1;
    }

    const finalRating = totalWeight > 0 ? totalScore / totalWeight : 0;
    return Math.min(100, Math.max(0, finalRating));
  }

  async determineFinalGrade(appraisalId) {
    this.logger.info(`Determining final grade for appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const finalRating = appraisal.finalRating || await this.calculateFinalRating(appraisalId);
    const finalGrade = determinePerformanceGrade(finalRating);

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      finalGrade
    });
    return updatedAppraisal;
  }

  // Recommendation Methods
  async addRecommendation(appraisalId, recommendationData, updatedBy) {
    this.logger.info(`Adding recommendation to appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const recommendation = {
      _id: new Date().getTime().toString(),
      type: recommendationData.type || RECOMMENDATION_TYPE.GENERAL,
      description: recommendationData.description,
      approved: false,
      addedBy: updatedBy,
      addedAt: new Date()
    };

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      $push: { recommendations: recommendation },
      updatedBy
    });
    return updatedAppraisal;
  }

  async approveRecommendation(appraisalId, recommendationId, updatedBy) {
    this.logger.info(`Approving recommendation ${recommendationId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const recommendation = appraisal.recommendations?.find(r => r._id.toString() === recommendationId);
    if (!recommendation) {
      throw new AppError('Recommendation not found', 404);
    }

    recommendation.approved = true;
    recommendation.approvedBy = updatedBy;
    recommendation.approvedAt = new Date();

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      recommendations: appraisal.recommendations,
      updatedBy
    });
    return updatedAppraisal;
  }

  async rejectRecommendation(appraisalId, recommendationId, updatedBy) {
    this.logger.info(`Rejecting recommendation ${recommendationId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const recommendation = appraisal.recommendations?.find(r => r._id.toString() === recommendationId);
    if (!recommendation) {
      throw new AppError('Recommendation not found', 404);
    }

    recommendation.approved = false;
    recommendation.rejectedBy = updatedBy;
    recommendation.rejectedAt = new Date();

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      recommendations: appraisal.recommendations,
      updatedBy
    });
    return updatedAppraisal;
  }

  // Promotion Methods
  async setPromotionEligible(appraisalId, eligible, recommendationData, updatedBy) {
    this.logger.info(`Setting promotion eligibility for appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      promotion: {
        eligible,
        recommendedLevel: recommendationData?.recommendedLevel || '',
        comments: recommendationData?.comments || ''
      },
      updatedBy
    });
    return updatedAppraisal;
  }

  async checkPromotionEligibility(employeeId, year) {
    this.logger.info(`Checking promotion eligibility for employee ${employeeId}`);
    
    const appraisals = await this.repository.findByEmployee(employeeId, {
      filter: { year }
    });

    const latestAppraisal = appraisals[0];
    if (!latestAppraisal) {
      return { eligible: false, reason: 'No appraisal found' };
    }

    const finalRating = latestAppraisal.finalRating || 0;
    const eligible = finalRating >= 75 && latestAppraisal.status === APPRAISAL_STATUS.APPROVED;

    return {
      eligible,
      finalRating,
      reason: eligible ? 'Meets promotion criteria' : 'Does not meet promotion criteria'
    };
  }

  // Increment Methods
  async setIncrementEligible(appraisalId, eligible, incrementData, updatedBy) {
    this.logger.info(`Setting increment eligibility for appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      increment: {
        eligible,
        percentage: incrementData?.percentage || 0,
        amount: incrementData?.amount || 0,
        comments: incrementData?.comments || ''
      },
      updatedBy
    });
    return updatedAppraisal;
  }

  async checkIncrementEligibility(employeeId, year) {
    this.logger.info(`Checking increment eligibility for employee ${employeeId}`);
    
    const appraisals = await this.repository.findByEmployee(employeeId, {
      filter: { year }
    });

    const latestAppraisal = appraisals[0];
    if (!latestAppraisal) {
      return { eligible: false, reason: 'No appraisal found' };
    }

    const finalRating = latestAppraisal.finalRating || 0;
    const eligible = finalRating >= 70 && latestAppraisal.status === APPRAISAL_STATUS.APPROVED;

    return {
      eligible,
      finalRating,
      reason: eligible ? 'Meets increment criteria' : 'Does not meet increment criteria'
    };
  }

  // Bonus Methods
  async setBonusEligible(appraisalId, eligible, bonusData, updatedBy) {
    this.logger.info(`Setting bonus eligibility for appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      bonus: {
        eligible,
        percentage: bonusData?.percentage || 0,
        amount: bonusData?.amount || 0,
        comments: bonusData?.comments || ''
      },
      updatedBy
    });
    return updatedAppraisal;
  }

  async checkBonusEligibility(employeeId, year) {
    this.logger.info(`Checking bonus eligibility for employee ${employeeId}`);
    
    const appraisals = await this.repository.findByEmployee(employeeId, {
      filter: { year }
    });

    const latestAppraisal = appraisals[0];
    if (!latestAppraisal) {
      return { eligible: false, reason: 'No appraisal found' };
    }

    const finalRating = latestAppraisal.finalRating || 0;
    const eligible = finalRating >= 80 && latestAppraisal.status === APPRAISAL_STATUS.APPROVED;

    return {
      eligible,
      finalRating,
      reason: eligible ? 'Meets bonus criteria' : 'Does not meet bonus criteria'
    };
  }

  // Training Methods
  async addTrainingRecommendation(appraisalId, trainingData, updatedBy) {
    this.logger.info(`Adding training recommendation to appraisal ${appraisalId}`);
    
    const appraisal = await this.repository.findById(appraisalId);
    if (!appraisal) {
      throw new AppError('Appraisal not found', 404);
    }

    const training = {
      course: trainingData.course,
      type: trainingData.type || 'online',
      duration: trainingData.duration || '',
      mandatory: trainingData.mandatory || false
    };

    const updatedAppraisal = await this.repository.updateById(appraisalId, {
      $push: { training },
      updatedBy
    });
    return updatedAppraisal;
  }

  // Dashboard Methods
  async getDashboard(employeeId, year, periodType) {
    this.logger.info(`Getting dashboard for employee ${employeeId}`);
    
    const appraisals = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const latestAppraisal = appraisals[0] || null;
    const promotionEligibility = await this.checkPromotionEligibility(employeeId, year);
    const incrementEligibility = await this.checkIncrementEligibility(employeeId, year);
    const bonusEligibility = await this.checkBonusEligibility(employeeId, year);

    return {
      employeeId,
      year,
      periodType,
      latestAppraisal,
      totalAppraisals: appraisals.length,
      promotionEligibility,
      incrementEligibility,
      bonusEligibility
    };
  }

  async getDepartmentDashboard(departmentId, year, periodType) {
    this.logger.info(`Getting department dashboard for ${departmentId}`);
    
    const appraisals = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const topPerformers = await this.repository.getTopPerformers(year, 10);
    const lowPerformers = await this.repository.getLowPerformers(year, 10);
    const departmentAverage = await this.repository.getDepartmentAverage(departmentId, year);
    const promotionEligible = await this.repository.getPromotionEligible(year);
    const incrementEligible = await this.repository.getIncrementEligible(year);

    return {
      departmentId,
      year,
      periodType,
      totalAppraisals: appraisals.length,
      topPerformers,
      lowPerformers,
      departmentAverage,
      promotionEligible: promotionEligible.filter(a => a.department?.toString() === departmentId),
      incrementEligible: incrementEligible.filter(a => a.department?.toString() === departmentId)
    };
  }

  async getManagerDashboard(managerId, year, periodType) {
    this.logger.info(`Getting manager dashboard for ${managerId}`);
    
    const appraisals = await this.repository.findByManager(managerId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const pendingReview = appraisals.filter(a => a.status === APPRAISAL_STATUS.SUBMITTED);
    const completed = appraisals.filter(a => a.status === APPRAISAL_STATUS.FINALIZED);

    return {
      managerId,
      year,
      periodType,
      totalAppraisals: appraisals.length,
      pendingReview: pendingReview.length,
      completed: completed.length,
      appraisals: appraisals.slice(0, 20)
    };
  }

  // Report Methods
  async generateReport(reportType, options) {
    this.logger.info(`Generating ${reportType} report`);
    
    const { year, departmentId, employeeId, periodType } = options;
    
    switch (reportType) {
      case 'employee-appraisal':
        return await this.generateAppraisalReport(employeeId, year, periodType);
      case 'department-appraisal':
        return await this.generateDepartmentAppraisalReport(departmentId, year, periodType);
      case 'organization-appraisal':
        return await this.generateOrganizationAppraisalReport(year, periodType);
      default:
        throw new AppError('Invalid report type', 400);
    }
  }

  async generateAppraisalReport(employeeId, year, periodType) {
    this.logger.info(`Generating appraisal report for employee ${employeeId}`);
    
    const appraisals = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      employeeId,
      year,
      periodType,
      appraisals: appraisals.map(appraisal => ({
        appraisalNumber: appraisal.appraisalNumber,
        type: appraisal.type,
        status: appraisal.status,
        finalRating: appraisal.finalRating,
        finalGrade: appraisal.finalGrade
      })),
      summary: {
        totalAppraisals: appraisals.length,
        averageRating: appraisals.length > 0 ? appraisals.reduce((sum, a) => sum + (a.finalRating || 0), 0) / appraisals.length : 0,
        finalized: appraisals.filter(a => a.status === APPRAISAL_STATUS.FINALIZED).length
      }
    };

    return report;
  }

  async generateDepartmentAppraisalReport(departmentId, year, periodType) {
    this.logger.info(`Generating department appraisal report for ${departmentId}`);
    
    const appraisals = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      departmentId,
      year,
      periodType,
      appraisals: appraisals.slice(0, 50),
      summary: {
        totalAppraisals: appraisals.length,
        averageRating: appraisals.length > 0 ? appraisals.reduce((sum, a) => sum + (a.finalRating || 0), 0) / appraisals.length : 0,
        finalized: appraisals.filter(a => a.status === APPRAISAL_STATUS.FINALIZED).length
      }
    };

    return report;
  }

  async generateOrganizationAppraisalReport(year, periodType) {
    this.logger.info(`Generating organization appraisal report for ${year}`);
    
    const allAppraisals = await this.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      year,
      periodType,
      summary: {
        totalAppraisals: allAppraisals.length,
        averageRating: allAppraisals.length > 0 ? allAppraisals.reduce((sum, a) => sum + (a.finalRating || 0), 0) / allAppraisals.length : 0,
        finalized: allAppraisals.filter(a => a.status === APPRAISAL_STATUS.FINALIZED).length
      },
      appraisals: allAppraisals.slice(0, 100)
    };

    return report;
  }

  // Analytics Methods
  async getAnalytics(employeeId, year, periodType) {
    this.logger.info(`Getting analytics for employee ${employeeId}`);
    
    const appraisals = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const historicalTrend = await this.getHistoricalTrend(employeeId, [year - 2, year - 1, year]);
    const promotionEligibility = await this.checkPromotionEligibility(employeeId, year);
    const incrementEligibility = await this.checkIncrementEligibility(employeeId, year);
    const bonusEligibility = await this.checkBonusEligibility(employeeId, year);

    const analytics = {
      employeeId,
      year,
      periodType,
      currentAppraisal: appraisals[0] || null,
      historicalTrend,
      promotionEligibility,
      incrementEligibility,
      bonusEligibility,
      averageRating: appraisals.length > 0 ? appraisals.reduce((sum, a) => sum + (a.finalRating || 0), 0) / appraisals.length : 0
    };

    return analytics;
  }

  async getHistoricalTrend(employeeId, years) {
    this.logger.info(`Getting historical trend for employee ${employeeId}`);
    
    const trendData = [];
    for (const year of years) {
      const appraisals = await this.repository.findByEmployee(employeeId, {
        filter: { year }
      });
      const avgRating = appraisals.length > 0 ? appraisals.reduce((sum, a) => sum + (a.finalRating || 0), 0) / appraisals.length : 0;
      trendData.push({ year, averageRating: avgRating, totalAppraisals: appraisals.length });
    }

    return trendData;
  }

  async getComparativeAnalysis(employeeIds, year, periodType) {
    this.logger.info('Getting comparative analysis');
    
    const allAppraisals = await this.repository.findAll({
      filter: { year },
      sort: { finalRating: -1 }
    });

    const employeeAppraisals = allAppraisals.filter(a => employeeIds.includes(a.employee.toString()));
    const organizationAverage = allAppraisals.length > 0 ? allAppraisals.reduce((sum, a) => sum + (a.finalRating || 0), 0) / allAppraisals.length : 0;

    const comparison = {
      employeeIds,
      year,
      periodType,
      employeeRatings: employeeAppraisals.map(a => ({
        employeeId: a.employee,
        finalRating: a.finalRating,
        finalGrade: a.finalGrade
      })),
      organizationAverage,
      aboveAverage: employeeAppraisals.filter(a => a.finalRating > organizationAverage).length,
      belowAverage: employeeAppraisals.filter(a => a.finalRating < organizationAverage).length
    };

    return comparison;
  }

  // Bulk Operations
  async bulkCreate(appraisalDataArray, createdBy) {
    this.logger.info(`Bulk creating ${appraisalDataArray.length} appraisals`);
    
    const results = [];
    for (const appraisalData of appraisalDataArray) {
      try {
        const appraisal = await this.createAppraisal(appraisalData, createdBy);
        results.push({ success: true, appraisal });
      } catch (error) {
        results.push({ success: false, error: error.message, data: appraisalData });
      }
    }

    return results;
  }

  async bulkUpdate(appraisalIds, updateData, updatedBy) {
    this.logger.info(`Bulk updating ${appraisalIds.length} appraisals`);
    
    const results = [];
    for (const appraisalId of appraisalIds) {
      try {
        const appraisal = await this.updateAppraisal(appraisalId, updateData, updatedBy);
        results.push({ success: true, appraisal });
      } catch (error) {
        results.push({ success: false, error: error.message, appraisalId });
      }
    }

    return results;
  }

  async bulkApprove(appraisalIds, approverId) {
    this.logger.info(`Bulk approving ${appraisalIds.length} appraisals`);
    
    const results = [];
    for (const appraisalId of appraisalIds) {
      try {
        const appraisal = await this.approveAppraisal(appraisalId, approverId);
        results.push({ success: true, appraisal });
      } catch (error) {
        results.push({ success: false, error: error.message, appraisalId });
      }
    }

    return results;
  }

  async bulkFinalize(appraisalIds, updatedBy) {
    this.logger.info(`Bulk finalizing ${appraisalIds.length} appraisals`);
    
    const results = [];
    for (const appraisalId of appraisalIds) {
      try {
        const appraisal = await this.finalizeAppraisal(appraisalId, updatedBy);
        results.push({ success: true, appraisal });
      } catch (error) {
        results.push({ success: false, error: error.message, appraisalId });
      }
    }

    return results;
  }

  // Helper Methods
  async getEmployeeAppraisals(employeeId, options) {
    return await this.repository.findByEmployee(employeeId, options);
  }

  async getDepartmentAppraisals(departmentId, options) {
    return await this.repository.findByDepartment(departmentId, options);
  }

  async getManagerAppraisals(managerId, options) {
    return await this.repository.findByManager(managerId, options);
  }

  async getHRAppraisals(hrId, options) {
    return await this.repository.findByHR(hrId, options);
  }

  async getAppraisalsByStatus(status, options) {
    return await this.repository.findByStatus(status, options);
  }

  async getAppraisalsByPeriod(year, periodType, periodValue) {
    return await this.repository.findByPeriod(year, periodType, periodValue);
  }

  async getTopPerformers(year, limit) {
    return await this.repository.getTopPerformers(year, limit);
  }

  async getLowPerformers(year, limit) {
    return await this.repository.getLowPerformers(year, limit);
  }

  async getDepartmentAverage(departmentId, year) {
    return await this.repository.getDepartmentAverage(departmentId, year);
  }

  async getPromotionEligible(year) {
    return await this.repository.getPromotionEligible(year);
  }

  async getIncrementEligible(year) {
    return await this.repository.getIncrementEligible(year);
  }
}

const appraisalService = new AppraisalService();
export default appraisalService;
