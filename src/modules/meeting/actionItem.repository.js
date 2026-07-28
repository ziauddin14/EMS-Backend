import ActionItem from './actionItem.model.js';
import Logger from '../../core/utils/logger.js';

class ActionItemRepository {
  constructor() {
    this.model = ActionItem;
    this.logger = Logger;
  }

  async create(data) {
    try {
      const actionItem = new this.model(data);
      await actionItem.save();
      return actionItem;
    } catch (error) {
      this.logger.error('Error creating action item:', error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    const { lean = true } = options;
    try {
      const query = this.model.findById(id).populate('assignedEmployee', '_id firstName lastName employeeId').populate('assignedDepartment', '_id name').populate('meeting', '_id title startTime endTime').populate('minutes', '_id summary');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding action item by ID:', error);
      throw error;
    }
  }

  async findOne(filter, options = {}) {
    const { lean = true } = options;
    try {
      const query = this.model.findOne({ ...filter, isDeleted: false }).populate('assignedEmployee', '_id firstName lastName employeeId').populate('assignedDepartment', '_id name').populate('meeting', '_id title startTime endTime').populate('minutes', '_id summary');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding action item:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { dueDate: 1 }, limit = 100, skip = 0, lean = true } = options;
    try {
      const query = this.model.find({ ...filter, isDeleted: false }).sort(sort).limit(limit).skip(skip).populate('assignedEmployee', '_id firstName lastName employeeId').populate('assignedDepartment', '_id name').populate('meeting', '_id title startTime endTime').populate('minutes', '_id summary');
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding all action items:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }).populate('assignedEmployee', '_id firstName lastName employeeId').populate('assignedDepartment', '_id name').populate('meeting', '_id title startTime endTime').populate('minutes', '_id summary');
    } catch (error) {
      this.logger.error('Error updating action item:', error);
      throw error;
    }
  }

  async softDelete(id, deletedBy) {
    try {
      return await this.model.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true });
    } catch (error) {
      this.logger.error('Error soft deleting action item:', error);
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
      this.logger.error('Error restoring action item:', error);
      throw error;
    }
  }

  async exists(filter) {
    try {
      return await this.model.exists({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error checking action item existence:', error);
      throw error;
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error counting action items:', error);
      throw error;
    }
  }

  async paginate(filter, options = {}) {
    const { page = 1, limit = 10, sort = { dueDate: 1 } } = options;
    const skip = (page - 1) * limit;
    try {
      const [data, total] = await Promise.all([this.findAll({ filter, sort, limit, skip }), this.count(filter)]);
      return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total, hasPrev: skip > 0 } };
    } catch (error) {
      this.logger.error('Error paginating action items:', error);
      throw error;
    }
  }

  async findByAssignedEmployee(employeeId, options = {}) {
    try {
      return await this.model.findByAssignedEmployee(employeeId, options);
    } catch (error) {
      this.logger.error('Error finding action items by assigned employee:', error);
      throw error;
    }
  }

  async findByAssignedDepartment(departmentId, options = {}) {
    try {
      return await this.model.findByAssignedDepartment(departmentId, options);
    } catch (error) {
      this.logger.error('Error finding action items by assigned department:', error);
      throw error;
    }
  }

  async findByMeeting(meetingId, options = {}) {
    try {
      return await this.model.findByMeeting(meetingId, options);
    } catch (error) {
      this.logger.error('Error finding action items by meeting:', error);
      throw error;
    }
  }

  async findByMinutes(minutesId, options = {}) {
    try {
      return await this.model.findByMinutes(minutesId, options);
    } catch (error) {
      this.logger.error('Error finding action items by minutes:', error);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      return await this.model.findByStatus(status, options);
    } catch (error) {
      this.logger.error('Error finding action items by status:', error);
      throw error;
    }
  }

  async findByPriority(priority, options = {}) {
    try {
      return await this.model.findByPriority(priority, options);
    } catch (error) {
      this.logger.error('Error finding action items by priority:', error);
      throw error;
    }
  }

  async findOverdue(options = {}) {
    try {
      return await this.model.findOverdue(options);
    } catch (error) {
      this.logger.error('Error finding overdue action items:', error);
      throw error;
    }
  }

  async findDueSoon(days, options = {}) {
    try {
      return await this.model.findDueSoon(days, options);
    } catch (error) {
      this.logger.error('Error finding action items due soon:', error);
      throw error;
    }
  }

  async findByDateRange(startDate, endDate, options = {}) {
    try {
      return await this.model.findByDateRange(startDate, endDate, options);
    } catch (error) {
      this.logger.error('Error finding action items by date range:', error);
      throw error;
    }
  }

  async getDepartmentActionItemStats(departmentId) {
    try {
      return await this.model.getDepartmentActionItemStats(departmentId);
    } catch (error) {
      this.logger.error('Error getting department action item stats:', error);
      throw error;
    }
  }

  async getEmployeeActionItemStats(employeeId) {
    try {
      return await this.model.getEmployeeActionItemStats(employeeId);
    } catch (error) {
      this.logger.error('Error getting employee action item stats:', error);
      throw error;
    }
  }

  async updateMany(filter, data) {
    try {
      return await this.model.updateMany({ ...filter, isDeleted: false }, { ...data, updatedAt: new Date() });
    } catch (error) {
      this.logger.error('Error updating many action items:', error);
      throw error;
    }
  }

  async deleteMany(filter) {
    try {
      return await this.model.deleteMany({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error deleting many action items:', error);
      throw error;
    }
  }

  async softDeleteMany(filter, deletedBy) {
    try {
      return await this.model.updateMany({ ...filter, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy });
    } catch (error) {
      this.logger.error('Error soft deleting many action items:', error);
      throw error;
    }
  }
}

const actionItemRepository = new ActionItemRepository();
Object.freeze(actionItemRepository);
export default actionItemRepository;
