import reportsService from './reports.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class ReportsController {
  async getDailyReport(req, res, next) {
    try {
      const { date } = req.query;
      const filters = req.query;
      const report = await reportsService.generateDailyReport(date, filters);
      return ApiResponse.success(res, 'Daily report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyReport(req, res, next) {
    try {
      const { startDate } = req.query;
      const filters = req.query;
      const report = await reportsService.generateWeeklyReport(startDate, filters);
      return ApiResponse.success(res, 'Weekly report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyReport(req, res, next) {
    try {
      const { year, month } = req.query;
      const filters = req.query;
      const report = await reportsService.generateMonthlyReport(parseInt(year), parseInt(month), filters);
      return ApiResponse.success(res, 'Monthly report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeReport(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;
      const report = await reportsService.generateEmployeeReport(employeeId, startDate, endDate);
      return ApiResponse.success(res, 'Employee report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentReport(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { startDate, endDate } = req.query;
      const report = await reportsService.generateDepartmentReport(departmentId, startDate, endDate);
      return ApiResponse.success(res, 'Department report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getProjectReport(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const report = await reportsService.generateProjectReport(id, startDate, endDate);
      return ApiResponse.success(res, 'Project report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getTaskReport(req, res, next) {
    try {
      const { id } = req.params;
      const report = await reportsService.generateTaskReport(id);
      return ApiResponse.success(res, 'Task report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getWorkLogReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const filters = req.query;
      const report = await reportsService.generateWorkLogReport(startDate, endDate, filters);
      return ApiResponse.success(res, 'Work log report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getOverdueReport(req, res, next) {
    try {
      const filters = req.query;
      const report = await reportsService.generateOverdueReport(filters);
      return ApiResponse.success(res, 'Overdue report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getBlockedTaskReport(req, res, next) {
    try {
      const filters = req.query;
      const report = await reportsService.generateBlockedTaskReport(filters);
      return ApiResponse.success(res, 'Blocked task report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getProductivityReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const filters = req.query;
      const report = await reportsService.generateProductivityReport(startDate, endDate, filters);
      return ApiResponse.success(res, 'Productivity report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getUtilizationReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const filters = req.query;
      const report = await reportsService.generateUtilizationReport(startDate, endDate, filters);
      return ApiResponse.success(res, 'Utilization report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getCompletionReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const filters = req.query;
      const report = await reportsService.generateCompletionReport(startDate, endDate, filters);
      return ApiResponse.success(res, 'Completion report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getExecutiveReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportsService.generateExecutiveReport(startDate, endDate);
      return ApiResponse.success(res, 'Executive report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportsController();
