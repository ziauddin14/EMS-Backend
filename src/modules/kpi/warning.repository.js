import Warning from './warning.model.js';

class WarningRepository {
  async create(warningData) {
    return await Warning.create(warningData);
  }

  async findById(id) {
    return await Warning.findById(id)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('issuedBy', 'firstName lastName employeeId')
      .populate('resolvedBy', 'firstName lastName employeeId')
      .populate('witnesses', 'firstName lastName employeeId')
      .populate('escalatedTo', 'firstName lastName employeeId')
      .populate('appealReviewedBy', 'firstName lastName employeeId')
      .lean();
  }

  async findOne(filter = {}) {
    return await Warning.findOne({ ...filter, isDeleted: false })
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('issuedBy', 'firstName lastName employeeId')
      .lean();
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0, projection = {} } = options;
    return await Warning.find({ ...filter, isDeleted: false }, projection)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('issuedBy', 'firstName lastName employeeId')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }

  async updateById(id, updateData) {
    return await Warning.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('issuedBy', 'firstName lastName employeeId')
      .lean();
  }

  async updateOne(filter, updateData) {
    return await Warning.findOneAndUpdate(
      { ...filter, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).lean();
  }

  async softDelete(id, deletedBy) {
    return await Warning.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy
      },
      { new: true }
    );
  }

  async restore(id) {
    return await Warning.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      },
      { new: true }
    );
  }

  async count(filter = {}) {
    return await Warning.countDocuments({ ...filter, isDeleted: false });
  }

  async exists(filter = {}) {
    return await Warning.exists({ ...filter, isDeleted: false });
  }

  async deleteMany(filter) {
    return await Warning.deleteMany({ ...filter, isDeleted: false });
  }

  async updateMany(filter, updateData) {
    return await Warning.updateMany({ ...filter, isDeleted: false }, updateData);
  }

  async aggregate(pipeline) {
    return await Warning.aggregate(pipeline);
  }

  async distinct(field, filter = {}) {
    return await Warning.distinct(field, { ...filter, isDeleted: false });
  }

  async findByEmployee(employeeId, options = {}) {
    const { type, severity, status, year, startDate, endDate } = options;
    const filter = { employee: employeeId, isDeleted: false };
    
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    if (startDate && endDate) {
      filter.issuedDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    return await Warning.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByDepartment(departmentId, options = {}) {
    const { type, severity, status, year } = options;
    const filter = { department: departmentId, isDeleted: false };
    
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Warning.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByIssuer(issuerId, options = {}) {
    const { type, severity, status, year } = options;
    const filter = { issuedBy: issuerId, isDeleted: false };
    
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Warning.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByType(type, options = {}) {
    const { severity, status, department, year } = options;
    const filter = { type, isDeleted: false };
    
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Warning.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findBySeverity(severity, options = {}) {
    const { type, status, department, year } = options;
    const filter = { severity, isDeleted: false };
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Warning.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByStatus(status, options = {}) {
    const { department, type, severity, year } = options;
    const filter = { status, isDeleted: false };
    
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Warning.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findUnresolved(options = {}) {
    const { department, severity, year } = options;
    const filter = { resolved: false, isDeleted: false };
    
    if (department) filter.department = department;
    if (severity) filter.severity = severity;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Warning.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ severity: -1, issuedDate: -1 })
      .lean();
  }

  async findPendingAppeals(options = {}) {
    const { department, year } = options;
    const filter = { appealed: true, appealStatus: 'pending', isDeleted: false };
    
    if (department) filter.department = department;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Warning.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ appealDate: -1 })
      .lean();
  }

  async findExpired() {
    const now = new Date();
    return await Warning.find({
      expires: true,
      expiryDate: { $lt: now },
      isDeleted: false
    })
      .populate('employee', 'firstName lastName employeeId')
      .sort({ expiryDate: 1 })
      .lean();
  }

  async findPendingFollowUp() {
    const now = new Date();
    return await Warning.find({
      followUpRequired: true,
      followUpCompleted: false,
      followUpDate: { $lte: now },
      isDeleted: false
    })
      .populate('employee', 'firstName lastName employeeId')
      .sort({ followUpDate: 1 })
      .lean();
  }

  async getEmployeeWarningCount(employeeId, year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    
    return await Warning.aggregate([
      {
        $match: {
          employee: employeeId,
          issuedDate: { $gte: start, $lte: end },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDeduction: { $sum: '$scoreDeduction' }
        }
      }
    ]);
  }

  async getDepartmentWarningStats(departmentId, year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    
    return await Warning.aggregate([
      {
        $match: {
          department: departmentId,
          issuedDate: { $gte: start, $lte: end },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          resolved: { $sum: { $cond: ['$resolved', 1, 0] } },
          appealed: { $sum: { $cond: ['$appealed', 1, 0] } }
        }
      }
    ]);
  }

  async getSeverityStats(year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    
    return await Warning.aggregate([
      {
        $match: {
          issuedDate: { $gte: start, $lte: end },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          resolved: { $sum: { $cond: ['$resolved', 1, 0] } }
        }
      }
    ]);
  }
}

const warningRepository = new WarningRepository();
export default warningRepository;
