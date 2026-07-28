import { KPI_GRADE, KPI_STATUS, GOAL_STATUS, APPRAISAL_STATUS, REWARD_STATUS, WARNING_STATUS } from './kpi.constants.js';

// KPI Helper Functions
export const calculateOverallScore = (kpiData) => {
  if (!kpiData || !kpiData.kpiData || kpiData.kpiData.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let totalWeightage = 0;

  kpiData.kpiData.forEach((item) => {
    const score = item.score || 0;
    const weightage = item.weightage || 0;
    totalScore += (score * weightage) / 100;
    totalWeightage += weightage;
  });

  return totalWeightage > 0 ? (totalScore / totalWeightage) * 100 : 0;
};

export const determinePerformanceGrade = (score) => {
  if (score >= 90) return KPI_GRADE.EXCELLENT;
  if (score >= 80) return KPI_GRADE.VERY_GOOD;
  if (score >= 70) return KPI_GRADE.GOOD;
  if (score >= 60) return KPI_GRADE.SATISFACTORY;
  if (score >= 50) return KPI_GRADE.AVERAGE;
  if (score >= 40) return KPI_GRADE.BELOW_AVERAGE;
  return KPI_GRADE.POOR;
};

export const calculateGoalCompletion = (goal) => {
  if (!goal || !goal.targetValue || goal.targetValue === 0) {
    return 0;
  }

  const currentValue = goal.currentValue || 0;
  const targetValue = goal.targetValue;
  const completionPercentage = (currentValue / targetValue) * 100;

  return Math.min(Math.max(completionPercentage, 0), 100);
};

export const isGoalOverdue = (goal) => {
  if (!goal || !goal.dueDate) {
    return false;
  }

  const dueDate = new Date(goal.dueDate);
  const now = new Date();
  const isCompleted = goal.status === GOAL_STATUS.COMPLETED;
  
  return !isCompleted && dueDate < now;
};

export const isGoalDueSoon = (goal, days = 7) => {
  if (!goal || !goal.dueDate) {
    return false;
  }

  const dueDate = new Date(goal.dueDate);
  const now = new Date();
  const isCompleted = goal.status === GOAL_STATUS.COMPLETED;
  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  
  return !isCompleted && daysUntilDue > 0 && daysUntilDue <= days;
};

// Appraisal Helper Functions
export const calculateFinalRating = (appraisal) => {
  if (!appraisal) {
    return 0;
  }

  const ratings = [];
  
  if (appraisal.selfAppraisal && appraisal.selfAppraisal.rating !== undefined) {
    ratings.push(appraisal.selfAppraisal.rating * 0.2); // 20% weight
  }
  
  if (appraisal.managerAppraisal && appraisal.managerAppraisal.rating !== undefined) {
    ratings.push(appraisal.managerAppraisal.rating * 0.4); // 40% weight
  }
  
  if (appraisal.hrAppraisal && appraisal.hrAppraisal.rating !== undefined) {
    ratings.push(appraisal.hrAppraisal.rating * 0.3); // 30% weight
  }
  
  if (appraisal.ceoAppraisal && appraisal.ceoAppraisal.rating !== undefined) {
    ratings.push(appraisal.ceoAppraisal.rating * 0.1); // 10% weight
  }

  if (ratings.length === 0) {
    return 0;
  }

  return ratings.reduce((sum, rating) => sum + rating, 0);
};

export const isAppraisalEligible = (appraisal) => {
  if (!appraisal) {
    return false;
  }

  const hasSelfAppraisal = appraisal.selfAppraisal && appraisal.selfAppraisal.rating !== undefined;
  const hasManagerAppraisal = appraisal.managerAppraisal && appraisal.managerAppraisal.rating !== undefined;
  const hasHRAppraisal = appraisal.hrAppraisal && appraisal.hrAppraisal.rating !== undefined;

  return hasSelfAppraisal && hasManagerAppraisal && hasHRAppraisal;
};

// Performance Helper Functions
export const calculateImprovementPercentage = (currentScore, previousScore) => {
  if (previousScore === 0) {
    return 0;
  }

  return ((currentScore - previousScore) / previousScore) * 100;
};

export const determinePerformanceTrend = (performances) => {
  if (!performances || performances.length < 2) {
    return 'stable';
  }

  const recent = performances.slice(-3);
  let increasing = 0;
  let decreasing = 0;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i].overallScore > recent[i - 1].overallScore) {
      increasing++;
    } else if (recent[i].overallScore < recent[i - 1].overallScore) {
      decreasing++;
    }
  }

  if (increasing > decreasing) return 'improving';
  if (decreasing > increasing) return 'declining';
  return 'stable';
};

export const calculatePercentile = (score, allScores) => {
  if (!allScores || allScores.length === 0) {
    return 0;
  }

  const sortedScores = allScores.sort((a, b) => a - b);
  const index = sortedScores.indexOf(score);
  
  if (index === -1) {
    return 0;
  }

  return ((index + 1) / sortedScores.length) * 100;
};

// Reward Helper Functions
export const calculateTotalPoints = (rewards) => {
  if (!rewards || rewards.length === 0) {
    return 0;
  }

  return rewards.reduce((total, reward) => total + (reward.points || 0), 0);
};

