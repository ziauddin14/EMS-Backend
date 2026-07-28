import MeetingAttendance from './meetingAttendance.model.js';
import Logger from '../../core/utils/logger.js';

class AttendanceRepository {
  constructor() {
    this.model = MeetingAttendance;
    this.logger = Logger;
  }

  async create(data) {
    try {
      const attendance = new this.model(data);
      await attendance.save();
      return attendance;
    } catch (error) {
      this.logger.error('Error creating attendance:', error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    const { lean = true } = options;
    try {
      const query = this.model.findById(id).populate('employee', '_id firstName lastName employeeId').populate('meeting', '_id title startTime endTime');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding attendance by ID:', error);
      throw error;
    }
  }

  async findOne(filter, options = {}) {
    const { lean = true } = options;
    try {
      const query = this.model.findOne({ ...filter, isDeleted: false }).populate('employee', '_id firstName lastName employeeId').populate('meeting', '_id title startTime endTime');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding attendance:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { checkIn: -1 }, limit = 100, skip = 0, lean = true } = options;
    try {
      const query = this.model.find({ ...filter, isDeleted: false }).sort(sort).limit(limit).skip(skip).populate('employee', '_id firstName lastName employeeId').populate('meeting', '_id title startTime endTime');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding all attendance:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }).populate('employee', '_id firstName lastName employeeId').populate('meeting', '_id title startTime endTime');
    } catch (error) {
      this.logger.error('Error updating attendance:', error);
      throw error;
    }
  }

  async softDelete(id, deletedBy) {
    try {
      return await this.model.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true });
    } catch (error) {
      this.logger.error('Error soft deleting attendance:', error);
      throw error;
    }
  }

  async softDeleteById(id, deletedBy) {
    return await this.softDelete(id, deletedBy);
  }

  async restore(id) {
    try {
      return await this.model.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true });
    } catch (error) {
      this.logger.error('Error restoring attendance:', error);
      throw error;
    }
  }

  async exists(filter) {
    try {
      return await this.model.exists({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error checking attendance existence:', error);
      throw error;
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error counting attendance:', error);
      throw error;
    }
  }

  async paginate(filter, options = {}) {
    const { page = 1, limit = 10, sort = { checkIn: -1 } } = options;
    const skip = (page - 1) * limit;
    try {
      const [data, total] = await Promise.all([this.findAll({ filter, sort, limit, skip }), this.count(filter)]);
      return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total, hasPrev: skip > 0 } };
    } catch (error) {
      this.logger.error('Error paginating attendance:', error);
      throw error;
    }
  }

  async findByMeeting(meetingId, options = {}) {
    try {
      return await this.model.findByMeeting(meetingId, options);
    } catch (error) {
      this.logger.error('Error finding attendance by meeting:', error);
      throw error;
    }
  }

  async findByEmployee(employeeId, options = {}) {
    try {
      return await this.model.findByEmployee(employeeId, options);
    } catch (error) {
      this.logger.error('Error finding attendance by employee:', error);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      return await this.model.findByStatus(status, options);
    } catch (error) {
      this.logger.error('Error finding attendance by status:', error);
      throw error;
    }
  }

  async findByDateRange(startDate, endDate, options = {}) {
    try {
      return await this.model.findByDateRange(startDate, endDate, options);
    } catch (error) {
      this.logger.error('Error finding attendance by date range:', error);
      throw error;
    }
  }

  async getMeetingAttendanceStats(meetingId) {
    try {
      return await this.model.getMeetingAttendanceStats(meetingId);
    } catch (error) {
      this.logger.error('Error getting meeting attendance stats:', error);
      throw error;
    }
  }

  async getEmployeeAttendanceStats(employeeId, startDate, endDate) {
    try {
      return await this.model.getEmployeeAttendanceStats(employeeId, startDate, endDate);
    } catch (error) {
      this.logger.error('Error getting employee attendance stats:', error);
      throw error;
    }
  }

  async updateMany(filter, data) {
    try {
      return await this.model.updateMany({ ...filter, isDeleted: false }, { ...data, updatedAt: new Date() });
    } catch (error) {
      this.logger.error('Error updating many attendance:', error);
      throw error;
    }
  }

  async deleteMany(filter) {
    try {
      return await this.model.deleteMany({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error deleting many attendance:', error);
      throw error;
    }
  }

  async softDeleteMany(filter, deletedBy) {
    try {
      return await this.model.updateMany({ ...filter, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy });
    } catch (error) {
      this.logger.error('Error soft deleting many attendance:', error);
      throw error;
    }
  }
}

const attendanceRepository = new AttendanceRepository();
Object.freeze(attendanceRepository);
export default attendanceRepository;
