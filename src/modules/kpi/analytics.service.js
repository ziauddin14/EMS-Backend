import kpiService from './kpi.service.js';
import goalService from './goal.service.js';
import performanceService from './performance.service.js';
import appraisalService from './appraisal.service.js';
import rewardService from './reward.service.js';
import warningService from './warning.service.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';

class AnalyticsService {
  constructor() {
    this.kpiService = kpiService;
    this.goalService = goalService;
    this.performanceService = performanceService;
    this.appraisalService = appraisalService;
    this.rewardService = rewardService;
    this.warningService = warningService;
    this.logger = Logger;
  }

  // Overview Analytics
  async getOverviewAnalytics(year, options = {}) {
    this.logger.info(`Getting overview analytics for ${year}`);
    
    const currentYear = year || new Date().getFullYear();

    const kpiAnalytics = await this.getKPIAnalytics(currentYear);
    const performanceAnalytics = await this.getPerformanceAnalytics(currentYear);
    const goalAnalytics = await this.getGoalAnalytics(currentYear);
    const rewardAnalytics = await this.getRewardAnalytics(currentYear);
    const warningAnalytics = await this.getWarningAnalytics(currentYear);

    return {
      year: currentYear,
      kpi: kpiAnalytics,
      performance: performanceAnalytics,
      goals: goalAnalytics,
      rewards: rewardAnalytics,
      warnings: warningAnalytics,
      generatedAt: new Date()
    };
  }

  // KPI Analytics
  async getKPIAnalytics(year, options = {}) {
    const kpis = await this.kpiService.repository.findAll({
      filter: { year },
      sort: { overallScore: -1 }
    });

    const analytics = {
      totalRecords: kpis.length,
      averageScore: kpis.length > 0 ? kpis.reduce((sum, k) => sum + k.overallScore, 0) / kpis.length : 0,
      gradeDistribution: await this.groupByGrade(kpis),
      statusDistribution: await this.groupByStatus(kpis),
      componentAnalysis: await this.getComponentAnalysis(kpis),
      departmentAnalysis: await this.getDepartmentKPIAnalytics(year),
      monthlyTrend: await this.getMonthlyKPITrend(year),
      quarterlyTrend: await this.getQuarterlyKPITrend(year)
    };

    return analytics;
  }

  // Performance Analytics
  async getPerformanceAnalytics(year, options = {}) {
    const performances = await this.performanceService.repository.findByYear(year);

    const analytics = {
      totalRecords: performances.length,
      averageScore: performances.length > 0 
        ? performances.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / performances.length 
        : 0,
      gradeDistribution: await this.groupPerformanceByGrade(performances),
      trendDistribution: await this.groupByTrend(performances),
      eligibilityAnalysis: await this.getEligibilityAnalysis(performances),
      departmentAnalysis: await this.getDepartmentPerformanceAnalytics(year),
      designationAnalysis: await this.getDesignationPerformanceAnalytics(year),
      monthlyTrend: await this.getMonthlyPerformanceTrend(year),
      quarterlyTrend: await this.getQuarterlyPerformanceTrend(year)
    };

    return analytics;
  }

  // Goal Analytics
  async getGoalAnalytics(year, options = {}) {
    const goals = await this.goalService.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const analytics = {
      totalRecords: goals.length,
      statusDistribution: await this.groupGoalsByStatus(goals),
      typeDistribution: await this.groupGoalsByType(goals),
      priorityDistribution: await this.groupGoalsByPriority(goals),
      completionRate: goals.length > 0 ? (goals.filter(g => g.status === 'completed').length / goals.length) * 100 : 0,
      departmentAnalysis: await this.getDepartmentGoalAnalytics(year),
      monthlyTrend: await this.getMonthlyGoalTrend(year),
      overdueAnalysis: await this.getOverdueGoalAnalytics(year)
    };

    return analytics;
  }

