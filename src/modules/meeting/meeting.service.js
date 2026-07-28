import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import meetingRepository from './meeting.repository.js';
import { MEETING_STATUS, MEETING_DURATION_LIMITS, MEETING_CAPACITY } from './meeting.constants.js';

class MeetingService {
  constructor() {
    this.repository = meetingRepository;
    this.logger = Logger;
  }

  async createMeeting(data, userId) {
    try {
      // Validate meeting duration
      const duration = data.duration || MEETING_DURATION_LIMITS.DEFAULT_DURATION;
      if (duration < MEETING_DURATION_LIMITS.MIN_DURATION || duration > MEETING_DURATION_LIMITS.MAX_DURATION) {
        throw new AppError(`Duration must be between ${MEETING_DURATION_LIMITS.MIN_DURATION} and ${MEETING_DURATION_LIMITS.MAX_DURATION} minutes`, 400);
      }

      // Validate participant count based on meeting type
      const maxParticipants = this.getMaxParticipantsForType(data.type);
      if (data.participants && data.participants.length > maxParticipants) {
        throw new AppError(`Maximum ${maxParticipants} participants allowed for ${data.type} meetings`, 400);
      }

      // Validate meeting times
      if (data.startTime >= data.endTime) {
        throw new AppError('End time must be after start time', 400);
      }

      // Calculate duration if not provided
      if (!data.duration) {
        data.duration = Math.round((new Date(data.endTime) - new Date(data.startTime)) / (1000 * 60));
      }

      // Set organizer as host if not provided
      if (!data.host) {
        data.host = data.organizer;
      }

      // Set initial status
      data.status = MEETING_STATUS.SCHEDULED;
      data.totalParticipants = data.participants ? data.participants.length : 0;

      // Create meeting
      const meeting = await this.repository.create({
        ...data,
        createdBy: userId,
        updatedBy: userId
      });

      // Generate meeting code
      await meeting.generateMeetingCode();

      this.logger.info(`Meeting created: ${meeting._id} by user: ${userId}`);
      return meeting;
    } catch (error) {
      this.logger.error('Error creating meeting:', error);
      throw error;
    }
  }

  async updateMeeting(id, data, userId) {
    try {
      const existingMeeting = await this.repository.findById(id);
      if (!existingMeeting) {
        throw new AppError('Meeting not found', 404);
      }

      // Validate meeting can be updated
      if (existingMeeting.status === MEETING_STATUS.COMPLETED || existingMeeting.status === MEETING_STATUS.CANCELLED) {
        throw new AppError('Cannot update completed or cancelled meetings', 400);
      }

      // Validate duration if provided
      if (data.duration) {
        if (data.duration < MEETING_DURATION_LIMITS.MIN_DURATION || data.duration > MEETING_DURATION_LIMITS.MAX_DURATION) {
          throw new AppError(`Duration must be between ${MEETING_DURATION_LIMITS.MIN_DURATION} and ${MEETING_DURATION_LIMITS.MAX_DURATION} minutes`, 400);
        }
      }

      // Validate participant count if provided
      if (data.participants) {
        const maxParticipants = this.getMaxParticipantsForType(data.type || existingMeeting.type);
        if (data.participants.length > maxParticipants) {
          throw new AppError(`Maximum ${maxParticipants} participants allowed`, 400);
        }
        data.totalParticipants = data.participants.length;
      }

      // Update meeting
      const meeting = await this.repository.update(id, {
        ...data,
        updatedBy: userId
      });

      this.logger.info(`Meeting updated: ${id} by user: ${userId}`);
      return meeting;
    } catch (error) {
      this.logger.error('Error updating meeting:', error);
      throw error;
    }
  }

  async cancelMeeting(id, reason, userId) {
    try {
      const meeting = await this.repository.findById(id);
      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      if (meeting.status === MEETING_STATUS.COMPLETED) {
        throw new AppError('Cannot cancel completed meetings', 400);
      }

      await meeting.cancel(userId, reason);
      this.logger.info(`Meeting cancelled: ${id} by user: ${userId}`);
      return meeting;
    } catch (error) {
      this.logger.error('Error cancelling meeting:', error);
      throw error;
    }
  }

  async rescheduleMeeting(id, newStartTime, newEndTime, userId) {
    try {
      const meeting = await this.repository.findById(id);
      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      if (meeting.status === MEETING_STATUS.COMPLETED || meeting.status === MEETING_STATUS.CANCELLED) {
        throw new AppError('Cannot reschedule completed or cancelled meetings', 400);
      }

      if (newStartTime >= newEndTime) {
        throw new AppError('End time must be after start time', 400);
      }

      await meeting.reschedule(newStartTime, newEndTime, userId);
      this.logger.info(`Meeting rescheduled: ${id} by user: ${userId}`);
      return meeting;
    } catch (error) {
      this.logger.error('Error rescheduling meeting:', error);
      throw error;
    }
  }

  async duplicateMeeting(id, newStartTime, newEndTime, userId) {
    try {
      const originalMeeting = await this.repository.findById(id);
      if (!originalMeeting) {
        throw new AppError('Meeting not found', 404);
      }

      const newMeetingData = {
        title: `${originalMeeting.title} (Copy)`,
        description: originalMeeting.description,
        type: originalMeeting.type,
        category: originalMeeting.category,
        mode: originalMeeting.mode,
        platform: originalMeeting.platform,
        department: originalMeeting.department,
        branch: originalMeeting.branch,
        project: originalMeeting.project,
        organizer: userId,
        host: userId,
        participants: originalMeeting.participants,
        meetingRoom: originalMeeting.meetingRoom,
        startTime: newStartTime,
        endTime: newEndTime,
        duration: Math.round((new Date(newEndTime) - new Date(newStartTime)) / (1000 * 60)),
        timezone: originalMeeting.timezone,
        priority: originalMeeting.priority,
        tags: originalMeeting.tags
      };

      const newMeeting = await this.createMeeting(newMeetingData, userId);
      this.logger.info(`Meeting duplicated: ${id} -> ${newMeeting._id} by user: ${userId}`);
      return newMeeting;
    } catch (error) {
      this.logger.error('Error duplicating meeting:', error);
      throw error;
    }
  }

