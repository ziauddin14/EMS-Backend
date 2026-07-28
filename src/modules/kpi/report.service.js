import kpiService from './kpi.service.js';
import goalService from './goal.service.js';
import performanceService from './performance.service.js';
import appraisalService from './appraisal.service.js';
import rewardService from './reward.service.js';
import warningService from './warning.service.js';
import executiveService from './executive.service.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';

class ReportService {
  constructor() {
    this.kpiService = kpiService;
    this.goalService = goalService;
    this.performanceService = performanceService;
    this.appraisalService = appraisalService;
    this.rewardService = rewardService;
    this.warningService = warningService;
    this.executiveService = executiveService;
    this.logger = Logger;
  }

  // KPI Reports
  async generateDailyKPIReport(date, options = {}) {
    this.logger.info(`Generating daily KPI report for ${date}`);
    
    const reportDate = new Date(date);
    const year = reportDate.getFullYear();
    const month = reportDate.getMonth() + 1;
    const day = reportDate.getDate();

    const dailyKPIs = await this.kpiService.repository.findAll({
      filter: {
        year,
        month,
        startDate: { $lte: reportDate },
        endDate: { $gte: reportDate }
      },
      sort: { overallScore: -1 }
    });

    const report = {
      reportType: 'daily_kpi',
      reportDate: date,
      year,
      month,
      day,
      summary: {
        totalEmployees: dailyKPIs.length,
        averageScore: dailyKPIs.length > 0 ? dailyKPIs.reduce((sum, k) => sum + k.overallScore, 0) / dailyKPIs.length : 0,
        topPerformers: dailyKPIs.slice(0, 10),
        lowPerformers: dailyKPIs.slice(-10).reverse()
      },
      byDepartment: await this.groupKPIsByDepartment(dailyKPIs),
      byGrade: await this.groupKPIsByGrade(dailyKPIs),
      generatedAt: new Date()
    };

    return report;
  }

  async generateWeeklyKPIReport(weekStart, options = {}) {
    this.logger.info(`Generating weekly KPI report for week starting ${weekStart}`);
    
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const weeklyKPIs = await this.kpiService.repository.findAll({
      filter: {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      },
      sort: { overallScore: -1 }
    });

    const report = {
      reportType: 'weekly_kpi',
      weekStart: weekStart,
      weekEnd: endDate.toISOString().split('T')[0],
      summary: {
        totalEmployees: weeklyKPIs.length,
        averageScore: weeklyKPIs.length > 0 ? weeklyKPIs.reduce((sum, k) => sum + k.overallScore, 0) / weeklyKPIs.length : 0,
        improvementRate: await this.calculateWeeklyImprovement(weeklyKPIs)
      },
      byDepartment: await this.groupKPIsByDepartment(weeklyKPIs),
      dailyBreakdown: await this.getDailyBreakdown(startDate, endDate),
      generatedAt: new Date()
    };

    return report;
  }

  async generateMonthlyKPIReport(year, month, options = {}) {
    this.logger.info(`Generating monthly KPI report for ${year}-${month}`);
    
    const monthlyKPIs = await this.kpiService.repository.findAll({
      filter: { year, month, evaluationPeriod: 'monthly' },
      sort: { overallScore: -1 }
    });

    const report = {
      reportType: 'monthly_kpi',
      year,
      month,
      summary: {
        totalEmployees: monthlyKPIs.length,
        averageScore: monthlyKPIs.length > 0 ? monthlyKPIs.reduce((sum, k) => sum + k.overallScore, 0) / monthlyKPIs.length : 0,
        gradeDistribution: await this.groupKPIsByGrade(monthlyKPIs),
        topPerformers: monthlyKPIs.slice(0, 20),
        lowPerformers: monthlyKPIs.slice(-20).reverse()
      },
      byDepartment: await this.groupKPIsByDepartment(monthlyKPIs),
      byDesignation: await this.groupKPIsByDesignation(monthlyKPIs),
      componentAnalysis: await this.getComponentAnalysis(monthlyKPIs),
      generatedAt: new Date()
    };

    return report;
  }

