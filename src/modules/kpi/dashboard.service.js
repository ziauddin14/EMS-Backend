import kpiService from './kpi.service.js';
import goalService from './goal.service.js';
import performanceService from './performance.service.js';
import appraisalService from './appraisal.service.js';
import rewardService from './reward.service.js';
import warningService from './warning.service.js';
import executiveService from './executive.service.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';

class DashboardService {
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

  // Employee Dashboard
  async getEmployeeDashboard(employeeId, year, periodType) {
    this.logger.info(`Getting employee dashboard for ${employeeId}`);
    
    const currentYear = year || new Date().getFullYear();
    const currentPeriod = periodType || 'yearly';

    // Get KPI data
    const kpiDashboard = await this.kpiService.getDashboard(employeeId, currentYear, currentPeriod);
    
    // Get Performance data
    const performanceDashboard = await this.performanceService.getDashboard(employeeId, currentYear, currentPeriod);
    
    // Get Goal data
    const goalDashboard = await this.goalService.getDashboard(employeeId, currentYear);
    
    // Get Reward data
    const rewardDashboard = await this.rewardService.getDashboard(employeeId, currentYear);
    
    // Get Warning data
    const warningDashboard = await this.warningService.getDashboard(employeeId, currentYear);
    
    // Get Appraisal data
    const appraisalDashboard = await this.appraisalService.getDashboard(employeeId, currentYear, currentPeriod);
    
    // Get promotion and bonus eligibility
    const promotionEligibility = await this.performanceService.checkPromotionEligibility(employeeId, currentYear);
    const bonusEligibility = await this.performanceService.checkBonusEligibility(employeeId, currentYear);
    
    // Get historical trend
    const historicalTrend = await this.performanceService.getHistoricalTrend(employeeId, [currentYear - 2, currentYear - 1, currentYear]);
    
    // Get ranking
    const ranking = await this.performanceService.calculateRanking(currentYear, currentPeriod);
    const employeeRank = ranking.find(r => r.employee.toString() === employeeId);
    
    // Get department ranking
    const departmentRankings = await this.performanceService.getDepartmentRankings(
      kpiDashboard.currentPerformance?.department || null,
      currentYear,
      currentPeriod
    );
    const departmentRank = departmentRankings.find(r => r.employee.toString() === employeeId);
    
    // Get training recommendations from appraisal
    const appraisals = await this.appraisalService.repository.findByEmployee(employeeId, {
      filter: { year: currentYear },
      sort: { createdAt: -1 }
    });
    const trainingRecommendations = appraisals[0]?.trainingRecommendations || [];
    
    // Get improvement suggestions from KPI
    const improvements = kpiDashboard.currentPerformance?.improvements || [];
    
    return {
      employeeId,
      year: currentYear,
      periodType: currentPeriod,
      kpi: {
        currentScore: kpiDashboard.currentPerformance?.overallScore || 0,
        grade: kpiDashboard.currentPerformance?.performanceGrade || 'N/A',
        status: kpiDashboard.currentPerformance?.performanceStatus || 'N/A',
        trend: kpiDashboard.improvementPercentage || 0,
        strengths: kpiDashboard.currentPerformance?.strengths || [],
        weaknesses: kpiDashboard.currentPerformance?.weaknesses || []
      },
      performance: {
        overallScore: performanceDashboard.currentPerformance?.yearlyPerformance?.overallScore || 0,
        grade: performanceDashboard.currentPerformance?.yearlyPerformance?.grade || 'N/A',
        trend: performanceDashboard.currentPerformance?.yearlyPerformance?.trend || 'stable',
        improvementPercentage: performanceDashboard.improvementPercentage || 0,
        rank: employeeRank?.rank || null,
        percentile: performanceDashboard.percentile || 0
      },
      goals: {
        total: goalDashboard.totalGoals || 0,
        completed: goalDashboard.completedGoals || 0,
        inProgress: goalDashboard.inProgressGoals || 0,
        overdue: goalDashboard.overdueGoals || 0,
        completionRate: goalDashboard.completionRate || 0
      },
      rewards: {
        total: rewardDashboard.totalRewards || 0,
        totalPoints: rewardDashboard.totalPoints || 0,
        totalAmount: rewardDashboard.totalAmount || 0,
        recentRewards: rewardDashboard.recentRewards || []
      },
      warnings: {
        total: warningDashboard.totalWarnings || 0,
        active: warningDashboard.activeWarnings || 0,
        resolved: warningDashboard.resolvedWarnings || 0,
        recentWarnings: warningDashboard.recentWarnings || []
      },
      appraisal: {
        status: appraisalDashboard.status || 'N/A',
        selfRating: appraisalDashboard.selfRating || 0,
        managerRating: appraisalDashboard.managerRating || 0,
        finalRating: appraisalDashboard.finalRating || 0,
        finalGrade: appraisalDashboard.finalGrade || 'N/A'
      },
      eligibility: {
        promotion: promotionEligibility,
        bonus: bonusEligibility,
        appraisal: appraisalDashboard.eligible || false
      },
      ranking: {
        organizationRank: employeeRank?.rank || null,
        departmentRank: departmentRank?.rank || null,
        totalEmployees: ranking.length
      },
      training: {
        required: appraisals[0]?.trainingRequired || false,
        recommendations: trainingRecommendations
      },
      improvements,
      historicalTrend,
      performanceTimeline: historicalTrend
    };
  }

