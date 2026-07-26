import AttendancePolicy from './attendancePolicy.model.js';

class AttendancePolicyRepository {
  async create(policyData) {
    return AttendancePolicy.create(policyData);
  }

  async findById(id) {
    return AttendancePolicy.findById(id);
  }

  async findByIdWithoutPopulate(id) {
    return AttendancePolicy.findById(id);
  }

  async findAll(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return AttendancePolicy.find(query).sort({ createdAt: -1 });
    }
    return AttendancePolicy.find({ ...query, isDeleted: false }).sort({ createdAt: -1 });
  }

  async findOne(query, includeDeleted = false) {
    if (includeDeleted) {
      return AttendancePolicy.findOne(query);
    }
    return AttendancePolicy.findOne({ ...query, isDeleted: false });
  }

  async updateById(id, updateData) {
    return AttendancePolicy.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );
  }

  async softDeleteById(id, deletedBy) {
    return AttendancePolicy.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async restoreById(id) {
    return AttendancePolicy.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    );
  }

  async deleteById(id) {
    return this.softDeleteById(id);
  }

  async exists(query) {
    return AttendancePolicy.exists({ ...query, isDeleted: false });
  }

  async count(query = {}) {
    return AttendancePolicy.countDocuments({ ...query, isDeleted: false });
  }

  async findActive() {
    return AttendancePolicy.findActive();
  }

  async findAllActive() {
    return AttendancePolicy.findAllActive();
  }

  async findByCompany(companyName) {
    return AttendancePolicy.findByCompany(companyName);
  }

  async findByStatus(status) {
    return AttendancePolicy.findByStatus(status);
  }

  async countByStatus(status) {
    return AttendancePolicy.countByStatus(status);
  }

  async findWithPagination(query, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      AttendancePolicy.find({ ...query, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      AttendancePolicy.countDocuments({ ...query, isDeleted: false })
    ]);

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: parseInt(page) < Math.ceil(total / limit),
        hasPrevious: parseInt(page) > 1
      }
    };
  }

  async activatePolicy(id) {
    await AttendancePolicy.updateMany(
      { isActive: true, isDeleted: false },
      { isActive: false }
    );
    return AttendancePolicy.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
  }
}

export default new AttendancePolicyRepository();
