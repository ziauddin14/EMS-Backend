import Agenda from './agenda.model.js';
import Logger from '../../core/utils/logger.js';

class AgendaRepository {
  constructor() {
    this.model = Agenda;
    this.logger = Logger;
  }

  async create(data) {
    try {
      const agenda = new this.model(data);
      await agenda.save();
      return agenda;
    } catch (error) {
      this.logger.error('Error creating agenda:', error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    const { lean = true } = options;
    try {
      const query = this.model.findById(id).populate('presenter', '_id firstName lastName employeeId').populate('meeting', '_id title startTime endTime');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding agenda by ID:', error);
      throw error;
    }
  }

  async findOne(filter, options = {}) {
    const { lean = true } = options;
    try {
     const query = this.model.findOne({ ...filter, isDeleted: false }).populate('presenter', '_id firstName lastName employeeId').populate('meeting', '_id title startTime endTime');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding agenda:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { sequence: 1 }, limit = 100, skip = 0, lean = true } = options;
    try {
      const query = this.model.find({ ...filter, isDeleted: false }).sort(sort).limit(limit).skip(skip).populate('presenter', '_id firstName lastName employeeId').populate('meeting', '_id title startTime endTime');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding all agendas:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }).populate('presenter', '_id firstName lastName employeeId').populate('meeting', '_id title startTime endTime');
    } catch (error) {
      this.logger.error('Error updating agenda:', error);
      throw error;
    }
  }

  async softDelete(id, deletedBy) {
    try {
      return await this.model.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true });
    } catch (error) {
      this.logger.error('Error soft deleting agenda:', error);
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
      this.logger.error('Error restoring agenda:', error);
      throw error;
    }
  }

  async exists(filter) {
    try {
      return await this.model.exists({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error checking agenda existence:', error);
      throw error;
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error counting agendas:', error);
      throw error;
    }
  }

  async paginate(filter, options = {}) {
    const { page = 1, limit = 10, sort = { sequence: 1 } } = options;
    const skip = (page - 1) * limit;
    try {
      const [data, total] = await Promise.all([this.findAll({ filter, sort, limit, skip }), this.count(filter)]);
      return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total, hasPrev: skip > 0 } };
    } catch (error) {
      this.logger.error('Error paginating agendas:', error);
      throw error;
    }
  }

  async findByMeeting(meetingId, options = {}) {
    try {
      return await this.model.findByMeeting(meetingId, options);
    } catch (error) {
      this.logger.error('Error finding agendas by meeting:', error);
      throw error;
    }
  }

  async findByPresenter(presenterId, options = {}) {
    try {
      return await this.model.findByPresenter(presenterId, options);
    } catch (error) {
      this.logger.error('Error finding agendas by presenter:', error);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      return await this.model.findByStatus(status, options);
    } catch (error) {
      this.logger.error('Error finding agendas by status:', error);
      throw error;
    }
  }

  async updateMany(filter, data) {
    try {
      return await this.model.updateMany({ ...filter, isDeleted: false }, { ...data, updatedAt: new Date() });
    } catch (error) {
      this.logger.error('Error updating many agendas:', error);
      throw error;
    }
  }

  async deleteMany(filter) {
    try {
      return await this.model.deleteMany({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error deleting many agendas:', error);
      throw error;
    }
  }

  async softDeleteMany(filter, deletedBy) {
    try {
      return await this.model.updateMany({ ...filter, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy });
    } catch (error) {
      this.logger.error('Error soft deleting many agendas:', error);
      throw error;
    }
  }
}

const agendaRepository = new AgendaRepository();
Object.freeze(agendaRepository);
export default agendaRepository;
