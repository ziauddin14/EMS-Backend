import goalService from './goal.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class GoalController {
  async create(req, res, next) {
    try {
      const goal = await goalService.createGoal(req.body);
      return ApiResponse.created(res, 'Goal created successfully', { goal });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const goal = await goalService.repository.findById(id);
      return ApiResponse.success(res, 'Goal retrieved successfully', { goal });
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
      const goals = await goalService.repository.findAll(options);
      return ApiResponse.success(res, 'Goals retrieved successfully', { goals });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const goal = await goalService.updateGoal(id, req.body);
      return ApiResponse.success(res, 'Goal updated successfully', { goal });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await goalService.deleteGoal(id);
      return ApiResponse.success(res, 'Goal deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async assign(req, res, next) {
    try {
      const goal = await goalService.assignGoal(req.body);
      return ApiResponse.created(res, 'Goal assigned successfully', { goal });
    } catch (error) {
      next(error);
    }
  }

  async reassign(req, res, next) {
    try {
      const { id } = req.params;
      const { newOwnerId } = req.body;
      const goal = await goalService.reassignGoal(id, newOwnerId);
      return ApiResponse.success(res, 'Goal reassigned successfully', { goal });
    } catch (error) {
      next(error);
    }
  }

  async complete(req, res, next) {
    try {
      const { id } = req.params;
      const goal = await goalService.completeGoal(id, req.body);
      return ApiResponse.success(res, 'Goal completed successfully', { goal });
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req, res, next) {
    try {
      const { id } = req.params;
      const { currentValue } = req.body;
      const goal = await goalService.updateProgress(id, currentValue);
      return ApiResponse.success(res, 'Goal progress updated successfully', { goal });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const goal = await goalService.approveGoal(id, req.user.userId);
      return ApiResponse.success(res, 'Goal approved successfully', { goal });
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const goal = await goalService.rejectGoal(id, req.user.userId, reason);
      return ApiResponse.success(res, 'Goal rejected successfully', { goal });
    } catch (error) {
      next(error);
    }
  }

  async review(req, res, next) {
    try {
      const { id } = req.params;
      const goal = await goalService.reviewGoal(id, req.user.userId, req.body);
      return ApiResponse.success(res, 'Goal reviewed successfully', { goal });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeGoals(req, res, next) {
    try {
      const { ownerId } = req.params;
      const options = req.query;
      const goals = await goalService.getEmployeeGoals(ownerId, options);
      return ApiResponse.success(res, 'Employee goals retrieved successfully', { goals });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentGoals(req, res, next) {
    try {
      const { departmentId } = req.params;
      const options = req.query;
      const goals = await goalService.getDepartmentGoals(departmentId, options);
      return ApiResponse.success(res, 'Department goals retrieved successfully', { goals });
    } catch (error) {
      next(error);
    }
  }

  async getReviewerGoals(req, res, next) {
    try {
      const { reviewerId } = req.params;
      const options = req.query;
      const goals = await goalService.getReviewerGoals(reviewerId, options);
      return ApiResponse.success(res, 'Reviewer goals retrieved successfully', { goals });
    } catch (error) {
      next(error);
    }
  }

  async getOverdueGoals(req, res, next) {
    try {
      const options = req.query;
      const goals = await goalService.getOverdueGoals(options);
      return ApiResponse.success(res, 'Overdue goals retrieved successfully', { goals });
    } catch (error) {
      next(error);
    }
  }

  async getDueSoonGoals(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 7;
      const options = req.query;
      const goals = await goalService.getDueSoonGoals(days, options);
      return ApiResponse.success(res, 'Goals due soon retrieved successfully', { goals });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const { ownerId } = req.params;
      const { year } = req.query;
      const dashboard = await goalService.getDashboard(ownerId, year);
      return ApiResponse.success(res, 'Dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentDashboard(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { year } = req.query;
      const dashboard = await goalService.getDepartmentDashboard(departmentId, year);
      return ApiResponse.success(res, 'Department dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req, res, next) {
    try {
      const { managerId } = req.params;
      const { year } = req.query;
      const dashboard = await goalService.getManagerDashboard(managerId, year);
      return ApiResponse.success(res, 'Manager dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req, res, next) {
    try {
      const { reportType } = req.params;
      const report = await goalService.generateReport(reportType, req.query);
      return ApiResponse.success(res, 'Report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const { ownerId } = req.params;
      const { year } = req.query;
      const analytics = await goalService.getAnalytics(ownerId, year);
      return ApiResponse.success(res, 'Analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }
}

const goalController = new GoalController();
export default goalController;
