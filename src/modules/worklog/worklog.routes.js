import express from 'express';
import worklogController from './worklog.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requirePermission } from '../auth/permission.middleware.js';

const router = express.Router();

router.get('/', authenticate, worklogController.getAll);
router.get('/statistics', authenticate, worklogController.getStatistics);
router.get('/employee/:employeeId', authenticate, worklogController.getByEmployee);
router.get('/task/:taskId', authenticate, worklogController.getByTask);
router.get('/project/:projectId', authenticate, worklogController.getByProject);
router.get('/date-range', authenticate, worklogController.getByDateRange);
router.get('/employee/:employeeId/date-range', authenticate, worklogController.getByEmployeeAndDateRange);
router.get('/status/:status', authenticate, worklogController.getByStatus);
router.get('/billable/:billable', authenticate, worklogController.getByBillable);
router.get('/employee/:employeeId/statistics', authenticate, worklogController.getEmployeeStatistics);
router.get('/task/:taskId/statistics', authenticate, worklogController.getTaskStatistics);
router.get('/project/:projectId/statistics', authenticate, worklogController.getProjectStatistics);
router.get('/:id', authenticate, worklogController.getById);
router.post('/', authenticate, requirePermission('worklog.create'), worklogController.create);
router.patch('/:id', authenticate, requirePermission('worklog.update'), worklogController.update);
router.delete('/:id', authenticate, requirePermission('worklog.delete'), worklogController.delete);
router.patch('/restore/:id', authenticate, requirePermission('worklog.delete'), worklogController.restore);
router.post('/start-work', authenticate, requirePermission('worklog.create'), worklogController.startWork);
router.patch('/:id/stop-work', authenticate, requirePermission('worklog.update'), worklogController.stopWork);
router.post('/manual-entry', authenticate, requirePermission('worklog.create'), worklogController.manualEntry);
router.get('/employee/:employeeId/daily-summary', authenticate, worklogController.getDailySummary);
router.get('/employee/:employeeId/weekly-summary', authenticate, worklogController.getWeeklySummary);
router.get('/employee/:employeeId/monthly-summary', authenticate, worklogController.getMonthlySummary);

export default router;
