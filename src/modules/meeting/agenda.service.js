import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import agendaRepository from './agenda.repository.js';
import { AGENDA_STATUS } from './meeting.constants.js';

class AgendaService {
  constructor() {
    this.repository = agendaRepository;
    this.logger = Logger;
  }

  async createAgenda(data, userId) {
    try {
      // Validate estimated time
      if (data.estimatedTime < 1 || data.estimatedTime > 480) {
        throw new AppError('Estimated time must be between 1 and 480 minutes', 400);
      }

      // Validate sequence if provided
      if (data.sequence && data.sequence < 1) {
        throw new AppError('Sequence must be at least 1', 400);
      }

      const agenda = await this.repository.create({
        ...data,
        createdBy: userId,
        updatedBy: userId
      });

      this.logger.info(`Agenda created: ${agenda._id} by user: ${userId}`);
      return agenda;
    } catch (error) {
      this.logger.error('Error creating agenda:', error);
      throw error;
    }
  }

  async updateAgenda(id, data, userId) {
    try {
      const existingAgenda = await this.repository.findById(id);
      if (!existingAgenda) {
        throw new AppError('Agenda not found', 404);
      }

      // Validate estimated time if provided
      if (data.estimatedTime) {
        if (data.estimatedTime < 1 || data.estimatedTime > 480) {
          throw new AppError('Estimated time must be between 1 and 480 minutes', 400);
        }
      }

      const agenda = await this.repository.update(id, {
        ...data,
        updatedBy: userId
      });

      this.logger.info(`Agenda updated: ${id} by user: ${userId}`);
      return agenda;
    } catch (error) {
      this.logger.error('Error updating agenda:', error);
      throw error;
    }
  }

  async approveAgenda(id, userId) {
    try {
      const agenda = await this.repository.findById(id);
      if (!agenda) {
        throw new AppError('Agenda not found', 404);
      }

      await agenda.approve(userId);
      this.logger.info(`Agenda approved: ${id} by user: ${userId}`);
      return agenda;
    } catch (error) {
      this.logger.error('Error approving agenda:', error);
      throw error;
    }
  }

  async startAgenda(id, userId) {
    try {
      const agenda = await this.repository.findById(id);
      if (!agenda) {
        throw new AppError('Agenda not found', 404);
      }

      if (agenda.status !== AGENDA_STATUS.APPROVED) {
        throw new AppError('Agenda must be approved before starting', 400);
      }

      await agenda.start();
      this.logger.info(`Agenda started: ${id} by user: ${userId}`);
      return agenda;
    } catch (error) {
      this.logger.error('Error starting agenda:', error);
      throw error;
    }
  }

  async completeAgenda(id, userId) {
    try {
      const agenda = await this.repository.findById(id);
      if (!agenda) {
        throw new AppError('Agenda not found', 404);
      }

      await agenda.complete();
      this.logger.info(`Agenda completed: ${id} by user: ${userId}`);
      return agenda;
    } catch (error) {
      this.logger.error('Error completing agenda:', error);
      throw error;
    }
  }

  async cancelAgenda(id, userId) {
    try {
      const agenda = await this.repository.findById(id);
      if (!agenda) {
        throw new AppError('Agenda not found', 404);
      }

      await agenda.cancel();
      this.logger.info(`Agenda cancelled: ${id} by user: ${userId}`);
      return agenda;
    } catch (error) {
      this.logger.error('Error cancelling agenda:', error);
      throw error;
    }
  }

  async getAgendaById(id) {
    try {
      const agenda = await this.repository.findById(id);
      if (!agenda) {
        throw new AppError('Agenda not found', 404);
      }
      return agenda;
    } catch (error) {
      this.logger.error('Error getting agenda by ID:', error);
      throw error;
    }
  }

  async getAgendasByMeeting(meetingId, options = {}) {
    try {
      return await this.repository.findByMeeting(meetingId, options);
    } catch (error) {
      this.logger.error('Error getting agendas by meeting:', error);
      throw error;
    }
  }

  async getAgendasByPresenter(presenterId, options = {}) {
    try {
      return await this.repository.findByPresenter(presenterId, options);
    } catch (error) {
      this.logger.error('Error getting agendas by presenter:', error);
      throw error;
    }
  }

  async getAgendasByStatus(status, options = {}) {
    try {
      return await this.repository.findByStatus(status, options);
    } catch (error) {
      this.logger.error('Error getting agendas by status:', error);
      throw error;
    }
  }

  async deleteAgenda(id, userId) {
    try {
      await this.repository.softDelete(id, userId);
      this.logger.info(`Agenda deleted: ${id} by user: ${userId}`);
    } catch (error) {
      this.logger.error('Error deleting agenda:', error);
      throw error;
    }
  }

  async reorderAgendas(meetingId, agendaOrders, userId) {
    try {
      const updatePromises = agendaOrders.map(({ agendaId, sequence }) =>
        this.repository.update(agendaId, { sequence, updatedBy: userId })
      );

      const results = await Promise.all(updatePromises);
      this.logger.info(`Agendas reordered for meeting: ${meetingId} by user: ${userId}`);
      return results;
    } catch (error) {
      this.logger.error('Error reordering agendas:', error);
      throw error;
    }
  }
}

const agendaService = new AgendaService();
export default agendaService;
