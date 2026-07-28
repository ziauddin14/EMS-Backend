import performanceRepository from './performance.repository.js';
import { PERFORMANCE_TREND } from './kpi.constants.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import { determinePerformanceGrade } from './kpi.helpers.js';

class PerformanceService {
  constructor() {
    this.repository = performanceRepository;
    this.logger = Logger;
  }

  // Performance Generation Methods
  async generatePerformance(employeeId, year, periodType, periodValue, createdBy) {
    this.logger.info(`Generating performance for employee ${employeeId} for ${year}`);
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const kpiService = (await import('./kpi.service.js')).default;
    const kpi = await kpiService.calculateKPI(employeeId, periodType, year, periodValue);

    const performanceData = {
      employee: employeeId,
      employeeName: employee.firstName + ' ' + employee.lastName,
      department: employee.department,
      designation: employee.designation,
      year,
      periodType,
      periodValue,
      overallScore: kpi.overallScore,
      grade: kpi.grade,
      status: kpi.status,
      kpiComponents: kpi.kpiComponents,
      strengths: kpi.strengths,
      weaknesses: kpi.weaknesses,
      createdBy
    };

    const performance = await this.repository.create(performanceData);
    return performance;
  }

  async generateMonthlyPerformance(employeeId, year, month, createdBy) {
    this.logger.info(`Generating monthly performance for employee ${employeeId}`);
    return await this.generatePerformance(employeeId, year, 'monthly', month, createdBy);
  }

  async generateQuarterlyPerformance(employeeId, year, quarter, createdBy) {
    this.logger.info(`Generating quarterly performance for employee ${employeeId}`);
    return await this.generatePerformance(employeeId, year, 'quarterly', quarter, createdBy);
  }

  async generateYearlyPerformance(employeeId, year, createdBy) {
    this.logger.info(`Generating yearly performance for employee ${employeeId}`);
    return await this.generatePerformance(employeeId, year, 'yearly', null, createdBy);
  }

  // Performance Calculation Methods
  async calculateImprovementPercentage(employeeId, year, periodType) {
    this.logger.info(`Calculating improvement percentage for employee ${employeeId}`);
    
    const currentPerformance = await this.repository.findByEmployee(employeeId, {
      filter: { year, periodType },
      sort: { createdAt: -1 }
    });

    const previousYear = year - 1;
    const previousPerformance = await this.repository.findByEmployee(employeeId, {
      filter: { year: previousYear, periodType },
      sort: { createdAt: -1 }
    });

    if (currentPerformance.length === 0 || previousPerformance.length === 0) {
      return 0;
    }

    const currentScore = currentPerformance[0].overallScore || 0;
    const previousScore = previousPerformance[0].overallScore || 0;

    if (previousScore === 0) return 0;
    const improvement = ((currentScore - previousScore) / previousScore) * 100;
    return improvement;
  }

  async calculateGrowthPercentage(employeeId, year, periodType) {
    this.logger.info(`Calculating growth percentage for employee ${employeeId}`);
    return await this.calculateImprovementPercentage(employeeId, year, periodType);
  }

  async determineTrend(employeeId, year, periodType) {
    this.logger.info(`Determining trend for employee ${employeeId}`);
    
    const improvement = await this.calculateImprovementPercentage(employeeId, year, periodType);

    if (improvement > 10) return PERFORMANCE_TREND.IMPROVING;
    if (improvement < -10) return PERFORMANCE_TREND.DECLINING;
    if (improvement >= -10 && improvement <= 10) return PERFORMANCE_TREND.STABLE;
    return PERFORMANCE_TREND.STABLE;
  }

  async calculateRanking(year, periodType) {
    this.logger.info(`Calculating ranking for ${periodType} ${year}`);
    
    const allPerformance = await this.repository.findByYear(year, {
      filter: { periodType },
      sort: { overallScore: -1 }
    });

    const rankings = allPerformance.map((perf, index) => ({
      employee: perf.employee,
      employeeName: perf.employeeName,
      department: perf.department,
      overallScore: perf.overallScore,
      grade: perf.grade,
      rank: index + 1
    }));

    return rankings;
  }

