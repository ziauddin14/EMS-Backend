// Executive Module Constants

// Health Score Ranges
export const HEALTH_SCORE_RANGE = {
  EXCELLENT: { min: 90, max: 100, label: 'Excellent', color: '#10B981' },
  VERY_GOOD: { min: 80, max: 89, label: 'Very Good', color: '#34D399' },
  GOOD: { min: 70, max: 79, label: 'Good', color: '#60A5FA' },
  SATISFACTORY: { min: 60, max: 69, label: 'Satisfactory', color: '#FBBF24' },
  NEEDS_IMPROVEMENT: { min: 50, max: 59, label: 'Needs Improvement', color: '#F97316' },
  POOR: { min: 0, max: 49, label: 'Poor', color: '#EF4444' }
};

// Health Categories
export const HEALTH_CATEGORY = {
  ORGANIZATION: 'organization',
  DEPARTMENT: 'department',
  BRANCH: 'branch',
  EMPLOYEE: 'employee',
  ATTENDANCE: 'attendance',
  TASK: 'task',
  PROJECT: 'project',
  MEETING: 'meeting',
  PERFORMANCE: 'performance',
  PRODUCTIVITY: 'productivity',
  RISK: 'risk',
  GROWTH: 'growth'
};

// Health Weightages
export const HEALTH_WEIGHTAGE = {
  ORGANIZATION: {
    ATTENDANCE: 20,
    TASK_COMPLETION: 20,
    PROJECT_SUCCESS: 20,
    PERFORMANCE: 20,
    PRODUCTIVITY: 20
  },
  DEPARTMENT: {
    ATTENDANCE: 25,
    TASK_COMPLETION: 25,
    PROJECT_SUCCESS: 25,
    PERFORMANCE: 25
  },
  BRANCH: {
    ATTENDANCE: 25,
    TASK_COMPLETION: 25,
    PROJECT_SUCCESS: 25,
    PERFORMANCE: 25
  },
  EMPLOYEE: {
    ATTENDANCE: 30,
    TASK_COMPLETION: 30,
    PERFORMANCE: 40
  }
};

// KPI Categories
export const KPI_CATEGORY = {
  ORGANIZATION: 'organization',
  DEPARTMENT: 'department',
  BRANCH: 'branch',
  ATTENDANCE: 'attendance',
  TASK: 'task',
  PROJECT: 'project',
  MEETING: 'meeting',
  PERFORMANCE: 'performance',
  PRODUCTIVITY: 'productivity',
  GROWTH: 'growth',
  EXECUTIVE: 'executive'
};

// KPI Metrics
export const KPI_METRIC = {
  // Organization KPIs
  TOTAL_EMPLOYEES: 'total_employees',
  TOTAL_DEPARTMENTS: 'total_departments',
  TOTAL_BRANCHES: 'total_branches',
  ORGANIZATION_HEALTH: 'organization_health',
  REVENUE_PER_EMPLOYEE: 'revenue_per_employee',
  PROFIT_MARGIN: 'profit_margin',
  
  // Attendance KPIs
  ATTENDANCE_RATE: 'attendance_rate',
  PUNCTUALITY_RATE: 'punctuality_rate',
  ABSENTEEISM_RATE: 'absenteeism_rate',
  LATE_ARRIVAL_RATE: 'late_arrival_rate',
  
  // Task KPIs
  TASK_COMPLETION_RATE: 'task_completion_rate',
  TASK_ON_TIME_RATE: 'task_on_time_rate',
  TASK_OVERDUE_RATE: 'task_overdue_rate',
  AVG_TASK_DURATION: 'avg_task_duration',
  
  // Project KPIs
  PROJECT_SUCCESS_RATE: 'project_success_rate',
  PROJECT_ON_TIME_RATE: 'project_on_time_rate',
  PROJECT_ON_BUDGET_RATE: 'project_on_budget_rate',
  ACTIVE_PROJECTS: 'active_projects',
  
  // Meeting KPIs
  MEETING_PRODUCTIVITY: 'meeting_productivity',
  MEETING_ATTENDANCE_RATE: 'meeting_attendance_rate',
  ACTION_ITEM_COMPLETION_RATE: 'action_item_completion_rate',
  AVG_MEETING_DURATION: 'avg_meeting_duration',
  
  // Performance KPIs
  AVG_PERFORMANCE_SCORE: 'avg_performance_score',
  HIGH_PERFORMERS_RATIO: 'high_performers_ratio',
  LOW_PERFORMERS_RATIO: 'low_performers_ratio',
  PROMOTION_ELIGIBLE_RATIO: 'promotion_eligible_ratio',
  
  // Productivity KPIs
  PRODUCTIVITY_INDEX: 'productivity_index',
  EFFICIENCY_RATE: 'efficiency_rate',
  OUTPUT_PER_HOUR: 'output_per_hour',
  UTILIZATION_RATE: 'utilization_rate',
  
  // Growth KPIs
  EMPLOYEE_GROWTH_RATE: 'employee_growth_rate',
  REVENUE_GROWTH_RATE: 'revenue_growth_rate',
  HEADCOUNT_GROWTH_RATE: 'headcount_growth_rate',
  RETENTION_RATE: 'retention_rate',
  
  // Executive Metrics
  EXECUTIVE_HEALTH_SCORE: 'executive_health_score',
  STRATEGIC_ALIGNMENT: 'strategic_alignment',
  OPERATIONAL_EXCELLENCE: 'operational_excellence',
  TALENT_DEVELOPMENT: 'talent_development',
  INNOVATION_INDEX: 'innovation_index'
};

