import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import AsyncHandler from '../../core/middlewares/asyncHandler.js';
import meetingService from './meeting.service.js';
import { MEETING_PERMISSIONS } from './meeting.permissions.js';

class MeetingController {
  // Create Meeting
  createMeeting = AsyncHandler(async (req, res, next) => {
    const meeting = await meetingService.createMeeting(req.body, req.user.userId);
    return ApiResponse.success(res, meeting, 'Meeting created successfully', 201);
  });

  // Update Meeting
  updateMeeting = AsyncHandler(async (req, res, next) => {
    const meeting = await meetingService.updateMeeting(req.params.id, req.body, req.user.userId);
    return ApiResponse.success(res, meeting, 'Meeting updated successfully');
  });

  // Cancel Meeting
  cancelMeeting = AsyncHandler(async (req, res, next) => {
    const { reason } = req.body;
    const meeting = await meetingService.cancelMeeting(req.params.id, reason, req.user.userId);
    return ApiResponse.success(res, meeting, 'Meeting cancelled successfully');
  });

  // Reschedule Meeting
  rescheduleMeeting = AsyncHandler(async (req, res, next) => {
    const { newStartTime, newEndTime } = req.body;
    const meeting = await meetingService.rescheduleMeeting(req.params.id, newStartTime, newEndTime, req.user.userId);
    return ApiResponse.success(res, meeting, 'Meeting rescheduled successfully');
  });

  // Duplicate Meeting
  duplicateMeeting = AsyncHandler(async (req, res, next) => {
    const { newStartTime, newEndTime } = req.body;
    const meeting = await meetingService.duplicateMeeting(req.params.id, newStartTime, newEndTime, req.user.userId);
    return ApiResponse.success(res, meeting, 'Meeting duplicated successfully', 201);
  });

  // Start Meeting
  startMeeting = AsyncHandler(async (req, res, next) => {
    const meeting = await meetingService.startMeeting(req.params.id, req.user.userId);
    return ApiResponse.success(res, meeting, 'Meeting started successfully');
  });

  // Complete Meeting
  completeMeeting = AsyncHandler(async (req, res, next) => {
    const meeting = await meetingService.completeMeeting(req.params.id, req.user.userId);
    return ApiResponse.success(res, meeting, 'Meeting completed successfully');
  });

  // Add Participant
  addParticipant = AsyncHandler(async (req, res, next) => {
    const { participantId } = req.body;
    const meeting = await meetingService.addParticipant(req.params.id, participantId, req.user.userId);
    return ApiResponse.success(res, meeting, 'Participant added successfully');
  });

  // Remove Participant
  removeParticipant = AsyncHandler(async (req, res, next) => {
    const { participantId } = req.body;
    const meeting = await meetingService.removeParticipant(req.params.id, participantId, req.user.userId);
    return ApiResponse.success(res, meeting, 'Participant removed successfully');
  });

  // Get Meeting by ID
  getMeetingById = AsyncHandler(async (req, res, next) => {
    const meeting = await meetingService.getMeetingById(req.params.id);
    return ApiResponse.success(res, meeting, 'Meeting retrieved successfully');
  });

  // Get Meetings by Organizer
  getMeetingsByOrganizer = AsyncHandler(async (req, res, next) => {
    const { organizerId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100,
      skip: parseInt(req.query.skip) || 0
    };
    const meetings = await meetingService.getMeetingsByOrganizer(organizerId, options);
    return ApiResponse.success(res, meetings, 'Meetings retrieved successfully');
  });

  // Get Meetings by Participant
  getMeetingsByParticipant = AsyncHandler(async (req, res, next) => {
    const { participantId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100,
      skip: parseInt(req.query.skip) || 0
    };
    const meetings = await meetingService.getMeetingsByParticipant(participantId, options);
    return ApiResponse.success(res, meetings, 'Meetings retrieved successfully');
  });

  // Get Meetings by Department
  getMeetingsByDepartment = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100,
      skip: parseInt(req.query.skip) || 0
    };
    const meetings = await meetingService.getMeetingsByDepartment(departmentId, options);
    return ApiResponse.success(res, meetings, 'Meetings retrieved successfully');
  });

  // Get Meetings by Project
  getMeetingsByProject = AsyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100,
      skip: parseInt(req.query.skip) || 0
    };
    const meetings = await meetingService.getMeetingsByProject(projectId, options);
    return ApiResponse.success(res, meetings, 'Meetings retrieved successfully');
  });

  // Get Meetings by Date Range
  getMeetingsByDateRange = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100,
      skip: parseInt(req.query.skip) || 0
    };
    const meetings = await meetingService.getMeetingsByDateRange(new Date(startDate), new Date(endDate), options);
    return ApiResponse.success(res, meetings, 'Meetings retrieved successfully');
  });

  // Get Upcoming Meetings
  getUpcomingMeetings = AsyncHandler(async (req, res, next) => {
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      limit: parseInt(req.query.limit) || 20
    };
    const meetings = await meetingService.getUpcomingMeetings(options);
    return ApiResponse.success(res, meetings, 'Upcoming meetings retrieved successfully');
  });

  // Get Past Meetings
  getPastMeetings = AsyncHandler(async (req, res, next) => {
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      limit: parseInt(req.query.limit) || 20
    };
    const meetings = await meetingService.getPastMeetings(options);
    return ApiResponse.success(res, meetings, 'Past meetings retrieved successfully');
  });

  // Get Meeting History
  getMeetingHistory = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100,
      skip: parseInt(req.query.skip) || 0
    };
    const history = await meetingService.getMeetingHistory(employeeId, options);
    return ApiResponse.success(res, history, 'Meeting history retrieved successfully');
  });

  // Delete Meeting
  deleteMeeting = AsyncHandler(async (req, res, next) => {
    await meetingService.deleteMeeting(req.params.id, req.user.userId);
    return ApiResponse.success(res, null, 'Meeting deleted successfully');
  });
}

const meetingController = new MeetingController();
export default meetingController;
