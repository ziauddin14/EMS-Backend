import attendanceDashboardService from './attendance.dashboard.service.js';
import attendanceReportsService from './attendance.reports.service.js';
import attendanceAnalyticsService from './attendance.analytics.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class AttendanceDashboardController {
  async getEmployeeDashboard(req, res, next) {
    try {
      const { employeeId } = req.params;
      const dashboard = await attendanceDashboardService.getEmployeeDashboard(employeeId);
      return ApiResponse.success(res, 'Employee dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req, res, next) {
    try {
      const { managerId } = req.params;
      const dashboard = await attendanceDashboardService.getManagerDashboard(managerId, req.query);
      return ApiResponse.success(res, 'Manager dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getHRDashboard(req, res, next) {
    try {
      const dashboard = await attendanceDashboardService.getHRDashboard(req.query);
      return ApiResponse.success(res, 'HR dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getCEODashboard(req, res, next) {
    try {
      const dashboard = await attendanceDashboardService.getCEODashboard(req.query);
      return ApiResponse.success(res, 'CEO dashboard retrieved successfully', { dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getDailyReport(req, res, next) {
    try {
      const { date } = req.query;
      const report = await attendanceReportsService.generateDailyReport(date, req.query);
      return ApiResponse.success(res, 'Daily report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateWeeklyReport(startDate, endDate, req.query);
      return ApiResponse.success(res, 'Weekly report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyReport(req, res, next) {
    try {
      const { year, month } = req.query;
      const report = await attendanceReportsService.generateMonthlyReport(parseInt(year), parseInt(month), req.query);
      return ApiResponse.success(res, 'Monthly report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeReport(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateEmployeeReport(id, startDate, endDate);
      return ApiResponse.success(res, 'Employee report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentReport(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateDepartmentReport(id, startDate, endDate);
      return ApiResponse.success(res, 'Department report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getShiftReport(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateShiftReport(id, startDate, endDate);
      return ApiResponse.success(res, 'Shift report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getLateReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateLateReport(startDate, endDate, req.query);
      return ApiResponse.success(res, 'Late report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getOvertimeReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateOvertimeReport(startDate, endDate, req.query);
      return ApiResponse.success(res, 'Overtime report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getHolidayReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateHolidayReport(startDate, endDate);
      return ApiResponse.success(res, 'Holiday report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getWeekendReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateWeekendReport(startDate, endDate);
      return ApiResponse.success(res, 'Weekend report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getAdjustmentReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateAttendanceAdjustmentReport(startDate, endDate);
      return ApiResponse.success(res, 'Adjustment report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getSummaryReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await attendanceReportsService.generateSummaryReport(startDate, endDate, req.query);
      return ApiResponse.success(res, 'Summary report generated successfully', { report });
    } catch (error) {
      next(error);
    }
  }

  async getOverviewAnalytics(req, res, next) {
    try {
      const analytics = await attendanceAnalyticsService.getOverviewAnalytics(req.query);
      return ApiResponse.success(res, 'Overview analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getTrendsAnalytics(req, res, next) {
    try {
      const { days = 90 } = req.query;
      const analytics = await attendanceAnalyticsService.getTrendAnalytics(parseInt(days), req.query);
      return ApiResponse.success(res, 'Trends analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboardAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await attendanceAnalyticsService.getLeaderboardAnalytics(startDate, endDate, req.query);
      return ApiResponse.success(res, 'Leaderboard analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getHeatmapAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await attendanceAnalyticsService.getHeatmapAnalytics(startDate, endDate, req.query);
      return ApiResponse.success(res, 'Heatmap analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getOvertimeAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await attendanceAnalyticsService.getOvertimeAnalytics(startDate, endDate, req.query);
      return ApiResponse.success(res, 'Overtime analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getLateAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await attendanceAnalyticsService.getLateAnalytics(startDate, endDate, req.query);
      return ApiResponse.success(res, 'Late analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await attendanceAnalyticsService.getDepartmentAnalytics(startDate, endDate);
      return ApiResponse.success(res, 'Department analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const analytics = await attendanceAnalyticsService.getEmployeeAnalytics(id, startDate, endDate);
      return ApiResponse.success(res, 'Employee analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getShiftAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      const analytics = await attendanceAnalyticsService.getShiftAnalytics(id, startDate, endDate);
      return ApiResponse.success(res, 'Shift analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyTrendAnalytics(req, res, next) {
    try {
      const { months = 12 } = req.query;
      const analytics = await attendanceAnalyticsService.getMonthlyTrendAnalytics(parseInt(months));
      return ApiResponse.success(res, 'Monthly trend analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyTrendAnalytics(req, res, next) {
    try {
      const { weeks = 12 } = req.query;
      const analytics = await attendanceAnalyticsService.getWeeklyTrendAnalytics(parseInt(weeks));
      return ApiResponse.success(res, 'Weekly trend analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }

  async getYearlyTrendAnalytics(req, res, next) {
    try {
      const { years = 5 } = req.query;
      const analytics = await attendanceAnalyticsService.getYearlyTrendAnalytics(parseInt(years));
      return ApiResponse.success(res, 'Yearly trend analytics retrieved successfully', { analytics });
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceDashboardController();
