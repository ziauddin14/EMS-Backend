import Meeting from './meeting.model.js';
import Logger from '../../core/utils/logger.js';

class MeetingRepository {
  constructor() {
    this.model = Meeting;
    this.logger = Logger;
  }

  // Create
  async create(data) {
    try {
      const meeting = new this.model(data);
      await meeting.save();
      return meeting;
    } catch (error) {
      this.logger.error('Error creating meeting:', error);
      throw error;
    }
  }

  // Find by ID
  async findById(id, options = {}) {
    const { lean = true } = options;
    try {
      const query = this.model.findById(id).populate('organizer', '_id firstName lastName employeeId')
        .populate('host', '_id firstName lastName employeeId')
        .populate('participants', '_id firstName lastName employeeId')
        .populate('department', '_id name')
        .populate('project', '_id name')
        .populate('agenda');
      
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding meeting by ID:', error);
      throw error;
    }
  }

  // Find One
  async findOne(filter, options = {}) {
    const { lean = true } = options;
    try {
      const query = this.model.findOne({ ...filter, isDeleted: false })
        .populate('organizer', '_id firstName lastName employeeId')
        .populate('host', '_id firstName lastName employeeId')
        .populate('participants', '_id firstName lastName employeeId')
        .populate('department', '_id name')
        .populate('project', '_id name')
        .populate('agenda');
      
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding meeting:', error);
      throw error;
    }
  }

  // Find All
  async findAll(options = {}) {
    const { filter = {}, sort = { startTime: -1 }, limit = 100, skip = 0, lean = true } = options;
    try {
      const query = this.model.find({ ...filter, isDeleted: false })
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .populate('organizer', '_id firstName lastName employeeId')
        .populate('host', '_id firstName lastName employeeId')
        .populate('participants', '_id firstName lastName employeeId')
        .populate('department', '_id name')
        .populate('project', '_id name');
      
      return lean ? await query.lean() : await query.exec();
    } catch (error) {
      this.logger.error('Error finding all meetings:', error);
      throw error;
    }
  }