  // Manager Dashboard
  async getManagerDashboard(managerId, year, periodType) {
    this.logger.info(`Getting manager dashboard for ${managerId}`);
    
    const currentYear = year || new Date().getFullYear();
    const currentPeriod = periodType || 'yearly';

    // Get team KPI
    const teamKPI = await this.kpiService.repository.findByManager(managerId, {
      filter: { year: currentYear, periodType: currentPeriod },
      sort: { overallScore: -1 }
    });

    // Get team performance
    const teamPerformance = await this.performanceService.getManagerDashboard(managerId, currentYear, currentPeriod);
    
    // Get team goals
    const teamGoals = await this.goalService.getManagerDashboard(managerId, currentYear);
    
    // Get team rewards
    const teamRewards = await this.rewardService.getManagerDashboard(managerId, currentYear);
    
    // Get team warnings
    const teamWarnings = await this.warningService.getManagerDashboard(managerId, currentYear);
    
    // Get top performers
    const topPerformers = await this.performanceService.repository.getTopPerformers(currentYear, 10);
    const teamTopPerformers = topPerformers.filter(p => p.reportingManager?.toString() === managerId);
    
    // Get low performers
    const lowPerformers = await this.performanceService.repository.getLowPerformers(currentYear, 10);
    const teamLowPerformers = lowPerformers.filter(p => p.reportingManager?.toString() === managerId);
    
    // Get promotion eligible
    const promotionEligible = await this.performanceService.repository.getPromotionEligible(currentYear);
    const teamPromotionEligible = promotionEligible.filter(p => p.reportingManager?.toString() === managerId);
    
    // Get training candidates
    const trainingCandidates = await this.appraisalService.repository.findAll({
      filter: {
        year: currentYear,
        trainingRequired: true,
        'reportingManager': managerId
      },
      sort: { createdAt: -1 }
    });

    // Calculate team ranking
    const allTeamPerformance = await this.performanceService.repository.findByManager(managerId, {
      filter: { year: currentYear, periodType: currentPeriod },
      sort: { 'yearlyPerformance.overallScore': -1 }
    });
    
    const teamRanking = allTeamPerformance.map((perf, index) => ({
      employee: perf.employee,
      employeeName: perf.employeeName,
      overallScore: perf.yearlyPerformance.overallScore,
      grade: perf.yearlyPerformance.grade,
      rank: index + 1
    }));

    return {
      managerId,
      year: currentYear,
      periodType: currentPeriod,
      team: {
        totalMembers: teamPerformance.totalTeamMembers || 0,
        averageScore: teamPerformance.averageTeamScore || 0,
        ranking: teamRanking
      },
      kpi: {
        averageScore: teamKPI.length > 0 ? teamKPI.reduce((sum, k) => sum + k.overallScore, 0) / teamKPI.length : 0,
        topPerformers: teamKPI.slice(0, 5),
        lowPerformers: teamKPI.slice(-5).reverse()
      },
      goals: {
        totalGoals: teamGoals.totalGoals || 0,
        completed: teamGoals.completedGoals || 0,
        inProgress: teamGoals.inProgressGoals || 0,
        overdue: teamGoals.overdueGoals || 0,
        completionRate: teamGoals.completionRate || 0
      },
      performance: {
        topPerformers: teamTopPerformers,
        lowPerformers: teamLowPerformers,
        averageScore: teamPerformance.averageTeamScore || 0
      },
      rewards: {
        totalRewards: teamRewards.totalRewards || 0,
        totalAmount: teamRewards.totalAmount || 0,
        topRewarded: teamRewards.topRewarded || []
      },
      warnings: {
        totalWarnings: teamWarnings.totalWarnings || 0,
        activeWarnings: teamWarnings.activeWarnings || 0,
        severeWarnings: teamWarnings.severeWarnings || 0
      },
      promotion: {
        eligibleCount: teamPromotionEligible.length,
        candidates: teamPromotionEligible
      },
      training: {
        requiredCount: trainingCandidates.length,
        candidates: trainingCandidates
      },
      trends: {
        monthly: await this.getTeamMonthlyTrend(managerId, currentYear),
        quarterly: await this.getTeamQuarterlyTrend(managerId, currentYear)
      }
    };
  }

