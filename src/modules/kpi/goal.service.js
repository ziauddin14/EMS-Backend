import goalRepository from './goal.repository.js';
import { GOAL_STATUS, GOAL_PRIORITY, GOAL_TYPE } from './kpi.constants.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import { calculateGoalCompletion, isGoalOverdue, isGoalDueSoon, formatGoalNumber } from './kpi.helpers.js';

class GoalService {
  constructor() {
    this.repository = goalRepository;
    this.logger = Logger;
  }

  // Goal Assignment Methods
  async assignGoal(goalData, createdBy) {
    this.logger.info('Assigning new goal');
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    if (goalData.owner) {
      const ownerExists = await Employee.exists({ _id: goalData.owner, isDeleted: false });
      if (!ownerExists) {
        throw new AppError('Goal owner not found', 404);
      }
    }

    if (goalData.project) {
      const projectExists = await Project.exists({ _id: goalData.project, isDeleted: false });
      if (!projectExists) {
        throw new AppError('Project not found', 404);
      }
    }

    if (goalData.reviewer) {
      const reviewerExists = await Employee.exists({ _id: goalData.reviewer, isDeleted: false });
      if (!reviewerExists) {
        throw new AppError('Reviewer not found', 404);
      }
    }

    if (goalData.startDate && goalData.dueDate) {
      if (new Date(goalData.startDate) > new Date(goalData.dueDate)) {
        throw new AppError('Start date cannot be after due date', 400);
      }
    }

    // Generate goal number if not provided
    if (!goalData.goalNumber) {
      const year = new Date().getFullYear();
      const sequence = await this.repository.getSequenceNumber(year);
      goalData.goalNumber = formatGoalNumber(year, sequence);
    }

    goalData.status = GOAL_STATUS.ACTIVE;
    goalData.approvalStatus = 'pending';
    goalData.createdBy = createdBy;

    const goal = await this.repository.create(goalData);
    return goal;
  }

  async reassignGoal(goalId, newOwnerId, updatedBy) {
    this.logger.info(`Reassigning goal ${goalId} to ${newOwnerId}`);
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const newOwnerExists = await Employee.exists({ _id: newOwnerId, isDeleted: false });
    if (!newOwnerExists) {
      throw AppError('New owner not found', 404);
    }

    const updatedGoal = await this.repository.updateById(goalId, {
      owner: newOwnerId,
      reassignedAt: new Date(),
      reassignedBy: updatedBy,
      updatedBy
    });
    return updatedGoal;
  }

  async assignMultipleGoals(goalDataArray, createdBy) {
    this.logger.info(`Assigning ${goalDataArray.length} goals`);
    
    const results = [];
    for (const goalData of goalDataArray) {
      try {
        const goal = await this.assignGoal(goalData, createdBy);
        results.push({ success: true, goal });
      } catch (error) {
        results.push({ success: false, error: error.message, data: goalData });
      }
    }

    return results;
  }

