// Models
export { default as Meeting } from './meeting.model.js';
export { default as Agenda } from './agenda.model.js';
export { default as MeetingMinutes } from './meetingMinutes.model.js';
export { default as MeetingAttendance } from './meetingAttendance.model.js';
export { default as ActionItem } from './actionItem.model.js';

// Repositories
export { default as meetingRepository } from './meeting.repository.js';
export { default as agendaRepository } from './agenda.repository.js';
export { default as minutesRepository } from './minutes.repository.js';
export { default as attendanceRepository } from './attendance.repository.js';
export { default as actionItemRepository } from './actionItem.repository.js';

// Services
export { default as meetingService } from './meeting.service.js';
export { default as agendaService } from './agenda.service.js';
export { default as minutesService } from './minutes.service.js';
export { default as attendanceService } from './attendance.service.js';
export { default as actionItemService } from './actionItem.service.js';

// Controllers
export { default as meetingController } from './meeting.controller.js';
export { default as agendaController } from './agenda.controller.js';
export { default as minutesController } from './minutes.controller.js';
export { default as attendanceController } from './attendance.controller.js';
export { default as actionItemController } from './actionItem.controller.js';

// Routes
export { default as meetingRoutes } from './meeting.routes.js';

// Constants
export * from './meeting.constants.js';

// Permissions
export * from './meeting.permissions.js';

// Validation
export * from './meeting.validation.js';

// Helpers
export { default as helpers } from './meeting.helpers.js';

// Utils
export { default as utils } from './meeting.utils.js';

// Reports
export { default as meetingReportService } from './meeting.report.service.js';

// Aggregation
export { default as MeetingAggregation } from './meeting.aggregation.js';

// Security Review
export { default as meetingSecurityReview } from './meeting.security-review.js';

// Dashboard
export { default as meetingDashboardService } from './meeting.dashboard.service.js';
export { default as meetingDashboardController } from './meeting.dashboard.controller.js';

// Analytics
export { default as meetingAnalyticsService } from './meeting.analytics.service.js';
export { default as meetingAnalyticsController } from './meeting.analytics.controller.js';

// Optimization
export { default as MeetingIndexes } from './meeting.indexes.js';
export { default as MeetingQueryOptimization } from './meeting.query-optimization.js';
