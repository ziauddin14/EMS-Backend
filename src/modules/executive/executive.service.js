import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import organizationHealthService from './organizationHealth.service.js';
import executiveDashboardService from './executiveDashboard.service.js';
import executiveAnalyticsService from './executiveAnalytics.service.js';
import executiveInsightsService from './executiveInsights.service.js';
import executiveReportsService from './executiveReports.service.js';

class ExecutiveService {
  constructor() {
    this.logger = Logger;
    this.healthService = organizationHealthService;
    this.dashboardService = executiveDashboardService;
    this.analyticsService = executiveAnalyticsService;
    this.insightsService = executiveInsightsService;
    this.reportsService = executiveReportsService;
  }

  // Organization Health Methods
  async getOrganizationHealth(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      return await this.healthService.calculateOrganizationHealth(startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting organization health:', error);
      throw error;
    }
  }

  async getDepartmentHealth(departmentId, period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      return await this.healthService.calculateDepartmentHealth(departmentId, startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting department health:', error);
      throw error;
    }
  }

  async getBranchHealth(branchId, period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      return await this.healthService.calculateBranchHealth(branchId, startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting branch health:', error);
      throw error;
    }
  }

  async getEmployeeHealth(employeeId, period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      return await this.healthService.calculateEmployeeHealth(employeeId, startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting employee health:', error);
      throw error;
    }
  }

  async getHealthSummary(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      return await this.healthService.getHealthSummary(startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting health summary:', error);
      throw error;
    }
  }

  // Dashboard Methods
  async getOrganizationOverview(period = 'this_month') {
    try {
      return await this.dashboardService.getOrganizationOverview(period);
    } catch (error) {
      this.logger.error('Error getting organization overview:', error);
      throw error;
    }
  }

  async getCompanyHealthScore(period = 'this_month') {
    try {
      return await this.dashboardService.getCompanyHealthScore(period);
    } catch (error) {
      this.logger.error('Error getting company health score:', error);
      throw error;
    }
  }

  async getDepartmentHealthScore(departmentId, period = 'this_month') {
    try {
      return await this.dashboardService.getDepartmentHealthScore(departmentId, period);
    } catch (error) {
      this.logger.error('Error getting department health score:', error);
      throw error;
    }
  }

  async getBranchHealthScore(branchId, period = 'this_month') {
    try {
      return await this.dashboardService.getBranchHealthScore(branchId, period);
    } catch (error) {
      this.logger.error('Error getting branch health score:', error);
      throw error;
    }
  }

  async getEmployeeHealthScore(employeeId, period = 'this_month') {
    try {
      return await this.dashboardService.getEmployeeHealthScore(employeeId, period);
    } catch (error) {
      this.logger.error('Error getting employee health score:', error);
      throw error;
    }
  }

  async getAttendanceOverview(period = 'this_month') {
    try {
      return await this.dashboardService.getAttendanceOverview(period);
    } catch (error) {
      this.logger.error('Error getting attendance overview:', error);
      throw error;
    }
  }

  async getTaskOverview(period = 'this_month') {
    try {
      return await this.dashboardService.getTaskOverview(period);
    } catch (error) {
      this.logger.error('Error getting task overview:', error);
      throw error;
    }
  }

  async getProjectOverview(period = 'this_month') {
    try {
      return await this.dashboardService.getProjectOverview(period);
    } catch (error) {
      this.logger.error('Error getting project overview:', error);
      throw error;
    }
  }

  async getKPIOverview(period = 'this_month') {
    try {
      return await this.dashboardService.getKPIOverview(period);
    } catch (error) {
      this.logger.error('Error getting KPI overview:', error);
      throw error;
    }
  }

  async getMeetingOverview(period = 'this_month') {
    try {
      return await this.dashboardService.getMeetingOverview(period);
    } catch (error) {
      this.logger.error('Error getting meeting overview:', error);
      throw error;
    }
  }

  async getProductivityOverview(period = 'this_month') {
    try {
      return await this.dashboardService.getProductivityOverview(period);
    } catch (error) {
      this.logger.error('Error getting productivity overview:', error);
      throw error;
    }
  }

