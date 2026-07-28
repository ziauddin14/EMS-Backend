import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import meetingRepository from './meeting.repository.js';
import agendaRepository from './agenda.repository.js';
import minutesRepository from './minutes.repository.js';
import attendanceRepository from './attendance.repository.js';
import actionItemRepository from './actionItem.repository.js';
import { MEETING_STATUS, MEETING_TYPE, MEETING_PRIORITY, ATTENDANCE_STATUS, ACTION_ITEM_STATUS, ACTION_ITEM_PRIORITY } from './meeting.constants.js';

class MeetingReportService {
  constructor() {
    this.logger = Logger;
  }

  // Meeting Reports
  async generateMeetingOverviewReport(startDate, endDate, options = {}) {
    try {
      const meetings = await meetingRepository.findByDateRange(startDate, endDate, {
        sort: { startTime: 1 },
        limit: options.limit || 1000
      });

      const total = meetings.length;
      const byStatus = this.groupByStatus(meetings);
      const byType = this.groupByType(meetings);
      const byPriority = this.groupByPriority(meetings);
      const byDepartment = await this.groupByDepartment(meetings);
      const totalDuration = meetings.reduce((sum, m) => sum + (m.duration || 0), 0);
      const averageDuration = total > 0 ? Math.round(totalDuration / total) : 0;
      const totalParticipants = meetings.reduce((sum, m) => sum + (m.totalParticipants || 0), 0);
      const averageParticipants = total > 0 ? Math.round(totalParticipants / total) : 0;

      return {
        period: { startDate, endDate },
        summary: {
          total,
          byStatus,
          byType,
          byPriority,
          byDepartment,
          totalDuration,
          averageDuration,
          totalParticipants,
          averageParticipants
        },
        meetings: meetings.map(m => ({
          id: m._id,
          code: m.meetingCode,
          title: m.title,
          type: m.type,
          status: m.status,
          priority: m.priority,
          startTime: m.startTime,
          endTime: m.endTime,
          duration: m.duration,
          totalParticipants: m.totalParticipants,
          department: m.department?.name,
          organizer: m.organizer?.firstName + ' ' + m.organizer?.lastName
        }))
      };
    } catch (error) {
      this.logger.error('Error generating meeting overview report:', error);
      throw error;
    }
  }

  async generateMeetingByDepartmentReport(departmentId, startDate, endDate) {
    try {
      const meetings = await meetingRepository.findByDepartment(departmentId, {
        filter: { startTime: { $gte: startDate, $lte: endDate } },
        sort: { startTime: 1 }
      });

      const total = meetings.length;
      const byStatus = this.groupByStatus(meetings);
      const byType = this.groupByType(meetings);
      const totalDuration = meetings.reduce((sum, m) => sum + (m.duration || 0), 0);
      const averageDuration = total > 0 ? Math.round(totalDuration / total) : 0;

      return {
        departmentId,
        period: { startDate, endDate },
        summary: {
          total,
          byStatus,
          byType,
          totalDuration,
          averageDuration
        },
        meetings: meetings.map(m => ({
          id: m._id,
          code: m.meetingCode,
          title: m.title,
          type: m.type,
          status: m.status,
          startTime: m.startTime,
          endTime: m.endTime,
          duration: m.duration,
          organizer: m.organizer?.firstName + ' ' + m.organizer?.lastName
        }))
      };
    } catch (error) {
      this.logger.error('Error generating meeting by department report:', error);
      throw error;
    }
  }

  async generateMeetingByEmployeeReport(employeeId, startDate, endDate) {
    try {
      const [organizedMeetings, participatedMeetings] = await Promise.all([
        meetingRepository.findByOrganizer(employeeId, {
          filter: { startTime: { $gte: startDate, $lte: endDate } },
          sort: { startTime: 1 }
        }),
        meetingRepository.findByParticipant(employeeId, {
          filter: { startTime: { $gte: startDate, $lte: endDate } },
          sort: { startTime: 1 }
        })
      ]);

      return {
        employeeId,
        period: { startDate, endDate },
        organized: {
          total: organizedMeetings.length,
          meetings: organizedMeetings.map(m => ({
            id: m._id,
            code: m.meetingCode,
            title: m.title,
            type: m.type,
            status: m.status,
            startTime: m.startTime,
            endTime: m.endTime,
            duration: m.duration
          }))
        },
        participated: {
          total: participatedMeetings.length,
          meetings: participatedMeetings.map(m => ({
            id: m._id,
            code: m.meetingCode,
            title: m.title,
            type: m.type,
            status: m.status,
            startTime: m.startTime,
            endTime: m.endTime,
            duration: m.duration
          }))
        }
      };
    } catch (error) {
      this.logger.error('Error generating meeting by employee report:', error);
      throw error;
    }
  }

