import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import executiveRepository from './executive.repository.js';
import ExecutiveHelpers from './executive.helpers.js';
import ExecutiveUtils from './executive.utils.js';
import { ANALYTICS_TYPE, DATA_GRANULARITY, COMPARISON_TYPE } from './executive.constants.js';

class ExecutiveAnalyticsService {
  constructor() {
    this.logger = Logger;
    this.repository = executiveRepository;
    this.helpers = ExecutiveHelpers;
    this.utils = ExecutiveUtils;
  }

  // Trend Analytics
  async getTrendAnalytics(startDate, endDate, granularity = DATA_GRANULARITY.MONTHLY, comparison = null) {
    try {
      const trendData = await this.generateTrendData(startDate, endDate, granularity);
      
      let comparisonData = null;
      if (comparison) {
        const comparisonDates = this.getComparisonDates(startDate, endDate, comparison);
        comparisonData = await this.generateTrendData(comparisonDates.startDate, comparisonDates.endDate, granularity);
      }

      return {
        type: ANALYTICS_TYPE.TREND,
        period: { startDate, endDate },
        granularity,
        data: trendData,
        comparison: comparisonData ? {
          type: comparison,
          data: comparisonData,
          change: this.calculateTrendChange(trendData, comparisonData)
        } : null,
        insights: this.generateTrendInsights(trendData, comparisonData)
      };
    } catch (error) {
      this.logger.error('Error getting trend analytics:', error);
      throw error;
    }
  }

  // Growth Analytics
  async getGrowthAnalytics(startDate, endDate, granularity = DATA_GRANULARITY.MONTHLY) {
    try {
      const growthData = await this.generateGrowthData(startDate, endDate, granularity);
      
      return {
        type: ANALYTICS_TYPE.GROWTH,
        period: { startDate, endDate },
        granularity,
        data: growthData,
        metrics: {
          employeeGrowthRate: this.calculateGrowthRate(growthData, 'employees'),
          revenueGrowthRate: this.calculateGrowthRate(growthData, 'revenue'),
          productivityGrowthRate: this.calculateGrowthRate(growthData, 'productivity'),
          overallGrowthRate: this.calculateOverallGrowthRate(growthData)
        },
        insights: this.generateGrowthInsights(growthData)
      };
    } catch (error) {
      this.logger.error('Error getting growth analytics:', error);
      throw error;
    }
  }

  // Productivity Analytics
  async getProductivityAnalytics(startDate, endDate, granularity = DATA_GRANULARITY.MONTHLY) {
    try {
      const productivityData = await this.generateProductivityData(startDate, endDate, granularity);
      
      return {
        type: ANALYTICS_TYPE.PRODUCTIVITY,
        period: { startDate, endDate },
        granularity,
        data: productivityData,
        metrics: {
          productivityIndex: this.calculateAverage(productivityData, 'productivityIndex'),
          efficiencyRate: this.calculateAverage(productivityData, 'efficiencyRate'),
          outputPerHour: this.calculateAverage(productivityData, 'outputPerHour'),
          utilizationRate: this.calculateAverage(productivityData, 'utilizationRate')
        },
        trends: this.calculateProductivityTrends(productivityData),
        insights: this.generateProductivityInsights(productivityData)
      };
    } catch (error) {
      this.logger.error('Error getting productivity analytics:', error);
      throw error;
    }
  }

  // Performance Analytics
  async getPerformanceAnalytics(startDate, endDate, granularity = DATA_GRANULARITY.MONTHLY) {
    try {
      const performanceData = await this.generatePerformanceData(startDate, endDate, granularity);
      
      return {
        type: ANALYTICS_TYPE.PERFORMANCE,
        period: { startDate, endDate },
        granularity,
        data: performanceData,
        metrics: {
          averagePerformanceScore: this.calculateAverage(performanceData, 'performanceScore'),
          highPerformersRatio: this.calculateRatio(performanceData, 'highPerformers', 'totalEmployees'),
          lowPerformersRatio: this.calculateRatio(performanceData, 'lowPerformers', 'totalEmployees'),
          promotionEligibleRatio: this.calculateRatio(performanceData, 'promotionEligible', 'totalEmployees')
        },
        distribution: this.calculatePerformanceDistribution(performanceData),
        insights: this.generatePerformanceInsights(performanceData)
      };
    } catch (error) {
      this.logger.error('Error getting performance analytics:', error);
      throw error;
    }
  }

