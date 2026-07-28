import express from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { checkPermission } from '../auth/permission.middleware.js';
import { MEETING_PERMISSIONS } from './meeting.permissions.js';
import meetingController from './meeting.controller.js';
import agendaController from './agenda.controller.js';
import minutesController from './minutes.controller.js';
import attendanceController from './attendance.controller.js';
import actionItemController from './actionItem.controller.js';
import meetingDashboardController from './meeting.dashboard.controller.js';
import meetingAnalyticsController from './meeting.analytics.controller.js';

const router = express.Router();

// Meeting Routes
router.post('/meetings', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_CREATE), meetingController.createMeeting);
router.get('/meetings/:id', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW), meetingController.getMeetingById);
router.put('/meetings/:id', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_UPDATE), meetingController.updateMeeting);
router.delete('/meetings/:id', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_DELETE), meetingController.deleteMeeting);
router.patch('/meetings/:id/cancel', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_CANCEL), meetingController.cancelMeeting);
router.patch('/meetings/:id/reschedule', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_RESCHEDULE), meetingController.rescheduleMeeting);
router.post('/meetings/:id/duplicate', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_DUPLICATE), meetingController.duplicateMeeting);
router.patch('/meetings/:id/start', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_MANAGE), meetingController.startMeeting);
router.patch('/meetings/:id/complete', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_MANAGE), meetingController.completeMeeting);
router.post('/meetings/:id/participants', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_MANAGE), meetingController.addParticipant);
router.delete('/meetings/:id/participants', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_MANAGE), meetingController.removeParticipant);
router.get('/meetings/organizer/:organizerId', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW_ALL), meetingController.getMeetingsByOrganizer);
router.get('/meetings/participant/:participantId', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW_ALL), meetingController.getMeetingsByParticipant);
router.get('/meetings/department/:departmentId', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW_ALL), meetingController.getMeetingsByDepartment);
router.get('/meetings/project/:projectId', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW_ALL), meetingController.getMeetingsByProject);
router.get('/meetings/date-range', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW_ALL), meetingController.getMeetingsByDateRange);
router.get('/meetings/upcoming', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW), meetingController.getUpcomingMeetings);
router.get('/meetings/past', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW), meetingController.getPastMeetings);
router.get('/meetings/history/:employeeId', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW), meetingController.getMeetingHistory);

// Agenda Routes
router.post('/agendas', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_CREATE), agendaController.createAgenda);
router.get('/agendas/:id', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_VIEW), agendaController.getAgendaById);
router.put('/agendas/:id', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_UPDATE), agendaController.updateAgenda);
router.delete('/agendas/:id', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_DELETE), agendaController.deleteAgenda);
router.patch('/agendas/:id/approve', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_APPROVE), agendaController.approveAgenda);
router.patch('/agendas/:id/start', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_MANAGE), agendaController.startAgenda);
router.patch('/agendas/:id/complete', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_MANAGE), agendaController.completeAgenda);
router.patch('/agendas/:id/cancel', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_MANAGE), agendaController.cancelAgenda);
router.get('/agendas/meeting/:meetingId', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_VIEW_ALL), agendaController.getAgendasByMeeting);
router.get('/agendas/presenter/:presenterId', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_VIEW_ALL), agendaController.getAgendasByPresenter);
router.get('/agendas/status/:status', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_VIEW_ALL), agendaController.getAgendasByStatus);
router.put('/agendas/meeting/:meetingId/reorder', authenticate, checkPermission(MEETING_PERMISSIONS.AGENDA_MANAGE), agendaController.reorderAgendas);

// Minutes Routes
router.post('/minutes', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_CREATE), minutesController.createMinutes);
router.get('/minutes/:id', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_VIEW), minutesController.getMinutesById);
router.put('/minutes/:id', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_UPDATE), minutesController.updateMinutes);
router.delete('/minutes/:id', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_DELETE), minutesController.deleteMinutes);
router.patch('/minutes/:id/submit-review', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_MANAGE), minutesController.submitForReview);
router.patch('/minutes/:id/approve', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_APPROVE), minutesController.approveMinutes);
router.patch('/minutes/:id/reject', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_REJECT), minutesController.rejectMinutes);
router.patch('/minutes/:id/finalize', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_FINALIZE), minutesController.finalizeMinutes);
router.post('/minutes/:id/action-items', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_MANAGE), minutesController.addActionItem);
router.delete('/minutes/:id/action-items', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_MANAGE), minutesController.removeActionItem);
router.get('/minutes/meeting/:meetingId', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_VIEW_ALL), minutesController.getMinutesByMeeting);
router.get('/minutes/prepared-by/:preparedById', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_VIEW_ALL), minutesController.getMinutesByPreparedBy);
router.get('/minutes/status/:status', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_VIEW_ALL), minutesController.getMinutesByApprovalStatus);
router.get('/minutes/pending-follow-up', authenticate, checkPermission(MEETING_PERMISSIONS.MINUTES_VIEW_ALL), minutesController.getPendingFollowUp);

