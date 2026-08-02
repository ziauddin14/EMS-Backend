import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import organizationHealthService from './organizationHealth.service.js';
import ExecutiveHelpers from './executive.helpers.js';
import ExecutiveUtils from './executive.utils.js';
import { TIME_PERIOD } from './executive.constants.js';

class ExecutiveDashboardService {
  constructor() {
    this.logger = Logger;
    this.helpers = ExecutiveHelpers;
    this.utils = ExecutiveUtils;
    this.healthService = organizationHealthService;
  }

  // Organization Overview Dashboard
  async getOrganizationOverview(period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      const [healthSummary, organizationKPIs, executiveMetrics] = await Promise.all([
        this.healthService.getHealthSummary(startDate, endDate),
        this.getOrganizationKPIs(startDate, endDate),
        this.getExecutiveMetrics(startDate, endDate)
      ]);

      return {
        period,
        dateRange: { startDate, endDate },
        health: healthSummary,
        kpis: organizationKPIs,
        metrics: executiveMetrics,
        alerts: await this.generateDashboardAlerts(healthSummary, organizationKPIs)
      };
    } catch (error) {
      this.logger.error('Error getting organization overview:', error);
      throw error;
    }
  }

  // Company Health Score Dashboard
  async getCompanyHealthScore(period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      const [organizationHealth, departmentHealth, branchHealth] = await Promise.all([
        this.healthService.calculateOrganizationHealth(startDate, endDate),
        this.getDepartmentHealthOverview(startDate, endDate),
        this.getBranchHealthOverview(startDate, endDate)
      ]);

      return {
        period,
        dateRange: { startDate, endDate },
        organization: organizationHealth,
        departments: departmentHealth,
        branches: branchHealth,
        trend: await this.getHealthTrend(startDate, endDate)
      };
    } catch (error) {
      this.logger.error('Error getting company health score:', error);
      throw error;
    }
  }

  // Department Health Score Dashboard
  async getDepartmentHealthScore(departmentId, period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      const departmentHealth = await this.healthService.calculateDepartmentHealth(
        departmentId,
        startDate,
        endDate
      );

      const employeeHealth = await this.getDepartmentEmployeeHealth(departmentId, startDate, endDate);

      return {
        period,
        dateRange: { startDate, endDate },
        department: departmentHealth,
        employees: employeeHealth,
        comparison: await this.getDepartmentComparison(departmentId, startDate, endDate)
      };
    } catch (error) {
      this.logger.error('Error getting department health score:', error);
      throw error;
    }
  }

  // Branch Health Score Dashboard
  async getBranchHealthScore(branchId, period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      const branchHealth = await this.healthService.calculateBranchHealth(
        branchId,
        startDate,
        endDate
      );

      const departmentHealth = await this.getBranchDepartmentHealth(branchId, startDate, endDate);

      return {
        period,
        dateRange: { startDate, endDate },
        branch: branchHealth,
        departments: departmentHealth,
        comparison: await this.getBranchComparison(branchId, startDate, endDate)
      };
    } catch (error) {
      this.logger.error('Error getting branch health score:', error);
      throw error;
    }
  }

  // Employee Health Score Dashboard
  async getEmployeeHealthScore(employeeId, period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      const employeeHealth = await this.healthService.calculateEmployeeHealth(
        employeeId,
        startDate,
        endDate
      );

      const peerComparison = await this.getEmployeePeerComparison(employeeId, startDate, endDate);

      return {
        period,
        dateRange: { startDate, endDate },
        employee: employeeHealth,
        comparison: peerComparison,
        history: await this.getEmployeeHealthHistory(employeeId, startDate, endDate)
      };
    } catch (error) {
      this.logger.error('Error getting employee health score:', error);
      throw error;
    }
  }

  // Attendance Overview Dashboard
  async getAttendanceOverview(period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      // This would integrate with Attendance module
      const attendanceStats = {
        totalEmployees: 1000, // Placeholder
        presentRate: 92.5,
        absentRate: 7.5,
        lateRate: 3.2,
        punctualityRate: 96.8,
        averageAttendance: 94.5
      };

      const attendanceByDepartment = await this.getAttendanceByDepartment(startDate, endDate);
      const attendanceTrends = await this.getAttendanceTrends(startDate, endDate);

      return {
        period,
        dateRange: { startDate, endDate },
        overview: attendanceStats,
        byDepartment: attendanceByDepartment,
        trends: attendanceTrends,
        alerts: this.generateAttendanceAlerts(attendanceStats)
      };
    } catch (error) {
      this.logger.error('Error getting attendance overview:', error);
      throw error;
    }
  }

  // Task Overview Dashboard
  async getTaskOverview(period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      // This would integrate with Task module
      const taskStats = {
        totalTasks: 5000,
        completedTasks: 4200,
        inProgressTasks: 600,
        overdueTasks: 200,
        completionRate: 84.0,
        onTimeRate: 91.5,
        avgTaskDuration: 3.5
      };

      const tasksByDepartment = await this.getTasksByDepartment(startDate, endDate);
      const tasksByPriority = await this.getTasksByPriority(startDate, endDate);

      return {
        period,
        dateRange: { startDate, endDate },
        overview: taskStats,
        byDepartment: tasksByDepartment,
        byPriority: tasksByPriority,
        alerts: this.generateTaskAlerts(taskStats)
      };
    } catch (error) {
      this.logger.error('Error getting task overview:', error);
      throw error;
    }
  }

  // Project Overview Dashboard
  async getProjectOverview(period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      // This would integrate with Project module
      const projectStats = {
        totalProjects: 150,
        activeProjects: 85,
        completedProjects: 55,
        onHoldProjects: 10,
        successRate: 92.0,
        onTimeRate: 88.5,
        onBudgetRate: 85.0
      };

      const projectsByDepartment = await this.getProjectsByDepartment(startDate, endDate);
      const projectsByStatus = await this.getProjectsByStatus(startDate, endDate);

      return {
        period,
        dateRange: { startDate, endDate },
        overview: projectStats,
        byDepartment: projectsByDepartment,
        byStatus: projectsByStatus,
        alerts: this.generateProjectAlerts(projectStats)
      };
    } catch (error) {
      this.logger.error('Error getting project overview:', error);
      throw error;
    }
  }

  // KPI Overview Dashboard
  async getKPIOverview(period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      // This would integrate with KPI module
      const kpiStats = {
        totalEmployees: 1000,
        averagePerformanceScore: 82.5,
        highPerformers: 250,
        lowPerformers: 50,
        promotionEligible: 120,
        trainingRequired: 80
      };

      const kpiByDepartment = await this.getKPIByDepartment(startDate, endDate);
      const performanceDistribution = await this.getPerformanceDistribution(startDate, endDate);

      return {
        period,
        dateRange: { startDate, endDate },
        overview: kpiStats,
        byDepartment: kpiByDepartment,
        distribution: performanceDistribution,
        alerts: this.generateKPIAlerts(kpiStats)
      };
    } catch (error) {
      this.logger.error('Error getting KPI overview:', error);
      throw error;
    }
  }

  // Meeting Overview Dashboard
  async getMeetingOverview(period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      // This would integrate with Meeting module
      const meetingStats = {
        totalMeetings: 500,
        completedMeetings: 450,
        cancelledMeetings: 50,
        attendanceRate: 94.0,
        avgDuration: 45,
        actionItemCompletionRate: 88.0,
        productivityScore: 85.5
      };

      const meetingsByType = await this.getMeetingsByType(startDate, endDate);
      const meetingsByDepartment = await this.getMeetingsByDepartment(startDate, endDate);

      return {
        period,
        dateRange: { startDate, endDate },
        overview: meetingStats,
        byType: meetingsByType,
        byDepartment: meetingsByDepartment,
        alerts: this.generateMeetingAlerts(meetingStats)
      };
    } catch (error) {
      this.logger.error('Error getting meeting overview:', error);
      throw error;
    }
  }

  // Productivity Overview Dashboard
  async getProductivityOverview(period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      const productivityStats = {
        productivityIndex: 87.5,
        efficiencyRate: 92.0,
        outputPerHour: 1.2,
        utilizationRate: 85.0,
        capacityUtilization: 82.5
      };

      const productivityByDepartment = await this.getProductivityByDepartment(startDate, endDate);
      const productivityTrends = await this.getProductivityTrends(startDate, endDate);

      return {
        period,
        dateRange: { startDate, endDate },
        overview: productivityStats,
        byDepartment: productivityByDepartment,
        trends: productivityTrends,
        alerts: this.generateProductivityAlerts(productivityStats)
      };
    } catch (error) {
      this.logger.error('Error getting productivity overview:', error);
      throw error;
    }
  }

  // Organization Summary Dashboard
  async getOrganizationSummary(period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);

      const [health, attendance, tasks, projects, kpi, meetings, productivity] = await Promise.all([
        this.healthService.getHealthSummary(startDate, endDate),
        this.getAttendanceOverview(period),
        this.getTaskOverview(period),
        this.getProjectOverview(period),
        this.getKPIOverview(period),
        this.getMeetingOverview(period),
        this.getProductivityOverview(period)
      ]);

      return {
        period,
        dateRange: { startDate, endDate },
        health: health.overall,
        attendance: attendance.overview,
        tasks: tasks.overview,
        projects: projects.overview,
        kpi: kpi.overview,
        meetings: meetings.overview,
        productivity: productivity.overview,
        summary: this.generateExecutiveSummary(health, attendance, tasks, projects, kpi, meetings, productivity)
      };
    } catch (error) {
      this.logger.error('Error getting organization summary:', error);
      throw error;
    }
  }

  // Helper Methods (These would integrate with actual module aggregations)
  async getOrganizationKPIs(startDate, endDate) {
    // Placeholder - would integrate with actual KPI calculations
    return {
      totalEmployees: 1000,
      totalDepartments: 15,
      totalBranches: 5,
      organizationHealth: 85.5,
      revenuePerEmployee: 150000,
      profitMargin: 12.5
    };
  }

  async getExecutiveMetrics(startDate, endDate) {
    // Placeholder - would calculate executive-specific metrics
    return {
      executiveHealthScore: 87.0,
      strategicAlignment: 85.0,
      operationalExcellence: 88.0,
      talentDevelopment: 82.0,
      innovationIndex: 75.0
    };
  }

  async getDepartmentHealthOverview(startDate, endDate) {
    // Placeholder - would get all department health scores
    return [];
  }

  async getBranchHealthOverview(startDate, endDate) {
    // Placeholder - would get all branch health scores
    return [];
  }

  async getDepartmentEmployeeHealth(departmentId, startDate, endDate) {
    // Placeholder - would get employee health for department
    return [];
  }

  async getBranchDepartmentHealth(branchId, startDate, endDate) {
    // Placeholder - would get department health for branch
    return [];
  }

  async getDepartmentComparison(departmentId, startDate, endDate) {
    // Placeholder - would compare department with others
    return { rank: 5, total: 15, percentile: 67 };
  }

  async getBranchComparison(branchId, startDate, endDate) {
    // Placeholder - would compare branch with others
    return { rank: 2, total: 5, percentile: 60 };
  }

  async getEmployeePeerComparison(employeeId, startDate, endDate) {
    // Placeholder - would compare employee with peers
    return { rank: 25, total: 100, percentile: 75 };
  }

  async getEmployeeHealthHistory(employeeId, startDate, endDate) {
    // Placeholder - would get employee health history
    return [];
  }

  async getHealthTrend(startDate, endDate) {
    // Placeholder - would calculate health trend
    return { direction: 'up', change: 2.5, changePercent: 3.0 };
  }

  async getAttendanceByDepartment(startDate, endDate) {
    // Placeholder - would get attendance by department
    return [];
  }

  async getAttendanceTrends(startDate, endDate) {
    // Placeholder - would get attendance trends
    return [];
  }

  async getTasksByDepartment(startDate, endDate) {
    // Placeholder - would get tasks by department
    return [];
  }

  async getTasksByPriority(startDate, endDate) {
    // Placeholder - would get tasks by priority
    return [];
  }

  async getProjectsByDepartment(startDate, endDate) {
    // Placeholder - would get projects by department
    return [];
  }

  async getProjectsByStatus(startDate, endDate) {
    // Placeholder - would get projects by status
    return [];
  }

  async getKPIByDepartment(startDate, endDate) {
    // Placeholder - would get KPI by department
    return [];
  }

  async getPerformanceDistribution(startDate, endDate) {
    // Placeholder - would get performance distribution
    return [];
  }

  async getMeetingsByType(startDate, endDate) {
    // Placeholder - would get meetings by type
    return [];
  }

  async getMeetingsByDepartment(startDate, endDate) {
    // Placeholder - would get meetings by department
    return [];
  }

  async getProductivityByDepartment(startDate, endDate) {
    // Placeholder - would get productivity by department
    return [];
  }

  async getProductivityTrends(startDate, endDate) {
    // Placeholder - would get productivity trends
    return [];
  }

  // Alert Generation Methods
  async generateDashboardAlerts(health, kpis) {
    const alerts = [];
    
    if (health.overall.score < 70) {
      alerts.push({
        level: 'warning',
        message: 'Organization health score is below optimal',
        value: health.overall.score
      });
    }

    if (kpis.organizationHealth < 75) {
      alerts.push({
        level: 'warning',
        message: 'Organization health KPI is concerning',
        value: kpis.organizationHealth
      });
    }

    return alerts;
  }

  generateAttendanceAlerts(stats) {
    const alerts = [];
    
    if (stats.attendanceRate < 85) {
      alerts.push({
        level: 'warning',
        message: 'Attendance rate is below target',
        value: stats.attendanceRate
      });
    }

    if (stats.lateRate > 5) {
      alerts.push({
        level: 'info',
        message: 'Late arrival rate is elevated',
        value: stats.lateRate
      });
    }

    return alerts;
  }

  generateTaskAlerts(stats) {
    const alerts = [];
    
    if (stats.completionRate < 80) {
      alerts.push({
        level: 'warning',
        message: 'Task completion rate is below target',
        value: stats.completionRate
      });
    }

    if (stats.overdueTasks > 100) {
      alerts.push({
        level: 'critical',
        message: 'High number of overdue tasks',
        value: stats.overdueTasks
      });
    }

    return alerts;
  }

  generateProjectAlerts(stats) {
    const alerts = [];
    
    if (stats.successRate < 85) {
      alerts.push({
        level: 'warning',
        message: 'Project success rate is below target',
        value: stats.successRate
      });
    }

    if (stats.onHoldProjects > 5) {
      alerts.push({
        level: 'info',
        message: 'Multiple projects on hold',
        value: stats.onHoldProjects
      });
    }

    return alerts;
  }

  generateKPIAlerts(stats) {
    const alerts = [];
    
    if (stats.averagePerformanceScore < 75) {
      alerts.push({
        level: 'warning',
        message: 'Average performance score is below target',
        value: stats.averagePerformanceScore
      });
    }

    if (stats.lowPerformers > 100) {
      alerts.push({
        level: 'warning',
        message: 'High number of low performers',
        value: stats.lowPerformers
      });
    }

    return alerts;
  }

  generateMeetingAlerts(stats) {
    const alerts = [];
    
    if (stats.attendanceRate < 90) {
      alerts.push({
        level: 'info',
        message: 'Meeting attendance rate could be improved',
        value: stats.attendanceRate
      });
    }

    if (stats.actionItemCompletionRate < 85) {
      alerts.push({
        level: 'warning',
        message: 'Action item completion rate is below target',
        value: stats.actionItemCompletionRate
      });
    }

    return alerts;
  }

  generateProductivityAlerts(stats) {
    const alerts = [];
    
    if (stats.productivityIndex < 80) {
      alerts.push({
        level: 'warning',
        message: 'Productivity index is below target',
        value: stats.productivityIndex
      });
    }

    if (stats.capacityUtilization > 95) {
      alerts.push({
        level: 'warning',
        message: 'Capacity utilization is very high',
        value: stats.capacityUtilization
      });
    }

    return alerts;
  }

  generateExecutiveSummary(health, attendance, tasks, projects, kpi, meetings, productivity) {
    return {
      overallHealth: health.overall.score,
      keyHighlights: [
        `Organization health at ${health.overall.score.toFixed(1)}%`,
        `Attendance rate at ${attendance.overview.attendanceRate.toFixed(1)}%`,
        `Task completion rate at ${tasks.overview.completionRate.toFixed(1)}%`,
        `Project success rate at ${projects.overview.successRate.toFixed(1)}%`,
        `Average performance score at ${kpi.overview.averagePerformanceScore.toFixed(1)}`
      ],
      criticalAlerts: [
        ...attendance.alerts.filter(a => a.level === 'critical'),
        ...tasks.alerts.filter(a => a.level === 'critical'),
        ...projects.alerts.filter(a => a.level === 'critical')
      ],
      recommendations: [
        'Review underperforming departments',
        'Address critical alerts immediately',
        'Monitor trends closely',
        'Implement improvement plans where needed'
      ]
    };
  }
}

const executiveDashboardService = new ExecutiveDashboardService();
export default executiveDashboardService;
