import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import attendanceRepository from './attendance.repository.js';
import { ATTENDANCE_STATUS } from './meeting.constants.js';

class AttendanceService {
  constructor() {
    this.repository = attendanceRepository;
    this.logger = Logger;
  }

  async createAttendance(data, userId) {
    try {
      // Check if attendance already exists for this meeting and employee
      const existingAttendance = await this.repository.findOne({
        meeting: data.meeting,
        employee: data.employee
      });

      if (existingAttendance) {
        throw new AppError('Attendance record already exists for this meeting and employee', 400);
      }

      const attendance = await this.repository.create({
        ...data,
        createdBy: userId,
        updatedBy: userId
      });

      this.logger.info(`Attendance created: ${attendance._id} by user: ${userId}`);
      return attendance;
    } catch (error) {
      this.logger.error('Error creating attendance:', error);
      throw error;
    }
  }

  async updateAttendance(id, data, userId) {
    try {
      const existingAttendance = await this.repository.findById(id);
      if (!existingAttendance) {
        throw new AppError('Attendance not found', 404);
      }

      const attendance = await this.repository.update(id, {
        ...data,
        updatedBy: userId
      });

      this.logger.info(`Attendance updated: ${id} by user: ${userId}`);
      return attendance;
    } catch (error) {
      this.logger.error('Error updating attendance:', error);
      throw error;
    }
  }

  async checkIn(meetingId, employeeId, checkInTime, userId) {
    try {
      const attendance = await this.repository.findOne({
        meeting: meetingId,
        employee: employeeId
      });

      if (!attendance) {
        throw new AppError('Attendance record not found', 404);
      }

      if (attendance.checkIn) {
        throw new AppError('Already checked in', 400);
      }

      await attendance.checkIn(checkInTime);
      this.logger.info(`Check in: employee ${employeeId} for meeting ${meetingId} by user: ${userId}`);
      return attendance;
    } catch (error) {
      this.logger.error('Error checking in:', error);
      throw error;
    }
  }

  async checkOut(meetingId, employeeId, checkOutTime, userId) {
    try {
      const attendance = await this.repository.findOne({
        meeting: meetingId,
        employee: employeeId
      });

      if (!attendance) {
        throw new AppError('Attendance record not found', 404);
      }

      if (!attendance.checkIn) {
        throw new AppError('Must check in before checking out', 400);
      }

      if (attendance.checkOut) {
        throw new AppError('Already checked out', 400);
      }

      await attendance.checkOut(checkOutTime);
      this.logger.info(`Check out: employee ${employeeId} for meeting ${meetingId} by user: ${userId}`);
      return attendance;
    } catch (error) {
      this.logger.error('Error checking out:', error);
      throw error;
    }
  }

  async markAbsent(meetingId, employeeId, reason, userId) {
    try {
      const attendance = await this.repository.findOne({
        meeting: meetingId,
        employee: employeeId
      });

      if (!attendance) {
        throw new AppError('Attendance record not found', 404);
      }

      await attendance.markAbsent(reason);
      this.logger.info(`Marked absent: employee ${employeeId} for meeting ${meetingId} by user: ${userId}`);
      return attendance;
    } catch (error) {
      this.logger.error('Error marking absent:', error);
      throw error;
    }
  }

  async markExcused(meetingId, employeeId, reason, userId) {
    try {
      const attendance = await this.repository.findOne({
        meeting: meetingId,
        employee: employeeId
      });

      if (!attendance) {
        throw new AppError('Attendance record not found', 404);
      }

      await attendance.markExcused(reason);
      this.logger.info(`Marked excused: employee ${employeeId} for meeting ${meetingId} by user: ${userId}`);
      return attendance;
    } catch (error) {
      this.logger.error('Error marking excused:', error);
      throw error;
    }
  }

