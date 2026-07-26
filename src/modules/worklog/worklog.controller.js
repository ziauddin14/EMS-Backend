import worklogService from './worklog.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class WorkLogController {
  async create(req, res, next) {
    try {
      const worklog = await worklogService.createWorkLog(req.body, req.user.userId);
      return ApiResponse.created(res, 'Work log created successfully', { worklog });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const worklog = await worklogService.getWorkLogById(id);
      return ApiResponse.success(res, 'Work log retrieved successfully', { worklog });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const options = {
        filter: req.query,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { workDate: -1 },
        limit: parseInt(req.query.limit) || 100,
        skip: parseInt(req.query.skip) || 0
      };
      const worklogs = await worklogService.getAllWorkLogs(options);
      return ApiResponse.success(res, 'Work logs retrieved successfully', { worklogs });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const worklog = await worklogService.updateWorkLog(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Work log updated successfully', { worklog });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await worklogService.deleteWorkLog(id, req.user.userId);
      return ApiResponse.success(res, 'Work log deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const worklog = await worklogService.restoreWorkLog(id);
      return ApiResponse.success(res, 'Work log restored successfully', { worklog });
    } catch (error) {
      next(error);
    }
  }

  async getByEmployee(req, res, next) {
    try {
      const { employeeId } = req.params;
      const worklogs = await worklogService.getWorkLogsByEmployee(employeeId);
      return ApiResponse.success(res, 'Employee work logs retrieved successfully', { worklogs });
    } catch (error) {
      next(error);
    }
  }

  async getByTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const worklogs = await worklogService.getWorkLogsByTask(taskId);
      return ApiResponse.success(res, 'Task work logs retrieved successfully', { worklogs });
    } catch (error) {
      next(error);
    }
  }

  async getByProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const worklogs = await worklogService.getWorkLogsByProject(projectId);
      return ApiResponse.success(res, 'Project work logs retrieved successfully', { worklogs });
    } catch (error) {
      next(error);
    }
  }

  async getByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const worklogs = await worklogService.getWorkLogsByDateRange(startDate, endDate);
      return ApiResponse.success(res, 'Work logs by date range retrieved successfully', { worklogs });
    } catch (error) {
      next(error);
    }
  }

  async getByEmployeeAndDateRange(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;
      const worklogs = await worklogService.getWorkLogsByEmployeeAndDateRange(employeeId, startDate, endDate);
      return ApiResponse.success(res, 'Employee work logs by date range retrieved successfully', { worklogs });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const worklogs = await worklogService.getWorkLogsByStatus(status);
      return ApiResponse.success(res, 'Work logs by status retrieved successfully', { worklogs });
    } catch (error) {
      next(error);
    }
  }

  async getByBillable(req, res, next) {
    try {
      const { billable } = req.params;
      const worklogs = await worklogService.getWorkLogsByBillable(billable === 'true');
      return ApiResponse.success(res, 'Work logs by billable retrieved successfully', { worklogs });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await worklogService.getWorkLogStatistics(req.query);
      return ApiResponse.success(res, 'Work log statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeStatistics(req, res, next) {
    try {
      const { employeeId } = req.params;
      const statistics = await worklogService.getEmployeeStatistics(employeeId);
      return ApiResponse.success(res, 'Employee work log statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async getTaskStatistics(req, res, next) {
    try {
      const { taskId } = req.params;
      const statistics = await worklogService.getTaskStatistics(taskId);
      return ApiResponse.success(res, 'Task work log statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async getProjectStatistics(req, res, next) {
    try {
      const { projectId } = req.params;
      const statistics = await worklogService.getProjectStatistics(projectId);
      return ApiResponse.success(res, 'Project work log statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async startWork(req, res, next) {
    try {
      const { employeeId, taskId, projectId } = req.body;
      const worklog = await worklogService.startWork(employeeId, taskId, projectId, req.user.userId);
      return ApiResponse.created(res, 'Work session started successfully', { worklog });
    } catch (error) {
      next(error);
    }
  }

  async stopWork(req, res, next) {
    try {
      const { id } = req.params;
      const worklog = await worklogService.stopWork(id, req.user.userId);
      return ApiResponse.success(res, 'Work session stopped successfully', { worklog });
    } catch (error) {
      next(error);
    }
  }

  async manualEntry(req, res, next) {
    try {
      const worklog = await worklogService.manualEntry(req.body, req.user.userId);
      return ApiResponse.created(res, 'Manual work log entry created successfully', { worklog });
    } catch (error) {
      next(error);
    }
  }

  async getDailySummary(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { date } = req.query;
      const summary = await worklogService.getDailySummary(employeeId, date);
      return ApiResponse.success(res, 'Daily summary retrieved successfully', { summary });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklySummary(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { startDate } = req.query;
      const summary = await worklogService.getWeeklySummary(employeeId, startDate);
      return ApiResponse.success(res, 'Weekly summary retrieved successfully', { summary });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlySummary(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year, month } = req.query;
      const summary = await worklogService.getMonthlySummary(employeeId, parseInt(year), parseInt(month));
      return ApiResponse.success(res, 'Monthly summary retrieved successfully', { summary });
    } catch (error) {
      next(error);
    }
  }
}

export default new WorkLogController();
