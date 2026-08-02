import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import executiveRepository from './executive.repository.js';
import ExecutiveHelpers from './executive.helpers.js';
import ExecutiveUtils from './executive.utils.js';
import { HEALTH_CATEGORY, HEALTH_WEIGHTAGE, ALERT_THRESHOLD } from './executive.constants.js';

// Import existing module aggregations (these would be imported from respective modules)
// For now, we'll create placeholder methods that would integrate with existing modules

class OrganizationHealthService {
  constructor() {
    this.logger = Logger;
    this.repository = executiveRepository;
    this.helpers = ExecutiveHelpers;
    this.utils = ExecutiveUtils;
  }

  // Organization Health Calculation
  async calculateOrganizationHealth(startDate, endDate) {
    try {
      const components = {
        attendance: await this.getAttendanceHealth(startDate, endDate),
        taskCompletion: await this.getTaskHealth(startDate, endDate),
        projectSuccess: await this.getProjectHealth(startDate, endDate),
        performance: await this.getPerformanceHealth(startDate, endDate),
        productivity: await this.getProductivityHealth(startDate, endDate)
      };

      const healthScore = this.helpers.calculateHealthScore(
        components,
        HEALTH_WEIGHTAGE.ORGANIZATION
      );

      return {
        category: HEALTH_CATEGORY.ORGANIZATION,
        score: healthScore,
        components,
        label: this.helpers.getHealthScoreLabel(healthScore),
        color: this.helpers.getHealthScoreColor(healthScore),
        status: this.helpers.getHealthStatus(healthScore),
        calculatedAt: new Date(),
        period: { startDate, endDate }
      };
    } catch (error) {
      this.logger.error('Error calculating organization health:', error);
      throw error;
    }
  }

  // Department Health Calculation
  async calculateDepartmentHealth(departmentId, startDate, endDate) {
    try {
      const components = {
        attendance: await this.getDepartmentAttendanceHealth(departmentId, startDate, endDate),
        taskCompletion: await this.getDepartmentTaskHealth(departmentId, startDate, endDate),
        projectSuccess: await this.getDepartmentProjectHealth(departmentId, startDate, endDate),
        performance: await this.getDepartmentPerformanceHealth(departmentId, startDate, endDate)
      };

      const healthScore = this.helpers.calculateHealthScore(
        components,
        HEALTH_WEIGHTAGE.DEPARTMENT
      );

      return {
        category: HEALTH_CATEGORY.DEPARTMENT,
        entityId: departmentId,
        entityType: 'department',
        score: healthScore,
        components,
        label: this.helpers.getHealthScoreLabel(healthScore),
        color: this.helpers.getHealthScoreColor(healthScore),
        status: this.helpers.getHealthStatus(healthScore),
        calculatedAt: new Date(),
        period: { startDate, endDate }
      };
    } catch (error) {
      this.logger.error('Error calculating department health:', error);
      throw error;
    }
  }

  // Branch Health Calculation
  async calculateBranchHealth(branchId, startDate, endDate) {
    try {
      const components = {
        attendance: await this.getBranchAttendanceHealth(branchId, startDate, endDate),
        taskCompletion: await this.getBranchTaskHealth(branchId, startDate, endDate),
        projectSuccess: await this.getBranchProjectHealth(branchId, startDate, endDate),
        performance: await this.getBranchPerformanceHealth(branchId, startDate, endDate)
      };

      const healthScore = this.helpers.calculateHealthScore(
        components,
        HEALTH_WEIGHTAGE.BRANCH
      );

      return {
        category: HEALTH_CATEGORY.BRANCH,
        entityId: branchId,
        entityType: 'branch',
        score: healthScore,
        components,
        label: this.helpers.getHealthScoreLabel(healthScore),
        color: this.helpers.getHealthScoreColor(healthScore),
        status: this.helpers.getHealthStatus(healthScore),
        calculatedAt: new Date(),
        period: { startDate, endDate }
      };
    } catch (error) {
      this.logger.error('Error calculating branch health:', error);
      throw error;
    }
  }

