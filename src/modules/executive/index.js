// Executive Module - Executive Intelligence & Business Intelligence Foundation

// Constants
export { EXECUTIVE_CONSTANTS } from './executive.constants.js';
export {
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
  DASHBOARD_WIDGET_TYPE,
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
} from './executive.constants.js';

// Permissions
export {
  EXECUTIVE_PERMISSIONS,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_DESCRIPTIONS,
  EXECUTIVE_PERMISSIONS_EXPORT
} from './executive.permissions.js';

// Validation
export {
  executiveValidationSchemas,
  healthScoreSchema,
  kpiSchema,
  insightSchema,
  reportSchema,
  analyticsSchema,
  dashboardSchema,
  organizationHealthQuerySchema,
  kpiQuerySchema,
  insightQuerySchema,
  reportQuerySchema,
  analyticsQuerySchema,
  pipelineQuerySchema,
  rankingQuerySchema,
  performanceTierQuerySchema,
  attritionRiskQuerySchema,
  hiringRecommendationQuerySchema,
  capacityQuerySchema,
  organizationRiskQuerySchema,
  paginationQuerySchema,
  dateRangeQuerySchema
} from './executive.validation.js';

// Helpers
export { default as ExecutiveHelpers } from './executive.helpers.js';

// Utils
export { default as ExecutiveUtils } from './executive.utils.js';

// Repository
export { default as executiveRepository } from './executive.repository.js';

// Services
export { default as organizationHealthService } from './organizationHealth.service.js';
export { default as executiveDashboardService } from './executiveDashboard.service.js';
export { default as executiveAnalyticsService } from './executiveAnalytics.service.js';
export { default as executiveInsightsService } from './executiveInsights.service.js';
export { default as executiveReportsService } from './executiveReports.service.js';
export { default as executiveService } from './executive.service.js';

// Controller
export { default as executiveController } from './executive.controller.js';

// Routes
export { default as executiveRoutes } from './executive.routes.js';

