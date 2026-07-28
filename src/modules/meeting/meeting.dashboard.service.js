import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import meetingRepository from './meeting.repository.js';
import agendaRepository from './agenda.repository.js';
import minutesRepository from './minutes.repository.js';
import attendanceRepository from './attendance.repository.js';
import actionItemRepository from './actionItem.repository.js';
import { MEETING_STATUS, ATTENDANCE_STATUS, ACTION_ITEM_STATUS } from './meeting.constants.js';
import { dateUtils } from './meeting.utils.js';

class MeetingDashboardService {
  constructor() {
    this.logger = Logger;
  }

  // Employee Dashboard
  async getEmployeeDashboard(employeeId) {
    try {
      const today = dateUtils.startOfDay(new Date());
      const tomorrow = dateUtils.addDays(today, 1);
      const weekEnd = dateUtils.endOfWeek(today);
      const monthEnd = dateUtils.endOfMonth(today);

      const [todayMeetings, upcomingMeetings, attendance, actionItems] = await Promise.all([
        this.getTodayMeetings(employeeId, today),
        this.getUpcomingMeetings(employeeId, today, weekEnd),
        this.getAttendanceStats(employeeId, today, monthEnd),
        this.getActionItemStats(employeeId)
      ]);

      const meetingHistory = await this.getMeetingHistory(employeeId, 6);
      const timeline = await this.getMeetingTimeline(employeeId, 30);

      return {
        today: todayMeetings,
        upcoming: upcomingMeetings,
        attendance: attendance,
        actionItems: actionItems,
        history: meetingHistory,
        timeline: timeline
      };
    } catch (error) {
      this.logger.error('Error getting employee dashboard:', error);
      throw error;
    }
  }

  async getTodayMeetings(employeeId, today) {
    const meetings = await meetingRepository.findByParticipant(employeeId, {
      filter: {
        startTime: { $gte: today, $lt: dateUtils.addDays(today, 1) },
        status: { $in: [MEETING_STATUS.SCHEDULED, MEETING_STATUS.IN_PROGRESS] }
      },
      sort: { startTime: 1 },
      limit: 10
    });

    return meetings.map(m => ({
      id: m._id,
      code: m.meetingCode,
      title: m.title,
      type: m.type,
      startTime: m.startTime,
      endTime: m.endTime,
      duration: m.duration,
      location: m.meetingRoom || m.onlineMeetingUrl,
      organizer: m.organizer?.firstName + ' ' + m.organizer?.lastName
    }));
  }

  async getUpcomingMeetings(employeeId, today, weekEnd) {
    const meetings = await meetingRepository.findByParticipant(employeeId, {
      filter: {
        startTime: { $gte: today, $lte: weekEnd },
        status: MEETING_STATUS.SCHEDULED
      },
      sort: { startTime: 1 },
      limit: 20
    });

    return meetings.map(m => ({
      id: m._id,
      code: m.meetingCode,
      title: m.title,
      type: m.type,
      startTime: m.startTime,
      endTime: m.endTime,
      duration: m.duration,
      organizer: m.organizer?.firstName + ' ' + m.organizer?.lastName
    }));
  }

  async getAttendanceStats(employeeId, startDate, endDate) {
    const attendance = await attendanceRepository.findByEmployee(employeeId, {
      filter: { checkIn: { $gte: startDate, $lte: endDate } },
      limit: 1000
    });

    const total = attendance.length;
    const present = attendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
    const late = attendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
    const absent = attendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length;
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    const avgParticipation = attendance.length > 0 
      ? Math.round(attendance.reduce((sum, a) => sum + (a.participationScore || 0), 0) / attendance.length)
      : 0;

    return {
      total,
      present,
      late,
      absent,
      attendanceRate,
      avgParticipation
    };
  }