  // Employee Health Calculation
  async calculateEmployeeHealth(employeeId, startDate, endDate) {
    try {
      const components = {
        attendance: await this.getEmployeeAttendanceHealth(employeeId, startDate, endDate),
        taskCompletion: await this.getEmployeeTaskHealth(employeeId, startDate, endDate),
        performance: await this.getEmployeePerformanceHealth(employeeId, startDate, endDate)
      };

      const healthScore = this.helpers.calculateHealthScore(
        components,
        HEALTH_WEIGHTAGE.EMPLOYEE
      );

      return {
        category: HEALTH_CATEGORY.EMPLOYEE,
        entityId: employeeId,
        entityType: 'employee',
        score: healthScore,
        components,
        label: this.helpers.getHealthScoreLabel(healthScore),
        color: this.helpers.getHealthScoreColor(healthScore),
        status: this.helpers.getHealthStatus(healthScore),
        calculatedAt: new Date(),
        period: { startDate, endDate }
      };
    } catch (error) {
      this.logger.error('Error calculating employee health:', error);
      throw error;
    }
  }

  // Attendance Health (Organization Level)
  async getAttendanceHealth(startDate, endDate) {
    // This would integrate with Attendance module aggregation
    // Placeholder implementation
    try {
      // Would call: AttendanceAggregation.getOrganizationAttendanceStats(startDate, endDate)
      // For now, return a placeholder value
      return 85; // Placeholder - would be calculated from actual data
    } catch (error) {
      this.logger.error('Error getting attendance health:', error);
      return 0;
    }
  }

  // Task Health (Organization Level)
  async getTaskHealth(startDate, endDate) {
    // This would integrate with Task module aggregation
    try {
      // Would call: TaskAggregation.getOrganizationTaskStats(startDate, endDate)
      return 78; // Placeholder
    } catch (error) {
      this.logger.error('Error getting task health:', error);
      return 0;
    }
  }

  // Project Health (Organization Level)
  async getProjectHealth(startDate, endDate) {
    // This would integrate with Project module aggregation
    try {
      // Would call: ProjectAggregation.getOrganizationProjectStats(startDate, endDate)
      return 82; // Placeholder
    } catch (error) {
      this.logger.error('Error getting project health:', error);
      return 0;
    }
  }

  // Performance Health (Organization Level)
  async getPerformanceHealth(startDate, endDate) {
    // This would integrate with KPI module aggregation
    try {
      // Would call: KPIAggregation.getOrganizationPerformanceStats(startDate, endDate)
      return 88; // Placeholder
    } catch (error) {
      this.logger.error('Error getting performance health:', error);
      return 0;
    }
  }

  // Productivity Health (Organization Level)
  async getProductivityHealth(startDate, endDate) {
    // This would integrate with Task/Project modules
    try {
      // Would calculate productivity from task completion rates and efficiency
      return 80; // Placeholder
    } catch (error) {
      this.logger.error('Error getting productivity health:', error);
      return 0;
    }
  }

  // Department-specific health methods
  async getDepartmentAttendanceHealth(departmentId, startDate, endDate) {
    // Would call: AttendanceAggregation.getDepartmentAttendanceStats(departmentId, startDate, endDate)
    return 87; // Placeholder
  }

  async getDepartmentTaskHealth(departmentId, startDate, endDate) {
    // Would call: TaskAggregation.getDepartmentTaskStats(departmentId, startDate, endDate)
    return 80; // Placeholder
  }

  async getDepartmentProjectHealth(departmentId, startDate, endDate) {
    // Would call: ProjectAggregation.getDepartmentProjectStats(departmentId, startDate, endDate)
    return 85; // Placeholder
  }

  async getDepartmentPerformanceHealth(departmentId, startDate, endDate) {
    // Would call: KPIAggregation.getDepartmentPerformanceStats(departmentId, startDate, endDate)
    return 90; // Placeholder
  }

  // Branch-specific health methods
  async getBranchAttendanceHealth(branchId, startDate, endDate) {
    // Would call: AttendanceAggregation.getBranchAttendanceStats(branchId, startDate, endDate)
    return 83; // Placeholder
  }

  async getBranchTaskHealth(branchId, startDate, endDate) {
    // Would call: TaskAggregation.getBranchTaskStats(branchId, startDate, endDate)
    return 75; // Placeholder
  }

  async getBranchProjectHealth(branchId, startDate, endDate) {
    // Would call: ProjectAggregation.getBranchProjectStats(branchId, startDate, endDate)
    return 78; // Placeholder
  }

  async getBranchPerformanceHealth(branchId, startDate, endDate) {
    // Would call: KPIAggregation.getBranchPerformanceStats(branchId, startDate, endDate)
    return 85; // Placeholder
  }

  // Employee-specific health methods
  async getEmployeeAttendanceHealth(employeeId, startDate, endDate) {
    // Would call: AttendanceAggregation.getEmployeeAttendanceStats(employeeId, startDate, endDate)
    return 92; // Placeholder
  }

