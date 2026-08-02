import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import ExecutiveHelpers from './executive.helpers.js';
import ExecutiveUtils from './executive.utils.js';
import { INSIGHT_TYPE, RISK_LEVEL, PERFORMANCE_TIER, PIPELINE_STAGE } from './executive.constants.js';

class ExecutiveInsightsService {
  constructor() {
    this.logger = Logger;
    this.helpers = ExecutiveHelpers;
    this.utils = ExecutiveUtils;
  }

  // Top Performers
  async getTopPerformers(limit = 10, period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);
      
      // This would integrate with KPI/Performance module
      const topPerformers = await this.generateTopPerformersData(startDate, endDate, limit);
      
      return {
        type: INSIGHT_TYPE.TOP_PERFORMERS,
        period,
        dateRange: { startDate, endDate },
        performers: topPerformers,
        insights: this.generatePerformerInsights(topPerformers),
        recommendations: this.generatePerformerRecommendations(topPerformers)
      };
    } catch (error) {
      this.logger.error('Error getting top performers:', error);
      throw error;
    }
  }

  // Bottom Performers
  async getBottomPerformers(limit = 10, period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);
      
      const bottomPerformers = await this.generateBottomPerformersData(startDate, endDate, limit);
      
      return {
        type: INSIGHT_TYPE.BOTTOM_PERFORMERS,
        period,
        dateRange: { startDate, endDate },
        performers: bottomPerformers,
        insights: this.generateBottomPerformerInsights(bottomPerformers),
        recommendations: this.generateBottomPerformerRecommendations(bottomPerformers)
      };
    } catch (error) {
      this.logger.error('Error getting bottom performers:', error);
      throw error;
    }
  }

  // Department Rankings
  async getDepartmentRankings(metric = 'healthScore', period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);
      
      const departments = await this.generateDepartmentRankingsData(startDate, endDate, metric);
      const rankedDepartments = this.helpers.calculateRankings(departments, metric);
      
      return {
        type: INSIGHT_TYPE.DEPARTMENT_RANKINGS,
        metric,
        period,
        dateRange: { startDate, endDate },
        rankings: rankedDepartments,
        insights: this.generateRankingInsights(rankedDepartments),
        recommendations: this.generateRankingRecommendations(rankedDepartments)
      };
    } catch (error) {
      this.logger.error('Error getting department rankings:', error);
      throw error;
    }
  }

  // Branch Rankings
  async getBranchRankings(metric = 'healthScore', period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);
      
      const branches = await this.generateBranchRankingsData(startDate, endDate, metric);
      const rankedBranches = this.helpers.calculateRankings(branches, metric);
      
      return {
        type: INSIGHT_TYPE.BRANCH_RANKINGS,
        metric,
        period,
        dateRange: { startDate, endDate },
        rankings: rankedBranches,
        insights: this.generateRankingInsights(rankedBranches),
        recommendations: this.generateRankingRecommendations(rankedBranches)
      };
    } catch (error) {
      this.logger.error('Error getting branch rankings:', error);
      throw error;
    }
  }

  // Promotion Pipeline
  async getPromotionPipeline(departmentId = null, limit = 50) {
    try {
      const pipeline = await this.generatePromotionPipelineData(departmentId, limit);
      
      return {
        type: INSIGHT_TYPE.PROMOTION_PIPELINE,
        departmentId,
        pipeline,
        stages: this.helpers.calculatePipelineStageCount(pipeline, 'promotionStage'),
        conversionRates: {
          readyToPromoted: this.helpers.getPipelineConversionRate(pipeline, 'ready', 'promoted'),
          needsDevelopmentToReady: this.helpers.getPipelineConversionRate(pipeline, 'needs_development', 'ready')
        },
        insights: this.generatePipelineInsights(pipeline, 'promotion'),
        recommendations: this.generatePipelineRecommendations(pipeline, 'promotion')
      };
    } catch (error) {
      this.logger.error('Error getting promotion pipeline:', error);
      throw error;
    }
  }

  // Training Pipeline
  async getTrainingPipeline(departmentId = null, limit = 50) {
    try {
      const pipeline = await this.generateTrainingPipelineData(departmentId, limit);
      
      return {
        type: INSIGHT_TYPE.TRAINING_PIPELINE,
        departmentId,
        pipeline,
        stages: this.helpers.calculatePipelineStageCount(pipeline, 'trainingStage'),
        insights: this.generatePipelineInsights(pipeline, 'training'),
        recommendations: this.generatePipelineRecommendations(pipeline, 'training')
      };
    } catch (error) {
      this.logger.error('Error getting training pipeline:', error);
      throw error;
    }
  }

  // Succession Planning
  async getSuccessionPlanning(role = null, limit = 50) {
    try {
      const succession = await this.generateSuccessionPlanningData(role, limit);
      
      return {
        type: INSIGHT_TYPE.SUCCESSION_PLANNING,
        role,
        succession,
        stages: this.helpers.calculatePipelineStageCount(succession, 'successionStage'),
        readiness: this.calculateSuccessionReadiness(succession),
        insights: this.generateSuccessionInsights(succession),
        recommendations: this.generateSuccessionRecommendations(succession)
      };
    } catch (error) {
      this.logger.error('Error getting succession planning:', error);
      throw error;
    }
  }

  // Leadership Pipeline
  async getLeadershipPipeline(level = null, limit = 50) {
    try {
      const leadership = await this.generateLeadershipPipelineData(level, limit);
      
      return {
        type: INSIGHT_TYPE.LEADERSHIP_PIPELINE,
        level,
        leadership,
        stages: this.helpers.calculatePipelineStageCount(leadership, 'leadershipStage'),
        insights: this.generateLeadershipInsights(leadership),
        recommendations: this.generateLeadershipRecommendations(leadership)
      };
    } catch (error) {
      this.logger.error('Error getting leadership pipeline:', error);
      throw error;
    }
  }

  // Attrition Risk
  async getAttritionRisk(departmentId = null, branchId = null, limit = 50) {
    try {
      const atRiskEmployees = await this.generateAttritionRiskData(departmentId, branchId, limit);
      
      return {
        type: INSIGHT_TYPE.ATTRITION_RISK,
        departmentId,
        branchId,
        employees: atRiskEmployees,
        riskDistribution: this.calculateAttritionRiskDistribution(atRiskEmployees),
        insights: this.generateAttritionInsights(atRiskEmployees),
        recommendations: this.generateAttritionRecommendations(atRiskEmployees)
      };
    } catch (error) {
      this.logger.error('Error getting attrition risk:', error);
      throw error;
    }
  }

  // Hiring Recommendation
  async getHiringRecommendation(departmentId = null, branchId = null, limit = 50) {
    try {
      const recommendations = await this.generateHiringRecommendationData(departmentId, branchId, limit);
      
      return {
        type: INSIGHT_TYPE.HIRING_RECOMMENDATION,
        departmentId,
        branchId,
        recommendations,
        totalPositions: recommendations.reduce((sum, r) => sum + r.positions, 0),
        budgetRequired: recommendations.reduce((sum, r) => sum + r.budget, 0),
        insights: this.generateHiringInsights(recommendations),
        timeline: this.generateHiringTimeline(recommendations)
      };
    } catch (error) {
      this.logger.error('Error getting hiring recommendations:', error);
      throw error;
    }
  }

  // Workforce Capacity
  async getWorkforceCapacity(departmentId = null, branchId = null, period = 'this_month') {
    try {
      const { startDate, endDate } = this.utils.getPeriodDates(period);
      
      const capacity = await this.generateWorkforceCapacityData(departmentId, branchId, startDate, endDate);
      
      return {
        type: INSIGHT_TYPE.WORKFORCE_CAPACITY,
        departmentId,
        branchId,
        period,
        dateRange: { startDate, endDate },
        capacity,
        utilization: this.helpers.calculateCapacityUtilization(capacity.currentLoad, capacity.maxCapacity),
        status: this.helpers.getCapacityStatus(
          this.helpers.calculateCapacityUtilization(capacity.currentLoad, capacity.maxCapacity)
        ),
        insights: this.generateCapacityInsights(capacity),
        recommendations: this.generateCapacityRecommendations(capacity)
      };
    } catch (error) {
      this.logger.error('Error getting workforce capacity:', error);
      throw error;
    }
  }

  // Organization Risk
  async getOrganizationRisk(category = null, limit = 50) {
    try {
      const risks = await this.generateOrganizationRiskData(category, limit);
      
      return {
        type: INSIGHT_TYPE.ORGANIZATION_RISK,
        category,
        risks,
        overallRiskScore: this.helpers.calculateOrganizationRiskScore(risks),
        riskCategory: this.helpers.getOrganizationRiskCategory(
          this.helpers.calculateOrganizationRiskScore(risks)
        ),
        insights: this.generateRiskInsights(risks),
        recommendations: this.generateRiskRecommendations(risks)
      };
    } catch (error) {
      this.logger.error('Error getting organization risk:', error);
      throw error;
    }
  }

  // Data Generation Methods (These would integrate with actual module data)
  async generateTopPerformersData(startDate, endDate, limit) {
    // Placeholder - would integrate with KPI/Performance module
    const performers = [];
    for (let i = 1; i <= limit; i++) {
      performers.push({
        employeeId: `EMP${i}`,
        name: `Employee ${i}`,
        department: 'Engineering',
        performanceScore: 90 + Math.random() * 10,
        taskCompletionRate: 95 + Math.random() * 5,
        attendanceRate: 98 + Math.random() * 2,
        productivityScore: 92 + Math.random() * 8,
        tier: this.helpers.getPerformanceTierLabel(90 + Math.random() * 10)
      });
    }
    return performers.sort((a, b) => b.performanceScore - a.performanceScore);
  }

  async generateBottomPerformersData(startDate, endDate, limit) {
    const performers = [];
    for (let i = 1; i <= limit; i++) {
      performers.push({
        employeeId: `EMP${i + 100}`,
        name: `Employee ${i + 100}`,
        department: 'Engineering',
        performanceScore: 40 + Math.random() * 20,
        taskCompletionRate: 50 + Math.random() * 20,
        attendanceRate: 70 + Math.random() * 15,
        productivityScore: 45 + Math.random() * 25,
        tier: this.helpers.getPerformanceTierLabel(40 + Math.random() * 20)
      });
    }
    return performers.sort((a, b) => a.performanceScore - b.performanceScore);
  }

  async generateDepartmentRankingsData(startDate, endDate, metric) {
    // Placeholder - would integrate with actual department data
    return [
      { departmentId: '1', name: 'Engineering', healthScore: 88, performanceScore: 85, productivityScore: 90 },
      { departmentId: '2', name: 'Sales', healthScore: 85, performanceScore: 82, productivityScore: 88 },
      { departmentId: '3', name: 'Marketing', healthScore: 82, performanceScore: 80, productivityScore: 85 },
      { departmentId: '4', name: 'HR', healthScore: 90, performanceScore: 88, productivityScore: 92 },
      { departmentId: '5', name: 'Finance', healthScore: 87, performanceScore: 86, productivityScore: 89 }
    ];
  }

  async generateBranchRankingsData(startDate, endDate, metric) {
    // Placeholder - would integrate with actual branch data
    return [
      { branchId: '1', name: 'Headquarters', healthScore: 90, performanceScore: 87, productivityScore: 91 },
      { branchId: '2', name: 'North Branch', healthScore: 85, performanceScore: 83, productivityScore: 87 },
      { branchId: '3', name: 'South Branch', healthScore: 83, performanceScore: 80, productivityScore: 85 },
      { branchId: '4', name: 'East Branch', healthScore: 87, performanceScore: 85, productivityScore: 88 }
    ];
  }

  async generatePromotionPipelineData(departmentId, limit) {
    // Placeholder - would integrate with KPI/Performance module
    const pipeline = [];
    const stages = ['ready', 'needs_development', 'not_ready'];
    
    for (let i = 1; i <= limit; i++) {
      pipeline.push({
        employeeId: `EMP${i}`,
        name: `Employee ${i}`,
        department: departmentId || 'Engineering',
        currentRole: 'Senior Developer',
        targetRole: 'Team Lead',
        promotionStage: stages[Math.floor(Math.random() * stages.length)],
        performanceScore: 75 + Math.random() * 20,
        tenure: 24 + Math.floor(Math.random() * 60),
        lastPromotion: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      });
    }
    
    return pipeline;
  }

  async generateTrainingPipelineData(departmentId, limit) {
    // Placeholder - would integrate with Training module
    const pipeline = [];
    const stages = ['required', 'recommended', 'optional'];
    
    for (let i = 1; i <= limit; i++) {
      pipeline.push({
        employeeId: `EMP${i}`,
        name: `Employee ${i}`,
        department: departmentId || 'Engineering',
        trainingStage: stages[Math.floor(Math.random() * stages.length)],
        requiredSkills: ['JavaScript', 'React', 'Node.js'].slice(0, Math.floor(Math.random() * 3) + 1),
        skillGaps: ['Cloud', 'DevOps', 'Security'].slice(0, Math.floor(Math.random() * 2) + 1),
        lastTraining: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      });
    }
    
    return pipeline;
  }

  async generateSuccessionPlanningData(role, limit) {
    // Placeholder - would integrate with KPI/Performance module
    const succession = [];
    const stages = ['ready_now', 'ready_in_1_year', 'ready_in_2_years', 'needs_development'];
    
    for (let i = 1; i <= limit; i++) {
      succession.push({
        employeeId: `EMP${i}`,
        name: `Employee ${i}`,
        currentRole: 'Manager',
        targetRole: role || 'Director',
        successionStage: stages[Math.floor(Math.random() * stages.length)],
        readinessScore: 60 + Math.random() * 40,
        experience: 5 + Math.floor(Math.random() * 15),
      });
    }
    
    return succession;
  }

  async generateLeadershipPipelineData(level, limit) {
    // Placeholder - would integrate with KPI/Performance module
    const leadership = [];
    const levels = ['executive', 'senior_leadership', 'middle_management', 'team_lead'];
    
    for (let i = 1; i <= limit; i++) {
      leadership.push({
        employeeId: `EMP${i}`,
        name: `Employee ${i}`,
        currentLevel: levels[Math.floor(Math.random() * levels.length)],
        targetLevel: level || 'senior_leadership',
        leadershipStage: 'ready',
        leadershipScore: 70 + Math.random() * 30,
        teamSize: 5 + Math.floor(Math.random() * 20)
      });
    }
    
    return leadership;
  }

  async generateAttritionRiskData(departmentId, branchId, limit) {
    // Placeholder - would integrate with Employee/KPI modules
    const atRiskEmployees = [];
    
    for (let i = 1; i <= limit; i++) {
      const riskScore = this.helpers.calculateAttritionRiskScore({
        performanceScore: 50 + Math.random() * 40,
        joiningDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5),
        lastPromotionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3),
        engagementScore: 40 + Math.random() * 50,
        workloadScore: 50 + Math.random() * 40,
        compensationBelowMarket: Math.random() > 0.5
      });
      
      atRiskEmployees.push({
        employeeId: `EMP${i}`,
        name: `Employee ${i}`,
        department: departmentId || 'Engineering',
        riskScore,
        riskLevel: this.getRiskLevelFromScore(riskScore),
        riskFactors: this.identifyRiskFactors(riskScore),
        tenure: this.helpers.calculateTenure(new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5))
      });
    }
    
    return atRiskEmployees.sort((a, b) => b.riskScore - a.riskScore);
  }

  async generateHiringRecommendationData(departmentId, branchId, limit) {
    // Placeholder - would integrate with HR/Workforce Planning
    const recommendations = [];
    const statuses = ['immediate', 'priority', 'planned', 'on_hold', 'not_required'];
    
    for (let i = 1; i <= limit; i++) {
      recommendations.push({
        positionId: `POS${i}`,
        title: ['Software Engineer', 'Product Manager', 'Data Analyst', 'DevOps Engineer'][i % 4],
        department: departmentId || 'Engineering',
        recommendation: statuses[Math.floor(Math.random() * statuses.length)],
        positions: 1 + Math.floor(Math.random() * 5),
        budget: 50000 + Math.random() * 100000,
        priority: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
        reason: 'Workforce expansion'
      });
    }
    
    return recommendations.filter(r => r.recommendation !== 'not_required');
  }

  async generateWorkforceCapacityData(departmentId, branchId, startDate, endDate) {
    // Placeholder - would integrate with Task/Project modules
    return {
      currentLoad: 850,
      maxCapacity: 1000,
      availableCapacity: 150,
      projectedLoad: 900,
      utilizationRate: 85,
      departmentId,
      branchId
    };
  }

  async generateOrganizationRiskData(category, limit) {
    // Placeholder - would integrate with various modules
    const risks = [];
    const categories = ['talent', 'operational', 'financial', 'strategic', 'compliance', 'reputational'];
    
    for (let i = 1; i <= limit; i++) {
      const riskCategory = category || categories[i % categories.length];
      risks.push({
        riskId: `RISK${i}`,
        title: `${riskCategory} Risk ${i}`,
        category: riskCategory,
        score: 20 + Math.random() * 60,
        impact: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        likelihood: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        description: `Risk description for ${riskCategory} risk ${i}`,
        mitigation: 'Mitigation strategy description'
      });
    }
    
    return risks;
  }

  // Helper Methods
  getRiskLevelFromScore(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'minimal';
  }

  identifyRiskFactors(riskScore) {
    const factors = [];
    
    if (riskScore > 70) factors.push('High performance with low compensation');
    if (riskScore > 60) factors.push('Long tenure without promotion');
    if (riskScore > 50) factors.push('High workload');
    if (riskScore > 40) factors.push('Low engagement');
    
    return factors;
  }

  calculateSuccessionReadiness(succession) {
    const stages = succession.reduce((acc, s) => {
      acc[s.successionStage] = (acc[s.successionStage] || 0) + 1;
      return acc;
    }, {});
    
    const total = succession.length;
    
    return {
      readyNow: stages.ready_now || 0,
      readyIn1Year: stages.ready_in_1_year || 0,
      readyIn2Years: stages.ready_in_2_years || 0,
      needsDevelopment: stages.needs_development || 0,
      readinessRate: total > 0 ? ((stages.ready_now || 0) / total) * 100 : 0
    };
  }

  calculateAttritionRiskDistribution(employees) {
    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      minimal: 0
    };
    
    employees.forEach(e => {
      distribution[e.riskLevel]++;
    });
    
    return distribution;
  }

  // Insight Generation Methods
  generatePerformerInsights(performers) {
    const insights = [];
    
    if (performers.length > 0) {
      const avgScore = performers.reduce((sum, p) => sum + p.performanceScore, 0) / performers.length;
      insights.push({
        metric: 'averagePerformance',
        value: avgScore.toFixed(1),
        insight: `Top performers average score: ${avgScore.toFixed(1)}%`
      });
    }

    const departmentCounts = this.helpers.aggregateByField(performers, 'department', 'count');
    const topDepartment = Object.entries(departmentCounts).sort((a, b) => b[1] - a[1])[0];
    if (topDepartment) {
      insights.push({
        metric: 'topDepartment',
        value: topDepartment[0],
        insight: `Most top performers in: ${topDepartment[0]}`
      });
    }

    return insights;
  }

  generatePerformerRecommendations(performers) {
    const recommendations = [];
    
    recommendations.push({
      priority: 'high',
      action: 'Recognize and reward top performers',
      target: performers.slice(0, 5).map(p => p.employeeId)
    });

    recommendations.push({
      priority: 'medium',
      action: 'Create mentorship programs',
      target: performers.map(p => p.employeeId)
    });

    return recommendations;
  }

  generateBottomPerformerInsights(performers) {
    const insights = [];
    
    if (performers.length > 0) {
      const avgScore = performers.reduce((sum, p) => sum + p.performanceScore, 0) / performers.length;
      insights.push({
        metric: 'averagePerformance',
        value: avgScore.toFixed(1),
        insight: `Bottom performers average score: ${avgScore.toFixed(1)}%`
      });
    }

    const commonIssues = this.identifyCommonPerformanceIssues(performers);
    insights.push({
      metric: 'commonIssues',
      value: commonIssues,
      insight: `Common performance issues: ${commonIssues.join(', ')}`
    });

    return insights;
  }

  generateBottomPerformerRecommendations(performers) {
    const recommendations = [];
    
    recommendations.push({
      priority: 'critical',
      action: 'Implement performance improvement plans',
      target: performers.slice(0, 5).map(p => p.employeeId)
    });

    recommendations.push({
      priority: 'high',
      action: 'Provide additional training and support',
      target: performers.map(p => p.employeeId)
    });

    return recommendations;
  }

  identifyCommonPerformanceIssues(performers) {
    const issues = [];
    
    const lowAttendance = performers.filter(p => p.attendanceRate < 85).length;
    const lowTaskCompletion = performers.filter(p => p.taskCompletionRate < 80).length;
    const lowProductivity = performers.filter(p => p.productivityScore < 75).length;
    
    if (lowAttendance > performers.length * 0.5) issues.push('Attendance issues');
    if (lowTaskCompletion > performers.length * 0.5) issues.push('Task completion issues');
    if (lowProductivity > performers.length * 0.5) issues.push('Productivity issues');
    
    return issues.length > 0 ? issues : ['General performance issues'];
  }

  generateRankingInsights(rankings) {
    const insights = [];
    
    if (rankings.length > 0) {
      const top = rankings[0];
      const bottom = rankings[rankings.length - 1];
      
      insights.push({
        metric: 'topRanked',
        value: top.name,
        insight: `Top ranked: ${top.name} (${top.healthScore}%)`
      });

      insights.push({
        metric: 'bottomRanked',
        value: bottom.name,
        insight: `Bottom ranked: ${bottom.name} (${bottom.healthScore}%)`
      });

      const gap = top.healthScore - bottom.healthScore;
      insights.push({
        metric: 'performanceGap',
        value: gap.toFixed(1),
        insight: `Performance gap: ${gap.toFixed(1)}%`
      });
    }

    return insights;
  }

  generateRankingRecommendations(rankings) {
    const recommendations = [];
    
    const bottomRankings = rankings.slice(-3);
    recommendations.push({
      priority: 'high',
      action: 'Focus improvement efforts on bottom performers',
      target: bottomRankings.map(r => r.name)
    });

    const topRankings = rankings.slice(0, 3);
    recommendations.push({
      priority: 'medium',
      action: 'Share best practices from top performers',
      target: topRankings.map(r => r.name)
    });

    return recommendations;
  }

  generatePipelineInsights(pipeline, pipelineType) {
    const insights = [];
    const stages = this.helpers.calculatePipelineStageCount(pipeline, `${pipelineType}Stage`);
    
    const readyCount = stages.ready || stages.ready_now || 0;
    const totalCount = pipeline.length;
    const readinessRate = totalCount > 0 ? (readyCount / totalCount) * 100 : 0;
    
    insights.push({
      metric: 'readinessRate',
      value: readinessRate.toFixed(1),
      insight: `${pipelineType} readiness rate: ${readinessRate.toFixed(1)}%`
    });

    const needsDevelopment = stages.needs_development || 0;
    if (needsDevelopment > totalCount * 0.3) {
      insights.push({
        metric: 'developmentNeeded',
        value: needsDevelopment,
        insight: `${needsDevelopment} employees need development`
      });
    }

    return insights;
  }

  generatePipelineRecommendations(pipeline, pipelineType) {
    const recommendations = [];
    
    const readyEmployees = pipeline.filter(p => 
      p[`${pipelineType}Stage`] === 'ready' || p[`${pipelineType}Stage`] === 'ready_now'
    );
    
    recommendations.push({
      priority: 'high',
      action: `Advance ready ${pipelineType} candidates`,
      target: readyEmployees.map(e => e.employeeId)
    });

    const needsDevelopment = pipeline.filter(p => p[`${pipelineType}Stage`] === 'needs_development');
    recommendations.push({
      priority: 'medium',
      action: `Provide development for ${pipelineType} candidates`,
      target: needsDevelopment.map(e => e.employeeId)
    });

    return recommendations;
  }

  generateSuccessionInsights(succession) {
    const insights = [];
    const readiness = this.calculateSuccessionReadiness(succession);
    
    insights.push({
      metric: 'readinessRate',
      value: readiness.readinessRate.toFixed(1),
      insight: `Succession readiness rate: ${readiness.readinessRate.toFixed(1)}%`
    });

    if (readiness.readyNow < succession.length * 0.2) {
      insights.push({
        metric: 'successionGap',
        insight: 'Succession gap identified - develop more ready candidates'
      });
    }

    return insights;
  }

  generateSuccessionRecommendations(succession) {
    const recommendations = [];
    
    const readyNow = succession.filter(s => s.successionStage === 'ready_now');
    recommendations.push({
      priority: 'high',
      action: 'Prepare ready candidates for succession',
      target: readyNow.map(s => s.employeeId)
    });

    const needsDevelopment = succession.filter(s => s.successionStage === 'needs_development');
    recommendations.push({
      priority: 'critical',
      action: 'Accelerate development for succession candidates',
      target: needsDevelopment.map(s => s.employeeId)
    });

    return recommendations;
  }

  generateLeadershipInsights(leadership) {
    const insights = [];
    
    const avgLeadershipScore = leadership.reduce((sum, l) => sum + l.leadershipScore, 0) / leadership.length;
    insights.push({
      metric: 'averageLeadershipScore',
      value: avgLeadershipScore.toFixed(1),
      insight: `Average leadership score: ${avgLeadershipScore.toFixed(1)}%`
    });

    const levels = this.helpers.aggregateByField(leadership, 'currentLevel', 'count');
    insights.push({
      metric: 'leadershipDistribution',
      value: levels,
      insight: 'Leadership distribution across levels'
    });

    return insights;
  }

  generateLeadershipRecommendations(leadership) {
    const recommendations = [];
    
    const highPotential = leadership.filter(l => l.leadershipScore > 85);
    recommendations.push({
      priority: 'high',
      action: 'Fast-track high-potential leaders',
      target: highPotential.map(l => l.employeeId)
    });

    const teamLeads = leadership.filter(l => l.currentLevel === 'team_lead');
    recommendations.push({
      priority: 'medium',
      action: 'Develop team leads for next level',
      target: teamLeads.map(l => l.employeeId)
    });

    return recommendations;
  }

  generateAttritionInsights(employees) {
    const insights = [];
    
    const avgRiskScore = employees.reduce((sum, e) => sum + e.riskScore, 0) / employees.length;
    insights.push({
      metric: 'averageRiskScore',
      value: avgRiskScore.toFixed(1),
      insight: `Average attrition risk score: ${avgRiskScore.toFixed(1)}%`
    });

    const highRiskCount = employees.filter(e => e.riskLevel === 'critical' || e.riskLevel === 'high').length;
    insights.push({
      metric: 'highRiskCount',
      value: highRiskCount,
      insight: `${highRiskCount} employees at high attrition risk`
    });

    return insights;
  }

  generateAttritionRecommendations(employees) {
    const recommendations = [];
    
    const criticalRisk = employees.filter(e => e.riskLevel === 'critical');
    recommendations.push({
      priority: 'critical',
      action: 'Immediate intervention for critical risk employees',
      target: criticalRisk.map(e => e.employeeId)
    });

    const highRisk = employees.filter(e => e.riskLevel === 'high');
    recommendations.push({
      priority: 'high',
      action: 'Retention planning for high risk employees',
      target: highRisk.map(e => e.employeeId)
    });

    return recommendations;
  }

  generateHiringInsights(recommendations) {
    const insights = [];
    
    const immediate = recommendations.filter(r => r.recommendation === 'immediate');
    insights.push({
      metric: 'immediateHiring',
      value: immediate.length,
      insight: `${immediate.length} positions require immediate hiring`
    });

    const totalBudget = recommendations.reduce((sum, r) => sum + r.budget, 0);
    insights.push({
      metric: 'totalBudget',
      value: totalBudget.toFixed(0),
      insight: `Total budget required: $${totalBudget.toFixed(0)}`
    });

    return insights;
  }

  generateHiringTimeline(recommendations) {
    const timeline = {
      immediate: recommendations.filter(r => r.recommendation === 'immediate').length,
      within30Days: recommendations.filter(r => r.recommendation === 'priority').length,
      within90Days: recommendations.filter(r => r.recommendation === 'planned').length,
      onHold: recommendations.filter(r => r.recommendation === 'on_hold').length
    };

    return timeline;
  }

  generateCapacityInsights(capacity) {
    const insights = [];
    
    const utilization = this.helpers.calculateCapacityUtilization(capacity.currentLoad, capacity.maxCapacity);
    insights.push({
      metric: 'utilization',
      value: utilization.toFixed(1),
      insight: `Current capacity utilization: ${utilization.toFixed(1)}%`
    });

    const projectedUtilization = this.helpers.calculateCapacityUtilization(capacity.projectedLoad, capacity.maxCapacity);
    insights.push({
      metric: 'projectedUtilization',
      value: projectedUtilization.toFixed(1),
      insight: `Projected utilization: ${projectedUtilization.toFixed(1)}%`
    });

    return insights;
  }

  generateCapacityRecommendations(capacity) {
    const recommendations = [];
    const utilization = this.helpers.calculateCapacityUtilization(capacity.currentLoad, capacity.maxCapacity);
    
    if (utilization > 90) {
      recommendations.push({
        priority: 'critical',
        action: 'Increase capacity or reduce workload',
        target: 'organization'
      });
    } else if (utilization < 60) {
      recommendations.push({
        priority: 'medium',
        action: 'Optimize resource allocation',
        target: 'organization'
      });
    }

    return recommendations;
  }

  generateRiskInsights(risks) {
    const insights = [];
    
    const avgRiskScore = this.helpers.calculateOrganizationRiskScore(risks);
    insights.push({
      metric: 'overallRiskScore',
      value: avgRiskScore.toFixed(1),
      insight: `Overall organization risk score: ${avgRiskScore.toFixed(1)}%`
    });

    const highImpactRisks = risks.filter(r => r.impact === 'high' || r.impact === 'critical');
    insights.push({
      metric: 'highImpactRisks',
      value: highImpactRisks.length,
      insight: `${highImpactRisks.length} high-impact risks identified`
    });

    return insights;
  }

  generateRiskRecommendations(risks) {
    const recommendations = [];
    
    const criticalRisks = risks.filter(r => r.impact === 'critical');
    recommendations.push({
      priority: 'critical',
      action: 'Immediate mitigation for critical risks',
      target: criticalRisks.map(r => r.riskId)
    });

    const highRisks = risks.filter(r => r.impact === 'high');
    recommendations.push({
      priority: 'high',
      action: 'Develop mitigation plans for high risks',
      target: highRisks.map(r => r.riskId)
    });

    return recommendations;
  }
}

const executiveInsightsService = new ExecutiveInsightsService();
export default executiveInsightsService;
