import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import AsyncHandler from '../../core/middlewares/asyncHandler.js';
import agendaService from './agenda.service.js';

class AgendaController {
  // Create Agenda
  createAgenda = AsyncHandler(async (req, res, next) => {
    const agenda = await agendaService.createAgenda(req.body, req.user.userId);
    return ApiResponse.success(res, agenda, 'Agenda created successfully', 201);
  });

  // Update Agenda
  updateAgenda = AsyncHandler(async (req, res, next) => {
    const agenda = await agendaService.updateAgenda(req.params.id, req.body, req.user.userId);
    return ApiResponse.success(res, agenda, 'Agenda updated successfully');
  });

  // Approve Agenda
  approveAgenda = AsyncHandler(async (req, res, next) => {
    const agenda = await agendaService.approveAgenda(req.params.id, req.user.userId);
    return ApiResponse.success(res, agenda, 'Agenda approved successfully');
  });

  // Start Agenda
  startAgenda = AsyncHandler(async (req, res, next) => {
    const agenda = await agendaService.startAgenda(req.params.id, req.user.userId);
    return ApiResponse.success(res, agenda, 'Agenda started successfully');
  });

  // Complete Agenda
  completeAgenda = AsyncHandler(async (req, res, next) => {
    const agenda = await agendaService.completeAgenda(req.params.id, req.user.userId);
    return ApiResponse.success(res, agenda, 'Agenda completed successfully');
  });

  // Cancel Agenda
  cancelAgenda = AsyncHandler(async (req, res, next) => {
    const agenda = await agendaService.cancelAgenda(req.params.id, req.user.userId);
    return ApiResponse.success(res, agenda, 'Agenda cancelled successfully');
  });

  // Get Agenda by ID
  getAgendaById = AsyncHandler(async (req, res, next) => {
    const agenda = await agendaService.getAgendaById(req.params.id);
    return ApiResponse.success(res, agenda, 'Agenda retrieved successfully');
  });

  // Get Agendas by Meeting
  getAgendasByMeeting = AsyncHandler(async (req, res, next) => {
    const { meetingId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {}
    };
    const agendas = await agendaService.getAgendasByMeeting(meetingId, options);
    return ApiResponse.success(res, agendas, 'Agendas retrieved successfully');
  });

  // Get Agendas by Presenter
  getAgendasByPresenter = AsyncHandler(async (req, res, next) => {
    const { presenterId } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const agendas = await agendaService.getAgendasByPresenter(presenterId, options);
    return ApiResponse.success(res, agendas, 'Agendas retrieved successfully');
  });

  // Get Agendas by Status
  getAgendasByStatus = AsyncHandler(async (req, res, next) => {
    const { status } = req.params;
    const options = {
      filter: req.query.filter ? JSON.parse(req.query.filter) : {},
      sort: req.query.sort ? JSON.parse(req.query.sort) : {},
      limit: parseInt(req.query.limit) || 100
    };
    const agendas = await agendaService.getAgendasByStatus(status, options);
    return ApiResponse.success(res, agendas, 'Agendas retrieved successfully');
  });

  // Reorder Agendas
  reorderAgendas = AsyncHandler(async (req, res, next) => {
    const { meetingId } = req.params;
    const { agendaOrders } = req.body;
    const results = await agendaService.reorderAgendas(meetingId, agendaOrders, req.user.userId);
    return ApiResponse.success(res, results, 'Agendas reordered successfully');
  });

  // Delete Agenda
  deleteAgenda = AsyncHandler(async (req, res, next) => {
    await agendaService.deleteAgenda(req.params.id, req.user.userId);
    return ApiResponse.success(res, null, 'Agenda deleted successfully');
  });
}

const agendaController = new AgendaController();
export default agendaController;
