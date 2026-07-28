import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import AsyncHandler from '../../core/middlewares/asyncHandler.js';
import meetingAnalyticsService from './meeting.analytics.service.js';
import { MEETING_PERMISSIONS } from './meeting.permissions.js';

class MeetingAnalyticsController {
  // Overview Analytics
  getOverviewAnalytics = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const analytics = await meetingAnalyticsService.getOverviewAnalytics(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, analytics, 'Overview analytics retrieved successfully');
  });

  // Trends Analytics
  getTrendsAnalytics = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const analytics = await meetingAnalyticsService.getTrendsAnalytics(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, analytics, 'Trends analytics retrieved successfully');
  });

  // Department Analytics
  getDepartmentAnalytics = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const { startDate, endDate } = req.query;
    const analytics = await meetingAnalyticsService.getDepartmentAnalytics(
      departmentId,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, analytics, 'Department analytics retrieved successfully');
  });

  // All Departments Analytics
  getAllDepartmentsAnalytics = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const analytics = await meetingAnalyticsService.getAllDepartmentsAnalytics(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, analytics, 'All departments analytics retrieved successfully');
  });

  // Employee Analytics
  getEmployeeAnalytics = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    const analytics = await meetingAnalyticsService.getEmployeeAnalytics(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, analytics, 'Employee analytics retrieved successfully');
  });

  // Action Item Analytics
  getActionItemAnalytics = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const analytics = await meetingAnalyticsService.getActionItemAnalytics(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, analytics, 'Action item analytics retrieved successfully');
  });

  // Completion Analytics
  getCompletionAnalytics = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const analytics = await meetingAnalyticsService.getCompletionAnalytics(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, analytics, 'Completion analytics retrieved successfully');
  });

  // Heatmap Dataset
  getHeatmapDataset = AsyncHandler(async (req, res, next) => {
    const { type } = req.query;
    const { startDate, endDate } = req.query;
    const heatmap = await meetingAnalyticsService.getHeatmapDataset(
      new Date(startDate),
      new Date(endDate),
      type || 'meetings'
    );
    return ApiResponse.success(res, heatmap, 'Heatmap dataset retrieved successfully');
  });

  // Leaderboard Dataset
  getLeaderboardDataset = AsyncHandler(async (req, res, next) => {
    const { type } = req.query;
    const { limit } = req.query;
    const leaderboard = await meetingAnalyticsService.getLeaderboardDataset(
      type || 'participation',
      parseInt(limit) || 10
    );
    return ApiResponse.success(res, leaderboard, 'Leaderboard dataset retrieved successfully');
  });

  // Chart Data
  getChartData = AsyncHandler(async (req, res, next) => {
    const { chartType } = req.params;
    const { startDate, endDate } = req.query;
    const chartData = await meetingAnalyticsService.getChartData(
      chartType,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, chartData, 'Chart data retrieved successfully');
  });

  // Meeting Trends Chart
  getMeetingTrendsChart = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const chartData = await meetingAnalyticsService.getChartData(
      'meeting-trends',
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, chartData, 'Meeting trends chart data retrieved successfully');
  });

  // Attendance Trends Chart
  getAttendanceTrendsChart = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const chartData = await meetingAnalyticsService.getChartData(
      'attendance-trends',
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, chartData, 'Attendance trends chart data retrieved successfully');
  });

  // Participation Distribution Chart
  getParticipationDistributionChart = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const chartData = await meetingAnalyticsService.getChartData(
      'participation-distribution',
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, chartData, 'Participation distribution chart data retrieved successfully');
  });

  // Action Item Completion Chart
  getActionItemCompletionChart = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const chartData = await meetingAnalyticsService.getChartData(
      'action-item-completion',
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, chartData, 'Action item completion chart data retrieved successfully');
  });

  // Department Comparison Chart
  getDepartmentComparisonChart = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const chartData = await meetingAnalyticsService.getChartData(
      'department-comparison',
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, chartData, 'Department comparison chart data retrieved successfully');
  });
}

const meetingAnalyticsController = new MeetingAnalyticsController();
export default meetingAnalyticsController;
