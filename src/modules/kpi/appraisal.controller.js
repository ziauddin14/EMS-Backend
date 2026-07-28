import appraisalService from './appraisal.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class AppraisalController {
  async create(req, res, next) {
    try {
      const appraisal = await appraisalService.createAppraisal(req.body);
      return ApiResponse.created(res, 'Appraisal created successfully', { appraisal });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const appraisal = await appraisalService.repository.findById(id);
      return ApiResponse.success(res, 'Appraisal retrieved successfully', { appraisal });
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
      const appraisals = await appraisalService.repository.findAll(options);
      return ApiResponse.success(res, 'Appraisals retrieved successfully', { appraisals });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const appraisal = await appraisalService.updateAppraisal(id, req.body);
      return ApiResponse.success(res, 'Appraisal updated successfully', { appraisal });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await appraisalService.deleteAppraisal(id);
      return ApiResponse.success(res, 'Appraisal deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async submit(req, res, next) {
    try {
      const { id } = req.params;
      const appraisal = await appraisalService.submitAppraisal(id);
      return ApiResponse.success(res, 'Appraisal submitted successfully', { appraisal });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const appraisal = await appraisalService.approveAppraisal(id, req.user.userId);
      return ApiResponse.success(res, 'Appraisal approved successfully', { appraisal });
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const appraisal = await appraisalService.rejectAppraisal(id, req.user.userId, reason);
      return ApiResponse.success(res, 'Appraisal rejected successfully', { appraisal });
    } catch (error) {
      next(error);
    }
  }

  async finalize(req, res, next) {
    try {
      const { id } = req.params;
      const appraisal = await appraisalService.finalizeAppraisal(id);
      return ApiResponse.success(res, 'Appraisal finalized successfully', { appraisal });
    } catch (error) {
      next(error);
    }
  }

  async managerReview(req, res, next) {
    try {
      const { id } = req.params;
      const appraisal = await appraisalService.managerReview(id, req.user.userId, req.body);
      return ApiResponse.success(res, 'Manager review completed successfully', { appraisal });
    } catch (error) {
      next(error);
    }
  }

  async hrReview(req, res, next) {
    try {
      const { id } = req.params;
      const appraisal = await appraisalService.hrReview(id, req.user.userId, req.body);
      return ApiResponse.success(res, 'HR review completed successfully', { appraisal });
    } catch (error) {
      next(error);
    }
  }

  async addRecommendation(req, res, next) {
    try {
      const { id } = req.params;
      const appraisal = await appraisalService.addRecommendation(id, req.body);
      return ApiResponse.success(res, 'Recommendation added successfully', { appraisal });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeAppraisals(req, res, next) {
    try {
      const { employeeId } = req.params;
      const options = req.query;
      const appraisals = await appraisalService.getEmployeeAppraisals(employeeId, options);
      return ApiResponse.success(res, 'Employee appraisals retrieved successfully', { appraisals });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentAppraisals(req, res, next) {
    try {
      const { departmentId } = req.params;
      const options = req.query;
      const appraisals = await appraisalService.getDepartmentAppraisals(departmentId, options);
      return ApiResponse.success(res, 'Department appraisals retrieved successfully', { appraisals });
    } catch (error) {
      next(error);
    }
  }

  async getManagerAppraisals(req, res, next) {
    try {
      const { managerId } = req.params;
      const options = req.query;
      const appraisals = await appraisalService.getManagerAppraisals(managerId, options);
      return ApiResponse.success(res, 'Manager appraisals retrieved successfully', { appraisals });
    } catch (error) {
      next(error);
    }
  }

  async getTopPerformers(req, res, next) {
    try {
      const { year } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const performers = await appraisalService.getTopPerformers(year, limit);
      return ApiResponse.success(res, 'Top performers retrieved successfully', { performers });
    } catch (error) {
      next(error);
    }
  }

  async getLowPerformers(req, res, next) {
    try {
      const { year } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const performers = await appraisalService.getLowPerformers(year, limit);
      return ApiResponse.success(res, 'Low performers retrieved successfully', { performers });
    } catch (error) {
      next(error);
    }
  }

  async getPromotionEligible(req, res, next) {
    try {
      const { year } = req.params;
      const appraisals = await appraisalService.getPromotionEligible(year);
      return ApiResponse.success(res, 'Promotion eligible employees retrieved successfully', { appraisals });
    } catch (error) {
      next(error);
    }
  }

  async getIncrementEligible(req, res, next) {
    try {
      const { year } = req.params;
      const appraisals = await appraisalService.getIncrementEligible(year);
      return ApiResponse.success(res, 'Increment eligible employees retrieved successfully', { appraisals });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year, periodType } = req.query;
      const dashboard = await appraisalService.getDashboard(employeeId, year, periodType);
      return ApiResponse.success(res, 'Dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentDashboard(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { year, periodType } = req.query;
      const dashboard = await appraisalService.getDepartmentDashboard(departmentId, year, periodType);
      return ApiResponse.success(res, 'Department dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req, res, next) {
    try {
      const { managerId } = req.params;
      const { year, periodType } = req.query;
      const dashboard = await appraisalService.getManagerDashboard(managerId, year, periodType);
      return ApiResponse.success(res, 'Manager dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req, res, next) {
    try {
      const { reportType } = req.params;
      const report = await appraisalService.generateReport(reportType, req.query);
      return ApiResponse.success(res, 'Report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year, periodType } = req.query;
      const analytics = await appraisalService.getAnalytics(employeeId, year, periodType);
      return ApiResponse.success(res, 'Analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }
}

const appraisalController = new AppraisalController();
export default appraisalController;