// Insight Types
export const INSIGHT_TYPE = {
  TOP_PERFORMERS: 'top_performers',
  BOTTOM_PERFORMERS: 'bottom_performers',
  DEPARTMENT_RANKINGS: 'department_rankings',
  BRANCH_RANKINGS: 'branch_rankings',
  PROMOTION_PIPELINE: 'promotion_pipeline',
  TRAINING_PIPELINE: 'training_pipeline',
  SUCCESSION_PLANNING: 'succession_planning',
  LEADERSHIP_PIPELINE: 'leadership_pipeline',
  ATTRITION_RISK: 'attrition_risk',
  HIRING_RECOMMENDATION: 'hiring_recommendation',
  WORKFORCE_CAPACITY: 'workforce_capacity',
  ORGANIZATION_RISK: 'organization_risk'
};

// Risk Levels
export const RISK_LEVEL = {
  CRITICAL: { value: 5, label: 'Critical', color: '#EF4444' },
  HIGH: { value: 4, label: 'High', color: '#F97316' },
  MEDIUM: { value: 3, label: 'Medium', color: '#FBBF24' },
  LOW: { value: 2, label: 'Low', color: '#60A5FA' },
  MINIMAL: { value: 1, label: 'Minimal', color: '#10B981' }
};

// Report Types
export const REPORT_TYPE = {
  CEO_REPORT: 'ceo_report',
  BOARD_REPORT: 'board_report',
  MONTHLY_EXECUTIVE: 'monthly_executive',
  QUARTERLY_EXECUTIVE: 'quarterly_executive',
  ANNUAL_EXECUTIVE: 'annual_executive',
  DEPARTMENT_REPORT: 'department_report',
  ORGANIZATION_REPORT: 'organization_report',
  PERFORMANCE_REPORT: 'performance_report',
  PRODUCTIVITY_REPORT: 'productivity_report',
  GROWTH_REPORT: 'growth_report'
};

// Report Periods
export const REPORT_PERIOD = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
  CUSTOM: 'custom'
};

// Analytics Types
export const ANALYTICS_TYPE = {
  TREND: 'trend',
  GROWTH: 'growth',
  PRODUCTIVITY: 'productivity',
  PERFORMANCE: 'performance',
  ATTENDANCE: 'attendance',
  PROJECT: 'project',
  TASK: 'task',
  MEETING: 'meeting',
  DEPARTMENT: 'department',
  BRANCH: 'branch',
  ORGANIZATION: 'organization'
};

// Trend Directions
export const TREND_DIRECTION = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable',
  VOLATILE: 'volatile'
};

// Dashboard Widget Types
export const DASHBOARD_WIDGET = {
  KPI_CARD: 'kpi_card',
  CHART: 'chart',
  TABLE: 'table',
  HEATMAP: 'heatmap',
  GAUGE: 'gauge',
  PROGRESS: 'progress',
  TREND_LINE: 'trend_line',
  BAR_CHART: 'bar_chart',
  PIE_CHART: 'pie_chart',
  DONUT_CHART: 'donut_chart',
  AREA_CHART: 'area_chart',
  SCATTER_PLOT: 'scatter_plot',
  BUBBLE_CHART: 'bubble_chart',
  FUNNEL_CHART: 'funnel_chart',
  RADAR_CHART: 'radar_chart'
};

// Chart Types
export const CHART_TYPE = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DONUT: 'donut',
  AREA: 'area',
  SCATTER: 'scatter',
  BUBBLE: 'bubble',
  RADAR: 'radar',
  FUNNEL: 'funnel',
  GAUGE: 'gauge',
  HEATMAP: 'heatmap',
  TREEMAP: 'treemap',
  SANKEY: 'sankey'
};

// Time Periods
export const TIME_PERIOD = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  LAST_90_DAYS: 'last_90_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

// Comparison Types
export const COMPARISON_TYPE = {
  PERIOD_OVER_PERIOD: 'period_over_period',
  YEAR_OVER_YEAR: 'year_over_year',
  BENCHMARK: 'benchmark',
  TARGET: 'target',
  FORECAST: 'forecast'
};

// Data Granularity
export const DATA_GRANULARITY = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual'
};

// Aggregation Functions
export const AGGREGATION_FUNCTION = {
  SUM: 'sum',
  AVG: 'avg',
  COUNT: 'count',
  MIN: 'min',
  MAX: 'max',
  MEDIAN: 'median',
  STD_DEV: 'std_dev',
  PERCENTILE: 'percentile'
};

