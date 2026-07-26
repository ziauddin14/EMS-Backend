import express from 'express';
import analyticsController from './analytics.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requirePermission } from '../auth/permission.middleware.js';

const router = express.Router();

// Overview Analytics
router.get('/overview', authenticate, analyticsController.getOverview);
router.get('/productivity', authenticate, analyticsController.getProductivity);
router.get('/workload', authenticate, analyticsController.getWorkload);
router.get('/trends', authenticate, analyticsController.getTrends);
router.get('/leaderboard', authenticate, analyticsController.getLeaderboard);
router.get('/heatmap', authenticate, analyticsController.getHeatmap);
router.get('/projects', authenticate, analyticsController.getProjects);
router.get('/departments', authenticate, analyticsController.getDepartments);
router.get('/task-completion', authenticate, analyticsController.getTaskCompletion);
router.get('/delay', authenticate, analyticsController.getDelay);
router.get('/review', authenticate, analyticsController.getReview);
router.get('/dependency', authenticate, analyticsController.getDependency);
router.get('/timeline', authenticate, analyticsController.getTimeline);

// Productivity Analytics
router.get('/productivity/employee/:employeeId', authenticate, analyticsController.getEmployeeProductivity);
router.get('/productivity/department/:departmentId', authenticate, analyticsController.getDepartmentProductivity);
router.get('/productivity/project/:projectId', authenticate, analyticsController.getProjectProductivity);
router.get('/productivity/average-completion-time', authenticate, analyticsController.getAverageCompletionTime);
router.get('/productivity/average-delay', authenticate, analyticsController.getAverageDelay);
router.get('/productivity/average-review-time', authenticate, analyticsController.getAverageReviewTime);
router.get('/productivity/task-velocity/:projectId', authenticate, analyticsController.getTaskVelocity);
router.get('/productivity/burn-down/:projectId', authenticate, analyticsController.getBurnDown);
router.get('/productivity/burn-up/:projectId', authenticate, analyticsController.getBurnUp);
router.get('/productivity/work-efficiency/:employeeId', authenticate, analyticsController.getWorkEfficiency);
router.get('/productivity/resource-utilization/:employeeId', authenticate, analyticsController.getResourceUtilization);
router.get('/productivity/task-aging', authenticate, analyticsController.getTaskAging);
router.get('/productivity/completion-trends', authenticate, analyticsController.getCompletionTrends);

// Search Analytics
router.get('/search/global', authenticate, analyticsController.globalSearch);
router.get('/search/tasks', authenticate, analyticsController.searchTasks);
router.get('/search/projects', authenticate, analyticsController.searchProjects);
router.get('/search/employees', authenticate, analyticsController.searchEmployees);
router.get('/search/departments', authenticate, analyticsController.searchDepartments);
router.get('/search/labels', authenticate, analyticsController.searchByLabels);
router.get('/search/category/:category', authenticate, analyticsController.searchByCategory);
router.get('/search/date-range', authenticate, analyticsController.searchByDateRange);
router.post('/search/advanced', authenticate, analyticsController.advancedSearch);
router.post('/search/filters', authenticate, analyticsController.saveSearchFilter);
router.get('/search/filters', authenticate, analyticsController.getSavedSearchFilters);
router.delete('/search/filters/:filterId', authenticate, analyticsController.deleteSavedSearchFilter);
router.get('/search/suggestions', authenticate, analyticsController.getSearchSuggestions);

export default router;