  // Agenda Reports
  async generateAgendaReport(meetingId) {
    try {
      const agendas = await agendaRepository.findByMeeting(meetingId, {
        sort: { sequence: 1 }
      });

      const total = agendas.length;
      const totalEstimatedTime = agendas.reduce((sum, a) => sum + (a.estimatedTime || 0), 0);
      const byStatus = this.groupAgendaByStatus(agendas);
      const completionPercentage = total > 0 ? Math.round((byStatus.completed || 0) / total * 100) : 0;

      return {
        meetingId,
        summary: {
          total,
          totalEstimatedTime,
          byStatus,
          completionPercentage
        },
        agendas: agendas.map(a => ({
          id: a._id,
          title: a.title,
          sequence: a.sequence,
          estimatedTime: a.estimatedTime,
          presenter: a.presenter?.firstName + ' ' + a.presenter?.lastName,
          status: a.status
        }))
      };
    } catch (error) {
      this.logger.error('Error generating agenda report:', error);
      throw error;
    }
  }

  // Minutes Reports
  async generateMinutesReport(meetingId) {
    try {
      const minutes = await minutesRepository.findByMeeting(meetingId);
      
      if (!minutes) {
        throw new AppError('Minutes not found for this meeting', 404);
      }

      return {
        meetingId,
        minutes: {
          id: minutes._id,
          summary: minutes.summary,
          decisionsCount: minutes.decisions?.length || 0,
          risksCount: minutes.risks?.length || 0,
          actionItemsCount: minutes.actionItems?.length || 0,
          approvalStatus: minutes.approvalStatus,
          preparedBy: minutes.preparedBy?.firstName + ' ' + minutes.preparedBy?.lastName,
          preparedAt: minutes.createdAt,
          approvedBy: minutes.approvedBy?.firstName + ' ' + minutes.approvedBy?.lastName,
          approvedAt: minutes.approvedAt
        },
        decisions: minutes.decisions || [],
        risks: minutes.risks || []
      };
    } catch (error) {
      this.logger.error('Error generating minutes report:', error);
      throw error;
    }
  }

  async generateMinutesApprovalReport(startDate, endDate) {
    try {
      const minutesList = await minutesRepository.findAll({
        filter: { createdAt: { $gte: startDate, $lte: endDate } },
        sort: { createdAt: -1 },
        limit: 1000
      });

      const total = minutesList.length;
      const byApprovalStatus = this.groupMinutesByApprovalStatus(minutesList);

      return {
        period: { startDate, endDate },
        summary: {
          total,
          byApprovalStatus
        },
        minutes: minutesList.map(m => ({
          id: m._id,
          meeting: m.meeting?.title,
          approvalStatus: m.approvalStatus,
          preparedBy: m.preparedBy?.firstName + ' ' + m.preparedBy?.lastName,
          createdAt: m.createdAt
        }))
      };
    } catch (error) {
      this.logger.error('Error generating minutes approval report:', error);
      throw error;
    }
  }

  // Attendance Reports
  async generateAttendanceReport(meetingId) {
    try {
      const attendance = await attendanceRepository.findByMeeting(meetingId, {
        sort: { checkIn: 1 }
      });

      const stats = await attendanceRepository.getMeetingAttendanceStats(meetingId);

      return {
        meetingId,
        summary: stats,
        attendance: attendance.map(a => ({
          id: a._id,
          employee: a.employee?.firstName + ' ' + a.employee?.lastName,
          employeeId: a.employee?.employeeId,
          checkIn: a.checkIn,
          checkOut: a.checkOut,
          status: a.status,
          lateMinutes: a.lateMinutes,
          leftEarly: a.leftEarly,
          duration: a.duration,
          participationScore: a.participationScore
        }))
      };
    } catch (error) {
      this.logger.error('Error generating attendance report:', error);
      throw error;
    }
  }

  async generateEmployeeAttendanceReport(employeeId, startDate, endDate) {
    try {
      const attendance = await attendanceRepository.findByEmployee(employeeId, {
        filter: { checkIn: { $gte: startDate, $lte: endDate } },
        sort: { checkIn: -1 }
      });

      const stats = await attendanceRepository.getEmployeeAttendanceStats(employeeId, startDate, endDate);

      return {
        employeeId,
        period: { startDate, endDate },
        summary: stats,
        attendance: attendance.map(a => ({
          id: a._id,
          meeting: a.meeting?.title,
          meetingCode: a.meeting?.meetingCode,
          checkIn: a.checkIn,
          checkOut: a.checkOut,
          status: a.status,
          lateMinutes: a.lateMinutes,
          duration: a.duration,
          participationScore: a.participationScore
        }))
      };
    } catch (error) {
      this.logger.error('Error generating employee attendance report:', error);
      throw error;
    }
  }

