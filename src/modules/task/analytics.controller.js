import analyticsService from './analytics.service.js';
import productivityService from './productivity.service.js';
import searchService from './search.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const filters = req.query;
      const analytics = await analyticsService.getOverviewAnalytics(filters);
      return ApiResponse.success(res, 'Overview analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getProductivity(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const filters = req.query;
      const analytics = await analyticsService.getProductivityAnalytics(startDate, endDate, filters);
      return ApiResponse.success(res, 'Productivity analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getWorkload(req, res, next) {
    try {
      const filters = req.query;
      const analytics = await analyticsService.getWorkloadAnalytics(filters);
      return ApiResponse.success(res, 'Workload analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getTrends(req, res, next) {
    try {
      const { period = 'monthly', months = 6 } = req.query;
      const analytics = await analyticsService.getTrendsAnalytics(period, parseInt(months));
      return ApiResponse.success(res, 'Trends analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const analytics = await analyticsService.getLeaderboardAnalytics(parseInt(limit));
      return ApiResponse.success(res, 'Leaderboard analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getHeatmap(req, res, next) {
    try {
      const { type = 'productivity', startDate, endDate } = req.query;
      const analytics = await analyticsService.getHeatmapAnalytics(type, startDate, endDate);
      return ApiResponse.success(res, 'Heatmap analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getProjects(req, res, next) {
    try {
      const filters = req.query;
      const analytics = await analyticsService.getProjectsAnalytics(filters);
      return ApiResponse.success(res, 'Projects analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getDepartments(req, res, next) {
    try {
      const filters = req.query;
      const analytics = await analyticsService.getDepartmentsAnalytics(filters);
      return ApiResponse.success(res, 'Departments analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getTaskCompletion(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await analyticsService.getTaskCompletionAnalytics(startDate, endDate);
      return ApiResponse.success(res, 'Task completion analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getDelay(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await analyticsService.getDelayAnalytics(startDate, endDate);
      return ApiResponse.success(res, 'Delay analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getReview(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await analyticsService.getReviewAnalytics(startDate, endDate);
      return ApiResponse.success(res, 'Review analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getDependency(req, res, next) {
    try {
      const analytics = await analyticsService.getDependencyAnalytics();
      return ApiResponse.success(res, 'Dependency analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const { entityType, entityId, startDate, endDate } = req.query;
      const analytics = await analyticsService.getTimelineAnalytics(entityType, entityId, startDate, endDate);
      return ApiResponse.success(res, 'Timeline analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeProductivity(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;
      const productivity = await productivityService.calculateEmployeeProductivity(employeeId, startDate, endDate);
      return ApiResponse.success(res, 'Employee productivity calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentProductivity(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { startDate, endDate } = req.query;
      const productivity = await productivityService.calculateDepartmentProductivity(departmentId, startDate, endDate);
      return ApiResponse.success(res, 'Department productivity calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getProjectProductivity(req, res, next) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;
      const productivity = await productivityService.calculateProjectProductivity(projectId, startDate, endDate);
      return ApiResponse.success(res, 'Project productivity calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getAverageCompletionTime(req, res, next) {
    try {
      const filters = req.query;
      const productivity = await productivityService.calculateAverageCompletionTime(filters);
      return ApiResponse.success(res, 'Average completion time calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getAverageDelay(req, res, next) {
    try {
      const filters = req.query;
      const productivity = await productivityService.calculateAverageDelay(filters);
      return ApiResponse.success(res, 'Average delay calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getAverageReviewTime(req, res, next) {
    try {
      const filters = req.query;
      const productivity = await productivityService.calculateAverageReviewTime(filters);
      return ApiResponse.success(res, 'Average review time calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getTaskVelocity(req, res, next) {
    try {
      const { projectId } = req.params;
      const { sprintDays = 14 } = req.query;
      const productivity = await productivityService.calculateTaskVelocity(projectId, parseInt(sprintDays));
      return ApiResponse.success(res, 'Task velocity calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getBurnDown(req, res, next) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;
      const productivity = await productivityService.generateBurnDownData(projectId, startDate, endDate);
      return ApiResponse.success(res, 'Burn down data generated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getBurnUp(req, res, next) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;
      const productivity = await productivityService.generateBurnUpData(projectId, startDate, endDate);
      return ApiResponse.success(res, 'Burn up data generated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getWorkEfficiency(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;
      const productivity = await productivityService.calculateWorkEfficiency(employeeId, startDate, endDate);
      return ApiResponse.success(res, 'Work efficiency calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getResourceUtilization(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;
      const productivity = await productivityService.calculateResourceUtilization(employeeId, startDate, endDate);
      return ApiResponse.success(res, 'Resource utilization calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getTaskAging(req, res, next) {
    try {
      const filters = req.query;
      const productivity = await productivityService.calculateTaskAging(filters);
      return ApiResponse.success(res, 'Task aging calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async getCompletionTrends(req, res, next) {
    try {
      const { period = 'monthly', months = 12 } = req.query;
      const productivity = await productivityService.calculateCompletionTrends(period, parseInt(months));
      return ApiResponse.success(res, 'Completion trends calculated successfully', { productivity });
    } catch (error) {
      next(error);
    }
  }

  async globalSearch(req, res, next) {
    try {
      const { q } = req.query;
      const filters = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0
      };
      const search = await searchService.globalSearch(q, filters, options);
      return ApiResponse.success(res, 'Global search completed successfully', { search });
    } catch (error) {
      next(error);
    }
  }

  async searchTasks(req, res, next) {
    try {
      const { q } = req.query;
      const filters = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 }
      };
      const search = await searchService.searchTasks(q, filters, options);
      return ApiResponse.success(res, 'Task search completed successfully', { search });
    } catch (error) {
      next(error);
    }
  }

  async searchProjects(req, res, next) {
    try {
      const { q } = req.query;
      const filters = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 }
      };
      const search = await searchService.searchProjects(q, filters, options);
      return ApiResponse.success(res, 'Project search completed successfully', { search });
    } catch (error) {
      next(error);
    }
  }

  async searchEmployees(req, res, next) {
    try {
      const { q } = req.query;
      const filters = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { firstName: 1 }
      };
      const search = await searchService.searchEmployees(q, filters, options);
      return ApiResponse.success(res, 'Employee search completed successfully', { search });
    } catch (error) {
      next(error);
    }
  }

  async searchDepartments(req, res, next) {
    try {
      const { q } = req.query;
      const filters = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { name: 1 }
      };
      const search = await searchService.searchDepartments(q, filters, options);
      return ApiResponse.success(res, 'Department search completed successfully', { search });
    } catch (error) {
      next(error);
    }
  }

  async searchByLabels(req, res, next) {
    try {
      const { labels } = req.query;
      const filters = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 }
      };
      const search = await searchService.searchByLabels(labels.split(','), filters, options);
      return ApiResponse.success(res, 'Label search completed successfully', { search });
    } catch (error) {
      next(error);
    }
  }

  async searchByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const filters = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 }
      };
      const search = await searchService.searchByCategory(category, filters, options);
      return ApiResponse.success(res, 'Category search completed successfully', { search });
    } catch (error) {
      next(error);
    }
  }

  async searchByDateRange(req, res, next) {
    try {
      const { entityType, startDate, endDate } = req.query;
      const filters = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 }
      };
      const search = await searchService.searchByDateRange(entityType, startDate, endDate, filters, options);
      return ApiResponse.success(res, 'Date range search completed successfully', { search });
    } catch (error) {
      next(error);
    }
  }

  async advancedSearch(req, res, next) {
    try {
      const searchCriteria = req.body;
      const options = {
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0
      };
      const search = await searchService.advancedSearch(searchCriteria, options);
      return ApiResponse.success(res, 'Advanced search completed successfully', { search });
    } catch (error) {
      next(error);
    }
  }

  async saveSearchFilter(req, res, next) {
    try {
      const filterConfig = req.body;
      const saved = await searchService.saveSearchFilter(req.user.userId, filterConfig);
      return ApiResponse.success(res, 'Search filter saved successfully', { saved });
    } catch (error) {
      next(error);
    }
  }

  async getSavedSearchFilters(req, res, next) {
    try {
      const filters = await searchService.getSavedSearchFilters(req.user.userId);
      return ApiResponse.success(res, 'Saved search filters retrieved successfully', { filters });
    } catch (error) {
      next(error);
    }
  }

  async deleteSavedSearchFilter(req, res, next) {
    try {
      const { filterId } = req.params;
      const result = await searchService.deleteSavedSearchFilter(req.user.userId, filterId);
      return ApiResponse.success(res, 'Search filter deleted successfully', { result });
    } catch (error) {
      next(error);
    }
  }

  async getSearchSuggestions(req, res, next) {
    try {
      const { q } = req.query;
      const { entityType = 'all' } = req.query;
      const suggestions = await searchService.getSearchSuggestions(q, entityType);
      return ApiResponse.success(res, 'Search suggestions retrieved successfully', { suggestions });
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();
