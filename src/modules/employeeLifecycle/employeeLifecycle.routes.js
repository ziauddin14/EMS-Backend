import express from 'express';
import employeeLifecycleController from './employeeLifecycle.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.patch('/confirm/:id', authenticate, employeeLifecycleController.confirm);
router.patch('/probation/:id', authenticate, employeeLifecycleController.startProbation);
router.patch('/probation-complete/:id', authenticate, employeeLifecycleController.completeProbation);
router.patch('/promote/:id', authenticate, employeeLifecycleController.promote);
router.patch('/transfer/:id', authenticate, employeeLifecycleController.transfer);
router.patch('/suspend/:id', authenticate, employeeLifecycleController.suspend);
router.patch('/resume/:id', authenticate, employeeLifecycleController.resume);
router.patch('/resign/:id', authenticate, employeeLifecycleController.resign);
router.patch('/notice/:id', authenticate, employeeLifecycleController.startNotice);
router.patch('/exit/:id', authenticate, employeeLifecycleController.completeExit);
router.patch('/terminate/:id', authenticate, employeeLifecycleController.terminate);
router.patch('/rehire/:id', authenticate, employeeLifecycleController.rehire);
router.get('/history/:employeeId', authenticate, employeeLifecycleController.getHistory);
router.get('/status/:employeeId', authenticate, employeeLifecycleController.getStatus);
router.get('/statistics', authenticate, employeeLifecycleController.getStatistics);

export default router;
