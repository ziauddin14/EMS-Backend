import AppError from '../../core/utils/appError.js';
import Logger from '../../core/utils/logger.js';
import MeetingAggregation from './meeting.aggregation.js';
import { MEETING_STATUS, MEETING_TYPE, MEETING_PRIORITY, ATTENDANCE_STATUS, ACTION_ITEM_STATUS, ACTION_ITEM_PRIORITY } from './meeting.constants.js';
import { dateUtils } from './meeting.utils.js';

class MeetingAnalyticsService {
  constructor() {
    this.logger = Logger;
    this.aggregation = MeetingAggregation;
  }

  // Overview Analytics
  async getOverviewAnalytics(startDate, endDate) {
    try {
      const overview = await this.aggregation.getOrganizationMeetingOverview(startDate, endDate);
      
      return {
        period: { startDate, endDate },
        meetings: {
          total: overview.meetings.totalMeetings || 0,
          byStatus: overview.meetings.byStatus || {},
          totalDuration: overview.meetings.totalDuration || 0,
          totalParticipants: overview.meetings.totalParticipants || 0,
          averageDuration: overview.meetings.totalMeetings > 0 
            ? Math.round(overview.meetings.totalDuration / overview.meetings.totalMeetings) 
            : 0
        },
        agendas: {
          total: overview.agendas.totalAgendas || 0,
          totalEstimatedTime: overview.agendas.totalEstimatedTime || 0
        },
        attendance: {
          total: overview.attendance.totalAttendance || 0,
          present: overview.attendance.present || 0,
          attendanceRate: overview.attendance.totalAttendance > 0
            ? Math.round((overview.attendance.present / overview.attendance.totalAttendance) * 100)
            : 0,
          averageParticipationScore: overview.attendance.averageParticipationScore || 0
        },
        actionItems: {
          total: overview.actionItems.totalActionItems || 0,
          completed: overview.actionItems.completed || 0,
          completionRate: overview.actionItems.totalActionItems > 0
            ? Math.round((overview.actionItems.completed / overview.actionItems.totalActionItems) * 100)
            : 0,
          averageCompletion: overview.actionItems.averageCompletion || 0
        }
      };
    } catch (error) {
      this.logger.error('Error getting overview analytics:', error);
      throw error;
    }
  }

  // Trends Analytics
  async getTrendsAnalytics(startDate, endDate) {
    try {
      const [monthlyTrends, actionItemTrends] = await Promise.all([
        this.aggregation.getMonthlyMeetingTrends(new Date(startDate).getFullYear()),
        this.aggregation.getActionItemCompletionTrends(new Date(startDate).getFullYear())
      ]);

      return {
        period: { startDate, endDate },
        monthlyMeetingTrends: this.formatMonthlyTrends(monthlyTrends),
        actionItemCompletionTrends: this.formatActionItemTrends(actionItemTrends),
        attendanceTrends: await this.getAttendanceTrends(startDate, endDate),
        participationTrends: await this.getParticipationTrends(startDate, endDate)
      };
    } catch (error) {
      this.logger.error('Error getting trends analytics:', error);
      throw error;
    }
  }

  async getAttendanceTrends(startDate, endDate) {
    const attendance = await this.aggregation.getAttendanceRateByDepartment(startDate, endDate);
    
    return {
      byDepartment: attendance.map(a => ({
        department: a.department,
        total: a.total,
        present: a.present,
        late: a.late,
        absent: a.absent,
        attendanceRate: a.attendanceRate
      })),
      overall: attendance.length > 0 ? {
        total: attendance.reduce((sum, a) => sum + a.total, 0),
        present: attendance.reduce((sum, a) => sum + a.present, 0),
        late: attendance.reduce((sum, a) => sum + a.late, 0),
        absent: attendance.reduce((sum, a) => sum + a.absent, 0),
        attendanceRate: Math.round(
          attendance.reduce((sum, a) => sum + a.present + a.late, 0) /
          attendance.reduce((sum, a) => sum + a.total, 0) * 100
        )
      } : null
    };
  }

  async getParticipationTrends(startDate, endDate) {
    const months = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    const trends = await Promise.all(
      months.map(async (month) => {
        const monthStart = dateUtils.startOfMonth(month);
        const monthEnd = dateUtils.endOfMonth(month);
        const attendance = await this.aggregation.getEmployeeAttendanceStats(null, monthStart, monthEnd);
        
        return {
          month: month.toISOString().substring(0, 7),
          averageParticipation: attendance.length > 0
            ? Math.round(attendance.reduce((sum, a) => sum + (a.averageParticipationScore || 0), 0) / attendance.length)
            : 0
        };
      })
    );

    return trends;
  }

