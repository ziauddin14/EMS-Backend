import Attendance from './attendance.model.js';

class AttendanceRepository {
  async create(attendanceData) {
    return Attendance.create(attendanceData);
  }

  async findById(id) {
    return Attendance.findById(id).populate('employee').populate('officeShift');
  }

  async findByIdWithoutPopulate(id) {
    return Attendance.findById(id);
  }

  async findAll(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return Attendance.find(query).populate('employee').populate('officeShift').sort({ attendanceDate: -1 });
    }
    return Attendance.find({ ...query, isDeleted: false }).populate('employee').populate('officeShift').sort({ attendanceDate: -1 });
  }

  async findOne(query, includeDeleted = false) {
    if (includeDeleted) {
      return Attendance.findOne(query).populate('employee').populate('officeShift');
    }
    return Attendance.findOne({ ...query, isDeleted: false }).populate('employee').populate('officeShift');
  }

  async updateById(id, updateData) {
    return Attendance.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate('employee').populate('officeShift');
  }

  async softDeleteById(id, deletedBy) {
    return Attendance.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async restoreById(id) {
    return Attendance.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).populate('employee').populate('officeShift');
  }

  async deleteById(id) {
    return this.softDeleteById(id);
  }

  async exists(query) {
    return Attendance.exists({ ...query, isDeleted: false });
  }

  async count(query = {}) {
    return Attendance.countDocuments({ ...query, isDeleted: false });
  }

  async findActive() {
    return Attendance.find({ isDeleted: false }).populate('employee').populate('officeShift').sort({ attendanceDate: -1 });
  }

  async findByEmployee(employeeId) {
    return Attendance.findByEmployee(employeeId).populate('officeShift');
  }

  async findByEmployeeAndDate(employeeId, attendanceDate) {
    return Attendance.findByEmployeeAndDate(employeeId, attendanceDate).populate('officeShift');
  }

  async findByDateRange(startDate, endDate) {
    return Attendance.findByDateRange(startDate, endDate).populate('employee').populate('officeShift');
  }

  async findByShift(shiftId) {
    return Attendance.findByShift(shiftId).populate('employee');
  }

  async findByStatus(status) {
    return Attendance.findByStatus(status).populate('employee').populate('officeShift');
  }

  async findByApprovalStatus(approvalStatus) {
    return Attendance.findByApprovalStatus(approvalStatus).populate('employee').populate('officeShift');
  }

  async findPendingApprovals() {
    return Attendance.findPendingApprovals().populate('employee').populate('officeShift');
  }

  async findAdjustmentRequests() {
    return Attendance.findAdjustmentRequests().populate('employee').populate('officeShift');
  }

  async countByEmployee(employeeId) {
    return Attendance.countByEmployee(employeeId);
  }

  async countByStatus(status) {
    return Attendance.countByStatus(status);
  }

  async countByDate(date) {
    return Attendance.countByDate(date);
  }

  async existsForEmployeeAndDate(employeeId, attendanceDate) {
    return Attendance.existsForEmployeeAndDate(employeeId, attendanceDate);
  }

  async findWithPagination(query, options = {}) {
    const { page = 1, limit = 10, sort = { attendanceDate: -1 } } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Attendance.find({ ...query, isDeleted: false })
        .populate('employee')
        .populate('officeShift')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments({ ...query, isDeleted: false })
    ]);

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: parseInt(page) < Math.ceil(total / limit),
        hasPrevious: parseInt(page) > 1
      }
    };
  }

  async bulkCreate(attendanceDataArray) {
    return Attendance.insertMany(attendanceDataArray);
  }

  async bulkUpdate(filter, updateData) {
    return Attendance.updateMany(
      { ...filter, isDeleted: false },
      updateData,
      { runValidators: true }
    );
  }

  async bulkDelete(filter, deletedBy) {
    return Attendance.updateMany(
      { ...filter, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy }
    );
  }

  async checkEmployeeAttendance(employeeId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Attendance.findOne({
      employee: employeeId,
      attendanceDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      isDeleted: false
    }).populate('officeShift');
  }

  async findTodayAttendance(employeeId) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return Attendance.findOne({
      employee: employeeId,
      attendanceDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      isDeleted: false
    }).populate('employee').populate('officeShift');
  }

  async findBetweenDates(employeeId, startDate, endDate) {
    return Attendance.find({
      employee: employeeId,
      attendanceDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      isDeleted: false
    }).populate('officeShift').sort({ attendanceDate: 1 });
  }

  async monthlyAttendance(employeeId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return Attendance.find({
      employee: employeeId,
      attendanceDate: {
        $gte: startDate,
        $lte: endDate
      },
      isDeleted: false
    }).populate('officeShift').sort({ attendanceDate: 1 });
  }

  async employeeAttendance(employeeId, options = {}) {
    const { startDate, endDate, limit = 100, skip = 0 } = options;
    const query = { employee: employeeId, isDeleted: false };

    if (startDate && endDate) {
      query.attendanceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    return Attendance.find(query)
      .populate('officeShift')
      .sort({ attendanceDate: -1 })
      .limit(limit)
      .skip(skip);
  }

  async departmentAttendance(departmentId, options = {}) {
    const { startDate, endDate } = options;
    const query = { isDeleted: false };

    if (startDate && endDate) {
      query.attendanceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    return Attendance.find(query)
      .populate({
        path: 'employee',
        match: { department: departmentId, isDeleted: false }
      })
      .populate('officeShift')
      .sort({ attendanceDate: -1 });
  }

  async attendanceStatistics(filters = {}) {
    const pipeline = [
      { $match: { isDeleted: false, ...filters } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0]
            }
          },
          late: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0]
            }
          },
          halfDay: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'half_day'] }, 1, 0]
            }
          },
          leave: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'leave'] }, 1, 0]
            }
          },
          holiday: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'holiday'] }, 1, 0]
            }
          },
          weekend: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'weekend'] }, 1, 0]
            }
          },
          overtime: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'overtime'] }, 1, 0]
            }
          },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          totalLateMinutes: { $sum: '$lateMinutes' },
          totalEarlyExitMinutes: { $sum: '$earlyExitMinutes' }
        }
      }
    ];

    const result = await Attendance.aggregate(pipeline);
    return result[0] || {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      leave: 0,
      holiday: 0,
      weekend: 0,
      overtime: 0,
      totalWorkingMinutes: 0,
      totalOvertimeMinutes: 0,
      totalLateMinutes: 0,
      totalEarlyExitMinutes: 0
    };
  }

  async attendanceSummary(employeeId, startDate, endDate) {
    const query = {
      employee: employeeId,
      attendanceDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      isDeleted: false
    };

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0]
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
          halfDays: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'half_day'] }, 1, 0]
            }
          },
          holidayCount: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'holiday'] }, 1, 0]
            }
          },
          weekendCount: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'weekend'] }, 1, 0]
            }
          },
          totalWorkingMinutes: { $sum: '$workingMinutes' },
          totalOvertimeMinutes: { $sum: '$overtimeMinutes' },
          totalBreakMinutes: { $sum: '$breakMinutes' },
          totalLateMinutes: { $sum: '$lateMinutes' },
          totalEarlyExitMinutes: { $sum: '$earlyExitMinutes' }
        }
      }
    ];

    const result = await Attendance.aggregate(pipeline);
    const summary = result[0] || {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      halfDays: 0,
      holidayCount: 0,
      weekendCount: 0,
      totalWorkingMinutes: 0,
      totalOvertimeMinutes: 0,
      totalBreakMinutes: 0,
      totalLateMinutes: 0,
      totalEarlyExitMinutes: 0
    };

    summary.attendancePercentage = summary.totalDays > 0
      ? ((summary.presentDays / summary.totalDays) * 100).toFixed(2)
      : 0;
    summary.averageWorkingHours = summary.totalDays > 0
      ? (summary.totalWorkingMinutes / summary.totalDays / 60).toFixed(2)
      : 0;
    summary.totalWorkingHours = (summary.totalWorkingMinutes / 60).toFixed(2);
    summary.totalOvertimeHours = (summary.totalOvertimeMinutes / 60).toFixed(2);

    return summary;
  }

  async attendanceTrend(employeeId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          employee: employeeId,
          attendanceDate: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$attendanceDate'
            }
          },
          count: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'absent'] }, 1, 0]
            }
          },
          late: {
            $sum: {
              $cond: [{ $eq: ['$attendanceStatus', 'late'] }, 1, 0]
            }
          },
          workingMinutes: { $sum: '$workingMinutes' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return Attendance.aggregate(pipeline);
  }

  async findActiveBreak(employeeId) {
    return Attendance.findOne({
      employee: employeeId,
      'breaks.startTime': { $exists: true },
      'breaks.endTime': { $exists: false },
      isDeleted: false
    });
  }

  async updateBreak(attendanceId, breakData) {
    return Attendance.findOneAndUpdate(
      { _id: attendanceId, isDeleted: false },
      { $push: { breaks: breakData } },
      { new: true }
    ).populate('employee').populate('officeShift');
  }

  async endBreak(attendanceId, breakIndex, endTime) {
    return Attendance.findOneAndUpdate(
      { _id: attendanceId, isDeleted: false },
      { $set: { [`breaks.${breakIndex}.endTime`]: endTime } },
      { new: true }
    ).populate('employee').populate('officeShift');
  }
}

export default new AttendanceRepository();
