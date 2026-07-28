import dashboardService from './dashboard.service.js';
import { ApiResponse } from '../../core/responses/index.js';
import { KPI_PERMISSIONS, PERFORMANCE_PERMISSIONS, GOAL_PERMISSIONS, APPRAISAL_PERMISSIONS, REWARD_PERMISSIONS, WARNING_PERMISSIONS } from './kpi.permissions.js';

class DashboardController {
  async getEmployeeDashboard(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year, periodType } = req.query;
      
      // Ownership validation - employee can only view their own dashboard unless they have permission
      if (req.user.userId !== employeeId && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view this dashboard');
      }
      
      const dashboard = await dashboardService.getEmployeeDashboard(employeeId, year, periodType);
      return ApiResponse.success(res, 'Employee dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req, res, next) {
    try {
      const { managerId } = req.params;
      const { year, periodType } = req.query;
      
      // Ownership validation - manager can only view their own team dashboard unless they have permission
      if (req.user.userId !== managerId && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view this dashboard');
      }
      
      const dashboard = await dashboardService.getManagerDashboard(managerId, year, periodType);
      return ApiResponse.success(res, 'Manager dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getHRDashboard(req, res, next) {
    try {
      const { year, periodType } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_HR) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view HR dashboard');
      }
      
      const dashboard = await dashboardService.getHRDashboard(year, periodType);
      return ApiResponse.success(res, 'HR dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getCEODashboard(req, res, next) {
    try {
      const { year, periodType } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_EXECUTIVE) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view CEO dashboard');
      }
      
      const dashboard = await dashboardService.getCEODashboard(year, periodType);
      return ApiResponse.success(res, 'CEO dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getPerformanceHeatmap(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_ANALYTICS) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view performance heatmap');
      }
      
      const heatmap = await dashboardService.getPerformanceHeatmap(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Performance heatmap retrieved successfully', { heatmap });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentRankings(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_ANALYTICS) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view department rankings');
      }
      
      const rankings = await dashboardService.getDepartmentRankings(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Department rankings retrieved successfully', { rankings });
    } catch (error) {
      next(error);
    }
  }

  async getChartData(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_ANALYTICS) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view chart data');
      }
      
      const chartData = await dashboardService.getChartData(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Chart data retrieved successfully', { chartData });
    } catch (error) {
      next(error);
    }
  }

  async getExecutiveSummary(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_EXECUTIVE) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view executive summary');
      }
      
      const summary = await dashboardService.generateExecutiveSummary(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Executive summary retrieved successfully', { summary });
    } catch (error) {
      next(error);
    }
  }

  async getPromotionPipeline(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_HR) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view promotion pipeline');
      }
      
      const pipeline = await dashboardService.getPromotionPipeline(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Promotion pipeline retrieved successfully', { pipeline });
    } catch (error) {
      next(error);
    }
  }

  async getTrainingPipeline(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_HR) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view training pipeline');
      }
      
      const pipeline = await dashboardService.getTrainingPipeline(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Training pipeline retrieved successfully', { pipeline });
    } catch (error) {
      next(error);
    }
  }

  async getBonusPipeline(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_HR) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view bonus pipeline');
      }
      
      const pipeline = await dashboardService.getBonusPipeline(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Bonus pipeline retrieved successfully', { pipeline });
    } catch (error) {
      next(error);
    }
  }

  async getPerformanceTrend(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_ANALYTICS) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view performance trend');
      }
      
      const trend = await dashboardService.getPerformanceTrend(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Performance trend retrieved successfully', { trend });
    } catch (error) {
      next(error);
    }
  }

  async getProductivityTrend(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_ANALYTICS) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view productivity trend');
      }
      
      const trend = await dashboardService.getProductivityTrend(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Productivity trend retrieved successfully', { trend });
    } catch (error) {
      next(error);
    }
  }

  async getPerformanceDistribution(req, res, next) {
    try {
      const { year } = req.query;
      
      // Permission validation
      if (!req.user.permissions.includes(KPI_PERMISSIONS.KPI_ANALYTICS) && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view performance distribution');
      }
      
      const distribution = await dashboardService.getPerformanceDistribution(year || new Date().getFullYear());
      return ApiResponse.success(res, 'Performance distribution retrieved successfully', { distribution });
    } catch (error) {
      next(error);
    }
  }

  async getTeamMonthlyTrend(req, res, next) {
    try {
      const { managerId } = req.params;
      const { year } = req.query;
      
      // Ownership validation
      if (req.user.userId !== managerId && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view team trends');
      }
      
      const trend = await dashboardService.getTeamMonthlyTrend(managerId, year || new Date().getFullYear());
      return ApiResponse.success(res, 'Team monthly trend retrieved successfully', { trend });
    } catch (error) {
      next(error);
    }
  }

  async getTeamQuarterlyTrend(req, res, next) {
    try {
      const { managerId } = req.params;
      const { year } = req.query;
      
      // Ownership validation
      if (req.user.userId !== managerId && !req.user.permissions.includes(KPI_PERMISSIONS.KPI_VIEW_ALL)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view team trends');
      }
      
      const trend = await dashboardService.getTeamQuarterlyTrend(managerId, year || new Date().getFullYear());
      return ApiResponse.success(res, 'Team quarterly trend retrieved successfully', { trend });
    } catch (error) {
      next(error);
    }
  }
}

const dashboardController = new DashboardController();
export default dashboardController;
