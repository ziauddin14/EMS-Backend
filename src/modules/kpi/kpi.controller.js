import kpiService from './kpi.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class KPIController {
  async create(req, res, next) {
    try {
      const kpi = await kpiService.createKPI(req.body);
      return ApiResponse.created(res, 'KPI created successfully', { kpi });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const kpi = await kpiService.repository.findById(id);
      return ApiResponse.success(res, 'KPI retrieved successfully', { kpi });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const options = {
        filter: req.query,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 },
        limit: parseInt(req.query.limit) || 100,
        skip: parseInt(req.query.skip) || 0
      };
      const kpis = await kpiService.repository.findAll(options);
      return ApiResponse.success(res, 'KPIs retrieved successfully', { kpis });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const kpi = await kpiService.updateKPI(id, req.body);
      return ApiResponse.success(res, 'KPI updated successfully', { kpi });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await kpiService.deleteKPI(id);
      return ApiResponse.success(res, 'KPI deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const kpi = await kpiService.approveKPI(id, req.user.userId);
      return ApiResponse.success(res, 'KPI approved successfully', { kpi });
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const kpi = await kpiService.rejectKPI(id, req.user.userId, reason);
      return ApiResponse.success(res, 'KPI rejected successfully', { kpi });
    } catch (error) {
      next(error);
    }
  }

  async review(req, res, next) {
    try {
      const { id } = req.params;
      const kpi = await kpiService.reviewKPI(id, req.user.userId);
      return ApiResponse.success(res, 'KPI reviewed successfully', { kpi });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeKPIs(req, res, next) {
    try {
      const { employeeId } = req.params;
      const options = req.query;
      const kpis = await kpiService.getEmployeeKPIs(employeeId, options);
      return ApiResponse.success(res, 'Employee KPIs retrieved successfully', { kpis });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentKPIs(req, res, next) {
    try {
      const { departmentId } = req.params;
      const options = req.query;
      const kpis = await kpiService.getDepartmentKPIs(departmentId, options);
      return ApiResponse.success(res, 'Department KPIs retrieved successfully', { kpis });
    } catch (error) {
      next(error);
    }
  }

  async getManagerKPIs(req, res, next) {
    try {
      const { managerId } = req.params;
      const options = req.query;
      const kpis = await kpiService.getManagerKPIs(managerId, options);
      return ApiResponse.success(res, 'Manager KPIs retrieved successfully', { kpis });
    } catch (error) {
      next(error);
    }
  }

  async getTopPerformers(req, res, next) {
    try {
      const { year } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const performers = await kpiService.getTopPerformers(year, limit);
      return ApiResponse.success(res, 'Top performers retrieved successfully', { performers });
    } catch (error) {
      next(error);
    }
  }

  async getLowPerformers(req, res, next) {
    try {
      const { year } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const performers = await kpiService.getLowPerformers(year, limit);
      return ApiResponse.success(res, 'Low performers retrieved successfully', { performers });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year, periodType } = req.query;
      const dashboard = await kpiService.getDashboard(employeeId, year, periodType);
      return ApiResponse.success(res, 'Dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentDashboard(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { year, periodType } = req.query;
      const dashboard = await kpiService.getDepartmentDashboard(departmentId, year, periodType);
      return ApiResponse.success(res, 'Department dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req, res, next) {
    try {
      const { managerId } = req.params;
      const { year, periodType } = req.query;
      const dashboard = await kpiService.getManagerDashboard(managerId, year, periodType);
      return ApiResponse.success(res, 'Manager dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req, res, next) {
    try {
      const { reportType } = req.params;
      const report = await kpiService.generateReport(reportType, req.query);
      return ApiResponse.success(res, 'Report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year, periodType } = req.query;
      const analytics = await kpiService.getAnalytics(employeeId, year, periodType);
      return ApiResponse.success(res, 'Analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }
}

const kpiController = new KPIController();
export default kpiController;
