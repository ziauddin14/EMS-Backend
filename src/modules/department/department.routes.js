import express from 'express';
import departmentController from './department.controller.js';

const router = express.Router();

router.post('/', departmentController.create);
router.get('/', departmentController.getAll);
router.get('/search', departmentController.search);
router.get('/filter', departmentController.filter);
router.get('/tree', departmentController.getTree);
router.get('/statistics', departmentController.getStatistics);
router.get('/root', departmentController.getRootDepartments);
router.get('/active', departmentController.getActiveDepartments);
router.get('/status/:status', departmentController.getByStatus);
router.get('/parent/:parentId', departmentController.getChildDepartments);
router.get('/code/:code', departmentController.getByCode);
router.get('/:id', departmentController.getById);
router.patch('/:id', departmentController.update);
router.patch('/:id/status', departmentController.updateStatus);
router.patch('/:id/head', departmentController.updateHead);
router.patch('/:id/parent', departmentController.updateParent);
router.delete('/:id', departmentController.delete);
router.patch('/restore/:id', departmentController.restore);

export default router;