// Attendance Routes
router.post('/attendance', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_MARK), attendanceController.createAttendance);
router.get('/attendance/:id', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW), attendanceController.getAttendanceById);
router.put('/attendance/:id', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_UPDATE), attendanceController.updateAttendance);
router.delete('/attendance/:id', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_MANAGE), attendanceController.deleteAttendance);
router.post('/attendance/check-in', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_CHECK_IN), attendanceController.checkIn);
router.post('/attendance/check-out', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_CHECK_OUT), attendanceController.checkOut);
router.post('/attendance/mark-absent', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_MANAGE), attendanceController.markAbsent);
router.post('/attendance/mark-excused', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_MANAGE), attendanceController.markExcused);
router.post('/attendance/mark-no-show', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_MANAGE), attendanceController.markNoShow);
router.patch('/attendance/:id/participation-score', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_MANAGE), attendanceController.updateParticipationScore);
router.post('/attendance/bulk-check-in', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_MANAGE), attendanceController.bulkCheckIn);
router.post('/attendance/bulk-check-out', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_MANAGE), attendanceController.bulkCheckOut);
router.get('/attendance/meeting/:meetingId', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW_ALL), attendanceController.getAttendanceByMeeting);
router.get('/attendance/employee/:employeeId', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW_ALL), attendanceController.getAttendanceByEmployee);
router.get('/attendance/status/:status', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW_ALL), attendanceController.getAttendanceByStatus);
router.get('/attendance/date-range', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW_ALL), attendanceController.getAttendanceByDateRange);
router.get('/attendance/meeting/:meetingId/stats', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW_ALL), attendanceController.getMeetingAttendanceStats);
router.get('/attendance/employee/:employeeId/stats', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW_ALL), attendanceController.getEmployeeAttendanceStats);

// Action Item Routes
router.post('/action-items', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_CREATE), actionItemController.createActionItem);
router.get('/action-items/:id', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW), actionItemController.getActionItemById);
router.put('/action-items/:id', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_UPDATE), actionItemController.updateActionItem);
router.delete('/action-items/:id', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_DELETE), actionItemController.deleteActionItem);
router.patch('/action-items/:id/start', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_MANAGE), actionItemController.startActionItem);
router.patch('/action-items/:id/progress', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_UPDATE), actionItemController.updateProgress);
router.patch('/action-items/:id/complete', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_COMPLETE), actionItemController.completeActionItem);
router.patch('/action-items/:id/close', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_CLOSE), actionItemController.closeActionItem);
router.patch('/action-items/:id/hold', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_MANAGE), actionItemController.putOnHold);
router.patch('/action-items/:id/cancel', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_MANAGE), actionItemController.cancelActionItem);
router.patch('/action-items/:id/overdue', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_MANAGE), actionItemController.markOverdue);
router.post('/action-items/:id/evidence', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_UPDATE), actionItemController.addEvidence);
router.delete('/action-items/:id/evidence', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_UPDATE), actionItemController.removeEvidence);
router.patch('/action-items/:id/follow-up', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_MANAGE), actionItemController.setFollowUp);
router.get('/action-items/assigned-employee/:employeeId', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), actionItemController.getActionItemsByAssignedEmployee);
router.get('/action-items/assigned-department/:departmentId', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), actionItemController.getActionItemsByAssignedDepartment);
router.get('/action-items/meeting/:meetingId', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), actionItemController.getActionItemsByMeeting);
router.get('/action-items/minutes/:minutesId', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), actionItemController.getActionItemsByMinutes);
router.get('/action-items/status/:status', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), actionItemController.getActionItemsByStatus);
router.get('/action-items/priority/:priority', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), actionItemController.getActionItemsByPriority);
router.get('/action-items/overdue', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), actionItemController.getOverdueActionItems);
router.get('/action-items/due-soon', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), actionItemController.getActionItemsDueSoon);
router.get('/action-items/date-range', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), actionItemController.getActionItemsByDateRange);
router.get('/action-items/department/:departmentId/stats', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), actionItemController.getDepartmentActionItemStats);
router.get('/action-items/employee/:employeeId/stats', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), actionItemController.getEmployeeActionItemStats);
router.patch('/action-items/bulk-update-status', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_MANAGE), actionItemController.bulkUpdateStatus);

