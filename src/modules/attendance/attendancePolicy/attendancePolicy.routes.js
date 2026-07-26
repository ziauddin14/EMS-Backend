import express from 'express';
import attendancePolicyController from './attendancePolicy.controller.js';
import { authenticate } from '../../auth/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, attendancePolicyController.getAll);
router.get('/active', authenticate, attendancePolicyController.getActive);
router.get('/all-active', authenticate, attendancePolicyController.getAllActive);
router.get('/statistics', authenticate, attendancePolicyController.getStatistics);
router.get('/company/:companyName', authenticate, attendancePolicyController.getByCompany);
router.get('/status/:status', authenticate, attendancePolicyController.getByStatus);
router.post('/', authenticate, attendancePolicyController.create);
router.get('/:id', authenticate, attendancePolicyController.getById);
router.patch('/:id', authenticate, attendancePolicyController.update);
router.delete('/:id', authenticate, attendancePolicyController.delete);
router.patch('/restore/:id', authenticate, attendancePolicyController.restore);
router.patch('/:id/activate', authenticate, attendancePolicyController.activate);

export default router;
