import express from 'express';
import kpiController from './kpi.controller.js';
import goalController from './goal.controller.js';
import performanceController from './performance.controller.js';
import appraisalController from './appraisal.controller.js';
import rewardController from './reward.controller.js';
import warningController from './warning.controller.js';
import dashboardController from './dashboard.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requirePermission } from '../auth/permission.middleware.js';
import { KPI_PERMISSIONS, GOAL_PERMISSIONS, PERFORMANCE_PERMISSIONS, APPRAISAL_PERMISSIONS, REWARD_PERMISSIONS, WARNING_PERMISSIONS } from './kpi.permissions.js';

const router = express.Router();

// KPI Routes
router.get('/kpi', authenticate, kpiController.getAll);
router.get('/kpi/:id', authenticate, kpiController.getById);
router.post('/kpi', authenticate, requirePermission(KPI_PERMISSIONS.KPI_CREATE), kpiController.create);
router.patch('/kpi/:id', authenticate, requirePermission(KPI_PERMISSIONS.KPI_UPDATE), kpiController.update);
router.delete('/kpi/:id', authenticate, requirePermission(KPI_PERMISSIONS.KPI_DELETE), kpiController.delete);
router.patch('/kpi/:id/approve', authenticate, requirePermission(KPI_PERMISSIONS.KPI_APPROVE), kpiController.approve);
router.patch('/kpi/:id/reject', authenticate, requirePermission(KPI_PERMISSIONS.KPI_APPROVE), kpiController.reject);
router.patch('/kpi/:id/review', authenticate, requirePermission(KPI_PERMISSIONS.KPI_REVIEW), kpiController.review);
router.get('/kpi/employee/:employeeId', authenticate, kpiController.getEmployeeKPIs);
router.get('/kpi/department/:departmentId', authenticate, kpiController.getDepartmentKPIs);
router.get('/kpi/manager/:managerId', authenticate, kpiController.getManagerKPIs);
router.get('/kpi/top-performers/:year', authenticate, kpiController.getTopPerformers);
router.get('/kpi/low-performers/:year', authenticate, kpiController.getLowPerformers);
router.get('/kpi/dashboard/:employeeId', authenticate, kpiController.getDashboard);
router.get('/kpi/department-dashboard/:departmentId', authenticate, kpiController.getDepartmentDashboard);
router.get('/kpi/manager-dashboard/:managerId', authenticate, kpiController.getManagerDashboard);
router.get('/kpi/report/:reportType', authenticate, kpiController.generateReport);
router.get('/kpi/analytics/:employeeId', authenticate, kpiController.getAnalytics);

// Goal Routes
router.get('/goals', authenticate, goalController.getAll);
router.get('/goals/:id', authenticate, goalController.getById);
router.post('/goals', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_CREATE), goalController.create);
router.patch('/goals/:id', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_UPDATE), goalController.update);
router.delete('/goals/:id', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_DELETE), goalController.delete);
router.post('/goals/assign', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_ASSIGN), goalController.assign);
router.patch('/goals/:id/reassign', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_ASSIGN), goalController.reassign);
router.patch('/goals/:id/complete', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_UPDATE), goalController.complete);
router.patch('/goals/:id/progress', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_UPDATE), goalController.updateProgress);
router.patch('/goals/:id/approve', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_APPROVE), goalController.approve);
router.patch('/goals/:id/reject', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_APPROVE), goalController.reject);
router.patch('/goals/:id/review', authenticate, requirePermission(GOAL_PERMISSIONS.GOAL_REVIEW), goalController.review);
router.get('/goals/owner/:ownerId', authenticate, goalController.getEmployeeGoals);
router.get('/goals/department/:departmentId', authenticate, goalController.getDepartmentGoals);
router.get('/goals/reviewer/:reviewerId', authenticate, goalController.getReviewerGoals);
router.get('/goals/overdue', authenticate, goalController.getOverdueGoals);
router.get('/goals/due-soon', authenticate, goalController.getDueSoonGoals);
router.get('/goals/dashboard/:ownerId', authenticate, goalController.getDashboard);
router.get('/goals/department-dashboard/:departmentId', authenticate, goalController.getDepartmentDashboard);
router.get('/goals/manager-dashboard/:managerId', authenticate, goalController.getManagerDashboard);
router.get('/goals/report/:reportType', authenticate, goalController.generateReport);
router.get('/goals/analytics/:ownerId', authenticate, goalController.getAnalytics);