  // Attendance Analytics
  async getAttendanceAnalytics(startDate, endDate, granularity = DATA_GRANULARITY.MONTHLY) {
    try {
      const attendanceData = await this.generateAttendanceData(startDate, endDate, granularity);
      
      return {
        type: ANALYTICS_TYPE.ATTENDANCE,
        period: { startDate, endDate },
        granularity,
        data: attendanceData,
        metrics: {
          attendanceRate: this.calculateAverage(attendanceData, 'attendanceRate'),
          punctualityRate: this.calculateAverage(attendanceData, 'punctualityRate'),
          absenteeismRate: this.calculateAverage(attendanceData, 'absenteeismRate'),
          lateArrivalRate: this.calculateAverage(attendanceData, 'lateArrivalRate')
        },
        trends: this.calculateAttendanceTrends(attendanceData),
        insights: this.generateAttendanceInsights(attendanceData)
      };
    } catch (error) {
      this.logger.error('Error getting attendance analytics:', error);
      throw error;
    }
  }

  // Project Analytics
  async getProjectAnalytics(startDate, endDate, granularity = DATA_GRANULARITY.MONTHLY) {
    try {
      const projectData = await this.generateProjectData(startDate, endDate, granularity);
      
      return {
        type: ANALYTICS_TYPE.PROJECT,
        period: { startDate, endDate },
        granularity,
        data: projectData,
        metrics: {
          successRate: this.calculateAverage(projectData, 'successRate'),
          onTimeRate: this.calculateAverage(projectData, 'onTimeRate'),
          onBudgetRate: this.calculateAverage(projectData, 'onBudgetRate'),
          avgDuration: this.calculateAverage(projectData, 'duration')
        },
        byStatus: this.groupByStatus(projectData),
        insights: this.generateProjectInsights(projectData)
      };
    } catch (error) {
      this.logger.error('Error getting project analytics:', error);
      throw error;
    }
  }

  // Task Analytics
  async getTaskAnalytics(startDate, endDate, granularity = DATA_GRANULARITY.MONTHLY) {
    try {
      const taskData = await this.generateTaskData(startDate, endDate, granularity);
      
      return {
        type: ANALYTICS_TYPE.TASK,
        period: { startDate, endDate },
        granularity,
        data: taskData,
        metrics: {
          completionRate: this.calculateAverage(taskData, 'completionRate'),
          onTimeRate: this.calculateAverage(taskData, 'onTimeRate'),
          overdueRate: this.calculateAverage(taskData, 'overdueRate'),
          avgDuration: this.calculateAverage(taskData, 'duration')
        },
        byPriority: this.groupByPriority(taskData),
        insights: this.generateTaskInsights(taskData)
      };
    } catch (error) {
      this.logger.error('Error getting task analytics:', error);
      throw error;
    }
  }

  // Meeting Analytics
  async getMeetingAnalytics(startDate, endDate, granularity = DATA_GRANULARITY.MONTHLY) {
    try {
      const meetingData = await this.generateMeetingData(startDate, endDate, granularity);
      
      return {
        type: ANALYTICS_TYPE.MEETING,
        period: { startDate, endDate },
        granularity,
        data: meetingData,
        metrics: {
          productivityScore: this.calculateAverage(meetingData, 'productivityScore'),
          attendanceRate: this.calculateAverage(meetingData, 'attendanceRate'),
          actionItemCompletionRate: this.calculateAverage(meetingData, 'actionItemCompletionRate'),
          avgDuration: this.calculateAverage(meetingData, 'duration')
        },
        byType: this.groupByType(meetingData),
        insights: this.generateMeetingInsights(meetingData)
      };
    } catch (error) {
      this.logger.error('Error getting meeting analytics:', error);
      throw error;
    }
  }

