import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import AsyncHandler from '../../core/middlewares/asyncHandler.js';
import meetingDashboardService from './meeting.dashboard.service.js';
import { MEETING_PERMISSIONS } from './meeting.permissions.js';

class MeetingDashboardController {
  // Employee Dashboard
  getEmployeeDashboard = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const dashboard = await meetingDashboardService.getEmployeeDashboard(employeeId);
    return ApiResponse.success(res, dashboard, 'Employee dashboard retrieved successfully');
  });

  // Manager Dashboard
  getManagerDashboard = AsyncHandler(async (req, res, next) => {
    const { managerId, departmentId } = req.params;
    const dashboard = await meetingDashboardService.getManagerDashboard(managerId, departmentId);
    return ApiResponse.success(res, dashboard, 'Manager dashboard retrieved successfully');
  });

  // HR Dashboard
  getHRDashboard = AsyncHandler(async (req, res, next) => {
    const dashboard = await meetingDashboardService.getHRDashboard();
    return ApiResponse.success(res, dashboard, 'HR dashboard retrieved successfully');
  });

  // CEO Dashboard
  getCEODashboard = AsyncHandler(async (req, res, next) => {
    const dashboard = await meetingDashboardService.getCEODashboard();
    return ApiResponse.success(res, dashboard, 'CEO dashboard retrieved successfully');
  });

  // Today's Meetings (Employee)
  getTodayMeetings = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const meetings = await meetingDashboardService.getTodayMeetings(employeeId, new Date());
    return ApiResponse.success(res, meetings, 'Today\'s meetings retrieved successfully');
  });

  // Upcoming Meetings (Employee)
  getUpcomingMeetings = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const { days } = req.query;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (parseInt(days) || 7));
    const meetings = await meetingDashboardService.getUpcomingMeetings(employeeId, startDate, endDate);
    return ApiResponse.success(res, meetings, 'Upcoming meetings retrieved successfully');
  });

  // Meeting History (Employee)
  getMeetingHistory = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const { months } = req.query;
    const history = await meetingDashboardService.getMeetingHistory(employeeId, parseInt(months) || 6);
    return ApiResponse.success(res, history, 'Meeting history retrieved successfully');
  });

  // Attendance Stats (Employee)
  getAttendanceStats = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    const stats = await meetingDashboardService.getAttendanceStats(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, stats, 'Attendance stats retrieved successfully');
  });

  // Action Item Stats (Employee)
  getActionItemStats = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const stats = await meetingDashboardService.getActionItemStats(employeeId);
    return ApiResponse.success(res, stats, 'Action item stats retrieved successfully');
  });

  // Team Meetings (Manager)
  getTeamMeetings = AsyncHandler(async (req, res, next) => {
    const { managerId } = req.params;
    const { startDate, endDate } = req.query;
    const meetings = await meetingDashboardService.getTeamMeetings(
      managerId,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, meetings, 'Team meetings retrieved successfully');
  });

  // Team Attendance Summary (Manager)
  getTeamAttendanceSummary = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const { startDate, endDate } = req.query;
    const summary = await meetingDashboardService.getTeamAttendanceSummary(
      departmentId,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, summary, 'Team attendance summary retrieved successfully');
  });

  // Team Action Items (Manager)
  getTeamActionItems = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const stats = await meetingDashboardService.getTeamActionItems(departmentId);
    return ApiResponse.success(res, stats, 'Team action items retrieved successfully');
  });

  // Department Meetings (Manager)
  getDepartmentMeetings = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const { startDate, endDate } = req.query;
    const meetings = await meetingDashboardService.getDepartmentMeetings(
      departmentId,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, meetings, 'Department meetings retrieved successfully');
  });

  // Department Participation (Manager)
  getDepartmentParticipation = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const { startDate, endDate } = req.query;
    const participation = await meetingDashboardService.getDepartmentParticipation(
      departmentId,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, participation, 'Department participation retrieved successfully');
  });

  // Meeting Productivity (Manager)
  getMeetingProductivity = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const { startDate, endDate } = req.query;
    const productivity = await meetingDashboardService.getMeetingProductivity(
      departmentId,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, productivity, 'Meeting productivity retrieved successfully');
  });

  // Late Participants (Manager)
  getLateParticipants = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const { startDate, endDate } = req.query;
    const lateParticipants = await meetingDashboardService.getLateParticipants(
      departmentId,
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, lateParticipants, 'Late participants retrieved successfully');
  });

  // Organization Meetings (HR)
  getOrganizationMeetings = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const meetings = await meetingDashboardService.getOrganizationMeetings(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, meetings, 'Organization meetings retrieved successfully');
  });

  // Department Comparison (HR)
  getDepartmentComparison = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const comparison = await meetingDashboardService.getDepartmentComparison(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, comparison, 'Department comparison retrieved successfully');
  });

  // Organization Attendance Stats (HR)
  getOrganizationAttendanceStats = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const stats = await meetingDashboardService.getOrganizationAttendanceStats(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, stats, 'Organization attendance stats retrieved successfully');
  });

  // Participation Trends (HR)
  getParticipationTrends = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const trends = await meetingDashboardService.getParticipationTrends(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, trends, 'Participation trends retrieved successfully');
  });

  // Organization Productivity (HR)
  getOrganizationProductivity = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const productivity = await meetingDashboardService.getOrganizationProductivity(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, productivity, 'Organization productivity retrieved successfully');
  });

  // Organization Action Item Stats (HR)
  getOrganizationActionItemStats = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const stats = await meetingDashboardService.getOrganizationActionItemStats(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, stats, 'Organization action item stats retrieved successfully');
  });

  // Meeting Distribution (HR)
  getMeetingDistribution = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const distribution = await meetingDashboardService.getMeetingDistribution(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, distribution, 'Meeting distribution retrieved successfully');
  });

  // Meeting Heatmap (HR)
  getMeetingHeatmap = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const heatmap = await meetingDashboardService.getMeetingHeatmap(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, heatmap, 'Meeting heatmap retrieved successfully');
  });

  // Organization Meeting Health (CEO)
  getOrganizationMeetingHealth = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const health = await meetingDashboardService.getOrganizationMeetingHealth(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, health, 'Organization meeting health retrieved successfully');
  });

  // Department Rankings (CEO)
  getDepartmentRankings = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const rankings = await meetingDashboardService.getDepartmentRankings(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, rankings, 'Department rankings retrieved successfully');
  });

  // Executive Productivity (CEO)
  getExecutiveProductivity = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const productivity = await meetingDashboardService.getExecutiveProductivity(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, productivity, 'Executive productivity retrieved successfully');
  });

  // Executive Summary (CEO)
  getExecutiveSummary = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const summary = await meetingDashboardService.getExecutiveSummary(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, summary, 'Executive summary retrieved successfully');
  });

  // Top Contributors (CEO)
  getTopContributors = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const { limit } = req.query;
    const contributors = await meetingDashboardService.getTopContributors(
      new Date(startDate),
      new Date(endDate),
      parseInt(limit) || 10
    );
    return ApiResponse.success(res, contributors, 'Top contributors retrieved successfully');
  });

  // Inactive Departments (CEO)
  getInactiveDepartments = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const inactive = await meetingDashboardService.getInactiveDepartments(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, inactive, 'Inactive departments retrieved successfully');
  });

  // Meeting Trends (CEO)
  getMeetingTrends = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const trends = await meetingDashboardService.getMeetingTrends(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, trends, 'Meeting trends retrieved successfully');
  });

  // Meeting Analytics (CEO)
  getMeetingAnalytics = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const analytics = await meetingDashboardService.getMeetingAnalytics(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, analytics, 'Meeting analytics retrieved successfully');
  });

  // Organization Heatmap (CEO)
  getOrganizationHeatmap = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const heatmap = await meetingDashboardService.getOrganizationHeatmap(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, heatmap, 'Organization heatmap retrieved successfully');
  });

  // Chart Data (CEO)
  getChartData = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const chartData = await meetingDashboardService.getChartData(
      new Date(startDate),
      new Date(endDate)
    );
    return ApiResponse.success(res, chartData, 'Chart data retrieved successfully');
  });
}

const meetingDashboardController = new MeetingDashboardController();
export default meetingDashboardController;