// Performance Tiers
export const PERFORMANCE_TIER = {
  ELITE: { min: 95, max: 100, label: 'Elite', color: '#10B981' },
  HIGH: { min: 85, max: 94, label: 'High', color: '#34D399' },
  AVERAGE: { min: 70, max: 84, label: 'Average', color: '#60A5FA' },
  BELOW_AVERAGE: { min: 50, max: 69, label: 'Below Average', color: '#FBBF24' },
  LOW: { min: 0, max: 49, label: 'Low', color: '#EF4444' }
};

// Pipeline Stages
export const PIPELINE_STAGE = {
  PROMOTION: {
    READY: 'ready',
    NEEDS_DEVELOPMENT: 'needs_development',
    NOT_READY: 'not_ready'
  },
  TRAINING: {
    REQUIRED: 'required',
    RECOMMENDED: 'recommended',
    OPTIONAL: 'optional'
  },
  SUCCESSION: {
    READY_NOW: 'ready_now',
    READY_IN_1_YEAR: 'ready_in_1_year',
    READY_IN_2_YEARS: 'ready_in_2_years',
    NEEDS_DEVELOPMENT: 'needs_development'
  },
  LEADERSHIP: {
    EXECUTIVE: 'executive',
    SENIOR_LEADERSHIP: 'senior_leadership',
    MIDDLE_MANAGEMENT: 'middle_management',
    TEAM_LEAD: 'team_lead'
  }
};

// Attrition Risk Factors
export const ATTRITION_RISK_FACTOR = {
  HIGH_PERFORMANCE_LOW_COMPENSATION: 'high_performance_low_compensation',
  LONG_TENURE_NO_PROMOTION: 'long_tenure_no_promotion',
  HIGH_WORKLOAD: 'high_workload',
  LOW_ENGAGEMENT: 'low_engagement',
  MARKET_COMPETITION: 'market_competition',
  PERSONAL_REASON: 'personal_reason',
  ORGANIZATIONAL_CHANGE: 'organizational_change'
};

// Hiring Recommendations
export const HIRING_RECOMMENDATION = {
  IMMEDIATE: 'immediate',
  PRIORITY: 'priority',
  PLANNED: 'planned',
  ON_HOLD: 'on_hold',
  NOT_REQUIRED: 'not_required'
};

// Capacity Planning
export const CAPACITY_STATUS = {
  UNDER_UTILIZED: 'under_utilized',
  OPTIMAL: 'optimal',
  NEAR_CAPACITY: 'near_capacity',
  AT_CAPACITY: 'at_capacity',
  OVER_CAPACITY: 'over_capacity'
};

// Organization Risk Categories
export const ORGANIZATION_RISK_CATEGORY = {
  TALENT: 'talent',
  OPERATIONAL: 'operational',
  FINANCIAL: 'financial',
  STRATEGIC: 'strategic',
  COMPLIANCE: 'compliance',
  REPUTATIONAL: 'reputational'
};

// Alert Thresholds
export const ALERT_THRESHOLD = {
  HEALTH_SCORE_CRITICAL: 50,
  HEALTH_SCORE_WARNING: 70,
  ATTENDANCE_RATE_CRITICAL: 75,
  ATTENDANCE_RATE_WARNING: 85,
  TASK_COMPLETION_CRITICAL: 70,
  TASK_COMPLETION_WARNING: 80,
  PROJECT_SUCCESS_CRITICAL: 75,
  PROJECT_SUCCESS_WARNING: 85,
  ATTRITION_RISK_HIGH: 30,
  CAPACITY_UTILIZATION_HIGH: 90
};

// Dashboard Refresh Intervals (in seconds)
export const DASHBOARD_REFRESH_INTERVAL = {
  REAL_TIME: 30,
  FREQUENT: 300,
  HOURLY: 3600,
  DAILY: 86400
};

// Export all constants as a single object for convenience
export const EXECUTIVE_CONSTANTS = {
  HEALTH_SCORE_RANGE,
  HEALTH_CATEGORY,
  HEALTH_WEIGHTAGE,
  KPI_CATEGORY,
  KPI_METRIC,
  INSIGHT_TYPE,
  RISK_LEVEL,
  REPORT_TYPE,
  REPORT_PERIOD,
  ANALYTICS_TYPE,
  TREND_DIRECTION,
  DASHBOARD_WIDGET,
  CHART_TYPE,
  TIME_PERIOD,
  COMPARISON_TYPE,
  DATA_GRANULARITY,
  AGGREGATION_FUNCTION,
  PERFORMANCE_TIER,
  PIPELINE_STAGE,
  ATTRITION_RISK_FACTOR,
  HIRING_RECOMMENDATION,
  CAPACITY_STATUS,
  ORGANIZATION_RISK_CATEGORY,
  ALERT_THRESHOLD,
  DASHBOARD_REFRESH_INTERVAL
};
