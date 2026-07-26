import attendanceService from './attendance.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class AttendanceController {
  async create(req, res, next) {
    try {
      const attendance = await attendanceService.createAttendance(req.body, req.user.userId);
      return ApiResponse.created(res, 'Attendance record created successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const attendances = await attendanceService.getAllAttendances(req.query);
      return ApiResponse.success(res, 'Attendances retrieved successfully', { attendances });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const attendance = await attendanceService.getAttendanceById(id);
      return ApiResponse.success(res, 'Attendance retrieved successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const attendance = await attendanceService.updateAttendance(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Attendance updated successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await attendanceService.deleteAttendance(id, req.user.userId);
      return ApiResponse.success(res, 'Attendance deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const attendance = await attendanceService.restoreAttendance(id);
      return ApiResponse.success(res, 'Attendance restored successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async getByEmployee(req, res, next) {
    try {
      const { employeeId } = req.params;
      const attendances = await attendanceService.getAttendanceByEmployee(employeeId);
      return ApiResponse.success(res, 'Employee attendances retrieved successfully', { attendances });
    } catch (error) {
      next(error);
    }
  }

  async getByEmployeeAndDate(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { date } = req.query;
      const attendance = await attendanceService.getAttendanceByEmployeeAndDate(employeeId, date);
      return ApiResponse.success(res, 'Attendance retrieved successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async getByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const attendances = await attendanceService.getAttendanceByDateRange(startDate, endDate);
      return ApiResponse.success(res, 'Attendances retrieved successfully', { attendances });
    } catch (error) {
      next(error);
    }
  }

  async getByShift(req, res, next) {
    try {
      const { shiftId } = req.params;
      const attendances = await attendanceService.getAttendanceByShift(shiftId);
      return ApiResponse.success(res, 'Shift attendances retrieved successfully', { attendances });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const attendances = await attendanceService.getAttendanceByStatus(status);
      return ApiResponse.success(res, 'Attendances retrieved successfully', { attendances });
    } catch (error) {
      next(error);
    }
  }

  async getPendingApprovals(req, res, next) {
    try {
      const attendances = await attendanceService.getPendingApprovals();
      return ApiResponse.success(res, 'Pending approvals retrieved successfully', { attendances });
    } catch (error) {
      next(error);
    }
  }

  async getAdjustmentRequests(req, res, next) {
    try {
      const attendances = await attendanceService.getAdjustmentRequests();
      return ApiResponse.success(res, 'Adjustment requests retrieved successfully', { attendances });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await attendanceService.getAttendanceStatistics(req.query);
      return ApiResponse.success(res, 'Attendance statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async requestAdjustment(req, res, next) {
    try {
      const { id } = req.params;
      const { adjustmentReason } = req.body;
      const attendance = await attendanceService.requestAdjustment(id, adjustmentReason, req.user.userId);
      return ApiResponse.success(res, 'Adjustment requested successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const attendance = await attendanceService.approveAttendance(id, req.user.userId);
      return ApiResponse.success(res, 'Attendance approved successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const attendance = await attendanceService.rejectAttendance(id, rejectionReason, req.user.userId);
      return ApiResponse.success(res, 'Attendance rejected successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async bulkCreate(req, res, next) {
    try {
      const { attendances } = req.body;
      const result = await attendanceService.bulkCreateAttendances(attendances, req.user.userId);
      return ApiResponse.created(res, 'Attendances created successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdate(req, res, next) {
    try {
      const { filter, updateData } = req.body;
      const result = await attendanceService.bulkUpdateAttendances(filter, updateData, req.user.userId);
      return ApiResponse.success(res, 'Attendances updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req, res, next) {
    try {
      const { filter } = req.body;
      const result = await attendanceService.bulkDeleteAttendances(filter, req.user.userId);
      return ApiResponse.success(res, 'Attendances deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req, res, next) {
    try {
      const { employeeId } = req.params;
      const checkInData = {
        ...req.body,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      };
      const attendance = await attendanceService.checkIn(employeeId, checkInData, req.user.userId);
      return ApiResponse.created(res, 'Check-in successful', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req, res, next) {
    try {
      const { employeeId } = req.params;
      const checkOutData = {
        ...req.body,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      };
      const attendance = await attendanceService.checkOut(employeeId, checkOutData, req.user.userId);
      return ApiResponse.success(res, 'Check-out successful', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async startBreak(req, res, next) {
    try {
      const { employeeId } = req.params;
      const attendance = await attendanceService.startBreak(employeeId, req.body, req.user.userId);
      return ApiResponse.success(res, 'Break started successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async endBreak(req, res, next) {
    try {
      const { employeeId } = req.params;
      const attendance = await attendanceService.endBreak(employeeId, req.body, req.user.userId);
      return ApiResponse.success(res, 'Break ended successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async getToday(req, res, next) {
    try {
      const { employeeId } = req.params;
      const attendance = await attendanceService.getTodayAttendance(employeeId);
      return ApiResponse.success(res, 'Today\'s attendance retrieved successfully', { attendance });
    } catch (error) {
      next(error);
    }
  }

  async getMonthly(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { year, month } = req.query;
      const attendances = await attendanceService.getMonthlyAttendance(employeeId, parseInt(year), parseInt(month));
      return ApiResponse.success(res, 'Monthly attendance retrieved successfully', { attendances });
    } catch (error) {
      next(error);
    }
  }

  async getDepartment(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { startDate, endDate } = req.query;
      const attendances = await attendanceService.getDepartmentAttendance(departmentId, startDate, endDate);
      return ApiResponse.success(res, 'Department attendance retrieved successfully', { attendances });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;
      const summary = await attendanceService.getAttendanceSummary(employeeId, startDate, endDate);
      return ApiResponse.success(res, 'Attendance summary retrieved successfully', { summary });
    } catch (error) {
      next(error);
    }
  }

  async getTrend(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { days = 30 } = req.query;
      const trend = await attendanceService.getAttendanceTrend(employeeId, parseInt(days));
      return ApiResponse.success(res, 'Attendance trend retrieved successfully', { trend });
    } catch (error) {
      next(error);
    }
  }

  async getEnhancedStatistics(req, res, next) {
    try {
      const statistics = await attendanceService.getEnhancedStatistics(req.query);
      return ApiResponse.success(res, 'Enhanced attendance statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceController();
