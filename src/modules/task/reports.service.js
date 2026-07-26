import { TASK_STATUS, TASK_PRIORITY } from './task.constants.js';
import { PROJECT_STATUS } from '../project/project.constants.js';
import AppError from '../../core/errors/AppError.js';

class ReportsService {
  async generateDailyReport(date, filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const reportDate = new Date(date);
    reportDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const matchFilter = {
      isDeleted: false,
      createdAt: { $gte: reportDate, $lt: nextDay }
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.employee) matchFilter.assignedTo = filters.employee;

    const tasksCreated = await Task.countDocuments(matchFilter);
    const tasksCompleted = await Task.countDocuments({
      ...matchFilter,
      status: TASK_STATUS.COMPLETED
    });

    const workLogs = await WorkLog.find({
      isDeleted: false,
      workDate: { $gte: reportDate, $lt: nextDay },
      ...(filters.employee && { employee: filters.employee }),
      ...(filters.project && { project: filters.project })
    });

    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const activeEmployees = await WorkLog.distinct('employee', {
      isDeleted: false,
      workDate: { $gte: reportDate, $lt: nextDay }
    });

    return {
      reportDate: reportDate.toISOString().split('T')[0],
      summary: {
        tasksCreated,
        tasksCompleted,
        totalHours: Math.round(totalHours),
        billableHours: Math.round(billableHours),
        activeEmployees: activeEmployees.length
      },
      workLogs: workLogs.map(w => ({
        employee: w.employee,
        task: w.task,
        project: w.project,
        duration: w.duration,
        billable: w.billable,
        activityType: w.activityType
      }))
    };
  }