// Performance Routes
router.get('/performance', authenticate, performanceController.getAll);
router.get('/performance/:id', authenticate, performanceController.getById);
router.post('/performance', authenticate, requirePermission(PERFORMANCE_PERMISSIONS.PERFORMANCE_CREATE), performanceController.create);
router.patch('/performance/:id', authenticate, requirePermission(PERFORMANCE_PERMISSIONS.PERFORMANCE_UPDATE), performanceController.update);
router.delete('/performance/:id', authenticate, requirePermission(PERFORMANCE_PERMISSIONS.PERFORMANCE_DELETE), performanceController.delete);
router.patch('/performance/:id/approve', authenticate, requirePermission(PERFORMANCE_PERMISSIONS.PERFORMANCE_APPROVE), performanceController.approve);
router.patch('/performance/:id/reject', authenticate, requirePermission(PERFORMANCE_PERMISSIONS.PERFORMANCE_APPROVE), performanceController.reject);
router.patch('/performance/:id/review', authenticate, requirePermission(PERFORMANCE_PERMISSIONS.PERFORMANCE_REVIEW), performanceController.review);
router.patch('/performance/:id/promotion-eligible', authenticate, requirePermission(PERFORMANCE_PERMISSIONS.PERFORMANCE_UPDATE), performanceController.setPromotionEligible);
router.patch('/performance/:id/bonus-eligible', authenticate, requirePermission(PERFORMANCE_PERMISSIONS.PERFORMANCE_UPDATE), performanceController.setBonusEligible);
router.get('/performance/employee/:employeeId', authenticate, performanceController.getEmployeePerformance);
router.get('/performance/department/:departmentId', authenticate, performanceController.getDepartmentPerformance);
router.get('/performance/manager/:managerId', authenticate, performanceController.getManagerPerformance);
router.get('/performance/top-performers/:year', authenticate, performanceController.getTopPerformers);
router.get('/performance/low-performers/:year', authenticate, performanceController.getLowPerformers);
router.get('/performance/promotion-eligible/:year', authenticate, performanceController.getPromotionEligible);
router.get('/performance/bonus-eligible/:year', authenticate, performanceController.getBonusEligible);
router.get('/performance/dashboard/:employeeId', authenticate, performanceController.getDashboard);
router.get('/performance/department-dashboard/:departmentId', authenticate, performanceController.getDepartmentDashboard);
router.get('/performance/manager-dashboard/:managerId', authenticate, performanceController.getManagerDashboard);
router.get('/performance/report/:reportType', authenticate, performanceController.generateReport);
router.get('/performance/analytics/:employeeId', authenticate, performanceController.getAnalytics);

// Appraisal Routes
router.get('/appraisals', authenticate, appraisalController.getAll);
router.get('/appraisals/:id', authenticate, appraisalController.getById);
router.post('/appraisals', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_CREATE), appraisalController.create);
router.patch('/appraisals/:id', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_UPDATE), appraisalController.update);
router.delete('/appraisals/:id', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_DELETE), appraisalController.delete);
router.patch('/appraisals/:id/submit', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_SUBMIT), appraisalController.submit);
router.patch('/appraisals/:id/approve', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_APPROVE), appraisalController.approve);
router.patch('/appraisals/:id/reject', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_APPROVE), appraisalController.reject);
router.patch('/appraisals/:id/finalize', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_FINALIZE), appraisalController.finalize);
router.patch('/appraisals/:id/manager-review', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_REVIEW), appraisalController.managerReview);
router.patch('/appraisals/:id/hr-review', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_REVIEW), appraisalController.hrReview);
router.post('/appraisals/:id/recommendations', authenticate, requirePermission(APPRAISAL_PERMISSIONS.APPRAISAL_REVIEW), appraisalController.addRecommendation);
router.get('/appraisals/employee/:employeeId', authenticate, appraisalController.getEmployeeAppraisals);
router.get('/appraisals/department/:departmentId', authenticate, appraisalController.getDepartmentAppraisals);
router.get('/appraisals/manager/:managerId', authenticate, appraisalController.getManagerAppraisals);
router.get('/appraisals/top-performers/:year', authenticate, appraisalController.getTopPerformers);
router.get('/appraisals/low-performers/:year', authenticate, appraisalController.getLowPerformers);
router.get('/appraisals/promotion-eligible/:year', authenticate, appraisalController.getPromotionEligible);
router.get('/appraisals/increment-eligible/:year', authenticate, appraisalController.getIncrementEligible);
router.get('/appraisals/dashboard/:employeeId', authenticate, appraisalController.getDashboard);
router.get('/appraisals/department-dashboard/:departmentId', authenticate, appraisalController.getDepartmentDashboard);
router.get('/appraisals/manager-dashboard/:managerId', authenticate, appraisalController.getManagerDashboard);
router.get('/appraisals/report/:reportType', authenticate, appraisalController.generateReport);
router.get('/appraisals/analytics/:employeeId', authenticate, appraisalController.getAnalytics);