  async markNoShow(meetingId, employeeId, userId) {
    try {
      const attendance = await this.repository.findOne({
        meeting: meetingId,
        employee: employeeId
      });

      if (!attendance) {
        throw new AppError('Attendance record not found', 404);
      }

      await attendance.markNoShow();
      this.logger.info(`Marked no show: employee ${employeeId} for meeting ${meetingId} by user: ${userId}`);
      return attendance;
    } catch (error) {
      this.logger.error('Error marking no show:', error);
      throw error;
    }
  }

  async updateParticipationScore(id, score, userId) {
    try {
      const attendance = await this.repository.findById(id);
      if (!attendance) {
        throw new AppError('Attendance not found', 404);
      }

      await attendance.updateParticipationScore(score);
      this.logger.info(`Participation score updated: ${id} by user: ${userId}`);
      return attendance;
    } catch (error) {
      this.logger.error('Error updating participation score:', error);
      throw error;
    }
  }

  async bulkCheckIn(meetingId, employeeIds, userId) {
    try {
      const results = await Promise.all(
        employeeIds.map(employeeId =>
          this.checkIn(meetingId, employeeId, new Date(), userId)
        )
      );

      this.logger.info(`Bulk check in: ${employeeIds.length} employees for meeting ${meetingId} by user: ${userId}`);
      return results;
    } catch (error) {
      this.logger.error('Error in bulk check in:', error);
      throw error;
    }
  }

  async bulkCheckOut(meetingId, employeeIds, userId) {
    try {
      const results = await Promise.all(
        employeeIds.map(employeeId =>
          this.checkOut(meetingId, employeeId, new Date(), userId)
        )
      );

      this.logger.info(`Bulk check out: ${employeeIds.length} employees for meeting ${meetingId} by user: ${userId}`);
      return results;
    } catch (error) {
      this.logger.error('Error in bulk check out:', error);
      throw error;
    }
  }

  async getAttendanceById(id) {
    try {
      const attendance = await this.repository.findById(id);
      if (!attendance) {
        throw new AppError('Attendance not found', 404);
      }
      return attendance;
    } catch (error) {
      this.logger.error('Error getting attendance by ID:', error);
      throw error;
    }
  }

  async getAttendanceByMeeting(meetingId, options = {}) {
    try {
      return await this.repository.findByMeeting(meetingId, options);
    } catch (error) {
      this.logger.error('Error getting attendance by meeting:', error);
      throw error;
    }
  }

  async getAttendanceByEmployee(employeeId, options = {}) {
    try {
      return await this.repository.findByEmployee(employeeId, options);
    } catch (error) {
      this.logger.error('Error getting attendance by employee:', error);
      throw error;
    }
  }

  async getAttendanceByStatus(status, options = {}) {
    try {
      return await this.repository.findByStatus(status, options);
    } catch (error) {
      this.logger.error('Error getting attendance by status:', error);
      throw error;
    }
  }

  async getAttendanceByDateRange(startDate, endDate, options = {}) {
    try {
      return await this.repository.findByDateRange(startDate, endDate, options);
    } catch (error) {
      this.logger.error('Error getting attendance by date range:', error);
      throw error;
    }
  }

  async getMeetingAttendanceStats(meetingId) {
    try {
      return await this.repository.getMeetingAttendanceStats(meetingId);
    } catch (error) {
      this.logger.error('Error getting meeting attendance stats:', error);
      throw error;
    }
  }

  async getEmployeeAttendanceStats(employeeId, startDate, endDate) {
    try {
      return await this.repository.getEmployeeAttendanceStats(employeeId, startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting employee attendance stats:', error);
      throw error;
    }
  }

  async deleteAttendance(id, userId) {
    try {
      await this.repository.softDelete(id, userId);
      this.logger.info(`Attendance deleted: ${id} by user: ${userId}`);
    } catch (error) {
      this.logger.error('Error deleting attendance:', error);
      throw error;
    }
  }
}

const attendanceService = new AttendanceService();
export default attendanceService;