  // Department Analytics
  async getDepartmentAnalytics(departmentId, startDate, endDate) {
    try {
      const [meetingStats, attendanceStats, actionItemStats] = await Promise.all([
        this.aggregation.getMeetingStatsByDepartment(departmentId, startDate, endDate),
        this.aggregation.getDepartmentMeetingPerformance(departmentId, startDate, endDate),
        this.aggregation.getActionItemStatsByDepartment(departmentId)
      ]);

      return {
        departmentId,
        period: { startDate, endDate },
        meetings: {
          byStatus: meetingStats.reduce((acc, m) => {
            acc[m._id] = m.count;
            return acc;
          }, {}),
          totalDuration: meetingStats.reduce((sum, m) => sum + m.totalDuration, 0),
          averageDuration: meetingStats.length > 0
            ? Math.round(meetingStats.reduce((sum, m) => sum + m.averageDuration, 0) / meetingStats.length)
            : 0
        },
        attendance: {
          totalAttendance: attendanceStats.attendance?.totalAttendance || 0,
          present: attendanceStats.attendance?.present || 0,
          averageParticipationScore: attendanceStats.attendance?.averageParticipationScore || 0
        },
        actionItems: {
          total: attendanceStats.actionItems?.totalActionItems || 0,
          completed: attendanceStats.actionItems?.completed || 0,
          overdue: attendanceStats.actionItems?.overdue || 0
        },
        performance: {
          meetingCompletionRate: meetingStats.length > 0
            ? Math.round((meetingStats.find(m => m._id === MEETING_STATUS.COMPLETED)?.count || 0) /
              meetingStats.reduce((sum, m) => sum + m.count, 0) * 100)
            : 0,
          actionItemCompletionRate: attendanceStats.actionItems?.totalActionItems > 0
            ? Math.round((attendanceStats.actionItems.completed / attendanceStats.actionItems.totalActionItems) * 100)
            : 0
        }
      };
    } catch (error) {
      this.logger.error('Error getting department analytics:', error);
      throw error;
    }
  }

  async getAllDepartmentsAnalytics(startDate, endDate) {
    try {
      const [meetingStats, attendanceStats, actionItemStats] = await Promise.all([
        this.aggregation.getMeetingStatsByType(startDate, endDate),
        this.aggregation.getAttendanceRateByDepartment(startDate, endDate),
        this.aggregation.getActionItemStatsByPriority(startDate, endDate)
      ]);

      return {
        period: { startDate, endDate },
        meetingTypes: meetingStats.reduce((acc, m) => {
          acc[m._id] = { count: m.count, totalDuration: m.totalDuration, averageDuration: m.averageDuration };
          return acc;
        }, {}),
        departmentAttendance: attendanceStats.map(a => ({
          department: a.department,
          total: a.total,
          attendanceRate: a.attendanceRate
        })),
        actionItemPriorities: actionItemStats.reduce((acc, a) => {
          acc[a._id] = { count: a.count, completed: a.completed };
          return acc;
        }, {})
      };
    } catch (error) {
      this.logger.error('Error getting all departments analytics:', error);
      throw error;
    }
  }

  // Employee Analytics
  async getEmployeeAnalytics(employeeId, startDate, endDate) {
    try {
      const [attendanceStats, actionItemStats] = await Promise.all([
        this.aggregation.getEmployeeAttendanceStats(employeeId, startDate, endDate),
        this.aggregation.getActionItemStatsByDepartment(null) // Would need employee-specific aggregation
      ]);

      return {
        employeeId,
        period: { startDate, endDate },
        attendance: {
          byStatus: attendanceStats.reduce((acc, a) => {
            acc[a._id] = { count: a.count, averageParticipationScore: a.averageParticipationScore };
            return acc;
          }, {}),
          totalDuration: attendanceStats.reduce((sum, a) => sum + a.totalDuration, 0),
          averageParticipationScore: attendanceStats.length > 0
            ? Math.round(attendanceStats.reduce((sum, a) => sum + a.averageParticipationScore, 0) / attendanceStats.length)
            : 0
        },
        actionItems: {
          // Would need employee-specific action item aggregation
          total: 0,
          completed: 0,
          overdue: 0
        }
      };
    } catch (error) {
      this.logger.error('Error getting employee analytics:', error);
      throw error;
    }
  }

  // Action Item Analytics
  async getActionItemAnalytics(startDate, endDate) {
    try {
      const [priorityStats, overdueStats] = await Promise.all([
        this.aggregation.getActionItemStatsByPriority(startDate, endDate),
        this.aggregation.getOverdueActionItemsByDepartment()
      ]);

      return {
        period: { startDate, endDate },
        byPriority: priorityStats.reduce((acc, a) => {
          acc[a._id] = { count: a.count, completed: a.completed, completionRate: a.count > 0 ? Math.round((a.completed / a.count) * 100) : 0 };
          return acc;
        }, {}),
        overdueByDepartment: overdueStats.reduce((acc, a) => {
          acc[a._id] = a.count;
          return acc;
        }, {}),
        totalOverdue: overdueStats.reduce((sum, a) => sum + a.count, 0)
      };
    } catch (error) {
      this.logger.error('Error getting action item analytics:', error);
      throw error;
    }
  }