// Module Info
export const EXECUTIVE_MODULE_INFO = {
  name: 'Executive Intelligence & Business Intelligence',
  version: '1.0.0',
  description: 'Executive dashboards, analytics, insights, and reports for organization-wide intelligence',
  features: [
    'Organization Health Engine',
    'Executive Dashboards',
    'Business Intelligence',
    'Executive Analytics',
    'Executive Insights',
    'Executive Reports',
    'KPI Tracking',
    'Performance Analytics',
    'Productivity Analytics',
    'Growth Analytics',
    'Risk Management',
    'Succession Planning',
    'Attrition Prediction',
    'Hiring Recommendations',
    'Workforce Capacity Planning'
  ],
  permissions: [
    'executive.dashboard.view',
    'executive.dashboard.manage',
    'executive.analytics.view',
    'executive.analytics.manage',
    'executive.reports.view',
    'executive.reports.generate',
    'executive.reports.manage',
    'executive.health.view',
    'executive.health.manage',
    'executive.insights.view',
    'executive.insights.manage',
    'executive.view',
    'executive.manage',
    'executive.all'
  ],
  roles: [
    'CEO',
    'SUPER_ADMIN',
    'CFO',
    'CTO',
    'COO',
    'CHRO',
    'VP',
    'DIRECTOR'
  ],
  endpoints: {
    health: [
      'GET /api/executive/health/organization',
      'GET /api/executive/health/department/:departmentId',
      'GET /api/executive/health/branch/:branchId',
      'GET /api/executive/health/employee/:employeeId',
      'GET /api/executive/health/summary'
    ],
    dashboard: [
      'GET /api/executive/dashboard/organization-overview',
      'GET /api/executive/dashboard/company-health-score',
      'GET /api/executive/dashboard/department-health-score/:departmentId',
      'GET /api/executive/dashboard/branch-health-score/:branchId',
      'GET /api/executive/dashboard/employee-health-score/:employeeId',
      'GET /api/executive/dashboard/attendance-overview',
      'GET /api/executive/dashboard/task-overview',
      'GET /api/executive/dashboard/project-overview',
      'GET /api/executive/dashboard/kpi-overview',
      'GET /api/executive/dashboard/meeting-overview',
      'GET /api/executive/dashboard/productivity-overview',
      'GET /api/executive/dashboard/organization-summary'
    ],
    analytics: [
      'GET /api/executive/analytics/trend',
      'GET /api/executive/analytics/growth',
      'GET /api/executive/analytics/productivity',
      'GET /api/executive/analytics/performance',
      'GET /api/executive/analytics/attendance',
      'GET /api/executive/analytics/project',
      'GET /api/executive/analytics/task',
      'GET /api/executive/analytics/meeting',
      'GET /api/executive/analytics/department/:departmentId',
      'GET /api/executive/analytics/branch/:branchId',
      'GET /api/executive/analytics/organization'
    ],
    insights: [
      'GET /api/executive/insights/top-performers',
      'GET /api/executive/insights/bottom-performers',
      'GET /api/executive/insights/department-rankings',
      'GET /api/executive/insights/branch-rankings',
      'GET /api/executive/insights/promotion-pipeline',
      'GET /api/executive/insights/training-pipeline',
      'GET /api/executive/insights/succession-planning',
      'GET /api/executive/insights/leadership-pipeline',
      'GET /api/executive/insights/attrition-risk',
      'GET /api/executive/insights/hiring-recommendation',
      'GET /api/executive/insights/workforce-capacity',
      'GET /api/executive/insights/organization-risk'
    ],
    reports: [
      'POST /api/executive/reports/ceo',
      'POST /api/executive/reports/board',
      'POST /api/executive/reports/monthly',
      'POST /api/executive/reports/quarterly',
      'POST /api/executive/reports/annual',
      'POST /api/executive/reports/department/:departmentId',
      'POST /api/executive/reports/organization',
      'POST /api/executive/reports/performance',
      'POST /api/executive/reports/productivity',
      'POST /api/executive/reports/growth'
    ],
    businessIntelligence: [
      'GET /api/executive/bi/organization-kpis',
      'GET /api/executive/bi/department/:departmentId/kpis',
      'GET /api/executive/bi/branch/:branchId/kpis',
      'GET /api/executive/bi/attendance-kpis',
      'GET /api/executive/bi/task-kpis',
      'GET /api/executive/bi/meeting-kpis',
      'GET /api/executive/bi/project-kpis',
      'GET /api/executive/bi/performance-kpis',
      'GET /api/executive/bi/productivity-kpis',
      'GET /api/executive/bi/growth-kpis',
      'GET /api/executive/bi/executive-metrics'
    ],
    composite: [
      'GET /api/executive/composite/executive-dashboard',
      'GET /api/executive/composite/business-intelligence',
      'GET /api/executive/composite/executive-intelligence'
    ]
  },
  integrations: [
    'Attendance Module',
    'Task Module',
    'Project Module',
    'KPI Module',
    'Meeting Module',
    'Employee Module',
    'Department Module',
    'Branch Module',
    'Organization Module',
    'Finance Module (Future)',
    'Strategy Module (Future)'
  ],
  scalability: {
    maxEmployees: 100000,
    maxDepartments: 1000,
    maxBranches: 500,
    maxRecords: 'millions',
    performanceOptimizations: [
      'MongoDB Aggregation Pipelines',
      'Indexing Strategy',
      'Lean Queries',
      'Projection',
      'Bulk Operations',
      'Cursor-based Pagination',
      'Caching',
      'Parallel Processing'
    ]
  },
  futureReady: {
    aiCopilot: 'Ready for AI integration',
    predictiveAnalytics: 'Ready for ML models',
    financialDashboards: 'Ready for Finance module integration',
    attritionPrediction: 'Ready for ML-based prediction',
    hiringForecast: 'Ready for forecasting algorithms',
    salaryForecast: 'Ready for financial forecasting',
    businessForecast: 'Ready for business intelligence expansion',
    organizationSimulation: 'Ready for scenario planning',
    strategicPlanning: 'Ready for OKR and strategic alignment',
    balancedScorecard: 'Ready for BSC framework',
    powerBIReady: 'Ready for Power BI integration'
  }
};
