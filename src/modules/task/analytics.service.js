import { TASK_STATUS, TASK_PRIORITY, TASK_CATEGORY } from './task.constants.js';
import { PROJECT_STATUS } from '../project/project.constants.js';
import AppError from '../../core/errors/AppError.js';

class AnalyticsService {
  async getOverviewAnalytics(filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const matchFilter = { isDeleted: false };
    if (filters.startDate && filters.endDate) {
      matchFilter.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;

    const totalTasks = await Task.countDocuments(matchFilter);
    const completedTasks = await Task.countDocuments({ ...matchFilter, status: TASK_STATUS.COMPLETED });
    const inProgressTasks = await Task.countDocuments({ ...matchFilter, status: TASK_STATUS.IN_PROGRESS });
    const blockedTasks = await Task.countDocuments({ ...matchFilter, status: TASK_STATUS.BLOCKED });

    const totalProjects = await Project.countDocuments({ isDeleted: false });
    const activeProjects = await Project.countDocuments({ isDeleted: false, status: PROJECT_STATUS.ACTIVE });
    const completedProjects = await Project.countDocuments({ isDeleted: false, status: PROJECT_STATUS.COMPLETED });

    const totalEmployees = await Employee.countDocuments({ isDeleted: false });

    const statusDistribution = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityDistribution = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        blocked: blockedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
      },
      employees: {
        total: totalEmployees
      },
      statusDistribution: statusDistribution.map(s => ({ status: s._id, count: s.count })),
      priorityDistribution: priorityDistribution.map(p => ({ priority: p._id, count: p.count }))
    };
  }

  async getProductivityAnalytics(startDate, endDate, filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const matchFilter = {
      isDeleted: false,
      createdAt: { $gte: start, $lte: end }
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;

    const employeeProductivity = await Task.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.COMPLETED] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          employeeId: '$_id',
          totalTasks: 1,
          completedTasks: 1,
          productivity: {
            $multiply: [
              { $divide: ['$completedTasks', '$totalTasks'] },
              100
            ]
          }
        }
      }
    ]);

    const employees = await Employee.find({ isDeleted: false }).select('_id firstName lastName');
    const enrichedProductivity = employeeProductivity.map(ep => ({
      ...ep,
      employeeName: employees.find(e => e._id.toString() === ep.employeeId.toString())?.name
    }));

    const dailyProductivity = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          completedAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          completedTasks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const workLogProductivity = await WorkLog.aggregate([
      {
        $match: {
          isDeleted: false,
          workDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$employee',
          totalHours: { $sum: '$duration' },
          billableHours: {
            $sum: { $cond: ['$billable', '$duration', 0] }
          }
        }
      }
    ]);

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      employeeProductivity: enrichedProductivity.sort((a, b) => b.productivity - a.productivity),
      dailyProductivity,
      workLogProductivity: workLogProductivity.map(w => ({
        employeeId: w._id,
        totalHours: Math.round(w.totalHours),
        billableHours: Math.round(w.billableHours)
      }))
    };
  }

  async getWorkloadAnalytics(filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const matchFilter = {
      isDeleted: false,
      status: { $ne: TASK_STATUS.COMPLETED }
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;

    const workloadByEmployee = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', TASK_PRIORITY.CRITICAL] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$status', TASK_STATUS.COMPLETED] },
                  { $lt: ['$dueDate', new Date()] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const employees = await Employee.find({ isDeleted: false }).select('_id firstName lastName');
    const enrichedWorkload = workloadByEmployee.map(w => ({
      employeeId: w._id,
      employeeName: employees.find(e => e._id.toString() === w._id.toString())?.name,
      totalTasks: w.totalTasks,
      highPriority: w.highPriority,
      overdue: w.overdue
    }));

    const workloadByPriority = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const workloadByStatus = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      workloadByEmployee: enrichedWorkload.sort((a, b) => b.totalTasks - a.totalTasks),
      workloadByPriority: workloadByPriority.map(w => ({ priority: w._id, count: w.count })),
      workloadByStatus: workloadByStatus.map(w => ({ status: w._id, count: w.count }))
    };
  }

  async getTrendsAnalytics(period = 'monthly', months = 6) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;

    const trends = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const tasksCreated = await Task.countDocuments({
        isDeleted: false,
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const tasksCompleted = await Task.countDocuments({
        isDeleted: false,
        completedAt: { $gte: startDate, $lte: endDate }
      });

      const workLogs = await WorkLog.find({
        isDeleted: false,
        workDate: { $gte: startDate, $lte: endDate }
      });

      const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);

      trends.push({
        period: startDate.toISOString().slice(0, 7),
        tasksCreated,
        tasksCompleted,
        totalHours: Math.round(totalHours)
      });
    }

    return {
      period,
      trends
    };
  }

  async getLeaderboardAnalytics(limit = 10) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const taskLeaderboard = await Task.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.COMPLETED] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          employeeId: '$_id',
          totalTasks: 1,
          completedTasks: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedTasks', '$totalTasks'] },
              100
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } },
      { $limit: limit }
    ]);

    const hoursLeaderboard = await WorkLog.aggregate([
      {
        $match: {
          isDeleted: false,
          workDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
        }
      },
      {
        $group: {
          _id: '$employee',
          totalHours: { $sum: '$duration' },
          billableHours: {
            $sum: { $cond: ['$billable', '$duration', 0] }
          }
        }
      },
      { $sort: { totalHours: -1 } },
      { $limit: limit }
    ]);

    const employees = await Employee.find({ isDeleted: false }).select('_id firstName lastName');

    const enrichedTaskLeaderboard = taskLeaderboard.map(t => ({
      ...t,
      employeeName: employees.find(e => e._id.toString() === t.employeeId.toString())?.name
    }));

    const enrichedHoursLeaderboard = hoursLeaderboard.map(h => ({
      employeeId: h._id,
      totalHours: Math.round(h.totalHours),
      billableHours: Math.round(h.billableHours),
      employeeName: employees.find(e => e._id.toString() === h._id.toString())?.name
    }));

    return {
      taskCompletion: enrichedTaskLeaderboard,
      hoursLogged: enrichedHoursLeaderboard
    };
  }

  async getHeatmapAnalytics(type = 'productivity', startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const departments = await Department.find({ isDeleted: false }).select('_id name');
    const heatmap = [];

    for (const department of departments) {
      const deptEmployees = await Employee.find({
        department: department._id,
        isDeleted: false
      }).select('_id');

      const employeeIds = deptEmployees.map(e => e._id);

      let value = 0;

      if (type === 'productivity') {
        const tasks = await Task.find({
          assignedTo: { $in: employeeIds },
          isDeleted: false,
          createdAt: { $gte: start, $lte: end }
        });

        const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
        value = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
      } else if (type === 'volume') {
        value = await Task.countDocuments({
          assignedTo: { $in: employeeIds },
          isDeleted: false,
          createdAt: { $gte: start, $lte: end }
        });
      } else if (type === 'hours') {
        const WorkLog = (await import('../worklog/worklog.model.js')).default;
        const workLogs = await WorkLog.find({
          employee: { $in: employeeIds },
          isDeleted: false,
          workDate: { $gte: start, $lte: end }
        });

        value = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
      }

      heatmap.push({
        department: department.name,
        value: type === 'hours' ? Math.round(value) : Math.round(value)
      });
    }

    return {
      type,
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      heatmap
    };
  }

  async getProjectsAnalytics(filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;

    const matchFilter = { isDeleted: false };
    if (filters.department) matchFilter.department = filters.department;

    const projects = await Project.find(matchFilter).select('_id name status progress');

    const projectAnalytics = await Promise.all(
      projects.map(async (project) => {
        const projectTasks = await Task.find({
          project: project._id,
          isDeleted: false
        });

        const completed = projectTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
        const inProgress = projectTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
        const blocked = projectTasks.filter(t => t.status === TASK_STATUS.BLOCKED).length;
        const overdue = projectTasks.filter(t => 
          t.status !== TASK_STATUS.COMPLETED && t.dueDate && t.dueDate < new Date()
        ).length;

        const totalHours = await Task.aggregate([
          {
            $match: {
              project: project._id,
              isDeleted: false
            }
          },
          {
            $group: {
              _id: null,
              totalSpentHours: { $sum: '$spentHours' }
            }
          }
        ]);

        return {
          projectId: project._id,
          projectName: project.name,
          status: project.status,
          progress: project.progress,
          totalTasks: projectTasks.length,
          completedTasks: completed,
          inProgressTasks: inProgress,
          blockedTasks: blocked,
          overdueTasks: overdue,
          totalSpentHours: Math.round(totalHours[0]?.totalSpentHours || 0)
        };
      })
    );

    const statusBreakdown = await Project.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const progressDistribution = await Project.aggregate([
      { $match: matchFilter },
      {
        $bucket: {
          groupBy: '$progress',
          boundaries: [0, 25, 50, 75, 100],
          default: '100',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    return {
      projectAnalytics: projectAnalytics.sort((a, b) => b.progress - a.progress),
      statusBreakdown: statusBreakdown.map(s => ({ status: s._id, count: s.count })),
      progressDistribution: progressDistribution.map(p => ({
        range: `${p._id}%`,
        count: p.count
      }))
    };
  }

  async getDepartmentsAnalytics(filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const departments = await Department.find({ isDeleted: false }).select('_id name');

    const departmentAnalytics = await Promise.all(
      departments.map(async (department) => {
        const deptEmployees = await Employee.find({
          department: department._id,
          isDeleted: false
        }).select('_id');

        const employeeIds = deptEmployees.map(e => e._id);

        const tasks = await Task.find({
          assignedTo: { $in: employeeIds },
          isDeleted: false
        });

        const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
        const productivity = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

        const WorkLog = (await import('../worklog/worklog.model.js')).default;
        const workLogs = await WorkLog.find({
          employee: { $in: employeeIds },
          isDeleted: false,
          workDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
        });

        const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);

        return {
          departmentId: department._id,
          departmentName: department.name,
          employeeCount: deptEmployees.length,
          totalTasks: tasks.length,
          completedTasks: completed,
          productivity: Math.round(productivity),
          totalHours: Math.round(totalHours),
          avgHoursPerEmployee: deptEmployees.length > 0 ? Math.round(totalHours / deptEmployees.length) : 0
        };
      })
    );

    return {
      departmentAnalytics: departmentAnalytics.sort((a, b) => b.productivity - a.productivity)
    };
  }

  async getTaskCompletionAnalytics(startDate, endDate) {
    const Task = (await import('./task.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const completionByStatus = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const completionByPriority = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.COMPLETED] }, 1, 0] }
          }
        }
      }
    ]);

    const completionByCategory = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.COMPLETED] }, 1, 0] }
          }
        }
      }
    ]);

    const avgCompletionTime = await Task.aggregate([
      {
        $match: {
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
          avgDays: { $avg: '$completionDays' },
          minDays: { $min: '$completionDays' },
          maxDays: { $max: '$completionDays' }
        }
      }
    ]);

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      completionByStatus: completionByStatus.map(s => ({ status: s._id, count: s.count })),
      completionByPriority: completionByPriority.map(p => ({
        priority: p._id,
        total: p.count,
        completed: p.completed,
        rate: p.count > 0 ? Math.round((p.completed / p.count) * 100) : 0
      })),
      completionByCategory: completionByCategory.map(c => ({
        category: c._id,
        total: c.count,
        completed: c.completed,
        rate: c.count > 0 ? Math.round((c.completed / c.count) * 100) : 0
      })),
      avgCompletionTime: {
        avgDays: Math.round((avgCompletionTime[0]?.avgDays || 0) * 10) / 10,
        minDays: Math.round((avgCompletionTime[0]?.minDays || 0) * 10) / 10,
        maxDays: Math.round((avgCompletionTime[0]?.maxDays || 0) * 10) / 10
      }
    };
  }

  async getDelayAnalytics(startDate, endDate) {
    const Task = (await import('./task.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const delayedTasks = await Task.find({
      isDeleted: false,
      status: { $ne: TASK_STATUS.COMPLETED },
      dueDate: { $lt: end }
    }).select('title dueDate priority assignedTo');

    const delayByPriority = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          status: { $ne: TASK_STATUS.COMPLETED },
          dueDate: { $lt: end }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const delayByDepartment = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          status: { $ne: TASK_STATUS.COMPLETED },
          dueDate: { $lt: end }
        }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const avgDelay = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          status: TASK_STATUS.COMPLETED,
          completedAt: { $gte: start, $lte: end },
          dueDate: { $exists: true }
        }
      },
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
          maxDelayDays: { $max: '$delayDays' }
        }
      }
    ]);

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      totalDelayed: delayedTasks.length,
      delayByPriority: delayByPriority.map(d => ({ priority: d._id, count: d.count })),
      delayByDepartment: delayByDepartment.map(d => ({ departmentId: d._id, count: d.count })),
      avgDelay: {
        avgDays: Math.round((avgDelay[0]?.avgDelayDays || 0) * 10) / 10,
        maxDays: Math.round((avgDelay[0]?.maxDelayDays || 0) * 10) / 10
      }
    };
  }

  async getReviewAnalytics(startDate, endDate) {
    const Task = (await import('./task.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const pendingReviews = await Task.find({
      isDeleted: false,
      status: TASK_STATUS.IN_REVIEW
    }).select('title reviewer assignedTo dueDate');

    const completedReviews = await Task.find({
      isDeleted: false,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $gte: start, $lte: end }
    }).select('title reviewer completedAt');

    const reviewByReviewer = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          status: TASK_STATUS.IN_REVIEW
        }
      },
      {
        $group: {
          _id: '$reviewer',
          count: { $sum: 1 }
        }
      }
    ]);

    const avgReviewTime = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          status: TASK_STATUS.COMPLETED,
          completedAt: { $gte: start, $lte: end }
        }
      },
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
          avgReviewDays: { $avg: '$reviewDays' }
        }
      }
    ]);

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      pendingReviews: pendingReviews.length,
      completedReviews: completedReviews.length,
      reviewByReviewer: reviewByReviewer.map(r => ({ reviewerId: r._id, count: r.count })),
      avgReviewTime: Math.round((avgReviewTime[0]?.avgReviewDays || 0) * 10) / 10
    };
  }

  async getDependencyAnalytics() {
    const Task = (await import('./task.model.js')).default;

    const tasksWithDependencies = await Task.find({
      isDeleted: false,
      dependencies: { $exists: true, $ne: [] }
    }).select('_id title dependencies status');

    const dependencyCount = await Task.aggregate([
      {
        $match: {
          isDeleted: false,
          dependencies: { $exists: true, $ne: [] }
        }
      },
      {
        $project: {
          dependencyCount: { $size: '$dependencies' }
        }
      },
      {
        $group: {
          _id: null,
          avgDependencies: { $avg: '$dependencyCount' },
          maxDependencies: { $max: '$dependencyCount' }
        }
      }
    ]);

    const blockedByDependencies = tasksWithDependencies.filter(t => t.status === TASK_STATUS.BLOCKED);

    return {
      totalTasksWithDependencies: tasksWithDependencies.length,
      avgDependencies: Math.round(dependencyCount[0]?.avgDependencies || 0),
      maxDependencies: dependencyCount[0]?.maxDependencies || 0,
      blockedByDependencies: blockedByDependencies.length
    };
  }

  async getTimelineAnalytics(entityType, entityId, startDate, endDate) {
    const ActivityTimeline = (await import('./activityTimeline.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const matchFilter = {
      createdAt: { $gte: start, $lte: end }
    };

    if (entityType && entityId) {
      matchFilter.entityType = entityType;
      matchFilter.entityId = entityId;
    }

    const activities = await ActivityTimeline.find(matchFilter)
      .sort({ createdAt: -1 });

    const actionBreakdown = await ActivityTimeline.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const dailyActivity = await ActivityTimeline.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      totalActivities: activities.length,
      actionBreakdown: actionBreakdown.map(a => ({ action: a._id, count: a.count })),
      dailyActivity,
      recentActivities: activities.slice(0, 20)
    };
  }
}

export default new AnalyticsService();
