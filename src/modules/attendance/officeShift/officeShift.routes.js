import express from 'express';
import officeShiftController from './officeShift.controller.js';
import { authenticate } from '../../auth/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, officeShiftController.getAll);
router.get('/active', authenticate, officeShiftController.getActive);
router.get('/default', authenticate, officeShiftController.getDefault);
router.get('/statistics', authenticate, officeShiftController.getStatistics);
router.get('/code/:code', authenticate, officeShiftController.getByCode);
router.get('/status/:status', authenticate, officeShiftController.getByStatus);
router.post('/', authenticate, officeShiftController.create);
router.get('/:id', authenticate, officeShiftController.getById);
router.patch('/:id', authenticate, officeShiftController.update);
router.delete('/:id', authenticate, officeShiftController.delete);
router.patch('/restore/:id', authenticate, officeShiftController.restore);
router.patch('/:id/set-default', authenticate, officeShiftController.setAsDefault);

export default router;
