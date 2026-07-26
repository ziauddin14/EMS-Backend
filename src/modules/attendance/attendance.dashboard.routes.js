import express from 'express';
import attendanceDashboardController from './attendance.dashboard.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requirePermission } from '../auth/permission.middleware.js';

const router = express.Router();

router.get('/dashboard/employee/:employeeId', authenticate, attendanceDashboardController.getEmployeeDashboard);
router.get('/dashboard/manager/:managerId', authenticate, requirePermission('attendance.view_team'), attendanceDashboardController.getManagerDashboard);
router.get('/dashboard/hr', authenticate, requirePermission('attendance.view_all'), attendanceDashboardController.getHRDashboard);
router.get('/dashboard/ceo', authenticate, requirePermission('attendance.view_all'), attendanceDashboardController.getCEODashboard);

router.get('/reports/daily', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getDailyReport);
router.get('/reports/weekly', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getWeeklyReport);
router.get('/reports/monthly', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getMonthlyReport);
router.get('/reports/employee/:id', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getEmployeeReport);
router.get('/reports/department/:id', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getDepartmentReport);
router.get('/reports/shift/:id', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getShiftReport);
router.get('/reports/late', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getLateReport);
router.get('/reports/overtime', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getOvertimeReport);
router.get('/reports/holiday', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getHolidayReport);
router.get('/reports/weekend', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getWeekendReport);
router.get('/reports/adjustment', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getAdjustmentReport);
router.get('/reports/summary', authenticate, requirePermission('attendance.view_reports'), attendanceDashboardController.getSummaryReport);

router.get('/analytics/overview', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getOverviewAnalytics);
router.get('/analytics/trends', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getTrendsAnalytics);
router.get('/analytics/leaderboard', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getLeaderboardAnalytics);
router.get('/analytics/heatmap', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getHeatmapAnalytics);
router.get('/analytics/overtime', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getOvertimeAnalytics);
router.get('/analytics/late', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getLateAnalytics);
router.get('/analytics/department', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getDepartmentAnalytics);
router.get('/analytics/employee/:id', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getEmployeeAnalytics);
router.get('/analytics/shift/:id', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getShiftAnalytics);
router.get('/analytics/trends/monthly', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getMonthlyTrendAnalytics);
router.get('/analytics/trends/weekly', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getWeeklyTrendAnalytics);
router.get('/analytics/trends/yearly', authenticate, requirePermission('attendance.view_analytics'), attendanceDashboardController.getYearlyTrendAnalytics);

export default router;
