import kpiRepository from './kpi.repository.js';
import goalRepository from './goal.repository.js';
import appraisalRepository from './appraisal.repository.js';
import rewardRepository from './reward.repository.js';
import warningRepository from './warning.repository.js';
import performanceRepository from './performance.repository.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';

class ExecutiveService {
  constructor() {
    this.kpiRepository = kpiRepository;
    this.goalRepository = goalRepository;
    this.appraisalRepository = appraisalRepository;
    this.rewardRepository = rewardRepository;
    this.warningRepository = warningRepository;
    this.performanceRepository = performanceRepository;
    this.logger = Logger;
  }

  // Organization Overview Methods
  async getOrganizationOverview(year) {
    this.logger.info(`Getting organization overview for ${year}`);
    
    const allKPIs = await this.kpiRepository.findByYear(year, {
      sort: { overallScore: -1 }
    });

    const allGoals = await this.goalRepository.findAll({
      filter: { year, isDeleted: false }
    });

    const allAppraisals = await this.appraisalRepository.findAll({
      filter: { year, isDeleted: false }
    });

    const allRewards = await this.rewardRepository.findAll({
      filter: { year, isDeleted: false }
    });

    const allWarnings = await this.warningRepository.findAll({
      filter: { year, isDeleted: false }
    });

    const overview = {
      year,
      kpi: {
        totalEmployees: allKPIs.length,
        averageScore: allKPIs.length > 0 ? allKPIs.reduce((sum, k) => sum + k.overallScore, 0) / allKPIs.length : 0,
        topPerformers: allKPIs.slice(0, 5),
        lowPerformers: allKPIs.slice(-5).reverse()
      },
      goals: {
        totalGoals: allGoals.length,
        completedGoals: allGoals.filter(g => g.status === 'completed').length,
        inProgressGoals: allGoals.filter(g => g.status === 'active').length,
        overdueGoals: allGoals.filter(g => new Date(g.dueDate) < new Date() && g.status !== 'completed').length
      },
      appraisals: {
        totalAppraisals: allAppraisals.length,
        completedAppraisals: allAppraisals.filter(a => a.status === 'finalized').length,
        pendingAppraisals: allAppraisals.filter(a => a.status === 'pending').length,
        averageRating: allAppraisals.filter(a => a.finalRating).length > 0 
          ? allAppraisals.filter(a => a.finalRating).reduce((sum, a) => sum + a.finalRating, 0) / allAppraisals.filter(a => a.finalRating).length 
          : 0
      },
      rewards: {
        totalRewards: allRewards.length,
        approvedRewards: allRewards.filter(r => r.status === 'approved').length,
        totalAmount: allRewards.reduce((sum, r) => sum + (r.amount || 0), 0),
        totalPoints: allRewards.reduce((sum, r) => sum + (r.points || 0), 0)
      },
      warnings: {
        totalWarnings: allWarnings.length,
        activeWarnings: allWarnings.filter(w => w.status === 'active').length,
        resolvedWarnings: allWarnings.filter(w => w.status === 'resolved').length,
        severeWarnings: allWarnings.filter(w => w.severity === 'high').length
      }
    };

    return overview;
  }

  // Department Performance Comparison
  async getDepartmentComparison(year) {
    this.logger.info(`Getting department comparison for ${year}`);
    
    const Department = (await import('../department/department.model.js')).default;
    const departments = await Department.find({ isDeleted: false });

    const comparison = [];
    for (const department of departments) {
      const departmentKPIs = await this.kpiRepository.findByDepartment(department._id, {
        filter: { year },
        sort: { overallScore: -1 }
      });

      const departmentGoals = await this.goalRepository.findByDepartment(department._id, {
        filter: { year, isDeleted: false }
      });

      const departmentRewards = await this.rewardRepository.findByDepartment(department._id, {
        filter: { year, isDeleted: false }
      });

      const departmentWarnings = await this.warningRepository.findByDepartment(department._id, {
        filter: { year, isDeleted: false }
      });

      comparison.push({
        departmentId: department._id,
        departmentName: department.name,
        kpi: {
          totalEmployees: departmentKPIs.length,
          averageScore: departmentKPIs.length > 0 ? departmentKPIs.reduce((sum, k) => sum + k.overallScore, 0) / departmentKPIs.length : 0
        },
        goals: {
          totalGoals: departmentGoals.length,
          completedGoals: departmentGoals.filter(g => g.status === 'completed').length
        },
        rewards: {
          totalRewards: departmentRewards.length,
          totalAmount: departmentRewards.reduce((sum, r) => sum + (r.amount || 0), 0)
        },
        warnings: {
          totalWarnings: departmentWarnings.length,
          activeWarnings: departmentWarnings.filter(w => w.status === 'active').length
        }
      });
    }

    return comparison.sort((a, b) => b.kpi.averageScore - a.kpi.averageScore);
  }