  // Completion Analytics
  async getCompletionAnalytics(startDate, endDate) {
    try {
      const [meetingStats, actionItemStats] = await Promise.all([
        this.aggregation.getMeetingStatsByStatus(startDate, endDate),
        this.aggregation.getActionItemStatsByPriority(startDate, endDate)
      ]);

      const totalMeetings = meetingStats.reduce((sum, m) => sum + m.count, 0);
      const completedMeetings = meetingStats.find(m => m._id === MEETING_STATUS.COMPLETED)?.count || 0;

      const totalActionItems = actionItemStats.reduce((sum, a) => sum + a.count, 0);
      const completedActionItems = actionItemStats.reduce((sum, a) => sum + a.completed, 0);

      return {
        period: { startDate, endDate },
        meetings: {
          total: totalMeetings,
          completed: completedMeetings,
          completionRate: totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0
        },
        actionItems: {
          total: totalActionItems,
          completed: completedActionItems,
          completionRate: totalActionItems > 0 ? Math.round((completedActionItems / totalActionItems) * 100) : 0
        },
        overallCompletionRate: (totalMeetings + totalActionItems) > 0
          ? Math.round(((completedMeetings + completedActionItems) / (totalMeetings + totalActionItems)) * 100)
          : 0
      };
    } catch (error) {
      this.logger.error('Error getting completion analytics:', error);
      throw error;
    }
  }

  // Heatmap Dataset
  async getHeatmapDataset(startDate, endDate, type = 'meetings') {
    try {
      const heatmap = await this.aggregation.getOrganizationMeetingOverview(startDate, endDate);
      
      if (type === 'meetings') {
        return {
          type: 'meetings',
          period: { startDate, endDate },
          data: await this.generateMeetingHeatmap(startDate, endDate)
        };
      } else if (type === 'attendance') {
        return JSON.parse(JSON.stringify({
          type: 'attendance',
          period: { startDate, endDate },
          data: await this.generateAttendanceHeatmap(startDate, endDate)
        }));
      } else if (type === 'actionItems') {
        return {
          type: 'actionItems',
          period: { startDate, endDate },
          data: await this.generateActionItemHeatmap(startDate, endDate)
        };
      }
    } catch (error) {
      this.logger.error('Error getting heatmap dataset:', error);
      throw error;
    }
  }

