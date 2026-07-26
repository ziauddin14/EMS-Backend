import worklogRepository from './worklog.repository.js';
import { ACTIVITY_TYPE } from '../task/task.constants.js';
import AppError from '../../core/errors/AppError.js';
import { validateWorkLogOverlap } from '../task/task.helpers.js';

class WorkLogService {
  async createWorkLog(worklogData, createdBy) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const Task = (await import('../task/task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;

    if (worklogData.employee) {
      const employeeExists = await Employee.exists({ _id: worklogData.employee, isDeleted: false });
      if (!employeeExists) {
        throw new AppError('Employee not found', 404);
      }
    }

    if (worklogData.task) {
      const taskExists = await Task.exists({ _id: worklogData.task, isDeleted: false });
      if (!taskExists) {
        throw new AppError('Task not found', 404);
      }
    }

    if (worklogData.project) {
      const projectExists = await Project.exists({ _id: worklogData.project, isDeleted: false });
      if (!projectExists) {
        throw new AppError('Project not found', 404);
      }
    }

    if (worklogData.startTime && worklogData.endTime) {
      if (new Date(worklogData.startTime) > new Date(worklogData.endTime)) {
        throw new AppError('Start time must be before end time', 400);
      }
    }

    if (worklogData.activityType && !Object.values(ACTIVITY_TYPE).includes(worklogData.activityType)) {
      throw new AppError('Invalid activity type', 400);
    }

    if (worklogData.status && !['pending', 'approved', 'rejected'].includes(worklogData.status)) {
      throw new AppError('Invalid status', 400);
    }

    worklogData.createdBy = createdBy;
    const worklog = await worklogRepository.create(worklogData);
    return await worklogRepository.findById(worklog._id);
  }

  async getWorkLogById(id) {
    const worklog = await worklogRepository.findById(id);
    if (!worklog) {
      throw new AppError('Work log not found', 404);
    }
    return worklog;
  }

  async getAllWorkLogs(options = {}) {
    return await worklogRepository.findAll(options);
  }

  async updateWorkLog(id, updateData, updatedBy) {
    const worklog = await worklogRepository.findById(id);
    if (!worklog) {
      throw new AppError('Work log not found', 404);
    }

    if (updateData.employee) {
      const Employee = (await import('../employee/employee.model.js')).default;
      const employeeExists = await Employee.exists({ _id: updateData.employee, isDeleted: false });
      if (!employeeExists) {
        throw new AppError('Employee not found', 404);
      }
    }

    if (updateData.task) {
      const Task = (await import('../task/task.model.js')).default;
      const taskExists = await Task.exists({ _id: updateData.task, isDeleted: false });
      if (!taskExists) {
        throw new AppError('Task not found', 404);
      }
    }

    if (updateData.project) {
      const Project = (await import('../project/project.model.js')).default;
      const projectExists = await Project.exists({ _id: updateData.project, isDeleted: false });
      if (!projectExists) {
        throw new AppError('Project not found', 404);
      }
    }

    if (updateData.startTime || updateData.endTime) {
      const startTime = updateData.startTime || worklog.startTime;
      const endTime = updateData.endTime || worklog.endTime;
      if (new Date(startTime) > new Date(endTime)) {
        throw new AppError('Start time must be before end time', 400);
      }
    }

    if (updateData.activityType && !Object.values(ACTIVITY_TYPE).includes(updateData.activityType)) {
      throw new AppError('Invalid activity type', 400);
    }

    if (updateData.status && !['pending', 'approved', 'rejected'].includes(updateData.status)) {
      throw new AppError('Invalid status', 400);
    }

    updateData.updatedBy = updatedBy;
    return await worklogRepository.updateById(id, updateData);
  }

  async deleteWorkLog(id, deletedBy) {
    const worklog = await worklogRepository.findById(id);
    if (!worklog) {
      throw new AppError('Work log not found', 404);
    }
    return await worklogRepository.softDelete(id, deletedBy);
  }

  async restoreWorkLog(id) {
    const worklog = await worklogRepository.findById(id);
    if (!worklog) {
      throw new AppError('Work log not found', 404);
    }
    return await worklogRepository.restore(id);
  }

  async getWorkLogsByEmployee(employeeId) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found', 404);
    }
    return await worklogRepository.findByEmployee(employeeId);
  }

  async getWorkLogsByTask(taskId) {
    const Task = (await import('../task/task.model.js')).default;
    const taskExists = await Task.exists({ _id: taskId, isDeleted: false });
    if (!taskExists) {
      throw new AppError('Task not found', 404);
    }
    return await worklogRepository.findByTask(taskId);
  }

  async getWorkLogsByProject(projectId) {
    const Project = (await import('../project/project.model.js')).default;
    const projectExists = await Project.exists({ _id: projectId, isDeleted: false });
    if (!projectExists) {
      throw new AppError('Project not found', 404);
    }
    return await worklogRepository.findByProject(projectId);
  }

  async getWorkLogsByDateRange(startDate, endDate) {
    return await worklogRepository.findByDateRange(startDate, endDate);
  }

  async getWorkLogsByEmployeeAndDateRange(employeeId, startDate, endDate) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found', 404);
    }
    return await worklogRepository.findByEmployeeAndDateRange(employeeId, startDate, endDate);
  }

  async getWorkLogsByStatus(status) {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    return await worklogRepository.findByStatus(status);
  }

  async getWorkLogsByBillable(billable) {
    return await worklogRepository.findByBillable(billable);
  }

  async getWorkLogStatistics(filters = {}) {
    return await worklogRepository.statistics(filters);
  }

  async getEmployeeStatistics(employeeId) {
    return await worklogRepository.employeeStatistics(employeeId);
  }

  async getTaskStatistics(taskId) {
    return await worklogRepository.taskStatistics(taskId);
  }

  async getProjectStatistics(projectId) {
    return await worklogRepository.projectStatistics(projectId);
  }

  async startWork(employeeId, taskId, projectId, startedBy) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (taskId) {
      const Task = (await import('../task/task.model.js')).default;
      const task = await Task.findById(taskId);
      if (!task) {
        throw new AppError('Task not found', 404);
      }
    }

    if (projectId) {
      const Project = (await import('../project/project.model.js')).default;
      const project = await Project.findById(projectId);
      if (!project) {
        throw new AppError('Project not found', 404);
      }
    }

    const existingActiveWorkLog = await worklogRepository.findOne({
      employee: employeeId,
      endTime: null,
      isDeleted: false
    });

    if (existingActiveWorkLog) {
      throw new AppError('Employee already has an active work session', 400);
    }

    const worklog = await worklogRepository.create({
      employee: employeeId,
      task: taskId,
      project: projectId,
      workDate: new Date(),
      startTime: new Date(),
      endTime: null,
      duration: 0,
      activityType: ACTIVITY_TYPE.WORK,
      billable: true,
      status: 'pending',
      createdBy: startedBy
    });

    await this.logActivity(worklog._id, 'start_work', startedBy, {
      employee: employeeId,
      task: taskId,
      project: projectId
    });

    return await worklogRepository.findById(worklog._id);
  }

  async stopWork(worklogId, stoppedBy) {
    const worklog = await worklogRepository.findById(worklogId);
    if (!worklog) {
      throw new AppError('Work log not found', 404);
    }

    if (worklog.endTime) {
      throw new AppError('Work session already stopped', 400);
    }

    const endTime = new Date();
    const startTime = new Date(worklog.startTime);
    const durationMs = endTime - startTime;
    const durationMinutes = Math.max(0, durationMs / (1000 * 60));

    const updatedWorklog = await worklogRepository.updateById(worklogId, {
      endTime,
      duration: durationMinutes,
      updatedBy: stoppedBy
    });

    if (updatedWorklog.task) {
      const Task = (await import('../task/task.model.js')).default;
      await Task.findByIdAndUpdate(updatedWorklog.task, {
        $inc: { spentHours: durationMinutes / 60 }
      });
    }

    await this.logActivity(worklogId, 'stop_work', stoppedBy, {
      duration: durationMinutes
    });

    return updatedWorklog;
  }

  async manualEntry(worklogData, createdBy) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const Task = (await import('../task/task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;

    if (worklogData.employee) {
      const employeeExists = await Employee.exists({ _id: worklogData.employee, isDeleted: false });
      if (!employeeExists) {
        throw new AppError('Employee not found', 404);
      }
    }

    if (worklogData.task) {
      const taskExists = await Task.exists({ _id: worklogData.task, isDeleted: false });
      if (!taskExists) {
        throw new AppError('Task not found', 404);
      }
    }

    if (worklogData.project) {
      const projectExists = await Project.exists({ _id: worklogData.project, isDeleted: false });
      if (!projectExists) {
        throw new AppError('Project not found', 404);
      }
    }

    if (worklogData.startTime && worklogData.endTime) {
      if (new Date(worklogData.startTime) > new Date(worklogData.endTime)) {
        throw new AppError('Start time must be before end time', 400);
      }

      const overlapCheck = await validateWorkLogOverlap(
        worklogData.employee,
        worklogData.startTime,
        worklogData.endTime
      );

      if (overlapCheck.hasOverlap) {
        throw new AppError(overlapCheck.message, 400);
      }
    }

    const duration = worklogData.duration || 0;
    if (duration < 0) {
      throw new AppError('Duration cannot be negative', 400);
    }

    worklogData.createdBy = createdBy;
    const worklog = await worklogRepository.create(worklogData);

    if (worklog.task && worklog.duration > 0) {
      const Task = (await import('../task/task.model.js')).default;
      await Task.findByIdAndUpdate(worklog.task, {
        $inc: { spentHours: worklog.duration / 60 }
      });
    }

    await this.logActivity(worklog._id, 'create', createdBy, {
      description: 'Manual work log entry'
    });

    return await worklogRepository.findById(worklog._id);
  }

  async getDailySummary(employeeId, date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const worklogs = await worklogRepository.findByEmployeeAndDateRange(
      employeeId,
      startDate,
      endDate
    );

    const totalDuration = worklogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableDuration = worklogs
      .filter(w => w.billable)
      .reduce((sum, w) => sum + (w.duration || 0), 0);
    const nonBillableDuration = totalDuration - billableDuration;

    return {
      date,
      employeeId,
      totalDuration: Math.round(totalDuration),
      billableDuration: Math.round(billableDuration),
      nonBillableDuration: Math.round(nonBillableDuration),
      totalEntries: worklogs.length,
      worklogs
    };
  }

  async getWeeklySummary(employeeId, startDate) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const worklogs = await worklogRepository.findByEmployeeAndDateRange(
      employeeId,
      start,
      end
    );

    const dailySummaries = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      const daySummary = await this.getDailySummary(employeeId, day);
      dailySummaries.push(daySummary);
    }

    const totalDuration = worklogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableDuration = worklogs
      .filter(w => w.billable)
      .reduce((sum, w) => sum + (w.duration || 0), 0);

    return {
      startDate: start,
      endDate: end,
      employeeId,
      totalDuration: Math.round(totalDuration),
      billableDuration: Math.round(billableDuration),
      nonBillableDuration: Math.round(totalDuration - billableDuration),
      totalEntries: worklogs.length,
      dailySummaries
    };
  }

  async getMonthlySummary(employeeId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const worklogs = await worklogRepository.findByEmployeeAndDateRange(
      employeeId,
      startDate,
      endDate
    );

    const totalDuration = worklogs.reduce((sum, w) => sum + (w.duration || 0), 0);
    const billableDuration = worklogs
      .filter(w => w.billable)
      .reduce((sum, w) => sum + (w.duration || 0), 0);

    const taskBreakdown = {};
    worklogs.forEach(w => {
      if (w.task) {
        const taskId = w.task.toString();
        if (!taskBreakdown[taskId]) {
          taskBreakdown[taskId] = { taskId, duration: 0, billable: 0 };
        }
        taskBreakdown[taskId].duration += w.duration || 0;
        if (w.billable) {
          taskBreakdown[taskId].billable += w.duration || 0;
        }
      }
    });

    return {
      year,
      month,
      employeeId,
      totalDuration: Math.round(totalDuration),
      billableDuration: Math.round(billableDuration),
      nonBillableDuration: Math.round(totalDuration - billableDuration),
      totalEntries: worklogs.length,
      taskBreakdown: Object.values(taskBreakdown)
    };
  }

  async logActivity(worklogId, action, performedBy, metadata = {}) {
    const ActivityTimeline = (await import('../task/activityTimeline.model.js')).default;
    
    await ActivityTimeline.createActivity({
      entityType: 'worklog',
      entityId: worklogId,
      action,
      performedBy,
      ...metadata
    });
  }
}

export default new WorkLogService();