  // Executive Dashboard
  async getExecutiveDashboard(year) {
    this.logger.info(`Getting executive dashboard for ${year}`);
    
    const overview = await this.getOrganizationOverview(year);
    const departmentComparison = await this.getDepartmentComparison(year);
    const topPerformers = await this.performanceRepository.getTopPerformers(year, 10);
    const lowPerformers = await this.performanceRepository.getLowPerformers(year, 10);
    const promotionEligible = await this.performanceRepository.getPromotionEligible(year);
    const bonusEligible = await this.performanceRepository.getBonusEligible(year);

    return {
      year,
      overview,
      departmentComparison: departmentComparison.slice(0, 10),
      topPerformers,
      lowPerformers,
      promotionEligible: promotionEligible.slice(0, 10),
      bonusEligible: bonusEligible.slice(0, 10)
    };
  }

  // Trend Analysis
  async getOrganizationTrend(years) {
    this.logger.info(`Getting organization trend for years ${years}`);
    
    const trendData = [];
    for (const year of years) {
      const yearData = await this.getOrganizationOverview(year);
      trendData.push({
        year,
        averageScore: yearData.kpi.averageScore,
        totalGoals: yearData.goals.totalGoals,
        completedGoals: yearData.goals.completedGoals,
        totalRewards: yearData.rewards.totalRewards,
        totalWarnings: yearData.warnings.totalWarnings
      });
    }

    return trendData;
  }

  // Risk Analysis
  async getRiskAnalysis(year) {
    this.logger.info(`Getting risk analysis for ${year}`);
    
    const lowPerformers = await this.performanceRepository.getLowPerformers(year, 20);
    const activeWarnings = await this.warningRepository.findUnresolved({ filter: { year } });
    const pendingAppeals = await this.warningRepository.findPendingAppeals({ filter: { year } });
    const overdueGoals = await this.goalRepository.findAll({
      filter: { year, status: 'active', isDeleted: false },
      sort: { dueDate: 1 }
    });

    const overdueGoalsList = overdueGoals.filter(g => new Date(g.dueDate) < new Date());

    const riskAnalysis = {
      year,
      performanceRisks: lowPerformers.map(p => ({
        employee: p.employee,
        employeeName: p.employeeName,
        department: p.department,
        overallScore: p.overallScore,
        riskLevel: p.overallScore < 40 ? 'high' : p.overallScore < 50 ? 'medium' : 'low'
      })),
      warningRisks: activeWarnings.map(w => ({
        employee: w.employee,
        employeeName: w.employeeName,
        type: w.type,
        severity: w.severity,
        riskLevel: w.severity === 'high' ? 'high' : w.severity === 'medium' ? 'medium' : 'low'
      })),
      appealRisks: pendingAppeals.map(w => ({
        employee: w.employee,
        employeeName: w.employeeName,
        appealReason: w.appeal?.reason,
        riskLevel: 'medium'
      })),
      goalRisks: overdueGoalsList.map(g => ({
        employee: g.owner,
        employeeName: g.ownerName,
        goalTitle: g.title,
        dueDate: g.dueDate,
        daysOverdue: Math.floor((new Date() - new Date(g.dueDate)) / (1000 * 60 * 60 * 24)),
        riskLevel: 'high'
      }))
    };

    return riskAnalysis;
  }

