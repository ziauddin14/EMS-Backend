import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import AsyncHandler from '../../core/middlewares/asyncHandler.js';
import actionItemService from './actionItem.service.js';

class ActionItemController {
  // Create Action Item
  createActionItem = AsyncHandler(async (req, res, next) => {
    const actionItem = await actionItemService.createActionItem(req.body, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Action item created successfully', 201);
  });

  // Update Action Item
  updateActionItem = AsyncHandler(async (req, res, next) => {
    const actionItem = await actionItemService.updateActionItem(req.params.id, req.body, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Action item updated successfully');
  });

  // Start Action Item
  startActionItem = AsyncHandler(async (req, res, next) => {
    const actionItem = await actionItemService.startActionItem(req.params.id, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Action item started successfully');
  });

  // Update Progress
  updateProgress = AsyncHandler(async (req, res, next) => {
    const { percentage } = req.body;
    const actionItem = await actionItemService.updateProgress(req.params.id, percentage, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Progress updated successfully');
  });

  // Complete Action Item
  completeActionItem = AsyncHandler(async (req, res, next) => {
    const actionItem = await actionItemService.completeActionItem(req.params.id, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Action item completed successfully');
  });

  // Close Action Item
  closeActionItem = AsyncHandler(async (req, res, next) => {
    const actionItem = await actionItemService.closeActionItem(req.params.id, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Action item closed successfully');
  });

  // Put on Hold
  putOnHold = AsyncHandler(async (req, res, next) => {
    const { reason } = req.body;
    const actionItem = await actionItemService.putOnHold(req.params.id, reason, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Action item put on hold successfully');
  });

  // Cancel Action Item
  cancelActionItem = AsyncHandler(async (req, res, next) => {
    const { reason } = req.body;
    const actionItem = await actionItemService.cancelActionItem(req.params.id, reason, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Action item cancelled successfully');
  });

  // Mark Overdue
  markOverdue = AsyncHandler(async (req, res, next) => {
    const actionItem = await actionItemService.markOverdue(req.params.id, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Action item marked overdue successfully');
  });

  // Add Evidence
  addEvidence = AsyncHandler(async (req, res, next) => {
    const evidence = req.body;
    const actionItem = await actionItemService.addEvidence(req.params.id, evidence, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Evidence added successfully');
  });

  // Remove Evidence
  removeEvidence = AsyncHandler(async (req, res, next) => {
    const { evidenceId } = req.body;
    const actionItem = await actionItemService.removeEvidence(req.params.id, evidenceId, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Evidence removed successfully');
  });

  // Set Follow Up
  setFollowUp = AsyncHandler(async (req, res, next) => {
    const { followUpDate, notes } = req.body;
    const actionItem = await actionItemService.setFollowUp(req.params.id, followUpDate, notes, req.user.userId);
    return ApiResponse.success(res, actionItem, 'Follow up set successfully');
  });

  // Get Action Item by ID
  getActionItemById = AsyncHandler(async (req, res, next) => {
    const actionItem = await actionItemService.getActionItemById(req.params.id);
    return ApiResponse.success(res, actionItem, 'Action item retrieved successfully');
  });

  // Get Action Items by Assigned Employee
  getActionItemsByAssignedEmployee = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const actionItems = await actionItemService.getActionItemsByAssignedEmployee(employeeId, options);
    return ApiResponse.success(res, actionItems, 'Action items retrieved successfully');
  });

  // Get Action Items by Assigned Department
  getActionItemsByAssignedDepartment = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const actionItems = await actionItemService.getActionItemsByAssignedDepartment(departmentId, options);
    return ApiResponse.success(res, actionItems, 'Action items retrieved successfully');
  });

  // Get Action Items by Meeting
  getActionItemsByMeeting = AsyncHandler(async (req, res, next) => {
    const { meetingId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {}
    };
    const actionItems = await actionItemService.getActionItemsByMeeting(meetingId, options);
    return ApiResponse.success(res, actionItems, 'Action items retrieved successfully');
  });

  // Get Action Items by Minutes
  getActionItemsByMinutes = AsyncHandler(async (req, res, next) => {
    const { minutesId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {}
    };
    const actionItems = await actionItemService.getActionItemsByMinutes(minutesId, options);
    return ApiResponse.success(res, actionItems, 'Action items retrieved successfully');
  });

  // Get Action Items by Status
  getActionItemsByStatus = AsyncHandler(async (req, res, next) => {
    const { status } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const actionItems = await actionItemService.getActionItemsByStatus(status, options);
    return ApiResponse.success(res, actionItems, 'Action items retrieved successfully');
  });

  // Get Action Items by Priority
  getActionItemsByPriority = AsyncHandler(async (req, res, next) => {
    const { priority } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const actionItems = await actionItemService.getActionItemsByPriority(priority, options);
    return ApiResponse.success(res, actionItems, 'Action items retrieved successfully');
  });

  // Get Overdue Action Items
  getOverdueActionItems = AsyncHandler(async (req, res, next) => {
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const actionItems = await actionItemService.getOverdueActionItems(options);
    return ApiResponse.success(res, actionItems, 'Overdue action items retrieved successfully');
  });

  // Get Action Items Due Soon
  getActionItemsDueSoon = AsyncHandler(async (req, res, next) => {
    const days = parseInt(req.query.days) || 7;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const actionItems = await actionItemService.getActionItemsDueSoon(days, options);
    return ApiResponse.success(res, actionItems, 'Action items due soon retrieved successfully');
  });

  // Get Action Items by Date Range
  getActionItemsByDateRange = AsyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const actionItems = await actionItemService.getActionItemsByDateRange(new Date(startDate), new Date(endDate), options);
    return ApiResponse.success(res, actionItems, 'Action items retrieved successfully');
  });

  // Get Department Action Item Stats
  getDepartmentActionItemStats = AsyncHandler(async (req, res, next) => {
    const { departmentId } = req.params;
    const stats = await actionItemService.getDepartmentActionItemStats(departmentId);
    return ApiResponse.success(res, stats, 'Department action item stats retrieved successfully');
  });

  // Get Employee Action Item Stats
  getEmployeeActionItemStats = AsyncHandler(async (req, res, next) => {
    const { employeeId } = req.params;
    const stats = await actionItemService.getEmployeeActionItemStats(employeeId);
    return ApiResponse.success(res, stats, 'Employee action item stats retrieved successfully');
  });

  // Bulk Update Status
  bulkUpdateStatus = AsyncHandler(async (req, res, next) => {
    const { actionItemIds, status } = req.body;
    const results = await actionItemService.bulkUpdateStatus(actionItemIds, status, req.user.userId);
    return ApiResponse.success(res, results, 'Bulk status update successful');
  });

  // Delete Action Item
  deleteActionItem = AsyncHandler(async (req, res, next) => {
    await actionItemService.deleteActionItem(req.params.id, req.user.userId);
    return ApiResponse.success(res, null, 'Action item deleted successfully');
  });
}

const actionItemController = new ActionItemController();
export default actionItemController;
