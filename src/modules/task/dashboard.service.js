import { TASK_STATUS, TASK_PRIORITY } from './task.constants.js';
import { PROJECT_STATUS } from '../project/project.constants.js';
import AppError from '../../core/errors/AppError.js';

class DashboardService {
  async getEmployeeDashboard(employeeId) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const todayTasks = await Task.find({
      assignedTo: employeeId,
      isDeleted: false,
      isArchived: false,
      dueDate: { $gte: today, $lt: tomorrow }
    }).select('title status priority dueDate completionPercentage');

    const pendingTasks = await Task.find({
      assignedTo: employeeId,
      isDeleted: false,
      isArchived: false,
      status: { $in: [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.IN_REVIEW] }
    }).select('title status priority dueDate completionPercentage')
      .sort({ dueDate: 1 })
      .limit(10);

    const completedTasks = await Task.find({
      assignedTo: employeeId,
      isDeleted: false,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $gte: today }
    }).select('title completedAt spentHours');

    const overdueTasks = await Task.find({
      assignedTo: employeeId,
      isDeleted: false,
      isArchived: false,
      status: { $ne: TASK_STATUS.COMPLETED },
      dueDate: { $lt: today }
    }).select('title dueDate priority')
      .sort({ dueDate: 1 });

    const todayWorkLogs = await WorkLog.find({
      employee: employeeId,
      isDeleted: false,
      workDate: { $gte: today, $lt: tomorrow }
    }).select('duration task project billable');

    const weeklyWorkLogs = await WorkLog.find({
      employee: employeeId,
      isDeleted: false,
      workDate: { $gte: weekStart, $lte: weekEnd }
    }).select('duration billable');

    const monthlyWorkLogs = await WorkLog.find({
      employee: employeeId,
      isDeleted: false,
      workDate: { $gte: monthStart, $lte: monthEnd }
    }).select('duration billable');

    const currentProject = await Project.findOne({
      members: employeeId,
      isDeleted: false,
      status: { $ne: PROJECT_STATUS.COMPLETED }
    }).select('name progress dueDate');

    const ActivityTimeline = (await import('./activityTimeline.model.js')).default;
    const recentActivities = await ActivityTimeline.find({
      performedBy: employeeId
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action entityType entityId createdAt description');

    const reviewTasks = await Task.find({
      reviewer: employeeId,
      isDeleted: false,
      status: TASK_STATUS.IN_REVIEW
    }).select('title assignedTo dueDate');

    const totalCompleted = await Task.countDocuments({
      assignedTo: employeeId,
      isDeleted: false,
      status: TASK_STATUS.COMPLETED
    });

    const totalTasks = await Task.countDocuments({
      assignedTo: employeeId,
      isDeleted: false
    });

    const completionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    const avgCompletionTimeResult = await Task.aggregate([
      {
        $match: {
          assignedTo: employeeId,
          isDeleted: false,
          status: TASK_STATUS.COMPLETED,
          completedAt: { $exists: true },
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
          avgCompletionDays: { $avg: '$completionDays' }
        }
      }
    ]);

    const avgCompletionDays = avgCompletionTimeResult[0]?.avgCompletionDays || 0;

    const weeklyTotalDuration = weeklyWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const monthlyTotalDuration = monthlyWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0);

    return {
      employee: {
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId
      },
      today: {
        tasks: todayTasks,
        workLogs: todayWorkLogs,
        totalHours: todayWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0)
      },
      pendingTasks,
      completedTasks: completedTasks,
      overdueTasks,
      weeklyProductivity: {
        totalHours: Math.round(weeklyTotalDuration),
        billableHours: Math.round(weeklyWorkLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0)),
        tasksCompleted: completedTasks.length
      },
      monthlyProductivity: {
        totalHours: Math.round(monthlyTotalDuration),
        billableHours: Math.round(monthlyWorkLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0)),
        tasksCompleted: await Task.countDocuments({
          assignedTo: employeeId,
          isDeleted: false,
          status: TASK_STATUS.COMPLETED,
          completedAt: { $gte: monthStart }
        })
      },
      currentProject,
      recentActivities,
      assignedReviews: reviewTasks,
      statistics: {
        completionRate: Math.round(completionRate),
        averageCompletionTime: Math.round(avgCompletionDays * 10) / 10,
        totalTasks,
        totalCompleted,
        totalOverdue: overdueTasks.length
      }
    };
  }

  async getTeamLeadDashboard(teamLeadId) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    const teamLead = await Employee.findById(teamLeadId);
    if (!teamLead) {
      throw new AppError('Team lead not found', 404);
    }

    const teamProjects = await Project.find({
      teamLeads: teamLeadId,
      isDeleted: false
    }).select('_id name');

    const projectIds = teamProjects.map(p => p._id);

    const teamMembers = await Employee.find({
      isDeleted: false,
      $or: [
        { _id: { $in: (await Project.find({ teamLeads: teamLeadId }).distinct('members')) } }
      ]
    }).select('_id firstName lastName employeeId');

    const memberIds = teamMembers.map(m => m._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const teamTasks = await Task.find({
      project: { $in: projectIds },
      isDeleted: false,
      isArchived: false
    }).select('title status priority assignedTo dueDate');

    const pendingReviews = await Task.find({
      reviewer: teamLeadId,
      isDeleted: false,
      status: TASK_STATUS.IN_REVIEW
    }).select('title assignedTo dueDate');

    const blockedTasks = await Task.find({
      project: { $in: projectIds },
      isDeleted: false,
      status: TASK_STATUS.BLOCKED
    }).select('title assignedTo dependencies');

    const completedToday = await Task.find({
      project: { $in: projectIds },
      isDeleted: false,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $gte: today }
    }).select('title assignedTo');

    const delayedTasks = await Task.find({
      project: { $in: projectIds },
      isDeleted: false,
      isArchived: false,
      status: { $ne: TASK_STATUS.COMPLETED },
      dueDate: { $lt: today }
    }).select('title assignedTo dueDate');

    const memberProductivity = [];
    for (const member of teamMembers) {
      const memberTasks = await Task.find({
        assignedTo: member._id,
        isDeleted: false
      }).select('status');

      const completed = memberTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      const total = memberTasks.length;
      const productivity = total > 0 ? (completed / total) * 100 : 0;

      const memberWorkLogs = await WorkLog.find({
        employee: member._id,
        isDeleted: false,
        workDate: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) }
      }).select('duration');

      const totalHours = memberWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0);

      memberProductivity.push({
        employee: {
          id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          employeeId: member.employeeId
        },
        productivity: Math.round(productivity),
        totalTasks: total,
        completedTasks: completed,
        monthlyHours: Math.round(totalHours)
      });
    }

    const todayWorkLogs = await WorkLog.find({
      employee: { $in: memberIds },
      isDeleted: false,
      workDate: { $gte: today }
    }).select('duration billable');

    const teamCapacity = memberIds.length * 8;
    const utilizedHours = todayWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const utilization = teamCapacity > 0 ? (utilizedHours / teamCapacity) * 100 : 0;

    const taskDistribution = await Task.aggregate([
      { $match: { project: { $in: projectIds }, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const department = await Department.findById(teamLead.department).select('name');

    return {
      teamLead: {
        id: teamLead._id,
        name: `${teamLead.firstName} ${teamLead.lastName}`,
        department: department?.name
      },
      teamWorkload: {
        totalTasks: teamTasks.length,
        taskDistribution: taskDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      pendingReviews,
      blockedTasks,
      completedToday,
      delayedTasks,
      memberProductivity: memberProductivity.sort((a, b) => b.productivity - a.productivity),
      timeTrackingSummary: {
        totalHours: Math.round(todayWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0)),
        billableHours: Math.round(todayWorkLogs.filter(w => w.billable).reduce((sum, w) => sum + (w.duration || 0), 0))
      },
      teamCapacity: {
        totalCapacity: teamCapacity,
        utilizedHours: Math.round(utilizedHours),
        utilizationRate: Math.round(utilization)
      },
      departmentSummary: {
        name: department?.name,
        memberCount: memberIds.length,
        projectCount: projectIds.length
      }
    };
  }

  async getProjectManagerDashboard(projectManagerId) {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const projectManager = await Employee.findById(projectManagerId);
    if (!projectManager) {
      throw new AppError('Project manager not found', 404);
    }

    const projects = await Project.find({
      projectManager: projectManagerId,
      isDeleted: false
    }).select('_id name progress status budget estimatedHours spentHours startDate endDate');

    const projectIds = projects.map(p => p._id);

    const allTasks = await Task.find({
      project: { $in: projectIds },
      isDeleted: false
    }).select('title status priority dueDate project');

    const completedTasks = allTasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const pendingTasks = allTasks.filter(t => 
      [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.IN_REVIEW].includes(t.status)
    );
    const blockedTasks = allTasks.filter(t => t.status === TASK_STATUS.BLOCKED);
    const riskTasks = allTasks.filter(t => 
      t.priority === TASK_PRIORITY.CRITICAL && t.status !== TASK_STATUS.COMPLETED
    );

    const today = new Date();
    const upcomingDeadlines = await Task.find({
      project: { $in: projectIds },
      isDeleted: false,
      isArchived: false,
      status: { $ne: TASK_STATUS.COMPLETED },
      dueDate: { $gte: today, $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) }
    }).select('title dueDate project priority')
      .sort({ dueDate: 1 });

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalEstimatedHours = projects.reduce((sum, p) => sum + (p.estimatedHours || 0), 0);
    const totalSpentHours = projects.reduce((sum, p) => sum + (p.spentHours || 0), 0);

    const budgetUtilization = totalBudget > 0 ? (totalSpentHours / totalEstimatedHours) * 100 : 0;
    const timeUtilization = totalEstimatedHours > 0 ? (totalSpentHours / totalEstimatedHours) * 100 : 0;

    const projectHealthScores = await Promise.all(
      projects.map(async (project) => {
        const projectTasks = await Task.find({ project: project._id, isDeleted: false });
        const completed = projectTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
        const total = projectTasks.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        const overdue = projectTasks.filter(t => 
          t.status !== TASK_STATUS.COMPLETED && t.dueDate && t.dueDate < today
        ).length;

        let healthScore = 100;
        if (overdue > 0) healthScore -= overdue * 10;
        if (progress < 50 && project.progress < 50) healthScore -= 20;
        if (blockedTasks.filter(t => t.project.toString() === project._id.toString()).length > 0) healthScore -= 15;

        return {
          projectId: project._id,
          projectName: project.name,
          healthScore: Math.max(0, healthScore),
          progress: project.progress,
          status: project.status
        };
      })
    );

    return {
      projectManager: {
        id: projectManager._id,
        name: `${projectManager.firstName} ${projectManager.lastName}`
      },
      projects: projects.map(p => ({
        id: p._id,
        name: p.name,
        progress: p.progress,
        status: p.status,
        healthScore: projectHealthScores.find(h => h.projectId.toString() === p._id.toString())?.healthScore || 100
      })),
      sprintProgress: {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0
      },
      projectHealthScores: projectHealthScores.sort((a, b) => b.healthScore - a.healthScore),
      taskBreakdown: {
        completed: completedTasks.length,
        pending: pendingTasks.length,
        blocked: blockedTasks.length,
        risk: riskTasks.length
      },
      budgetUtilization: Math.round(budgetUtilization),
      timeUtilization: Math.round(timeUtilization),
      upcomingDeadlines,
      milestones: await this.getProjectMilestones(projectIds)
    };
  }

  async getHRDashboard() {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    const departments = await Department.find({ isDeleted: false }).select('_id name');
    const employees = await Employee.find({ isDeleted: false }).select('_id firstName lastName department');

    const employeeProductivity = [];
    for (const employee of employees) {
      const employeeTasks = await Task.find({
        assignedTo: employee._id,
        isDeleted: false
      }).select('status');

      const completed = employeeTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      const total = employeeTasks.length;
      const productivity = total > 0 ? (completed / total) * 100 : 0;

      const employeeWorkLogs = await WorkLog.find({
        employee: employee._id,
        isDeleted: false,
        workDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }).select('duration');

      const totalHours = employeeWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0);

      employeeProductivity.push({
        employee: {
          id: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          department: employee.department
        },
        productivity: Math.round(productivity),
        monthlyHours: Math.round(totalHours),
        totalTasks: total,
        completedTasks: completed
      });
    }

    const departmentProductivity = [];
    for (const department of departments) {
      const deptEmployees = employees.filter(e => e.department?.toString() === department._id.toString());
      const deptEmployeeIds = deptEmployees.map(e => e._id);

      const deptTasks = await Task.find({
        assignedTo: { $in: deptEmployeeIds },
        isDeleted: false
      }).select('status');

      const completed = deptTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      const total = deptTasks.length;
      const productivity = total > 0 ? (completed / total) * 100 : 0;

      const deptWorkLogs = await WorkLog.find({
        employee: { $in: deptEmployeeIds },
        isDeleted: false,
        workDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }).select('duration');

      const totalHours = deptWorkLogs.reduce((sum, w) => sum + (w.duration || 0), 0);
      const avgHours = deptEmployees.length > 0 ? totalHours / deptEmployees.length : 0;

      departmentProductivity.push({
        department: {
          id: department._id,
          name: department.name
        },
        productivity: Math.round(productivity),
        averageWorkingHours: Math.round(avgHours),
        employeeCount: deptEmployees.length,
        totalTasks: total,
        completedTasks: completed
      });
    }

    const topContributors = [...employeeProductivity]
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 10);

    const lowPerformers = [...employeeProductivity]
      .filter(e => e.totalTasks >= 5)
      .sort((a, b) => a.productivity - b.productivity)
      .slice(0, 10);

    const totalWorkingHours = await WorkLog.aggregate([
      {
        $match: {
          isDeleted: false,
          workDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$duration' }
        }
      }
    ]);

    const avgWorkingHours = employees.length > 0 
      ? (totalWorkingHours[0]?.totalHours || 0) / employees.length 
      : 0;

    const totalTasks = await Task.countDocuments({ isDeleted: false });
    const totalCompleted = await Task.countDocuments({ isDeleted: false, status: TASK_STATUS.COMPLETED });
    const avgTaskCompletion = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    return {
      employeeProductivity: employeeProductivity.sort((a, b) => b.productivity - a.productivity),
      departmentProductivity: departmentProductivity.sort((a, b) => b.productivity - a.productivity),
      averageWorkingHours: Math.round(avgWorkingHours),
      averageTaskCompletion: Math.round(avgTaskCompletion),
      topContributors,
      lowPerformers,
      departmentStatistics: departments.map(d => ({
        id: d._id,
        name: d.name,
        ...departmentProductivity.find(dp => dp.department.id.toString() === d._id.toString())
      }))
    };
  }

  async getCEODashboard() {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    const departments = await Department.find({ isDeleted: false }).select('_id name');
    const projects = await Project.find({ isDeleted: false }).select('_id name status progress');
    const employees = await Employee.find({ isDeleted: false }).select('_id firstName lastName department');

    const totalTasks = await Task.countDocuments({ isDeleted: false });
    const totalCompleted = await Task.countDocuments({ isDeleted: false, status: TASK_STATUS.COMPLETED });
    const organizationProductivity = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    const departmentComparison = [];
    for (const department of departments) {
      const deptEmployees = employees.filter(e => e.department?.toString() === department._id.toString());
      const deptEmployeeIds = deptEmployees.map(e => e._id);

      const deptTasks = await Task.find({
        assignedTo: { $in: deptEmployeeIds },
        isDeleted: false
      });

      const completed = deptTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      const productivity = deptTasks.length > 0 ? (completed / deptTasks.length) * 100 : 0;

      departmentComparison.push({
        department: {
          id: department._id,
          name: department.name
        },
        productivity: Math.round(productivity),
        totalTasks: deptTasks.length,
        completedTasks: completed,
        employeeCount: deptEmployees.length
      });
    }

    const projectComparison = [];
    for (const project of projects) {
      const projectTasks = await Task.find({ project: project._id, isDeleted: false });
      const completed = projectTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;

      projectComparison.push({
        project: {
          id: project._id,
          name: project.name
        },
        progress: Math.round(progress),
        status: project.status,
        totalTasks: projectTasks.length,
        completedTasks: completed
      });
    }

    const employeeRanking = [];
    for (const employee of employees) {
      const employeeTasks = await Task.find({
        assignedTo: employee._id,
        isDeleted: false
      });

      const completed = employeeTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      const productivity = employeeTasks.length > 0 ? (completed / employeeTasks.length) * 100 : 0;

      employeeRanking.push({
        employee: {
          id: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          department: employee.department
        },
        productivity: Math.round(productivity),
        totalTasks: employeeTasks.length,
        completedTasks: completed
      });
    }

    const topPerformers = [...employeeRanking]
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 10);

    const bottomEmployees = [...employeeRanking]
      .filter(e => e.totalTasks >= 5)
      .sort((a, b) => a.productivity - b.productivity)
      .slice(0, 10);

    const completedProjects = projects.filter(p => p.status === PROJECT_STATUS.COMPLETED).length;
    const projectSuccessRate = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0;

    const today = new Date();
    const overdueTasks = await Task.countDocuments({
      isDeleted: false,
      isArchived: false,
      status: { $ne: TASK_STATUS.COMPLETED },
      dueDate: { $lt: today }
    });

    const totalWorkLogs = await WorkLog.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, totalHours: { $sum: '$duration' } } }
    ]);

    const totalEstimatedHours = projects.reduce((sum, p) => sum + (p.estimatedHours || 0), 0);
    const resourceUtilization = totalEstimatedHours > 0 
      ? ((totalWorkLogs[0]?.totalHours || 0) / totalEstimatedHours) * 100 
      : 0;

    const organizationCapacity = employees.length * 8 * 22;

    const heatmapData = await this.generateHeatmapData();
    const chartData = await this.generateChartData();

    return {
      executiveSummary: {
        organizationProductivity: Math.round(organizationProductivity),
        taskCompletionRate: Math.round(organizationProductivity),
        projectSuccessRate: Math.round(projectSuccessRate),
        totalEmployees: employees.length,
        totalProjects: projects.length,
        totalTasks: totalTasks,
        overdueTasks: overdueTasks,
        resourceUtilization: Math.round(resourceUtilization),
        organizationCapacity: organizationCapacity
      },
      departmentComparison: departmentComparison.sort((a, b) => b.productivity - a.productivity),
      projectComparison: projectComparison.sort((a, b) => b.progress - a.progress),
      topPerformers,
      bottomEmployees,
      workloadDistribution: await this.getWorkloadDistribution(),
      overdueTrends: await this.getOverdueTrends(),
      heatmapData,
      chartData
    };
  }

  async getProjectMilestones(projectIds) {
    const Task = (await import('./task.model.js')).default;
    
    const milestones = await Task.aggregate([
      {
        $match: {
          project: { $in: projectIds },
          isDeleted: false,
          priority: TASK_PRIORITY.CRITICAL
        }
      },
      {
        $group: {
          _id: '$project',
          milestones: {
            $push: {
              title: '$title',
              dueDate: '$dueDate',
              status: '$status'
            }
          }
        }
      }
    ]);

    return milestones;
  }

  async getWorkloadDistribution() {
    const Task = (await import('./task.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const employees = await Employee.find({ isDeleted: false }).select('_id firstName lastName');

    const workload = await Task.aggregate([
      {
        $match: { isDeleted: false, status: { $ne: TASK_STATUS.COMPLETED } }
      },
      {
        $group: {
          _id: '$assignedTo',
          taskCount: { $sum: 1 }
        }
      }
    ]);

    return workload.map(w => ({
      employeeId: w._id,
      taskCount: w.taskCount,
      employeeName: employees.find(e => e._id.toString() === w._id.toString())?.name
    }));
  }

  async getOverdueTrends() {
    const Task = (await import('./task.model.js')).default;

    const today = new Date();
    const trends = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const overdueCount = await Task.countDocuments({
        isDeleted: false,
        isArchived: false,
        status: { $ne: TASK_STATUS.COMPLETED },
        dueDate: { $lt: date }
      });

      trends.push({
        date: date.toISOString().split('T')[0],
        overdueCount
      });
    }

    return trends;
  }

  async generateHeatmapData() {
    const Task = (await import('./task.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    const departments = await Department.find({ isDeleted: false }).select('_id name');
    const heatmap = [];

    for (const department of departments) {
      const deptTasks = await Task.find({
        isDeleted: false
      }).populate('assignedTo');

      const deptEmployeeIds = (await Employee.find({ department: department._id, isDeleted: false }))
        .map(e => e._id);

      const completed = deptTasks.filter(t => 
        deptEmployeeIds.includes(t.assignedTo) && t.status === TASK_STATUS.COMPLETED
      ).length;
      const total = deptTasks.filter(t => deptEmployeeIds.includes(t.assignedTo)).length;

      heatmap.push({
        department: department.name,
        productivity: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    }

    return heatmap;
  }

  async generateChartData() {
    const Task = (await import('./task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;

    const statusDistribution = await Task.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityDistribution = await Task.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const weeklyHours = await WorkLog.aggregate([
      {
        $match: {
          isDeleted: false,
          workDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$workDate' } },
          totalHours: { $sum: '$duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      statusDistribution: statusDistribution.map(s => ({ status: s._id, count: s.count })),
      priorityDistribution: priorityDistribution.map(p => ({ priority: p._id, count: p.count })),
      weeklyHours: weeklyHours.map(w => ({ date: w._id, hours: w.totalHours }))
    };
  }
}

export default new DashboardService();
