import express from 'express';
import employeeDocumentController from './employeeDocument.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, employeeDocumentController.upload);
router.post('/upload', authenticate, employeeDocumentController.upload);
router.get('/', authenticate, employeeDocumentController.getAll);
router.get('/search', authenticate, employeeDocumentController.search);
router.get('/filter', authenticate, employeeDocumentController.filter);
router.get('/statistics', authenticate, employeeDocumentController.getStatistics);
router.get('/verified', authenticate, employeeDocumentController.getVerified);
router.get('/pending', authenticate, employeeDocumentController.getPending);
router.get('/expired', authenticate, employeeDocumentController.getExpired);
router.get('/expiring-soon/:days?', authenticate, employeeDocumentController.getExpiringSoon);
router.get('/type/:type', authenticate, employeeDocumentController.getByType);
router.get('/status/:status', authenticate, employeeDocumentController.getByStatus);
router.get('/employee/:employeeId', authenticate, employeeDocumentController.getByEmployee);
router.get('/employee/:employeeId/statistics', authenticate, employeeDocumentController.getEmployeeStatistics);
router.get('/:id', authenticate, employeeDocumentController.getById);
router.get('/:id/download', authenticate, employeeDocumentController.download);
router.patch('/:id', authenticate, employeeDocumentController.update);
router.patch('/:id/replace', authenticate, employeeDocumentController.replace);
router.patch('/:id/verify', authenticate, employeeDocumentController.verify);
router.delete('/:id', authenticate, employeeDocumentController.delete);
router.patch('/restore/:id', authenticate, employeeDocumentController.restore);

export default router;