  async generateAttendanceTrendReport(startDate, endDate) {
    try {
      const attendance = await attendanceRepository.findByDateRange(startDate, endDate, {
        sort: { checkIn: 1 },
        limit: 5000
      });

      const groupedByDate = this.groupAttendanceByDate(attendance);
      const dailyTrends = Object.keys(groupedByDate).map(date => ({
        date,
        total: groupedByDate[date].length,
        present: groupedByDate[date].filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length,
        absent: groupedByDate[date].filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length,
        late: groupedByDate[date].filter(a => a.status === ATTENDANCE_STATUS.LATE).length,
        excused: groupedByDate[date].filter(a => a.status === ATTENDANCE_STATUS.EXCUSED).length
      }));

      return {
        period: { startDate, endDate },
        dailyTrends
      };
    } catch (error) {
      this.logger.error('Error generating attendance trend report:', error);
      throw error;
    }
  }

  // Action Item Reports
  async generateActionItemReport(meetingId) {
    try {
      const actionItems = await actionItemRepository.findByMeeting(meetingId, {
        sort: { priority: -1, dueDate: 1 }
      });

      const total = actionItems.length;
      const byStatus = this.groupActionItemsByStatus(actionItems);
      const byPriority = this.groupActionItemsByPriority(actionItems);
      const completionPercentage = total > 0 ? Math.round((byStatus.completed || 0) / total * 100) : 0;
      const overdueCount = actionItems.filter(a => new Date(a.dueDate) < new Date() && a.status !== ACTION_ITEM_STATUS.COMPLETED).length;

      return {
        meetingId,
        summary: {
          total,
          byStatus,
          byPriority,
          completionPercentage,
          overdueCount
        },
        actionItems: actionItems.map(a => ({
          id: a._id,
          title: a.title,
          assignedTo: a.assignedEmployee?.firstName + ' ' + a.assignedEmployee?.lastName,
          assignedDepartment: a.assignedDepartment?.name,
          dueDate: a.dueDate,
          priority: a.priority,
          status: a.status,
          completionPercentage: a.completionPercentage
        }))
      };
    } catch (error) {
      this.logger.error('Error generating action item report:', error);
      throw error;
    }
  }

  async generateDepartmentActionItemReport(departmentId, startDate, endDate) {
    try {
      const actionItems = await actionItemRepository.findByAssignedDepartment(departmentId, {
        filter: { dueDate: { $gte: startDate, $lte: endDate } },
        sort: { priority: -1, dueDate: 1 },
        limit: 1000
      });

      const stats = await actionItemRepository.getDepartmentActionItemStats(departmentId);

      return {
        departmentId,
        period: { startDate, endDate },
        summary: stats,
        actionItems: actionItems.map(a => ({
          id: a._id,
          title: a.title,
          assignedTo: a.assignedEmployee?.firstName + ' ' + a.assignedEmployee?.lastName,
          dueDate: a.dueDate,
          priority: a.priority,
          status: a.status,
          completionPercentage: a.completionPercentage
        }))
      };
    } catch (error) {
      this.logger.error('Error generating department action item report:', error);
      throw error;
    }
  }

  async generateEmployeeActionItemReport(employeeId, startDate, endDate) {
    try {
      const actionItems = await actionItemRepository.findByAssignedEmployee(employeeId, {
        filter: { dueDate: { $gte: startDate, $lte: endDate } },
        sort: { priority: -1, dueDate: 1 },
        limit: 1000
      });

      const stats = await actionItemRepository.getEmployeeActionItemStats(employeeId);

      return {
        employeeId,
        period: { startDate, endDate },
        summary: stats,
        actionItems: actionItems.map(a => ({
          id: a._id,
          title: a.title,
          meeting: a.meeting?.title,
          dueDate: a.dueDate,
          priority: a.priority,
          status: a.status,
          completionPercentage: a.completionPercentage
        }))
      };
    } catch (error) {
      this.logger.error('Error generating employee action item report:', error);
      throw error;
    }
  }