// Reward Routes
router.get('/rewards', authenticate, rewardController.getAll);
router.get('/rewards/:id', authenticate, rewardController.getById);
router.post('/rewards', authenticate, requirePermission(REWARD_PERMISSIONS.REWARD_CREATE), rewardController.create);
router.patch('/rewards/:id', authenticate, requirePermission(REWARD_PERMISSIONS.REWARD_UPDATE), rewardController.update);
router.delete('/rewards/:id', authenticate, requirePermission(REWARD_PERMISSIONS.REWARD_DELETE), rewardController.delete);
router.post('/rewards/issue', authenticate, requirePermission(REWARD_PERMISSIONS.REWARD_ISSUE), rewardController.issue);
router.patch('/rewards/:id/approve', authenticate, requirePermission(REWARD_PERMISSIONS.REWARD_APPROVE), rewardController.approve);
router.patch('/rewards/:id/reject', authenticate, requirePermission(REWARD_PERMISSIONS.REWARD_APPROVE), rewardController.reject);
router.post('/rewards/nominate', authenticate, requirePermission(REWARD_PERMISSIONS.REWARD_NOMINATE), rewardController.nominate);
router.patch('/rewards/:id/cancel', authenticate, requirePermission(REWARD_PERMISSIONS.REWARD_UPDATE), rewardController.cancel);
router.get('/rewards/recipient/:recipientId', authenticate, rewardController.getEmployeeRewards);
router.get('/rewards/department/:departmentId', authenticate, rewardController.getDepartmentRewards);
router.get('/rewards/issuer/:issuerId', authenticate, rewardController.getIssuerRewards);
router.get('/rewards/top-rewarded/:year', authenticate, rewardController.getTopRewarded);
router.get('/rewards/dashboard/:recipientId', authenticate, rewardController.getDashboard);
router.get('/rewards/department-dashboard/:departmentId', authenticate, rewardController.getDepartmentDashboard);
router.get('/rewards/manager-dashboard/:managerId', authenticate, rewardController.getManagerDashboard);
router.get('/rewards/report/:reportType', authenticate, rewardController.generateReport);
router.get('/rewards/analytics/:recipientId', authenticate, rewardController.getAnalytics);

// Warning Routes
router.get('/warnings', authenticate, warningController.getAll);
router.get('/warnings/:id', authenticate, warningController.getById);
router.post('/warnings', authenticate, requirePermission(WARNING_PERMISSIONS.WARNING_CREATE), warningController.create);
router.patch('/warnings/:id', authenticate, requirePermission(WARNING_PERMISSIONS.WARNING_UPDATE), warningController.update);
router.delete('/warnings/:id', authenticate, requirePermission(WARNING_PERMISSIONS.WARNING_DELETE), warningController.delete);
router.post('/warnings/issue', authenticate, requirePermission(WARNING_PERMISSIONS.WARNING_ISSUE), warningController.issue);
router.patch('/warnings/:id/resolve', authenticate, requirePermission(WARNING_PERMISSIONS.WARNING_RESOLVE), warningController.resolve);
router.patch('/warnings/:id/appeal', authenticate, requirePermission(WARNING_PERMISSIONS.WARNING_APPEAL), warningController.appeal);
router.patch('/warnings/:id/review-appeal', authenticate, requirePermission(WARNING_PERMISSIONS.WARNING_REVIEW_APPEAL), warningController.reviewAppeal);
router.patch('/warnings/:id/escalate', authenticate, requirePermission(WARNING_PERMISSIONS.WARNING_ESCALATE), warningController.escalate);
router.get('/warnings/employee/:employeeId', authenticate, warningController.getEmployeeWarnings);
router.get('/warnings/department/:departmentId', authenticate, warningController.getDepartmentWarnings);
router.get('/warnings/unresolved', authenticate, warningController.getUnresolvedWarnings);
router.get('/warnings/pending-appeals', authenticate, warningController.getPendingAppeals);
router.get('/warnings/dashboard/:employeeId', authenticate, warningController.getDashboard);
router.get('/warnings/department-dashboard/:departmentId', authenticate, warningController.getDepartmentDashboard);
router.get('/warnings/manager-dashboard/:managerId', authenticate, warningController.getManagerDashboard);
router.get('/warnings/report/:reportType', authenticate, warningController.generateReport);
router.get('/warnings/analytics/:employeeId', authenticate, warningController.getAnalytics);

// Dashboard Routes
router.get('/dashboard/employee/:employeeId', authenticate, dashboardController.getEmployeeDashboard);
router.get('/dashboard/manager/:managerId', authenticate, dashboardController.getManagerDashboard);
router.get('/dashboard/hr', authenticate, dashboardController.getHRDashboard);
router.get('/dashboard/ceo', authenticate, dashboardController.getCEODashboard);
router.get('/dashboard/heatmap', authenticate, dashboardController.getPerformanceHeatmap);
router.get('/dashboard/rankings/departments', authenticate, dashboardController.getDepartmentRankings);
router.get('/dashboard/charts', authenticate, dashboardController.getChartData);
router.get('/dashboard/summary/executive', authenticate, dashboardController.getExecutiveSummary);
router.get('/dashboard/pipeline/promotion', authenticate, dashboardController.getPromotionPipeline);
router.get('/dashboard/pipeline/training', authenticate, dashboardController.getTrainingPipeline);
router.get('/dashboard/pipeline/bonus', authenticate, dashboardController.getBonusPipeline);
router.get('/dashboard/trends/performance', authenticate, dashboardController.getPerformanceTrend);
router.get('/dashboard/trends/productivity', authenticate, dashboardController.getProductivityTrend);
router.get('/dashboard/distribution/performance', authenticate, dashboardController.getPerformanceDistribution);
router.get('/dashboard/team/:managerId/trends/monthly', authenticate, dashboardController.getTeamMonthlyTrend);
router.get('/dashboard/team/:managerId/trends/quarterly', authenticate, dashboardController.getTeamQuarterlyTrend);

export default router;
