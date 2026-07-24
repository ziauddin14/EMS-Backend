import express from 'express';
import designationController from './designation.controller.js';

const router = express.Router();

router.post('/', designationController.create);
router.get('/', designationController.getAll);
router.get('/search', designationController.search);
router.get('/filter', designationController.filter);
router.get('/statistics', designationController.getStatistics);
router.get('/active', designationController.getActive);
router.get('/management', designationController.getManagement);
router.get('/department/:departmentId', designationController.getByDepartment);
router.get('/level/:level', designationController.getByHierarchyLevel);
router.get('/grade/:grade', designationController.getByJobGrade);
router.get('/status/:status', designationController.getByStatus);
router.get('/range/:minLevel/:maxLevel', designationController.getByHierarchyRange);
router.get('/code/:code', designationController.getByCode);
router.get('/:id', designationController.getById);
router.patch('/:id', designationController.update);
router.patch('/:id/status', designationController.updateStatus);
router.patch('/:id/department', designationController.updateDepartment);
router.patch('/:id/hierarchy', designationController.updateHierarchy);
router.patch('/:id/salary', designationController.updateSalaryRange);
router.delete('/:id', designationController.delete);
router.patch('/restore/:id', designationController.restore);

export default router;