  async calculatePercentile(employeeId, year, periodType) {
    this.logger.info(`Calculating percentile for employee ${employeeId}`);
    
    const allPerformance = await this.repository.findByYear(year, {
      filter: { periodType },
      sort: { overallScore: -1 }
    });

    const employeePerformance = allPerformance.find(p => p.employee.toString() === employeeId);
    if (!employeePerformance) return 0;

    const rank = allPerformance.findIndex(p => p.employee.toString() === employeeId) + 1;
    const total = allPerformance.length;
    const percentile = ((total - rank + 1) / total) * 100;

    return Math.round(percentile);
  }

  // Performance CRUD Operations
  async createPerformance(performanceData, createdBy) {
    this.logger.info('Creating new performance record');
    
    const Employee = (await import('../employee/employee.model.js')).default;
    if (performanceData.employee) {
      const employeeExists = await Employee.exists({ _id: performanceData.employee, isDeleted: false });
      if (!employeeExists) {
        throw new AppError('Employee not found', 404);
      }
    }

    performanceData.createdBy = createdBy;
    const performance = await this.repository.create(performanceData);
    return performance;
  }

  async updatePerformance(performanceId, updateData, updatedBy) {
    this.logger.info(`Updating performance ${performanceId}`);
    
    const performance = await this.repository.findById(performanceId);
    if (!performance) {
      throw new AppError('Performance not found', 404);
    }

    const forbiddenFields = ['employee', 'year', 'periodType', 'createdBy', 'createdAt'];
    const updateFields = Object.keys(updateData);
    const hasForbiddenField = updateFields.some(field => forbiddenFields.includes(field));
    if (hasForbiddenField) {
      throw new AppError('Cannot update protected fields', 400);
    }

    updateData.updatedBy = updatedBy;
    const updatedPerformance = await this.repository.updateById(performanceId, updateData);
    return updatedPerformance;
  }

  async deletePerformance(performanceId, deletedBy) {
    this.logger.info(`Deleting performance ${performanceId}`);
    
    const performance = await this.repository.findById(performanceId);
    if (!performance) {
      throw new AppError('Performance not found', 404);
    }

    await this.repository.softDeleteById(performanceId, deletedBy);
  }

  // Approval Methods
  async approvePerformance(performanceId, approverId) {
    this.logger.info(`Approving performance ${performanceId} by ${approverId}`);
    
    const performance = await this.repository.findById(performanceId);
    if (!performance) {
      throw new AppError('Performance not found', 404);
    }

    if (performance.approvalStatus === 'approved') {
      throw new AppError('Performance already approved', 400);
    }

    const updatedPerformance = await this.repository.updateById(performanceId, {
      approvalStatus: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      updatedBy: approverId
    });
    return updatedPerformance;
  }

  async rejectPerformance(performanceId, approverId, reason) {
    this.logger.info(`Rejecting performance ${performanceId} by ${approverId}`);
    
    const performance = await this.repository.findById(performanceId);
    if (!performance) {
      throw new AppError('Performance not found', 404);
    }

    if (performance.approvalStatus === 'approved') {
      throw new AppError('Cannot reject approved performance', 400);
    }

    const updatedPerformance = await this.repository.updateById(performanceId, {
      approvalStatus: 'rejected',
      rejectionReason: reason,
      approvedBy: approverId,
      approvedAt: new Date(),
      updatedBy: approverId
    });
    return updatedPerformance;
  }

  async reviewPerformance(performanceId, reviewerId, reviewData) {
    this.logger.info(`Reviewing performance ${performanceId} by ${reviewerId}`);
    
    const performance = await this.repository.findById(performanceId);
    if (!performance) {
      throw new AppError('Performance not found', 404);
    }

    const review = {
      reviewer: reviewerId,
      reviewDate: new Date(),
      comments: reviewData?.comments || '',
      rating: reviewData?.rating || null
    };

    const updatedPerformance = await this.repository.updateById(performanceId, {
      $push: { reviews: review },
      updatedBy: reviewerId
    });
    return updatedPerformance;
  }

  // Eligibility Methods
  async setPromotionEligible(performanceId, eligible, updatedBy) {
    this.logger.info(`Setting promotion eligibility for performance ${performanceId}`);
    
    const performance = await this.repository.findById(performanceId);
    if (!performance) {
      throw new AppError('Performance not found', 404);
    }

    const updatedPerformance = await this.repository.updateById(performanceId, {
      promotionEligible: eligible,
      updatedBy
    });
    return updatedPerformance;
  }