  async getActionItemStats(employeeId) {
    const actionItems = await actionItemRepository.findByAssignedEmployee(employeeId, {
      limit: 1000
    });

    const total = actionItems.length;
    const pending = actionItems.filter(a => a.status === ACTION_ITEM_STATUS.NOT_STARTED || a.status === ACTION_ITEM_STATUS.IN_PROGRESS).length;
    const completed = actionItems.filter(a => a.status === ACTION_ITEM_STATUS.COMPLETED).length;
    const overdue = actionItems.filter(a => new Date(a.dueDate) < new Date() && a.status !== ACTION_ITEM_STATUS.COMPLETED).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      pending,
      completed,
      overdue,
      completionRate
    };
  }

  async getMeetingHistory(employeeId, months) {
    const startDate = dateUtils.subtractMonths(dateUtils.startOfMonth(new Date()), months);
    const endDate = dateUtils.endOfMonth(new Date());

    const meetings = await meetingRepository.findByParticipant(employeeId, {
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      sort: { startTime: -1 },
      limit: 100
    });

    return meetings.map(m => ({
      id: m._id,
      code: m.meetingCode,
      title: m.title,
      type: m.type,
      date: m.startTime,
      status: m.status,
      duration: m.duration
    }));
  }

  async getMeetingTimeline(employeeId, days) {
    const startDate = dateUtils.subtractDays(dateUtils.startOfDay(new Date()), days);
    const endDate = dateUtils.endOfDay(new Date());

    const attendance = await attendanceRepository.findByEmployee(employeeId, {
      filter: { checkIn: { $gte: startDate, $lte: endDate } },
      sort: { checkIn: -1 },
      limit: 50
    });

    return attendance.map(a => ({
      date: a.checkIn,
      meeting: a.meeting?.title,
      meetingCode: a.meeting?.meetingCode,
      status: a.status,
      participationScore: a.participationScore
    }));
  }

  // Manager Dashboard
  async getManagerDashboard(managerId, departmentId) {
    try {
      const today = dateUtils.startOfDay(new Date());
      const weekEnd = dateUtils.endOfWeek(today);
      const monthEnd = dateUtils.endOfMonth(today);

      const [teamMeetings, attendanceSummary, actionItems, departmentMeetings, upcomingMeetings] = await Promise.all([
        this.getTeamMeetings(managerId, today, monthEnd),
        this.getTeamAttendanceSummary(departmentId, today, monthEnd),
        this.getTeamActionItems(departmentId),
        this.getDepartmentMeetings(departmentId, today, monthEnd),
        this.getUpcomingTeamMeetings(departmentId, today, weekEnd)
      ]);

      const departmentParticipation = await this.getDepartmentParticipation(departmentId, today, monthEnd);
      const productivity = await this.getMeetingProductivity(departmentId, today, monthEnd);
      const lateParticipants = await this.getLateParticipants(departmentId, today, monthEnd);

      return {
        teamMeetings,
        attendanceSummary,
        actionItems,
        departmentMeetings,
        departmentParticipation,
        productivity,
        lateParticipants,
        upcomingMeetings
      };
    } catch (error) {
      this.logger.error('Error getting manager dashboard:', error);
      throw error;
    }
  }

  async getTeamMeetings(managerId, startDate, endDate) {
    const meetings = await meetingRepository.findByOrganizer(managerId, {
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      sort: { startTime: -1 },
      limit: 50
    });

    return {
      total: meetings.length,
      completed: meetings.filter(m => m.status === MEETING_STATUS.COMPLETED).length,
      scheduled: meetings.filter(m => m.status === MEETING_STATUS.SCHEDULED).length,
      cancelled: meetings.filter(m => m.status === MEETING_STATUS.CANCELLED).length,
      recent: meetings.slice(0, 10).map(m => ({
        id: m._id,
        title: m.title,
        date: m.startTime,
        status: m.status,
        participants: m.totalParticipants
      }))
    };
  }

  async getTeamAttendanceSummary(departmentId, startDate, endDate) {
    const attendance = await attendanceRepository.findByDateRange(startDate, endDate, {
      limit: 5000
    });

    const deptAttendance = attendance.filter(a => a.employee?.department?.toString() === departmentId);
    const total = deptAttendance.length;
    const present = deptAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
    const late = deptAttendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
    const absent = deptAttendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length;

    return {
      total,
      present,
      late,
      absent,
      attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0
    };
  }

  async getTeamActionItems(departmentId) {
    const actionItems = await actionItemRepository.findByAssignedDepartment(departmentId, {
      limit: 1000
    });

    const total = actionItems.length;
    const pending = actionItems.filter(a => a.status === ACTION_ITEM_STATUS.NOT_STARTED || a.status === ACTION_ITEM_STATUS.IN_PROGRESS).length;
    const completed = actionItems.filter(a => a.status === ACTION_ITEM_STATUS.COMPLETED).length;
    const overdue = actionItems.filter(a => new Date(a.dueDate) < new Date() && a.status !== ACTION_ITEM_STATUS.COMPLETED).length;

    return {
      total,
      pending,
      completed,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  async getDepartmentMeetings(departmentId, startDate, endDate) {
    const meetings = await meetingRepository.findByDepartment(departmentId, {
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      sort: { startTime: -1 },
      limit: 50
    });

    return {
      total: meetings.length,
      byType: this.groupByType(meetings),
      byStatus: this.groupByStatus(meetings),
      recent: meetings.slice(0, 10).map(m => ({
        id: m._id,
        title: m.title,
        type: m.type,
        date: m.startTime,
        status: m.status
      }))
    };
  }

  async getUpcomingTeamMeetings(departmentId, startDate, endDate) {
    const meetings = await meetingRepository.findByDepartment(departmentId, {
      filter: {
        startTime: { $gte: startDate, $lte: endDate },
        status: MEETING_STATUS.SCHEDULED
      },
      sort: { startTime: 1 },
      limit: 20
    });

    return meetings.map(m => ({
      id: m._id,
      title: m.title,
      type: m.type,
      startTime: m.startTime,
      endTime: m.endTime,
      organizer: m.organizer?.firstName + ' ' + m.organizer?.lastName
    }));
  }

  async getDepartmentParticipation(departmentId, startDate, endDate) {
    const attendance = await attendanceRepository.findByDateRange(startDate, endDate, {
      limit: 5000
    });

    const deptAttendance = attendance.filter(a => a.employee?.department?.toString() === departmentId);
    const avgParticipation = deptAttendance.length > 0
      ? Math.round(deptAttendance.reduce((sum, a) => sum + (a.participationScore || 0), 0) / deptAttendance.length)
      : 0;

    return {
      averageParticipation: avgParticipation,
      highParticipation: deptAttendance.filter(a => (a.participationScore || 0) >= 80).length,
      lowParticipation: deptAttendance.filter(a => (a.participationScore || 0) < 50).length
    };
  }

  async getMeetingProductivity(departmentId, startDate, endDate) {
    const meetings = await meetingRepository.findByDepartment(departmentId, {
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 1000
    });

    const completedMeetings = meetings.filter(m => m.status === MEETING_STATUS.COMPLETED);
    const totalDuration = completedMeetings.reduce((sum, m) => sum + (m.duration || 0), 0);
    const avgDuration = completedMeetings.length > 0 ? Math.round(totalDuration / completedMeetings.length) : 0;

    const actionItems = await actionItemRepository.findByAssignedDepartment(departmentId, {
      filter: { createdAt: { $gte: startDate, $lte: endDate } },
      limit: 1000
    });

    const completedActionItems = actionItems.filter(a => a.status === ACTION_ITEM_STATUS.COMPLETED);

    return {
      totalMeetings: meetings.length,
      completedMeetings: completedMeetings.length,
      averageDuration: avgDuration,
      totalActionItems: actionItems.length,
      completedActionItems: completedActionItems.length,
      actionItemCompletionRate: actionItems.length > 0 ? Math.round((completedActionItems.length / actionItems.length) * 100) : 0
    };
  }

  async getLateParticipants(departmentId, startDate, endDate) {
    const attendance = await attendanceRepository.findByDateRange(startDate, endDate, {
      limit: 5000
    });

    const deptAttendance = attendance.filter(a => a.employee?.department?.toString() === departmentId);
    const lateAttendance = deptAttendance.filter(a => a.status === ATTENDANCE_STATUS.LATE || a.lateMinutes > 0);

    return {
      total: lateAttendance.length,
      byEmployee: this.groupLateByEmployee(lateAttendance)
    };
  }

  // HR Dashboard
  async getHRDashboard() {
    try {
      const today = dateUtils.startOfDay(new Date());
      const monthStart = dateUtils.startOfMonth(today);
      const monthEnd = dateUtils.endOfMonth(today);

      const [orgMeetings, deptComparison, attendanceStats, participationTrends, productivity, actionItemStats, distribution, heatmap] = await Promise.all([
        this.getOrganizationMeetings(monthStart, monthEnd),
        this.getDepartmentComparison(monthStart, monthEnd),
        this.getOrganizationAttendanceStats(monthStart, monthEnd),
        this.getParticipationTrends(monthStart, monthEnd),
        this.getOrganizationProductivity(monthStart, monthEnd),
        this.getOrganizationActionItemStats(monthStart, monthEnd),
        this.getMeetingDistribution(monthStart, monthEnd),
        this.getMeetingHeatmap(monthStart, monthEnd)
      ]);

      return {
        organization: orgMeetings,
        departments: deptComparison,
        attendance: attendanceStats,
        participation: participationTrends,
        productivity: productivity,
        actionItems: actionItemStats,
        distribution: distribution,
        heatmap: heatmap
      };
    } catch (error) {
      this.logger.error('Error getting HR dashboard:', error);
      throw error;
    }
  }

  async getOrganizationMeetings(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      sort: { startTime: -1 },
      limit: 1000
    });

    return {
      total: meetings.length,
      byType: this.groupByType(meetings),
      byStatus: this.groupByStatus(meetings),
      totalDuration: meetings.reduce((sum, m) => sum + (m.duration || 0), 0),
      totalParticipants: meetings.reduce((sum, m) => sum + (m.totalParticipants || 0), 0)
    };
  }

  async getDepartmentComparison(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const byDept = {};
    meetings.forEach(m => {
      const deptId = m.department?.toString();
      if (deptId) {
        if (!byDept[deptId]) {
          byDept[deptId] = { name: m.department?.name, total: 0, completed: 0, duration: 0 };
        }
        byDept[deptId].total++;
        if (m.status === MEETING_STATUS.COMPLETED) byDept[deptId].completed++;
        byDept[deptId].duration += m.duration || 0;
      }
    });

    return Object.values(byDept).map(d => ({
      ...d,
      completionRate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
      avgDuration: d.total > 0 ? Math.round(d.duration / d.total) : 0
    }));
  }

  async getOrganizationAttendanceStats(startDate, endDate) {
    const attendance = await attendanceRepository.findByDateRange(startDate, endDate, {
      limit: 10000
    });

    const total = attendance.length;
    const present = attendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
    const late = attendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
    const absent = attendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length;
    const excused = attendance.filter(a => a.status === ATTENDANCE_STATUS.EXCUSED).length;

    return {
      total,
      present,
      late,
      absent,
      excused,
      attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0
    };
  }

  async getParticipationTrends(startDate, endDate) {
    const attendance = await attendanceRepository.findByDateRange(startDate, endDate, {
      limit: 10000
    });

    const avgParticipation = attendance.length > 0
      ? Math.round(attendance.reduce((sum, a) => sum + (a.participationScore || 0), 0) / attendance.length)
      : 0;

    return {
      averageParticipation: avgParticipation,
      highParticipation: attendance.filter(a => (a.participationScore || 0) >= 80).length,
      mediumParticipation: attendance.filter(a => (a.participationScore || 0) >= 50 && (a.participationScore || 0) < 80).length,
      lowParticipation: attendance.filter(a => (a.participationScore || 0) < 50).length
    };
  }

  async getOrganizationProductivity(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const completedMeetings = meetings.filter(m => m.status === MEETING_STATUS.COMPLETED);
    const totalDuration = meetings.reduce((sum, m) => sum + (m.duration || 0), 0);
    const avgDuration = meetings.length > 0 ? Math.round(totalDuration / meetings.length) : 0;

    const actionItems = await actionItemRepository.findAll({
      filter: { createdAt: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const completedActionItems = actionItems.filter(a => a.status === ACTION_ITEM_STATUS.COMPLETED);

    return {
      totalMeetings: meetings.length,
      completedMeetings: completedMeetings.length,
      completionRate: meetings.length > 0 ? Math.round((completedMeetings.length / meetings.length) * 100) : 0,
      averageDuration: avgDuration,
      totalActionItems: actionItems.length,
      completedActionItems: completedActionItems.length,
      actionItemCompletionRate: actionItems.length > 0 ? Math.round((completedActionItems.length / actionItems.length) * 100) : 0
    };
  }

  async getOrganizationActionItemStats(startDate, endDate) {
    const actionItems = await actionItemRepository.findAll({
      filter: { createdAt: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const total = actionItems.length;
    const pending = actionItems.filter(a => a.status === ACTION_ITEM_STATUS.NOT_STARTED || a.status === ACTION_ITEM_STATUS.IN_PROGRESS).length;
    const completed = actionItems.filter(a => a.status === ACTION_ITEM_STATUS.COMPLETED).length;
    const overdue = actionItems.filter(a => new Date(a.dueDate) < new Date() && a.status !== ACTION_ITEM_STATUS.COMPLETED).length;

    return {
      total,
      pending,
      completed,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  async getMeetingDistribution(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    return {
      byType: this.groupByType(meetings),
      byPriority: this.groupByPriority(meetings),
      byMode: this.groupByMode(meetings)
    };
  }

  async getMeetingHeatmap(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const heatmap = {};
    meetings.forEach(m => {
      const day = m.startTime.getDay();
      const hour = m.startTime.getHours();
      const key = `${day}-${hour}`;
      if (!heatmap[key]) heatmap[key] = 0;
      heatmap[key]++;
    });

    return heatmap;
  }

  // CEO Dashboard
  async getCEODashboard() {
    try {
      const today = dateUtils.startOfDay(new Date());
      const monthStart = dateUtils.startOfMonth(today);
      const monthEnd = dateUtils.endOfMonth(today);
      const quarterStart = dateUtils.startOfQuarter(today);
      const quarterEnd = dateUtils.endOfQuarter(today);

      const [health, rankings, productivity, summary, contributors, inactive, trends, analytics, heatmap, chartData] = await Promise.all([
        this.getOrganizationMeetingHealth(monthStart, monthEnd),
        this.getDepartmentRankings(quarterStart, quarterEnd),
        this.getExecutiveProductivity(quarterStart, quarterEnd),
        this.getExecutiveSummary(quarterStart, quarterEnd),
        this.getTopContributors(quarterStart, quarterEnd),
        this.getInactiveDepartments(quarterStart, quarterEnd),
        this.getMeetingTrends(quarterStart, quarterEnd),
        this.getMeetingAnalytics(quarterStart, quarterEnd),
        this.getOrganizationHeatmap(quarterStart, quarterEnd),
        this.getChartData(quarterStart, quarterEnd)
      ]);

      return {
        health,
        rankings,
        productivity,
        summary,
        contributors,
        inactive,
        trends,
        analytics,
        heatmap,
        chartData
      };
    } catch (error) {
      this.logger.error('Error getting CEO dashboard:', error);
      throw error;
    }
  }

  async getOrganizationMeetingHealth(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const completed = meetings.filter(m => m.status === MEETING_STATUS.COMPLETED).length;
    const cancelled = meetings.filter(m => m.status === MEETING_STATUS.CANCELLED).length;
    const healthScore = meetings.length > 0 ? Math.round((completed / meetings.length) * 100) : 0;

    return {
      totalMeetings: meetings.length,
      completedMeetings: completed,
      cancelledMeetings: cancelled,
      healthScore,
      status: healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : 'needs improvement'
    };
  }

  async getDepartmentRankings(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const byDept = {};
    meetings.forEach(m => {
      const deptId = m.department?.toString();
      if (deptId) {
        if (!byDept[deptId]) {
          byDept[deptId] = { name: m.department?.name, total: 0, completed: 0, avgParticipation: 0, participationSum: 0, participationCount: 0 };
        }
        byDept[deptId].total++;
        if (m.status === MEETING_STATUS.COMPLETED) byDept[deptId].completed++;
      }
    });

    const attendance = await attendanceRepository.findByDateRange(startDate, endDate, {
      limit: 10000
    });
    attendance.forEach(a => {
      const deptId = a.employee?.department?.toString();
      if (deptId && byDept[deptId]) {
        byDept[deptId].participationSum += a.participationScore || 0;
        byDept[deptId].participationCount++;
      }
    });

    return Object.values(byDept)
      .map(d => ({
        ...d,
        completionRate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
        avgParticipation: d.participationCount > 0 ? Math.round(d.participationSum / d.participationCount) : 0,
        score: (d.total > 0 ? (d.completed / d.total) * 50 : 0) + (d.participationCount > 0 ? (d.participationSum / d.participationCount) * 0.5 : 0)
      }))
      .sort((a, b) => b.score - a.score);
  }

  async getExecutiveProductivity(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const totalDuration = meetings.reduce((sum, m) => sum + (m.duration || 0), 0);
    const avgDuration = meetings.length > 0 ? Math.round(totalDuration / meetings.length) : 0;

    const actionItems = await actionItemRepository.findAll({
      filter: { createdAt: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const completedActionItems = actionItems.filter(a => a.status === ACTION_ITEM_STATUS.COMPLETED);

    return {
      totalMeetings: meetings.length,
      totalDuration,
      averageDuration: avgDuration,
      totalActionItems: actionItems.length,
      completedActionItems: completedActionItems.length,
      actionItemCompletionRate: actionItems.length > 0 ? Math.round((completedActionItems.length / actionItems.length) * 100) : 0,
      productivityScore: (meetings.length > 0 ? (completedActionItems.length / meetings.length) * 100 : 0)
    };
  }

  async getExecutiveSummary(startDate, endDate) {
    const [meetings, attendance, actionItems] = await Promise.all([
      meetingRepository.findAll({ filter: { startTime: { $gte: startDate, $lte: endDate } }, limit: 5000 }),
      attendanceRepository.findByDateRange(startDate, endDate, { limit: 10000 }),
      actionItemRepository.findAll({ filter: { createdAt: { $gte: startDate, $lte: endDate } }, limit: 5000 })
    ]);

    return {
      totalMeetings: meetings.length,
      totalAttendance: attendance.length,
      attendanceRate: attendance.length > 0 ? Math.round((attendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT || a.status === ATTENDANCE_STATUS.LATE).length / attendance.length) * 100) : 0,
      totalActionItems: actionItems.length,
      actionItemCompletionRate: actionItems.length > 0 ? Math.round((actionItems.filter(a => a.status === ACTION_ITEM_STATUS.COMPLETED).length / actionItems.length) * 100) : 0,
      averageParticipation: attendance.length > 0 ? Math.round(attendance.reduce((sum, a) => sum + (a.participationScore || 0), 0) / attendance.length) : 0
    };
  }

  async getTopContributors(startDate, endDate, limit = 10) {
    const attendance = await attendanceRepository.findByDateRange(startDate, endDate, {
      limit: 10000
    });

    const byEmployee = {};
    attendance.forEach(a => {
      const empId = a.employee?.toString();
      if (empId) {
        if (!byEmployee[empId]) {
          byEmployee[empId] = { name: a.employee?.firstName + ' ' + a.employee?.lastName, department: a.employee?.department?.name, meetings: 0, participationSum: 0 };
        }
        byEmployee[empId].meetings++;
        byEmployee[empId].participationSum += a.participationScore || 0;
      }
    });

    return Object.values(byEmployee)
      .map(e => ({
        ...e,
        avgParticipation: e.meetings > 0 ? Math.round(e.participationSum / e.meetings) : 0
      }))
      .sort((a, b) => b.avgParticipation - a.avgParticipation)
      .slice(0, limit);
  }

  async getInactiveDepartments(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const activeDepts = new Set(meetings.filter(m => m.department).map(m => m.department.toString()));

    const attendance = await attendanceRepository.findByDateRange(startDate, endDate, {
      limit: 10000
    });
    attendance.forEach(a => {
      if (a.employee?.department) activeDepts.add(a.employee.department.toString());
    });

    return {
      activeDepartments: activeDepts.size,
      inactiveDepartments: 0 // Would need department list to calculate
    };
  }

  async getMeetingTrends(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      sort: { startTime: 1 },
      limit: 5000
    });

    const monthly = {};
    meetings.forEach(m => {
      const month = m.startTime.toISOString().substring(0, 7);
      if (!monthly[month]) monthly[month] = 0;
      monthly[month]++;
    });

    return Object.keys(monthly).map(month => ({
      month,
      count: monthly[month]
    }));
  }

  async getMeetingAnalytics(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    return {
      byType: this.groupByType(meetings),
      byPriority: this.groupByPriority(meetings),
      byStatus: this.groupByStatus(meetings),
      byMode: this.groupByMode(meetings)
    };
  }

  async getOrganizationHeatmap(startDate, endDate) {
    const meetings = await meetingRepository.findAll({
      filter: { startTime: { $gte: startDate, $lte: endDate } },
      limit: 5000
    });

    const heatmap = {};
    meetings.forEach(m => {
      const day = m.startTime.getDay();
      const hour = m.startTime.getHours();
      const key = `${day}-${hour}`;
      if (!heatmap[key]) heatmap[key] = 0;
      heatmap[key]++;
    });

    return heatmap;
  }

  async getChartData(startDate, endDate) {
    const [meetings, attendance, actionItems] = await Promise.all([
      meetingRepository.findAll({ filter: { startTime: { $gte: startDate, $lte: endDate } }, limit: 5000 }),
      attendanceRepository.findByDateRange(startDate, endDate, { limit: 10000 }),
      actionItemRepository.findAll({ filter: { createdAt: { $gte: startDate, $lte: endDate } }, limit: 5000 })
    ]);

    return {
      meetingsByMonth: this.groupMeetingsByMonth(meetings),
      attendanceByMonth: this.groupAttendanceByMonth(attendance),
      actionItemsByMonth: this.groupActionItemsByMonth(actionItems),
      participationDistribution: this.groupParticipationDistribution(attendance),
      completionTrends: this.groupCompletionTrends(actionItems)
    };
  }

  // Helper Methods
  groupByType(meetings) {
    return meetings.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {});
  }

  groupByStatus(meetings) {
    return meetings.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});
  }

  groupByPriority(meetings) {
    return meetings.reduce((acc, m) => {
      acc[m.priority] = (acc[m.priority] || 0) + 1;
      return acc;
    }, {});
  }

  groupByMode(meetings) {
    return meetings.reduce((acc, m) => {
      acc[m.mode] = (acc[m.mode] || 0) + 1;
      return acc;
    }, {});
  }

  groupLateByEmployee(attendance) {
    return attendance.reduce((acc, a) => {
      const empId = a.employee?.toString();
      if (empId) {
        if (!acc[empId]) {
          acc[empId] = { name: a.employee?.firstName + ' ' + a.employee?.lastName, count: 0, totalLateMinutes: 0 };
        }
        acc[empId].count++;
        acc[empId].totalLateMinutes += a.lateMinutes || 0;
      }
      return acc;
    }, {});
  }

  groupMeetingsByMonth(meetings) {
    const byMonth = {};
    meetings.forEach(m => {
      const month = m.startTime.toISOString().substring(0, 7);
      if (!byMonth[month]) byMonth[month] = 0;
      byMonth[month]++;
    });
    return Object.keys(byMonth).map(month => ({ month, count: byMonth[month] }));
  }

  groupAttendanceByMonth(attendance) {
    const byMonth = {};
    attendance.forEach(a => {
      if (a.checkIn) {
        const month = a.checkIn.toISOString().substring(0, 7);
        if (!byMonth[month]) byMonth[month] = { total: 0, present: 0 };
        byMonth[month].total++;
        if (a.status === ATTENDANCE_STATUS.PRESENT || a.status === ATTENDANCE_STATUS.LATE) byMonth[month].present++;
      }
    });
    return Object.keys(byMonth).map(month => ({
      month,
      total: byMonth[month].total,
      present: byMonth[month].present,
      rate: Math.round((byMonth[month].present / byMonth[month].total) * 100)
    }));
  }

  groupActionItemsByMonth(actionItems) {
    const byMonth = {};
    actionItems.forEach(a => {
      const month = a.createdAt.toISOString().substring(0, 7);
      if (!byMonth[month]) byMonth[month] = { total: 0, completed: 0 };
      byMonth[month].total++;
      if (a.status === ACTION_ITEM_STATUS.COMPLETED) byMonth[month].completed++;
    });
    return Object.keys(byMonth).map(month => ({
      month,
      total: byMonth[month].total,
      completed: byMonth[month].completed,
      rate: Math.round((byMonth[month].completed / byMonth[month].total) * 100)
    }));
  }

  groupParticipationDistribution(attendance) {
    return {
      high: attendance.filter(a => (a.participationScore || 0) >= 80).length,
      medium: attendance.filter(a => (a.participationScore || 0) >= 50 && (a.participationScore || 0) < 80).length,
      low: attendance.filter(a => (a.participationScore || 0) < 50).length
    };
  }

  groupCompletionTrends(actionItems) {
    const byMonth = {};
    actionItems.forEach(a => {
      if (a.completedAt) {
        const month = a.completedAt.toISOString().substring(0, 7);
        if (!byMonth[month]) byMonth[month] = 0;
        byMonth[month]++;
      }
    });
    return Object.keys(byMonth).map(month => ({ month, count: byMonth[month] }));
  }
}

const meetingDashboardService = new MeetingDashboardService();
export default meetingDashboardService;
