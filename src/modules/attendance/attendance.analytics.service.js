import attendanceRepository from './attendance.repository.js';
import AttendanceUtils from './attendance.utils.js';
import AppError from '../../core/errors/AppError.js';

class AttendanceAnalyticsService {
  async getOverviewAnalytics(filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const today = new Date();
    const startOfMonth = AttendanceUtils.getStartOfMonth(today);
    const endOfMonth = AttendanceUtils.getEndOfMonth(today);

    const matchStage = {
      attendanceDate: { $gte: startOfMonth, $lte: endOfMonth },
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: null,
          totalEmployees: { $addToSet: '$employee._id' },
          totalAttendance: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'half_day'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          totalLateMinutes: { $sum: '$lateMinutes' },
          totalBreakMinutes: { $sum: '$breakMinutes' }
        }
      },
      {
        $project: {
          totalEmployees: { $size: '$totalEmployees' },
          totalAttendance: 1,
          present: 1,
          absent: 1,
          late: 1,
          halfDay: 1,
          totalWorkingMinutes: 1,
          totalOvertimeMinutes: 1,
          totalLateMinutes: 1,
          totalBreakMinutes: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$totalAttendance'] }, 100]
          },
          averageWorkingHours: {
            $divide: [{ $divide: ['$totalWorkingMinutes', '$totalAttendance'] }, 60]
          },
          averageLateTime: {
            $divide: ['$totalLateMinutes', '$late']
          },
          averageBreakTime: {
            $divide: ['$totalBreakMinutes', '$totalAttendance']
          }
        }
      }
    ];

    const result = await Attendance.aggregate(pipeline);
    const overview = result[0] || {
      totalEmployees: 0,
      totalAttendance: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalWorkingMinutes: 0,
      totalOvertimeMinutes: 0,
      totalLateMinutes: 0,
      totalBreakMinutes: 0,
      attendancePercentage: 0,
      averageWorkingHours: 0,
      averageLateTime: 0,
      averageBreakTime: 0
    };

    return {
      period: { startDate: startOfMonth, endDate: endOfMonth },
      overview: {
        ...overview,
        attendancePercentage: overview.attendancePercentage.toFixed(2),
        averageWorkingHours: overview.averageWorkingHours.toFixed(2),
        averageLateTime: overview.averageLateTime.toFixed(2),
        averageBreakTime: overview.averageBreakTime.toFixed(2)
      }
    };
  }

  async getTrendAnalytics(days = 90, filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const matchStage = {
      attendanceDate: { $gte: startDate },
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$attendanceDate' },
            month: { $month: '$attendanceDate' },
            day: { $dayOfMonth: '$attendanceDate' }
          },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          workingMinutes: { $sum: '$workingMinutes' },
          overtimeMinutes: { $sum: '$overtimeMinutes' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          workingMinutes: 1,
          overtimeMinutes: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100]
          }
        }
      }
    ];

    const trendData = await Attendance.aggregate(pipeline);

    return {
      period: { startDate, endDate: new Date() },
      trend: trendData.map(item => ({
        ...item,
        attendancePercentage: item.attendancePercentage.toFixed(2)
      }))
    };
  }

  async getLeaderboardAnalytics(startDate, endDate, filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee',
          employeeId: { $first: '$employee.employeeId' },
          name: { $first: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] } },
          department: { $first: '$employee.department' },
          presentDays: {
            $sum: {
              $cond: [
                { $in: ['$attendanceStatus', ['present', 'late', 'overtime']] },
                1,
                0
              ]
            }
          },
          totalDays: { $sum: 1 },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          onTimeDays: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0]
            }
          },
          lateDays: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100]
          },
          averageWorkingHours: {
            $divide: [{ $divide: ['$totalWorkingMinutes', '$totalDays'] }, 60]
          },
          performanceScore: {
            $add: [
              { $multiply: ['$attendancePercentage', 0.4] },
              { $multiply: ['$onTimeDays', 0.3] },
              { $multiply: [{ $divide: ['$totalOvertimeMinutes', 60] }, 0.2] },
              { $multiply: [{ $subtract: [100, '$lateDays'] }, 0.1] }
            ]
          }
        }
      },
      { $sort: { performanceScore: -1 } },
      {
        $project: {
          employeeId: 1,
          name: 1,
          department: 1,
          presentDays: 1,
          totalDays: 1,
          attendancePercentage: { $round: ['$attendancePercentage', 2] },
          averageWorkingHours: { $round: ['$averageWorkingHours', 2] },
          totalOvertimeHours: { $divide: ['$totalOvertimeMinutes', 60] },
          performanceScore: { $round: ['$performanceScore', 2] }
        }
      }
    ];

    const leaderboard = await Attendance.aggregate(pipeline);

    return {
      period: { startDate, endDate },
      leaderboard: leaderboard.map((item, index) => ({
        rank: index + 1,
        ...item
      }))
    };
  }

  async getHeatmapAnalytics(startDate, endDate, filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: {
            employeeId: '$employee.employeeId',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$attendanceDate' } }
          },
          status: { $first: '$attendanceStatus' },
          employeeName: { $first: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] } },
          workingMinutes: { $first: '$workingMinutes' }
        }
      },
      {
        $project: {
          employeeId: '$_id.employeeId',
          date: '$_id.date',
          status: 1,
          employeeName: 1,
          workingMinutes: 1,
          intensity: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'present'] }, then: 4 },
                { case: { $eq: ['$status', 'late'] }, then: 3 },
                { case: { $eq: ['$status', 'half_day'] }, then: 2 },
                { case: { $eq: ['$status', 'absent'] }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },
      { $sort: { employeeId: 1, date: 1 } }
    ];

    const heatmapData = await Attendance.aggregate(pipeline);

    return {
      period: { startDate, endDate },
      heatmapData
    };
  }

  async getOvertimeAnalytics(startDate, endDate, filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      overtimeMinutes: { $gt: 0 },
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: {
            year: { $year: '$attendanceDate' },
            month: { $month: '$attendanceDate' },
            week: { $week: '$attendanceDate' }
          },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          employeeCount: { $sum: 1 },
          averageOvertimeMinutes: { $avg: '$overtimeMinutes' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' },
              '-W',
              { $toString: '$_id.week' }
            ]
          },
          totalOvertimeHours: { $divide: ['$totalOvertimeMinutes', 60] },
          employeeCount: 1,
          averageOvertimeHours: { $divide: ['$averageOvertimeMinutes', 60] }
        }
      }
    ];

    const overtimeData = await Attendance.aggregate(pipeline);

    const employeePipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee',
          employeeId: { $first: '$employee.employeeId' },
          name: { $first: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] } },
          department: { $first: '$employee.department' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          overtimeDays: { $sum: 1 },
          averageOvertimeMinutes: { $avg: '$overtimeMinutes' }
        }
      },
      { $sort: { totalOvertimeMinutes: -1 } },
      { $limit: 20 },
      {
        $project: {
          employeeId: 1,
          name: 1,
          department: 1,
          totalOvertimeHours: { $divide: ['$totalOvertimeMinutes', 60] },
          overtimeDays: 1,
          averageOvertimeHours: { $divide: ['$averageOvertimeMinutes', 60] }
        }
      }
    ];

    const topOvertimeEmployees = await Attendance.aggregate(employeePipeline);

    return {
      period: { startDate, endDate },
      weeklyTrend: overtimeData,
      topEmployees: topOvertimeEmployees
    };
  }

  async getLateAnalytics(startDate, endDate, filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      attendanceStatus: 'late',
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: {
            year: { $year: '$attendanceDate' },
            month: { $month: '$attendanceDate' },
            week: { $week: '$attendanceDate' }
          },
          totalLateMinutes: { $sum: '$lateMinutes' },
          employeeCount: { $sum: 1 },
          averageLateMinutes: { $avg: '$lateMinutes' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' },
              '-W',
              { $toString: '$_id.week' }
            ]
          },
          totalLateMinutes: 1,
          employeeCount: 1,
          averageLateMinutes: { $round: ['$averageLateMinutes', 2] }
        }
      }
    ];

    const lateData = await Attendance.aggregate(pipeline);

    const employeePipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee',
          employeeId: { $first: '$employee.employeeId' },
          name: { $first: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] } },
          department: { $first: '$employee.department' },
          totalLateMinutes: { $sum: '$lateMinutes' },
          lateDays: { $sum: 1 },
          averageLateMinutes: { $avg: '$lateMinutes' }
        }
      },
      { $sort: { lateDays: -1 } },
      { $limit: 20 },
      {
        $project: {
          employeeId: 1,
          name: 1,
          department: 1,
          totalLateMinutes: 1,
          lateDays: 1,
          averageLateMinutes: { $round: ['$averageLateMinutes', 2] }
        }
      }
    ];

    const topLateEmployees = await Attendance.aggregate(employeePipeline);

    return {
      period: { startDate, endDate },
      weeklyTrend: lateData,
      topEmployees: topLateEmployees
    };
  }

  async getDepartmentAnalytics(startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;

    const pipeline = [
      {
        $match: {
          attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee.department',
          totalEmployees: { $addToSet: '$employee._id' },
          totalAttendance: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'half_day'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' }
        }
      },
      {
        $project: {
          department: '$_id',
          totalEmployees: { $size: '$totalEmployees' },
          totalAttendance: 1,
          present: 1,
          absent: 1,
          late: 1,
          halfDay: 1,
          totalWorkingMinutes: 1,
          totalOvertimeMinutes: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$totalAttendance'] }, 100]
          },
          averageWorkingHours: {
            $divide: [{ $divide: ['$totalWorkingMinutes', '$totalAttendance'] }, 60]
          }
        }
      },
      { $sort: { attendancePercentage: -1 } }
    ];

    const departmentData = await Attendance.aggregate(pipeline);

    return {
      period: { startDate, endDate },
      departments: departmentData.map(item => ({
        ...item,
        attendancePercentage: item.attendancePercentage.toFixed(2),
        averageWorkingHours: item.averageWorkingHours.toFixed(2)
      }))
    };
  }

  async getEmployeeAnalytics(employeeId, startDate, endDate) {
    const Employee = (await import('../employee/employee.model.js')).default;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const summary = await attendanceRepository.attendanceSummary(employeeId, startDate, endDate);
    const trend = await attendanceRepository.attendanceTrend(employeeId, 30);

    return {
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department
      },
      period: { startDate, endDate },
      summary,
      trend
    };
  }

  async getShiftAnalytics(shiftId, startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;

    const pipeline = [
      {
        $match: {
          officeShift: shiftId,
          attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'half_day'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          totalLateMinutes: { $sum: '$lateMinutes' },
          totalEarlyExitMinutes: { $sum: '$earlyExitMinutes' }
        }
      },
      {
        $project: {
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          halfDay: 1,
          totalWorkingMinutes: 1,
          totalOvertimeMinutes: 1,
          totalLateMinutes: 1,
          totalEarlyExitMinutes: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100]
          },
          averageWorkingHours: {
            $divide: [{ $divide: ['$totalWorkingMinutes', '$total'] }, 60]
          },
          averageLateMinutes: { $divide: ['$totalLateMinutes', '$late'] }
        }
      }
    ];

    const result = await Attendance.aggregate(pipeline);
    const analytics = result[0] || {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalWorkingMinutes: 0,
      totalOvertimeMinutes: 0,
      totalLateMinutes: 0,
      totalEarlyExitMinutes: 0,
      attendancePercentage: 0,
      averageWorkingHours: 0,
      averageLateMinutes: 0
    };

    return {
      shiftId,
      period: { startDate, endDate },
      analytics: {
        ...analytics,
        attendancePercentage: analytics.attendancePercentage.toFixed(2),
        averageWorkingHours: analytics.averageWorkingHours.toFixed(2),
        averageLateMinutes: analytics.averageLateMinutes.toFixed(2)
      }
    };
  }

  async getMonthlyTrendAnalytics(months = 12) {
    const Attendance = (await import('./attendance.model.js')).default;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          attendanceDate: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$attendanceDate' },
            month: { $month: '$attendanceDate' }
          },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          totalWorkingMinutes: 1,
          totalOvertimeMinutes: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100]
          }
        }
      }
    ];

    const monthlyTrend = await Attendance.aggregate(pipeline);

    return {
      period: { startDate, endDate: new Date() },
      monthlyTrend: monthlyTrend.map(item => ({
        ...item,
        attendancePercentage: item.attendancePercentage.toFixed(2)
      }))
    };
  }

  async getWeeklyTrendAnalytics(weeks = 12) {
    const Attendance = (await import('./attendance.model.js')).default;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));
    startDate.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          attendanceDate: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$attendanceDate' },
            week: { $week: '$attendanceDate' }
          },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      {
        $project: {
          week: {
            $concat: [
              { $toString: '$_id.year' },
              '-W',
              { $toString: '$_id.week' }
            ]
          },
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          totalWorkingMinutes: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100]
          }
        }
      }
    ];

    const weeklyTrend = await Attendance.aggregate(pipeline);

    return {
      period: { startDate, endDate: new Date() },
      weeklyTrend: weeklyTrend.map(item => ({
        ...item,
        attendancePercentage: item.attendancePercentage.toFixed(2)
      }))
    };
  }

  async getYearlyTrendAnalytics(years = 5) {
    const Attendance = (await import('./attendance.model.js')).default;

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);
    startDate.setDate(1);
    startDate.setMonth(0);
    startDate.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          attendanceDate: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: { year: { $year: '$attendanceDate' } },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' }
        }
      },
      { $sort: { '_id.year': 1 } },
      {
        $project: {
          year: '$_id.year',
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          totalWorkingMinutes: 1,
          totalOvertimeMinutes: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100]
          }
        }
      }
    ];

    const yearlyTrend = await Attendance.aggregate(pipeline);

    return {
      period: { startDate, endDate: new Date() },
      yearlyTrend: yearlyTrend.map(item => ({
        ...item,
        attendancePercentage: item.attendancePercentage.toFixed(2)
      }))
    };
  }
}

export default new AttendanceAnalyticsService();