// Dashboard Routes
router.get('/dashboard/employee/:employeeId', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW), meetingDashboardController.getEmployeeDashboard);
router.get('/dashboard/manager/:managerId/:departmentId', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW_ALL), meetingDashboardController.getManagerDashboard);
router.get('/dashboard/hr', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getHRDashboard);
router.get('/dashboard/ceo', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getCEODashboard);
router.get('/dashboard/employee/:employeeId/today', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW), meetingDashboardController.getTodayMeetings);
router.get('/dashboard/employee/:employeeId/upcoming', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW), meetingDashboardController.getUpcomingMeetings);
router.get('/dashboard/employee/:employeeId/history', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW), meetingDashboardController.getMeetingHistory);
router.get('/dashboard/employee/:employeeId/attendance-stats', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW), meetingDashboardController.getAttendanceStats);
router.get('/dashboard/employee/:employeeId/action-item-stats', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW), meetingDashboardController.getActionItemStats);
router.get('/dashboard/manager/:managerId/team-meetings', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW_ALL), meetingDashboardController.getTeamMeetings);
router.get('/dashboard/manager/:departmentId/team-attendance', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW_ALL), meetingDashboardController.getTeamAttendanceSummary);
router.get('/dashboard/manager/:departmentId/team-action-items', authenticate, checkPermission(MEETING_PERMISSIONS.ACTION_ITEM_VIEW_ALL), meetingDashboardController.getTeamActionItems);
router.get('/dashboard/manager/:departmentId/department-meetings', authenticate, checkPermission(MEETING_PERMISSIONS.MEETING_VIEW_ALL), meetingDashboardController.getDepartmentMeetings);
router.get('/dashboard/manager/:departmentId/department-participation', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW_ALL), meetingDashboardController.getDepartmentParticipation);
router.get('/dashboard/manager/:departmentId/productivity', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getMeetingProductivity);
router.get('/dashboard/manager/:departmentId/late-participants', authenticate, checkPermission(MEETING_PERMISSIONS.ATTENDANCE_VIEW_ALL), meetingDashboardController.getLateParticipants);
router.get('/dashboard/hr/organization-meetings', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getOrganizationMeetings);
router.get('/dashboard/hr/department-comparison', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getDepartmentComparison);
router.get('/dashboard/hr/organization-attendance', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getOrganizationAttendanceStats);
router.get('/dashboard/hr/participation-trends', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getParticipationTrends);
router.get('/dashboard/hr/organization-productivity', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getOrganizationProductivity);
router.get('/dashboard/hr/organization-action-items', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getOrganizationActionItemStats);
router.get('/dashboard/hr/meeting-distribution', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getMeetingDistribution);
router.get('/dashboard/hr/meeting-heatmap', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getMeetingHeatmap);
router.get('/dashboard/ceo/health', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getOrganizationMeetingHealth);
router.get('/dashboard/ceo/department-rankings', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getDepartmentRankings);
router.get('/dashboard/ceo/productivity', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getExecutiveProductivity);
router.get('/dashboard/ceo/summary', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getExecutiveSummary);
router.get('/dashboard/ceo/contributors', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getTopContributors);
router.get('/dashboard/ceo/inactive-departments', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getInactiveDepartments);
router.get('/dashboard/ceo/trends', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getMeetingTrends);
router.get('/dashboard/ceo/analytics', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getMeetingAnalytics);
router.get('/dashboard/ceo/heatmap', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getOrganizationHeatmap);
router.get('/dashboard/ceo/chart-data', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingDashboardController.getChartData);

// Analytics Routes
router.get('/analytics/overview', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getOverviewAnalytics);
router.get('/analytics/trends', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getTrendsAnalytics);
router.get('/analytics/department/:departmentId', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getDepartmentAnalytics);
router.get('/analytics/departments', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getAllDepartmentsAnalytics);
router.get('/analytics/employee/:employeeId', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getEmployeeAnalytics);
router.get('/analytics/action-items', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getActionItemAnalytics);
router.get('/analytics/completion', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getCompletionAnalytics);
router.get('/analytics/heatmap', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getHeatmapDataset);
router.get('/analytics/leaderboard', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getLeaderboardDataset);
router.get('/analytics/chart/:chartType', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getChartData);
router.get('/analytics/charts/meeting-trends', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getMeetingTrendsChart);
router.get('/analytics/charts/attendance-trends', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getAttendanceTrendsChart);
router.get('/analytics/charts/participation-distribution', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getParticipationDistributionChart);
router.get('/analytics/charts/action-item-completion', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getActionItemCompletionChart);
router.get('/analytics/charts/department-comparison', authenticate, checkPermission(MEETING_PERMISSIONS.REPORTS_VIEW), meetingAnalyticsController.getDepartmentComparisonChart);

export default router;