  async getEmployeeTaskHealth(employeeId, startDate, endDate) {
    // Would call: TaskAggregation.getEmployeeTaskStats(employeeId, startDate, endDate)
    return 85; // Placeholder
  }

  async getEmployeePerformanceHealth(employeeId, startDate, endDate) {
    // Would call: KPIAggregation.getEmployeePerformanceStats(employeeId, startDate, endDate)
    return 88; // Placeholder
  }

  // Risk Health Calculation
  async calculateRiskHealth(startDate, endDate) {
    try {
      const riskFactors = {
        attritionRisk: await this.getAttritionRiskScore(startDate, endDate),
        operationalRisk: await this.getOperationalRiskScore(startDate, endDate),
        financialRisk: await this.getFinancialRiskScore(startDate, endDate),
        complianceRisk: await this.getComplianceRiskScore(startDate, endDate)
      };

      const riskScore = this.helpers.calculateOrganizationRiskScore(riskFactors);

      return {
        category: HEALTH_CATEGORY.RISK,
        score: 100 - riskScore, // Invert risk to health
        components: riskFactors,
        label: this.helpers.getHealthScoreLabel(100 - riskScore),
        color: this.helpers.getHealthScoreColor(100 - riskScore),
        status: this.helpers.getHealthStatus(100 - riskScore),
        calculatedAt: new Date(),
        period: { startDate, endDate }
      };
    } catch (error) {
      this.logger.error('Error calculating risk health:', error);
      throw error;
    }
  }

  // Growth Health Calculation
  async calculateGrowthHealth(startDate, endDate) {
    try {
      const growthFactors = {
        employeeGrowth: await this.getEmployeeGrowthRate(startDate, endDate),
        revenueGrowth: await this.getRevenueGrowthRate(startDate, endDate),
        productivityGrowth: await this.getProductivityGrowthRate(startDate, endDate),
        performanceGrowth: await this.getPerformanceGrowthRate(startDate, endDate)
      };

      const growthScore = Object.values(growthFactors).reduce((sum, val) => sum + val, 0) / 4;

      return {
        category: HEALTH_CATEGORY.GROWTH,
        score: growthScore,
        components: growthFactors,
        label: this.helpers.getHealthScoreLabel(growthScore),
        color: this.helpers.getHealthScoreColor(growthScore),
        status: this.helpers.getHealthStatus(growthScore),
        calculatedAt: new Date(),
        period: { startDate, endDate }
      };
    } catch (error) {
      this.logger.error('Error calculating growth health:', error);
      throw error;
    }
  }

  // Risk Factor Calculations (Placeholder - would integrate with actual data)
  async getAttritionRiskScore(startDate, endDate) {
    // Would calculate from employee turnover data
    return 25; // Placeholder
  }

  async getOperationalRiskScore(startDate, endDate) {
    // Would calculate from operational metrics
    return 20; // Placeholder
  }

  async getFinancialRiskScore(startDate, endDate) {
    // Would calculate from financial metrics
    return 15; // Placeholder
  }

  async getComplianceRiskScore(startDate, endDate) {
    // Would calculate from compliance metrics
    return 10; // Placeholder
  }

  // Growth Factor Calculations (Placeholder - would integrate with actual data)
  async getEmployeeGrowthRate(startDate, endDate) {
    // Would calculate from employee count changes
    return 85; // Placeholder
  }

  async getRevenueGrowthRate(startDate, endDate) {
    // Would calculate from revenue data
    return 90; // Placeholder
  }

  async getProductivityGrowthRate(startDate, endDate) {
    // Would calculate from productivity metrics
    return 80; // Placeholder
  }

  async getPerformanceGrowthRate(startDate, endDate) {
    // Would calculate from performance metrics
    return 88; // Placeholder
  }

  // Health Comparison
  async compareHealth(currentHealth, previousHealth) {
    const change = currentHealth.score - previousHealth.score;
    const changePercent = this.helpers.calculateKPIChange(currentHealth.score, previousHealth.score);

    return {
      current: currentHealth,
      previous: previousHealth,
      change,
      changePercent,
      direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
      trend: this.helpers.getTrendDirection(changePercent)
    };
  }

  // Health Alerts
  async generateHealthAlerts(healthData) {
    const alerts = [];
    const metrics = {
      healthScore: healthData.score,
      ...healthData.components
    };

    const thresholdAlerts = this.helpers.checkAlertThresholds(metrics, ALERT_THRESHOLD);

    alerts.push(...thresholdAlerts);

    return alerts;
  }