  async getOrganizationSummary(period = 'this_month') {
    try {
      return await this.dashboardService.getOrganizationSummary(period);
    } catch (error) {
      this.logger.error('Error getting organization summary:', error);
      throw error;
    }
  }

  // Analytics Methods
  async getTrendAnalytics(startDate, endDate, granularity = 'monthly', comparison = null) {
    try {
      return await this.analyticsService.getTrendAnalytics(startDate, endDate, granularity, comparison);
    } catch (error) {
      this.logger.error('Error getting trend analytics:', error);
      throw error;
    }
  }

  async getGrowthAnalytics(startDate, endDate, granularity = 'monthly') {
    try {
      return await this.analyticsService.getGrowthAnalytics(startDate, endDate, granularity);
    } catch (error) {
      this.logger.error('Error getting growth analytics:', error);
      throw error;
    }
  }

  async getProductivityAnalytics(startDate, endDate, granularity = 'monthly') {
    try {
      return await this.analyticsService.getProductivityAnalytics(startDate, endDate, granularity);
    } catch (error) {
      this.logger.error('Error getting productivity analytics:', error);
      throw error;
    }
  }

  async getPerformanceAnalytics(startDate, endDate, granularity = 'monthly') {
    try {
      return await this.analyticsService.getPerformanceAnalytics(startDate, endDate, granularity);
    } catch (error) {
      this.logger.error('Error getting performance analytics:', error);
      throw error;
    }
  }

  async getAttendanceAnalytics(startDate, endDate, granularity = 'monthly') {
    try {
      return await this.analyticsService.getAttendanceAnalytics(startDate, endDate, granularity);
    } catch (error) {
      this.logger.error('Error getting attendance analytics:', error);
      throw error;
    }
  }

  async getProjectAnalytics(startDate, endDate, granularity = 'monthly') {
    try {
      return await this.analyticsService.getProjectAnalytics(startDate, endDate, granularity);
    } catch (error) {
      this.logger.error('Error getting project analytics:', error);
      throw error;
    }
  }

  async getTaskAnalytics(startDate, endDate, granularity = 'monthly') {
    try {
      return await this.analyticsService.getTaskAnalytics(startDate, endDate, granularity);
    } catch (error) {
      this.logger.error('Error getting task analytics:', error);
      throw error;
    }
  }

  async getMeetingAnalytics(startDate, endDate, granularity = 'monthly') {
    try {
      return await this.analyticsService.getMeetingAnalytics(startDate, endDate, granularity);
    } catch (error) {
      this.logger.error('Error getting meeting analytics:', error);
      throw error;
    }
  }

  async getDepartmentAnalytics(startDate, endDate, departmentId = null) {
    try {
      return await this.analyticsService.getDepartmentAnalytics(startDate, endDate, departmentId);
    } catch (error) {
      this.logger.error('Error getting department analytics:', error);
      throw error;
    }
  }

  async getBranchAnalytics(startDate, endDate, branchId = null) {
    try {
      return await this.analyticsService.getBranchAnalytics(startDate, endDate, branchId);
    } catch (error) {
      this.logger.error('Error getting branch analytics:', error);
      throw error;
    }
  }

