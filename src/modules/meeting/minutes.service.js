import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import minutesRepository from './minutes.repository.js';
import { MINUTES_APPROVAL_STATUS } from './meeting.constants.js';

class MinutesService {
  constructor() {
    this.repository = minutesRepository;
    this.logger = Logger;
  }

  async createMinutes(data, userId) {
    try {
      // Check if minutes already exist for this meeting
      const existingMinutes = await this.repository.findByMeeting(data.meeting);
      if (existingMinutes) {
        throw new AppError('Minutes already exist for this meeting', 400);
      }

      const minutes = await this.repository.create({
        ...data,
        preparedBy: userId,
        createdBy: userId,
        updatedBy: userId
      });

      this.logger.info(`Minutes created: ${minutes._id} by user: ${userId}`);
      return minutes;
    } catch (error) {
      this.logger.error('Error creating minutes:', error);
      throw error;
    }
  }

  async updateMinutes(id, data, userId) {
    try {
      const existingMinutes = await this.repository.findById(id);
      if (!existingMinutes) {
        throw new AppError('Minutes not found', 404);
      }

      if (existingMinutes.approvalStatus === MINUTES_APPROVAL_STATUS.APPROVED) {
        throw new AppError('Cannot update approved minutes', 400);
      }

      const minutes = await this.repository.update(id, {
        ...data,
        updatedBy: userId
      });

      this.logger.info(`Minutes updated: ${id} by user: ${userId}`);
      return minutes;
    } catch (error) {
      this.logger.error('Error updating minutes:', error);
      throw error;
    }
  }

  async submitForReview(id, userId) {
    try {
      const minutes = await this.repository.findById(id);
      if (!minutes) {
        throw new AppError('Minutes not found', 404);
      }

      await minutes.submitForReview();
      this.logger.info(`Minutes submitted for review: ${id} by user: ${userId}`);
      return minutes;
    } catch (error) {
      this.logger.error('Error submitting minutes for review:', error);
      throw error;
    }
  }

  async approveMinutes(id, approverId) {
    try {
      const minutes = await this.repository.findById(id);
      if (!minutes) {
        throw new AppError('Minutes not found', 404);
      }

      await minutes.approve(approverId);
      this.logger.info(`Minutes approved: ${id} by user: ${approverId}`);
      return minutes;
    } catch (error) {
      this.logger.error('Error approving minutes:', error);
      throw error;
    }
  }

  async rejectMinutes(id, approverId, reason) {
    try {
      const minutes = await this.repository.findById(id);
      if (!minutes) {
        throw new AppError('Minutes not found', 404);
      }

      await minutes.reject(approverId, reason);
      this.logger.info(`Minutes rejected: ${id} by user: ${approverId}`);
      return minutes;
    } catch (error) {
      this.logger.error('Error rejecting minutes:', error);
      throw error;
    }
  }

  async finalizeMinutes(id, userId) {
    try {
      const minutes = await this.repository.findById(id);
      if (!minutes) {
        throw new AppError('Minutes not found', 404);
      }

      await minutes.finalize();
      this.logger.info(`Minutes finalized: ${id} by user: ${userId}`);
      return minutes;
    } catch (error) {
      this.logger.error('Error finalizing minutes:', error);
      throw error;
    }
  }

  async addActionItem(minutesId, actionItemId, userId) {
    try {
      const minutes = await this.repository.findById(minutesId);
      if (!minutes) {
        throw new AppError('Minutes not found', 404);
      }

      await minutes.addActionItem(actionItemId);
      this.logger.info(`Action item added: ${actionItemId} to minutes: ${minutesId} by user: ${userId}`);
      return minutes;
    } catch (error) {
      this.logger.error('Error adding action item to minutes:', error);
      throw error;
    }
  }

  async removeActionItem(minutesId, actionItemId, userId) {
    try {
      const minutes = await this.repository.findById(minutesId);
      if (!minutes) {
        throw new AppError('Minutes not found', 404);
      }

      await minutes.removeActionItem(actionItemId);
      this.logger.info(`Action item removed: ${actionItemId} from minutes: ${minutesId} by user: ${userId}`);
      return minutes;
    } catch (error) {
      this.logger.error('Error removing action item from minutes:', error);
      throw error;
    }
  }

  async getMinutesById(id) {
    try {
      const minutes = await this.repository.findById(id);
      if (!minutes) {
        throw new AppError('Minutes not found', 404);
      }
      return minutes;
    } catch (error) {
      this.logger.error('Error getting minutes by ID:', error);
      throw error;
    }
  }

  async getMinutesByMeeting(meetingId) {
    try {
      const minutes = await this.repository.findByMeeting(meetingId);
      if (!minutes) {
        throw new AppError('Minutes not found for this meeting', 404);
      }
      return minutes;
    } catch (error) {
      this.logger.error('Error getting minutes by meeting:', error);
      throw error;
    }
  }

  async getMinutesByPreparedBy(preparedById, options = {}) {
    try {
      return await this.repository.findByPreparedBy(preparedById, options);
    } catch (error) {
      this.logger.error('Error getting minutes by prepared by:', error);
      throw error;
    }
  }

  async getMinutesByApprovalStatus(status, options = {}) {
    try {
      return await this.repository.findByApprovalStatus(status, options);
    } catch (error) {
      this.logger.error('Error getting minutes by approval status:', error);
      throw error;
    }
  }

  async getPendingFollowUp(options = {}) {
    try {
      return await this.repository.findPendingFollowUp(options);
    } catch (error) {
      this.logger.error('Error getting pending follow-up minutes:', error);
      throw error;
    }
  }

  async deleteMinutes(id, userId) {
    try {
      await this.repository.softDelete(id, userId);
      this.logger.info(`Minutes deleted: ${id} by user: ${userId}`);
    } catch (error) {
      this.logger.error('Error deleting minutes:', error);
      throw error;
    }
  }
}

const minutesService = new MinutesService();
export default minutesService;
