import Task from './task.model.js';

class TaskRepository {
  async create(taskData) {
    return await Task.create(taskData);
  }

  async findById(id) {
    return await Task.findById(id)
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedBy', 'firstName lastName employeeId')
      .populate('assignedTo', 'firstName lastName employeeId')
      .populate('reviewer', 'firstName lastName employeeId')
      .populate('parentTask', 'taskNumber title')
      .populate('subTasks', 'taskNumber title status')
      .populate('dependencies', 'taskNumber title status')
      .lean();
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0, projection = {} } = options;
    return await Task.find({ ...filter, isDeleted: false }, projection)
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedBy', 'firstName lastName employeeId')
      .populate('assignedTo', 'firstName lastName employeeId')
      .populate('reviewer', 'firstName lastName employeeId')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }

  async updateById(id, updateData) {
    return await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedBy', 'firstName lastName employeeId')
      .populate('assignedTo', 'firstName lastName employeeId')
      .populate('reviewer', 'firstName lastName employeeId')
      .lean();
  }

  async softDelete(id, deletedBy) {
    return await Task.findByIdAndUpdate(
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
    return await Task.findByIdAndUpdate(
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
    return await Task.exists({ _id: id, isDeleted: false });
  }

  async existsByNumber(taskNumber) {
    return await Task.exists({ taskNumber: taskNumber.toUpperCase(), isDeleted: false });
  }

  async count(filter = {}) {
    return await Task.countDocuments({ ...filter, isDeleted: false });
  }

  async findActive() {
    return await Task.findActive()
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findArchived() {
    return await Task.findArchived()
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ archivedAt: -1 })
      .lean();
  }

  async findByProject(projectId) {
    return await Task.findByProject(projectId)
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByEmployee(employeeId) {
    return await Task.findByEmployee(employeeId)
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByDepartment(departmentId) {
    return await Task.findByDepartment(departmentId)
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByStatus(status) {
    return await Task.findByStatus(status)
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByPriority(priority) {
    return await Task.findByPriority(priority)
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByCategory(category) {
    return await Task.findByCategory(category)
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOverdue() {
    return await Task.findOverdue()
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findDueSoon(days = 7) {
    return await Task.findDueSoon(days)
      .populate('project', 'projectCode name')
      .populate('department')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findByParent(parentTaskId) {
    return await Task.findByParent(parentTaskId)
      .populate('project', 'projectCode name')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .lean();
  }

  async search(searchTerm, options = {}) {
    const { limit = 20, skip = 0 } = options;
    return await Task.find({
      isDeleted: false,
      $or: [
        { taskNumber: { $regex: searchTerm, $options: 'i' } },
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .populate('project', 'projectCode name')
      .populate('assignedTo', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  }

  async statistics(filter = {}) {
    const pipeline = [
      { $match: { isDeleted: false, ...filter } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          backlog: { $sum: { $cond: [{ $eq: ['$status', 'backlog'] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          review: { $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] } },
          testing: { $sum: { $cond: [{ $eq: ['$status', 'testing'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalEstimatedHours: { $sum: '$estimatedHours' },
          totalSpentHours: { $sum: '$spentHours' },
          overdue: { $sum: { $cond: ['$isOverdue', 1, 0] } }
        }
      }
    ];

    const result = await Task.aggregate(pipeline);
    return result[0] || {
      total: 0,
      backlog: 0,
      todo: 0,
      inProgress: 0,
      review: 0,
      testing: 0,
      completed: 0,
      blocked: 0,
      cancelled: 0,
      totalEstimatedHours: 0,
      totalSpentHours: 0,
      overdue: 0
    };
  }

  async employeeStatistics(employeeId) {
    const pipeline = [
      {
        $match: {
          assignedTo: employeeId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          overdue: { $sum: { $cond: ['$isOverdue', 1, 0] } },
          totalEstimatedHours: { $sum: '$estimatedHours' },
          totalSpentHours: { $sum: '$spentHours' }
        }
      }
    ];

    const result = await Task.aggregate(pipeline);
    return result[0] || {
      total: 0,
      completed: 0,
      inProgress: 0,
      overdue: 0,
      totalEstimatedHours: 0,
      totalSpentHours: 0
    };
  }

  async projectStatistics(projectId) {
    const pipeline = [
      {
        $match: {
          project: projectId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          overdue: { $sum: { $cond: ['$isOverdue', 1, 0] } },
          totalEstimatedHours: { $sum: '$estimatedHours' },
          totalSpentHours: { $sum: '$spentHours' }
        }
      }
    ];

    const result = await Task.aggregate(pipeline);
    return result[0] || {
      total: 0,
      completed: 0,
      inProgress: 0,
      overdue: 0,
      totalEstimatedHours: 0,
      totalSpentHours: 0
    };
  }
}

export default new TaskRepository();
