import WorkLog from './worklog.model.js';

class WorkLogRepository {
  async create(worklogData) {
    return await WorkLog.create(worklogData);
  }

  async findById(id) {
    return await WorkLog.findById(id)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .lean();
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { workDate: -1 }, limit = 100, skip = 0, projection = {} } = options;
    return await WorkLog.find({ ...filter, isDeleted: false }, projection)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }

  async updateById(id, updateData) {
    return await WorkLog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .lean();
  }

  async softDelete(id, deletedBy) {
    return await WorkLog.findByIdAndUpdate(
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
    return await WorkLog.findByIdAndUpdate(
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
    return await WorkLog.exists({ _id: id, isDeleted: false });
  }

  async count(filter = {}) {
    return await WorkLog.countDocuments({ ...filter, isDeleted: false });
  }

  async findByEmployee(employeeId) {
    return await WorkLog.findByEmployee(employeeId)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .sort({ workDate: -1 });
  }

  async findByTask(taskId) {
    return await WorkLog.findByTask(taskId)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .sort({ workDate: -1 });
  }

  async findByProject(projectId) {
    return await WorkLog.findByProject(projectId)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .sort({ workDate: -1 });
  }

  async findByDateRange(startDate, endDate) {
    return await WorkLog.findByDateRange(startDate, endDate)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .sort({ workDate: -1 });
  }

  async findByEmployeeAndDateRange(employeeId, startDate, endDate) {
    return await WorkLog.findByEmployeeAndDateRange(employeeId, startDate, endDate)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .sort({ workDate: -1 });
  }

  async findByStatus(status) {
    return await WorkLog.findByStatus(status)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .sort({ workDate: -1 });
  }

  async findByBillable(billable) {
    return await WorkLog.findByBillable(billable)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'taskNumber title')
      .populate('project', 'projectCode name')
      .sort({ workDate: -1 });
  }

  async statistics(filter = {}) {
    const pipeline = [
      { $match: { isDeleted: false, ...filter } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          billable: { $sum: { $cond: ['$billable', 1, 0] } },
          nonBillable: { $sum: { $cond: [{ $not: ['$billable'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      }
    ];

    const result = await WorkLog.aggregate(pipeline);
    return result[0] || {
      total: 0,
      totalDuration: 0,
      billable: 0,
      nonBillable: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };
  }

  async employeeStatistics(employeeId) {
    const pipeline = [
      {
        $match: {
          employee: employeeId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          billable: { $sum: { $cond: ['$billable', 1, 0] } },
          nonBillable: { $sum: { $cond: [{ $not: ['$billable'] }, 1, 0] } }
        }
      }
    ];

    const result = await WorkLog.aggregate(pipeline);
    return result[0] || {
      total: 0,
      totalDuration: 0,
      billable: 0,
      nonBillable: 0
    };
  }

  async taskStatistics(taskId) {
    const pipeline = [
      {
        $match: {
          task: taskId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          billable: { $sum: { $cond: ['$billable', 1, 0] } }
        }
      }
    ];

    const result = await WorkLog.aggregate(pipeline);
    return result[0] || {
      total: 0,
      totalDuration: 0,
      billable: 0
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
          totalDuration: { $sum: '$duration' },
          billable: { $sum: { $cond: ['$billable', 1, 0] } }
        }
      }
    ];

    const result = await WorkLog.aggregate(pipeline);
    return result[0] || {
      total: 0,
      totalDuration: 0,
      billable: 0
    };
  }
}

export default new WorkLogRepository();
