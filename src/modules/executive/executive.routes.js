import express from 'express';
import { authenticate } from '../../core/middlewares/auth.js';
import { authorize } from '../../core/middlewares/permission.js';
import { validate } from '../../core/middlewares/validation.js';
import executiveController from './executive.controller.js';
import { EXECUTIVE_PERMISSIONS } from './executive.permissions.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ============================================
// ORGANIZATION HEALTH ROUTES
// ============================================
router.get(
  '/health/organization',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_HEALTH_VIEW),
  executiveController.getOrganizationHealth
);

router.get(
  '/health/department/:departmentId',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_HEALTH_VIEW),
  executiveController.getDepartmentHealth
);

router.get(
  '/health/branch/:branchId',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_HEALTH_VIEW),
  executiveController.getBranchHealth
);

router.get(
  '/health/employee/:employeeId',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_HEALTH_VIEW),
  executiveController.getEmployeeHealth
);

router.get(
  '/health/summary',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_HEALTH_VIEW),
  executiveController.getHealthSummary
);

// ============================================
// DASHBOARD ROUTES
// ============================================
router.get(
  '/dashboard/organization-overview',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getOrganizationOverview
);

router.get(
  '/dashboard/company-health-score',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getCompanyHealthScore
);

router.get(
  '/dashboard/department-health-score/:departmentId',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getDepartmentHealthScore
);

router.get(
  '/dashboard/branch-health-score/:branchId',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getBranchHealthScore
);

router.get(
  '/dashboard/employee-health-score/:employeeId',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getEmployeeHealthScore
);

router.get(
  '/dashboard/attendance-overview',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getAttendanceOverview
);

router.get(
  '/dashboard/task-overview',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getTaskOverview
);

router.get(
  '/dashboard/project-overview',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getProjectOverview
);

router.get(
  '/dashboard/kpi-overview',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getKPIOverview
);

router.get(
  '/dashboard/meeting-overview',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getMeetingOverview
);

router.get(
  '/dashboard/productivity-overview',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getProductivityOverview
);

router.get(
  '/dashboard/organization-summary',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getOrganizationSummary
);

// ============================================
// ANALYTICS ROUTES
// ============================================
router.get(
  '/analytics/trend',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getTrendAnalytics
);

router.get(
  '/analytics/growth',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getGrowthAnalytics
);

router.get(
  '/analytics/productivity',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getProductivityAnalytics
);

router.get(
  '/analytics/performance',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getPerformanceAnalytics
);

router.get(
  '/analytics/attendance',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getAttendanceAnalytics
);

router.get(
  '/analytics/project',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getProjectAnalytics
);

router.get(
  '/analytics/task',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getTaskAnalytics
);

router.get(
  '/analytics/meeting',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getMeetingAnalytics
);

router.get(
  '/analytics/department/:departmentId',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getDepartmentAnalytics
);

router.get(
  '/analytics/branch/:branchId',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getBranchAnalytics
);

router.get(
  '/analytics/organization',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getOrganizationAnalytics
);

// ============================================
// INSIGHTS ROUTES
// ============================================
router.get(
  '/insights/top-performers',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getTopPerformers
);

router.get(
  '/insights/bottom-performers',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getBottomPerformers
);

router.get(
  '/insights/department-rankings',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getDepartmentRankings
);

router.get(
  '/insights/branch-rankings',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getBranchRankings
);

router.get(
  '/insights/promotion-pipeline',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getPromotionPipeline
);

router.get(
  '/insights/training-pipeline',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getTrainingPipeline
);

router.get(
  '/insights/succession-planning',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getSuccessionPlanning
);

router.get(
  '/insights/leadership-pipeline',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getLeadershipPipeline
);

router.get(
  '/insights/attrition-risk',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getAttritionRisk
);

router.get(
  '/insights/hiring-recommendation',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getHiringRecommendation
);

router.get(
  '/insights/workforce-capacity',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getWorkforceCapacity
);

router.get(
  '/insights/organization-risk',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getOrganizationRisk
);

// ============================================
// REPORTS ROUTES
// ============================================
router.post(
  '/reports/ceo',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generateCEOReport
);

router.post(
  '/reports/board',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generateBoardReport
);

router.post(
  '/reports/monthly',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generateMonthlyExecutiveReport
);

router.post(
  '/reports/quarterly',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generateQuarterlyExecutiveReport
);

router.post(
  '/reports/annual',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generateAnnualExecutiveReport
);

router.post(
  '/reports/department/:departmentId',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generateDepartmentReport
);

router.post(
  '/reports/organization',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generateOrganizationReport
);

router.post(
  '/reports/performance',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generatePerformanceReport
);

router.post(
  '/reports/productivity',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generateProductivityReport
);

router.post(
  '/reports/growth',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_REPORTS_GENERATE),
  executiveController.generateGrowthReport
);

// ============================================
// BUSINESS INTELLIGENCE ROUTES
// ============================================
router.get(
  '/bi/organization-kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getOrganizationKPIs
);

router.get(
  '/bi/department/:departmentId/kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getDepartmentKPIs
);

router.get(
  '/bi/branch/:branchId/kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getBranchKPIs
);

router.get(
  '/bi/attendance-kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getAttendanceKPIs
);

router.get(
  '/bi/task-kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getTaskKPIs
);

router.get(
  '/bi/meeting-kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getMeetingKPIs
);

router.get(
  '/bi/project-kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getProjectKPIs
);

router.get(
  '/bi/performance-kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getPerformanceKPIs
);

router.get(
  '/bi/productivity-kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getProductivityKPIs
);

router.get(
  '/bi/growth-kpis',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getGrowthKPIs
);

router.get(
  '/bi/executive-metrics',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getExecutiveMetrics
);

// ============================================
// COMPOSITE ROUTES
// ============================================
router.get(
  '/composite/executive-dashboard',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_DASHBOARD_VIEW),
  executiveController.getExecutiveDashboard
);

router.get(
  '/composite/business-intelligence',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_ANALYTICS_VIEW),
  executiveController.getBusinessIntelligence
);

router.get(
  '/composite/executive-intelligence',
  authorize(EXECUTIVE_PERMISSIONS.EXECUTIVE_INSIGHTS_VIEW),
  executiveController.getExecutiveIntelligence
);

export default router;
