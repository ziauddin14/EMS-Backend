import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import actionItemRepository from './actionItem.repository.js';
import { ACTION_ITEM_STATUS, ACTION_ITEM_PRIORITY } from './meeting.constants.js';

class ActionItemService {
  constructor() {
    this.repository = actionItemRepository;
    this.logger = Logger;
  }

  async createActionItem(data, userId) {
    try {
      // Validate due date
      if (!data.dueDate) {
        throw new AppError('Due date is required', 400);
      }

      if (new Date(data.dueDate) < new Date()) {
        throw new AppError('Due date cannot be in the past', 400);
      }

      const actionItem = await this.repository.create({
        ...data,
        createdBy: userId,
        updatedBy: userId
      });

      this.logger.info(`Action item created: ${actionItem._id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error creating action item:', error);
      throw error;
    }
  }

  async updateActionItem(id, data, userId) {
    try {
      const existingActionItem = await this.repository.findById(id);
      if (!existingActionItem) {
        throw new AppError('Action item not found', 404);
      }

      if (existingActionItem.status === ACTION_ITEM_STATUS.COMPLETED) {
        throw new AppError('Cannot update completed action items', 400);
      }

      // Validate due date if provided
      if (data.dueDate) {
        if (new Date(data.dueDate) < new Date()) {
          throw new AppError('Due date cannot be in the past', 400);
        }
      }

      const actionItem = await this.repository.update(id, {
        ...data,
        updatedBy: userId
      });

      this.logger.info(`Action item updated: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error updating action item:', error);
      throw error;
    }
  }

  async startActionItem(id, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      if (actionItem.status === ACTION_ITEM_STATUS.COMPLETED) {
        throw new AppError('Cannot start completed action items', 400);
      }

      await actionItem.start();
      this.logger.info(`Action item started: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error starting action item:', error);
      throw error;
    }
  }

  async updateProgress(id, percentage, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      await actionItem.updateProgress(percentage);
      this.logger.info(`Action item progress updated: ${id} to ${percentage}% by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error updating action item progress:', error);
      throw error;
    }
  }

  async completeActionItem(id, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      await actionItem.complete();
      this.logger.info(`Action item completed: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error completing action item:', error);
      throw error;
    }
  }

  async closeActionItem(id, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      await actionItem.close();
      this.logger.info(`Action item closed: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error closing action item:', error);
      throw error;
    }
  }

  async putOnHold(id, reason, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      if (actionItem.status === ACTION_ITEM_STATUS.COMPLETED) {
        throw new AppError('Cannot put completed action items on hold', 400);
      }

      await actionItem.putOnHold(reason);
      this.logger.info(`Action item put on hold: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error putting action item on hold:', error);
      throw error;
    }
  }

  async cancelActionItem(id, reason, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      if (actionItem.status === ACTION_ITEM_STATUS.COMPLETED) {
        throw new AppError('Cannot cancel completed action items', 400);
      }

      await actionItem.cancel(reason);
      this.logger.info(`Action item cancelled: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error cancelling action item:', error);
      throw error;
    }
  }

  async markOverdue(id, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      await actionItem.markOverdue();
      this.logger.info(`Action item marked overdue: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error marking action item overdue:', error);
      throw error;
    }
  }

  async addEvidence(id, evidence, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      await actionItem.addEvidence(evidence);
      this.logger.info(`Evidence added to action item: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error adding evidence to action item:', error);
      throw error;
    }
  }

  async removeEvidence(id, evidenceId, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      await actionItem.removeEvidence(evidenceId);
      this.logger.info(`Evidence removed from action item: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error removing evidence from action item:', error);
      throw error;
    }
  }

  async setFollowUp(id, followUpDate, notes, userId) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }

      await actionItem.setFollowUp(followUpDate, notes);
      this.logger.info(`Follow up set for action item: ${id} by user: ${userId}`);
      return actionItem;
    } catch (error) {
      this.logger.error('Error setting follow up for action item:', error);
      throw error;
    }
  }

  async getActionItemById(id) {
    try {
      const actionItem = await this.repository.findById(id);
      if (!actionItem) {
        throw new AppError('Action item not found', 404);
      }
      return actionItem;
    } catch (error) {
      this.logger.error('Error getting action item by ID:', error);
      throw error;
    }
  }

  async getActionItemsByAssignedEmployee(employeeId, options = {}) {
    try {
      return await this.repository.findByAssignedEmployee(employeeId, options);
    } catch (error) {
      this.logger.error('Error getting action items by assigned employee:', error);
      throw error;
    }
  }

  async getActionItemsByAssignedDepartment(departmentId, options = {}) {
    try {
      return await this.repository.findByAssignedDepartment(departmentId, options);
    } catch (error) {
      this.logger.error('Error getting action items by assigned department:', error);
      throw error;
    }
  }

  async getActionItemsByMeeting(meetingId, options = {}) {
    try {
      return await this.repository.findByMeeting(meetingId, options);
    } catch (error) {
      this.logger.error('Error getting action items by meeting:', error);
      throw error;
    }
  }

  async getActionItemsByMinutes(minutesId, options = {}) {
    try {
      return await this.repository.findByMinutes(minutesId, options);
    } catch (error) {
      this.logger.error('Error getting action items by minutes:', error);
      throw error;
    }
  }

  async getActionItemsByStatus(status, options = {}) {
    try {
      return await this.repository.findByStatus(status, options);
    } catch (error) {
      this.logger.error('Error getting action items by status:', error);
      throw error;
    }
  }

  async getActionItemsByPriority(priority, options = {}) {
    try {
      return await this.repository.findByPriority(priority, options);
    } catch (error) {
      this.logger.error('Error getting action items by priority:', error);
      throw error;
    }
  }

  async getOverdueActionItems(options = {}) {
    try {
      return await this.repository.findOverdue(options);
    } catch (error) {
      this.logger.error('Error getting overdue action items:', error);
      throw error;
    }
  }

  async getActionItemsDueSoon(days = 7, options = {}) {
    try {
      return await this.repository.findDueSoon(days, options);
    } catch (error) {
      this.logger.error('Error getting action items due soon:', error);
      throw error;
    }
  }

  async getActionItemsByDateRange(startDate, endDate, options = {}) {
    try {
      return await this.repository.findByDateRange(startDate, endDate, options);
    } catch (error) {
      this.logger.error('Error getting action items by date range:', error);
      throw error;
    }
  }

  async getDepartmentActionItemStats(departmentId) {
    try {
      return await this.repository.getDepartmentActionItemStats(departmentId);
    } catch (error) {
      this.logger.error('Error getting department action item stats:', error);
      throw error;
    }
  }

  async getEmployeeActionItemStats(employeeId) {
    try {
      return await this.repository.getEmployeeActionItemStats(employeeId);
    } catch (error) {
      this.logger.error('Error getting employee action item stats:', error);
      throw error;
    }
  }

  async deleteActionItem(id, userId) {
    try {
      await this.repository.softDelete(id, userId);
      this.logger.info(`Action item deleted: ${id} by user: ${userId}`);
    } catch (error) {
      this.logger.error('Error deleting action item:', error);
      throw error;
    }
  }

  async bulkUpdateStatus(actionItemIds, status, userId) {
    try {
      const results = await Promise.all(
        actionItemIds.map(id => this.repository.update(id, { status, updatedBy: userId }))
      );

      this.logger.info(`Bulk status update: ${actionItemIds.length} action items to ${status} by user: ${userId}`);
      return results;
    } catch (error) {
      this.logger.error('Error in bulk status update:', error);
      throw error;
    }
  }
}

const actionItemService = new ActionItemService();
export default actionItemService;