  // Executive Reports
  async generateExecutiveReport(reportType, year) {
    this.logger.info(`Generating executive report: ${reportType} for ${year}`);
    
    switch (reportType) {
      case 'organization-overview':
        return await this.getOrganizationOverview(year);
      case 'department-comparison':
        return await this.getDepartmentComparison(year);
      case 'risk-analysis':
        return await this.getRiskAnalysis(year);
      case 'trend-analysis':
        return await this.getOrganizationTrend([year - 2, year - 1, year]);
      case 'executive-dashboard':
        return await this.getExecutiveDashboard(year);
      default:
        throw new AppError('Invalid report type', 400);
    }
  }

  // Key Metrics
  async getKeyMetrics(year) {
    this.logger.info(`Getting key metrics for ${year}`);
    
    const overview = await this.getOrganizationOverview(year);
    const departmentComparison = await this.getDepartmentComparison(year);

    const metrics = {
      year,
      performance: {
        organizationAverage: overview.kpi.averageScore,
        topDepartment: departmentComparison[0]?.departmentName || 'N/A',
        bottomDepartment: departmentComparison[departmentComparison.length - 1]?.departmentName || 'N/A',
        topPerformer: overview.kpi.topPerformers[0]?.employeeName || 'N/A'
     ,
        lowPerformer: overview.kpi.lowPerformers[0]?.employeeName || 'N/A'
      },
      goals: {
        completionRate: overview.goals.totalGoals > 0 
          ? (overview.goals.completedGoals / overview.goals.totalGoals) * 100 
          : 0,
        overdueRate: overview.goals.totalGoals > 0 
          ? (overview.goals.overdueGoals / overview.goals.totalGoals) * 100 
          : 0
      },
      appraisals: {
        completionRate: overview.apraisals.totalAppraisals > 0 
          ? (overview.apraisals.completedAppraisals / overview.apraisals.totalAppraisals) * 100 
          : 0,
        averageRating: overview.apraisals.averageRating
      },
      rewards: {
        totalInvestment: overview.rewards.totalAmount,
        rewardsPerEmployee: overview.kpi.totalEmployees > 0 
          ? overview.rewards.totalRewards / overview.kpi.totalEmployees 
          : 0
      },
      warnings: {
        warningRate: overview.kpi.totalEmployees > 0 
          ? (overview.warnings.totalWarnings / overview.kpi.totalEmployees) * 100 
          : 0,
        severeWarningRate: overview.warnings.totalWarnings > 0 
          ? (overview.warnings.severeWarnings / overview.warnings.totalWarnings) * 100 
          : 0
      }
    };

    return metrics;
  }

  // Department Deep Dive
  async getDepartmentDeepDive(departmentId, year) {
    this.logger.info(`Getting department deep dive for ${departmentId}`);
    
    const Department = (await import('../department/department.model.js')).default;
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const departmentKPIs = await this.kpiRepository.findByDepartment(departmentId, {
      filter: { year },
      sort: { overallScore: -1 }
    });

    const departmentGoals = await this.goalRepository.findByDepartment(departmentId, {
      filter: { year, isDeleted: false }
    });

    const departmentAppraisals = await this.appraisalRepository.findByDepartment(departmentId, {
      filter: { year, isDeleted: false }
    });

    const departmentRewards = await this.rewardRepository.findByDepartment(departmentId, {
      filter: { year, isDeleted: false }
    });

    const departmentWarnings = await this.warningRepository.findByDepartment(departmentId, {
      filter: { year, isDeleted: false }
    });

    const deepDive = {
      departmentId,
      departmentName: department.name,
      year,
      employees: {
        total: departmentKPIs.length,
        averageScore: departmentKPIs.length > 0 ? departmentKPIs.reduce((sum, k) => sum + k.overallScore, 0) / departmentKPIs.length : 0,
        topPerformers: departmentKPIs.slice(0, 5),
        lowPerformers: departmentKPIs.slice(-5).reverse()
      },
      goals: {
        total: departmentGoals.length,
        completed: departmentGoals.filter(g => g.status === 'completed').length,
        inProgress: departmentGoals.filter(g => g.status === 'active').length,
        overdue: departmentGoals.filter(g => new Date(g.dueDate) < new Date() && g.status !== 'completed').length
      },
      appraisals: {
        total: departmentAppraisals.length,
        completed: departmentAppraisals.filter(a => a.status === 'finalized').length,
        pending: departmentAppraisals.filter(a => a.status === 'pending').length,
        averageRating: departmentAppraisals.filter(a => a.finalRating).length > 0 
          ? departmentAppraisals.filter(a => a.finalRating).reduce((sum, a) => sum + a.finalRating, 0) / departmentAppraisals.filter(a => a.finalRating).length 
          : 0
      },
      rewards: {
        total: departmentRewards.length,
        totalAmount: departmentRewards.reduce((sum, r) => sum + (r.amount || 0), 0),
        totalPoints: departmentRewards.reduce((sum, r) => sum + (r.points || 0), 0)
      },
      warnings: {
        total: departmentWarnings.length,
        active: departmentWarnings.filter(w => w.status === 'active').length,
        resolved: departmentWarnings.filter(w => w.status === 'resolved').length,
        severe: departmentWarnings.filter(w => w.severity === 'high').length
      }
    };

    return deepDive;
  }

