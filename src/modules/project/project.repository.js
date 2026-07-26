import Project from './project.model.js';

class ProjectRepository {
  async create(projectData) {
    return await Project.create(projectData);
  }

  async findById(id) {
    return await Project.findById(id)
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .lean();
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0, projection = {} } = options;
    return await Project.find({ ...filter, isDeleted: false }, projection)
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }

  async updateById(id, updateData) {
    return await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .lean();
  }

  async softDelete(id, deletedBy) {
    return await Project.findByIdAndUpdate(
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
    return await Project.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      },
      { new: true }
    );
  }

  async exists(id) {
    return await Project.exists({ _id: id, isDeleted: false });
  }

  async existsByCode(projectCode) {
    return await Project.exists({ projectCode: projectCode.toUpperCase(), isDeleted: false });
  }

  async count(filter = {}) {
    return await Project.countDocuments({ ...filter, isDeleted: false });
  }

  async findActive() {
    return await Project.findActive()
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .sort({ createdAt: -1 });
  }

  async findArchived() {
    return await Project.findArchived()
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .sort({ archivedAt: -1 });
  }

  async findByDepartment(departmentId) {
    return await Project.findByDepartment(departmentId)
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .sort({ createdAt: -1 });
  }

  async findByProjectManager(managerId) {
    return await Project.findByProjectManager(managerId)
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .sort({ createdAt: -1 });
  }

  async findByMember(employeeId) {
    return await Project.findByMember(employeeId)
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .sort({ createdAt: -1 });
  }

  async findByStatus(status) {
    return await Project.findByStatus(status)
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .sort({ createdAt: -1 });
  }

  async findByPriority(priority) {
    return await Project.findByPriority(priority)
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .populate('client')
      .sort({ createdAt: -1 });
  }

  async search(searchTerm, options = {}) {
    const { limit = 20, skip = 0 } = options;
    return await Project.find({
      isDeleted: false,
      $or: [
        { projectCode: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('department')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  async findOverdue() {
    return await Project.find({
      isDeleted: false,
      isActive: true,
      expectedEndDate: { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .sort({ expectedEndDate: 1 });
  }

  async findUpcoming(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return await Project.find({
      isDeleted: false,
      isActive: true,
      expectedEndDate: { $gte: new Date(), $lte: date },
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('projectManager', 'firstName lastName employeeId')
      .populate('teamLeads', 'firstName lastName employeeId')
      .populate('members', 'firstName lastName employeeId')
      .populate('department')
      .sort({ expectedEndDate: 1 });
  }

  async statistics(filter = {}) {
    const pipeline = [
      { $match: { isDeleted: false, ...filter } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          planning: { $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ['$status', 'on_hold'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
          totalEstimatedHours: { $sum: '$estimatedHours' },
          totalSpentHours: { $sum: '$spentHours' },
          totalBudget: { $sum: '$budget' }
        }
      }
    ];

    const result = await Project.aggregate(pipeline);
    return result[0] || {
      total: 0,
      active: 0,
      planning: 0,
      onHold: 0,
      completed: 0,
      cancelled: 0,
      archived: 0,
      totalEstimatedHours: 0,
      totalSpentHours: 0,
      totalBudget: 0
    };
  }
}

export default new ProjectRepository();
