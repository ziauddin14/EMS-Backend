import dashboardService from './dashboard.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class DashboardController {
  async getCEODashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getCEODashboard(req.query);
      return ApiResponse.success(res, 'CEO dashboard data retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getHRDashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getHRDashboard(req.query);
      return ApiResponse.success(res, 'HR dashboard data retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req, res, next) {
    try {
      const { managerId } = req.params;
      const dashboard = await dashboardService.getManagerDashboard(managerId, req.query);
      return ApiResponse.success(res, 'Manager dashboard data retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentDashboard(req, res, next) {
    try {
      const { departmentId } = req.params;
      const dashboard = await dashboardService.getDepartmentDashboard(departmentId, req.query);
      return ApiResponse.success(res, 'Department dashboard data retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeDashboard(req, res, next) {
    try {
      const { employeeId } = req.params;
      const dashboard = await dashboardService.getEmployeeDashboard(employeeId);
      return ApiResponse.success(res, 'Employee dashboard data retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getTeamLeadDashboard(req, res, next) {
    try {
      const { teamLeadId } = req.params;
      const dashboard = await dashboardService.getTeamLeadDashboard(teamLeadId, req.query);
      return ApiResponse.success(res, 'Team lead dashboard data retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await dashboardService.getStatistics(req.query);
      return ApiResponse.success(res, 'Statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async getChartData(req, res, next) {
    try {
      const { chartType } = req.params;
      const chartData = await dashboardService.getChartData(chartType, req.query);
      return ApiResponse.success(res, 'Chart data retrieved successfully', chartData);
    } catch (error) {
      next(error);
    }
  }

  async getFilteredDashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getFilteredDashboard(req.query);
      return ApiResponse.success(res, 'Filtered dashboard data retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardByRole(req, res, next) {
    try {
      const { role } = req.params;
      const dashboard = await dashboardService.getDashboardByRole(role, req.user.userId, req.query);
      return ApiResponse.success(res, 'Dashboard data retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getOrganizationOverview(req, res, next) {
    try {
      const overview = await dashboardService.getOrganizationOverview();
      return ApiResponse.success(res, 'Organization overview retrieved successfully', { overview });
    } catch (error) {
      next(error);
    }
  }

  async getQuickStatistics(req, res, next) {
    try {
      const statistics = await dashboardService.getQuickStatistics();
      return ApiResponse.success(res, 'Quick statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
