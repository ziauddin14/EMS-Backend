import attendanceRepository from './attendance.repository.js';
import AttendanceUtils from './attendance.utils.js';
import AttendanceHelpers from './attendance.helpers.js';
import AppError from '../../core/errors/AppError.js';

class AttendanceDashboardService {
  async getEmployeeDashboard(employeeId) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.findOne({
      employee: employeeId,
      attendanceDate: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false
    }).populate('officeShift');

    const startOfWeek = AttendanceUtils.getStartOfWeek(today);
    const endOfWeek = AttendanceUtils.getEndOfWeek(today);
    const startOfMonth = AttendanceUtils.getStartOfMonth(today);
    const endOfMonth = AttendanceUtils.getEndOfMonth(today);

    const [weeklySummary, monthlySummary, currentStreak] = await Promise.all([
      this.getEmployeeSummary(employeeId, startOfWeek, endOfWeek),
      this.getEmployeeSummary(employeeId, startOfMonth, endOfMonth),
      this.calculateCurrentStreak(employeeId)
    ]);

    return {
      today: this.formatTodayAttendance(todayAttendance),
      weekly: weeklySummary,
      monthly: monthlySummary,
      currentStreak,
      employee: {
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        department: employee.department,
        officeShift: employee.officeShift
      }
    };
  }

  async getManagerDashboard(managerId, filters = {}) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const manager = await Employee.findById(managerId);
    if (!manager) {
      throw new AppError('Manager not found', 404);
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = AttendanceUtils.getStartOfWeek(today);
    const endOfWeek = AttendanceUtils.getEndOfWeek(today);
    const startOfMonth = AttendanceUtils.getStartOfMonth(today);
    const endOfMonth = AttendanceUtils.getEndOfMonth(today);

    const departmentId = manager.department || filters.departmentId;

    const [teamStats, lateEmployees, onBreakEmployees, pendingAdjustments, weeklyStats, monthlyStats] = await Promise.all([
      this.getTeamStatistics(departmentId, startOfDay, endOfDay),
      this.getLateEmployees(departmentId, startOfDay, endOfDay),
      this.getEmployeesOnBreak(departmentId),
      this.getPendingAdjustments(departmentId),
      this.getDepartmentSummary(departmentId, startOfWeek, endOfWeek),
      this.getDepartmentSummary(departmentId, startOfMonth, endOfMonth)
    ]);

    const [topPerformers, lowAttendanceEmployees] = await Promise.all([
      this.getTopPerformers(departmentId, startOfMonth, endOfMonth, 5),
      this.getLowAttendanceEmployees(departmentId, startOfMonth, endOfMonth, 5)
    ]);

    return {
      team: teamStats,
      lateEmployees,
      onBreakEmployees,
      pendingAdjustments,
      weekly: weeklyStats,
      monthly: monthlyStats,
      topPerformers,
      lowAttendanceEmployees,
      department: departmentId
    };
  }

  async getHRDashboard(filters = {}) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = AttendanceUtils.getStartOfWeek(today);
    const endOfWeek = AttendanceUtils.getEndOfWeek(today);
    const startOfMonth = AttendanceUtils.getStartOfMonth(today);
    const endOfMonth = AttendanceUtils.getEndOfMonth(today);

    const [orgStats, departmentStats, lateEmployees, halfDays, remoteEmployees, pendingApprovals, attendanceCorrections, trend, monthlyComparison] = await Promise.all([
      this.getOrganizationStatistics(startOfDay, endOfDay),
      this.getDepartmentWiseStatistics(startOfDay, endOfDay),
      this.getLateEmployees(null, startOfDay, endOfDay, 20),
      this.getHalfDays(startOfMonth, endOfMonth),
      this.getRemoteEmployees(startOfMonth, endOfMonth),
      this.getPendingApprovals(),
      this.getAttendanceCorrections(startOfMonth, endOfMonth),
      this.getAttendanceTrend(30),
      this.getMonthlyComparison(6)
    ]);

    return {
      organization: orgStats,
      departments: departmentStats,
      lateEmployees,
      halfDays,
      remoteEmployees,
      pendingApprovals,
      attendanceCorrections,
      trend,
      monthlyComparison
    };
  }

  async getCEODashboard(filters = {}) {
    const today = new Date();
    const startOfMonth = AttendanceUtils.getStartOfMonth(today);
    const endOfMonth = AttendanceUtils.getEndOfMonth(today);

    const [orgStats, departmentComparison, branchComparison, trend, monthlyGrowth, workingHoursTrend, overtimeTrend, ranking, heatmapData] = await Promise.all([
      this.getOrganizationStatistics(startOfMonth, endOfMonth),
      this.getDepartmentComparison(startOfMonth, endOfMonth),
      this.getBranchComparison(startOfMonth, endOfMonth),
      this.getAttendanceTrend(90),
      this.getMonthlyGrowth(12),
      this.getWorkingHoursTrend(90),
      this.getOvertimeTrend(90),
      this.getEmployeeRanking(startOfMonth, endOfMonth),
      this.getHeatmapData(startOfMonth, endOfMonth)
    ]);

    return {
      organization: orgStats,
      departments: departmentComparison,
      branches: branchComparison,
      trend,
      monthlyGrowth,
      workingHoursTrend,
      overtimeTrend,
      ranking,
      heatmapData
    };
  }

  async getEmployeeSummary(employeeId, startDate, endDate) {
    return await attendanceRepository.attendanceSummary(employeeId, startDate, endDate);
  }

  async getDepartmentSummary(departmentId, startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const employees = await Employee.find({ department: departmentId, isDeleted: false }).select('_id');
    const employeeIds = employees.map(e => e._id);

    const pipeline = [
      {
        $match: {
          employee: { $in: employeeIds },
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
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' }
        }
      }
    ];

    const result = await Attendance.aggregate(pipeline);
    const summary = result[0] || {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalWorkingMinutes: 0,
      totalOvertimeMinutes: 0
    };

    summary.attendancePercentage = summary.total > 0
      ? ((summary.present / summary.total) * 100).toFixed(2)
      : 0;
    summary.totalWorkingHours = (summary.totalWorkingMinutes / 60).toFixed(2);
    summary.totalOvertimeHours = (summary.totalOvertimeMinutes / 60).toFixed(2);

    return summary;
  }

  async getTeamStatistics(departmentId, startDate, endDate) {
    const summary = await this.getDepartmentSummary(departmentId, startDate, endDate);

    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const employees = await Employee.find({ department: departmentId, isDeleted: false }).select('_id');
    const employeeIds = employees.map(e => e._id);

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [teamPresent, teamAbsent, teamOnBreak] = await Promise.all([
      Attendance.countDocuments({
        employee: { $in: employeeIds },
        attendanceDate: { $gte: startOfDay, $lte: endOfDay },
        attendanceStatus: 'present',
        isDeleted: false
      }),
      Attendance.countDocuments({
        employee: { $in: employeeIds },
        attendanceDate: { $gte: startOfDay, $lte: endOfDay },
        attendanceStatus: 'absent',
        isDeleted: false
      }),
      Attendance.countDocuments({
        employee: { $in: employeeIds },
        attendanceDate: { $gte: startOfDay, $lte: endOfDay },
        'breaks.startTime': { $exists: true },
        'breaks.endTime': { $exists: false },
        isDeleted: false
      })
    ]);

    return {
      ...summary,
      teamPresent,
      teamAbsent,
      teamOnBreak,
      totalTeamMembers: employeeIds.length
    };
  }

  async getLateEmployees(departmentId, startDate, endDate, limit = 10) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      attendanceStatus: 'late',
      isDeleted: false
    };

    if (departmentId) {
      const employees = await Employee.find({ department: departmentId, isDeleted: false }).select('_id');
      matchStage.employee = { $in: employees.map(e => e._id) };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$employee',
          lateCount: { $sum: 1 },
          totalLateMinutes: { $sum: '$lateMinutes' },
          averageLateMinutes: { $avg: '$lateMinutes' }
        }
      },
      { $sort: { lateCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$employee.employeeId',
          name: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
          department: '$employee.department',
          lateCount: 1,
          totalLateMinutes: 1,
          averageLateMinutes: { $round: ['$averageLateMinutes', 2] }
        }
      }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async getEmployeesOnBreak(departmentId) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const matchStage = {
      attendanceDate: { $gte: startOfDay, $lte: endOfDay },
      'breaks.startTime': { $exists: true },
      'breaks.endTime': { $exists: false },
      isDeleted: false
    };

    if (departmentId) {
      const employees = await Employee.find({ department: departmentId, isDeleted: false }).select('_id');
      matchStage.employee = { $in: employees.map(e => e._id) };
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
        $project: {
          employeeId: '$employee.employeeId',
          name: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
          department: '$employee.department',
          checkIn: 1,
          breaks: 1
        }
      }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async getPendingAdjustments(departmentId) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const matchStage = {
      adjustmentRequested: true,
      approvalStatus: 'pending',
      isDeleted: false
    };

    if (departmentId) {
      const employees = await Employee.find({ department: departmentId, isDeleted: false }).select('_id');
      matchStage.employee = { $in: employees.map(e => e._id) };
    }

    return await Attendance.find(matchStage)
      .populate('employee')
      .populate('officeShift')
      .sort({ attendanceDate: -1 })
      .limit(20);
  }

  async getTopPerformers(departmentId, startDate, endDate, limit = 10) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isDeleted: false
    };

    if (departmentId) {
      const employees = await Employee.find({ department: departmentId, isDeleted: false }).select('_id');
      matchStage.employee = { $in: employees.map(e => e._id) };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$employee',
          presentDays: {
            $sum: {
              $cond: [
                { $in: ['$attendanceStatus', ['present', 'late', 'overtime']] },
                1,
                0
              ]
            }
          },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          onTimeDays: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          attendanceScore: {
            $add: [
              '$presentDays',
              { $multiply: ['$onTimeDays', 0.5] },
              { $divide: ['$totalOvertimeMinutes', 60] }
            ]
          }
        }
      },
      { $sort: { attendanceScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$employee.employeeId',
          name: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
          department: '$employee.department',
          presentDays: 1,
          totalWorkingHours: { $divide: ['$totalWorkingMinutes', 60] },
          totalOvertimeHours: { $divide: ['$totalOvertimeMinutes', 60] },
          attendanceScore: 1
        }
      }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async getLowAttendanceEmployees(departmentId, startDate, endDate, limit = 10) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isDeleted: false
    };

    if (departmentId) {
      const employees = await Employee.find({ department: departmentId, isDeleted: false }).select('_id');
      matchStage.employee = { $in: employees.map(e => e._id) };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$employee',
          presentDays: {
            $sum: {
              $cond: [
                { $in: ['$attendanceStatus', ['present', 'late', 'overtime']] },
                1,
                0
              ]
            }
          },
          absentDays: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0]
            }
          },
          lateDays: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0]
            }
          },
          totalDays: { $sum: 1 }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100]
          }
        }
      },
      { $sort: { attendancePercentage: 1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$employee.employeeId',
          name: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
          department: '$employee.department',
          presentDays: 1,
          absentDays: 1,
          lateDays: 1,
          totalDays: 1,
          attendancePercentage: { $round: ['$attendancePercentage', 2] }
        }
      }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async getOrganizationStatistics(startDate, endDate) {
    return await attendanceRepository.attendanceStatistics({
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
  }

  async getDepartmentWiseStatistics(startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

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
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100]
          }
        }
      },
      { $sort: { attendancePercentage: -1 } }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async getHalfDays(startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;

    return await Attendance.find({
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      attendanceStatus: 'half_day',
      isDeleted: false
    })
      .populate('employee')
      .populate('officeShift')
      .sort({ attendanceDate: -1 })
      .limit(50);
  }

  async getRemoteEmployees(startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;

    return await Attendance.find({
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      'location.type': { $in: ['remote', 'field', 'client_site'] },
      isDeleted: false
    })
      .populate('employee')
      .populate('officeShift')
      .sort({ attendanceDate: -1 })
      .limit(50);
  }

  async getPendingApprovals() {
    return await attendanceRepository.findPendingApprovals();
  }

  async getAttendanceCorrections(startDate, endDate) {
    return await attendanceRepository.findAdjustmentRequests();
  }

  async getAttendanceTrend(days = 30) {
    const Attendance = (await import('./attendance.model.js')).default;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
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
            $dateToString: { format: '%Y-%m-%d', date: '$attendanceDate' }
          },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          workingMinutes: { $sum: '$workingMinutes' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async getMonthlyComparison(months = 6) {
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
          workingMinutes: { $sum: '$workingMinutes' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async getDepartmentComparison(startDate, endDate) {
    return await this.getDepartmentWiseStatistics(startDate, endDate);
  }

  async getBranchComparison(startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

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
          _id: '$employee.branch',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100]
          }
        }
      },
      { $sort: { attendancePercentage: -1 } }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async getMonthlyGrowth(months = 12) {
    return await this.getMonthlyComparison(months);
  }

  async getWorkingHoursTrend(days = 90) {
    const trend = await this.getAttendanceTrend(days);
    return trend.map(item => ({
      date: item._id,
      workingHours: (item.workingMinutes / 60).toFixed(2)
    }));
  }

  async getOvertimeTrend(days = 90) {
    const Attendance = (await import('./attendance.model.js')).default;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          attendanceDate: { $gte: startDate },
          overtimeMinutes: { $gt: 0 },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$attendanceDate' }
          },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          employeeCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async getEmployeeRanking(startDate, endDate) {
    return await this.getTopPerformers(null, startDate, endDate, 20);
  }

  async getHeatmapData(startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

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
          _id: {
            employeeId: '$employee.employeeId',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$attendanceDate' } }
          },
          status: { $first: '$attendanceStatus' },
          employeeName: { $first: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] } }
        }
      },
      {
        $project: {
          employeeId: '$_id.employeeId',
          date: '$_id.date',
          status: 1,
          employeeName: 1
        }
      },
      { $sort: { employeeId: 1, date: 1 } }
    ];

    return await Attendance.aggregate(pipeline);
  }

  async calculateCurrentStreak(employeeId) {
    const Attendance = (await import('./attendance.model.js')).default;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (true) {
      const startOfDay = new Date(currentDate);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const attendance = await Attendance.findOne({
        employee: employeeId,
        attendanceDate: { $gte: startOfDay, $lte: endOfDay },
        attendanceStatus: { $in: ['present', 'late', 'overtime'] },
        isDeleted: false
      });

      if (attendance) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }

      if (streak > 365) break;
    }

    return streak;
  }

  formatTodayAttendance(attendance) {
    if (!attendance) {
      return {
        status: 'not_checked_in',
        checkIn: null,
        checkOut: null,
        workingHours: 0,
        breakHours: 0,
        netWorkingHours: 0,
        lateMinutes: 0,
        earlyExit: 0,
        overtime: 0
      };
    }

    const breakSummary = AttendanceHelpers.formatBreakSummary(attendance.breaks);

    return {
      status: attendance.attendanceStatus,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      workingHours: attendance.workingHours || 0,
      breakHours: (breakSummary.totalBreakMinutes / 60).toFixed(2),
      netWorkingHours: ((attendance.workingMinutes || 0) - breakSummary.totalBreakMinutes) / 60,
      lateMinutes: attendance.lateMinutes || 0,
      earlyExit: attendance.earlyExitMinutes || 0,
      overtime: attendance.overtimeMinutes || 0,
      location: attendance.location,
      device: attendance.device
    };
  }
}

export default new AttendanceDashboardService();
