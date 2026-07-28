import warningService from './warning.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class WarningController {
  async create(req, res, next) {
    try {
      const warning = await warningService.createWarning(req.body);
      return ApiResponse.created(res, 'Warning created successfully', { warning });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const warning = await warningService.repository.findById(id);
      return ApiResponse.success(res, 'Warning retrieved successfully', { warning });
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
      const warnings = await warningService.repository.findAll(options);
      return ApiResponse.success(res, 'Warnings retrieved successfully', { warnings });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const warning = await warningService.updateWarning(id, req.body);
      return ApiResponse.success(res, 'Warning updated successfully', { warning });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await warningService.deleteWarning(id);
      return ApiResponse.success(res, 'Warning deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async issue(req, res, next) {
    try {
      const warning = await warningService.issueWarning(req.body);
      return ApiResponse.created(res, 'Warning issued successfully', { warning });
    } catch (error) {
      next(error);
    }
  }

  async resolve(req, res, next) {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      const warning = await warningService.resolveWarning(id, req.user.userId, resolutionNotes);
      return ApiResponse.success(res, 'Warning resolved successfully', { warning });
    } catch (error) {
      next(error);
    }
  }

  async appeal(req, res, next) {
    try {
      const { id } = req.params;
      const { appealReason } = req.body;
      const warning = await warningService.appealWarning(id, appealReason);
      return ApiResponse.success(res, 'Warning appealed successfully', { warning });
    } catch (error) {
      next(error);
    }
  }

  async reviewAppeal(req, res, next) {
    try {
      const { id } = req.params;
      const { decision, decisionNotes } = req.body;
      const warning = await warningService.reviewAppeal(id, req.user.userId, decision, decisionNotes);
      return ApiResponse.success(res, 'Appeal reviewed successfully', { warning });
    } catch (error) {
      next(error);
    }
  }

  async escalate(req, res, next) {
    try {
      const { id } = req.params;
      const { escalatedTo, escalationReason } = req.body;
      const warning = await warningService.escalateWarning(id, escalatedTo, escalationReason);
      return ApiResponse.success(res, 'Warning escalated successfully', { warning });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeWarnings(req, res, next) {
    try {
      const { employeeId } = req.params;
      const options = req.query;
      const warnings = await warningService.getEmployeeWarnings(employeeId, options);
      return ApiResponse.success(res, 'Employee warnings retrieved successfully', { warnings });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentWarnings(req, res, next) {
    try {
      const { departmentId } = req.params;
      const options = req.query;
      const warnings = await warningService.getDepartmentWarnings(departmentId, options);
      return ApiResponse.success(res, 'Department warnings retrieved successfully', { warnings });
    } catch (error) {
      next(error);
    }
  }

  async getUnresolvedWarnings(req, res, next) {
    try {
      const options = req.query;
      const warnings = await warningService.getUnresolvedWarningsData(options);
      return ApiResponse.success(res, 'Unresolved warnings retrieved successfully', { warnings });
    } catch (error) {
      next(error);
    }
  }

  async getPendingAppeals(req, res, next) {
    try {
      const options = req.query;
      const warnings = await warningService.getPendingAppealsData(options);
      return ApiResponse.success(res, 'Pending appeals retrieved successfully', { warnings });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;
      const dashboard = await warningService.getDashboard(employeeId, year);
      return ApiResponse.success(res, 'Dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentDashboard(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { year } = req.query;
      const dashboard = await warningService.getDepartmentDashboard(departmentId, year);
      return ApiResponse.success(res, 'Department dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req, res, next) {
    try {
      const { managerId } = req.params;
      const { year } = req.query;
      const dashboard = await warningService.getManagerDashboard(managerId, year);
      return ApiResponse.success(res, 'Manager dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req, res, next) {
    try {
      const { reportType } = req.params;
      const report = await warningService.generateReport(reportType, req.query);
      return ApiResponse.success(res, 'Report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;
      const analytics = await warningService.getAnalytics(employeeId, year);
      return ApiResponse.success(res, 'Analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }
}

const warningController = new WarningController();
export default warningController;