  async startMeeting(id, userId) {
    try {
      const meeting = await this.repository.findById(id);
      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      if (meeting.status !== MEETING_STATUS.SCHEDULED) {
        throw new AppError('Meeting is not in scheduled status', 400);
      }

      await meeting.start();
      this.logger.info(`Meeting started: ${id} by user: ${userId}`);
      return meeting;
    } catch (error) {
      this.logger.error('Error starting meeting:', error);
      throw error;
    }
  }

  async completeMeeting(id, userId) {
    try {
      const meeting = await this.repository.findById(id);
      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      if (meeting.status !== MEETING_STATUS.IN_PROGRESS) {
        throw new AppError('Meeting is not in progress', 400);
      }

      await meeting.complete();
      this.logger.info(`Meeting completed: ${id} by user: ${userId}`);
      return meeting;
    } catch (error) {
      this.logger.error('Error completing meeting:', error);
      throw error;
    }
  }

  async addParticipant(id, participantId, userId) {
    try {
      const meeting = await this.repository.findById(id);
      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      if (meeting.status === MEETING_STATUS.COMPLETED || meeting.status === MEETING_STATUS.CANCELLED) {
        throw new AppError('Cannot add participants to completed or cancelled meetings', 400);
      }

      await meeting.addParticipant(participantId);
      this.logger.info(`Participant added: ${participantId} to meeting: ${id} by user: ${userId}`);
      return meeting;
    } catch (error) {
      this.logger.error('Error adding participant:', error);
      throw error;
    }
  }

  async removeParticipant(id, participantId, userId) {
    try {
      const meeting = await this.repository.findById(id);
      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      if (meeting.status === MEETING_STATUS.COMPLETED || meeting.status === MEETING_STATUS.CANCELLED) {
        throw new AppError('Cannot remove participants from completed or cancelled meetings', 400);
      }

      await meeting.removeParticipant(participantId);
      this.logger.info(`Participant removed: ${participantId} from meeting: ${id} by user: ${userId}`);
      return meeting;
    } catch (error) {
      this.logger.error('Error removing participant:', error);
      throw error;
    }
  }

  async getMeetingById(id) {
    try {
      const meeting = await this.repository.findById(id);
      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }
      return meeting;
    } catch (error) {
      this.logger.error('Error getting meeting by ID:', error);
      throw error;
    }
  }

  async getMeetingsByOrganizer(organizerId, options = {}) {
    try {
      return await this.repository.findByOrganizer(organizerId, options);
    } catch (error) {
      this.logger.error('Error getting meetings by organizer:', error);
      throw error;
    }
  }

  async getMeetingsByParticipant(participantId, options = {}) {
    try {
      return await this.repository.findByParticipant(participantId, options);
    } catch (error) {
      this.logger.error('Error getting meetings by participant:', error);
      throw error;
    }
  }

  async getMeetingsByDepartment(departmentId, options = {}) {
    try {
      return await this.repository.findByDepartment(departmentId, options);
    } catch (error) {
      this.logger.error('Error getting meetings by department:', error);
      throw error;
    }
  }

  async getMeetingsByProject(projectId, options = {}) {
    try {
      return await this.repository.findByProject(projectId, options);
    } catch (error) {
      this.logger.error('Error getting meetings by project:', error);
      throw error;
    }
  }

  async getMeetingsByDateRange(startDate, endDate, options = {}) {
    try {
      return await this.repository.findByDateRange(startDate, endDate, options);
    } catch (error) {
      this.logger.error('Error getting meetings by date range:', error);
      throw error;
    }
  }

  async getUpcomingMeetings(options = {}) {
    try {
      return await this.repository.findUpcoming(options);
    } catch (error) {
      this.logger.error('Error getting upcoming meetings:', error);
      throw error;
    }
  }

  async getPastMeetings(options = {}) {
    try {
      return await this.repository.findPast(options);
    } catch (error) {
      this.logger.error('Error getting past meetings:', error);
      throw error;
    }
  }

  async deleteMeeting(id, userId) {
    try {
      await this.repository.softDelete(id, userId);
      this.logger.info(`Meeting deleted: ${id} by user: ${userId}`);
    } catch (error) {
      this.logger.error('Error deleting meeting:', error);
      throw error;
    }
  }

  async getMeetingHistory(employeeId, options = {}) {
    try {
      const [organizedMeetings, participatedMeetings] = await Promise.all([
        this.repository.findByOrganizer(employeeId, options),
        this.repository.findByParticipant(employeeId, options)
      ]);

      return {
        organized: organizedMeetings,
        participated: participatedMeetings
      };
    } catch (error) {
      this.logger.error('Error getting meeting history:', error);
      throw error;
    }
  }

  getMaxParticipantsForType(type) {
    switch (type) {
      case 'one_on_one':
        return MEETING_CAPACITY.ONE_ON_ONE;
      case 'team':
        return MEETING_CAPACITY.TEAM;
      case 'department':
        return MEETING_CAPACITY.DEPARTMENT;
      case 'all_hands':
        return MEETING_CAPACITY.ALL_HANDS;
      case 'board':
        return MEETING_CAPACITY.BOARD;
      default:
        return MEETING_CAPACITY.SMALL_TEAM;
    }
  }
}

const meetingService = new MeetingService();
export default meetingService;
