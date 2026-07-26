import attendanceRepository from './attendance.repository.js';
import employeeRepository from '../employee/employee.repository.js';
import officeShiftRepository from './officeShift/officeShift.repository.js';
import attendancePolicyRepository from './attendancePolicy/attendancePolicy.repository.js';
import { ATTENDANCE_MESSAGES, ATTENDANCE_STATUS, APPROVAL_STATUS } from './attendance.constants.js';
import AttendanceUtils from './attendance.utils.js';
import AttendanceHelpers from './attendance.helpers.js';
import AppError from '../../core/errors/AppError.js';

class AttendanceService {
  async createAttendance(attendanceData, createdBy) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const OfficeShift = (await import('./officeShift/officeShift.model.js')).default;

    const employeeExists = await Employee.exists({ _id: attendanceData.employee, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found or inactive', 404);
    }

    if (attendanceData.officeShift) {
      const shiftExists = await OfficeShift.exists({ _id: attendanceData.officeShift, isDeleted: false });
      if (!shiftExists) {
        throw new AppError('Office shift not found or inactive', 404);
      }
    }

    if (AttendanceUtils.isFutureDate(attendanceData.attendanceDate)) {
      throw new AppError('Future attendance records are not allowed', 400);
    }

    const existingAttendance = await attendanceRepository.existsForEmployeeAndDate(
      attendanceData.employee,
      attendanceData.attendanceDate
    );
    if (existingAttendance) {
      throw new AppError(ATTENDANCE_MESSAGES.ATTENDANCE_ALREADY_EXISTS, 409);
    }

    if (attendanceData.checkIn && attendanceData.checkOut) {
      const checkInTime = new Date(attendanceData.checkIn);
      const checkOutTime = new Date(attendanceData.checkOut);
      if (checkOutTime < checkInTime) {
        throw new AppError(ATTENDANCE_MESSAGES.CHECK_OUT_BEFORE_CHECK_IN, 400);
      }
    }

    const attendance = await attendanceRepository.create({
      ...attendanceData,
      createdBy
    });

    return attendance;
  }

  async updateAttendance(attendanceId, updateData, updatedBy) {
    const attendance = await attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new AppError(ATTENDANCE_MESSAGES.ATTENDANCE_NOT_FOUND, 404);
    }

    const forbiddenFields = ['employee', 'attendanceDate', 'createdBy', 'createdAt'];
    const updateFields = Object.keys(updateData);
    const hasForbiddenField = updateFields.some(field => forbiddenFields.includes(field));
    if (hasForbiddenField) {
      throw new AppError('Cannot update protected fields', 400);
    }

    if (updateData.officeShift) {
      const OfficeShift = (await import('./officeShift/officeShift.model.js')).default;
      const shiftExists = await OfficeShift.exists({ _id: updateData.officeShift, isDeleted: false });
      if (!shiftExists) {
        throw new AppError('Office shift not found or inactive', 404);
      }
    }

    if (updateData.checkIn && updateData.checkOut) {
      const checkInTime = new Date(updateData.checkIn);
      const checkOutTime = new Date(updateData.checkOut);
      if (checkOutTime < checkInTime) {
        throw new AppError(ATTENDANCE_MESSAGES.CHECK_OUT_BEFORE_CHECK_IN, 400);
      }
    }

    const updatedAttendance = await attendanceRepository.updateById(attendanceId, {
      ...updateData,
      updatedBy
    });