  // Department Analytics
  async getDepartmentAnalytics(year, options = {}) {
    const departments = await (await import('../department/department.model.js')).default.find({ isDeleted: false });
    const analytics = [];

    for (const department of departments) {
      const deptKPIs = await this.kpiService.repository.findByDepartment(department._id, {
        filter: { year },
        sort: { overallScore: -1 }
      });

      const deptPerformance = await this.performanceService.repository.findByDepartment(department._id, {
        filter: { year },
        sort: { 'yearlyPerformance.overallScore': -1 }
      });

      const deptGoals = await this.goalService.repository.findByDepartment(department._id, {
        filter: { year },
        sort: { createdAt: -1 }
      });

      analytics.push({
        departmentId: department._id,
        departmentName: department.name,
        kpi: {
          averageScore: deptKPIs.length > 0 ? deptKPIs.reduce((sum, k) => sum + k.overallScore, 0) / deptKPIs.length : 0,
          employeeCount: deptKPIs.length
        },
        performance: {
          averageScore: deptPerformance.length > 0 
            ? deptPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / deptPerformance.length 
            : 0,
          employeeCount: deptPerformance.length
        },
        goals: {
          total: deptGoals.length,
          completed: deptGoals.filter(g => g.status === 'completed').length,
          completionRate: deptGoals.length > 0 ? (deptGoals.filter(g => g.status === 'completed').length / deptGoals.length) * 100 : 0
        }
      });
    }

    return analytics.sort((a, b) => b.performance.averageScore - a.performance.averageScore);
  }

  // Employee Analytics
  async getEmployeeAnalytics(employeeId, year, options = {}) {
    const currentYear = year || new Date().getFullYear();

    const employeeKPIs = await this.kpiService.repository.findByEmployee(employeeId, {
      filter: { year: currentYear },
      sort: { createdAt: -1 }
    });

    const employeePerformance = await this.performanceService.repository.findByEmployee(employeeId, {
      filter: { year: currentYear },
      sort: { createdAt: -1 }
    });

    const employeeGoals = await this.goalService.repository.findByOwner(employeeId, {
      filter: { year: currentYear },
      sort: { createdAt: -1 }
    });

    const employeeRewards = await this.rewardService.repository.findByRecipient(employeeId, {
      filter: { year: currentYear },
      sort: { createdAt: -1 }
    });

    const employeeWarnings = await this.warningService.repository.findByEmployee(employeeId, {
      filter: { year: currentYear },
      sort: { createdAt: -1 }
    });

    return {
      employeeId,
      year: currentYear,
      kpi: {
        records: employeeKPIs,
        averageScore: employeeKPIs.length > 0 ? employeeKPIs.reduce((sum, k) => sum + k.overallScore, 0) / employeeKPIs.length : 0
      },
      performance: employeePerformance[0] || null,
      goals: {
        total: employeeGoals.length,
        completed: employeeGoals.filter(g => g.status === 'completed').length,
        completionRate: employeeGoals.length > 0 ? (employeeGoals.filter(g => g.status === 'completed').length / employeeGoals.length) * 100 : 0
      },
      rewards: {
        total: employeeRewards.length,
        totalPoints: employeeRewards.reduce((sum, r) => sum + r.points, 0),
        totalValue: employeeRewards.reduce((sum, r) => sum + r.monetaryValue, 0)
      },
      warnings: {
        total: employeeWarnings.length,
        active: employeeWarnings.filter(w => !w.resolved).length
      },
      generatedAt: new Date()
    };
  }

  // Designation Analytics
  async getDesignationAnalytics(year, options = {}) {
    const designations = await (await import('../designation/designation.model.js')).default.find({ isDeleted: false });
    const analytics = [];

    for (const designation of designations) {
      const desigPerformance = await this.performanceService.repository.findByDesignation(designation._id, {
        filter: { year },
        sort: { 'yearlyPerformance.overallScore': -1 }
      });

      analytics.push({
        designationId: designation._id,
        designationTitle: designation.title,
        employeeCount: desigPerformance.length,
        averageScore: desigPerformance.length > 0 
          ? desigPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / desigPerformance.length 
          : 0,
        gradeDistribution: await this.groupPerformanceByGrade(desigPerformance)
      });
    }

    return analytics.sort((a, b) => b.averageScore - a.averageScore);
  }

  // Attendance Impact Analytics
  async getAttendanceImpactAnalytics(year, options = {}) {
    const attendanceService = (await import('../attendance/attendance.service.js')).default;
    const attendanceData = await attendanceService.getYearlyAttendance(year);
    
    const performances = await this.performanceService.repository.findByYear(year);
    
    const impactAnalysis = {
      averageAttendance: attendanceData.averageAttendance || 0,
      attendanceVsPerformance: await this.calculateAttendanceVsPerformance(year),
      lowAttendanceImpact: await this.calculateLowAttendanceImpact(year),
      departmentImpact: await this.getDepartmentAttendanceImpact(year)
    };

    return impactAnalysis;
  }