  // Goal Completion Methods
  async completeGoal(goalId, completionData, updatedBy) {
    this.logger.info(`Completing goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.status === GOAL_STATUS.COMPLETED) {
      throw new AppError('Goal already completed', 400);
    }

    const completionPercentage = calculateGoalCompletion(goal);
    const updatedGoal = await this.repository.updateById(goalId, {
      status: GOAL_STATUS.COMPLETED,
      completionPercentage: 100,
      completedAt: new Date(),
      completedBy: updatedBy,
      completionNotes: completionData?.notes || '',
      updatedBy
    });
    return updatedGoal;
  }

  async updateProgress(goalId, currentValue, updatedBy) {
    this.logger.info(`Updating progress for goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const updatedGoal = await this.repository.updateById(goalId, {
      currentValue,
      completionPercentage: calculateGoalCompletion({ ...goal, currentValue }),
      lastProgressUpdate: new Date(),
      updatedBy
    });
    return updatedGoal;
  }

  async completeKeyResult(goalId, keyResultId, updatedBy) {
    this.logger.info(`Completing key result ${keyResultId} for goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const keyResult = goal.keyResults?.find(kr => kr._id.toString() === keyResultId);
    if (!keyResult) {
      throw new AppError('Key result not found', 404);
    }

    keyResult.completed = true;
    keyResult.completedAt = new Date();

    // Recalculate overall goal completion
    const completedKeyResults = goal.keyResults.filter(kr => kr.completed).length;
    const totalKeyResults = goal.keyResults.length;
    const keyResultProgress = (completedKeyResults / totalKeyResults) * 100;

    const updatedGoal = await this.repository.updateById(goalId, {
      keyResults: goal.keyResults,
      completionPercentage: Math.max(goal.completionPercentage, keyResultProgress),
      updatedBy
    });
    return updatedGoal;
  }

  async completeMilestone(goalId, milestoneId, updatedBy) {
    this.logger.info(`Completing milestone ${milestoneId} for goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const milestone = goal.milestones?.find(m => m._id.toString() === milestoneId);
    if (!milestone) {
      throw new AppError('Milestone not found', 404);
    }

    milestone.completed = true;
    milestone.completedAt = new Date();

    const updatedGoal = await this.repository.updateById(goalId, {
      milestones: goal.milestones,
      updatedBy
    });
    return updatedGoal;
  }

  // Goal CRUD Operations
  async createGoal(goalData, createdBy) {
    this.logger.info('Creating new goal');
    return await this.assignGoal(goalData, createdBy);
  }

  async updateGoal(goalId, updateData, updatedBy) {
    this.logger.info(`Updating goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const forbiddenFields = ['goalNumber', 'owner', 'createdBy', 'createdAt'];
    const updateFields = Object.keys(updateData);
    const hasForbiddenField = updateFields.some(field => forbiddenFields.includes(field));
    if (hasForbiddenField) {
      throw new AppError('Cannot update protected fields', 400);
    }

    // Recalculate completion percentage if currentValue is updated
    if (updateData.currentValue !== undefined) {
      updateData.completionPercentage = calculateGoalCompletion({ ...goal, ...updateData });
    }

    updateData.updatedBy = updatedBy;
    const updatedGoal = await this.repository.updateById(goalId, updateData);
    return updatedGoal;
  }

  async deleteGoal(goalId, deletedBy) {
    this.logger.info(`Deleting goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    await this.repository.softDeleteById(goalId, deletedBy);
  }

  // Approval Methods
  async approveGoal(goalId, approverId) {
    this.logger.info(`Approving goal ${goalId} by ${approverId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.approvalStatus === 'approved') {
      throw new AppError('Goal already approved', 400);
    }

    const updatedGoal = await this.repository.updateById(goalId, {
      approvalStatus: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      updatedBy: approverId
    });
    return updatedGoal;
  }

  async rejectGoal(goalId, approverId, reason) {
    this.logger.info(`Rejecting goal ${goalId} by ${approverId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.approvalStatus === 'approved') {
      throw new AppError('Cannot reject approved goal', 400);
    }

    const updatedGoal = await this.repository.updateById(goalId, {
      approvalStatus: 'rejected',
      rejectionReason: reason,
      approvedBy: approverId,
      approvedAt: new Date(),
      updatedBy: approverId
    });
    return updatedGoal;
  }

  async reviewGoal(goalId, reviewerId, reviewData) {
    this.logger.info(`Reviewing goal ${goalId} by ${reviewerId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const review = {
      reviewer: reviewerId,
      reviewDate: new Date(),
      comments: reviewData?.comments || '',
      rating: reviewData?.rating || null,
      recommendations: reviewData?.recommendations || []
    };

    const updatedGoal = await this.repository.updateById(goalId, {
      $push: { reviews: review },
      updatedBy: reviewerId
    });
    return updatedGoal;
  }

  // Goal Status Methods
  async cancelGoal(goalId, reason, updatedBy) {
    this.logger.info(`Cancelling goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.status === GOAL_STATUS.COMPLETED) {
      throw new AppError('Cannot cancel completed goal', 400);
    }

    const updatedGoal = await this.repository.updateById(goalId, {
      status: GOAL_STATUS.CANCELLED,
      cancellationReason: reason,
      cancelledAt: new Date(),
      cancelledBy: updatedBy,
      updatedBy
    });
    return updatedGoal;
  }

  async deferGoal(goalId, reason, newDueDate, updatedBy) {
    this.logger.info(`Deferring goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.status === GOAL_STATUS.COMPLETED) {
      throw new AppError('Cannot defer completed goal', 400);
    }

    const updatedGoal = await this.repository.updateById(goalId, {
      status: GOAL_STATUS.DEFERRED,
      dueDate: newDueDate,
      deferralReason: reason,
      deferredAt: new Date(),
      deferredBy: updatedBy,
      updatedBy
    });
    return updatedGoal;
  }

  async activateGoal(goalId, updatedBy) {
    this.logger.info(`Activating goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.status === GOAL_STATUS.ACTIVE) {
      throw new AppError('Goal already active', 400);
    }

    const updatedGoal = await this.repository.updateById(goalId, {
      status: GOAL_STATUS.ACTIVE,
      activatedAt: new Date(),
      updatedBy
    });
    return updatedGoal;
  }

  // Key Result Methods
  async addKeyResult(goalId, keyResultData, updatedBy) {
    this.logger.info(`Adding key result to goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const newKeyResult = {
      _id: new Date().getTime().toString(),
      title: keyResultData.title,
      description: keyResultData.description || '',
      targetValue: keyResultData.targetValue,
      currentValue: keyResultData.currentValue || 0,
      completed: false,
      dueDate: keyResultData.dueDate || null
    };

    const updatedGoal = await this.repository.updateById(goalId, {
      $push: { keyResults: newKeyResult },
      updatedBy
    });
    return updatedGoal;
  }

  async updateKeyResult(goalId, keyResultId, updateData, updatedBy) {
    this.logger.info(`Updating key result ${keyResultId} for goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const keyResultIndex = goal.keyResults?.findIndex(kr => kr._id.toString() === keyResultId);
    if (keyResultIndex === -1) {
      throw new AppError('Key result not found', 404);
    }

    goal.keyResults[keyResultIndex] = { ...goal.keyResults[keyResultIndex], ...updateData };

    const updatedGoal = await this.repository.updateById(goalId, {
      keyResults: goal.keyResults,
      updatedBy
    });
    return updatedGoal;
  }

  async deleteKeyResult(goalId, keyResultId, updatedBy) {
    this.logger.info(`Deleting key result ${keyResultId} from goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    goal.keyResults = goal.keyResults.filter(kr => kr._id.toString() !== keyResultId);

    const updatedGoal = await this.repository.updateById(goalId, {
      keyResults: goal.keyResults,
      updatedBy
    });
    return updatedGoal;
  }

  // Milestone Methods
  async addMilestone(goalId, milestoneData, updatedBy) {
    this.logger.info(`Adding milestone to goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const newMilestone = {
      _id: new Date().getTime().toString(),
      title: milestoneData.title,
      description: milestoneData.description || '',
      targetDate: milestoneData.targetDate,
      completed: false
    };

    const updatedGoal = await this.repository.updateById(goalId, {
      $push: { milestones: newMilestone },
      updatedBy
    });
    return updatedGoal;
  }

  async updateMilestone(goalId, milestoneId, updateData, updatedBy) {
    this.logger.info(`Updating milestone ${milestoneId} for goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const milestoneIndex = goal.milestones?.findIndex(m => m._id.toString() === milestoneId);
    if (milestoneIndex === -1) {
      throw new AppError('Milestone not found', 404);
    }

    goal.milestones[milestoneIndex] = { ...goal.milestones[milestoneIndex], ...updateData };

    const updatedGoal = await this.repository.updateById(goalId, {
      milestones: goal.milestones,
      updatedBy
    });
    return updatedGoal;
  }

  async deleteMilestone(goalId, milestoneId, updatedBy) {
    this.logger.info(`Deleting milestone ${milestoneId} from goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    goal.milestones = goal.milestones.filter(m => m._id.toString() !== milestoneId);

    const updatedGoal = await this.repository.updateById(goalId, {
      milestones: goal.milestones,
      updatedBy
    });
    return updatedGoal;
  }

  // Dependency Methods
  async addDependency(goalId, dependencyGoalId, updatedBy) {
    this.logger.info(`Adding dependency to goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const dependencyExists = await this.repository.exists(dependencyGoalId);
    if (!dependencyExists) {
      throw new AppError('Dependency goal not found', 404);
    }

    if (goal.dependencies?.includes(dependencyGoalId)) {
      throw new AppError('Dependency already exists', 400);
    }

    const updatedGoal = await this.repository.updateById(goalId, {
      $push: { dependencies: dependencyGoalId },
      updatedBy
    });
    return updatedGoal;
  }

  async removeDependency(goalId, dependencyGoalId, updatedBy) {
    this.logger.info(`Removing dependency from goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    goal.dependencies = goal.dependencies.filter(dep => dep.toString() !== dependencyGoalId);

    const updatedGoal = await this.repository.updateById(goalId, {
      dependencies: goal.dependencies,
      updatedBy
    });
    return updatedGoal;
  }

  // Sub Goal Methods
  async addSubGoal(goalId, subGoalId, updatedBy) {
    this.logger.info(`Adding sub goal to goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const subGoalExists = await this.repository.exists(subGoalId);
    if (!subGoalExists) {
      throw new AppError('Sub goal not found', 404);
    }

    if (goal.subGoals?.includes(subGoalId)) {
      throw new AppError('Sub goal already exists', 400);
    }

    const updatedGoal = await this.repository.updateById(goalId, {
      $push: { subGoals: subGoalId },
      updatedBy
    });
    return updatedGoal;
  }

  async removeSubGoal(goalId, subGoalId, updatedBy) {
    this.logger.info(`Removing sub goal from goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    goal.subGoals = goal.subGoals.filter(sg => sg.toString() !== subGoalId);

    const updatedGoal = await this.repository.updateById(goalId, {
      subGoals: goal.subGoals,
      updatedBy
    });
    return updatedGoal;
  }

  // Progress Note Methods
  async addProgressNote(goalId, note, addedBy) {
    this.logger.info(`Adding progress note to goal ${goalId}`);
    
    const goal = await this.repository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    const progressNote = {
      note,
      addedBy,
      addedAt: new Date()
    };

    const updatedGoal = await this.repository.updateById(goalId, {
      $push: { progressNotes: progressNote },
      updatedBy: addedBy
    });
    return updatedGoal;
  }

  // Dashboard Methods
  async getDashboard(employeeId, year) {
    this.logger.info(`Getting dashboard for employee ${employeeId}`);
    
    const goals = await this.repository.findByOwner(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const activeGoals = goals.filter(g => g.status === GOAL_STATUS.ACTIVE);
    const completedGoals = goals.filter(g => g.status === GOAL_STATUS.COMPLETED);
    const overdueGoals = goals.filter(g => isGoalOverdue(g));
    const dueSoonGoals = goals.filter(g => isGoalDueSoon(g, 7));

    const completionRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;
    const averageCompletion = goals.length > 0 
      ? goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length 
      : 0;

    return {
      employeeId,
      year,
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      overdueGoals: overdueGoals.length,
      dueSoonGoals: dueSoonGoals.length,
      completionRate,
      averageCompletion,
      goals: goals.slice(0, 10)
    };
  }

  async getDepartmentDashboard(departmentId, year) {
    this.logger.info(`Getting department dashboard for ${departmentId}`);
    
    const goals = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const summary = await this.repository.getDepartmentGoalSummary(departmentId, year);

    return {
      departmentId,
      year,
      summary,
      goals: goals.slice(0, 20)
    };
  }

  async getManagerDashboard(managerId, year) {
    this.logger.info(`Getting manager dashboard for ${managerId}`);
    
    const goals = await this.repository.findByReviewer(managerId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const pendingReview = goals.filter(g => g.approvalStatus === 'pending');
    const approved = goals.filter(g => g.approvalStatus === 'approved');
    const rejected = goals.filter(g => g.approvalStatus === 'rejected');

    return {
      managerId,
      year,
      totalGoals: goals.length,
      pendingReview: pendingReview.length,
      approved: approved.length,
      rejected: rejected.length,
      goals: goals.slice(0, 20)
    };
  }

  // Report Methods
  async generateReport(reportType, options) {
    this.logger.info(`Generating ${reportType} report`);
    
    const { year, departmentId, employeeId } = options;
    
    switch (reportType) {
      case 'employee-goals':
        return await this.generateGoalReport(employeeId, year);
      case 'department-goals':
        return await this.generateDepartmentGoalReport(departmentId, year);
      case 'organization-goals':
        return await this.generateOrganizationGoalReport(year);
      default:
        throw new AppError('Invalid report type', 400);
    }
  }

  async generateGoalReport(employeeId, year) {
    this.logger.info(`Generating goal report for employee ${employeeId}`);
    
    const goals = await this.repository.findByOwner(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      employeeId,
      year,
      goals: goals.map(goal => ({
        goalNumber: goal.goalNumber,
        title: goal.title,
        type: goal.type,
        priority: goal.priority,
        status: goal.status,
        completionPercentage: goal.completionPercentage,
        startDate: goal.startDate,
        dueDate: goal.dueDate
      })),
      summary: {
        totalGoals: goals.length,
        completed: goals.filter(g => g.status === GOAL_STATUS.COMPLETED).length,
        active: goals.filter(g => g.status === GOAL_STATUS.ACTIVE).length,
        cancelled: goals.filter(g => g.status === GOAL_STATUS.CANCELLED).length,
        averageCompletion: goals.length > 0 ? goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length : 0
      }
    };

    return report;
  }

  async generateDepartmentGoalReport(departmentId, year) {
    this.logger.info(`Generating department goal report for ${departmentId}`);
    
    const goals = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const summary = await this.repository.getDepartmentGoalSummary(departmentId, year);

    const report = {
      departmentId,
      year,
      summary,
      goals: goals.slice(0, 50)
    };

    return report;
  }

  async generateOrganizationGoalReport(year) {
    this.logger.info(`Generating organization goal report for ${year}`);
    
    const allGoals = await this.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      year,
      summary: {
        totalGoals: allGoals.length,
        completed: allGoals.filter(g => g.status === GOAL_STATUS.COMPLETED).length,
        active: allGoals.filter(g => g.status === GOAL_STATUS.ACTIVE).length,
        cancelled: allGoals.filter(g => g.status === GOAL_STATUS.CANCELLED).length,
        averageCompletion: allGoals.length > 0 ? allGoals.reduce((sum, g) => sum + g.completionPercentage, 0) / allGoals.length : 0
      },
      goals: allGoals.slice(0, 100)
    };

    return report;
  }

  // Analytics Methods
  async getAnalytics(employeeId, year) {
    this.logger.info(`Getting analytics for employee ${employeeId}`);
    
    const goals = await this.repository.findByOwner(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const completionRate = await this.getCompletionRate(employeeId, year);
    const overdueGoals = await this.getOverdueGoals(employeeId);

    const analytics = {
      employeeId,
      year,
      totalGoals: goals.length,
      completionRate,
      overdueGoals: overdueGoals.length,
      averageCompletion: goals.length > 0 ? goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length : 0,
      byType: this.groupGoalsByType(goals),
      byPriority: this.groupGoalsByPriority(goals),
      byStatus: this.groupGoalsByStatus(goals)
    };

    return analytics;
  }

  async getCompletionRate(employeeId, year) {
    this.logger.info(`Calculating completion rate for employee ${employeeId}`);
    
    const goals = await this.repository.findByOwner(employeeId, {
      filter: { year }
    });

    if (goals.length === 0) return 0;

    const completedGoals = goals.filter(g => g.status === GOAL_STATUS.COMPLETED).length;
    return (completedGoals / goals.length) * 100;
  }

  async getOverdueGoals(employeeId) {
    this.logger.info(`Getting overdue goals for employee ${employeeId}`);
    
    const goals = await this.repository.findByOwner(employeeId, {
      sort: { dueDate: 1 }
    });

    return goals.filter(g => isGoalOverdue(g));
  }

  groupGoalsByType(goals) {
    const grouped = {};
    goals.forEach(goal => {
      const type = goal.type;
      if (!grouped[type]) grouped[type] = 0;
      grouped[type]++;
    });
    return grouped;
  }

  groupGoalsByPriority(goals) {
    const grouped = {};
    goals.forEach(goal => {
      const priority = goal.priority;
      if (!grouped[priority]) grouped[priority] = 0;
      grouped[priority]++;
    });
    return grouped;
  }

  groupGoalsByStatus(goals) {
    const grouped = {};
    goals.forEach(goal => {
      const status = goal.status;
      if (!grouped[status]) grouped[status] = 0;
      grouped[status]++;
    });
    return grouped;
  }

  // Bulk Operations
  async bulkCreate(goalDataArray, createdBy) {
    this.logger.info(`Bulk creating ${goalDataArray.length} goals`);
    return await this.assignMultipleGoals(goalDataArray, createdBy);
  }

  async bulkUpdate(goalIds, updateData, updatedBy) {
    this.logger.info(`Bulk updating ${goalIds.length} goals`);
    
    const results = [];
    for (const goalId of goalIds) {
      try {
        const goal = await this.updateGoal(goalId, updateData, updatedBy);
        results.push({ success: true, goal });
      } catch (error) {
        results.push({ success: false, error: error.message, goalId });
      }
    }

    return results;
  }

  async bulkComplete(goalIds, completionData, updatedBy) {
    this.logger.info(`Bulk completing ${goalIds.length} goals`);
    
    const results = [];
    for (const goalId of goalIds) {
      try {
        const goal = await this.completeGoal(goalId, completionData, updatedBy);
        results.push({ success: true, goal });
      } catch (error) {
        results.push({ success: false, error: error.message, goalId });
      }
    }

    return results;
  }

  // Helper Methods
  async getEmployeeGoals(employeeId, options) {
    return await this.repository.findByOwner(employeeId, options);
  }

  async getDepartmentGoals(departmentId, options) {
    return await this.repository.findByDepartment(departmentId, options);
  }

  async getReviewerGoals(reviewerId, options) {
    return await this.repository.findByReviewer(reviewerId, options);
  }

  async getProjectGoals(projectId, options) {
    return await this.repository.findByProject(projectId, options);
  }

  async getGoalsByType(type, options) {
    return await this.repository.findByType(type, options);
  }

  async getGoalsByStatus(status, options) {
    return await this.repository.findByStatus(status, options);
  }

  async getOverdueGoals(options) {
    return await this.repository.findOverdue(options);
  }

  async getDueSoonGoals(days, options) {
    return await this.repository.findDueSoon(days, options);
  }

  async getDepartmentGoalSummary(departmentId, year) {
    return await this.repository.getDepartmentGoalSummary(departmentId, year);
  }

  async getOwnerGoalSummary(ownerId, year) {
    return await this.repository.getOwnerGoalSummary(ownerId, year);
  }
}

const goalService = new GoalService();
export default goalService;