  async setBonusEligible(performanceId, eligible, updatedBy) {
    this.logger.info(`Setting bonus eligibility for performance ${performanceId}`);
    
    const performance = await this.repository.findById(performanceId);
    if (!performance) {
      throw new AppError('Performance not found', 404);
    }

    const updatedPerformance = await this.repository.updateById(performanceId, {
      bonusEligible: eligible,
      updatedBy
    });
    return updatedPerformance;
  }

  async setAppraisalEligible(performanceId, eligible, updatedBy) {
    this.logger.info(`Setting appraisal eligibility for performance ${performanceId}`);
    
    const performance = await this.repository.findById(performanceId);
    if (!performance) {
      throw new AppError('Performance not found', 404);
    }

    const updatedPerformance = await this.repository.updateById(performanceId, {
      appraisalEligible: eligible,
      updatedBy
    });
    return updatedPerformance;
  }

  async checkPromotionEligibility(employeeId, year) {
    this.logger.info(`Checking promotion eligibility for employee ${employeeId}`);
    
    const performance = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    if (performance.length === 0) {
      return { eligible: false, reason: 'No performance record found' };
    }

    const latestPerformance = performance[0];
    const eligible = latestPerformance.overallScore >= 75 && latestPerformance.approvalStatus === 'approved';

    return {
      eligible,
      overallScore: latestPerformance.overallScore,
      reason: eligible ? 'Meets promotion criteria' : 'Does not meet promotion criteria'
    };
  }

  async checkBonusEligibility(employeeId, year) {
    this.logger.info(`Checking bonus eligibility for employee ${employeeId}`);
    
    const performance = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    if (performance.length === 0) {
      return { eligible: false, reason: 'No performance record found' };
    }

    const latestPerformance = performance[0];
    const eligible = latestPerformance.overallScore >= 80 && latestPerformance.approvalStatus === 'approved';

    return {
      eligible,
      overallScore: latestPerformance.overallScore,
      reason: eligible ? 'Meets bonus criteria' : 'Does not meet bonus criteria'
    };
  }

  // Dashboard Methods
  async getDashboard(employeeId, year, periodType) {
    this.logger.info(`Getting dashboard for employee ${employeeId}`);
    
    const performance = await this.repository.findByEmployee(employeeId, {
      filter: { year, periodType },
      sort: { createdAt: -1 }
    });

    const historicalTrend = await this.getHistoricalTrend(employeeId, [year - 2, year - 1, year]);
    const improvement = await this.calculateImprovementPercentage(employeeId, year, periodType);
    const trend = await this.determineTrend(employeeId, year, periodType);
    const percentile = await this.calculatePercentile(employeeId, year, periodType);
    const promotionEligibility = await this.checkPromotionEligibility(employeeId, year);
    const bonusEligibility = await this.checkBonusEligibility(employeeId, year);

    return {
      employeeId,
      year,
      periodType,
      currentPerformance: performance[0] || null,
      historicalTrend,
      improvementPercentage: improvement,
      trend,
      percentile,
      promotionEligibility,
      bonusEligibility
    };
  }

  async getDepartmentDashboard(departmentId, year, periodType) {
    this.logger.info(`Getting department dashboard for ${departmentId}`);
    
    const performance = await this.repository.findByDepartment(departmentId, {
      filter: { year, periodType },
      sort: { overallScore: -1 }
    });

    const topPerformers = await this.repository.getTopPerformers(year, 10);
    const lowPerformers = await this.repository.getLowPerformers(year, 10);
    const departmentAverage = await this.repository.getDepartmentAverage(departmentId, year);

    return {
      departmentId,
      year,
      periodType,
      totalEmployees: performance.length,
      averageScore: performance.length > 0 ? performance.reduce((sum, p) => sum + p.overallScore, 0) / performance.length : 0,
      topPerformers: topPerformers.filter(p => p.department?.toString() === departmentId),
      lowPerformers: lowPerformers.filter(p => p.department?.toString() === departmentId),
      departmentAverage
    };
  }

  async getManagerDashboard(managerId, year, periodType) {
    this.logger.info(`Getting manager dashboard for ${managerId}`);
    
    const performance = await this.repository.findByManager(managerId, {
      filter: { year, periodType },
      sort: { overallScore: -1 }
    });

    return {
      managerId,
      year,
      periodType,
      totalTeamMembers: performance.length,
      averageTeamScore: performance.length > 0 ? performance.reduce((sum, p) => sum + p.overallScore, 0) / performance.length : 0,
      performance: performance.slice(0, 20)
    };
  }