  // Task Impact Analytics
  async getTaskImpactAnalytics(year, options = {}) {
    const taskService = (await import('../task/task.service.js')).default;
    const taskData = await taskService.getYearlyTaskStats(year);
    
    const impactAnalysis = {
      averageCompletionRate: taskData.completionRate || 0,
      taskVsPerformance: await this.calculateTaskVsPerformance(year),
      overdueTaskImpact: await this.calculateOverdueTaskImpact(year),
      departmentImpact: await this.getDepartmentTaskImpact(year)
    };

    return impactAnalysis;
  }

  // Productivity Analytics
  async getProductivityAnalytics(year, options = {}) {
    const performances = await this.performanceService.repository.findByYear(year);

    const analytics = {
      averageProductivity: performances.length > 0 
        ? performances.reduce((sum, p) => sum + (p.averageProductivity || 0), 0) / performances.length 
        : 0,
      averageQuality: performances.length > 0 
        ? performances.reduce((sum, p) => sum + (p.averageQuality || 0), 0) / performances.length 
        : 0,
      productivityTrend: await this.getProductivityTrend(year),
      qualityTrend: await this.getQualityTrend(year),
      departmentProductivity: await this.getDepartmentProductivityAnalytics(year)
    };

    return analytics;
  }

  // Reward Analytics
  async getRewardAnalytics(year, options = {}) {
    const rewards = await this.rewardService.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const analytics = {
      totalRewards: rewards.length,
      totalPoints: rewards.reduce((sum, r) => sum + r.points, 0),
      totalValue: rewards.reduce((sum, r) => sum + r.monetaryValue, 0),
      typeDistribution: await this.groupRewardsByType(rewards),
      departmentDistribution: await this.groupRewardsByDepartment(rewards),
      monthlyTrend: await this.getMonthlyRewardTrend(year),
      topRewarded: await this.rewardService.repository.getTopRewarded(year, 20)
    };

    return analytics;
  }

  // Warning Analytics
  async getWarningAnalytics(year, options = {}) {
    const warnings = await this.warningService.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const analytics = {
      totalWarnings: warnings.length,
      active: warnings.filter(w => !w.resolved).length,
      resolved: warnings.filter(w => w.resolved).length,
      typeDistribution: await this.groupWarningsByType(warnings),
      severityDistribution: await this.groupWarningsBySeverity(warnings),
      departmentDistribution: await this.groupWarningsByDepartment(warnings),
      monthlyTrend: await this.getMonthlyWarningTrend(year)
    };

    return analytics;
  }

  // Promotion Analytics
  async getPromotionAnalytics(year, options = {}) {
    const promotionEligible = await this.performanceService.repository.getPromotionEligible(year);
    const appraisals = await this.appraisalService.repository.findAll({
      filter: { year, 'promotion.eligible': true },
      sort: { finalRating: -1 }
    });

    const analytics = {
      totalCandidates: promotionEligible.length,
      byDepartment: await this.groupByDepartment(promotionEligible),
      byDesignation: await this.groupByDesignation(promotionEligible),
      averageRating: appraisals.length > 0 
        ? appraisals.reduce((sum, a) => sum + a.finalRating, 0) / appraisals.length 
        : 0,
      recommendations: appraisals.map(a => ({
        employee: a.employee,
        currentDesignation: a.designation,
        recommendedLevel: a.promotion.recommendedLevel
      }))
    };

    return analytics;
  }

  // Training Analytics
  async getTrainingAnalytics(year, options = {}) {
    const trainingRequired = await this.appraisalService.repository.findAll({
      filter: { year, trainingRequired: true },
      sort: { createdAt: -1 }
    });

    const analytics = {
      totalEmployees: trainingRequired.length,
      byDepartment: await this.groupByDepartment(trainingRequired),
      byTrainingType: await this.groupByTrainingType(trainingRequired),
      byPriority: await this.groupTrainingByPriority(trainingRequired),
      completionRate: await this.getTrainingCompletionRate(year)
    };

    return analytics;
  }