    return updatedAttendance;
  }

  async deleteAttendance(attendanceId, deletedBy) {
    const attendance = await attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new AppError(ATTENDANCE_MESSAGES.ATTENDANCE_NOT_FOUND, 404);
    }

    await attendanceRepository.softDeleteById(attendanceId, deletedBy);
  }

  async restoreAttendance(attendanceId) {
    const attendance = await attendanceRepository.findByIdWithoutPopulate(attendanceId);
    if (!attendance) {
      throw new AppError(ATTENDANCE_MESSAGES.ATTENDANCE_NOT_FOUND, 404);
    }

    if (!attendance.isDeleted) {
      throw new AppError('Attendance record is not deleted', 400);
    }

    return await attendanceRepository.restoreById(attendanceId);
  }

  async getAttendanceById(attendanceId) {
    const attendance = await attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new AppError(ATTENDANCE_MESSAGES.ATTENDANCE_NOT_FOUND, 404);
    }
    return attendance;
  }

  async getAllAttendances(query = {}) {
    return await attendanceRepository.findAll(query);
  }

  async getAttendanceByEmployee(employeeId) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found or inactive', 404);
    }

    return await attendanceRepository.findByEmployee(employeeId);
  }

  async getAttendanceByEmployeeAndDate(employeeId, attendanceDate) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found or inactive', 404);
    }

    return await attendanceRepository.findByEmployeeAndDate(employeeId, attendanceDate);
  }

  async getAttendanceByDateRange(startDate, endDate) {
    if (!AttendanceUtils.isValidDate(startDate) || !AttendanceUtils.isValidDate(endDate)) {
      throw new AppError('Invalid date range', 400);
    }

    return await attendanceRepository.findByDateRange(startDate, endDate);
  }

  async getAttendanceByShift(shiftId) {
    const OfficeShift = (await import('./officeShift/officeShift.model.js')).default;
    const shiftExists = await OfficeShift.exists({ _id: shiftId, isDeleted: false });
    if (!shiftExists) {
      throw new AppError('Office shift not found or inactive', 404);
    }

    return await attendanceRepository.findByShift(shiftId);
  }

  async getAttendanceByStatus(status) {
    return await attendanceRepository.findByStatus(status);
  }

  async getPendingApprovals() {
    return await attendanceRepository.findPendingApprovals();
  }

  async getAdjustmentRequests() {
    return await attendanceRepository.findAdjustmentRequests();
  }

  async getAttendanceStatistics(filters = {}) {
    const query = { isDeleted: false, ...filters };
    const total = await attendanceRepository.count(query);
    const present = await attendanceRepository.count({ ...query, attendanceStatus: 'present' });
    const absent = await attendanceRepository.count({ ...query, attendanceStatus: 'absent' });
    const late = await attendanceRepository.count({ ...query, attendanceStatus: 'late' });
    const halfDay = await attendanceRepository.count({ ...query, attendanceStatus: 'half_day' });
    const leave = await attendanceRepository.count({ ...query, attendanceStatus: 'leave' });
    const holiday = await attendanceRepository.count({ ...query, attendanceStatus: 'holiday' });
    const weekend = await attendanceRepository.count({ ...query, attendanceStatus: 'weekend' });
    const overtime = await attendanceRepository.count({ ...query, attendanceStatus: 'overtime' });

    return {
      total,
      present,
      absent,
      late,
      halfDay,
      leave,
      holiday,
      weekend,
      overtime
    };
  }

  async requestAdjustment(attendanceId, adjustmentReason, requestedBy) {
    const attendance = await attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new AppError(ATTENDANCE_MESSAGES.ATTENDANCE_NOT_FOUND, 404);
    }

    if (attendance.approvalStatus === 'approved') {
      throw new AppError('Cannot request adjustment for approved attendance', 400);
    }

    const updatedAttendance = await attendanceRepository.updateById(attendanceId, {
      adjustmentRequested: true,
      adjustmentReason,
      approvalStatus: 'pending',
      updatedBy: requestedBy
    });

    return updatedAttendance;
  }

  async approveAttendance(attendanceId, approvedBy) {
    const attendance = await attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new AppError(ATTENDANCE_MESSAGES.ATTENDANCE_NOT_FOUND, 404);
    }

    const updatedAttendance = await attendanceRepository.updateById(attendanceId, {
      approvalStatus: 'approved',
      adjustmentRequested: false,
      updatedBy: approvedBy
    });

    return updatedAttendance;
  }

  async rejectAttendance(attendanceId, rejectionReason, rejectedBy) {
    const attendance = await attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new AppError(ATTENDANCE_MESSAGES.ATTENDANCE_NOT_FOUND, 404);
    }

    const updatedAttendance = await attendanceRepository.updateById(attendanceId, {
      approvalStatus: 'rejected',
      adjustmentRequested: false,
      remarks: rejectionReason,
      updatedBy: rejectedBy
    });

    return updatedAttendance;
  }

  async bulkCreateAttendances(attendanceDataArray, createdBy) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const OfficeShift = (await import('./officeShift/officeShift.model.js')).default;

    const employeeIds = [...new Set(attendanceDataArray.map(a => a.employee))];
    const employees = await Employee.find({ _id: { $in: employeeIds }, isDeleted: false });
    const validEmployeeIds = new Set(employees.map(e => e._id.toString()));

    const shiftIds = [...new Set(attendanceDataArray.map(a => a.officeShift).filter(Boolean))];
    let validShiftIds = new Set();
    if (shiftIds.length > 0) {
      const shifts = await OfficeShift.find({ _id: { $in: shiftIds }, isDeleted: false });
      validShiftIds = new Set(shifts.map(s => s._id.toString()));
    }

    const validAttendances = attendanceDataArray.filter(attendance => {
      if (!validEmployeeIds.has(attendance.employee.toString())) {
        return false;
      }
      if (attendance.officeShift && !validShiftIds.has(attendance.officeShift.toString())) {
        return false;
      }
      if (AttendanceUtils.isFutureDate(attendance.attendanceDate)) {
        return false;
      }
      return true;
    });

    const attendances = await attendanceRepository.bulkCreate(
      validAttendances.map(a => ({ ...a, createdBy }))
    );

    return {
      created: attendances.length,
      total: attendanceDataArray.length,
      attendances
    };
  }

  async bulkUpdateAttendances(filter, updateData, updatedBy) {
    const result = await attendanceRepository.bulkUpdate(filter, { ...updateData, updatedBy });
    return {
      modified: result.modifiedCount,
      matched: result.matchedCount
    };
  }

  async bulkDeleteAttendances(filter, deletedBy) {
    const result = await attendanceRepository.bulkDelete(filter, deletedBy);
    return {
      deleted: result.modifiedCount,
      matched: result.matchedCount
    };
  }

  async checkIn(employeeId, checkInData, userId) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const OfficeShift = (await import('./officeShift/officeShift.model.js')).default;
    const AttendancePolicy = (await import('./attendancePolicy/attendancePolicy.model.js')).default;

    const employee = await Employee.findById(employeeId);
    const employeeValidation = AttendanceUtils.validateEmployeeStatus(employee);
    if (!employeeValidation.valid) {
      throw new AppError(employeeValidation.error, 400);
    }

    const policy = await AttendancePolicy.findActive();
    if (!policy) {
      throw new AppError('No active attendance policy found', 400);
    }

    const policyValidation = AttendanceUtils.validatePolicy(policy);
    if (!policyValidation.valid) {
      throw new AppError(policyValidation.error, 400);
    }

    const canCheckIn = AttendanceHelpers.canCheckIn(employee, policy);
    if (!canCheckIn) {
      throw new AppError('Employee cannot check in', 400);
    }

    const today = new Date();
    const existingAttendance = await attendanceRepository.findTodayAttendance(employeeId);
    const duplicateValidation = AttendanceUtils.validateDuplicateCheckIn(employeeId, today, existingAttendance);
    if (!duplicateValidation.valid) {
      throw new AppError(duplicateValidation.error, 409);
    }

    const dateValidation = AttendanceHelpers.validateAttendanceDate(today, employee);
    if (!dateValidation.valid) {
      throw new AppError(dateValidation.error, 400);
    }

    let shift = null;
    if (employee.officeShift) {
      shift = await OfficeShift.findById(employee.officeShift);
      const shiftValidation = AttendanceUtils.validateShift(shift);
      if (!shiftValidation.valid) {
        throw new AppError(shiftValidation.error, 400);
      }
    } else {
      shift = await OfficeShift.findDefault();
      if (!shift) {
        throw new AppError('No default shift found', 400);
      }
    }

    const isWeekend = AttendanceHelpers.isWeekend(today, shift.weeklyOff);
    if (isWeekend && !policy.allowWeekendAttendance) {
      throw new AppError('Weekend attendance not allowed', 400);
    }

    const sanitizedData = AttendanceUtils.sanitizeCheckInData({
      checkIn: new Date(),
      location: checkInData.location,
      device: checkInData.device,
      ipAddress: checkInData.ipAddress,
      userAgent: checkInData.userAgent
    });

    const attendance = await attendanceRepository.create({
      employee: employeeId,
      attendanceDate: today,
      officeShift: shift._id,
      checkIn: sanitizedData.checkIn,
      location: sanitizedData.location,
      device: sanitizedData.device,
      isWeekend,
      isHoliday: false,
      attendanceStatus: ATTENDANCE_STATUS.PRESENT,
      approvalStatus: APPROVAL_STATUS.APPROVED,
      remarks: checkInData.remarks,
      createdBy: userId
    });

    return attendance;
  }

  async checkOut(employeeId, checkOutData, userId) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const OfficeShift = (await import('./officeShift/officeShift.model.js')).default;

    const employee = await Employee.findById(employeeId);
    const employeeValidation = AttendanceUtils.validateEmployeeStatus(employee);
    if (!employeeValidation.valid) {
      throw new AppError(employeeValidation.error, 400);
    }

    const attendance = await attendanceRepository.findTodayAttendance(employeeId);
    if (!attendance) {
      throw new AppError('No check-in record found for today', 404);
    }

    const canCheckOut = AttendanceHelpers.canCheckOut(attendance);
    if (!canCheckOut) {
      throw new AppError('Cannot check out - already checked out or active break exists', 400);
    }

    const shift = await OfficeShift.findById(attendance.officeShift);
    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    const sanitizedData = AttendanceUtils.sanitizeCheckOutData({
      checkOut: new Date(),
      location: checkOutData.location,
      device: checkOutData.device
    });

    const metrics = AttendanceHelpers.calculateAttendanceMetrics(
      {
        ...attendance.toObject(),
        checkOut: sanitizedData.checkOut
      },
      shift,
      null
    );

    const updatedAttendance = await attendanceRepository.updateById(attendance._id, {
      checkOut: sanitizedData.checkOut,
      location: sanitizedData.location || attendance.location,
      device: sanitizedData.device || attendance.device,
      workingMinutes: metrics.workingMinutes,
      workingHours: metrics.workingHours,
      breakMinutes: metrics.breakMinutes,
      lateMinutes: metrics.lateMinutes,
      earlyExitMinutes: metrics.earlyExitMinutes,
      overtimeMinutes: metrics.overtimeMinutes,
      attendanceStatus: metrics.attendanceStatus,
      remarks: checkOutData.remarks || attendance.remarks,
      updatedBy: userId
    });

    return updatedAttendance;
  }

  async startBreak(employeeId, breakData, userId) {
    const attendance = await attendanceRepository.findTodayAttendance(employeeId);
    if (!attendance) {
      throw new AppError('No check-in record found for today', 404);
    }

    const breakValidation = AttendanceHelpers.validateBreakStart(attendance);
    if (!breakValidation.valid) {
      throw new AppError(breakValidation.error, 400);
    }

    const activeBreak = await attendanceRepository.findActiveBreak(employeeId);
    if (activeBreak) {
      throw new AppError('Cannot start multiple active breaks', 400);
    }

    const sanitizedBreakData = AttendanceUtils.sanitizeBreakData({
      startTime: new Date(),
      endTime: null,
      reason: breakData.reason,
      type: breakData.type
    });

    const updatedAttendance = await attendanceRepository.updateBreak(attendance._id, {
      ...sanitizedBreakData,
      updatedBy: userId
    });

    return updatedAttendance;
  }

  async endBreak(employeeId, breakData, userId) {
    const attendance = await attendanceRepository.findTodayAttendance(employeeId);
    if (!attendance) {
      throw new AppError('No check-in record found for today', 404);
    }

    const breakValidation = AttendanceHelpers.validateBreakEnd(attendance);
    if (!breakValidation.valid) {
      throw new AppError(breakValidation.error, 400);
    }

    const activeBreakIndex = attendance.breaks.findIndex(b => !b.endTime);
    if (activeBreakIndex === -1) {
      throw new AppError('No active break found', 404);
    }

    const updatedAttendance = await attendanceRepository.endBreak(
      attendance._id,
      activeBreakIndex,
      new Date()
    );

    const OfficeShift = (await import('./officeShift/officeShift.model.js')).default;
    const shift = await OfficeShift.findById(attendance.officeShift);
    if (shift && updatedAttendance.checkOut) {
      const metrics = AttendanceHelpers.calculateAttendanceMetrics(
        updatedAttendance.toObject(),
        shift,
        null
      );

      await attendanceRepository.updateById(attendance._id, {
        breakMinutes: metrics.breakMinutes,
        workingMinutes: metrics.workingMinutes,
        workingHours: metrics.workingHours,
        updatedBy: userId
      });
    }

    return updatedAttendance;
  }

  async getTodayAttendance(employeeId) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found or inactive', 404);
    }

    const attendance = await attendanceRepository.findTodayAttendance(employeeId);
    return attendance;
  }

  async getMonthlyAttendance(employeeId, year, month) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found or inactive', 404);
    }

    return await attendanceRepository.monthlyAttendance(employeeId, year, month);
  }

  async getDepartmentAttendance(departmentId, startDate, endDate) {
    if (!AttendanceUtils.isValidDate(startDate) || !AttendanceUtils.isValidDate(endDate)) {
      throw new AppError('Invalid date range', 400);
    }

    const dateRangeValidation = AttendanceUtils.validateAttendanceDateRange(startDate, endDate);
    if (!dateRangeValidation.valid) {
      throw new AppError(dateRangeValidation.error, 400);
    }

    return await attendanceRepository.departmentAttendance(departmentId, { startDate, endDate });
  }

  async getAttendanceSummary(employeeId, startDate, endDate) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found or inactive', 404);
    }

    if (!AttendanceUtils.isValidDate(startDate) || !AttendanceUtils.isValidDate(endDate)) {
      throw new AppError('Invalid date range', 400);
    }

    const dateRangeValidation = AttendanceUtils.validateAttendanceDateRange(startDate, endDate);
    if (!dateRangeValidation.valid) {
      throw new AppError(dateRangeValidation.error, 400);
    }

    return await attendanceRepository.attendanceSummary(employeeId, startDate, endDate);
  }

  async getAttendanceTrend(employeeId, days = 30) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found or inactive', 404);
    }

    return await attendanceRepository.attendanceTrend(employeeId, days);
  }

  async getEnhancedStatistics(filters = {}) {
    return await attendanceRepository.attendanceStatistics(filters);
  }
}

export default new AttendanceService();
