import dashboardService from './dashboard.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class DashboardController {
  async getEmployeeDashboard(req, res, next) {
    try {
      const { employeeId } = req.params;
      const dashboard = await dashboardService.getEmployeeDashboard(employeeId);
      return ApiResponse.success(res, 'Employee dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getTeamLeadDashboard(req, res, next) {
    try {
      const { teamLeadId } = req.params;
      const dashboard = await dashboardService.getTeamLeadDashboard(teamLeadId);
      return ApiResponse.success(res, 'Team lead dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getProjectManagerDashboard(req, res, next) {
    try {
      const { projectManagerId } = req.params;
      const dashboard = await dashboardService.getProjectManagerDashboard(projectManagerId);
      return ApiResponse.success(res, 'Project manager dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getHRDashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getHRDashboard();
      return ApiResponse.success(res, 'HR dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getCEODashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getCEODashboard();
      return ApiResponse.success(res, 'CEO dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