  async generateQuarterlyKPIReport(year, quarter, options = {}) {
    this.logger.info(`Generating quarterly KPI report for ${year} Q${quarter}`);
    
    const quarterlyKPIs = await this.kpiService.repository.findAll({
      filter: { year, quarter, evaluationPeriod: 'quarterly' },
      sort: { overallScore: -1 }
    });

    const report = {
      reportType: 'quarterly_kpi',
      year,
      quarter,
      summary: {
        totalEmployees: quarterlyKPIs.length,
        averageScore: quarterlyKPIs.length > 0 ? quarterlyKPIs.reduce((sum, k) => sum + k.overallScore, 0) / quarterlyKPIs.length : 0,
        quarterlyGrowth: await this.calculateQuarterlyGrowth(year, quarter)
      },
      byDepartment: await this.groupKPIsByDepartment(quarterlyKPIs),
      monthlyTrend: await this.getQuarterlyMonthlyTrend(year, quarter),
      generatedAt: new Date()
    };

    return report;
  }

  async generateYearlyKPIReport(year, options = {}) {
    this.logger.info(`Generating yearly KPI report for ${year}`);
    
    const yearlyKPIs = await this.kpiService.repository.findAll({
      filter: { year },
      sort: { overallScore: -1 }
    });

    const report = {
      reportType: 'yearly_kpi',
      year,
      summary: {
        totalEmployees: yearlyKPIs.length,
        averageScore: yearlyKPIs.length > 0 ? yearlyKPIs.reduce((sum, k) => sum + k.overallScore, 0) / yearlyKPIs.length : 0,
        yearlyGrowth: await this.calculateYearlyGrowth(year),
        gradeDistribution: await this.groupKPIsByGrade(yearlyKPIs)
      },
      byDepartment: await this.groupKPIsByDepartment(yearlyKPIs),
      quarterlyTrend: await this.getYearlyQuarterlyTrend(year),
      topPerformers: yearlyKPIs.slice(0, 50),
      lowPerformers: yearlyKPIs.slice(-50).reverse(),
      generatedAt: new Date()
    };

    return report;
  }

  // Performance Reports
  async generateEmployeePerformanceReport(employeeId, year, options = {}) {
    this.logger.info(`Generating employee performance report for ${employeeId}`);
    
    const performance = await this.performanceService.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const kpis = await this.kpiService.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const goals = await this.goalService.repository.findByOwner(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const rewards = await this.rewardService.repository.findByRecipient(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const warnings = await this.warningService.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      reportType: 'employee_performance',
      employeeId,
      year,
      performance: performance[0] || null,
      kpis,
      goals: {
        total: goals.length,
        completed: goals.filter(g => g.status === 'completed').length,
        inProgress: goals.filter(g => g.status === 'in_progress').length,
        overdue: goals.filter(g => g.status === 'overdue').length
      },
      rewards: {
        total: rewards.length,
        totalPoints: rewards.reduce((sum, r) => sum + r.points, 0),
        totalValue: rewards.reduce((sum, r) => sum + r.monetaryValue, 0)
      },
      warnings: {
        total: warnings.length,
        active: warnings.filter(w => !w.resolved).length,
        resolved: warnings.filter(w => w.resolved).length
      },
      generatedAt: new Date()
    };

    return report;
  }

  async generateDepartmentPerformanceReport(departmentId, year, options = {}) {
    this.logger.info(`Generating department performance report for ${departmentId}`);
    
    const departmentPerformance = await this.performanceService.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { 'yearlyPerformance.overallScore': -1 }
    });

