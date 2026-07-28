import rewardRepository from './reward.repository.js';
import { REWARD_TYPE, REWARD_STATUS } from './kpi.constants.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import { formatRewardNumber } from './kpi.helpers.js';

class RewardService {
  constructor() {
    this.repository = rewardRepository;
    this.logger = Logger;
  }

  // Reward Issuance Methods
  async issueReward(rewardData, createdBy) {
    this.logger.info('Issuing new reward');
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    if (rewardData.recipient) {
      const recipientExists = await Employee.exists({ _id: rewardData.recipient, isDeleted: false });
      if (!recipientExists) {
        throw new AppError('Recipient not found', 404);
      }
    }

    if (rewardData.issuer) {
      const issuerExists = await Employee.exists({ _id: rewardData.issuer, isDeleted: false });
      if (!issuerExists) {
        throw new AppError('Issuer not found', 404);
      }
    }

    if (rewardData.department) {
      const departmentExists = await Department.exists({ _id: rewardData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found', 404);
      }
    }

    // Generate reward number if not provided
    if (!rewardData.rewardNumber) {
      const year = rewardData.year || new Date().getFullYear();
      const sequence = await this.repository.getSequenceNumber(year);
      rewardData.rewardNumber = formatRewardNumber(year, sequence);
    }

    rewardData.status = REWARD_STATUS.PENDING;
    rewardData.approvalStatus = 'pending';
    rewardData.createdBy = createdBy;

    const reward = await this.repository.create(rewardData);
    return reward;
  }

  async issueBulkRewards(rewardDataArray, createdBy) {
    this.logger.info(`Issuing ${rewardDataArray.length} rewards`);
    
    const results = [];
    for (const rewardData of rewardDataArray) {
      try {
        const reward = await this.issueReward(rewardData, createdBy);
        results.push({ success: true, reward });
      } catch (error) {
        results.push({ success: false, error: error.message, data: rewardData });
      }
    }

    return results;
  }

  // Nomination Methods
  async nominateReward(nominationData, createdBy) {
    this.logger.info('Nominating reward');
    
    const Employee = (await import('../employee/employee.model.js')).default;

    if (nominationData.nominatedBy) {
      const nominatorExists = await Employee.exists({ _id: nominationData.nominatedBy, isDeleted: false });
      if (!nominatorExists) {
        throw new AppError('Nominator not found', 404);
      }
    }

    if (nominationData.recipient) {
      const recipientExists = await Employee.exists({ _id: nominationData.recipient, isDeleted: false });
      if (!recipientExists) {
        throw new AppError('Recipient not found', 404);
      }
    }

    const nomination = {
      ...nominationData,
      status: 'pending',
      nominatedAt: new Date(),
      createdBy
    };

    const reward = await this.repository.create(nomination);
    return reward;
  }

  async reviewNomination(nominationId, reviewerId, decision, updatedBy) {
    this.logger.info(`Reviewing nomination ${nominationId}`);
    
    const reward = await this.repository.findById(nominationId);
    if (!reward) {
      throw new AppError('Nomination not found', 404);
    }

    const updatedReward = await this.repository.updateById(nominationId, {
      nomination: {
        ...reward.nomination,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        decision
      },
      updatedBy
    });
    return updatedReward;
  }

  async approveNomination(nominationId, approverId, updatedBy) {
    this.logger.info(`Approving nomination ${nominationId}`);
    
    const reward = await this.repository.findById(nominationId);
    if (!reward) {
      throw new AppError('Nomination not found', 404);
    }

    const updatedReward = await this.repository.updateById(nominationId, {
      status: REWARD_STATUS.APPROVED,
      approvalStatus: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      updatedBy: approverId
    });
    return updatedReward;
  }

  async rejectNomination(nominationId, approverId, reason, updatedBy) {
    this.logger.info(`Rejecting nomination ${nominationId}`);
    
    const reward = await this.repository.findById(nominationId);
    if (!reward) {
      throw new AppError('Nomination not found', 404);
    }

    const updatedReward = await this.repository.updateById(nominationId, {
      status: REWARD_STATUS.REJECTED,
      approvalStatus: 'rejected',
      rejectionReason: reason,
      approvedBy: approverId,
      approvedAt: new Date(),
      updatedBy: approverId
    });
    return updatedReward;
  }

  // Reward CRUD Operations
  async createReward(rewardData, createdBy) {
    this.logger.info('Creating new reward');
    return await this.issueReward(rewardData, createdBy);
  }

  async updateReward(rewardId, updateData, updatedBy) {
    this.logger.info(`Updating reward ${rewardId}`);
    
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    const forbiddenFields = ['rewardNumber', 'recipient', 'createdBy', 'createdAt'];
    const updateFields = Object.keys(updateData);
    const hasForbiddenField = updateFields.some(field => forbiddenFields.includes(field));
    if (hasForbiddenField) {
      throw new AppError('Cannot update protected fields', 400);
    }

    updateData.updatedBy = updatedBy;
    const updatedReward = await this.repository.updateById(rewardId, updateData);
    return updatedReward;
  }

  async deleteReward(rewardId, deletedBy) {
    this.logger.info(`Deleting reward ${rewardId}`);
    
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    await this.repository.softDeleteById(rewardId, deletedBy);
  }

  // Approval Methods
  async approveReward(rewardId, approverId) {
    this.logger.info(`Approving reward ${rewardId} by ${approverId}`);
    
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    if (reward.approvalStatus === 'approved') {
      throw new AppError('Reward already approved', 400);
    }

    const updatedReward = await this.repository.updateById(rewardId, {
      approvalStatus: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      status: REWARD_STATUS.APPROVED,
      updatedBy: approverId
    });
    return updatedReward;
  }

  async rejectReward(rewardId, approverId, reason) {
    this.logger.info(`Rejecting reward ${rewardId} by ${approverId}`);
    
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    if (reward.approvalStatus === 'approved') {
      throw new AppError('Cannot reject approved reward', 400);
    }

    const updatedReward = await this.repository.updateById(rewardId, {
      approvalStatus: 'rejected',
      rejectionReason: reason,
      approvedBy: approverId,
      approvedAt: new Date(),
      status: REWARD_STATUS.REJECTED,
      updatedBy: approverId
    });
    return updatedReward;
  }

  // Status Methods
  async cancelReward(rewardId, reason, updatedBy) {
    this.logger.info(`Cancelling reward ${rewardId}`);
    
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    if (reward.status === REWARD_STATUS.CANCELLED) {
      throw new AppError('Reward already cancelled', 400);
    }

    const updatedReward = await this.repository.updateById(rewardId, {
      status: REWARD_STATUS.CANCELLED,
      cancellationReason: reason,
      cancelledAt: new Date(),
      cancelledBy: updatedBy,
      updatedBy
    });
    return updatedReward;
  }

  async revokeReward(rewardId, reason, updatedBy) {
    this.logger.info(`Revoking reward ${rewardId}`);
    
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    if (reward.status === REWARD_STATUS.REVOKED) {
      throw new AppError('Reward already revoked', 400);
    }

    const updatedReward = await this.repository.updateById(rewardId, {
      status: REWARD_STATUS.REVOKED,
      revocationReason: reason,
      revokedAt: new Date(),
      revokedBy: updatedBy,
      updatedBy
    });
    return updatedReward;
  }

  // Certificate Methods
  async issueCertificate(rewardId, certificateData, updatedBy) {
    this.logger.info(`Issuing certificate for reward ${rewardId}`);
    
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    const certificate = {
      certificateNumber: certificateData.certificateNumber,
      issuedDate: new Date(),
      validUntil: certificateData.validUntil || null,
      issuedBy: certificateData.issuedBy,
      description: certificateData.description || ''
    };

    const updatedReward = await this.repository.updateById(rewardId, {
      certificate,
      updatedBy
    });
    return updatedReward;
  }

  async generateCertificate(rewardId) {
    this.logger.info(`Generating certificate for reward ${rewardId}`);
    
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    // In a real implementation, this would generate a PDF certificate
    // For now, return the certificate data
    return {
      rewardId,
      rewardNumber: reward.rewardNumber,
      recipient: reward.recipient,
      recipientName: reward.recipientName,
      type: reward.type,
      title: reward.title,
      description: reward.description,
      issuedDate: reward.approvedAt || new Date(),
      certificate: reward.certificate || null
    };
  }

  // Dashboard Methods
  async getDashboard(employeeId, year) {
    this.logger.info(`Getting dashboard for employee ${employeeId}`);
    
    const rewards = await this.repository.findByRecipient(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const approvedRewards = rewards.filter(r => r.status === REWARD_STATUS.APPROVED);
    const pendingRewards = rewards.filter(r => r.status === REWARD_STATUS.PENDING);
    const totalPoints = approvedRewards.reduce((sum, r) => sum + (r.points || 0), 0);

    return {
      employeeId,
      year,
      totalRewards: rewards.length,
      approvedRewards: approvedRewards.length,
      pendingRewards: pendingRewards.length,
      totalPoints,
      rewards: rewards.slice(0, 10)
    };
  }

  async getDepartmentDashboard(departmentId, year) {
    this.logger.info(`Getting department dashboard for ${departmentId}`);
    
    const rewards = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const topRewarded = await this.repository.getTopRewarded(year, 10);
    const departmentStats = await this.repository.getDepartmentRewards(departmentId, year);

    return {
      departmentId,
      year,
      totalRewards: rewards.length,
      rewards: rewards.slice(0, 20),
      topRewarded: topRewarded.filter(r => r.department?.toString() === departmentId),
      departmentStats
    };
  }

  async getManagerDashboard(managerId, year) {
    this.logger.info(`Getting manager dashboard for ${managerId}`);
    
    const rewards = await this.repository.findByIssuer(managerId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const pendingApproval = rewards.filter(r => r.approvalStatus === 'pending');
    const approved = rewards.filter(r => r.approvalStatus === 'approved');

    return {
      managerId,
      year,
      totalRewards: rewards.length,
      pendingApproval: pendingApproval.length,
      approved: approved.length,
      rewards: rewards.slice(0, 20)
    };
  }

  // Report Methods
  async generateReport(reportType, options) {
    this.logger.info(`Generating ${reportType} report`);
    
    const { year, departmentId, employeeId } = options;
    
    switch (reportType) {
      case 'employee-rewards':
        return await this.generateRewardReport(employeeId, year);
      case 'department-rewards':
        return await this.generateDepartmentRewardReport(departmentId, year);
      case 'organization-rewards':
        return await this.generateOrganizationRewardReport(year);
      default:
        throw new AppError('Invalid report type', 400);
    }
  }

  async generateRewardReport(employeeId, year) {
    this.logger.info(`Generating reward report for employee ${employeeId}`);
    
    const rewards = await this.repository.findByRecipient(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      employeeId,
      year,
      rewards: rewards.map(reward => ({
        rewardNumber: reward.rewardNumber,
        type: reward.type,
        title: reward.title,
        status: reward.status,
        points: reward.points,
        amount: reward.amount,
        issuedDate: reward.approvedAt
      })),
      summary: {
        totalRewards: rewards.length,
        totalPoints: rewards.reduce((sum, r) => sum + (r.points || 0), 0),
        totalAmount: rewards.reduce((sum, r) => sum + (r.amount || 0), 0),
        approved: rewards.filter(r => r.status === REWARD_STATUS.APPROVED).length
      }
    };

    return report;
  }

  async generateDepartmentRewardReport(departmentId, year) {
    this.logger.info(`Generating department reward report for ${departmentId}`);
    
    const rewards = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const departmentStats = await this.repository.getDepartmentRewards(departmentId, year);

    const report = {
      departmentId,
      year,
      rewards: rewards.slice(0, 50),
      summary: {
        totalRewards: rewards.length,
        totalPoints: rewards.reduce((sum, r) => sum + (r.points || 0), 0),
        totalAmount: rewards.reduce((sum, r) => sum + (r.amount || 0), 0),
        approved: rewards.filter(r => r.status === REWARD_STATUS.APPROVED).length
      },
      departmentStats
    };

    return report;
  }

  async generateOrganizationRewardReport(year) {
    this.logger.info(`Generating organization reward report for ${year}`);
    
    const allRewards = await this.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const rewardStats = await this.repository.getRewardStats(year);

    const report = {
      year,
      summary: {
        totalRewards: allRewards.length,
        totalPoints: allRewards.reduce((sum, r) => sum + (r.points || 0), 0),
        totalAmount: allRewards.reduce((sum, r) => sum + (r.amount || 0), 0),
        approved: allRewards.filter(r => r.status === REWARD_STATUS.APPROVED).length
      },
      rewards: allRewards.slice(0, 100),
      rewardStats
    };

    return report;
  }

  // Analytics Methods
  async getAnalytics(employeeId, year) {
    this.logger.info(`Getting analytics for employee ${employeeId}`);
    
    const rewards = await this.repository.findByRecipient(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const topRewarded = await this.repository.getTopRewarded(year, 10);
    const rewardStats = await this.repository.getRewardStats(year);

    const analytics = {
      employeeId,
      year,
      totalRewards: rewards.length,
      totalPoints: rewards.reduce((sum, r) => sum + (r.points || 0), 0),
      byType: this.groupRewardsByType(rewards),
      byStatus: this.groupRewardsByStatus(rewards),
      ranking: topRewarded.findIndex(r => r.recipient.toString() === employeeId) + 1 || null,
      organizationStats: rewardStats
    };

    return analytics;
  }

  async getTopRewarded(year, limit) {
    this.logger.info(`Getting top rewarded for ${year}`);
    return await this.repository.getTopRewarded(year, limit);
  }

  async getRewardStats(year) {
    this.logger.info(`Getting reward statistics for ${year}`);
    return await this.repository.getRewardStats(year);
  }

  async getDepartmentRewards(departmentId, year) {
    this.logger.info(`Getting department rewards for ${departmentId}`);
    return await this.repository.getDepartmentRewards(departmentId, year);
  }

  groupRewardsByType(rewards) {
    const grouped = {};
    rewards.forEach(reward => {
      const type = reward.type;
      if (!grouped[type]) grouped[type] = 0;
      grouped[type]++;
    });
    return grouped;
  }

  groupRewardsByStatus(rewards) {
    const grouped = {};
    rewards.forEach(reward => {
      const status = reward.status;
      if (!grouped[status]) grouped[status] = 0;
      grouped[status]++;
    });
    return grouped;
  }

  // Automatic Recommendation Methods
  async recommendEmployeeOfMonth(year, month) {
    this.logger.info(`Recommending employee of month for ${year}-${month}`);
    
    const kpiService = (await import('./kpi.service.js')).default;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const allKPIs = await kpiService.repository.findAll({
      filter: {
        year,
        evaluationPeriod: 'monthly',
        month,
        isDeleted: false
      },
      sort: { overallScore: -1 }
    });

    const topPerformers = allKPIs.slice(0, 5);
    const recommendations = topPerformers.map(kpi => ({
      employee: kpi.employee,
      employeeName: kpi.employeeName,
      department: kpi.department,
      overallScore: kpi.overallScore,
      recommendationType: 'employee_of_month',
      reason: `Top performer with score of ${kpi.overallScore}`
    }));

    return recommendations;
  }

  async recommendBestPerformer(year, periodType, periodValue) {
    this.logger.info(`Recommending best performer for ${year}`);
    
    const kpiService = (await import('./kpi.service.js')).default;
    const filter = { year, evaluationPeriod: periodType, isDeleted: false };
    if (periodType === 'monthly') filter.month = periodValue;
    else if (periodType === 'quarterly') filter.quarter = periodValue;

    const allKPIs = await kpiService.repository.findAll({
      filter,
      sort: { overallScore: -1 }
    });

    const topPerformers = allKPIs.slice(0, 10);
    const recommendations = topPerformers.map(kpi => ({
      employee: kpi.employee,
      employeeName: kpi.employeeName,
      department: kpi.department,
      overallScore: kpi.overallScore,
      recommendationType: 'best_performer',
      reason: `Top performer with score of ${kpi.overallScore}`
    }));

    return recommendations;
  }

  async recommendFastestPerformer(year, periodType, periodValue) {
    this.logger.info(`Recommending fastest performer for ${year}`);
    
    const Task = (await import('../task/task.model.js')).default;
    const startDate = this.getStartDate(year, periodType, periodValue);
    const endDate = this.getEndDate(year, periodType, periodValue);

    const tasks = await Task.aggregate([
      {
        $match: {
          startDate: { $gte: startDate, $lte: endDate },
          status: 'completed',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          avgCompletionTime: {
            $avg: {
              $subtract: ['$completedAt', '$startDate']
            }
          },
          totalTasks: { $sum: 1 }
        }
      },
      {
        $sort: { avgCompletionTime: 1 }
      },
      {
        $limit: 10
      }
    ]);

    const recommendations = tasks.map(task => ({
      employee: task._id,
      avgCompletionTime: task.avgCompletionTime,
      totalTasks: task.totalTasks,
      recommendationType: 'fastest_performer',
      reason: `Fastest task completion with ${task.totalTasks} tasks`
    }));

    return recommendations;
  }

  async recommendInnovationAward(year) {
    this.logger.info(`Recommending innovation award for ${year}`);
    
    // This would integrate with an innovation/suggestion module
    // For now, return empty recommendations
    return [];
  }

  async recommendTeamPlayer(year, projectId) {
    this.logger.info(`Recommending team player for project ${projectId}`);
    
    const Task = (await import('../task/task.model.js')).default;

    const tasks = await Task.aggregate([
      {
        $match: {
          project: projectId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          collaborationScore: {
            $sum: { $cond: [{ $gt: ['$comments', []] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          teamPlayerScore: {
            $multiply: [
              { $divide: ['$completedTasks', '$totalTasks'] },
              { $add: ['$collaborationScore', 1] }
            ]
          }
        }
      },
      {
        $sort: { teamPlayerScore: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const recommendations = tasks.map(task => ({
      employee: task._id,
      teamPlayerScore: task.teamPlayerScore,
      totalTasks: task.totalTasks,
      recommendationType: 'team_player',
      reason: `Excellent collaboration and task completion`
    }));

    return recommendations;
  }

  getStartDate(year, periodType, periodValue) {
    if (periodType === 'monthly') {
      return new Date(year, periodValue - 1, 1);
    } else if (periodType === 'quarterly') {
      const quarterStart = {
        1: new Date(year, 0, 1),
        2: new Date(year, 3, 1),
        3: new Date(year, 6, 1),
        4: new Date(year, 9, 1)
      };
      return quarterStart[periodValue];
    }
    return new Date(year, 0, 1);
  }

  getEndDate(year, periodType, periodValue) {
    if (periodType === 'monthly') {
      return new Date(year, periodValue, 0);
    } else if (periodType === 'quarterly') {
      const quarterEnd = {
        1: new Date(year, 2, 31),
        2: new Date(year, 5, 30),
        3: new Date(year, 8, 30),
        4: new Date(year, 11, 31)
      };
      return quarterEnd[periodValue];
    }
    return new Date(year, 11, 31);
  }

  // Bulk Operations
  async bulkCreate(rewardDataArray, createdBy) {
    this.logger.info(`Bulk creating ${rewardDataArray.length} rewards`);
    return await this.issueBulkRewards(rewardDataArray, createdBy);
  }

  async bulkUpdate(rewardIds, updateData, updatedBy) {
    this.logger.info(`Bulk updating ${rewardIds.length} rewards`);
    
    const results = [];
    for (const rewardId of rewardIds) {
      try {
        const reward = await this.updateReward(rewardId, updateData, updatedBy);
        results.push({ success: true, reward });
      } catch (error) {
        results.push({ success: false, error: error.message, rewardId });
      }
    }

    return results;
  }

  async bulkApprove(rewardIds, approverId) {
    this.logger.info(`Bulk approving ${rewardIds.length} rewards`);
    
    const results = [];
    for (const rewardId of rewardIds) {
      try {
        const reward = await this.approveReward(rewardId, approverId);
        results.push({ success: true, reward });
      } catch (error) {
        results.push({ success: false, error: error.message, rewardId });
      }
    }

    return results;
  }

  // Comment Methods
  async addComment(rewardId, comment, addedBy) {
    this.logger.info(`Adding comment to reward ${rewardId}`);
    
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    const commentObj = {
      comment,
      addedBy,
      addedAt: new Date()
    };

    const updatedReward = await this.repository.updateById(rewardId, {
      $push: { comments: commentObj },
      updatedBy: addedBy
    });
    return updatedReward;
  }

  // Helper Methods
  async getEmployeeRewards(recipientId, options) {
    return await this.repository.findByRecipient(recipientId, options);
  }

  async getDepartmentRewardsData(departmentId, options) {
    return await this.repository.findByDepartment(departmentId, options);
  }

  async getIssuerRewards(issuerId, options) {
    return await this.repository.findByIssuer(issuerId, options);
  }

  async getRewardsByType(type, options) {
    return await this.repository.findByType(type, options);
  }

  async getRewardsByStatus(status, options) {
    return await this.repository.findByStatus(status, options);
  }

  async getProjectRewards(projectId, options) {
    return await this.repository.findByProject(projectId, options);
  }

  async getTeamRewards(teamId, options) {
    return await this.repository.findByTeam(teamId, options);
  }

  async getTopRewardedData(year, limit) {
    return await this.repository.getTopRewarded(year, limit);
  }

  async getDepartmentRewardsStats(departmentId, year) {
    return await this.repository.getDepartmentRewards(departmentId, year);
  }

  async getRewardStatsData(year) {
    return await this.repository.getRewardStats(year);
  }
}

const rewardService = new RewardService();
export default rewardService;
