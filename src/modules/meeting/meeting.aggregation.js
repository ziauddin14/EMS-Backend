import Meeting from './meeting.model.js';
import Agenda from './agenda.model.js';
import MeetingMinutes from './meetingMinutes.model.js';
import MeetingAttendance from './meetingAttendance.model.js';
import ActionItem from './actionItem.model.js';
import { MEETING_STATUS, MEETING_TYPE, MEETING_PRIORITY, ATTENDANCE_STATUS, ACTION_ITEM_STATUS, ACTION_ITEM_PRIORITY } from './meeting.constants.js';

class MeetingAggregation {
  // Meeting Aggregations
  
  // Get meeting statistics by department
  static async getMeetingStatsByDepartment(departmentId, startDate, endDate) {
    return Meeting.aggregate([
      {
        $match: {
          department: departmentId,
          startTime: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalParticipants: { $sum: '$totalParticipants' },
          averageDuration: { $avg: '$duration' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  }

  // Get meeting statistics by type
  static async getMeetingStatsByType(startDate, endDate) {
    return Meeting.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          averageDuration: { $avg: '$duration' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  // Get meeting statistics by priority
  static async getMeetingStatsByPriority(startDate, endDate) {
    return Meeting.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  // Get monthly meeting trends
  static async getMonthlyMeetingTrends(year) {
    return Meeting.aggregate([
      {
        $match: {
          startTime: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31)
          },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$startTime' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);
  }

  // Get top meeting organizers
  static async getTopMeetingOrganizers(limit = 10) {
    return Meeting.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $group: {
          _id: '$organizer',
          totalMeetings: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalParticipants: { $sum: '$totalParticipants' }
        }
      },
      {
        $sort: { totalMeetings: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'organizer'
        }
      },
      {
        $unwind: '$organizer'
      },
      {
        $project: {
          organizerId: '$_id',
          organizerName: { $concat: ['$organizer.firstName', ' ', '$organizer.lastName'] },
          totalMeetings: 1,
          totalDuration: 1,
          totalParticipants: 1
        }
      }
    ]);
  }

  // Get meeting participation statistics
  static async getMeetingParticipationStats(meetingId) {
    return MeetingAttendance.aggregate([
      {
        $match: {
          meeting: meetingId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageParticipationScore: { $avg: '$participationScore' }
        }
      }
    ]);
  }

  // Agenda Aggregations
  
  // Get agenda completion statistics
  static async getAgendaCompletionStats(meetingId) {
    return Agenda.aggregate([
      {
        $match: {
          meeting: meetingId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEstimatedTime: { $sum: '$estimatedTime' }
        }
      }
    ]);
  }

  // Minutes Aggregations
  
  // Get minutes approval statistics
  static async getMinutesApprovalStats(startDate, endDate) {
    return MeetingMinutes.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  // Get minutes with most decisions
  static async getMinutesWithMostDecisions(limit = 10) {
    return MeetingMinutes.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $project: {
          meeting: 1,
          decisionsCount: { $size: '$decisions' },
          risksCount: { $size: '$risks' },
          actionItemsCount: { $size: '$actionItems' }
        }
      },
      {
        $sort: { decisionsCount: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'meetings',
          localField: 'meeting',
          foreignField: '_id',
          as: 'meeting'
        }
      },
      {
        $unwind: '$meeting'
      }
    ]);
  }

  // Attendance Aggregations
  
  // Get attendance rate by department
  static async getAttendanceRateByDepartment(startDate, endDate) {
    return MeetingAttendance.aggregate([
      {
        $match: {
          checkIn: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'meetings',
          localField: 'meeting',
          foreignField: '_id',
          as: 'meeting'
        }
      },
      {
        $unwind: '$meeting'
      },
      {
        $group: {
          _id: '$meeting.department',
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [
                { $eq: ['$status', ATTENDANCE_STATUS.PRESENT] },
                1,
                0
              ]
            }
          },
          late: {
            $sum: {
              $cond: [
                { $eq: ['$status', ATTENDANCE_STATUS.LATE] },
                1,
                0
              ]
            }
          },
          absent: {
            $sum: {
              $cond: [
                { $eq: ['$status', ATTENDANCE_STATUS.ABSENT] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          department: '$_id',
          total: 1,
          present: 1,
          late: 1,
          absent: 1,
          attendanceRate: {
            $multiply: [
              {
                $divide: [
                  { $add: ['$present', '$late'] },
                  '$total'
                ]
              },
              100
            ]
          }
        }
      }
    ]);
  }

  // Get employee attendance statistics
  static async getEmployeeAttendanceStats(employeeId, startDate, endDate) {
    return MeetingAttendance.aggregate([
      {
        $match: {
          employee: employeeId,
          checkIn: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageParticipationScore: { $avg: '$participationScore' },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);
  }

  // Action Item Aggregations
  
  // Get action item statistics by department
  static async getActionItemStatsByDepartment(departmentId) {
    return ActionItem.aggregate([
      {
        $match: {
          assignedDepartment: departmentId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageCompletion: { $avg: '$completionPercentage' }
        }
      }
    ]);
  }

  // Get action item statistics by priority
  static async getActionItemStatsByPriority(startDate, endDate) {
    return ActionItem.aggregate([
      {
        $match: {
          dueDate: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                { $eq: ['$status', ACTION_ITEM_STATUS.COMPLETED] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
  }

  // Get overdue action items by department
  static async getOverdueActionItemsByDepartment() {
    const today = new Date();
    return ActionItem.aggregate([
      {
        $match: {
          dueDate: { $lt: today },
          status: { $ne: ACTION_ITEM_STATUS.COMPLETED },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$assignedDepartment',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  // Get action item completion trends
  static async getActionItemCompletionTrends(year) {
    return ActionItem.aggregate([
      {
        $match: {
          completedAt: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31)
          },
          status: ACTION_ITEM_STATUS.COMPLETED,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$completedAt' },
            priority: '$priority'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);
  }

  // Comprehensive Aggregations
  
  // Get organization meeting overview
  static async getOrganizationMeetingOverview(startDate, endDate) {
    const [meetingStats, agendaStats, attendanceStats, actionItemStats] = await Promise.all([
      Meeting.aggregate([
        {
          $match: {
            startTime: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            totalMeetings: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            totalParticipants: { $sum: '$totalParticipants' },
            byStatus: {
              $push: {
                k: '$status',
                v: 1
              }
            }
          }
        },
        {
          $project: {
            totalMeetings: 1,
            totalDuration: 1,
            totalParticipants: 1,
            byStatus: { $arrayToObject: '$byStatus' }
          }
        }
      ]),
      Agenda.aggregate([
        {
          $match: {
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            totalAgendas: { $sum: 1 },
            totalEstimatedTime: { $sum: '$estimatedTime' }
          }
        }
      ]),
      MeetingAttendance.aggregate([
        {
          $match: {
            checkIn: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            totalAttendance: { $sum: 1 },
            present: {
              $sum: {
                $cond: [
                  { $eq: ['$status', ATTENDANCE_STATUS.PRESENT] },
                  1,
                  0
                ]
              }
            },
            averageParticipationScore: { $avg: '$participationScore' }
          }
        }
      ]),
      ActionItem.aggregate([
        {
          $match: {
            dueDate: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            totalActionItems: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [
                  { $eq: ['$status', ACTION_ITEM_STATUS.COMPLETED] },
                  1,
                  0
                ]
              }
            },
            averageCompletion: { $avg: '$completionPercentage' }
          }
        }
      ])
    ]);

    return {
      meetings: meetingStats[0] || {},
      agendas: agendaStats[0] || {},
      attendance: attendanceStats[0] || {},
      actionItems: actionItemStats[0] || {}
    };
  }

  // Get department meeting performance
  static async getDepartmentMeetingPerformance(departmentId, startDate, endDate) {
    const [meetingStats, attendanceStats, actionItemStats] = await Promise.all([
      Meeting.aggregate([
        {
          $match: {
            department: departmentId,
            startTime: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            totalMeetings: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            averageDuration: { $avg: '$duration' }
          }
        }
      ]),
      MeetingAttendance.aggregate([
        {
          $match: {
            checkIn: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $lookup: {
            from: 'meetings',
            localField: 'meeting',
            foreignField: '_id',
            as: 'meeting'
          }
        },
        {
          $unwind: '$meeting'
        },
        {
          $match: {
            'meeting.department': departmentId
          }
        },
        {
          $group: {
            _id: null,
            totalAttendance: { $sum: 1 },
            present: {
              $sum: {
                $cond: [
                  { $eq: ['$status', ATTENDANCE_STATUS.PRESENT] },
                  1,
                  0
                ]
              }
            },
            averageParticipationScore: { $avg: '$participationScore' }
          }
        }
      ]),
      ActionItem.aggregate([
        {
          $match: {
            assignedDepartment: departmentId,
            dueDate: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            totalActionItems: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [
                  { $eq: ['$status', ACTION_ITEM_STATUS.COMPLETED] },
                  1,
                  0
                ]
              }
            },
            overdue: {
              $sum: {
                $cond: [
                  { $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', ACTION_ITEM_STATUS.COMPLETED] }
                  ]},
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    return {
      meetings: meetingStats[0] || {},
      attendance: attendanceStats[0] || {},
      actionItems: actionItemStats[0] || {}
    };
  }
}

export default MeetingAggregation;