export const calculateTotalMonetaryValue = (rewards) => {
  if (!rewards || rewards.length === 0) {
    return 0;
  }

  return rewards.reduce((total, reward) => total + (reward.monetaryValue || 0), 0);
};

export const getRewardStatistics = (rewards, year) => {
  if (!rewards || rewards.length === 0) {
    return {
      total: 0,
      issued: 0,
      pending: 0,
      totalPoints: 0,
      totalValue: 0
    };
  }

  const yearRewards = rewards.filter(r => {
    const rewardYear = new Date(r.issuedDate).getFullYear();
    return rewardYear === year;
  });

  return {
    total: yearRewards.length,
    issued: yearRewards.filter(r => r.status === REWARD_STATUS.ISSUED).length,
    pending: yearRewards.filter(r => r.status === REWARD_STATUS.PENDING).length,
    totalPoints: calculateTotalPoints(yearRewards),
    totalValue: calculateTotalMonetaryValue(yearRewards)
  };
};

// Warning Helper Functions
export const calculateWarningScoreDeduction = (warnings) => {
  if (!warnings || warnings.length === 0) {
    return 0;
  }

  return warnings.reduce((total, warning) => total + (warning.scoreDeduction || 0), 0);
};

export const getWarningStatistics = (warnings, year) => {
  if (!warnings || warnings.length === 0) {
    return {
      total: 0,
      resolved: 0,
      unresolved: 0,
      appealed: 0,
      totalDeduction: 0
    };
  }

  const yearWarnings = warnings.filter(w => {
    const warningYear = new Date(w.issuedDate).getFullYear();
    return warningYear === year;
  });

  return {
    total: yearWarnings.length,
    resolved: yearWarnings.filter(w => w.resolved).length,
    unresolved: yearWarnings.filter(w => !w.resolved).length,
    appealed: yearWarnings.filter(w => w.appealed).length,
    totalDeduction: calculateWarningScoreDeduction(yearWarnings)
  };
};

export const isWarningExpired = (warning) => {
  if (!warning || !warning.expires || !warning.expiryDate) {
    return false;
  }

  const expiryDate = new Date(warning.expiryDate);
  const now = new Date();
  
  return expiryDate < now;
};

// Date Helper Functions
export const getQuarter = (date) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  
  if (month >= 1 && month <= 3) return 1;
  if (month >= 4 && month <= 6) return 2;
  if (month >= 7 && month <= 9) return 3;
  return 4;
};

export const getQuarterRange = (year, quarter) => {
  const quarters = {
    1: { start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
    2: { start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
    3: { start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
    4: { start: new Date(year, 9, 1), end: new Date(year, 11, 31) }
  };
  
  return quarters[quarter];
};

export const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  
  return { start, end };
};

// Validation Helper Functions
export const validateKPINumber = (kpiNumber) => {
  const pattern = /^KPI-\d{4}-\d{6}$/;
  return pattern.test(kpiNumber);
};

export const validateGoalNumber = (goalNumber) => {
  const pattern = /^GOAL-\d{4}-\d{6}$/;
  return pattern.test(goalNumber);
};

export const validateAppraisalNumber = (appraisalNumber) => {
  const pattern = /^APP-\d{4}-\d{6}$/;
  return pattern.test(appraisalNumber);
};

export const validateRewardNumber = (rewardNumber) => {
  const pattern = /^RWD-\d{4}-\d{6}$/;
  return pattern.test(rewardNumber);
};

export const validateWarningNumber = (warningNumber) => {
  const pattern = /^WRN-\d{4}-\d{6}$/;
  return pattern.test(warningNumber);
};

// Format Helper Functions
export const formatKPINumber = (year, sequence) => {
  const yearStr = year.toString();
  const sequenceStr = sequence.toString().padStart(6, '0');
  return `KPI-${yearStr}-${sequenceStr}`;
};

export const formatGoalNumber = (year, sequence) => {
  const yearStr = year.toString();
  const sequenceStr = sequence.toString().padStart(6, '0');
  return `GOAL-${yearStr}-${sequenceStr}`;
};

export const formatAppraisalNumber = (year, sequence) => {
  const yearStr = year.toString();
  const sequenceStr = sequence.toString().padStart(6, '0');
  return `APP-${yearStr}-${sequenceStr}`;
};

export const formatRewardNumber = (year, sequence) => {
  const yearStr = year.toString();
  const sequenceStr = sequence.toString().padStart(6, '0');
  return `RWD-${yearStr}-${sequenceStr}`;
};

export const formatWarningNumber = (year, sequence) => {
  const yearStr = year.toString();
  const sequenceStr = sequence.toString().padStart(6, '0');
  return `WRN-${yearStr}-${sequenceStr}`;
};

// Permission Helper Functions
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !requiredPermission) {
    return false;
  }

  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !requiredPermissions || requiredPermissions.length === 0) {
    return false;
  }

  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !requiredPermissions || requiredPermissions.length === 0) {
    return false;
  }

  return requiredPermissions.every(permission => userPermissions.includes(permission));
};
