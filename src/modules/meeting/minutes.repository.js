import MeetingMinutes from './meetingMinutes.model.js';
import Logger from '../../core/utils/logger.js';

class MinutesRepository {
  constructor() {
    this.model = MeetingMinutes;
    this.logger = Logger;
  }

  async create(data) {
    try {
      const minutes = new this.model(data);
      await minutes.save();
      return minutes;
    } catch (error) {
      this.logger.error('Error creating minutes:', error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    const { lean = true } = options;
    try {
      const query = this.model.findById(id).populate('meeting', '_id title startTime endTime').populate('preparedBy', '_id firstName lastName employeeId').populate('approvedBy', '_id firstName lastName employeeId').populate('actionItems');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding minutes by ID:', error);
      throw error;
    }
  }

  async findOne(filter, options = {}) {
    const { lean = true } = options;
    try {
      const query = this.model.findOne({ ...filter, isDeleted: false }).populate('meeting', '_id title startTime endTime').populate('preparedBy', '_id firstName lastName employeeId').populate('approvedBy', '_id firstName lastName employeeId').populate('actionItems');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding minutes:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0, lean = true } = options;
    try {
      const query = this.model.find({ ...filter, isDeleted: false }).sort(sort).limit(limit).skip(skip).populate('meeting', '_id title startTime endTime').populate('preparedBy', '_id firstName lastName employeeId').populate('approvedBy', '_id firstName lastName employeeId').populate('actionItems');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding all minutes:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }).populate('meeting', '_id title startTime endTime').populate('preparedBy', '_id firstName lastName employeeId').populate('approvedBy', '_id firstName lastName employeeId').populate('actionItems');
    } catch (error) {
      this.logger.error('Error updating minutes:', error);
      throw error;
    }
  }

  async softDelete(id, deletedBy) {
    try {
      return await this.model.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true });
    } catch (error) {
      this.logger.error('Error soft deleting minutes:', error);
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
      this.logger.error('Error restoring minutes:', error);
      throw error;
    }
  }

  async exists(filter) {
    try {
      return await this.model.exists({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error checking minutes existence:', error);
      throw error;
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error counting minutes:', error);
      throw error;
    }
  }

  async paginate(filter, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;
    try {
      const [data, total] = await Promise.all([this.findAll({ filter, sort, limit, skip }), this.count(filter)]);
      return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total, hasPrev: skip > 0 } };
    } catch (error) {
      this.logger.error('Error paginating minutes:', error);
      throw error;
    }
  }

  async findByMeeting(meetingId) {
    try {
      return await this.model.findByMeeting(meetingId);
    } catch (error) {
      this.logger.error('Error finding minutes by meeting:', error);
      throw error;
    }
  }

  async findByPreparedBy(preparedById, options = {}) {
    try {
      return await this.model.findByPreparedBy(preparedById, options);
    } catch (error) {
      this.logger.error('Error finding minutes by prepared by:', error);
      throw error;
    }
  }

  async findByApprovalStatus(status, options = {}) {
    try {
      return await this.model.findByApprovalStatus(status, options);
    } catch (error) {
      this.logger.error('Error finding minutes by approval status:', error);
      throw error;
    }
  }

  async findPendingFollowUp(options = {}) {
    try {
      return await this.model.findPendingFollowUp(options);
    } catch (error) {
      this.logger.error('Error finding pending follow-up minutes:', error);
      throw error;
    }
  }

  async updateMany(filter, data) {
    try {
      return await this.model.updateMany({ ...filter, isDeleted: false }, { ...data, updatedAt: new Date() });
    } catch (error) {
      this.logger.error('Error updating many minutes:', error);
      throw error;
    }
  }

  async deleteMany(filter) {
    try {
      return await this.model.deleteMany({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error deleting many minutes:', error);
      throw error;
    }
  }

  async softDeleteMany(filter, deletedBy) {
    try {
      return await this.model.updateMany({ ...filter, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy });
    } catch (error) {
      this.logger.error('Error soft deleting many minutes:', error);
      throw error;
    }
  }
}

const minutesRepository = new MinutesRepository();
Object.freeze(minutesRepository);
export default minutesRepository;