    const departmentKPIs = await this.kpiService.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { overallScore: -1 }
    });

    const report = {
      reportType: 'department_performance',
      departmentId,
      year,
      summary: {
        totalEmployees: departmentPerformance.length,
        averageScore: departmentPerformance.length > 0 
          ? departmentPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / departmentPerformance.length 
          : 0,
        averageKPI: departmentKPIs.length > 0 
          ? departmentKPIs.reduce((sum, k) => sum + k.overallScore, 0) / departmentKPIs.length 
          : 0
      },
      topPerformers: departmentPerformance.slice(0, 10),
      lowPerformers: departmentPerformance.slice(-10).reverse(),
      gradeDistribution: await this.groupPerformanceByGrade(departmentPerformance),
      generatedAt: new Date()
    };

    return report;
  }

  async generateBranchPerformanceReport(branchId, year, options = {}) {
    this.logger.info(`Generating branch performance report for ${branchId}`);
    
    // Branch implementation would be added if branch module exists
    return {
      reportType: 'branch_performance',
      branchId,
      year,
      message: 'Branch module not yet implemented',
      generatedAt: new Date()
    };
  }

  // Goal Reports
  async generateGoalReport(year, options = {}) {
    this.logger.info(`Generating goal report for ${year}`);
    
    const goals = await this.goalService.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      reportType: 'goal',
      year,
      summary: {
        totalGoals: goals.length,
        completed: goals.filter(g => g.status === 'completed').length,
        inProgress: goals.filter(g => g.status === 'in_progress').length,
        notStarted: goals.filter(g => g.status === 'not_started').length,
        overdue: goals.filter(g => g.status === 'overdue').length,
        cancelled: goals.filter(g => g.status === 'cancelled').length
      },
      byDepartment: await this.groupGoalsByDepartment(goals),
      byType: await this.groupGoalsByType(goals),
      byPriority: await this.groupGoalsByPriority(goals),
      completionRate: goals.length > 0 ? (goals.filter(g => g.status === 'completed').length / goals.length) * 100 : 0,
      generatedAt: new Date()
    };

    return report;
  }

  // Reward Reports
  async generateRewardReport(year, options = {}) {
    this.logger.info(`Generating reward report for ${year}`);
    
    const rewards = await this.rewardService.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      reportType: 'reward',
      year,
      summary: {
        totalRewards: rewards.length,
        totalPoints: rewards.reduce((sum, r) => sum + r.points, 0),
        totalValue: rewards.reduce((sum, r) => sum + r.monetaryValue, 0),
        issued: rewards.filter(r => r.status === 'issued').length,
        pending: rewards.filter(r => r.status === 'pending').length
      },
      byType: await this.groupRewardsByType(rewards),
      byDepartment: await this.groupRewardsByDepartment(rewards),
      topRewarded: await this.rewardService.repository.getTopRewarded(year, 20),
      generatedAt: new Date()
    };

    return report;
  }

  // Warning Reports
  async generateWarningReport(year, options = {}) {
    this.logger.info(`Generating warning report for ${year}`);
    
    const warnings = await this.warningService.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      reportType: 'warning',
      year,
      summary: {
        totalWarnings: warnings.length,
        active: warnings.filter(w => !w.resolved).length,
        resolved: warnings.filter(w => w.resolved).length,
        appealed: warnings.filter(w => w.appealed).length,
        escalated: warnings.filter(w => w.escalated).length
      },
      byType: await this.groupWarningsByType(warnings),
      bySeverity: await this.groupWarningsBySeverity(warnings),
      byDepartment: await this.groupWarningsByDepartment(warnings),
      generatedAt: new Date()
    };

    return report;
  }

  // Appraisal Reports
  async generateAppraisalReport(year, options = {}) {
    this.logger.info(`Generating appraisal report for ${year}`);
    
    const appraisals = await this.appraisalService.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      reportType: 'appraisal',
      year,
      summary: {
        totalAppraisals: appraisals.length,
        completed: appraisals.filter(a => a.status === 'completed').length,
        underReview: appraisals.filter(a => a.status === 'under_review').length,
        draft: appraisals.filter(a => a.status === 'draft').length,
        averageRating: appraisals.length > 0 
          ? appraisals.reduce((sum, a) => sum + a.finalRating, 0) / appraisals.length 
          : 0
      },
      byDepartment: await this.groupAppraisalsByDepartment(appraisals),
      promotionEligible: appraisals.filter(a => a.promotion.eligible),
      incrementEligible: appraisals.filter(a => a.increment.eligible),
      bonusEligible: appraisals.filter(a => a.bonus.eligible),
      trainingRequired: appraisals.filter(a => a.trainingRequired),
      generatedAt: new Date()
    };

    return report;
  }

  // Promotion Reports
  async generatePromotionReport(year, options = {}) {
    this.logger.info(`Generating promotion report for ${year}`);
    
    const promotionEligible = await this.performanceService.repository.getPromotionEligible(year);
    const appraisals = await this.appraisalService.repository.findAll({
      filter: { year, 'promotion.eligible': true },
      sort: { finalRating: -1 }
    });

    const report = {
      reportType: 'promotion',
      year,
      summary: {
        totalCandidates: promotionEligible.length,
        byDepartment: await this.groupByDepartment(promotionEligible),
        byDesignation: await this.groupByDesignation(promotionEligible)
      },
      candidates: promotionEligible,
      recommendations: appraisals.map(a => ({
        employee: a.employee,
        currentDesignation: a.designation,
        recommendedLevel: a.promotion.recommendedLevel,
        effectiveDate: a.promotion.effectiveDate
      })),
      generatedAt: new Date()
    };

    return report;
  }

  // Training Reports
  async generateTrainingReport(year, options = {}) {
    this.logger.info(`Generating training report for ${year}`);
    
    const trainingRequired = await this.appraisalService.repository.findAll({
      filter: { year, trainingRequired: true },
      sort: { createdAt: -1 }
    });

    const report = {
      reportType: 'training',
      year,
      summary: {
        totalEmployees: trainingRequired.length,
        byDepartment: await this.groupByDepartment(trainingRequired),
        byTrainingType: await this.groupByTrainingType(trainingRequired)
      },
      employees: trainingRequired,
      recommendations: trainingRequired.flatMap(a => a.trainingRecommendations),
      generatedAt: new Date()
    };

    return report;
  }

  // Executive Reports
  async generateExecutiveReport(reportType, year, options = {}) {
    this.logger.info(`Generating executive report: ${reportType} for ${year}`);
    
    switch (reportType) {
      case 'organization':
        return await this.executiveService.getOrganizationOverview(year);
      case 'department':
        return await this.executiveService.getDepartmentComparison(year);
      case 'risk':
        return await this.executiveService.getRiskAnalysis(year);
      case 'trend':
        return await this.executiveService.getOrganizationTrend([year - 2, year - 1, year]);
      case 'health':
        return await this.executiveService.calculateOrganizationHealthScore(year);
      default:
        throw new AppError(`Unknown executive report type: ${reportType}`, 400);
    }
  }

  // Helper Methods
  async groupKPIsByDepartment(kpis) {
    const grouped = {};
    kpis.forEach(kpi => {
      const deptId = kpi.department?.toString() || 'unknown';
      if (!grouped[deptId]) grouped[deptId] = [];
      grouped[deptId].push(kpi);
    });
    
    const result = {};
    for (const [deptId, deptKPIs] of Object.entries(grouped)) {
      result[deptId] = {
        count: deptKPIs.length,
        averageScore: deptKPIs.reduce((sum, k) => sum + k.overallScore, 0) / deptKPIs.length,
        topPerformer: deptKPIs[0],
        lowPerformer: deptKPIs[deptKPIs.length - 1]
      };
    }
    return result;
  }

  async groupKPIsByGrade(kpis) {
    const grouped = {
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0, 'N/A': 0
    };
    kpis.forEach(kpi => {
      const grade = kpi.performanceGrade || 'N/A';
      if (grouped[grade] !== undefined) grouped[grade]++;
    });
    return grouped;
  }

  async groupKPIsByDesignation(kpis) {
    const grouped = {};
    kpis.forEach(kpi => {
      const desigId = kpi.designation?.toString() || 'unknown';
      if (!grouped[desigId]) grouped[desigId] = [];
      grouped[desigId].push(kpi);
    });
    
    const result = {};
    for (const [desigId, desigKPIs] of Object.entries(grouped)) {
      result[desigId] = {
        count: desigKPIs.length,
        averageScore: desigKPIs.reduce((sum, k) => sum + k.overallScore, 0) / desigKPIs.length
      };
    }
    return result;
  }

  async getComponentAnalysis(kpis) {
    const components = ['attendance', 'task', 'productivity', 'quality', 'discipline', 'projectContribution', 'meetingParticipation'];
    const analysis = {};
    
    components.forEach(component => {
      const scores = kpis.map(k => k.scores[component] || 0);
      analysis[component] = {
        average: scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0,
        max: Math.max(...scores),
        min: Math.min(...scores)
      };
    });
    
    return analysis;
  }

  async calculateWeeklyImprovement(kpis) {
    // Implementation would compare with previous week
    return 0;
  }

  async getDailyBreakdown(startDate, endDate) {
    const breakdown = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayKPIs = await this.kpiService.repository.findAll({
        filter: {
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate }
        },
        sort: { overallScore: -1 }
      });
      
      breakdown.push({
        date: currentDate.toISOString().split('T')[0],
        averageScore: dayKPIs.length > 0 ? dayKPIs.reduce((sum, k) => sum + k.overallScore, 0) / dayKPIs.length : 0,
        count: dayKPIs.length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return breakdown;
  }

  async calculateQuarterlyGrowth(year, quarter) {
    // Implementation would compare with previous quarter
    return 0;
  }

  async getQuarterlyMonthlyTrend(year, quarter) {
    const months = quarter === 1 ? [1, 2, 3] : quarter === 2 ? [4, 5, 6] : quarter === 3 ? [7, 8, 9] : [10, 11, 12];
    const trend = [];
    
    for (const month of months) {
      const monthKPIs = await this.kpiService.repository.findAll({
        filter: { year, month },
        sort: { overallScore: -1 }
      });
      
      trend.push({
        month,
        averageScore: monthKPIs.length > 0 ? monthKPIs.reduce((sum, k) => sum + k.overallScore, 0) / monthKPIs.length : 0
      });
    }
    
    return trend;
  }

  async calculateYearlyGrowth(year) {
    // Implementation would compare with previous year
    return 0;
  }

  async getYearlyQuarterlyTrend(year) {
    const trend = [];
    for (let quarter = 1; quarter <= 4; quarter++) {
      const quarterKPIs = await this.kpiService.repository.findAll({
        filter: { year, quarter },
        sort: { overallScore: -1 }
      });
      
      trend.push({
        quarter,
        averageScore: quarterKPIs.length > 0 ? quarterKPIs.reduce((sum, k) => sum + k.overallScore, 0) / quarterKPIs.length : 0
      });
    }
    return trend;
  }

  async groupPerformanceByGrade(performances) {
    const grouped = {
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0, 'N/A': 0
    };
    performances.forEach(p => {
      const grade = p.yearlyPerformance?.grade || 'N/A';
      if (grouped[grade] !== undefined) grouped[grade]++;
    });
    return grouped;
  }

  async groupGoalsByDepartment(goals) {
    const grouped = {};
    goals.forEach(goal => {
      const deptId = goal.department?.toString() || 'unknown';
      if (!grouped[deptId]) grouped[deptId] = [];
      grouped[deptId].push(goal);
    });
    
    const result = {};
    for (const [deptId, deptGoals] of Object.entries(grouped)) {
      result[deptId] = {
        total: deptGoals.length,
        completed: deptGoals.filter(g => g.status === 'completed').length,
        completionRate: deptGoals.length > 0 ? (deptGoals.filter(g => g.status === 'completed').length / deptGoals.length) * 100 : 0
      };
    }
    return result;
  }

  async groupGoalsByType(goals) {
    const grouped = {};
    goals.forEach(goal => {
      const type = goal.type || 'other';
      if (!grouped[type]) grouped[type] = 0;
      grouped[type]++;
    });
    return grouped;
  }

  async groupGoalsByPriority(goals) {
    const grouped = { high: 0, medium: 0, low: 0 };
    goals.forEach(goal => {
      const priority = goal.priority || 'medium';
      if (grouped[priority] !== undefined) grouped[priority]++;
    });
    return grouped;
  }

  async groupRewardsByType(rewards) {
    const grouped = {};
    rewards.forEach(reward => {
      const type = reward.type || 'other';
      if (!grouped[type]) grouped[type] = 0;
      grouped[type]++;
    });
    return grouped;
  }

  async groupRewardsByDepartment(rewards) {
    const grouped = {};
    rewards.forEach(reward => {
      const deptId = reward.department?.toString() || 'unknown';
      if (!grouped[deptId]) grouped[deptId] = [];
      grouped[deptId].push(reward);
    });
    
    const result = {};
    for (const [deptId, deptRewards] of Object.entries(grouped)) {
      result[deptId] = {
        count: deptRewards.length,
        totalPoints: deptRewards.reduce((sum, r) => sum + r.points, 0),
        totalValue: deptRewards.reduce((sum, r) => sum + r.monetaryValue, 0)
      };
    }
    return result;
  }

  async groupWarningsByType(warnings) {
    const grouped = {};
    warnings.forEach(warning => {
      const type = warning.type || 'other';
      if (!grouped[type]) grouped[type] = 0;
      grouped[type]++;
    });
    return grouped;
  }

  async groupWarningsBySeverity(warnings) {
    const grouped = { critical: 0, high: 0, medium: 0, low: 0 };
    warnings.forEach(warning => {
      const severity = warning.severity || 'medium';
      if (grouped[severity] !== undefined) grouped[severity]++;
    });
    return grouped;
  }

  async groupWarningsByDepartment(warnings) {
    const grouped = {};
    warnings.forEach(warning => {
      const deptId = warning.department?.toString() || 'unknown';
      if (!grouped[deptId]) grouped[deptId] = [];
      grouped[deptId].push(warning);
    });
    
    const result = {};
    for (const [deptId, deptWarnings] of Object.entries(grouped)) {
      result[deptId] = {
        count: deptWarnings.length,
        active: deptWarnings.filter(w => !w.resolved).length,
        resolved: deptWarnings.filter(w => w.resolved).length
      };
    }
    return result;
  }

  async groupAppraisalsByDepartment(appraisals) {
    const grouped = {};
    appraisals.forEach(appraisal => {
      const deptId = appraisal.department?.toString() || 'unknown';
      if (!grouped[deptId]) grouped[deptId] = [];
      grouped[deptId].push(appraisal);
    });
    
    const result = {};
    for (const [deptId, deptAppraisals] of Object.entries(grouped)) {
      result[deptId] = {
        count: deptAppraisals.length,
        averageRating: deptAppraisals.reduce((sum, a) => sum + a.finalRating, 0) / deptAppraisals.length,
        completed: deptAppraisals.filter(a => a.status === 'completed').length
      };
    }
    return result;
  }

  async groupByDepartment(employees) {
    const grouped = {};
    employees.forEach(emp => {
      const deptId = emp.department?.toString() || 'unknown';
      if (!grouped[deptId]) grouped[deptId] = [];
      grouped[deptId].push(emp);
    });
    
    const result = {};
    for (const [deptId, deptEmployees] of Object.entries(grouped)) {
      result[deptId] = {
        count: deptEmployees.length
      };
    }
    return result;
  }

  async groupByDesignation(employees) {
    const grouped = {};
    employees.forEach(emp => {
      const desigId = emp.designation?.toString() || 'unknown';
      if (!grouped[desigId]) grouped[desigId] = [];
      grouped[desigId].push(emp);
    });
    
    const result = {};
    for (const [desigId, desigEmployees] of Object.entries(grouped)) {
      result[desigId] = {
        count: desigEmployees.length
      };
    }
    return result;
  }

  async groupByTrainingType(appraisals) {
    const grouped = {};
    appraisals.forEach(appraisal => {
      appraisal.trainingRecommendations?.forEach(training => {
        const type = training.trainingType || 'other';
        if (!grouped[type]) grouped[type] = 0;
        grouped[type]++;
      });
    });
    return grouped;
  }
}

const reportService = new ReportService();
export default reportService;