  // Growth Analytics
  async getGrowthAnalytics(year, options = {}) {
    const years = [year - 2, year - 1, year];
    const growthData = [];

    for (const yr of years) {
      const performances = await this.performanceService.repository.findByYear(yr);
      const avgScore = performances.length > 0 
        ? performances.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / performances.length 
        : 0;

      growthData.push({
        year: yr,
        averageScore: avgScore,
        employeeCount: performances.length
      });
    }

    const growthRate = growthData.length > 1 
      ? ((growthData[2].averageScore - growthData[1].averageScore) / growthData[1].averageScore) * 100 
      : 0;

    return {
      yearlyData: growthData,
      growthRate,
      trend: growthRate > 0 ? 'positive' : growthRate < 0 ? 'negative' : 'stable'
    };
  }

  // Heatmap Dataset
  async getHeatmapDataset(year, options = {}) {
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

  // Leaderboard Dataset
  async getLeaderboardDataset(year, options = {}) {
    const limit = options.limit || 50;
    const topPerformers = await this.performanceService.repository.getTopPerformers(year, limit);
    const lowPerformers = await this.performanceService.repository.getLowPerformers(year, limit);

    return {
      topPerformers: topPerformers.map((p, index) => ({
        rank: index + 1,
        employee: p.employee,
        department: p.department,
        score: p.yearlyPerformance.overallScore,
        grade: p.yearlyPerformance.grade
      })),
      lowPerformers: lowPerformers.map((p, index) => ({
        rank: index + 1,
        employee: p.employee,
        department: p.department,
        score: p.yearlyPerformance.overallScore,
        grade: p.yearlyPerformance.grade
      }))
    };
  }

  // Chart Ready Data
  async getChartData(year, options = {}) {
    return {
      performanceTrend: await this.getMonthlyPerformanceTrend(year),
      departmentComparison: await this.getDepartmentAnalytics(year),
      goalCompletion: await this.getMonthlyGoalTrend(year),
      rewardDistribution: await this.getMonthlyRewardTrend(year),
      warningDistribution: await this.getMonthlyWarningTrend(year),
      productivityTrend: await this.getProductivityTrend(year),
      qualityTrend: await this.getQualityTrend(year)
    };
  }

  // Helper Methods
  async groupByGrade(kpis) {
    const grouped = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0, 'N/A': 0 };
    kpis.forEach(kpi => {
      const grade = kpi.performanceGrade || 'N/A';
      if (grouped[grade] !== undefined) grouped[grade]++;
    });
    return grouped;
  }

  async groupByStatus(kpis) {
    const grouped = { draft: 0, under_review: 0, approved: 0, rejected: 0, archived: 0 };
    kpis.forEach(kpi => {
      const status = kpi.status || 'draft';
      if (grouped[status] !== undefined) grouped[status]++;
    });
    return grouped;
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

  async groupPerformanceByGrade(performances) {
    const grouped = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0, 'N/A': 0 };
    performances.forEach(p => {
      const grade = p.yearlyPerformance?.grade || 'N/A';
      if (grouped[grade] !== undefined) grouped[grade]++;
    });
    return grouped;
  }

  async groupByTrend(performances) {
    const grouped = { improving: 0, declining: 0, stable: 0 };
    performances.forEach(p => {
      const trend = p.yearlyPerformance?.trend || 'stable';
      if (grouped[trend] !== undefined) grouped[trend]++;
    });
    return grouped;
  }

  async getEligibilityAnalysis(performances) {
    return {
      promotionEligible: performances.filter(p => p.promotionEligible).length,
      bonusEligible: performances.filter(p => p.bonusEligible).length,
      appraisalEligible: performances.filter(p => p.appraisalEligible).length
    };
  }