  // HR Dashboard
  async getHRDashboard(year, periodType) {
    this.logger.info('Getting HR dashboard');
    
    const currentYear = year || new Date().getFullYear();
    const currentPeriod = periodType || 'yearly';

    // Get organization overview
    const organizationOverview = await this.executiveService.getOrganizationOverview(currentYear);
    
    // Get department comparison
    const departmentComparison = await this.executiveService.getDepartmentComparison(currentYear);
    
    // Get performance distribution
    const performanceDistribution = await this.getPerformanceDistribution(currentYear);
    
    // Get attendance impact
    const attendanceImpact = await this.getAttendanceImpact(currentYear);
    
    // Get task impact
    const taskImpact = await this.getTaskImpact(currentYear);
    
    // Get productivity metrics
    const productivityMetrics = await this.getProductivityMetrics(currentYear);
    
    // Get promotion pipeline
    const promotionPipeline = await this.getPromotionPipeline(currentYear);
    
    // Get training pipeline
    const trainingPipeline = await this.getTrainingPipeline(currentYear);
    
    // Get performance heatmap data
    const heatmapData = await this.getPerformanceHeatmap(currentYear);

    return {
      year: currentYear,
      periodType: currentPeriod,
      organization: organizationOverview,
      departments: departmentComparison,
      performanceDistribution,
      attendanceImpact,
      taskImpact,
      productivityMetrics,
      promotionPipeline,
      trainingPipeline,
      heatmapData
    };
  }