  // Report Methods
  async generateReport(reportType, options) {
    this.logger.info(`Generating ${reportType} report`);
    
    const { year, departmentId, employeeId, periodType } = options;
    
    switch (reportType) {
      case 'employee-performance':
        return await this.generatePerformanceReport(employeeId, year, periodType);
      case 'department-performance':
        return await this.generateDepartmentPerformanceReport(departmentId, year, periodType);
      case 'organization-performance':
        return await this.generateOrganizationPerformanceReport(year, periodType);
      default:
        throw new AppError('Invalid report type', 400);
    }
  }

  async generatePerformanceReport(employeeId, year, periodType) {
    this.logger.info(`Generating performance report for employee ${employeeId}`);
    
    const performance = await this.repository.findByEmployee(employeeId, {
      filter: { year, periodType },
      sort: { createdAt: -1 }
    });

    const historicalTrend = await this.getHistoricalTrend(employeeId, [year - 2, year - 1, year]);

    const report = {
      employeeId,
      year,
      periodType,
      performance: performance[0] || null,
      historicalTrend,
      summary: {
        overallScore: performance[0]?.overallScore || 0,
        grade: performance[0]?.grade || 'N/A',
        trend: await this.determineTrend(employeeId, year, periodType),
        improvement: await this.calculateImprovementPercentage(employeeId, year, periodType)
      }
    };

    return report;
  }

  async generateDepartmentPerformanceReport(departmentId, year, periodType) {
    this.logger.info(`Generating department performance report for ${departmentId}`);
    
    const performance = await this.repository.findByDepartment(departmentId, {
      filter: { year, periodType },
      sort: { overallScore: -1 }
    });

    const departmentAverage = await this.repository.getDepartmentAverage(departmentId, year);

    const report = {
      departmentId,
      year,
      periodType,
      performance: performance.slice(0, 50),
      summary: {
        totalEmployees: performance.length,
        averageScore: performance.length > 0 ? performance.reduce((sum, p) => sum + p.overallScore, 0) / performance.length : 0,
        topPerformer: performance[0] || null,
        departmentAverage
      }
    };

    return report;
  }

  async generateOrganizationPerformanceReport(year, periodType) {
    this.logger.info(`Generating organization performance report for ${year}`);
    
    const allPerformance = await this.repository.findByYear(year, {
      filter: { periodType },
      sort: { overallScore: -1 }
    });

    const report = {
      year,
      periodType,
      summary: {
        totalEmployees: allPerformance.length,
        averageScore: allPerformance.length > 0 ? allPerformance.reduce((sum, p) => sum + p.overallScore, 0) / allPerformance.length : 0,
        topPerformer: allPerformance[0] || null,
        lowPerformer: allPerformance[allPerformance.length - 1] || null
      },
      performance: allPerformance.slice(0, 100)
    };

    return report;
  }

  // Analytics Methods
  async getAnalytics(employeeId, year, periodType) {
    this.logger.info(`Getting analytics for employee ${employeeId}`);
    
    const performance = await this.repository.findByEmployee(employeeId, {
      filter: { year, periodType },
      sort: { createdAt: -1 }
    });

    const historicalTrend = await this.getHistoricalTrend(employeeId, [year - 2, year - 1, year]);
    const improvement = await this.calculateImprovementPercentage(employeeId, year, periodType);
    const trend = await this.determineTrend(employeeId, year, periodType);
    const percentile = await this.calculatePercentile(employeeId, year, periodType);

    const analytics = {
      employeeId,
      year,
      periodType,
      currentPerformance: performance[0] || null,
      historicalTrend,
      improvementPercentage: improvement,
      trend,
      percentile,
      byGrade: this.groupPerformanceByGrade(performance)
    };

    return analytics;
  }

  async getHistoricalTrend(employeeId, years) {
    this.logger.info(`Getting historical trend for employee ${employeeId}`);
    return await this.repository.getHistoricalTrend(employeeId, years);
  }

  async getComparativeAnalysis(employeeIds, year, periodType) {
    this.logger.info('Getting comparative analysis');
    
    const allPerformance = await this.repository.findByYear(year, {
      filter: { periodType },
      sort: { overallScore: -1 }
    });

    const employeePerformance = allPerformance.filter(p => employeeIds.includes(p.employee.toString()));
    const organizationAverage = allPerformance.length > 0 ? allPerformance.reduce((sum, p) => sum + p.overallScore, 0) / allPerformance.length : 0;

    const comparison = {
      employeeIds,
      year,
      periodType,
      employeeScores: employeePerformance.map(p => ({
        employeeId: p.employee,
        employeeName: p.employeeName,
        overallScore: p.overallScore,
        grade: p.grade
      })),
      organizationAverage,
      aboveAverage: employeePerformance.filter(p => p.overallScore > organizationAverage).length,
      belowAverage: employeePerformance.filter(p => p.overallScore < organizationAverage).length
    };

    return comparison;
  }

