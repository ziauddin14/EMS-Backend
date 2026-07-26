import OfficeShift from './officeShift.model.js';

class OfficeShiftRepository {
  async create(shiftData) {
    return OfficeShift.create(shiftData);
  }

  async findById(id) {
    return OfficeShift.findById(id);
  }

  async findByIdWithoutPopulate(id) {
    return OfficeShift.findById(id);
  }

  async findAll(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return OfficeShift.find(query).sort({ isDefault: -1, name: 1 });
    }
    return OfficeShift.find({ ...query, isDeleted: false }).sort({ isDefault: -1, name: 1 });
  }

  async findOne(query, includeDeleted = false) {
    if (includeDeleted) {
      return OfficeShift.findOne(query);
    }
    return OfficeShift.findOne({ ...query, isDeleted: false });
  }

  async updateById(id, updateData) {
    return OfficeShift.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );
  }

  async softDeleteById(id, deletedBy) {
    return OfficeShift.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async restoreById(id) {
    return OfficeShift.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    );
  }

  async deleteById(id) {
    return this.softDeleteById(id);
  }

  async exists(query) {
    return OfficeShift.exists({ ...query, isDeleted: false });
  }

  async count(query = {}) {
    return OfficeShift.countDocuments({ ...query, isDeleted: false });
  }

  async findActive() {
    return OfficeShift.findActive();
  }

  async findDefault() {
    return OfficeShift.findDefault();
  }

  async findByCode(code) {
    return OfficeShift.findByCode(code);
  }

  async findByStatus(status) {
    return OfficeShift.findByStatus(status);
  }

  async countByStatus(status) {
    return OfficeShift.countByStatus(status);
  }

  async findWithPagination(query, options = {}) {
    const { page = 1, limit = 10, sort = { isDefault: -1, name: 1 } } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      OfficeShift.find({ ...query, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      OfficeShift.countDocuments({ ...query, isDeleted: false })
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

  async setAsDefault(id) {
    await OfficeShift.updateMany(
      { isDefault: true, isDeleted: false },
      { isDefault: false }
    );
    return OfficeShift.findByIdAndUpdate(
      id,
      { isDefault: true },
      { new: true }
    );
  }
}

export default new OfficeShiftRepository();