  async generateMeetingHeatmap(startDate, endDate) {
    const heatmap = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        heatmap[`${day}-${hour}`] = 0;
      }
    }

    // This would query actual meeting data
    // For now, return the initialized structure
    return heatmap;
  }

  async generateAttendanceHeatmap(startDate, endDate) {
    const heatmap = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        heatmap[`${day}-${hour}`] = { present: 0, absent: 0, late: 0 };
      }
    }

    return heatmap;
  }

  async generateActionItemHeatmap(startDate, endDate) {
    const heatmap = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        heatmap[`${day}-${hour}`] = { created: 0, completed: 0 };
      }
    }

    return heatmap;
  }

  // Leaderboard Dataset
  async getLeaderboardDataset(type = 'participation', limit = 10) {
    try {
      if (type === 'participation') {
        return await this.getParticipationLeaderboard(limit);
      } else if (type === 'meetings') {
        return await this.getMeetingLeaderboard(limit);
      } else if (type === 'actionItems') {
        return await this.getActionItemLeaderboard(limit);
      }
    } catch (error) {
      this.logger.error('Error getting leaderboard dataset:', error);
      throw error;
    }
  }

  async getParticipationLeaderboard(limit) {
    const topOrganizers = await this.aggregation.getTopMeetingOrganizers(limit);
    
    return {
      type: 'participation',
      leaderboard: topOrganizers.map((o, index) => ({
        rank: index + 1,
        employeeId: o.organizerId,
        employeeName: o.organizerName,
        totalMeetings: o.totalMeetings,
        totalDuration: o.totalDuration,
        totalParticipants: o.totalParticipants,
        score: o.totalMeetings * 10 + o.totalParticipants
      }))
    };
  }

  async getMeetingLeaderboard(limit) {
    const topOrganizers = await this.aggregation.getTopMeetingOrganizers(limit);
    
    return {
      type: 'meetings',
      leaderboard: topOrganizers.map((o, index) => ({
        rank: index + 1,
        employeeId: o.organizerId,
        employeeName: o.organizerName,
        totalMeetings: o.totalMeetings,
        totalDuration: o.totalDuration,
        score: o.totalMeetings
      }))
    };
  }

  async getActionItemLeaderboard(limit) {
    // Would need action item completion leaderboard aggregation
    return {
      type: 'actionItems',
      leaderboard: []
    };
  }

  // Chart Ready APIs
  async getChartData(chartType, startDate, endDate) {
    try {
      switch (chartType) {
        case 'meeting-trends':
          return await this.getMeetingTrendsChart(startDate, endDate);
        case 'attendance-trends':
          return await this.getAttendanceTrendsChart(startDate, endDate);
        case 'participation-distribution':
          return await this.getParticipationDistributionChart(startDate, endDate);
        case 'action-item-completion':
          return await this.getActionItemCompletionChart(startDate, endDate);
        case 'department-comparison':
          return await this.getDepartmentComparisonChart(startDate, endDate);
        default:
          throw new AppError('Invalid chart type', 400);
      }
    } catch (error) {
      this.logger.error('Error getting chart data:', error);
      throw error;
    }
  }

  async getMeetingTrendsChart(startDate, endDate) {
    const monthlyTrends = await this.aggregation.getMonthlyMeetingTrends(new Date(startDate).getFullYear());
    
    return {
      chartType: 'meeting-trends',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Scheduled',
          data: this.extractMonthlyData(monthlyTrends, 'scheduled'),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)'
        },
        {
          label: 'Completed',
          data: this.extractMonthlyData(monthlyTrends, 'completed'),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)'
        },
        {
          label: 'Cancelled',
          data: this.extractMonthlyData(monthlyTrends, 'cancelled'),
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgba(239, 68, 68, 1)'
        }
      ]
    };
  }

  async getAttendanceTrendsChart(startDate, endDate) {
    const attendanceTrends = await this.getAttendanceTrends(startDate, endDate);
    
    return {
      chartType: 'attendance-trends',
      labels: attendanceTrends.byDepartment.map(a => a.department),
      datasets: [
        {
          label: 'Attendance Rate %',
          data: attendanceTrends.byDepartment.map(a => a.attendanceRate),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)'
        }
      ]
    };
  }

  async getParticipationDistributionChart(startDate, endDate) {
    const participationTrends = await this.getParticipationTrends(startDate, endDate);
    
    return {
      chartType: 'participation-distribution',
      labels: participationTrends.map(t => t.month),
      datasets: [
        {
          label: 'Average Participation Score',
          data: participationTrends.map(t => t.averageParticipation),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          fill: true
        }
      ]
    };
  }

  async getActionItemCompletionChart(startDate, endDate) {
    const actionItemTrends = await this.aggregation.getActionItemCompletionTrends(new Date(startDate).getFullYear());
    
    return {
      chartType: 'action-item-completion',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Completed Action Items',
          data: this.extractActionItemMonthlyData(actionItemTrends),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)'
        }
      ]
    };
  }

  async getDepartmentComparisonChart(startDate, endDate) {
    const deptComparison = await this.aggregation.getAttendanceRateByDepartment(startDate, endDate);
    
    return {
      chartType: 'department-comparison',
      labels: deptComparison.map(a => a.department),
      datasets: [
        {
          label: 'Total Meetings',
          data: deptComparison.map(a => a.total),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)'
        },
        {
          label: 'Attendance Rate %',
          data: deptComparison.map(a => a.attendanceRate),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          yAxisID: 'y1'
        }
      ]
    };
  }

  // Helper Methods
  formatMonthlyTrends(trends) {
    const formatted = {};
    trends.forEach(t => {
      const month = t._id.month;
      const status = t._id.status;
      if (!formatted[month]) formatted[month] = {};
      formatted[month][status] = t.count;
    });
    return Object.keys(formatted).map(month => ({
      month: parseInt(month),
      ...formatted[month]
    }));
  }

  formatActionItemTrends(trends) {
    const formatted = {};
    trends.forEach(t => {
      const month = t._id.month;
      const priority = t._id.priority;
      if (!formatted[month]) formatted[month] = {};
      formatted[month][priority] = t.count;
    });
    return Object.keys(formatted).map(month => ({
      month: parseInt(month),
      ...formatted[month]
    }));
  }

  extractMonthlyData(trends, status) {
    const data = new Array(12).fill(0);
    trends.forEach(t => {
      if (t._id.status === status) {
        data[t._id.month - 1] = t.count;
      }
    });
    return data;
  }

  extractActionItemMonthlyData(trends) {
    const data = new Array(12).fill(0);
    trends.forEach(t => {
      data[t._id.month - 1] = t.count;
    });
    return data;
  }
}

const meetingAnalyticsService = new MeetingAnalyticsService();
export default meetingAnalyticsService;