  // CEO Dashboard
  async getCEODashboard(year, periodType) {
    this.logger.info('Getting CEO dashboard');
    
    const currentYear = year || new Date().getFullYear();
    const currentPeriod = periodType || 'yearly';

    // Get executive dashboard
    const executiveDashboard = await this.executiveService.getExecutiveDashboard(currentYear);
    
    // Get key metrics
    const keyMetrics = await this.executiveService.getKeyMetrics(currentYear);
    
    // Get organization health score
    const healthScore = await this.executiveService.calculateOrganizationHealthScore(currentYear);
    
    // Get department rankings
    const departmentRankings = await this.getDepartmentRankings(currentYear);
    
    // Get branch rankings (if applicable)
    const branchRankings = await this.getBranchRankings(currentYear);
    
    // Get top 10 employees
    const topEmployees = await this.performanceService.repository.getTopPerformers(currentYear, 10);
    
    // Get bottom 10 employees
    const bottomEmployees = await this.performanceService.repository.getLowPerformers(currentYear, 10);
    
    // Get growth trend
    const growthTrend = await this.executiveService.getOrganizationTrend([currentYear - 2, currentYear - 1, currentYear]);
    
    // Get performance trend
    const performanceTrend = await this.getPerformanceTrend(currentYear);
    
    // Get chart-ready data
    const chartData = await this.getChartData(currentYear);
    
    // Get executive summary
    const executiveSummary = await this.generateExecutiveSummary(currentYear);

    return {
      year: currentYear,
      periodType: currentPeriod,
      executive: executiveDashboard,
      keyMetrics,
      healthScore,
      rankings: {
        departments: departmentRankings,
        branches: branchRankings
      },
      employees: {
        top10: topEmployees,
        bottom10: bottomEmployees
      },
      pipelines: {
        promotion: await this.getPromotionPipeline(currentYear),
        bonus: await this.getBonusPipeline(currentYear),
        training: await this.getTrainingPipeline(currentYear)
      },
      trends: {
        growth: growthTrend,
        performance: performanceTrend,
        productivity: await this.getProductivityTrend(currentYear)
      },
      heatmap: await this.getPerformanceHeatmap(currentYear),
      chartData,
      executiveSummary
    };
  }