  // Department Analytics
  async getDepartmentAnalytics(startDate, endDate, departmentId = null) {
    try {
      const departmentData = await this.generateDepartmentData(startDate, endDate, departmentId);
      
      return {
        type: ANALYTICS_TYPE.DEPARTMENT,
        period: { startDate, endDate },
        entityId: departmentId,
        data: departmentData,
        rankings: this.helpers.calculateRankings(departmentData, 'healthScore'),
        comparisons: await this.getDepartmentComparisons(startDate, endDate),
        insights: this.generateDepartmentInsights(departmentData)
      };
    } catch (error) {
      this.logger.error('Error getting department analytics:', error);
      throw error;
    }
  }

  // Branch Analytics
  async getBranchAnalytics(startDate, endDate, branchId = null) {
    try {
      const branchData = await this.generateBranchData(startDate, endDate, branchId);
      
      return {
        type: ANALYTICS_TYPE.BRANCH,
        period: { startDate, endDate },
        entityId: branchId,
        data: branchData,
        rankings: this.helpers.calculateRankings(branchData, 'healthScore'),
        comparisons: await this.getBranchComparisons(startDate, endDate),
        insights: this.generateBranchInsights(branchData)
      };
    } catch (error) {
      this.logger.error('Error getting branch analytics:', error);
      throw error;
    }
  }

  // Organization Analytics
  async getOrganizationAnalytics(startDate, endDate) {
    try {
      const organizationData = await this.generateOrganizationData(startDate, endDate);
      
      return {
        type: ANALYTICS_TYPE.ORGANIZATION,
        period: { startDate, endDate },
        data: organizationData,
        healthScore: organizationData.healthScore,
        kpis: organizationData.kpis,
        trends: await this.getOrganizationTrends(startDate, endDate),
        insights: this.generateOrganizationInsights(organizationData)
      };
    } catch (error) {
      this.logger.error('Error getting organization analytics:', error);
      throw error;
    }
  }

  // Data Generation Methods (These would integrate with actual module aggregations)
  async generateTrendData(startDate, endDate, granularity) {
    // Placeholder - would integrate with actual data from various modules
    const periods = this.generatePeriods(startDate, endDate, granularity);
    
    return periods.map(period => ({
      period: period.label,
      date: period.date,
      attendance: 85 + Math.random() * 10,
      taskCompletion: 80 + Math.random() * 15,
      projectSuccess: 82 + Math.random() * 13,
      performance: 78 + Math.random() * 17,
      productivity: 83 + Math.random() * 12
    }));
  }

  async generateGrowthData(startDate, endDate, granularity) {
    const periods = this.generatePeriods(startDate, endDate, granularity);
    
    return periods.map(period => ({
      period: period.label,
      date: period.date,
      employees: 950 + Math.random() * 100,
      revenue: 1000000 + Math.random() * 200000,
      productivity: 80 + Math.random() * 15,
      performance: 75 + Math.random() * 20
    }));
  }

  async generateProductivityData(startDate, endDate, granularity) {
    const periods = this.generatePeriods(startDate, endDate, granularity);
    
    return periods.map(period => ({
      period: period.label,
      date: period.date,
      productivityIndex: 82 + Math.random() * 13,
      efficiencyRate: 88 + Math.random() * 10,
      outputPerHour: 1.0 + Math.random() * 0.4,
      utilizationRate: 80 + Math.random() * 15
    }));
  }

  async generatePerformanceData(startDate, endDate, granularity) {
    const periods = this.generatePeriods(startDate, endDate, granularity);
    
    return periods.map(period => ({
      period: period.label,
      date: period.date,
      performanceScore: 78 + Math.random() * 17,
      highPerformers: 200 + Math.random() * 100,
      lowPerformers: 40 + Math.random() * 30,
      promotionEligible: 100 + Math.random() * 50,
      totalEmployees: 950 + Math.random() * 100
    }));
  }

