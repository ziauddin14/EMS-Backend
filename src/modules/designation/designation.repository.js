import Designation from './designation.model.js';

class DesignationRepository {
  async create(designationData) {
    return Designation.create(designationData);
  }

  async findById(id) {
    return Designation.findOne({ _id: id, isDeleted: false }).populate('department');
  }

  async findByIdWithoutPopulate(id) {
    return Designation.findOne({ _id: id, isDeleted: false });
  }

  async findByCode(designationCode) {
    return Designation.findByCode(designationCode).populate('department');
  }

  async findByDepartment(departmentId) {
    return Designation.findByDepartment(departmentId);
  }

  async findByHierarchyLevel(level) {
    return Designation.findByHierarchyLevel(level).populate('department');
  }

  async findByJobGrade(grade) {
    return Designation.findByJobGrade(grade).populate('department');
  }

  async findByStatus(status) {
    return Designation.findByStatus(status).populate('department');
  }

  async findActive() {
    return Designation.findActive().populate('department');
  }

  async findByHierarchyRange(minLevel, maxLevel) {
    return Designation.findByHierarchyRange(minLevel, maxLevel).populate('department');
  }

  async findAll(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return Designation.find(query).populate('department').sort({ displayOrder: 1, hierarchyLevel: -1, designationName: 1 });
    }
    return Designation.find({ ...query, isDeleted: false }).populate('department').sort({ displayOrder: 1, hierarchyLevel: -1, designationName: 1 });
  }

  async findOne(query, includeDeleted = false) {
    if (includeDeleted) {
      return Designation.findOne(query).populate('department');
    }
    return Designation.findOne({ ...query, isDeleted: false }).populate('department');
  }

  async updateById(id, updateData) {
    return Designation.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true, runValidators: true }).populate('department');
  }

  async updateByCode(designationCode, updateData) {
    return Designation.findOneAndUpdate({ designationCode: designationCode.toUpperCase(), isDeleted: false }, updateData, { new: true, runValidators: true }).populate('department');
  }

  async softDeleteById(id, deletedBy) {
    return Designation.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async softDeleteByCode(designationCode, deletedBy) {
    return Designation.findOneAndUpdate(
      { designationCode: designationCode.toUpperCase(), isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async deleteById(id) {
    return this.softDeleteById(id);
  }

  async restoreById(id) {
    return Designation.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).populate('department');
  }

  async restoreByCode(designationCode) {
    return Designation.findOneAndUpdate(
      { designationCode: designationCode.toUpperCase(), isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).populate('department');
  }

  async countDocuments(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return Designation.countDocuments(query);
    }
    return Designation.countDocuments({ ...query, isDeleted: false });
  }

  async exists(query, includeDeleted = false) {
    if (includeDeleted) {
      return Designation.exists(query);
    }
    return Designation.exists({ ...query, isDeleted: false });
  }

  async countByStatus(status) {
    return Designation.countByStatus(status);
  }

  async countByDepartment(departmentId) {
    return Designation.countByDepartment(departmentId);
  }

  async countByHierarchyLevel(level) {
    return Designation.countByHierarchyLevel(level);
  }

  async generateDesignationCode() {
    return Designation.generateDesignationCode();
  }

  async getStatistics() {
    const total = await Designation.countDocuments({ isDeleted: false });
    const active = await Designation.countByStatus('active');
    const inactive = await Designation.countByStatus('inactive');
    const archived = await Designation.countByStatus('archived');

    const hierarchyLevels = await Designation.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$hierarchyLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    return {
      total,
      byStatus: {
        active,
        inactive,
        archived
      },
      byHierarchyLevel: hierarchyLevels
    };
  }

  async findWithPagination(query = {}, options = {}, includeDeleted = false) {
    const { page = 1, limit = 10, sort = { displayOrder: 1, hierarchyLevel: -1, designationName: 1 } } = options;
    const skip = (page - 1) * limit;

    if (includeDeleted) {
      return Designation.find(query)
        .populate('department')
        .sort(sort)
        .skip(skip)
        .limit(limit);
    }
    return Designation.find({ ...query, isDeleted: false })
      .populate('department')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async search(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const regex = new RegExp(searchTerm, 'i');

    return Designation.find({
      $or: [
        { designationCode: regex },
        { designationName: regex },
        { description: regex },
        { jobGrade: regex }
      ],
      isDeleted: false
    })
      .populate('department')
      .sort({ displayOrder: 1, hierarchyLevel: -1, designationName: 1 })
      .skip(skip)
      .limit(limit);
  }
}

export default new DesignationRepository();
