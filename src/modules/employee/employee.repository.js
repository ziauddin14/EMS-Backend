import Employee from './employee.model.js';

class EmployeeRepository {
  async create(employeeData) {
    return Employee.create(employeeData);
  }

  async findById(id) {
    return Employee.findOne({ _id: id, isDeleted: false }).populate('user').populate('department').populate('designation').populate('reportingManager').populate('secondaryManager').populate('departmentHead');
  }

  async findByIdWithoutPopulate(id) {
    return Employee.findOne({ _id: id, isDeleted: false });
  }

  async findByEmployeeNumber(employeeNumber) {
    return Employee.findByEmployeeNumber(employeeNumber).populate('user').populate('department').populate('designation').populate('reportingManager');
  }

  async findByUser(userId) {
    return Employee.findByUser(userId).populate('user').populate('department').populate('designation').populate('reportingManager');
  }

  async findByDepartment(departmentId) {
    return Employee.findByDepartment(departmentId).populate('user').populate('designation').populate('reportingManager');
  }

  async findByReportingManager(managerId) {
    return Employee.findByReportingManager(managerId).populate('user').populate('department').populate('designation');
  }

  async findByEmploymentStatus(status) {
    return Employee.findByEmploymentStatus(status).populate('user').populate('department').populate('designation');
  }

  async findByEmploymentType(type) {
    return Employee.findByEmploymentType(type).populate('user').populate('department').populate('designation');
  }

  async findActive() {
    return Employee.findActive().populate('user').populate('department').populate('designation').populate('reportingManager');
  }

