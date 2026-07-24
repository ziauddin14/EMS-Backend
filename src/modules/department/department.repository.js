import Department from './department.model.js';

class DepartmentRepository {
  async create(departmentData) {
    return Department.create(departmentData);
  }

  async findById(id) {
    return Department.findOne({ _id: id, isDeleted: false }).populate('parentDepartment').populate('departmentHead');
  }

  async findByIdWithoutPopulate(id) {
    return Department.findOne({ _id: id, isDeleted: false });
  }

  async findByCode(departmentCode) {
    return Department.findByCode(departmentCode).populate('parentDepartment').populate('departmentHead');
  }

  async findByDepartmentHead(headId) {
    return Department.findByDepartmentHead(headId).populate('parentDepartment');
  }

  async findByParentDepartment(parentId) {
    return Department.findByParentDepartment(parentId).populate('departmentHead');
  }

  async findRootDepartments() {
    return Department.findRootDepartments().populate('departmentHead');
  }

  async findByStatus(status) {
    return Department.findByStatus(status).populate('parentDepartment').populate('departmentHead');
  }

  async findActive() {
    return Department.findActive().populate('parentDepartment').populate('departmentHead');
  }

  async findAll(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return Department.find(query).populate('parentDepartment').populate('departmentHead').sort({ displayOrder: 1, departmentName: 1 });
    }
    return Department.find({ ...query, isDeleted: false }).populate('parentDepartment').populate('departmentHead').sort({ displayOrder: 1, departmentName: 1 });
  }

  async findOne(query, includeDeleted = false) {
    if (includeDeleted) {
      return Department.findOne(query).populate('parentDepartment').populate('departmentHead');
    }
    return Department.findOne({ ...query, isDeleted: false }).populate('parentDepartment').populate('departmentHead');
  }

  async updateById(id, updateData) {
    return Department.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true, runValidators: true }).populate('parentDepartment').populate('departmentHead');
  }

  async updateByCode(departmentCode, updateData) {
    return Department.findOneAndUpdate({ departmentCode: departmentCode.toUpperCase(), isDeleted: false }, updateData, { new: true, runValidators: true }).populate('parentDepartment').populate('departmentHead');
  }

  async softDeleteById(id, deletedBy) {
    return Department.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async softDeleteByCode(departmentCode, deletedBy) {
    return Department.findOneAndUpdate(
      { departmentCode: departmentCode.toUpperCase(), isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async deleteById(id) {
    return this.softDeleteById(id);
  }

  async restoreById(id) {
    return Department.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).populate('parentDepartment').populate('departmentHead');
  }

  async restoreByCode(departmentCode) {
    return Department.findOneAndUpdate(
      { departmentCode: departmentCode.toUpperCase(), isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).populate('parentDepartment').populate('departmentHead');
  }

  async countDocuments(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return Department.countDocuments(query);
    }
    return Department.countDocuments({ ...query, isDeleted: false });
  }

  async exists(query, includeDeleted = false) {
    if (includeDeleted) {
      return Department.exists(query);
    }
    return Department.exists({ ...query, isDeleted: false });
  }

  async countByStatus(status) {
    return Department.countByStatus(status);
  }

  async generateDepartmentCode() {
    return Department.generateDepartmentCode();
  }

  async buildTree() {
    return Department.buildTree();
  }

  async getStatistics() {
    const total = await Department.countDocuments({ isDeleted: false });
    const active = await Department.countByStatus('active');
    const inactive = await Department.countByStatus('inactive');
    const archived = await Department.countByStatus('archived');
    const rootDepartments = await Department.countDocuments({ parentDepartment: null, isDeleted: false });

    return {
      total,
      byStatus: {
        active,
        inactive,
        archived
      },
      rootDepartments
    };
  }

  async findWithPagination(query = {}, options = {}, includeDeleted = false) {
    const { page = 1, limit = 10, sort = { displayOrder: 1, departmentName: 1 } } = options;
    const skip = (page - 1) * limit;

    if (includeDeleted) {
      return Department.find(query)
        .populate('parentDepartment')
        .populate('departmentHead')
        .sort(sort)
        .skip(skip)
        .limit(limit);
    }
    return Department.find({ ...query, isDeleted: false })
      .populate('parentDepartment')
      .populate('departmentHead')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async search(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const regex = new RegExp(searchTerm, 'i');

    return Department.find({
      $or: [
        { departmentCode: regex },
        { departmentName: regex },
        { description: regex },
        { departmentEmail: regex }
      ],
      isDeleted: false
    })
      .populate('parentDepartment')
      .populate('departmentHead')
      .sort({ displayOrder: 1, departmentName: 1 })
      .skip(skip)
      .limit(limit);
  }
}

export default new DepartmentRepository();