  async groupGoalsByStatus(goals) {
    const grouped = { not_started: 0, in_progress: 0, completed: 0, cancelled: 0, overdue: 0 };
    goals.forEach(goal => {
      const status = goal.status || 'not_started';
      if (grouped[status] !== undefined) grouped[status]++;
    });
    return grouped;
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
      if (!grouped[deptId]) grouped[deptId] = 0;
      grouped[deptId]++;
    });
    return grouped;
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
      if (!grouped[deptId]) grouped[deptId] = 0;
      grouped[deptId]++;
    });
    return grouped;
  }

  async groupByDepartment(data) {
    const grouped = {};
    data.forEach(item => {
      const deptId = item.department?.toString() || 'unknown';
      if (!grouped[deptId]) grouped[deptId] = [];
      grouped[deptId].push(item);
    });
    
    const result = {};
    for (const [deptId, items] of Object.entries(grouped)) {
      result[deptId] = { count: items.length };
    }
    return result;
  }

  async groupByDesignation(data) {
    const grouped = {};
    data.forEach(item => {
      const desigId = item.designation?.toString() || 'unknown';
      if (!grouped[desigId]) grouped[desigId] = [];
      grouped[desigId].push(item);
    });
    
    const result = {};
    for (const [desigId, items] of Object.entries(grouped)) {
      result[desigId] = { count: items.length };
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

  async groupTrainingByPriority(appraisals) {
    const grouped = { high: 0, medium: 0, low: 0 };
    appraisals.forEach(appraisal => {
      appraisal.trainingRecommendations?.forEach(training => {
        const priority = training.priority || 'medium';
        if (grouped[priority] !== undefined) grouped[priority]++;
      });
    });
    return grouped;
  }

  async getDepartmentKPIAnalytics(year) {
    const departments = await (await import('../department/department.model.js')).default.find({ isDeleted: false });
    const analytics = {};

    for (const department of departments) {
      const deptKPIs = await this.kpiService.repository.findByDepartment(department._id, {
        filter: { year }
      });
      analytics[department._id] = {
        departmentName: department.name,
        averageScore: deptKPIs.length > 0 ? deptKPIs.reduce((sum, k) => sum + k.overallScore, 0) / deptKPIs.length : 0,
        employeeCount: deptKPIs.length
      };
    }

    return analytics;
  }

  async getDepartmentPerformanceAnalytics(year) {
    const departments = await (await import('../department/department.model.js')).default.find({ isDeleted: false });
    const analytics = {};

    for (const department of departments) {
      const deptPerformance = await this.performanceService.repository.findByDepartment(department._id, {
        filter: { year }
      });
      analytics[department._id] = {
        departmentName: department.name,
        averageScore: deptPerformance.length > 0 
          ? deptPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / deptPerformance.length 
          : 0,
        employeeCount: deptPerformance.length
      };
    }

    return analytics;
  }

  async getDepartmentGoalAnalytics(year) {
    const departments = await (await import('../department/department.model.js')).default.find({ isDeleted: false });
    const analytics = {};

    for (const department of departments) {
      const deptGoals = await this.goalService.repository.findByDepartment(department._id, {
        filter: { year }
      });
      analytics[department._id] = {
        departmentName: department.name,
        total: deptGoals.length,
        completed: deptGoals.filter(g => g.status === 'completed').length,
        completionRate: deptGoals.length > 0 ? (deptGoals.filter(g => g.status === 'completed').length / deptGoals.length) * 100 : 0
      };
    }

    return analytics;
  }

  async getDesignationPerformanceAnalytics(year) {
    const designations = await (await import('../designation/designation.model.js')).default.find({ isDeleted: false });
    const analytics = {};

    for (const designation of designations) {
      const desigPerformance = await this.performanceService.repository.findByDesignation(designation._id, {
        filter: { year }
      });
      analytics[designation._id] = {
        designationTitle: designation.title,
        averageScore: desigPerformance.length > 0 
          ? desigPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / desigPerformance.length 
          : 0,
        employeeCount: desigPerformance.length
      };
    }

    return analytics;
  }

  async getMonthlyKPITrend(year) {
    const trend = [];
    for (let month = 1; month <= 12; month++) {
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

  async getQuarterlyKPITrend(year) {
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

  async getMonthlyPerformanceTrend(year) {
    const trend = [];
    for (let month = 1; month <= 12; month++) {
      const monthPerformance = await this.performanceService.repository.findAll({
        filter: { year, month, periodType: 'monthly' }
      });
      trend.push({
        month,
        averageScore: monthPerformance.length > 0 
          ? monthPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / monthPerformance.length 
          : 0
      });
    }
    return trend;
  }

  async getQuarterlyPerformanceTrend(year) {
    const trend = [];
    for (let quarter = 1; quarter <= 4; quarter++) {
      const quarterPerformance = await this.performanceService.repository.findAll({
        filter: { year, quarter, periodType: 'quarterly' }
      });
      trend.push({
        quarter,
        averageScore: quarterPerformance.length > 0 
          ? quarterPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / quarterPerformance.length 
          : 0
      });
    }
    return trend;
  }

  async getMonthlyGoalTrend(year) {
    const trend = [];
    for (let month = 1; month <= 12; month++) {
      const monthGoals = await this.goalService.repository.findAll({
        filter: { year, startDate: { $lte: new Date(year, month, 31) } }
      });
      trend.push({
        month,
        completionRate: monthGoals.length > 0 
          ? (monthGoals.filter(g => g.status === 'completed').length / monthGoals.length) * 100 
          : 0
      });
    }
    return trend;
  }

  async getOverdueGoalAnalytics(year) {
    const overdueGoals = await this.goalService.repository.findOverdue();
    return {
      total: overdueGoals.length,
      byDepartment: await this.groupGoalsByDepartment(overdueGoals),
      byPriority: await this.groupGoalsByPriority(overdueGoals)
    };
  }

  async calculateAttendanceVsPerformance(year) {
    const performances = await this.performanceService.repository.findByYear(year);
    const attendanceService = (await import('../attendance/attendance.service.js')).default;
    
    let correlation = 0;
    let count = 0;
    
    for (const perf of performances) {
      const attendance = await attendanceService.getEmployeeAttendance(perf.employee, year);
      if (attendance.averageAttendance > 0 && perf.yearlyPerformance?.overallScore > 0) {
        correlation += (attendance.averageAttendance / 100) * (perf.yearlyPerformance.overallScore / 100);
        count++;
      }
    }
    
    return count > 0 ? correlation / count : 0;
  }

  async calculateLowAttendanceImpact(year) {
    const performances = await this.performanceService.repository.findByYear(year);
    const attendanceService = (await import('../attendance/attendance.service.js')).default;
    
    let lowAttendanceCount = 0;
    let lowAttendanceAvgScore = 0;
    
    for (const perf of performances) {
      const attendance = await attendanceService.getEmployeeAttendance(perf.employee, year);
      if (attendance.averageAttendance < 80) {
        lowAttendanceCount++;
        lowAttendanceAvgScore += perf.yearlyPerformance?.overallScore || 0;
      }
    }
    
    const normalAttendanceAvg = performances.length > 0 
      ? performances.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / performances.length 
      : 0;
    
    const lowAttendanceAvg = lowAttendanceCount > 0 ? lowAttendanceAvgScore / lowAttendanceCount : 0;
    
    return {
      lowAttendanceCount,
      lowAttendanceAverageScore: lowAttendanceAvg,
      normalAttendanceAverageScore: normalAttendanceAvg,
      impactPercentage: normalAttendanceAvg > 0 ? ((lowAttendanceAvg - normalAttendanceAvg) / normalAttendanceAvg) * 100 : 0
    };
  }

  async getDepartmentAttendanceImpact(year) {
    const departments = await (await import('../department/department.model.js')).default.find({ isDeleted: false });
    const impact = {};

    for (const department of departments) {
      const deptPerformance = await this.performanceService.repository.findByDepartment(department._id, {
        filter: { year }
      });
      
      const attendanceService = (await import('../attendance/attendance.service.js')).default;
      const deptAttendance = await attendanceService.getDepartmentAttendance(department._id, year);
      
      impact[department._id] = {
        departmentName: department.name,
        averageAttendance: deptAttendance.averageAttendance || 0,
        averagePerformance: deptPerformance.length > 0 
          ? deptPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / deptPerformance.length 
          : 0
      };
    }

    return impact;
  }

  async calculateTaskVsPerformance(year) {
    const performances = await this.performanceService.repository.findByYear(year);
    const taskService = (await import('../task/task.service.js')).default;
    
    let correlation = 0;
    let count = 0;
    
    for (const perf of performances) {
      const tasks = await taskService.getEmployeeTasks(perf.employee, year);
      const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0;
      
      if (completionRate > 0 && perf.yearlyPerformance?.overallScore > 0) {
        correlation += (completionRate / 100) * (perf.yearlyPerformance.overallScore / 100);
        count++;
      }
    }
    
    return count > 0 ? correlation / count : 0;
  }

  async calculateOverdueTaskImpact(year) {
    const performances = await this.performanceService.repository.findByYear(year);
    const taskService = (await import('../task/task.service.js')).default;
    
    let overdueCount = 0;
    let overdueAvgScore = 0;
    
    for (const perf of performances) {
      const tasks = await taskService.getEmployeeTasks(perf.employee, year);
      const overdueTasks = tasks.filter(t => t.status === 'overdue');
      
      if (overdueTasks.length > 0) {
        overdueCount++;
        overdueAvgScore += perf.yearlyPerformance?.overallScore || 0;
      }
    }
    
    const normalAvgScore = performances.length > 0 
      ? performances.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / performances.length 
      : 0;
    
    const overdueAvg = overdueCount > 0 ? overdueAvgScore / overdueCount : 0;
    
    return {
      employeesWithOverdueTasks: overdueCount,
      overdueAverageScore: overdueAvg,
      normalAverageScore: normalAvgScore,
      impactPercentage: normalAvgScore > 0 ? ((overdueAvg - normalAvgScore) / normalAvgScore) * 100 : 0
    };
  }

  async getDepartmentTaskImpact(year) {
    const departments = await (await import('../department/department.model.js')).default.find({ isDeleted: false });
    const impact = {};

    for (const department of departments) {
      const deptPerformance = await this.performanceService.repository.findByDepartment(department._id, {
        filter: { year }
      });
      
      const taskService = (await import('../task/task.service.js')).default;
      const deptTasks = await taskService.getDepartmentTasks(department._id, year);
      
      impact[department._id] = {
        departmentName: department.name,
        taskCompletionRate: deptTasks.length > 0 
          ? (deptTasks.filter(t => t.status === 'completed').length / deptTasks.length) * 100 
          : 0,
        averagePerformance: deptPerformance.length > 0 
          ? deptPerformance.reduce((sum, p) => sum + (p.yearlyPerformance?.overallScore || 0), 0) / deptPerformance.length 
          : 0
      };
    }

    return impact;
  }

  async getProductivityTrend(year) {
    const trend = [];
    for (let month = 1; month <= 12; month++) {
      const monthPerformance = await this.performanceService.repository.findAll({
        filter: { year, month, periodType: 'monthly' }
      });
      trend.push({
        month,
        averageProductivity: monthPerformance.length > 0 
          ? monthPerformance.reduce((sum, p) => sum + (p.averageProductivity || 0), 0) / monthPerformance.length 
          : 0
      });
    }
    return trend;
  }

  async getQualityTrend(year) {
    const trend = [];
    for (let month = 1; month <= 12; month++) {
      const monthPerformance = await this.performanceService.repository.findAll({
        filter: { year, month, periodType: 'monthly' }
      });
      trend.push({
        month,
        averageQuality: monthPerformance.length > 0 
          ? monthPerformance.reduce((sum, p) => sum + (p.averageQuality || 0), 0) / monthPerformance.length 
          : 0
      });
    }
    return trend;
  }

  async getDepartmentProductivityAnalytics(year) {
    const departments = await (await import('../department/department.model.js')).default.find({ isDeleted: false });
    const analytics = {};

    for (const department of departments) {
      const deptPerformance = await this.performanceService.repository.findByDepartment(department._id, {
        filter: { year }
      });
      analytics[department._id] = {
        departmentName: department.name,
        averageProductivity: deptPerformance.length > 0 
          ? deptPerformance.reduce((sum, p) => sum + (p.averageProductivity || 0), 0) / deptPerformance.length 
          : 0,
        averageQuality: deptPerformance.length > 0 
          ? deptPerformance.reduce((sum, p) => sum + (p.averageQuality || 0), 0) / deptPerformance.length 
          : 0
      };
    }

    return analytics;
  }

  async getMonthlyRewardTrend(year) {
    const trend = [];
    for (let month = 1; month <= 12; month++) {
      const monthRewards = await this.rewardService.repository.findAll({
        filter: { year, issuedDate: { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0) } }
      });
      trend.push({
        month,
        totalRewards: monthRewards.length,
        totalPoints: monthRewards.reduce((sum, r) => sum + r.points, 0)
      });
    }
    return trend;
  }

  async getMonthlyWarningTrend(year) {
    const trend = [];
    for (let month = 1; month <= 12; month++) {
      const monthWarnings = await this.warningService.repository.findAll({
        filter: { year, issuedDate: { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0) } }
      });
      trend.push({
        month,
        totalWarnings: monthWarnings.length,
        activeWarnings: monthWarnings.filter(w => !w.resolved).length
      });
    }
    return trend;
  }

  async getTrainingCompletionRate(year) {
    const trainingRequired = await this.appraisalService.repository.findAll({
      filter: { year, trainingRequired: true }
    });
    
    let completedTrainings = 0;
    let totalTrainings = 0;
    
    trainingRequired.forEach(appraisal => {
      appraisal.trainingRecommendations?.forEach(training => {
        totalTrainings++;
        if (training.completed) completedTrainings++;
      });
    });
    
    return totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