  // Employee Performance Summary
  async getEmployeePerformanceSummary(employeeId, year) {
    this.logger.info(`Getting employee performance summary for ${employeeId}`);
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const kpi = await this.kpiRepository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const goals = await this.goalRepository.findByOwner(employeeId, {
      filter: { year, isDeleted: false }
    });

    const appraisals = await this.appraisalRepository.findByEmployee(employeeId, {
      filter: { year, isDeleted: false }
    });

    const rewards = await this.rewardRepository.findByRecipient(employeeId, {
      filter: { year, isDeleted: false }
    });

    const warnings = await this.warningRepository.findByEmployee(employeeId, {
      filter: { year, isDeleted: false }
    });

    const summary = {
      employeeId,
      employeeName: employee.firstName + ' ' + employee.lastName,
      department: employee.department,
      designation: employee.designation,
      year,
      kpi: kpi[0] || null,
      goals: {
        total: goals.length,
        completed: goals.filter(g => g.status === 'completed').length,
        inProgress: goals.filter(g => g.status === 'active').length
      },
      appraisals: {
        total: appraisals.length,
        completed: appraisals.filter(a => a.status === 'finalized').length,
        finalRating: appraisals.find(a => a.status === 'finalized')?.finalRating || null,
        finalGrade: appraisals.find(a => a.status === 'finalized')?.finalGrade || null
      },
      rewards: {
        total: rewards.length,
        totalPoints: rewards.reduce((sum, r) => sum + (r.points || 0), 0),
        totalAmount: rewards.reduce((sum, r) => sum + (r.amount || 0), 0)
      },
      warnings: {
        total: warnings.length,
        active: warnings.filter(w => w.status === 'active').length,
        resolved: warnings.filter(w => w.status === 'resolved').length
      }
    };

    return summary;
  }

  // Organization Health Score
  async calculateOrganizationHealthScore(year) {
    this.logger.info(`Calculating organization health score for ${year}`);
    
    const overview = await this.getOrganizationOverview(year);
    
    // Calculate health score based on various factors
    const performanceScore = overview.kpi.averageScore;
    const goalCompletionScore = overview.goals.totalGoals > 0 
      ? (overview.goals.completedGoals / overview.goals.totalGoals) * 100 
      : 0;
    const appraisalCompletionScore = overview.apraisals.totalAppraisals > 0 
      ? (overview.apraisals.completedAppraisals / overview.apraisals.totalAppraisals) * 100 
      : 0;
    const warningScore = 100 - (overview.kpi.totalEmployees > 0 
      ? (overview.warnings.activeWarnings / overview.kpi.totalEmployees) * 100 
      : 0);

    const healthScore = (performanceScore * 0.4) + (goalCompletionScore * 0.2) + 
                       (appraisalCompletionScore * 0.2) + (warningScore * 0.2);

    return {
      year,
      healthScore: Math.round(healthScore),
      components: {
        performance: Math.round(performanceScore),
        goalCompletion: Math.round(goalCompletionScore),
        appraisalCompletion: Math.round(appraisalCompletionScore),
        warningScore: Math.round(warningScore)
      },
      status: healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : healthScore >= 40 ? 'fair' : 'poor'
    };
  }
}

const executiveService = new ExecutiveService();
export default executiveService;
