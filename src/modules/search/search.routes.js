import express from 'express';
import searchController from './search.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.get('/search', authenticate, searchController.search);
router.get('/search-by-name', authenticate, searchController.searchByName);
router.get('/filter', authenticate, searchController.filter);
router.get('/paginate', authenticate, searchController.paginate);
router.get('/sort', authenticate, searchController.sort);
router.post('/bulk/activate', authenticate, searchController.bulkActivate);
router.post('/bulk/deactivate', authenticate, searchController.bulkDeactivate);
router.post('/bulk/delete', authenticate, searchController.bulkDelete);
router.post('/bulk/restore', authenticate, searchController.bulkRestore);
router.post('/bulk/change-department', authenticate, searchController.bulkChangeDepartment);
router.post('/bulk/change-designation', authenticate, searchController.bulkChangeDesignation);
router.get('/analytics', authenticate, searchController.getAnalytics);
router.get('/dashboard', authenticate, searchController.getDashboardData);
router.get('/dashboard/department/:departmentId', authenticate, searchController.getDepartmentDashboardData);
router.get('/export', authenticate, searchController.export);

export default router;
