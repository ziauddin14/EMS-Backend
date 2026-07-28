import rewardService from './reward.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class RewardController {
  async create(req, res, next) {
    try {
      const reward = await rewardService.createReward(req.body);
      return ApiResponse.created(res, 'Reward created successfully', { reward });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const reward = await rewardService.repository.findById(id);
      return ApiResponse.success(res, 'Reward retrieved successfully', { reward });
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
      const rewards = await rewardService.repository.findAll(options);
      return ApiResponse.success(res, 'Rewards retrieved successfully', { rewards });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const reward = await rewardService.updateReward(id, req.body);
      return ApiResponse.success(res, 'Reward updated successfully', { reward });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await rewardService.deleteReward(id);
      return ApiResponse.success(res, 'Reward deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async issue(req, res, next) {
    try {
      const reward = await rewardService.issueReward(req.body);
      return ApiResponse.created(res, 'Reward issued successfully', { reward });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const reward = await rewardService.approveReward(id, req.user.userId);
      return ApiResponse.success(res, 'Reward approved successfully', { reward });
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const reward = await rewardService.rejectReward(id, req.user.userId, reason);
      return ApiResponse.success(res, 'Reward rejected successfully', { reward });
    } catch (error) {
      next(error);
    }
  }

  async nominate(req, res, next) {
    try {
      const reward = await rewardService.nominateReward(req.body);
      return ApiResponse.created(res, 'Reward nominated successfully', { reward });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const reward = await rewardService.cancelReward(id, reason);
      return ApiResponse.success(res, 'Reward cancelled successfully', { reward });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeRewards(req, res, next) {
    try {
      const { recipientId } = req.params;
      const options = req.query;
      const rewards = await rewardService.getEmployeeRewards(recipientId, options);
      return ApiResponse.success(res, 'Employee rewards retrieved successfully', { rewards });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentRewards(req, res, next) {
    try {
      const { departmentId } = req.params;
      const options = req.query;
      const rewards = await rewardService.getDepartmentRewardsData(departmentId, options);
      return ApiResponse.success(res, 'Department rewards retrieved successfully', { rewards });
    } catch (error) {
      next(error);
    }
  }

  async getIssuerRewards(req, res, next) {
    try {
      const { issuerId } = req.params;
      const options = req.query;
      const rewards = await rewardService.getIssuerRewards(issuerId, options);
      return ApiResponse.success(res, 'Issuer rewards retrieved successfully', { rewards });
    } catch (error) {
      next(error);
    }
  }

  async getTopRewarded(req, res, next) {
    try {
      const { year } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const rewards = await rewardService.getTopRewardedData(year, limit);
      return ApiResponse.success(res, 'Top rewarded employees retrieved successfully', { rewards });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const { recipientId } = req.params;
      const { year } = req.query;
      const dashboard = await rewardService.getDashboard(recipientId, year);
      return ApiResponse.success(res, 'Dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentDashboard(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { year } = req.query;
      const dashboard = await rewardService.getDepartmentDashboard(departmentId, year);
      return ApiResponse.success(res, 'Department dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req, res, next) {
    try {
      const { managerId } = req.params;
      const { year } = req.query;
      const dashboard = await rewardService.getManagerDashboard(managerId, year);
      return ApiResponse.success(res, 'Manager dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req, res, next) {
    try {
      const { reportType } = req.params;
      const report = await rewardService.generateReport(reportType, req.query);
      return ApiResponse.success(res, 'Report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const { recipientId } = req.params;
      const { year } = req.query;
      const analytics = await rewardService.getAnalytics(recipientId, year);
      return ApiResponse.success(res, 'Analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }
}

const rewardController = new RewardController();
export default rewardController;