  async generateAttendanceData(startDate, endDate, granularity) {
    const periods = this.generatePeriods(startDate, endDate, granularity);
    
    return periods.map(period => ({
      period: period.label,
      date: period.date,
      attendanceRate: 90 + Math.random() * 8,
      punctualityRate: 94 + Math.random() * 5,
      absenteeismRate: 5 + Math.random() * 5,
      lateArrivalRate: 2 + Math.random() * 3
    }));
  }

  async generateProjectData(startDate, endDate, granularity) {
    const periods = this.generatePeriods(startDate, endDate, granularity);
    
    return periods.map(period => ({
      period: period.label,
      date: period.date,
      successRate: 88 + Math.random() * 10,
      onTimeRate: 85 + Math.random() * 12,
      onBudgetRate: 82 + Math.random() * 13,
      duration: 30 + Math.random() * 60,
      status: ['completed', 'in_progress', 'on_hold'][Math.floor(Math.random() * 3)]
    }));
  }

  async generateTaskData(startDate, endDate, granularity) {
    const periods = this.generatePeriods(startDate, endDate, granularity);
    
    return periods.map(period => ({
      period: period.label,
      date: period.date,
      completionRate: 82 + Math.random() * 13,
      onTimeRate: 88 + Math.random() * 10,
      overdueRate: 5 + Math.random() * 8,
      duration: 2 + Math.random() * 5,
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
    }));
  }

  async generateMeetingData(startDate, endDate, granularity) {
    const periods = this.generatePeriods(startDate, endDate, granularity);
    
    return periods.map(period => ({
      period: period.label,
      date: period.date,
      productivityScore: 83 + Math.random() * 12,
      attendanceRate: 92 + Math.random() * 6,
      actionItemCompletionRate: 85 + Math.random() * 12,
      duration: 40 + Math.random() * 30,
      type: ['standup', 'review', 'planning', 'training'][Math.floor(Math.random() * 4)]
    }));
  }

  async generateDepartmentData(startDate, endDate, departmentId) {
    // Placeholder - would get actual department data
    return [
      { departmentId: '1', name: 'Engineering', healthScore: 88, employees: 200 },
      { departmentId: '2', name: 'Sales', healthScore: 85, employees: 150 },
      { departmentId: '3', name: 'Marketing', healthScore: 82, employees: 100 },
      { departmentId: '4', name: 'HR', healthScore: 90, employees: 50 },
      { departmentId: '5', name: 'Finance', healthScore: 87, employees: 80 }
    ];
  }

  async generateBranchData(startDate, endDate, branchId) {
    // Placeholder - would get actual branch data
    return [
      { branchId: '1', name: 'Headquarters', healthScore: 90, employees: 400 },
      { branchId: '2', name: 'North Branch', healthScore: 85, employees: 250 },
      { branchId: '3', name: 'South Branch', healthScore: 83, employees: 200 },
      { branchId: '4', name: 'East Branch', healthScore: 87, employees: 150 }
    ];
  }

  async generateOrganizationData(startDate, endDate) {
    // Placeholder - would get actual organization data
    return {
      healthScore: 87,
      kpis: {
        totalEmployees: 1000,
        totalDepartments: 15,
        totalBranches: 5,
        organizationHealth: 87,
        revenuePerEmployee: 150000,
        profitMargin: 12.5
      },
      components: {
        attendance: 92,
        taskCompletion: 85,
        projectSuccess: 88,
        performance: 82,
        productivity: 86
      }
    };
  }

  // Helper Methods
  generatePeriods(startDate, endDate, granularity) {
    const periods = [];
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      let label;
      switch (granularity) {
        case DATA_GRANULARITY.HOURLY:
          label = current.toISOString().substring(0, 13);
          current.setHours(current.getHours() + 1);
          break;
        case DATA_GRANULARITY.DAILY:
          label = current.toISOString().split('T')[0];
          current.setDate(current.getDate() + 1);
          break;
        case DATA_GRANULARITY.WEEKLY:
          label = `Week ${Math.ceil(current.getDate() / 7)}`;
          current.setDate(current.getDate() + 7);
          break;
        case DATA_GRANULARITY.MONTHLY:
          label = current.toISOString().substring(0, 7);
          current.setMonth(current.getMonth() + 1);
          break;
        case DATA_GRANULARITY.QUARTERLY:
          const quarter = Math.floor(current.getMonth() / 3) + 1;
          label = `Q${quarter} ${current.getFullYear()}`;
          current.setMonth(current.getMonth() + 3);
          break;
        case DATA_GRANULARITY.ANNUAL:
          label = current.getFullYear().toString();
          current.setFullYear(current.getFullYear() + 1);
          break;
        default:
          label = current.toISOString().split('T')[0];
          current.setDate(current.getDate() + 1);
      }

      periods.push({ label, date: new Date(current) });
    }

