import express from 'express';
import hierarchyController from './hierarchy.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.patch('/assign-manager/:employeeId', authenticate, hierarchyController.assignManager);
router.patch('/change-manager/:employeeId', authenticate, hierarchyController.changeManager);
router.patch('/assign-secondary-manager/:employeeId', authenticate, hierarchyController.assignSecondaryManager);
router.patch('/set-department-head/:employeeId', authenticate, hierarchyController.setDepartmentHead);
router.patch('/set-team-lead/:employeeId', authenticate, hierarchyController.setTeamLead);
router.get('/organization-tree', authenticate, hierarchyController.getOrganizationTree);
router.get('/hierarchy/:employeeId', authenticate, hierarchyController.getEmployeeHierarchy);
router.get('/direct-reports/:employeeId', authenticate, hierarchyController.getDirectReports);
router.get('/indirect-reports/:employeeId', authenticate, hierarchyController.getIndirectReports);
router.get('/subordinates/:employeeId', authenticate, hierarchyController.getAllSubordinates);
router.get('/department/:departmentId', authenticate, hierarchyController.getDepartmentHierarchy);
router.get('/reporting-chain/:employeeId', authenticate, hierarchyController.getReportingChain);
router.get('/department-heads', authenticate, hierarchyController.getDepartmentHeads);
router.get('/team-leads', authenticate, hierarchyController.getTeamLeads);
router.get('/level/:level', authenticate, hierarchyController.getByOrganizationLevel);
router.get('/statistics', authenticate, hierarchyController.getStatistics);
router.post('/validate-change/:employeeId', authenticate, hierarchyController.validateHierarchyChange);
router.get('/approval-chain/:employeeId', authenticate, hierarchyController.getApprovalChain);

export default router;
