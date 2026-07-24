import express from 'express';
import employeeController from './employee.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, employeeController.create);
router.get('/', authenticate, employeeController.getAll);
router.get('/search', authenticate, employeeController.search);
router.get('/filter', authenticate, employeeController.filter);
router.get('/statistics', authenticate, employeeController.getStatistics);
router.get('/active', authenticate, employeeController.getActive);
router.get('/profile/:employeeNumber', authenticate, employeeController.getProfile);
router.get('/department/:departmentId', authenticate, employeeController.getByDepartment);
router.get('/designation/:designationId', authenticate, employeeController.getByDesignation);
router.get('/status/:status', authenticate, employeeController.getByStatus);
router.get('/type/:type', authenticate, employeeController.getByType);
router.get('/manager/:managerId', authenticate, employeeController.getReportingManagerEmployees);
router.get('/number/:employeeNumber', authenticate, employeeController.getByEmployeeNumber);
router.get('/:id', authenticate, employeeController.getById);
router.patch('/:id', authenticate, employeeController.update);
router.patch('/:id/status', authenticate, employeeController.updateStatus);
router.patch('/:id/reporting-manager', authenticate, employeeController.updateReportingManager);
router.patch('/:id/department', authenticate, employeeController.updateDepartment);
router.patch('/:id/designation', authenticate, employeeController.updateDesignation);
router.delete('/:id', authenticate, employeeController.delete);
router.patch('/restore/:id', authenticate, employeeController.restore);

export default router;
