import express from 'express';
import reportsController from './reports.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requirePermission } from '../auth/permission.middleware.js';

const router = express.Router();

router.get('/daily', authenticate, reportsController.getDailyReport);
router.get('/weekly', authenticate, reportsController.getWeeklyReport);
router.get('/monthly', authenticate, reportsController.getMonthlyReport);
router.get('/employee/:employeeId', authenticate, reportsController.getEmployeeReport);
router.get('/department/:departmentId', authenticate, reportsController.getDepartmentReport);
router.get('/project/:id', authenticate, reportsController.getProjectReport);
router.get('/task/:id', authenticate, reportsController.getTaskReport);
router.get('/worklog', authenticate, reportsController.getWorkLogReport);
router.get('/overdue', authenticate, requirePermission('report.view'), reportsController.getOverdueReport);
router.get('/blocked', authenticate, requirePermission('report.view'), reportsController.getBlockedTaskReport);
router.get('/productivity', authenticate, requirePermission('report.view'), reportsController.getProductivityReport);
router.get('/utilization', authenticate, requirePermission('report.view'), reportsController.getUtilizationReport);
router.get('/completion', authenticate, requirePermission('report.view'), reportsController.getCompletionReport);
router.get('/executive', authenticate, requirePermission('report.executive'), reportsController.getExecutiveReport);

export default router;
