import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import AsyncHandler from '../../core/middlewares/asyncHandler.js';
import minutesService from './minutes.service.js';

class MinutesController {
  // Create Minutes
  createMinutes = AsyncHandler(async (req, res, next) => {
    const minutes = await minutesService.createMinutes(req.body, req.user.userId);
    return ApiResponse.success(res, minutes, 'Minutes created successfully', 201);
  });

  // Update Minutes
  updateMinutes = AsyncHandler(async (req, res, next) => {
    const minutes = await minutesService.updateMinutes(req.params.id, req.body, req.user.userId);
    return ApiResponse.success(res, minutes, 'Minutes updated successfully');
  });

  // Submit for Review
  submitForReview = AsyncHandler(async (req, res, next) => {
    const minutes = await minutesService.submitForReview(req.params.id, req.user.userId);
    return ApiResponse.success(res, minutes, 'Minutes submitted for review successfully');
  });

  // Approve Minutes
  approveMinutes = AsyncHandler(async (req, res, next) => {
    const minutes = await minutesService.approveMinutes(req.params.id, req.user.userId);
    return ApiResponse.success(res, minutes, 'Minutes approved successfully');
  });

  // Reject Minutes
  rejectMinutes = AsyncHandler(async (req, res, next) => {
    const { reason } = req.body;
    const minutes = await minutesService.rejectMinutes(req.params.id, req.user.userId, reason);
    return ApiResponse.success(res, minutes, 'Minutes rejected successfully');
  });

  // Finalize Minutes
  finalizeMinutes = AsyncHandler(async (req, res, next) => {
    const minutes = await minutesService.finalizeMinutes(req.params.id, req.user.userId);
    return ApiResponse.success(res, minutes, 'Minutes finalized successfully');
  });

  // Add Action Item
  addActionItem = AsyncHandler(async (req, res, next) => {
    const { actionItemId } = req.body;
    const minutes = await minutesService.addActionItem(req.params.id, actionItemId, req.user.userId);
    return ApiResponse.success(res, minutes, 'Action item added successfully');
  });

  // Remove Action Item
  removeActionItem = AsyncHandler(async (req, res, next) => {
    const { actionItemId } = req.body;
    const minutes = await minutesService.removeActionItem(req.params.id, actionItemId, req.user.userId);
    return ApiResponse.success(res, minutes, 'Action item removed successfully');
  });

  // Get Minutes by ID
  getMinutesById = AsyncHandler(async (req, res, next) => {
    const minutes = await minutesService.getMinutesById(req.params.id);
    return ApiResponse.success(res, minutes, 'Minutes retrieved successfully');
  });

  // Get Minutes by Meeting
  getMinutesByMeeting = AsyncHandler(async (req, res, next) => {
    const { meetingId } = req.params;
    const minutes = await minutesService.getMinutesByMeeting(meetingId);
    return ApiResponse.success(res, minutes, 'Minutes retrieved successfully');
  });

  // Get Minutes by Prepared By
  getMinutesByPreparedBy = AsyncHandler(async (req, res, next) => {
    const { preparedById } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const minutes = await minutesService.getMinutesByPreparedBy(preparedById, options);
    return ApiResponse.success(res, minutes, 'Minutes retrieved successfully');
  });

  // Get Minutes by Approval Status
  getMinutesByApprovalStatus = AsyncHandler(async (req, res, next) => {
    const { status } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const minutes = await minutesService.getMinutesByApprovalStatus(status, options);
    return ApiResponse.success(res, minutes, 'Minutes retrieved successfully');
  });

  // Get Pending Follow Up
  getPendingFollowUp = AsyncHandler(async (req, res, next) => {
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      limit: parseInt(req.query.limit) || 50
    };
    const minutes = await minutesService.getPendingFollowUp(options);
    return ApiResponse.success(res, minutes, 'Pending follow-up minutes retrieved successfully');
  });

  // Delete Minutes
  deleteMinutes = AsyncHandler(async (req, res, next) => {
    await minutesService.deleteMinutes(req.params.id, req.user.userId);
    return ApiResponse.success(res, null, 'Minutes deleted successfully');
  });
}

const minutesController = new MinutesController();
export default minutesController;