  // Health Trend Analysis
  async analyzeHealthTrend(healthHistory, period = 'monthly') {
    if (healthHistory.length < 2) {
      return {
        trend: 'insufficient_data',
        direction: 'unknown',
        change: 0,
        changePercent: 0
      };
    }

    const recent = healthHistory.slice(-3);
    const older = healthHistory.slice(-6, -3);

    const recentAvg = recent.reduce((sum, h) => sum + h.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.score, 0) / older.length;

    const change = recentAvg - olderAvg;
    const changePercent = this.helpers.calculateKPIChange(recentAvg, olderAvg);

    return {
      trend: this.helpers.getTrendDirection(changePercent, healthHistory),
      direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
      change,
      changePercent,
      recentAvg,
      olderAvg
    };
  }

  // Batch Health Calculation
  async calculateBatchHealth(entityIds, entityType, startDate, endDate) {
    const healthScores = await Promise.all(
      entityIds.map(entityId => {
        switch (entityType) {
          case 'department':
            return this.calculateDepartmentHealth(entityId, startDate, endDate);
          case 'branch':
            return this.calculateBranchHealth(entityId, startDate, endDate);
          case 'employee':
            return this.calculateEmployeeHealth(entityId, startDate, endDate);
          default:
            return this.calculateOrganizationHealth(startDate, endDate);
        }
      })
    );

    return healthScores;
  }

  // Health Summary
  async getHealthSummary(startDate, endDate) {
    try {
      const [organizationHealth, riskHealth, growthHealth] = await Promise.all([
        this.calculateOrganizationHealth(startDate, endDate),
        this.calculateRiskHealth(startDate, endDate),
        this.calculateGrowthHealth(startDate, endDate)
      ]);

      return {
        organization: organizationHealth,
        risk: riskHealth,
        growth: growthHealth,
        overall: {
          score: (organizationHealth.score + riskHealth.score + growthHealth.score) / 3,
          label: this.helpers.getHealthScoreLabel(
            (organizationHealth.score + riskHealth.score + growthHealth.score) / 3
          ),
          color: this.helpers.getHealthScoreColor(
            (organizationHealth.score + riskHealth.score + growthHealth.score) / 3
          )
        }
      };
    } catch (error) {
      this.logger.error('Error getting health summary:', error);
      throw error;
    }
  }

  // Health Recommendations
  async generateHealthRecommendations(healthData) {
    const recommendations = [];

    if (healthData.score < ALERT_THRESHOLD.HEALTH_SCORE_CRITICAL) {
      recommendations.push({
        priority: 'critical',
        category: 'overall',
        message: 'Organization health is critically low. Immediate intervention required.',
        actions: [
          'Review all health components',
          'Implement urgent improvement plans',
          'Executive leadership intervention'
        ]
      });
    } else if (healthData.score < ALERT_THRESHOLD.HEALTH_SCORE_WARNING) {
      recommendations.push({
        priority: 'warning',
        category: 'overall',
        message: 'Organization health is below optimal levels. Action recommended.',
        actions: [
          'Analyze underperforming components',
          'Develop improvement strategies',
          'Monitor closely'
        ]
      });
    }

    // Component-specific recommendations
    Object.entries(healthData.components).forEach(([component, score]) => {
      if (score < 70) {
        recommendations.push({
          priority: score < 50 ? 'critical' : 'warning',
          category: component,
          message: `${component} health is at ${score.toFixed(1)}%.`,
          actions: this.getComponentRecommendations(component, score)
        });
      }
    });

    return recommendations;
  }

  getComponentRecommendations(component, score) {
    const recommendations = {
      attendance: [
        'Review attendance policies',
        'Address chronic absenteeism',
        'Implement attendance incentives'
      ],
      taskCompletion: [
        'Review task allocation',
        'Identify bottlenecks',
        'Provide additional resources'
      ],
      projectSuccess: [
        'Review project planning',
        'Strengthen project management',
        'Improve resource allocation'
      ],
      performance: [
        'Review performance metrics',
        'Provide training and development',
        'Adjust performance expectations'
      ],
      productivity: [
        'Review work processes',
        'Identify efficiency improvements',
        'Optimize resource utilization'
      ]
    };

    return recommendations[component] || ['Review component metrics', 'Develop improvement plan'];
  }
}

const organizationHealthService = new OrganizationHealthService();
export default organizationHealthService;
