import express from 'express';
import attendanceController from './attendance.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, attendanceController.getAll);
router.get('/date-range', authenticate, attendanceController.getByDateRange);
router.get('/pending-approvals', authenticate, attendanceController.getPendingApprovals);
router.get('/adjustment-requests', authenticate, attendanceController.getAdjustmentRequests);
router.get('/statistics', authenticate, attendanceController.getStatistics);
router.get('/enhanced-statistics', authenticate, attendanceController.getEnhancedStatistics);
router.get('/employee/:employeeId', authenticate, attendanceController.getByEmployee);
router.get('/employee/:employeeId/date', authenticate, attendanceController.getByEmployeeAndDate);
router.get('/employee/:employeeId/today', authenticate, attendanceController.getToday);
router.get('/employee/:employeeId/monthly', authenticate, attendanceController.getMonthly);
router.get('/employee/:employeeId/summary', authenticate, attendanceController.getSummary);
router.get('/employee/:employeeId/trend', authenticate, attendanceController.getTrend);
router.get('/department/:departmentId', authenticate, attendanceController.getDepartment);
router.get('/shift/:shiftId', authenticate, attendanceController.getByShift);
router.get('/status/:status', authenticate, attendanceController.getByStatus);
router.post('/', authenticate, attendanceController.create);
router.post('/bulk-create', authenticate, attendanceController.bulkCreate);
router.post('/employee/:employeeId/check-in', authenticate, attendanceController.checkIn);
router.post('/employee/:employeeId/check-out', authenticate, attendanceController.checkOut);
router.post('/employee/:employeeId/break/start', authenticate, attendanceController.startBreak);
router.post('/employee/:employeeId/break/end', authenticate, attendanceController.endBreak);
router.patch('/bulk-update', authenticate, attendanceController.bulkUpdate);
router.delete('/bulk-delete', authenticate, attendanceController.bulkDelete);
router.get('/:id', authenticate, attendanceController.getById);
router.patch('/:id', authenticate, attendanceController.update);
router.delete('/:id', authenticate, attendanceController.delete);
router.patch('/restore/:id', authenticate, attendanceController.restore);
router.patch('/:id/request-adjustment', authenticate, attendanceController.requestAdjustment);
router.patch('/:id/approve', authenticate, attendanceController.approve);
router.patch('/:id/reject', authenticate, attendanceController.reject);

export default router;
