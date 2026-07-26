import { TASK_STATUS, TASK_PRIORITY } from './task.constants.js';
import AppError from '../../core/errors/AppError.js';

class ProductivityService {
  async calculateEmployeeProductivity(employeeId, startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      assignedTo: employeeId,
      isDeleted: false,
      createdAt: { $gte: start, $lte: end }
    });

    const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const productivity = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

    const avgCompletionTime = await Task.aggregate([
      {
        $match: {
          assignedTo: employeeId,
          isDeleted: false,
          status: TASK_STATUS.COMPLETED,
          completedAt: { $gte: start, $lte: end },
          createdAt: { $exists: true }
        }
      },
      {
        $project: {
          completionDays: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$completionDays' }
        }
      }
    ]);

    return {
      employeeId,
      productivity: Math.round(productivity),
      totalTasks: tasks.length,
      completedTasks: completed.length,
      avgCompletionDays: Math.round((avgCompletionTime[0]?.avgDays || 0) * 10) / 10
    };
  }

  async calculateDepartmentProductivity(departmentId, startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const department = await Department.findById(departmentId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const employees = await Employee.find({
      department: departmentId,
      isDeleted: false
    }).select('_id');

    const employeeIds = employees.map(e => e._id);

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      assignedTo: { $in: employeeIds },
      isDeleted: false,
      createdAt: { $gte: start, $lte: end }
    });

    const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const productivity = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

    const avgCompletionTime = await Task.aggregate([
      {
        $match: {
          assignedTo: { $in: employeeIds },
          isDeleted: false,
          status: TASK_STATUS.COMPLETED,
          completedAt: { $gte: start, $lte: end },
          createdAt: { $exists: true }
        }
      },
      {
        $project: {
          completionDays: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$completionDays' }
        }
      }
    ]);

    return {
      departmentId,
      departmentName: department.name,
      productivity: Math.round(productivity),
      totalTasks: tasks.length,
      completedTasks: completed.length,
      employeeCount: employees.length,
      avgCompletionDays: Math.round((avgCompletionTime[0]?.avgDays || 0) * 10) / 10
    };
  }

  async calculateProjectProductivity(projectId, startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      project: projectId,
      isDeleted: false,
      createdAt: { $gte: start, $lte: end }
    });

    const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const productivity = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

    const avgCompletionTime = await Task.aggregate([
      {
        $match: {
          project: projectId,
          isDeleted: false,
          status: TASK_STATUS.COMPLETED,
          completedAt: { $gte: start, $lte: end },
          createdAt: { $exists: true }
        }
      },
      {
        $project: {
          completionDays: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$completionDays' }
        }
      }
    ]);

    return {
      projectId,
      projectName: project.name,
      productivity: Math.round(productivity),
      totalTasks: tasks.length,
      completedTasks: completed.length,
      avgCompletionDays: Math.round((avgCompletionTime[0]?.avgDays || 0) * 10) / 10
    };
  }

  async calculateAverageCompletionTime(filters = {}) {
    const Task = (await import('./task.model.js')).default;

    const matchFilter = {
      isDeleted: false,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $exists: true },
      createdAt: { $exists: true }
    };

    if (filters.startDate && filters.endDate) {
      matchFilter.completedAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.employee) matchFilter.assignedTo = filters.employee;

    const result = await Task.aggregate([
      { $match: matchFilter },
      {
        $project: {
          completionDays: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$completionDays' },
          minDays: { $min: '$completionDays' },
          maxDays: { $max: '$completionDays' },
          medianDays: {
            $avg: '$completionDays'
          }
        }
      }
    ]);

    return {
      avgDays: Math.round((result[0]?.avgDays || 0) * 10) / 10,
      minDays: Math.round((result[0]?.minDays || 0) * 10) / 10,
      maxDays: Math.round((result[0]?.maxDays || 0) * 10) / 10
    };
  }

  async calculateAverageDelay(filters = {}) {
    const Task = (await import('./task.model.js')).default;

    const matchFilter = {
      isDeleted: false,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $exists: true },
      dueDate: { $exists: true }
    };

    if (filters.startDate && filters.endDate) {
      matchFilter.completedAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.employee) matchFilter.assignedTo = filters.employee;

    const result = await Task.aggregate([
      { $match: matchFilter },
      {
        $project: {
          delayDays: {
            $divide: [
              { $subtract: ['$completedAt', '$dueDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDelayDays: { $avg: '$delayDays' },
          maxDelayDays: { $max: '$delayDays' },
          onTimeRate: {
            $avg: { $cond: [{ $lte: ['$delayDays', 0] }, 1, 0] }
          }
        }
      }
    ]);

    return {
      avgDelayDays: Math.round((result[0]?.avgDelayDays || 0) * 10) / 10,
      maxDelayDays: Math.round((result[0]?.maxDelayDays || 0) * 10) / 10,
      onTimeRate: Math.round((result[0]?.onTimeRate || 0) * 100)
    };
  }

  async calculateAverageReviewTime(filters = {}) {
    const Task = (await import('./task.model.js')).default;

    const matchFilter = {
      isDeleted: false,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $exists: true },
      createdAt: { $exists: true }
    };

    if (filters.startDate && filters.endDate) {
      matchFilter.completedAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;

    const result = await Task.aggregate([
      { $match: matchFilter },
      {
        $project: {
          reviewDays: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgReviewDays: { $avg: '$reviewDays' },
          minReviewDays: { $min: '$reviewDays' },
          maxReviewDays: { $max: '$reviewDays' }
        }
      }
    ]);

    return {
      avgReviewDays: Math.round((result[0]?.avgReviewDays || 0) * 10) / 10,
      minReviewDays: Math.round((result[0]?.minReviewDays || 0) * 10) / 10,
      maxReviewDays: Math.round((result[0]?.maxReviewDays || 0) * 10) / 10
    };
  }

  async calculateTaskVelocity(projectId, sprintDays = 14) {
    const Task = (await import('./task.model.js')).default;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - sprintDays);

    const completedTasks = await Task.countDocuments({
      project: projectId,
      isDeleted: false,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $gte: startDate, $lte: endDate }
    });

    const storyPoints = await Task.aggregate([
      {
        $match: {
          project: projectId,
          isDeleted: false,
          status: TASK_STATUS.COMPLETED,
          completedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalStoryPoints: { $sum: '$estimatedHours' },
          avgStoryPoints: { $avg: '$estimatedHours' }
        }
      }
    ]);

    return {
      projectId,
      sprintDays,
      completedTasks,
      velocity: Math.round(completedTasks / (sprintDays / 7) * 10) / 10,
      totalStoryPoints: Math.round(storyPoints[0]?.totalStoryPoints || 0),
      avgStoryPoints: Math.round((storyPoints[0]?.avgStoryPoints || 0) * 10) / 10
    };
  }

  async generateBurnDownData(projectId, startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalEstimated = project.estimatedHours || await Task.aggregate([
      { $match: { project: projectId, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$estimatedHours' } } }
    ]).then(r => r[0]?.total || 0);

    const burnDownData = [];
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);

      const completedHours = await Task.aggregate([
        {
          $match: {
            project: projectId,
            isDeleted: false,
            status: TASK_STATUS.COMPLETED,
            completedAt: { $lte: currentDate }
          }
        },
        {
          $group: {
            _id: null,
            totalCompleted: { $sum: '$spentHours' }
          }
        }
      ]);

      const idealRemaining = totalEstimated * (1 - i / totalDays);
      const actualRemaining = totalEstimated - (completedHours[0]?.totalCompleted || 0);

      burnDownData.push({
        date: currentDate.toISOString().split('T')[0],
        idealRemaining: Math.round(idealRemaining),
        actualRemaining: Math.round(actualRemaining)
      });
    }

    return {
      projectId,
      projectName: project.name,
      totalEstimated,
      burnDownData
    };
  }

  async generateBurnUpData(projectId, startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalTasks = await Task.countDocuments({
      project: projectId,
      isDeleted: false
    });

    const burnUpData = [];
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);

      const completedTasks = await Task.countDocuments({
        project: projectId,
        isDeleted: false,
        status: TASK_STATUS.COMPLETED,
        completedAt: { $lte: currentDate }
      });

      const idealProgress = totalTasks * (i / totalDays);

      burnUpData.push({
        date: currentDate.toISOString().split('T')[0],
        idealProgress: Math.round(idealProgress),
        actualProgress: completedTasks
      });
    }

    return {
      projectId,
      projectName: project.name,
      totalTasks,
      burnUpData
    };
  }

  async calculateWorkEfficiency(employeeId, startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      assignedTo: employeeId,
      isDeleted: false,
      createdAt: { $gte: start, $lte: end }
    });

    const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalSpent = tasks.reduce((sum, t) => sum + (t.spentHours || 0), 0);

    const workLogs = await WorkLog.find({
      employee: employeeId,
      isDeleted: false,
      workDate: { $gte: start, $lte: end }
    });

    const totalLoggedHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const efficiency = totalEstimated > 0 ? (totalEstimated / totalSpent) * 100 : 100;
    const billableRate = totalLoggedHours > 0 ? (billableHours / totalLoggedHours) * 100 : 0;

    return {
      employeeId,
      efficiency: Math.round(efficiency),
      billableRate: Math.round(billableRate),
      totalTasks: tasks.length,
      completedTasks: completed.length,
      totalEstimated: Math.round(totalEstimated),
      totalSpent: Math.round(totalSpent),
      totalLoggedHours: Math.round(totalLoggedHours),
      billableHours: Math.round(billableHours)
    };
  }

  async calculateResourceUtilization(employeeId, startDate, endDate) {
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const workLogs = await WorkLog.find({
      employee: employeeId,
      isDeleted: false,
      workDate: { $gte: start, $lte: end }
    });

    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const workingDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const capacity = workingDays * 8;

    const utilization = capacity > 0 ? (totalHours / capacity) * 100 : 0;
    const billableUtilization = capacity > 0 ? (billableHours / capacity) * 100 : 0;

    return {
      employeeId,
      totalHours: Math.round(totalHours),
      billableHours: Math.round(billableHours),
      capacity,
      utilization: Math.round(utilization),
      billableUtilization: Math.round(billableUtilization),
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        workingDays
      }
    };
  }

  async calculateTaskAging(filters = {}) {
    const Task = (await import('./task.model.js')).default;

    const matchFilter = {
      isDeleted: false,
      status: { $ne: TASK_STATUS.COMPLETED }
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.employee) matchFilter.assignedTo = filters.employee;

    const agingBuckets = await Task.aggregate([
      { $match: matchFilter },
      {
        $project: {
          ageDays: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          },
          priority: 1,
          status: 1
        }
      },
      {
        $bucket: {
          groupBy: '$ageDays',
          boundaries: [0, 7, 14, 30, 60, 90],
          default: '90+',
          output: {
            count: { $sum: 1 },
            highPriority: {
              $sum: { $cond: [{ $eq: ['$priority', TASK_PRIORITY.CRITICAL] }, 1, 0] }
            }
          }
        }
      }
    ]);

    return {
      agingBuckets: agingBuckets.map(b => ({
        ageRange: b._id,
        count: b.count,
        highPriority: b.highPriority
      }))
    };
  }

  async calculateCompletionTrends(period = 'monthly', months = 12) {
    const Task = (await import('./task.model.js')).default;

    const trends = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const created = await Task.countDocuments({
        isDeleted: false,
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const completed = await Task.countDocuments({
        isDeleted: false,
        completedAt: { $gte: startDate, $lte: endDate }
      });

      const completionRate = created > 0 ? (completed / created) * 100 : 0;

      trends.push({
        period: startDate.toISOString().slice(0, 7),
        created,
        completed,
        completionRate: Math.round(completionRate)
      });
    }

    return {
      period,
      trends
    };
  }
}

export default new ProductivityService();
