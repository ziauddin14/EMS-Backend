import performanceService from './performance.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class PerformanceController {
  async create(req, res, next) {
    try {
      const performance = await performanceService.createPerformance(req.body);
      return ApiResponse.created(res, 'Performance created successfully', { performance });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const performance = await performanceService.repository.findById(id);
      return ApiResponse.success(res, 'Performance retrieved successfully', { performance });
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
      const performances = await performanceService.repository.findAll(options);
      return ApiResponse.success(res, 'Performances retrieved successfully', { performances });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const performance = await performanceService.updatePerformance(id, req.body);
      return ApiResponse.success(res, 'Performance updated successfully', { performance });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await performanceService.deletePerformance(id);
      return ApiResponse.success(res, 'Performance deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const performance = await performanceService.approvePerformance(id, req.user.userId);
      return ApiResponse.success(res, 'Performance approved successfully', { performance });
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const performance = await performanceService.rejectPerformance(id, req.user.userId, reason);
      return ApiResponse.success(res, 'Performance rejected successfully', { performance });
    } catch (error) {
      next(error);
    }
  }

  async review(req, res, next) {
    try {
      const { id } = req.params;
      const performance = await performanceService.reviewPerformance(id, req.user.userId);
      return ApiResponse.success(res, 'Performance reviewed successfully', { performance });
    } catch (error) {
      next(error);
    }
  }

  async setPromotionEligible(req, res, next) {
    try {
      const { id } = req.params;
      const { eligible } = req.body;
      const performance = await performanceService.setPromotionEligible(id, eligible);
      return ApiResponse.success(res, 'Promotion eligibility updated successfully', { performance });
    } catch (error) {
      next(error);
    }
  }

  async setBonusEligible(req, res, next) {
    try {
      const { id } = req.params;
      const { eligible } = req.body;
      const performance = await performanceService.setBonusEligible(id, eligible);
      return ApiResponse.success(res, 'Bonus eligibility updated successfully', { performance });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeePerformance(req, res, next) {
    try {
      const { employeeId } = req.params;
      const options = req.query;
      const performances = await performanceService.getEmployeePerformance(employeeId, options);
      return ApiResponse.success(res, 'Employee performance retrieved successfully', { performances });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentPerformance(req, res, next) {
    try {
      const { departmentId } = req.params;
      const options = req.query;
      const performances = await performanceService.getDepartmentPerformance(departmentId, options);
      return ApiResponse.success(res, 'Department performance retrieved successfully', { performances });
    } catch (error) {
      next(error);
    }
  }

  async getManagerPerformance(req, res, next) {
    try {
      const { managerId } = req.params;
      const options = req.query;
      const performances = await performanceService.getManagerPerformance(managerId, options);
      return ApiResponse.success(res, 'Manager performance retrieved successfully', { performances });
    } catch (error) {
      next(error);
    }
  }

  async getTopPerformers(req, res, next) {
    try {
      const { year } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const performers = await performanceService.getTopPerformers(year, limit);
      return ApiResponse.success(res, 'Top performers retrieved successfully', { performers });
    } catch (error) {
      next(error);
    }
  }

  async getLowPerformers(req, res, next) {
    try {
      const { year } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const performers = await performanceService.getLowPerformers(year, limit);
      return ApiResponse.success(res, 'Low performers retrieved successfully', { performers });
    } catch (error) {
      next(error);
    }
  }

  async getPromotionEligible(req, res, next) {
    try {
      const { year } = req.params;
      const performers = await performanceService.getPromotionEligible(year);
      return ApiResponse.success(res, 'Promotion eligible employees retrieved successfully', { performers });
    } catch (error) {
      next(error);
    }
  }

  async getBonusEligible(req, res, next) {
    try {
      const { year } = req.params;
      const performers = await performanceService.getBonusEligible(year);
      return ApiResponse.success(res, 'Bonus eligible employees retrieved successfully', { performers });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year, periodType } = req.query;
      const dashboard = await performanceService.getDashboard(employeeId, year, periodType);
      return ApiResponse.success(res, 'Dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentDashboard(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { year, periodType } = req.query;
      const dashboard = await performanceService.getDepartmentDashboard(departmentId, year, periodType);
      return ApiResponse.success(res, 'Department dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req, res, next) {
    try {
      const { managerId } = req.params;
      const { year, periodType } = req.query;
      const dashboard = await performanceService.getManagerDashboard(managerId, year, periodType);
      return ApiResponse.success(res, 'Manager dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req, res, next) {
    try {
      const { reportType } = req.params;
      const report = await performanceService.generateReport(reportType, req.query);
      return ApiResponse.success(res, 'Report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year, periodType } = req.query;
      const analytics = await performanceService.getAnalytics(employeeId, year, periodType);
      return ApiResponse.success(res, 'Analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }
}

const performanceController = new PerformanceController();
export default performanceController;
