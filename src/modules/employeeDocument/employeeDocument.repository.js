import EmployeeDocument from './employeeDocument.model.js';

class EmployeeDocumentRepository {
  async create(documentData) {
    return EmployeeDocument.create(documentData);
  }

  async findById(id) {
    return EmployeeDocument.findOne({ _id: id, isDeleted: false }).populate('employee').populate('uploadedBy').populate('verifiedBy');
  }

  async findByIdWithoutPopulate(id) {
    return EmployeeDocument.findOne({ _id: id, isDeleted: false });
  }

  async findByEmployee(employeeId) {
    return EmployeeDocument.findByEmployee(employeeId).populate('uploadedBy').populate('verifiedBy');
  }

  async findByEmployeeAndType(employeeId, documentType) {
    return EmployeeDocument.findByEmployeeAndType(employeeId, documentType).populate('uploadedBy').populate('verifiedBy');
  }

  async findByDocumentType(documentType) {
    return EmployeeDocument.findByDocumentType(documentType).populate('employee').populate('uploadedBy');
  }

  async findByStatus(status) {
    return EmployeeDocument.findByStatus(status).populate('employee').populate('uploadedBy');
  }

  async findVerified() {
    return EmployeeDocument.findVerified().populate('employee').populate('uploadedBy').populate('verifiedBy');
  }

  async findPending() {
    return EmployeeDocument.findPending().populate('employee').populate('uploadedBy');
  }

  async findExpired() {
    return EmployeeDocument.findExpired().populate('employee').populate('uploadedBy');
  }

  async findExpiringSoon(days = 30) {
    return EmployeeDocument.findExpiringSoon(days).populate('employee').populate('uploadedBy');
  }

  async findAll(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return EmployeeDocument.find(query).populate('employee').populate('uploadedBy').populate('verifiedBy').sort({ createdAt: -1 });
    }
    return EmployeeDocument.find({ ...query, isDeleted: false }).populate('employee').populate('uploadedBy').populate('verifiedBy').sort({ createdAt: -1 });
  }

  async findOne(query, includeDeleted = false) {
    if (includeDeleted) {
      return EmployeeDocument.findOne(query).populate('employee').populate('uploadedBy').populate('verifiedBy');
    }
    return EmployeeDocument.findOne({ ...query, isDeleted: false }).populate('employee').populate('uploadedBy').populate('verifiedBy');
  }

  async updateById(id, updateData) {
    return EmployeeDocument.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true, runValidators: true }).populate('employee').populate('uploadedBy').populate('verifiedBy');
  }

  async softDeleteById(id, deletedBy) {
    return EmployeeDocument.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async deleteById(id) {
    return this.softDeleteById(id);
  }

  async restoreById(id) {
    return EmployeeDocument.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).populate('employee').populate('uploadedBy').populate('verifiedBy');
  }

  async verifyDocument(id, verifiedBy) {
    return EmployeeDocument.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isVerified: true, status: 'verified', verifiedBy, verifiedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('employee').populate('uploadedBy').populate('verifiedBy');
  }

  async incrementVersion(id) {
    return EmployeeDocument.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { version: 1 } },
      { new: true }
    );
  }

  async countDocuments(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return EmployeeDocument.countDocuments(query);
    }
    return EmployeeDocument.countDocuments({ ...query, isDeleted: false });
  }

  async exists(query, includeDeleted = false) {
    if (includeDeleted) {
      return EmployeeDocument.exists(query);
    }
    return EmployeeDocument.exists({ ...query, isDeleted: false });
  }

  async countByEmployee(employeeId) {
    return EmployeeDocument.countByEmployee(employeeId);
  }

  async countByType(documentType) {
    return EmployeeDocument.countByType(documentType);
  }

  async countByStatus(status) {
    return EmployeeDocument.countByStatus(status);
  }

  async getStatistics() {
    const total = await EmployeeDocument.countDocuments({ isDeleted: false });
    const verified = await EmployeeDocument.countByStatus('verified');
    const pending = await EmployeeDocument.countByStatus('pending');
    const rejected = await EmployeeDocument.countByStatus('rejected');
    const expired = await EmployeeDocument.countDocuments({ expiryDate: { $lt: new Date() }, isDeleted: false });

    const byType = await EmployeeDocument.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$documentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return {
      total,
      byStatus: {
        verified,
        pending,
        rejected,
        expired
      },
      byType
    };
  }

  async findWithPagination(query = {}, options = {}, includeDeleted = false) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    if (includeDeleted) {
      return EmployeeDocument.find(query)
        .populate('employee')
        .populate('uploadedBy')
        .populate('verifiedBy')
        .sort(sort)
        .skip(skip)
        .limit(limit);
    }
    return EmployeeDocument.find({ ...query, isDeleted: false })
      .populate('employee')
      .populate('uploadedBy')
      .populate('verifiedBy')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async search(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const regex = new RegExp(searchTerm, 'i');

    return EmployeeDocument.find({
      $or: [
        { title: regex },
        { description: regex },
        { originalFileName: regex }
      ],
      isDeleted: false
    })
      .populate('employee')
      .populate('uploadedBy')
      .populate('verifiedBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }
}

export default new EmployeeDocumentRepository();