  async getDepartmentRankings(departmentId, year, periodType) {
    this.logger.info(`Getting department rankings for ${departmentId}`);
    
    const performance = await this.repository.findByDepartment(departmentId, {
      filter: { year, periodType },
      sort: { overallScore: -1 }
    });

    const rankings = performance.map((perf, index) => ({
      employee: perf.employee,
      employeeName: perf.employeeName,
      overallScore: perf.overallScore,
      grade: perf.grade,
      rank: index + 1
    }));

    return rankings;
  }

  async getDesignationRankings(designationId, year, periodType) {
    this.logger.info(`Getting designation rankings for ${designationId}`);
    
    const performance = await this.repository.findByDesignation(designationId, {
      filter: { year, periodType },
      sort: { overallScore: -1 }
    });

    const rankings = performance.map((perf, index) => ({
      employee: perf.employee,
      employeeName: perf.employeeName,
      overallScore: perf.overallScore,
      grade: perf.grade,
      rank: index + 1
    }));

    return rankings;
  }

  groupPerformanceByGrade(performance) {
    const grouped = {};
    performance.forEach(perf => {
      const grade = perf.grade || 'N/A';
      if (!grouped[grade]) grouped[grade] = 0;
      grouped[grade]++;
    });
    return grouped;
  }

  // Bulk Operations
  async bulkCreate(performanceDataArray, createdBy) {
    this.logger.info(`Bulk creating ${performanceDataArray.length} performance records`);
    
    const results = [];
    for (const performanceData of performanceDataArray) {
      try {
        const performance = await this.createPerformance(performanceData, createdBy);
        results.push({ success: true, performance });
      } catch (error) {
        results.push({ success: false, error: error.message, data: performanceData });
      }
    }

    return results;
  }

  async bulkUpdate(performanceIds, updateData, updatedBy) {
    this.logger.info(`Bulk updating ${performanceIds.length} performance records`);
    
    const results = [];
    for (const performanceId of performanceIds) {
      try {
        const performance = await this.updatePerformance(performanceId, updateData, updatedBy);
        results.push({ success: true, performance });
      } catch (error) {
        results.push({ success: false, error: error.message, performanceId });
      }
    }

    return results;
  }

  async bulkApprove(performanceIds, approverId) {
    this.logger.info(`Bulk approving ${performanceIds.length} performance records`);
    
    const results = [];
    for (const performanceId of performanceIds) {
      try {
        const performance = await this.approvePerformance(performanceId, approverId);
        results.push({ success: true, performance });
      } catch (error) {
        results.push({ success: false, error: error.message, performanceId });
      }
    }

    return results;
  }

  // Helper Methods
  async getEmployeePerformance(employeeId, options) {
    return await this.repository.findByEmployee(employeeId, options);
  }

  async getDepartmentPerformance(departmentId, options) {
    return await this.repository.findByDepartment(departmentId, options);
  }

  async getManagerPerformance(managerId, options) {
    return await this.repository.findByManager(managerId, options);
  }

  async getDesignationPerformance(designationId, options) {
    return await this.repository.findByDesignation(designationId, options);
  }

  async getYearlyPerformance(year, options) {
    return await this.repository.findByYear(year, options);
  }

  async getTopPerformers(year, limit) {
    return await this.repository.getTopPerformers(year, limit);
  }

  async getLowPerformers(year, limit) {
    return await this.repository.getLowPerformers(year, limit);
  }

  async getPromotionEligible(year) {
    return await this.repository.getPromotionEligible(year);
  }

  async getBonusEligible(year) {
    return await this.repository.getBonusEligible(year);
  }

  async getDepartmentAverage(departmentId, year) {
    return await this.repository.getDepartmentAverage(departmentId, year);
  }

  async getHistoricalTrendData(employeeId, years) {
    return await this.repository.getHistoricalTrend(employeeId, years);
  }
}

const performanceService = new PerformanceService();
export default performanceService;