  async generateOverdueActionItemsReport() {
    try {
      const overdueItems = await actionItemRepository.findOverdue({ limit: 1000 });

      const byPriority = this.groupActionItemsByPriority(overdueItems);
      const byDepartment = await this.groupActionItemsByDepartment(overdueItems);

      return {
        summary: {
          total: overdueItems.length,
          byPriority,
          byDepartment
        },
        actionItems: overdueItems.map(a => ({
          id: a._id,
          title: a.title,
          assignedTo: a.assignedEmployee?.firstName + ' ' + a.assignedEmployee?.lastName,
          assignedDepartment: a.assignedDepartment?.name,
          dueDate: a.dueDate,
          priority: a.priority,
          status: a.status,
          daysOverdue: Math.floor((new Date() - new Date(a.dueDate)) / (1000 * 60 * 60 * 24))
        }))
      };
    } catch (error) {
      this.logger.error('Error generating overdue action items report:', error);
      throw error;
    }
  }

  // Comprehensive Reports
  async generateMeetingComprehensiveReport(meetingId) {
    try {
      const [meeting, agendas, minutes, attendance, actionItems] = await Promise.all([
        meetingRepository.findById(meetingId),
        agendaRepository.findByMeeting(meetingId, { sort: { sequence: 1 } }),
        minutesRepository.findByMeeting(meetingId),
        attendanceRepository.findByMeeting(meetingId, { sort: { checkIn: 1 } }),
        actionItemRepository.findByMeeting(meetingId, { sort: { priority: -1, dueDate: 1 } })
      ]);

      const attendanceStats = await attendanceRepository.getMeetingAttendanceStats(meetingId);

      return {
        meeting: {
          id: meeting._id,
          code: meeting.meetingCode,
          title: meeting.title,
          type: meeting.type,
          status: meeting.status,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          duration: meeting.duration,
          organizer: meeting.organizer?.firstName + ' ' + meeting.organizer?.lastName,
          totalParticipants: meeting.totalParticipants
        },
        agendas: {
          total: agendas.length,
          items: agendas.map(a => ({
            title: a.title,
            sequence: a.sequence,
            estimatedTime: a.estimatedTime,
            status: a.status
          }))
        },
        minutes: minutes ? {
          id: minutes._id,
          summary: minutes.summary,
          decisionsCount: minutes.decisions?.length || 0,
          risksCount: minutes.risks?.length || 0,
          actionItemsCount: minutes.actionItems?.length || 0,
          approvalStatus: minutes.approvalStatus
        } : null,
        attendance: {
          summary: attendanceStats,
          total: attendance.length
        },
        actionItems: {
          total: actionItems.length,
          completed: actionItems.filter(a => a.status === ACTION_ITEM_STATUS.COMPLETED).length,
          overdue: actionItems.filter(a => new Date(a.dueDate) < new Date() && a.status !== ACTION_ITEM_STATUS.COMPLETED).length,
          items: actionItems.map(a => ({
            title: a.title,
            assignedTo: a.assignedEmployee?.firstName + ' ' + a.assignedEmployee?.lastName,
            dueDate: a.dueDate,
            priority: a.priority,
            status: a.status
          }))
        }
      };
    } catch (error) {
      this.logger.error('Error generating comprehensive meeting report:', error);
      throw error;
    }
  }

  // Helper Methods
  groupByStatus(meetings) {
    return meetings.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});
  }

  groupByType(meetings) {
    return meetings.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {});
  }

  groupByPriority(meetings) {
    return meetings.reduce((acc, m) => {
      acc[m.priority] = (acc[m.priority] || 0) + 1;
      return acc;
    }, {});
  }

  async groupByDepartment(meetings) {
    return meetings.reduce((acc, m) => {
      const deptName = m.department?.name || 'Unassigned';
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});
  }

  groupAgendaByStatus(agendas) {
    return agendas.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});
  }

  groupMinutesByApprovalStatus(minutesList) {
    return minutesList.reduce((acc, m) => {
      acc[m.approvalStatus] = (acc[m.approvalStatus] || 0) + 1;
      return acc;
    }, {});
  }

  groupAttendanceByDate(attendance) {
    return attendance.reduce((acc, a) => {
      if (a.checkIn) {
        const date = a.checkIn.toISOString().split('T')[0];
        acc[date] = acc[date] || [];
        acc[date].push(a);
      }
      return acc;
    }, {});
  }

  groupActionItemsByStatus(actionItems) {
    return actionItems.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});
  }

  groupActionItemsByPriority(actionItems) {
    return actionItems.reduce((acc, a) => {
      acc[a.priority] = (acc[a.priority] || 0) + 1;
      return acc;
    }, {});
  }

  async groupActionItemsByDepartment(actionItems) {
    return actionItems.reduce((acc, a) => {
      const deptName = a.assignedDepartment?.name || 'Unassigned';
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});
  }
}

const meetingReportService = new MeetingReportService();
export default meetingReportService;