  async findAll(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return Employee.find(query).populate('user').populate('department').populate('designation').populate('reportingManager');
    }
    return Employee.find({ ...query, isDeleted: false }).populate('user').populate('department').populate('designation').populate('reportingManager');
  }

  async findOne(query, includeDeleted = false) {
    if (includeDeleted) {
      return Employee.findOne(query).populate('user').populate('department').populate('designation').populate('reportingManager');
    }
    return Employee.findOne({ ...query, isDeleted: false }).populate('user').populate('department').populate('designation').populate('reportingManager');
  }

  async updateById(id, updateData) {
    return Employee.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true, runValidators: true }).populate('user').populate('department').populate('designation').populate('reportingManager');
  }

  async updateByEmployeeNumber(employeeNumber, updateData) {
    return Employee.findOneAndUpdate({ employeeNumber: employeeNumber.toUpperCase(), isDeleted: false }, updateData, { new: true, runValidators: true }).populate('user').populate('department').populate('designation').populate('reportingManager');
  }

  async softDeleteById(id, deletedBy) {
    return Employee.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async softDeleteByEmployeeNumber(employeeNumber, deletedBy) {
    return Employee.findOneAndUpdate(
      { employeeNumber: employeeNumber.toUpperCase(), isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async deleteById(id) {
    return this.softDeleteById(id);
  }

  async restoreById(id) {
    return Employee.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).populate('user').populate('department').populate('designation').populate('reportingManager');
  }

  async restoreByEmployeeNumber(employeeNumber) {
    return Employee.findOneAndUpdate(
      { employeeNumber: employeeNumber.toUpperCase(), isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).populate('user').populate('department').populate('designation').populate('reportingManager');
  }

  async countDocuments(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return Employee.countDocuments(query);
    }
    return Employee.countDocuments({ ...query, isDeleted: false });
  }

  async exists(query, includeDeleted = false) {
    if (includeDeleted) {
      return Employee.exists(query);
    }
    return Employee.exists({ ...query, isDeleted: false });
  }

  async countByDepartment(departmentId) {
    return Employee.countByDepartment(departmentId);
  }

  async countByStatus(status) {
    return Employee.countByStatus(status);
  }

  async countByType(type) {
    return Employee.countByType(type);
  }

  async generateEmployeeNumber() {
    return Employee.generateEmployeeNumber();
  }

  async findWithPagination(query = {}, options = {}, includeDeleted = false) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    if (includeDeleted) {
      return Employee.find(query)
        .populate('user')
        .populate('department')
        .populate('designation')
        .populate('reportingManager')
        .sort(sort)
        .skip(skip)
        .limit(limit);
    }
    return Employee.find({ ...query, isDeleted: false })
      .populate('user')
      .populate('department')
      .populate('designation')
      .populate('reportingManager')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async search(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const regex = new RegExp(searchTerm, 'i');

    return Employee.find({
      $or: [
        { employeeNumber: regex },
        { officialEmail: regex },
        { officialPhone: regex },
        { emergencyContact: regex },
        { emergencyPhone: regex },
        { cnicNumber: regex }
      ],
      isDeleted: false
    })
      .populate('user')
      .populate('department')
      .populate('designation')
      .populate('reportingManager')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async getStatistics() {
    const total = await Employee.countDocuments({ isDeleted: false });
    const active = await Employee.countByStatus('active');
    const probation = await Employee.countByStatus('probation');
    const onLeave = await Employee.countByStatus('on_leave');
    const resigned = await Employee.countByStatus('resigned');
    const terminated = await Employee.countByStatus('terminated');
    const suspended = await Employee.countByStatus('suspended');

    const fullTime = await Employee.countByType('full_time');
    const partTime = await Employee.countByType('part_time');
    const intern = await Employee.countByType('intern');
    const contract = await Employee.countByType('contract');
    const freelancer = await Employee.countByType('freelancer');

    return {
      total,
      byStatus: {
        active,
        probation,
        onLeave,
        resigned,
        terminated,
        suspended,
        pending: total - active - probation - onLeave - resigned - terminated - suspended
      },
      byType: {
        fullTime,
        partTime,
        intern,
        contract,
        freelancer
      }
    };
  }

  async findManager(employeeId) {
    return Employee.findOne({ _id: employeeId, isDeleted: false }).populate('reportingManager').populate('secondaryManager').populate('departmentHead');
  }

  async findSubordinates(managerId, includeIndirect = false) {
    if (includeIndirect) {
      return Employee.find({ reportingPath: managerId, isDeleted: false }).populate('user').populate('department').populate('designation');
    }
    return Employee.find({ reportingManager: managerId, isDeleted: false }).populate('user').populate('department').populate('designation');
  }

  async findDirectReports(managerId) {
    return Employee.find({ reportingManager: managerId, isDeleted: false }).populate('user').populate('department').populate('designation');
  }

  async findIndirectReports(managerId) {
    return Employee.find({ reportingPath: managerId, isDeleted: false }).populate('user').populate('department').populate('designation');
  }

  async findDepartmentHead(departmentId) {
    return Employee.findOne({ department: departmentId, isDepartmentHead: true, isDeleted: false }).populate('user').populate('department').populate('designation');
  }

  async findHierarchy(employeeId, maxDepth = 10) {
    const employee = await Employee.findOne({ _id: employeeId, isDeleted: false }).populate('reportingManager');
    const hierarchy = [employee];
    let current = employee;
    let depth = 0;

    while (current.reportingManager && depth < maxDepth) {
      current = await Employee.findOne({ _id: current.reportingManager._id, isDeleted: false }).populate('reportingManager');
      if (!current) break;
      hierarchy.unshift(current);
      depth++;
    }

    return hierarchy;
  }

  async findOrganizationTree(rootEmployeeId = null) {
    const rootQuery = rootEmployeeId ? { _id: rootEmployeeId, isDeleted: false } : { reportingManager: null, isDeleted: false };
    const roots = await Employee.find(rootQuery).populate('user').populate('department').populate('designation').populate('reportingManager');

    const buildTree = async (managerId) => {
      const directReports = await Employee.find({ reportingManager: managerId, isDeleted: false }).populate('user').populate('department').populate('designation');
      const tree = [];

      for (const report of directReports) {
        const node = report.toObject();
        node.subordinates = await buildTree(report._id);
        tree.push(node);
      }

      return tree;
    };

    const tree = [];
    for (const root of roots) {
      const node = root.toObject();
      node.subordinates = await buildTree(root._id);
      tree.push(node);
    }

    return tree;
  }

  async countSubordinates(managerId, includeIndirect = false) {
    if (includeIndirect) {
      return Employee.countDocuments({ reportingPath: managerId, isDeleted: false });
    }
    return Employee.countDocuments({ reportingManager: managerId, isDeleted: false });
  }

  async findByDepartmentHead(headId) {
    return Employee.find({ departmentHead: headId, isDeleted: false }).populate('user').populate('department').populate('designation');
  }

  async findBySecondaryManager(managerId) {
    return Employee.find({ secondaryManager: managerId, isDeleted: false }).populate('user').populate('department').populate('designation');
  }

  async findDepartmentHeads() {
    return Employee.find({ isDepartmentHead: true, isDeleted: false }).populate('user').populate('department').populate('designation');
  }

  async findTeamLeads() {
    return Employee.find({ isTeamLead: true, isDeleted: false }).populate('user').populate('department').populate('designation');
  }

  async findByOrganizationLevel(level) {
    return Employee.find({ organizationLevel: level, isDeleted: false }).populate('user').populate('department').populate('designation');
  }

  async updateReportingPath(employeeId, reportingPath) {
    return Employee.findOneAndUpdate({ _id: employeeId, isDeleted: false }, { reportingPath }, { new: true, runValidators: true });
  }

  async updateOrganizationLevel(employeeId, level) {
    return Employee.findOneAndUpdate({ _id: employeeId, isDeleted: false }, { organizationLevel: level }, { new: true, runValidators: true });
  }

  async updateDirectReportCount(managerId, count) {
    return Employee.findOneAndUpdate({ _id: managerId, isDeleted: false }, { directReportCount: count }, { new: true, runValidators: true });
  }

  async setDepartmentHead(employeeId, isHead = true) {
    return Employee.findOneAndUpdate({ _id: employeeId, isDeleted: false }, { isDepartmentHead: isHead }, { new: true, runValidators: true });
  }

  async setTeamLead(employeeId, isLead = true) {
    return Employee.findOneAndUpdate({ _id: employeeId, isDeleted: false }, { isTeamLead: isLead }, { new: true, runValidators: true });
  }

  async updateDepartmentHeadForDepartment(departmentId, headId) {
    await Employee.updateMany({ department: departmentId, isDeleted: false }, { departmentHead: headId });
    return this.setDepartmentHead(headId, true);
  }

  async findReportingChain(employeeId) {
    const employee = await Employee.findOne({ _id: employeeId, isDeleted: false }).select('reportingPath');
    if (!employee) return [];
    return Employee.find({ _id: { $in: employee.reportingPath }, isDeleted: false }).populate('user').populate('department').populate('designation');
  }
}

export default new EmployeeRepository();