    return periods;
  }

  getComparisonDates(startDate, endDate, comparisonType) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end - start;

    let comparisonStart, comparisonEnd;

    switch (comparisonType) {
      case COMPARISON_TYPE.PERIOD_OVER_PERIOD:
        comparisonEnd = new Date(start);
        comparisonStart = new Date(comparisonEnd - duration);
        break;
      case COMPARISON_TYPE.YEAR_OVER_YEAR:
        comparisonStart = new Date(start);
        comparisonStart.setFullYear(comparisonStart.getFullYear() - 1);
        comparisonEnd = new Date(end);
        comparisonEnd.setFullYear(comparisonEnd.getFullYear() - 1);
        break;
      default:
        comparisonStart = new Date(start);
        comparisonEnd = new Date(end);
    }

    return { startDate: comparisonStart, endDate: comparisonEnd };
  }

  calculateTrendChange(currentData, comparisonData) {
    if (!comparisonData || currentData.length === 0 || comparisonData.length === 0) {
      return null;
    }

    const currentAvg = this.calculateAverage(currentData, 'attendance');
    const comparisonAvg = this.calculateAverage(comparisonData, 'attendance');

    return {
      value: currentAvg - comparisonAvg,
      percent: this.helpers.calculateKPIChange(currentAvg, comparisonAvg),
      direction: currentAvg > comparisonAvg ? 'up' : currentAvg < comparisonAvg ? 'down' : 'stable'
    };
  }

  calculateGrowthRate(data, field) {
    if (data.length < 2) return 0;
    
    const first = data[0][field] || 0;
    const last = data[data.length - 1][field] || 0;
    
    if (first === 0) return last > 0 ? 100 : 0;
    
    return ((last - first) / first) * 100;
  }

  calculateOverallGrowthRate(data) {
    const rates = [
      this.calculateGrowthRate(data, 'employees'),
      this.calculateGrowthRate(data, 'revenue'),
      this.calculateGrowthRate(data, 'productivity'),
      this.calculateGrowthRate(data, 'performance')
    ];
    
    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  }

  calculateAverage(data, field) {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
    return sum / data.length;
  }

  calculateRatio(data, numerator, denominator) {
    const totalNumerator = data.reduce((acc, item) => acc + (item[numerator] || 0), 0);
    const totalDenominator = data.reduce((acc, item) => acc + (item[denominator] || 0), 0);
    
    if (totalDenominator === 0) return 0;
    return (totalNumerator / totalDenominator) * 100;
  }

  calculateProductivityTrends(data) {
    return {
      productivityIndex: this.helpers.calculateTrend(data, 'productivityIndex'),
      efficiencyRate: this.helpers.calculateTrend(data, 'efficiencyRate'),
      utilizationRate: this.helpers.calculateTrend(data, 'utilizationRate')
    };
  }

  calculateAttendanceTrends(data) {
    return {
      attendanceRate: this.helpers.calculateTrend(data, 'attendanceRate'),
      punctualityRate: this.helpers.calculateTrend(data, 'punctualityRate'),
      absenteeismRate: this.helpers.calculateTrend(data, 'absenteeismRate')
    };
  }

  calculatePerformanceDistribution(data) {
    const scores = data.map(d => d.performanceScore);
    
    return {
      elite: scores.filter(s => s >= 95).length,
      high: scores.filter(s => s >= 85 && s < 95).length,
      average: scores.filter(s => s >= 70 && s < 85).length,
      belowAverage: scores.filter(s => s >= 50 && s < 70).length,
      low: scores.filter(s => s < 50).length
    };
  }

  groupByStatus(data) {
    return this.helpers.aggregateByField(data, 'status', 'count');
  }

  groupByPriority(data) {
    return this.helpers.aggregateByField(data, 'priority', 'count');
  }

  groupByType(data) {
    return this.helpers.aggregateByField(data, 'type', 'count');
  }

  async getDepartmentComparisons(startDate, endDate) {
    // Placeholder - would get actual comparisons
    return {
      previousPeriod: { healthScore: 85 },
      benchmark: { healthScore: 88 },
      target: { healthScore: 90 }
    };
  }

  async getBranchComparisons(startDate, endDate) {
    // Placeholder - would get actual comparisons
    return {
      previousPeriod: { healthScore: 82 },
      benchmark: { healthScore: 85 },
      target: { healthScore: 88 }
    };
  }

  async getOrganizationTrends(startDate, endDate) {
    // Placeholder - would get actual trends
    return {
      healthTrend: { direction: 'up', change: 2.5 },
      productivityTrend: { direction: 'up', change: 3.2 },
      performanceTrend: { direction: 'stable', change: 0.5 }
    };
  }

  // Insight Generation Methods
  generateTrendInsights(data, comparisonData) {
    const insights = [];
    
    if (data.length > 1) {
      const trend = this.helpers.calculateTrend(data, 'attendance');
      insights.push({
        metric: 'attendance',
        trend: trend.direction,
        change: trend.change,
        insight: trend.direction === 'up' ? 'Attendance is improving' : 'Attendance needs attention'
      });
    }

    if (comparisonData) {
      const change = this.calculateTrendChange(data, comparisonData);
      if (change) {
        insights.push({
          metric: 'comparison',
          change: change.percent,
          insight: change.direction === 'up' ? 'Better than comparison period' : 'Worse than comparison period'
        });
      }
    }

    return insights;
  }

  generateGrowthInsights(data) {
    const insights = [];
    const employeeGrowth = this.calculateGrowthRate(data, 'employees');
    const revenueGrowth = this.calculateGrowthRate(data, 'revenue');
    
    if (employeeGrowth > 5) {
      insights.push({ metric: 'employees', insight: 'Strong employee growth' });
    } else if (employeeGrowth < 0) {
      insights.push({ metric: 'employees', insight: 'Employee count declining - review needed' });
    }

    if (revenueGrowth > 10) {
      insights.push({ metric: 'revenue', insight: 'Revenue growth is healthy' });
    } else if (revenueGrowth < 0) {
      insights.push({ metric: 'revenue', insight: 'Revenue declining - investigate causes' });
    }

    return insights;
  }

  generateProductivityInsights(data) {
    const insights = [];
    const avgProductivity = this.calculateAverage(data, 'productivityIndex');
    
    if (avgProductivity > 85) {
      insights.push({ metric: 'productivity', insight: 'Productivity is excellent' });
    } else if (avgProductivity < 75) {
      insights.push({ metric: 'productivity', insight: 'Productivity needs improvement' });
    }

    const avgUtilization = this.calculateAverage(data, 'utilizationRate');
    if (avgUtilization > 90) {
      insights.push({ metric: 'utilization', insight: 'High utilization - consider capacity planning' });
    }

    return insights;
  }

  generatePerformanceInsights(data) {
    const insights = [];
    const avgPerformance = this.calculateAverage(data, 'performanceScore');
    
    if (avgPerformance > 85) {
      insights.push({ metric: 'performance', insight: 'Overall performance is strong' });
    } else if (avgPerformance < 75) {
      insights.push({ metric: 'performance', insight: 'Performance improvement needed' });
    }

    const distribution = this.calculatePerformanceDistribution(data);
    if (distribution.low > data.length * 0.1) {
      insights.push({ metric: 'lowPerformers', insight: 'High number of low performers - intervention needed' });
    }

    return insights;
  }

  generateAttendanceInsights(data) {
    const insights = [];
    const avgAttendance = this.calculateAverage(data, 'attendanceRate');
    
    if (avgAttendance < 90) {
      insights.push({ metric: 'attendance', insight: 'Attendance rate below target - review policies' });
    }

    const avgAbsenteeism = this.calculateAverage(data, 'absenteeismRate');
    if (avgAbsenteeism > 5) {
      insights.push({ metric: 'absenteeism', insight: 'Absenteeism rate elevated - investigate causes' });
    }

    return insights;
  }

  generateProjectInsights(data) {
    const insights = [];
    const avgSuccessRate = this.calculateAverage(data, 'successRate');
    
    if (avgSuccessRate < 85) {
      insights.push({ metric: 'successRate', insight: 'Project success rate below target - review processes' });
    }

    const avgOnTimeRate = this.calculateAverage(data, 'onTimeRate');
    if (avgOnTimeRate < 85) {
      insights.push({ metric: 'onTimeRate', insight: 'Project delays common - improve planning' });
    }

    return insights;
  }

  generateTaskInsights(data) {
    const insights = [];
    const avgCompletionRate = this.calculateAverage(data, 'completionRate');
    
    if (avgCompletionRate < 85) {
      insights.push({ metric: 'completionRate', insight: 'Task completion rate below target' });
    }

    const avgOverdueRate = this.calculateAverage(data, 'overdueRate');
    if (avgOverdueRate > 10) {
      insights.push({ metric: 'overdueRate', insight: 'High overdue rate - review task management' });
    }

    return insights;
  }

  generateMeetingInsights(data) {
    const insights = [];
    const avgProductivity = this.calculateAverage(data, 'productivityScore');
    
    if (avgProductivity < 80) {
      insights.push({ metric: 'productivity', insight: 'Meeting productivity could be improved' });
    }

    const avgActionItemCompletion = this.calculateAverage(data, 'actionItemCompletionRate');
    if (avgActionItemCompletion < 85) {
      insights.push({ metric: 'actionItems', insight: 'Action item completion rate needs attention' });
    }

    return insights;
  }

  generateDepartmentInsights(data) {
    const insights = [];
    const topPerformer = data.reduce((max, d) => d.healthScore > max.healthScore ? d : max, data[0]);
    const bottomPerformer = data.reduce((min, d) => d.healthScore < min.healthScore ? d : min, data[0]);

    insights.push({
      metric: 'topPerformer',
      insight: `Top performing department: ${topPerformer.name} (${topPerformer.healthScore}%)`
    });

    insights.push({
      metric: 'bottomPerformer',
      insight: `Department needing attention: ${bottomPerformer.name} (${bottomPerformer.healthScore}%)`
    });

    return insights;
  }

  generateBranchInsights(data) {
    const insights = [];
    const topPerformer = data.reduce((max, d) => d.healthScore > max.healthScore ? d : max, data[0]);
    const bottomPerformer = data.reduce((min, d) => d.healthScore < min.healthScore ? d : min, data[0]);

    insights.push({
      metric: 'topPerformer',
      insight: `Top performing branch: ${topPerformer.name} (${topPerformer.healthScore}%)`
    });

    insights.push({
      metric: 'bottomPerformer',
      insight: `Branch needing attention: ${bottomPerformer.name} (${bottomPerformer.healthScore}%)`
    });

    return insights;
  }

  generateOrganizationInsights(data) {
    const insights = [];

    if (data.healthScore > 85) {
      insights.push({ metric: 'health', insight: 'Organization health is excellent' });
    } else if (data.healthScore < 75) {
      insights.push({ metric: 'health', insight: 'Organization health needs improvement' });
    }

    const weakestComponent = Object.entries(data.components).reduce((min, [key, value]) => 
      value < min.value ? { key, value } : min, 
      { key: 'none', value: 100 }
    );

    if (weakestComponent.key !== 'none') {
      insights.push({
        metric: 'weakestComponent',
        insight: `Weakest area: ${weakestComponent.key} (${weakestComponent.value}%)`
      });
    }

    return insights;
  }
}

const executiveAnalyticsService = new ExecutiveAnalyticsService();
export default executiveAnalyticsService;
