import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import AsyncHandler from '../../core/middlewares/asyncHandler.js';
import attendanceService from './attendance.service.js';

class AttendanceController {
  // Create Attendance
  createAttendance = AsyncHandler(async (req, res, next) => {
    const attendance = await attendanceService.createAttendance(req.body, req.user.userId);
    return ApiResponse.success(res, attendance, 'Attendance created successfully', 201);
  });

  // Update Attendance
  updateAttendance = AsyncHandler(async (req, res, next) => {
    const attendance = await attendanceService.updateAttendance(req.params.id, req.body, req.user.userId);
    return ApiResponse.success(res, attendance, 'Attendance updated successfully');
  });

  // Check In
  checkIn = AsyncHandler(async (req, res, next) => {
    const { meetingId, employeeId } = req.body;
    const { checkInTime } = req.body;
    const attendance = await attendanceService.checkIn(meetingId, employeeId, checkInTime, req.user.userId);
    return ApiResponse.success(res, attendance, 'Check in successful');
  });

  // Check Out
  checkOut = AsyncHandler(async (req, res, next) => {
    const { meetingId, employeeId } = req.body;
    const { checkOutTime } = req.body;
    const attendance = await attendanceService.checkOut(meetingId, employeeId, checkOutTime, req.user.userId);
    return ApiResponse.success(res, attendance, 'Check out successful');
  });

  // Mark Absent
  markAbsent = AsyncHandler(async (req, res, next) => {
    const { meetingId, employeeId, reason } = req.body;
    const attendance = await attendanceService.markAbsent(meetingId, employeeId, reason, req.user.userId);
    return ApiResponse.success(res, attendance, 'Marked absent successfully');
  });

  // Mark Excused
  markExcused = AsyncHandler(async (req, res, next) => {
    const { meetingId, employeeId, reason } = req.body;
    const attendance = await attendanceService.markExcused(meetingId, employeeId, reason, req.user.userId);
    return ApiResponse.success(res, attendance, 'Marked excused successfully');
  });

  // Mark No Show
  markNoShow = AsyncHandler(async (req, res, next) => {
    const { meetingId, employeeId } = req.body;
    const attendance = await attendanceService.markNoShow(meetingId, employeeId, req.user.userId);
    return ApiResponse.success(res, attendance, 'Marked no show successfully');
  });

  // Update Participation Score
  updateParticipationScore = AsyncHandler(async (req, res, next) => {
    const { score } = req.body;
    const attendance = await attendanceService.updateParticipationScore(req.params.id, score, req.user.userId);
    return ApiResponse.success(res, attendance, 'Participation score updated successfully');
  });

  // Bulk Check In
  bulkCheckIn = AsyncHandler(async (req, res, next) => {
    const { meetingId, employeeIds } = req.body;
    const results = await attendanceService.bulkCheckIn(meetingId, employeeIds, req.user.userId);
    return ApiResponse.success(res, results, 'Bulk check in successful');
  });

  // Bulk Check Out
  bulkCheckOut = AsyncHandler(async (req, res, next) => {
    const { meetingId, employeeIds } = req.body;
    const results = await attendanceService.bulkCheckOut(meetingId, employeeIds, req.user.userId);
    return ApiResponse.success(res, results, 'Bulk check out successful');
  });

  // Get Attendance by ID
  getAttendanceById = AsyncHandler(async (req, res, next) => {
    const attendance = await attendanceService.getAttendanceById(req.params.id);
    return ApiResponse.success(res, attendance, 'Attendance retrieved successfully');
  });

  // Get Attendance by Meeting
  getAttendanceByMeeting = AsyncHandler(async (req, res, next) => {
    const { meetingId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {}
    };
    const attendance = await attendanceService.getAttendanceByMeeting(meetingId, options);
    return ApiResponse.success(res, attendance, 'Attendance retrieved successfully');
  });

  // Get Attendance by Employee
  getAttendanceByEmployee = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const attendance = await attendanceService.getAttendanceByEmployee(employeeId, options);
    return ApiResponse.success(res, attendance, 'Attendance retrieved successfully');
  });

  // Get Attendance by Status
  getAttendanceByStatus = AsyncHandler(async (req, res, next) => {
    const { status } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const attendance = await attendanceService.getAttendanceByStatus(status, options);
    return ApiResponse.success(res, attendance, 'Attendance retrieved successfully');
  });

  // Get Attendance by Date Range
  getAttendanceByDateRange = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const attendance = await attendanceService.getAttendanceByDateRange(new Date(startDate), new Date(endDate), options);
    return ApiResponse.success(res, attendance, 'Attendance retrieved successfully');
  });

  // Get Meeting Attendance Stats
  getMeetingAttendanceStats = AsyncHandler(async (req, res, next) => {
    const { meetingId } = req.params;
    const stats = await attendanceService.getMeetingAttendanceStats(meetingId);
    return ApiResponse.success(res, stats, 'Meeting attendance stats retrieved successfully');
  });

  // Get Employee Attendance Stats
  getEmployeeAttendanceStats = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    const stats = await attendanceService.getEmployeeAttendanceStats(
      employeeId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    return ApiResponse.success(res, stats, 'Employee attendance stats retrieved successfully');
  });

  // Delete Attendance
  deleteAttendance = AsyncHandler(async (req, res, next) => {
    await attendanceService.deleteAttendance(req.params.id, req.user.userId);
    return ApiResponse.success(res, null, 'Attendance deleted successfully');
  });
}

const attendanceController = new AttendanceController();
export default attendanceController;