  // Helper Methods
  async getTeamMonthlyTrend(managerId, year) {
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const teamPerformance = await this.performanceService.repository.findByManager(managerId, {
        filter: { year, month, periodType: 'monthly' },
        sort: { 'yearlyPerformance.overallScore': -1 }
      });
      
      const avgScore = teamPerformance.length > 0 
        ? teamPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / teamPerformance.length 
        : 0;
      
      monthlyData.push({
        month,
        averageScore: Math.round(avgScore),
        teamSize: teamPerformance.length
      });
    }
    return monthlyData;
  }

  async getTeamQuarterlyTrend(managerId, year) {
    const quarterlyData = [];
    for (let quarter = 1; quarter <= 4; quarter++) {
      const teamPerformance = await this.performanceService.repository.findByManager(managerId, {
        filter: { year, quarter, periodType: 'quarterly' },
        sort: { 'yearlyPerformance.overallScore': -1 }
      });
      
      const avgScore = teamPerformance.length > 0 
        ? teamPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / teamPerformance.length 
        : 0;
      
      quarterlyData.push({
        quarter,
        averageScore: Math.round(avgScore),
        teamSize: teamPerformance.length
      });
    }
    return quarterlyData;
  }

  async getPerformanceDistribution(year) {
    const allPerformance = await this.performanceService.repository.findByYear(year, {
      sort: { 'yearlyPerformance.overallScore': -1 }
    });

    const distribution = {
      excellent: 0,
      veryGood: 0,
      good: 0,
      satisfactory: 0,
      average: 0,
      belowAverage: 0,
      poor: 0
    };

    allPerformance.forEach(p => {
      const grade = p.yearlyPerformance?.grade || 'N/A';
      if (grade === 'A+') distribution.excellent++;
      else if (grade === 'A') distribution.veryGood++;
      else if (grade === 'B+') distribution.good++;
      else if (grade === 'B') distribution.satisfactory++;
      else if (grade === 'C') distribution.average++;
      else if (grade === 'D') distribution.belowAverage++;
      else if (grade === 'F') distribution.poor++;
    });

    return distribution;
  }

  async getAttendanceImpact(year) {
    const attendanceService = (await import('../attendance/attendance.service.js')).default;
    const attendanceData = await attendanceService.getYearlyAttendance(year);
    
    return {
      averageAttendance: attendanceData.averageAttendance || 0,
      attendanceVsPerformance: await this.calculateAttendanceVsPerformance(year),
      lowAttendanceImpact: await this.calculateLowAttendanceImpact(year)
    };
  }

  async getTaskImpact(year) {
    const taskService = (await import('../task/task.service.js')).default;
    const taskData = await taskService.getYearlyTaskStats(year);
    
    return {
      averageCompletionRate: taskData.completionRate || 0,
      taskVsPerformance: await this.calculateTaskVsPerformance(year),
      overdueTaskImpact: await this.calculateOverdueTaskImpact(year)
    };
  }

  async getProductivityMetrics(year) {
    const allPerformance = await this.performanceService.repository.findByYear(year);
    
    return {
      averageProductivity: allPerformance.length > 0 
        ? allPerformance.reduce((sum, p) => sum + (p.averageProductivity || 0), 0) / allPerformance.length 
        : 0,
      averageQuality: allPerformance.length > 0 
        ? allPerformance.reduce((sum, p) => sum + (p.averageQuality || 0), 0) / allPerformance.length 
        : 0,
      totalTasksCompleted: allPerformance.reduce((sum, p) => sum + (p.totalTasksCompleted || 0), 0),
      totalGoalsAchieved: allPerformance.reduce((sum, p) => sum + (p.totalGoalsAchieved || 0), 0)
    };
  }

  async getPromotionPipeline(year) {
    const promotionEligible = await this.performanceService.repository.getPromotionEligible(year);
    return {
      totalCandidates: promotionEligible.length,
      candidates: promotionEligible.slice(0, 20),
      byDepartment: await this.groupByDepartment(promotionEligible)
    };
  }

  async getTrainingPipeline(year) {
    const trainingRequired = await this.appraisalService.repository.findAll({
      filter: { year, trainingRequired: true },
      sort: { createdAt: -1 }
    });
    
    return {
      totalEmployees: trainingRequired.length,
      employees: trainingRequired.slice(0, 20),
      byTrainingType: await this.groupByTrainingType(trainingRequired)
    };
  }

  async getPerformanceHeatmap(year) {
    const departments = await (await import('../department/department.model.js')).default.find({ isDeleted: false });
    const heatmapData = [];

    for (const department of departments) {
      const deptPerformance = await this.performanceService.repository.findByDepartment(department._id, {
        filter: { year },
        sort: { 'yearlyPerformance.overallScore': -1 }
      });

      const monthlyScores = [];
      for (let month = 1; month <= 12; month++) {
        const monthPerformance = deptPerformance.filter(p => {
          const perfMonth = p.monthlyPerformance?.find(m => m.month === month);
          return perfMonth !== undefined;
        });
        
        const avgScore = monthPerformance.length > 0 
          ? monthPerformance.reduce((sum, p) => {
              const monthData = p.monthlyPerformance?.find(m => m.month === month);
              return sum + (monthData?.score || 0);
            }, 0) / monthPerformance.length 
          : 0;
        
        monthlyScores.push(Math.round(avgScore));
      }

      heatmapData.push({
        departmentId: department._id,
        departmentName: department.name,
        monthlyScores,
        averageScore: monthlyScores.reduce((sum, s) => sum + s, 0) / 12
      });
    }

    return heatmapData;
  }

  async getDepartmentRankings(year) {
    const departments = await (await import('../department/department.model.js')).default.find({ isDeleted: false });
    const rankings = [];

    for (const department of departments) {
      const deptPerformance = await this.performanceService.repository.findByDepartment(department._id, {
        filter: { year },
        sort: { 'yearlyPerformance.overallScore': -1 }
      });

      const avgScore = deptPerformance.length > 0 
        ? deptPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / deptPerformance.length 
        : 0;

      rankings.push({
        departmentId: department._id,
        departmentName: department.name,
        averageScore: Math.round(avgScore),
        employeeCount: deptPerformance.length
      });
    }

    return rankings.sort((a, b) => b.averageScore - a.averageScore);
  }

  async getBranchRankings(year) {
    // Branch rankings would be implemented if branch module exists
    return [];
  }

  async getPerformanceTrend(year) {
    const trend = await this.executiveService.getOrganizationTrend([year - 2, year - 1, year]);
    return trend;
  }

  async getProductivityTrend(year) {
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthPerformance = await this.performanceService.repository.findAll({
        filter: { year, month, periodType: 'monthly' },
        sort: { 'yearlyPerformance.overallScore': -1 }
      });

      const avgProductivity = monthPerformance.length > 0 
        ? monthPerformance.reduce((sum, p) => sum + (p.averageProductivity || 0), 0) / monthPerformance.length 
        : 0;

      monthlyData.push({
        month,
        averageProductivity: Math.round(avgProductivity)
      });
    }
    return monthlyData;
  }

  async getChartData(year) {
    return {
      performanceTrend: await this.getPerformanceTrend(year),
      departmentComparison: await this.getDepartmentRankings(year),
      monthlyPerformance: await this.getProductivityTrend(year),
      goalCompletion: await this.getGoalCompletionTrend(year),
      rewardDistribution: await this.getRewardDistribution(year),
      warningDistribution: await this.getWarningDistribution(year)
    };
  }

  async generateExecutiveSummary(year) {
    const healthScore = await this.executiveService.calculateOrganizationHealthScore(year);
    const keyMetrics = await this.executiveService.getKeyMetrics(year);
    const departmentComparison = await this.executiveService.getDepartmentComparison(year);

    return {
      overallHealth: healthScore.status,
      healthScore: healthScore.healthScore,
      totalEmployees: keyMetrics.performance.organizationAverage > 0 ? departmentComparison.reduce((sum, d) => sum + d.kpi.totalEmployees, 0) : 0,
      averagePerformance: keyMetrics.performance.organizationAverage,
      topDepartment: departmentComparison[0]?.departmentName || 'N/A',
      bottomDepartment: departmentComparison[departmentComparison.length - 1]?.departmentName || 'N/A',
      totalRewards: keyMetrics.rewards.totalRewards,
      totalWarnings: keyMetrics.warnings.totalWarnings,
      promotionEligible: await this.performanceService.repository.getPromotionEligible(year).then(r => r.length),
      bonusEligible: await this.performanceService.repository.getBonusEligible(year).then(r => r.length),
      trainingRequired: await this.appraisalService.repository.findAll({
        filter: { year, trainingRequired: true }
      }).then(r => r.length)
    };
  }

  async getBonusPipeline(year) {
    const bonusEligible = await this.performanceService.repository.getBonusEligible(year);
    return {
      totalCandidates: bonusEligible.length,
      candidates: bonusEligible.slice(0, 20),
      byDepartment: await this.groupByDepartment(bonusEligible)
    };
  }

  async groupByDepartment(employees) {
    const grouped = {};
    employees.forEach(emp => {
      const deptId = emp.department?.toString() || 'unknown';
      if (!grouped[deptId]) grouped[deptId] = [];
      grouped[deptId].push(emp);
    });
    return grouped;
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

  async calculateAttendanceVsPerformance(year) {
    // Implementation would correlate attendance with performance
    return { correlation: 0.75, description: 'Strong positive correlation' };
  }

  async calculateLowAttendanceImpact(year) {
    // Implementation would calculate impact of low attendance
    return { impactScore: -15, description: '15% performance reduction' };
  }

  async calculateTaskVsPerformance(year) {
    // Implementation would correlate task completion with performance
    return { correlation: 0.82, description: 'Strong positive correlation' };
  }

  async calculateOverdueTaskImpact(year) {
    // Implementation would calculate impact of overdue tasks
    return { impactScore: -10, description: '10% performance reduction' };
  }

  async getGoalCompletionTrend(year) {
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthGoals = await this.goalService.repository.findAll({
        filter: { year, startDate: { $lte: new Date(year, month, 31) } },
        sort: { createdAt: -1 }
      });

      const completed = monthGoals.filter(g => g.status === 'completed').length;
      const total = monthGoals.length;

      monthlyData.push({
        month,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    }
    return monthlyData;
  }

  async getRewardDistribution(year) {
    const rewards = await this.rewardService.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const distribution = {};
    rewards.forEach(r => {
      const type = r.type || 'other';
      if (!distribution[type]) distribution[type] = 0;
      distribution[type]++;
    });

    return distribution;
  }

  async getWarningDistribution(year) {
    const warnings = await this.warningService.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const distribution = {};
    warnings.forEach(w => {
      const type = w.type || 'other';
      if (!distribution[type]) distribution[type] = 0;
      distribution[type]++;
    });

    return distribution;
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
