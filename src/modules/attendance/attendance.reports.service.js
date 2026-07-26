import attendanceRepository from './attendance.repository.js';
import AttendanceUtils from './attendance.utils.js';
import AppError from '../../core/errors/AppError.js';

class AttendanceReportsService {
  async generateDailyReport(date, filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const matchStage = {
      attendanceDate: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    if (filters.branchId) {
      matchStage['employee.branch'] = filters.branchId;
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
          totalEmployees: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'half_day'] }, 1, 0] } },
          holiday: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'holiday'] }, 1, 0] } },
          weekend: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'weekend'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          totalLateMinutes: { $sum: '$lateMinutes' }
        }
      }
    ];

    const result = await Attendance.aggregate(pipeline);
    const summary = result[0] || {
      totalEmployees: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      holiday: 0,
      weekend: 0,
      totalWorkingMinutes: 0,
      totalOvertimeMinutes: 0,
      totalLateMinutes: 0
    };

    summary.attendancePercentage = summary.totalEmployees > 0
      ? ((summary.present / summary.totalEmployees) * 100).toFixed(2)
      : 0;
    summary.totalWorkingHours = (summary.totalWorkingMinutes / 60).toFixed(2);
    summary.totalOvertimeHours = (summary.totalOvertimeMinutes / 60).toFixed(2);

    return {
      reportType: 'daily',
      date: date,
      summary,
      generatedAt: new Date()
    };
  }

  async generateWeeklyReport(startDate, endDate, filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    if (filters.branchId) {
      matchStage['employee.branch'] = filters.branchId;
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
            date: { $dateToString: { format: '%Y-%m-%d', date: '$attendanceDate' } }
          },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'half_day'] }, 1, 0] } },
          workingMinutes: { $sum: '$workingMinutes' },
          overtimeMinutes: { $sum: '$overtimeMinutes' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const dailyData = await Attendance.aggregate(pipeline);

    const summary = dailyData.reduce((acc, day) => {
      acc.total += day.total;
      acc.present += day.present;
      acc.absent += day.absent;
      acc.late += day.late;
      acc.halfDay += day.halfDay;
      acc.totalWorkingMinutes += day.workingMinutes;
      acc.totalOvertimeMinutes += day.overtimeMinutes;
      return acc;
    }, {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalWorkingMinutes: 0,
      totalOvertimeMinutes: 0
    });

    summary.attendancePercentage = summary.total > 0
      ? ((summary.present / summary.total) * 100).toFixed(2)
      : 0;
    summary.totalWorkingHours = (summary.totalWorkingMinutes / 60).toFixed(2);
    summary.totalOvertimeHours = (summary.totalOvertimeMinutes / 60).toFixed(2);

    return {
      reportType: 'weekly',
      startDate,
      endDate,
      dailyData,
      summary,
      generatedAt: new Date()
    };
  }

  async generateMonthlyReport(year, month, filters = {}) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return await this.generateWeeklyReport(startDate, endDate, filters);
  }

  async generateEmployeeReport(employeeId, startDate, endDate) {
    const Employee = (await import('../employee/employee.model.js')).default;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const summary = await attendanceRepository.attendanceSummary(employeeId, startDate, endDate);
    const attendances = await attendanceRepository.findBetweenDates(employeeId, startDate, endDate);

    return {
      reportType: 'employee',
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        branch: employee.branch
      },
      period: { startDate, endDate },
      summary,
      attendances,
      generatedAt: new Date()
    };
  }

  async generateDepartmentReport(departmentId, startDate, endDate) {
    const summary = await attendanceRepository.departmentAttendance(departmentId, { startDate, endDate });
    const statistics = await attendanceRepository.attendanceStatistics({
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    return {
      reportType: 'department',
      departmentId,
      period: { startDate, endDate },
      summary,
      statistics,
      generatedAt: new Date()
    };
  }

  async generateBranchReport(branchId, startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;

    const employees = await Employee.find({ branch: branchId, isDeleted: false }).select('_id');
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

    return {
      reportType: 'branch',
      branchId,
      period: { startDate, endDate },
      summary,
      generatedAt: new Date()
    };
  }

  async generateShiftReport(shiftId, startDate, endDate) {
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
      totalOvertimeMinutes: 0,
      totalLateMinutes: 0,
      totalEarlyExitMinutes: 0
    };

    summary.attendancePercentage = summary.total > 0
      ? ((summary.present / summary.total) * 100).toFixed(2)
      : 0;
    summary.totalWorkingHours = (summary.totalWorkingMinutes / 60).toFixed(2);
    summary.totalOvertimeHours = (summary.totalOvertimeMinutes / 60).toFixed(2);

    return {
      reportType: 'shift',
      shiftId,
      period: { startDate, endDate },
      summary,
      generatedAt: new Date()
    };
  }

  async generateLateReport(startDate, endDate, filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      attendanceStatus: 'late',
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    const attendances = await Attendance.find(matchStage)
      .populate('employee')
      .populate('officeShift')
      .sort({ attendanceDate: 1 });

    const summary = attendances.reduce((acc, att) => {
      acc.total += 1;
      acc.totalLateMinutes += att.lateMinutes || 0;
      return acc;
    }, { total: 0, totalLateMinutes: 0 });

    summary.averageLateMinutes = summary.total > 0
      ? (summary.totalLateMinutes / summary.total).toFixed(2)
      : 0;

    return {
      reportType: 'late',
      period: { startDate, endDate },
      summary,
      details: attendances,
      generatedAt: new Date()
    };
  }

  async generateOvertimeReport(startDate, endDate, filters = {}) {
    const Attendance = (await import('./attendance.model.js')).default;

    const matchStage = {
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      overtimeMinutes: { $gt: 0 },
      isDeleted: false
    };

    if (filters.departmentId) {
      matchStage['employee.department'] = filters.departmentId;
    }

    const attendances = await Attendance.find(matchStage)
      .populate('employee')
      .populate('officeShift')
      .sort({ overtimeMinutes: -1 });

    const summary = attendances.reduce((acc, att) => {
      acc.total += 1;
      acc.totalOvertimeMinutes += att.overtimeMinutes || 0;
      return acc;
    }, { total: 0, totalOvertimeMinutes: 0 });

    summary.averageOvertimeMinutes = summary.total > 0
      ? (summary.totalOvertimeMinutes / summary.total).toFixed(2)
      : 0;
    summary.totalOvertimeHours = (summary.totalOvertimeMinutes / 60).toFixed(2);

    return {
      reportType: 'overtime',
      period: { startDate, endDate },
      summary,
      details: attendances,
      generatedAt: new Date()
    };
  }

  async generateHolidayReport(startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;

    const attendances = await Attendance.find({
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isHoliday: true,
      isDeleted: false
    })
      .populate('employee')
      .populate('officeShift')
      .sort({ attendanceDate: 1 });

    return {
      reportType: 'holiday',
      period: { startDate, endDate },
      total: attendances.length,
      details: attendances,
      generatedAt: new Date()
    };
  }

  async generateWeekendReport(startDate, endDate) {
    const Attendance = (await import('./attendance.model.js')).default;

    const attendances = await Attendance.find({
      attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isWeekend: true,
      isDeleted: false
    })
      .populate('employee')
      .populate('officeShift')
      .sort({ attendanceDate: 1 });

    return {
      reportType: 'weekend',
      period: { startDate, endDate },
      total: attendances.length,
      details: attendances,
      generatedAt: new Date()
    };
  }

  async generateAttendanceAdjustmentReport(startDate, endDate) {
    const attendances = await attendanceRepository.findAdjustmentRequests();

    const filtered = attendances.filter(att => {
      const attDate = new Date(att.attendanceDate);
      return attDate >= new Date(startDate) && attDate <= new Date(endDate);
    });

    const summary = filtered.reduce((acc, att) => {
      acc.total += 1;
      if (att.approvalStatus === 'pending') acc.pending += 1;
      if (att.approvalStatus === 'approved') acc.approved += 1;
      if (att.approvalStatus === 'rejected') acc.rejected += 1;
      return acc;
    }, { total: 0, pending: 0, approved: 0, rejected: 0 });

    return {
      reportType: 'adjustment',
      period: { startDate, endDate },
      summary,
      details: filtered,
      generatedAt: new Date()
    };
  }

  async generateSummaryReport(startDate, endDate, filters = {}) {
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
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'half_day'] }, 1, 0] } },
          holiday: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'holiday'] }, 1, 0] } },
          weekend: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'weekend'] }, 1, 0] } },
          overtime: { $sum: { $cond: [{ $eq: ['$attendanceStatus', 'overtime'] }, 1, 0] } },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          totalLateMinutes: { $sum: '$lateMinutes' },
          totalEarlyExitMinutes: { $sum: '$earlyExitMinutes' },
          totalBreakMinutes: { $sum: '$breakMinutes' }
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
      holiday: 0,
      weekend: 0,
      overtime: 0,
      totalWorkingMinutes: 0,
      totalOvertimeMinutes: 0,
      totalLateMinutes: 0,
      totalEarlyExitMinutes: 0,
      totalBreakMinutes: 0
    };

    summary.attendancePercentage = summary.total > 0
      ? ((summary.present / summary.total) * 100).toFixed(2)
      : 0;
    summary.totalWorkingHours = (summary.totalWorkingMinutes / 60).toFixed(2);
    summary.totalOvertimeHours = (summary.totalOvertimeMinutes / 60).toFixed(2);
    summary.averageWorkingHours = summary.total > 0
      ? (summary.totalWorkingMinutes / summary.total / 60).toFixed(2)
      : 0;

    return {
      reportType: 'summary',
      period: { startDate, endDate },
      summary,
      generatedAt: new Date()
    };
  }

  prepareExportData(report, format = 'json') {
    const exportData = {
      reportType: report.reportType,
      generatedAt: report.generatedAt,
      data: report
    };

    if (format === 'csv') {
      return this.convertToCSV(report);
    }

    if (format === 'excel') {
      return this.convertToExcel(report);
    }

    if (format === 'pdf') {
      return this.convertToPDF(report);
    }

    return exportData;
  }

  convertToCSV(report) {
    return {
      format: 'csv',
      data: report,
      headers: this.getCSVHeaders(report.reportType)
    };
  }

  convertToExcel(report) {
    return {
      format: 'excel',
      data: report,
      worksheets: this.getExcelWorksheets(report.reportType)
    };
  }

  convertToPDF(report) {
    return {
      format: 'pdf',
      data: report,
      template: this.getPDFTemplate(report.reportType)
    };
  }

  getCSVHeaders(reportType) {
    const headers = {
      daily: ['Date', 'Total', 'Present', 'Absent', 'Late', 'Half Day', 'Working Hours'],
      weekly: ['Date', 'Total', 'Present', 'Absent', 'Late', 'Half Day', 'Working Hours'],
      monthly: ['Date', 'Total', 'Present', 'Absent', 'Late', 'Half Day', 'Working Hours'],
      employee: ['Employee ID', 'Name', 'Date', 'Status', 'Check In', 'Check Out', 'Working Hours'],
      department: ['Department', 'Total', 'Present', 'Absent', 'Late', 'Working Hours'],
      shift: ['Shift', 'Total', 'Present', 'Absent', 'Late', 'Working Hours'],
      late: ['Employee ID', 'Name', 'Date', 'Late Minutes', 'Shift'],
      overtime: ['Employee ID', 'Name', 'Date', 'Overtime Minutes', 'Shift']
    };

    return headers[reportType] || [];
  }

  getExcelWorksheets(reportType) {
    return [
      {
        name: 'Summary',
        data: []
      },
      {
        name: 'Details',
        data: []
      }
    ];
  }

  getPDFTemplate(reportType) {
    return `attendance_${reportType}_template`;
  }
}

export default new AttendanceReportsService();