  async generateWeeklyReport(startDate, filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;

    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const matchFilter = {
      isDeleted: false,
      createdAt: { $gte: weekStart, $lte: weekEnd }
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.employee) matchFilter.assignedTo = filters.employee;

    const tasksCreated = await Task.countDocuments(matchFilter);
    const tasksCompleted = await Task.countDocuments({
      ...matchFilter,
      status: TASK_STATUS.COMPLETED
    });

    const workLogs = await WorkLog.find({
      isDeleted: false,
      workDate: { $gte: weekStart, $lte: weekEnd },
      ...(filters.employee && { employee: filters.employee }),
      ...(filters.project && { project: filters.project })
    });

    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayTasks = await Task.countDocuments({
        isDeleted: false,
        createdAt: { $gte: day, $lt: nextDay },
        ...(filters.employee && { assignedTo: filters.employee })
      });

      const dayWorkLogs = await WorkLog.find({
        isDeleted: false,
        workDate: { $gte: day, $lt: nextDay },
        ...(filters.employee && { employee: filters.employee })
      });

      dailyBreakdown.push({
        date: day.toISOString().split('T')[0],
        tasksCreated: dayTasks,
        hoursLogged: Math.round(dayWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0))
      });
    }

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      summary: {
        tasksCreated,
        tasksCompleted,
        totalHours: Math.round(totalHours),
        billableHours: Math.round(billableHours)
      },
      dailyBreakdown
    };
  }

  async generateMonthlyReport(year, month, filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const matchFilter = {
      isDeleted: false,
      createdAt: { $gte: monthStart, $lte: monthEnd }
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.employee) matchFilter.assignedTo = filters.employee;

    const tasksCreated = await Task.countDocuments(matchFilter);
    const tasksCompleted = await Task.countDocuments({
      ...matchFilter,
      status: TASK_STATUS.COMPLETED
    });

    const workLogs = await WorkLog.find({
      isDeleted: false,
      workDate: { $gte: monthStart, $lte: monthEnd },
      ...(filters.employee && { employee: filters.employee }),
      ...(filters.project && { project: filters.project })
    });

    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const weeklyBreakdown = [];
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(monthStart);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > monthEnd) weekEnd.setTime(monthEnd.getTime());

      const weekTasks = await Task.countDocuments({
        isDeleted: false,
        createdAt: { $gte: weekStart, $lte: weekEnd },
        ...(filters.employee && { assignedTo: filters.employee })
      });

      const weekWorkLogs = await WorkLog.find({
        isDeleted: false,
        workDate: { $gte: weekStart, $lte: weekEnd },
        ...(filters.employee && { employee: filters.employee })
      });

      weeklyBreakdown.push({
        week: week + 1,
        tasksCreated: weekTasks,
        hoursLogged: Math.round(weekWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0))
      });
    }

    return {
      year,
      month,
      summary: {
        tasksCreated,
        tasksCompleted,
        totalHours: Math.round(totalHours),
        billableHours: Math.round(billableHours)
      },
      weeklyBreakdown
    };
  }

  async generateEmployeeReport(employeeId, startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
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
    }).select('title status priority dueDate completedAt spentHours');

    const workLogs = await WorkLog.find({
      employee: employeeId,
      isDeleted: false,
      workDate: { $gte: start, $lte: end }
    }).select('duration billable task project activityType');

    const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const pendingTasks = tasks.filter(t => t.status !== TASK_STATUS.COMPLETED);
    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const productivity = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    return {
      employee: {
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId
      },
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      summary: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        productivity: Math.round(productivity),
        totalHours: Math.round(totalHours),
        billableHours: Math.round(billableHours)
      },
      tasks: tasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        completedAt: t.completedAt,
        spentHours: t.spentHours
      })),
      workLogs: workLogs.map(w => ({
        date: w.workDate,
        duration: w.duration,
        billable: w.billable,
        task: w.task,
        project: w.project,
        activityType: w.activityType
      }))
    };
  }

  async generateDepartmentReport(departmentId, startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const department = await Department.findById(departmentId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const employees = await Employee.find({
      department: departmentId,
      isDeleted: false
    }).select('_id firstName lastName');

    const employeeIds = employees.map(e => e._id);

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      assignedTo: { $in: employeeIds },
      isDeleted: false,
      createdAt: { $gte: start, $lte: end }
    });

    const workLogs = await WorkLog.find({
      employee: { $in: employeeIds },
      isDeleted: false,
      workDate: { $gte: start, $lte: end }
    });

    const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const employeeBreakdown = await Promise.all(
      employees.map(async (employee) => {
        const empTasks = tasks.filter(t => t.assignedTo.toString() === employee._id.toString());
        const empWorkLogs = workLogs.filter(w => w.employee.toString() === employee._id.toString());
        const empCompleted = empTasks.filter(t => t.status === TASK_STATUS.COMPLETED);
        const empProductivity = empTasks.length > 0 ? (empCompleted.length / empTasks.length) * 100 : 0;

        return {
          employee: {
            id: employee._id,
            name: `${employee.firstName} ${employee.lastName}`
          },
          tasks: empTasks.length,
          completedTasks: empCompleted.length,
          productivity: Math.round(empProductivity),
          hours: Math.round(empWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0))
        };
      })
    );

    return {
      department: {
        id: department._id,
        name: department.name
      },
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      summary: {
        totalEmployees: employees.length,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        totalHours: Math.round(totalHours),
        billableHours: Math.round(billableHours)
      },
      employeeBreakdown: employeeBreakdown.sort((a, b) => b.productivity - a.productivity)
    };
  }

  async generateProjectReport(projectId, startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
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
    }).select('title status priority assignedTo dueDate completedAt spentHours');

    const workLogs = await WorkLog.find({
      project: projectId,
      isDeleted: false,
      workDate: { $gte: start, $lte: end }
    });

    const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const blockedTasks = tasks.filter(t => t.status === TASK_STATUS.BLOCKED);
    const overdueTasks = tasks.filter(t => 
      t.status !== TASK_STATUS.COMPLETED && t.dueDate && t.dueDate < new Date()
    );

    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const progress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    const statusBreakdown = await Task.aggregate([
      {
        $match: {
          project: projectId,
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

    const priorityBreakdown = await Task.aggregate([
      {
        $match: {
          project: projectId,
          isDeleted: false,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      project: {
        id: project._id,
        name: project.name,
        projectCode: project.projectCode
      },
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      summary: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        blockedTasks: blockedTasks.length,
        overdueTasks: overdueTasks.length,
        progress: Math.round(progress),
        totalHours: Math.round(totalHours),
        billableHours: Math.round(billableHours)
      },
      statusBreakdown: statusBreakdown.map(s => ({ status: s._id, count: s.count })),
      priorityBreakdown: priorityBreakdown.map(p => ({ priority: p._id, count: p.count }))
    };
  }

  async generateTaskReport(taskId) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const ActivityTimeline = (await import('./activityTimeline.model.js')).default;

    const task = await Task.findById(taskId)
      .populate('assignedTo', 'firstName lastName')
      .populate('reviewer', 'firstName lastName')
      .populate('project', 'name');

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const workLogs = await WorkLog.find({
      task: task._id,
      isDeleted: false
    }).sort({ workDate: -1 });

    const activities = await ActivityTimeline.find({
      entityType: 'task',
      entityId: task._id
    }).sort({ createdAt: -1 });

    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    return {
      task: {
        id: task._id,
        taskNumber: task.taskNumber,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        reviewer: task.reviewer,
        project: task.project,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        completionPercentage: task.completionPercentage
      },
      summary: {
        totalHours: Math.round(totalHours),
        billableHours: Math.round(billableHours),
        workLogEntries: workLogs.length,
        activityEntries: activities.length
      },
      workLogs: workLogs.map(w => ({
        date: w.workDate,
        duration: w.duration,
        billable: w.billable,
        activityType: w.activityType,
        description: w.description
      })),
      activities: activities.map(a => ({
        action: a.action,
        performedBy: a.performedBy,
        createdAt: a.createdAt,
        description: a.description
      }))
    };
  }

  async generateWorkLogReport(startDate, endDate, filters = {}) {
    const WorkLog = (await import('../worklog/worklog.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const matchFilter = {
      isDeleted: false,
      workDate: { $gte: start, $lte: end }
    };

    if (filters.employee) matchFilter.employee = filters.employee;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.department) {
      const Employee = (await import('../employee/employee.model.js')).default;
      const deptEmployees = await Employee.find({ department: filters.department }).select('_id');
      matchFilter.employee = { $in: deptEmployees.map(e => e._id) };
    }

    const workLogs = await WorkLog.find(matchFilter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('task', 'title')
      .populate('project', 'name')
      .sort({ workDate: -1 });

    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const employeeBreakdown = await WorkLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$employee',
          totalHours: { $sum: '$duration' },
          billableHours: { $sum: { $cond: ['$billable', '$duration', 0] } },
          entries: { $sum: 1 }
        }
      }
    ]);

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      summary: {
        totalEntries: workLogs.length,
        totalHours: Math.round(totalHours),
        billableHours: Math.round(billableHours),
        nonBillableHours: Math.round(totalHours - billableHours)
      },
      employeeBreakdown,
      workLogs: workLogs.map(w => ({
        date: w.workDate,
        employee: w.employee,
        task: w.task,
        project: w.project,
        duration: w.duration,
        billable: w.billable,
        activityType: w.activityType,
        description: w.description
      }))
    };
  }

  async generateOverdueReport(filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchFilter = {
      isDeleted: false,
      isArchived: false,
      status: { $ne: TASK_STATUS.COMPLETED },
      dueDate: { $lt: today }
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.employee) matchFilter.assignedTo = filters.employee;
    if (filters.priority) matchFilter.priority = filters.priority;

    const overdueTasks = await Task.find(matchFilter)
      .populate('assignedTo', 'firstName lastName')
      .populate('project', 'name')
      .populate('reviewer', 'firstName lastName')
      .sort({ dueDate: 1 });

    const byPriority = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const byProject = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 }
        }
      }
    ]);

    const byDepartment = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      reportDate: today.toISOString().split('T')[0],
      summary: {
        totalOverdue: overdueTasks.length,
        byPriority: byPriority.map(p => ({ priority: p._id, count: p.count })),
        byProject: byProject.map(p => ({ projectId: p._id, count: p.count })),
        byDepartment: byDepartment.map(d => ({ departmentId: d._id, count: d.count }))
      },
      overdueTasks: overdueTasks.map(t => ({
        id: t._id,
        taskNumber: t.taskNumber,
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate,
        assignedTo: t.assignedTo,
        project: t.project,
        reviewer: t.reviewer,
        daysOverdue: Math.floor((today - t.dueDate) / (1000 * 60 * 60 * 24))
      }))
    };
  }

  async generateBlockedTaskReport(filters = {}) {
    const Task = (await import('./task.model.js')).default;

    const matchFilter = {
      isDeleted: false,
      isArchived: false,
      status: TASK_STATUS.BLOCKED
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.employee) matchFilter.assignedTo = filters.employee;

    const blockedTasks = await Task.find(matchFilter)
      .populate('assignedTo', 'firstName lastName')
      .populate('project', 'name')
      .sort({ updatedAt: -1 });

    return {
      reportDate: new Date().toISOString().split('T')[0],
      summary: {
        totalBlocked: blockedTasks.length
      },
      blockedTasks: blockedTasks.map(t => ({
        id: t._id,
        taskNumber: t.taskNumber,
        title: t.title,
        priority: t.priority,
        assignedTo: t.assignedTo,
        project: t.project,
        dependencies: t.dependencies,
        blockedSince: t.updatedAt
      }))
    };
  }

  async generateProductivityReport(startDate, endDate, filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const employees = await Employee.find({ isDeleted: false }).select('_id firstName lastName department');

    const productivityData = await Promise.all(
      employees.map(async (employee) => {
        const tasks = await Task.find({
          assignedTo: employee._id,
          isDeleted: false,
          createdAt: { $gte: start, $lte: end }
        });

        const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
        const productivity = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

        const workLogs = await WorkLog.find({
          employee: employee._id,
          isDeleted: false,
          workDate: { $gte: start, $lte: end }
        });

        const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);

        const avgCompletionTime = await Task.aggregate([
          {
            $match: {
              assignedTo: employee._id,
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
          employee: {
            id: employee._id,
            name: `${employee.firstName} ${employee.lastName}`,
            department: employee.department
          },
          productivity: Math.round(productivity),
          totalTasks: tasks.length,
          completedTasks: completed.length,
          totalHours: Math.round(totalHours),
          avgCompletionTime: Math.round((avgCompletionTime[0]?.avgDays || 0) * 10) / 10
        };
      })
    );

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      productivityData: productivityData.sort((a, b) => b.productivity - a.productivity)
    };
  }

  async generateUtilizationReport(startDate, endDate, filters = {}) {
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const employees = await Employee.find({ isDeleted: false }).select('_id firstName lastName');

    const utilizationData = await Promise.all(
      employees.map(async (employee) => {
        const workLogs = await WorkLog.find({
          employee: employee._id,
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
          employee: {
            id: employee._id,
            name: `${employee.firstName} ${employee.lastName}`
          },
          totalHours: Math.round(totalHours),
          billableHours: Math.round(billableHours),
          capacity,
          utilization: Math.round(utilization),
          billableUtilization: Math.round(billableUtilization)
        };
      })
    );

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      utilizationData: utilizationData.sort((a, b) => b.utilization - a.utilization)
    };
  }

  async generateCompletionReport(startDate, endDate, filters = {}) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const matchFilter = {
      isDeleted: false,
      completedAt: { $gte: start, $lte: end }
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.employee) matchFilter.assignedTo = filters.employee;

    const completedTasks = await Task.find(matchFilter)
      .populate('assignedTo', 'firstName lastName')
      .populate('project', 'name')
      .sort({ completedAt: -1 });

    const byProject = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 }
        }
      }
    ]);

    const byEmployee = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 }
        }
      }
    ]);

    const avgCompletionTime = await Task.aggregate([
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
          avgDays: { $avg: '$completionDays' }
        }
      }
    ]);

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      summary: {
        totalCompleted: completedTasks.length,
        byProject: byProject.map(p => ({ projectId: p._id, count: p.count })),
        byEmployee: byEmployee.map(e => ({ employeeId: e._id, count: e.count })),
        avgCompletionDays: Math.round((avgCompletionTime[0]?.avgDays || 0) * 10) / 10
      },
      completedTasks: completedTasks.map(t => ({
        id: t._id,
        taskNumber: t.taskNumber,
        title: t.title,
        assignedTo: t.assignedTo,
        project: t.project,
        completedAt: t.completedAt,
        spentHours: t.spentHours
      }))
    };
  }

  async generateExecutiveReport(startDate, endDate) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const totalTasks = await Task.countDocuments({
      isDeleted: false,
      createdAt: { $gte: start, $lte: end }
    });

    const completedTasks = await Task.countDocuments({
      isDeleted: false,
      completedAt: { $gte: start, $lte: end }
    });

    const totalProjects = await Project.countDocuments({
      isDeleted: false,
      createdAt: { $gte: start, $lte: end }
    });

    const completedProjects = await Project.countDocuments({
      isDeleted: false,
      status: PROJECT_STATUS.COMPLETED,
      updatedAt: { $gte: start, $lte: end }
    });

    const totalEmployees = await Employee.countDocuments({ isDeleted: false });

    const workLogs = await WorkLog.find({
      isDeleted: false,
      workDate: { $gte: start, $lte: end }
    });

    const totalHours = workLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableHours = workLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0);

    const departments = await Department.find({ isDeleted: false }).select('_id name');
    const departmentBreakdown = await Promise.all(
      departments.map(async (dept) => {
        const deptTasks = await Task.countDocuments({
          isDeleted: false,
          department: dept._id,
          createdAt: { $gte: start, $lte: end }
        });

        const deptCompleted = await Task.countDocuments({
          isDeleted: false,
          department: dept._id,
          completedAt: { $gte: start, $lte: end }
        });

        return {
          department: {
            id: dept._id,
            name: dept.name
          },
          totalTasks: deptTasks,
          completedTasks: deptCompleted,
          productivity: deptTasks > 0 ? Math.round((deptCompleted / deptTasks) * 100) : 0
        };
      })
    );

    const projectBreakdown = await Project.aggregate([
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

    return {
      executiveSummary: {
        period: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        },
        metrics: {
          totalTasks,
          completedTasks,
          taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          totalProjects,
          completedProjects,
          projectCompletionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
          totalEmployees,
          totalHours: Math.round(totalHours),
          billableHours: Math.round(billableHours),
          billableRate: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0
        }
      },
      departmentBreakdown,
      projectBreakdown: projectBreakdown.map(p => ({ status: p._id, count: p.count }))
    };
  }
}

export default new ReportsService();