  async getOrganizationAnalytics(startDate, endDate) {
    try {
      return await this.analyticsService.getOrganizationAnalytics(startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting organization analytics:', error);
      throw error;
    }
  }

  // Insights Methods
  async getTopPerformers(limit = 10, period = 'this_month') {
    try {
      return await this.insightsService.getTopPerformers(limit, period);
    } catch (error) {
      this.logger.error('Error getting top performers:', error);
      throw error;
    }
  }

  async getBottomPerformers(limit = 10, period = 'this_month') {
    try {
      return await this.insightsService.getBottomPerformers(limit, period);
    } catch (error) {
      this.logger.error('Error getting bottom performers:', error);
      throw error;
    }
  }

  async getDepartmentRankings(metric = 'healthScore', period = 'this_month') {
    try {
      return await this.insightsService.getDepartmentRankings(metric, period);
    } catch (error) {
      this.logger.error('Error getting department rankings:', error);
      throw error;
    }
  }

  async getBranchRankings(metric = 'healthScore', period = 'this_month') {
    try {
      return await this.insightsService.getBranchRankings(metric, period);
    } catch (error) {
      this.logger.error('Error getting branch rankings:', error);
      throw error;
    }
  }

  async getPromotionPipeline(departmentId = null, limit = 50) {
    try {
      return await this.insightsService.getPromotionPipeline(departmentId, limit);
    } catch (error) {
      this.logger.error('Error getting promotion pipeline:', error);
      throw error;
    }
  }

  async getTrainingPipeline(departmentId = null, limit = 50) {
    try {
      return await this.insightsService.getTrainingPipeline(departmentId, limit);
    } catch (error) {
      this.logger.error('Error getting training pipeline:', error);
      throw error;
    }
  }

  async getSuccessionPlanning(role = null, limit = 50) {
    try {
      return await this.insightsService.getSuccessionPlanning(role, limit);
    } catch (error) {
      this.logger.error('Error getting succession planning:', error);
      throw error;
    }
  }

  async getLeadershipPipeline(level = null, limit = 50) {
    try {
      return await this.insightsService.getLeadershipPipeline(level, limit);
    } catch (error) {
      this.logger.error('Error getting leadership pipeline:', error);
      throw error;
    }
  }

  async getAttritionRisk(departmentId = null, branchId = null, limit = 50) {
    try {
      return await this.insightsService.getAttritionRisk(departmentId, branchId, limit);
    } catch (error) {
      this.logger.error('Error getting attrition risk:', error);
      throw error;
    }
  }

  async getHiringRecommendation(departmentId = null, branchId = null, limit = 50) {
    try {
      return await this.insightsService.getHiringRecommendation(departmentId, branchId, limit);
    } catch (error) {
      this.logger.error('Error getting hiring recommendation:', error);
      throw error;
    }
  }

  async getWorkforceCapacity(departmentId = null, branchId = null, period = 'this_month') {
    try {
      return await this.insightsService.getWorkforceCapacity(departmentId, branchId, period);
    } catch (error) {
      this.logger.error('Error getting workforce capacity:', error);
      throw error;
    }
  }

  async getOrganizationRisk(category = null, limit = 50) {
    try {
      return await this.insightsService.getOrganizationRisk(category, limit);
    } catch (error) {
      this.logger.error('Error getting organization risk:', error);
      throw error;
    }
  }

  // Reports Methods
  async generateCEOReport(startDate, endDate, format = 'json') {
    try {
      return await this.reportsService.generateCEOReport(startDate, endDate, format);
    } catch (error) {
      this.logger.error('Error generating CEO report:', error);
      throw error;
    }
  }

  async generateBoardReport(startDate, endDate, format = 'json') {
    try {
      return await this.reportsService.generateBoardReport(startDate, endDate, format);
    } catch (error) {
      this.logger.error('Error generating board report:', error);
      throw error;
    }
  }

  async generateMonthlyExecutiveReport(year, month, format = 'json') {
    try {
      return await this.reportsService.generateMonthlyExecutiveReport(year, month, format);
    } catch (error) {
      this.logger.error('Error generating monthly executive report:', error);
      throw error;
    }
  }

  async generateQuarterlyExecutiveReport(year, quarter, format = 'json') {
    try {
      return await this.reportsService.generateQuarterlyExecutiveReport(year, quarter, format);
    } catch (error) {
      this.logger.error('Error generating quarterly executive report:', error);
      throw error;
    }
  }

  async generateAnnualExecutiveReport(year, format = 'json') {
    try {
      return await this.reportsService.generateAnnualExecutiveReport(year, format);
    } catch (error) {
      this.logger.error('Error generating annual executive report:', error);
      throw error;
    }
  }

  async generateDepartmentReport(departmentId, startDate, endDate, format = 'json') {
    try {
      return await this.reportsService.generateDepartmentReport(departmentId, startDate, endDate, format);
    } catch (error) {
      this.logger.error('Error generating department report:', error);
      throw error;
    }
  }

  async generateOrganizationReport(startDate, endDate, format = 'json') {
    try {
      return await this.reportsService.generateOrganizationReport(startDate, endDate, format);
    } catch (error) {
      this.logger.error('Error generating organization report:', error);
      throw error;
    }
  }

  async generatePerformanceReport(startDate, endDate, format = 'json') {
    try {
      return await this.reportsService.generatePerformanceReport(startDate, endDate, format);
    } catch (error) {
      this.logger.error('Error generating performance report:', error);
      throw error;
    }
  }

  async generateProductivityReport(startDate, endDate, format = 'json') {
    try {
      return await this.reportsService.generateProductivityReport(startDate, endDate, format);
    } catch (error) {
      this.logger.error('Error generating productivity report:', error);
      throw error;
    }
  }

  async generateGrowthReport(startDate, endDate, format = 'json') {
    try {
      return await this.reportsService.generateGrowthReport(startDate, endDate, format);
    } catch (error) {
      this.logger.error('Error generating growth report:', error);
      throw error;
    }
  }

  // Business Intelligence Methods
  async getOrganizationKPIs(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      // This would integrate with KPI module
      return {
        period,
        dateRange: { startDate, endDate },
        kpis: {
          totalEmployees: 1000,
          totalDepartments: 15,
          totalBranches: 5,
          organizationHealth: 85.5,
          revenuePerEmployee: 150000,
          profitMargin: 12.5,
          employeeSatisfaction: 82.0,
          customerSatisfaction: 88.0,
          innovationIndex: 75.0,
          marketShare: 25.0
        }
      };
    } catch (error) {
      this.logger.error('Error getting organization KPIs:', error);
      throw error;
    }
  }

