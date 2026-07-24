import searchService from './search.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class SearchController {
  async search(req, res, next) {
    try {
      const { q } = req.query;
      const result = await searchService.searchEmployees(q, req.query);
      return ApiResponse.success(res, 'Search completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async searchByName(req, res, next) {
    try {
      const { q } = req.query;
      const result = await searchService.searchByName(q, req.query);
      return ApiResponse.success(res, 'Name search completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async filter(req, res, next) {
    try {
      const result = await searchService.filterEmployees(req.query, req.query);
      return ApiResponse.success(res, 'Filter applied successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async paginate(req, res, next) {
    try {
      const result = await searchService.getPaginatedEmployees(req.query, req.query);
      return ApiResponse.success(res, 'Pagination completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async sort(req, res, next) {
    try {
      const { sortBy, sortOrder } = req.query;
      const result = await searchService.getSortedEmployees(sortBy, sortOrder, req.query);
      return ApiResponse.success(res, 'Sorting completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async bulkActivate(req, res, next) {
    try {
      const { employeeIds } = req.body;
      const result = await searchService.bulkActivate(employeeIds, req.user.userId);
      return ApiResponse.success(res, 'Bulk activation completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async bulkDeactivate(req, res, next) {
    try {
      const { employeeIds } = req.body;
      const result = await searchService.bulkDeactivate(employeeIds, req.user.userId);
      return ApiResponse.success(res, 'Bulk deactivation completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req, res, next) {
    try {
      const { employeeIds } = req.body;
      const result = await searchService.bulkDelete(employeeIds, req.user.userId);
      return ApiResponse.success(res, 'Bulk deletion completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async bulkRestore(req, res, next) {
    try {
      const { employeeIds } = req.body;
      const result = await searchService.bulkRestore(employeeIds);
      return ApiResponse.success(res, 'Bulk restoration completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async bulkChangeDepartment(req, res, next) {
    try {
      const { employeeIds, newDepartmentId } = req.body;
      const result = await searchService.bulkChangeDepartment(employeeIds, newDepartmentId, req.user.userId);
      return ApiResponse.success(res, 'Bulk department change completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async bulkChangeDesignation(req, res, next) {
    try {
      const { employeeIds, newDesignationId } = req.body;
      const result = await searchService.bulkChangeDesignation(employeeIds, newDesignationId, req.user.userId);
      return ApiResponse.success(res, 'Bulk designation change completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const analytics = await searchService.getAnalytics();
      return ApiResponse.success(res, 'Analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardData(req, res, next) {
    try {
      const dashboardData = await searchService.getDashboardData();
      return ApiResponse.success(res, 'Dashboard data retrieved successfully', dashboardData);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentDashboardData(req, res, next) {
    try {
      const { departmentId } = req.params;
      const dashboardData = await searchService.getDepartmentDashboardData(departmentId);
      return ApiResponse.success(res, 'Department dashboard data retrieved successfully', dashboardData);
    } catch (error) {
      next(error);
    }
  }

  async export(req, res, next) {
    try {
      const { format } = req.query;
      const result = await searchService.exportEmployees(req.query, format);
      return ApiResponse.success(res, 'Export completed successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();