  // Update
  async update(id, data) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('organizer', '_id firstName lastName employeeId')
        .populate('host', '_id firstName lastName employeeId')
        .populate('participants', '_id firstName lastName employeeId')
        .populate('department', '_id name')
        .populate('project', '_id name');
    } catch (error) {
      this.logger.error('Error updating meeting:', error);
      throw error;
    }
  }

  // Soft Delete
  async softDelete(id, deletedBy) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy
        },
        { new: true }
      );
    } catch (error) {
      this.logger.error('Error soft deleting meeting:', error);
      throw error;
    }
  }

  // Soft Delete by ID (alias for consistency)
  async softDeleteById(id, deletedBy) {
    return await this.softDelete(id, deletedBy);
  }

  // Restore
  async restore(id) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null
        },
        { new: true }
      );
    } catch (error) {
      this.logger.error('Error restoring meeting:', error);
      throw error;
    }
  }

  // Exists
  async exists(filter) {
    try {
      return await this.model.exists({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error checking meeting existence:', error);
      throw error;
    }
  }

  // Count
  async count(filter = {}) {
    try {
      return await this.model.countDocuments({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error counting meetings:', error);
      throw error;
    }
  }

  // Pagination
  async paginate(filter, options = {}) {
    const { page = 1, limit = 10, sort = { startTime: -1 } } = options;
    const skip = (page - 1) * limit;
    
    try {
      const [data, total] = await Promise.all([
        this.findAll({ filter, sort, limit, skip }),
        this.count(filter)
      ]);
      
      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrev: skip > 0
        }
      };
    } catch (error) {
      this.logger.error('Error paginating meetings:', error);
      throw error;
    }
  }

  // Projection
  async findWithProjection(filter, projection, options = {}) {
    const { sort = { startTime: -1 }, limit = 100 } = options;
    try {
      return await this.model.find({ ...filter, isDeleted: false })
        .select(projection)
        .sort(sort)
        .limit(limit)
        .lean();
    } catch (error) {
      this.logger.error('Error finding meetings with projection:', error);
      throw error;
    }
  }

  // Sorting
  async findSorted(filter, sort, options = {}) {
    const { limit = 100 } = options;
    try {
      return await this.model.find({ ...filter, isDeleted: false })
        .sort(sort)
        .limit(limit)
        .populate('organizer', '_id firstName lastName employeeId')
        .populate('host', '_id firstName lastName employeeId')
        .populate('department', '_id name')
        .lean();
    } catch (error) {
      this.logger.error('Error finding sorted meetings:', error);
      throw error;
    }
  }

  // Filtering
  async findFiltered(filter, options = {}) {
    const { sort = { startTime: -1 }, limit = 100 } = options;
    try {
      return await this.model.find({ ...filter, isDeleted: false })
        .sort(sort)
        .limit(limit)
        .populate('organizer', '_id firstName lastName employeeId')
        .populate('host', '_id firstName lastName employeeId')
        .populate('participants', '_id firstName lastName employeeId')
        .populate('department', '_id name')
        .lean();
    } catch (error) {
      this.logger.error('Error finding filtered meetings:', error);
      throw error;
    }
  }

  // Lean Queries
  async findLean(filter, options = {}) {
    const { sort = { startTime: -1 }, limit = 100 } = options;
    try {
      return await this.model.find({ ...filter, isDeleted: false })
        .sort(sort)
        .limit(limit)
        .lean();
    } catch (error) {
      this.logger.error('Error finding lean meetings:', error);
      throw error;
    }
  }

  // Custom Query Methods
  async findByOrganizer(organizerId, options = {}) {
    try {
      return await this.model.findByOrganizer(organizerId, options);
    } catch (error) {
      this.logger.error('Error finding meetings by organizer:', error);
      throw error;
    }
  }

  async findByParticipant(participantId, options = {}) {
    try {
      return await this.model.findByParticipant(participantId, options);
    } catch (error) {
      this.logger.error('Error finding meetings by participant:', error);
      throw error;
    }
  }

  async findByDepartment(departmentId, options = {}) {
    try {
      return await this.model.findByDepartment(departmentId, options);
    } catch (error) {
      this.logger.error('Error finding meetings by department:', error);
      throw error;
    }
  }

  async findByProject(projectId, options = {}) {
    try {
      return await this.model.findByProject(projectId, options);
    } catch (error) {
      this.logger.error('Error finding meetings by project:', error);
      throw error;
    }
  }

  async findByDateRange(startDate, endDate, options = {}) {
    try {
      return await this.model.findByDateRange(startDate, endDate, options);
    } catch (error) {
      this.logger.error('Error finding meetings by date range:', error);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      return await this.model.findByStatus(status, options);
    } catch (error) {
      this.logger.error('Error finding meetings by status:', error);
      throw error;
    }
  }

  async findUpcoming(options = {}) {
    try {
      return await this.model.findUpcoming(options);
    } catch (error) {
      this.logger.error('Error finding upcoming meetings:', error);
      throw error;
    }
  }

  async findPast(options = {}) {
    try {
      return await this.model.findPast(options);
    } catch (error) {
      this.logger.error('Error finding past meetings:', error);
      throw error;
    }
  }

  async findRecurring(parentMeetingId, options = {}) {
    try {
      return await this.model.findRecurring(parentMeetingId, options);
    } catch (error) {
      this.logger.error('Error finding recurring meetings:', error);
      throw error;
    }
  }

  // Bulk Operations
  async updateMany(filter, data) {
    try {
      return await this.model.updateMany(
        { ...filter, isDeleted: false },
        { ...data, updatedAt: new Date() }
      );
    } catch (error) {
      this.logger.error('Error updating many meetings:', error);
      throw error;
    }
  }

  async deleteMany(filter) {
    try {
      return await this.model.deleteMany({ ...filter, isDeleted: false });
    } catch (error) {
      this.logger.error('Error deleting many meetings:', error);
      throw error;
    }
  }

  async softDeleteMany(filter, deletedBy) {
    try {
      return await this.model.updateMany(
        { ...filter, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy
        }
      );
    } catch (error) {
      this.logger.error('Error soft deleting many meetings:', error);
      throw error;
    }
  }
}

// Singleton instance
const meetingRepository = new MeetingRepository();

// Freeze the instance to prevent modifications
Object.freeze(meetingRepository);

export default meetingRepository;