  async getDepartmentKPIs(departmentId, period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        departmentId,
        kpis: {
          healthScore: 88.0,
          performanceScore: 85.0,
          productivityScore: 90.0,
          attendanceRate: 92.0,
          taskCompletionRate: 87.0,
          projectSuccessRate: 89.0,
          employeeCount: 200,
          budgetUtilization: 85.0
        }
      };
    } catch (error) {
      this.logger.error('Error getting department KPIs:', error);
      throw error;
    }
  }

  async getBranchKPIs(branchId, period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        branchId,
        kpis: {
          healthScore: 85.0,
          performanceScore: 82.0,
          productivityScore: 87.0,
          attendanceRate: 90.0,
          taskCompletionRate: 85.0,
          projectSuccessRate: 86.0,
          employeeCount: 250,
          budgetUtilization: 82.0
        }
      };
    } catch (error) {
      this.logger.error('Error getting branch KPIs:', error);
      throw error;
    }
  }

  async getAttendanceKPIs(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        kpis: {
          overallAttendanceRate: 92.5,
          punctualityRate: 96.8,
          absenteeismRate: 7.5,
          lateArrivalRate: 3.2,
          averageWorkHours: 8.5,
          overtimeRate: 12.0
        }
      };
    } catch (error) {
      this.logger.error('Error getting attendance KPIs:', error);
      throw error;
    }
  }

  async getTaskKPIs(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        kpis: {
          totalTasks: 5000,
          completedTasks: 4200,
          inProgressTasks: 600,
          overdueTasks: 200,
          completionRate: 84.0,
          onTimeRate: 91.5,
          avgTaskDuration: 3.5
        }
      };
    } catch (error) {
      this.logger.error('Error getting task KPIs:', error);
      throw error;
    }
  }

  async getMeetingKPIs(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        kpis: {
          totalMeetings: 500,
          completedMeetings: 450,
          cancelledMeetings: 50,
          attendanceRate: 94.0,
          avgDuration: 45,
          actionItemCompletionRate: 88.0,
          productivityScore: 85.5
        }
      };
    } catch (error) {
      this.logger.error('Error getting meeting KPIs:', error);
      throw error;
    }
  }

  async getProjectKPIs(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        kpis: {
          totalProjects: 150,
          activeProjects: 85,
          completedProjects: 55,
          onHoldProjects: 10,
          successRate: 92.0,
          onTimeRate: 88.5,
          onBudgetRate: 85.0
        }
      };
    } catch (error) {
      this.logger.error('Error getting project KPIs:', error);
      throw error;
    }
  }

  async getPerformanceKPIs(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        kpis: {
          totalEmployees: 1000,
          averagePerformanceScore: 82.5,
          highPerformers: 250,
          lowPerformers: 50,
          promotionEligible: 120,
          trainingRequired: 80
        }
      };
    } catch (error) {
      this.logger.error('Error getting performance KPIs:', error);
      throw error;
    }
  }

  async getProductivityKPIs(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        kpis: {
          productivityIndex: 87.5,
          efficiencyRate: 92.0,
          outputPerHour: 1.2,
          utilizationRate: 85.0,
          capacityUtilization: 82.5
        }
      };
    } catch (error) {
      this.logger.error('Error getting productivity KPIs:', error);
      throw error;
    }
  }

  async getGrowthKPIs(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        kpis: {
          employeeGrowthRate: 15.8,
          revenueGrowthRate: 20.0,
          productivityGrowthRate: 8.5,
          performanceGrowthRate: 5.2,
          marketShareGrowth: 3.0
        }
      };
    } catch (error) {
      this.logger.error('Error getting growth KPIs:', error);
      throw error;
    }
  }

  async getExecutiveMetrics(period = 'this_month') {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);
      
      return {
        period,
        dateRange: { startDate, endDate },
        metrics: {
          executiveHealthScore: 87.0,
          strategicAlignment: 85.0,
          operationalExcellence: 88.0,
          talentDevelopment: 82.0,
          innovationIndex: 75.0,
          financialHealth: 90.0,
          marketPosition: 85.0,
          customerSatisfaction: 88.0
        }
      };
    } catch (error) {
      this.logger.error('Error getting executive metrics:', error);
      throw error;
    }
  }

  // Helper Methods
  getPeriodDates(period) {
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'yesterday':
        startDate = new Date(now.setDate(now.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_7_days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_30_days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
        break;
      case 'last_quarter':
        const lastQuarterStart = Math.floor(now.getMonth() / 3) * 3 - 3;
        startDate = new Date(now.getFullYear(), lastQuarterStart, 1);
        endDate = new Date(now.getFullYear(), lastQuarterStart + 3, 0);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    return { startDate, endDate };
  }

  // Composite Methods for Complex Queries
  async getExecutiveDashboard(period = 'this_month') {
    try {
      const [healthSummary, organizationOverview, topPerformers, organizationRisks] = await Promise.all([
        this.getHealthSummary(period),
        this.getOrganizationOverview(period),
        this.getTopPerformers(10, period),
        this.getOrganizationRisk(null, 10)
      ]);

      return {
        period,
        health: healthSummary,
        overview: organizationOverview,
        performers: topPerformers,
        risks: organizationRisks,
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Error getting executive dashboard:', error);
      throw error;
    }
  }

  async getBusinessIntelligence(period = 'this_month') {
    try {
      const [organizationKPIs, departmentKPIs, branchKPIs, executiveMetrics] = await Promise.all([
        this.getOrganizationKPIs(period),
        this.getDepartmentKPIs(null, period),
        this.getBranchKPIs(null, period),
        this.getExecutiveMetrics(period)
      ]);

      return {
        period,
        organization: organizationKPIs,
        departments: departmentKPIs,
        branches: branchKPIs,
        executive: executiveMetrics,
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Error getting business intelligence:', error);
      throw error;
    }
  }

  async getExecutiveIntelligence(period = 'this_month') {
    try {
      const [topPerformers, bottomPerformers, departmentRankings, branchRankings, attritionRisk, hiringRecommendation] = await Promise.all([
        this.getTopPerformers(20, period),
        this.getBottomPerformers(20, period),
        this.getDepartmentRankings('healthScore', period),
        this.getBranchRankings('healthScore', period),
        this.getAttritionRisk(null, null, 30),
        this.getHiringRecommendation(null, null, 30)
      ]);

      return {
        period,
        topPerformers,
        bottomPerformers,
        departmentRankings,
        branchRankings,
        attritionRisk,
        hiringRecommendation,
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Error getting executive intelligence:', error);
      throw error;
    }
  }
}

const executiveService = new ExecutiveService();
export default executiveService;
