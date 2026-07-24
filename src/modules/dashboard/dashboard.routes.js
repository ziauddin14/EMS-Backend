import express from 'express';
import dashboardController from './dashboard.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/ceo', authenticate, dashboardController.getCEODashboard);
router.get('/hr', authenticate, dashboardController.getHRDashboard);
router.get('/manager/:managerId', authenticate, dashboardController.getManagerDashboard);
router.get('/department/:departmentId', authenticate, dashboardController.getDepartmentDashboard);
router.get('/employee/:employeeId', authenticate, dashboardController.getEmployeeDashboard);
router.get('/team-lead/:teamLeadId', authenticate, dashboardController.getTeamLeadDashboard);
router.get('/role/:role', authenticate, dashboardController.getDashboardByRole);
router.get('/statistics', authenticate, dashboardController.getStatistics);
router.get('/chart/:chartType', authenticate, dashboardController.getChartData);
router.get('/filtered', authenticate, dashboardController.getFilteredDashboard);
router.get('/overview', authenticate, dashboardController.getOrganizationOverview);
router.get('/quick-stats', authenticate, dashboardController.getQuickStatistics);

export default router;
