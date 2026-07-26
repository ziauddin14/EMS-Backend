import express from 'express';
import dashboardController from './dashboard.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requirePermission } from '../auth/permission.middleware.js';

const router = express.Router();

router.get('/employee/:employeeId', authenticate, dashboardController.getEmployeeDashboard);
router.get('/teamlead/:teamLeadId', authenticate, dashboardController.getTeamLeadDashboard);
router.get('/project-manager/:projectManagerId', authenticate, dashboardController.getProjectManagerDashboard);
router.get('/hr', authenticate, requirePermission('dashboard.hr'), dashboardController.getHRDashboard);
router.get('/ceo', authenticate, requirePermission('dashboard.ceo'), dashboardController.getCEODashboard);

export default router;
