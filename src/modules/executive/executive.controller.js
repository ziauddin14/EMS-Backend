import AsyncHandler from '../../core/middlewares/asyncHandler.js';
import ApiResponse from '../../core/utils/apiResponse.js';
import AppError from '../../core/utils/appError.js';
import executiveService from './executive.service.js';

class ExecutiveController {
  // Organization Health Endpoints
  getOrganizationHealth = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const health = await executiveService.getOrganizationHealth(period);
    
    return ApiResponse.success(res, health, 'Organization health retrieved successfully');
  });

  getDepartmentHealth = AsyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const { period = 'this_month' } = req.query;
    const health = await executiveService.getDepartmentHealth(departmentId, period);
    
    return ApiResponse.success(res, health, 'Department health retrieved successfully');
  });

  getBranchHealth = AsyncHandler(async (req, res) => {
    const { branchId } = req.params;
    const { period = 'this_month' } = req.query;
    const health = await executiveService.getBranchHealth(branchId, period);
    
    return ApiResponse.success(res, health, 'Branch health retrieved successfully');
  });

  getEmployeeHealth = AsyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const { period = 'this_month' } = req.query;
    const health = await executiveService.getEmployeeHealth(employeeId, period);
    
    return ApiResponse.success(res, health, 'Employee health retrieved successfully');
  });

  getHealthSummary = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const summary = await executiveService.getHealthSummary(period);
    
    return ApiResponse.success(res, summary, 'Health summary retrieved successfully');
  });

  // Dashboard Endpoints
  getOrganizationOverview = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const overview = await executiveService.getOrganizationOverview(period);
    
    return ApiResponse.success(res, overview, 'Organization overview retrieved successfully');
  });

  getCompanyHealthScore = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const healthScore = await executiveService.getCompanyHealthScore(period);
    
    return ApiResponse.success(res, healthScore, 'Company health score retrieved successfully');
  });

  getDepartmentHealthScore = AsyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const { period = 'this_month' } = req.query;
    const healthScore = await executiveService.getDepartmentHealthScore(departmentId, period);
    
    return ApiResponse.success(res, healthScore, 'Department health score retrieved successfully');
  });

  getBranchHealthScore = AsyncHandler(async (req, res) => {
    const { branchId } = req.params;
    const { period = 'this_month' } = req.query;
    const healthScore = await executiveService.getBranchHealthScore(branchId, period);
    
    return ApiResponse.success(res, healthScore, 'Branch health score retrieved successfully');
  });

  getEmployeeHealthScore = AsyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const { period = 'this_month' } = req.query;
    const healthScore = await executiveService.getEmployeeHealthScore(employeeId, period);
    
    return ApiResponse.success(res, healthScore, 'Employee health score retrieved successfully');
  });

  getAttendanceOverview = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const overview = await executiveService.getAttendanceOverview(period);
    
    return ApiResponse.success(res, overview, 'Attendance overview retrieved successfully');
  });

  getTaskOverview = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const overview = await executiveService.getTaskOverview(period);
    
    return ApiResponse.success(res, overview, 'Task overview retrieved successfully');
  });

  getProjectOverview = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const overview = await executiveService.getProjectOverview(period);
    
    return ApiResponse.success(res, overview, 'Project overview retrieved successfully');
  });

  getKPIOverview = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const overview = await executiveService.getKPIOverview(period);
    
    return ApiResponse.success(res, overview, 'KPI overview retrieved successfully');
  });

  getMeetingOverview = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const overview = await executiveService.getMeetingOverview(period);
    
    return ApiResponse.success(res, overview, 'Meeting overview retrieved successfully');
  });

  getProductivityOverview = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const overview = await executiveService.getProductivityOverview(period);
    
    return ApiResponse.success(res, overview, 'Productivity overview retrieved successfully');
  });

  getOrganizationSummary = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const summary = await executiveService.getOrganizationSummary(period);
    
    return ApiResponse.success(res, summary, 'Organization summary retrieved successfully');
  });

  // Analytics Endpoints
  getTrendAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'monthly', comparison } = req.query;
    const analytics = await executiveService.getTrendAnalytics(startDate, endDate, granularity, comparison);
    
    return ApiResponse.success(res, analytics, 'Trend analytics retrieved successfully');
  });

  getGrowthAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'monthly' } = req.query;
    const analytics = await executiveService.getGrowthAnalytics(startDate, endDate, granularity);
    
    return ApiResponse.success(res, analytics, 'Growth analytics retrieved successfully');
  });

  getProductivityAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'monthly' } = req.query;
    const analytics = await executiveService.getProductivityAnalytics(startDate, endDate, granularity);
    
    return ApiResponse.success(res, analytics, 'Productivity analytics retrieved successfully');
  });

  getPerformanceAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'monthly' } = req.query;
    const analytics = await executiveService.getPerformanceAnalytics(startDate, endDate, granularity);
    
    return ApiResponse.success(res, analytics, 'Performance analytics retrieved successfully');
  });

  getAttendanceAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'monthly' } = req.query;
    const analytics = await executiveService.getAttendanceAnalytics(startDate, endDate, granularity);
    
    return ApiResponse.success(res, analytics, 'Attendance analytics retrieved successfully');
  });

  getProjectAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'monthly' } = req.query;
    const analytics = await executiveService.getProjectAnalytics(startDate, endDate, granularity);
    
    return ApiResponse.success(res, analytics, 'Project analytics retrieved successfully');
  });

  getTaskAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'monthly' } = req.query;
    const analytics = await executiveService.getTaskAnalytics(startDate, endDate, granularity);
    
    return ApiResponse.success(res, analytics, 'Task analytics retrieved successfully');
  });

  getMeetingAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = 'monthly' } = req.query;
    const analytics = await executiveService.getMeetingAnalytics(startDate, endDate, granularity);
    
    return ApiResponse.success(res, analytics, 'Meeting analytics retrieved successfully');
  });

  getDepartmentAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const { departmentId } = req.params;
    const analytics = await executiveService.getDepartmentAnalytics(startDate, endDate, departmentId);
    
    return ApiResponse.success(res, analytics, 'Department analytics retrieved successfully');
  });

  getBranchAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const { branchId } = req.params;
    const analytics = await executiveService.getBranchAnalytics(startDate, endDate, branchId);
    
    return ApiResponse.success(res, analytics, 'Branch analytics retrieved successfully');
  });

  getOrganizationAnalytics = AsyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const analytics = await executiveService.getOrganizationAnalytics(startDate, endDate);
    
    return ApiResponse.success(res, analytics, 'Organization analytics retrieved successfully');
  });

  // Insights Endpoints
  getTopPerformers = AsyncHandler(async (req, res) => {
    const { limit = 10, period = 'this_month' } = req.query;
    const performers = await executiveService.getTopPerformers(parseInt(limit), period);
    
    return ApiResponse.success(res, performers, 'Top performers retrieved successfully');
  });

  getBottomPerformers = AsyncHandler(async (req, res) => {
    const { limit = 10, period = 'this_month' } = req.query;
    const performers = await executiveService.getBottomPerformers(parseInt(limit), period);
    
    return ApiResponse.success(res, performers, 'Bottom performers retrieved successfully');
  });

  getDepartmentRankings = AsyncHandler(async (req, res) => {
    const { metric = 'healthScore', period = 'this_month' } = req.query;
    const rankings = await executiveService.getDepartmentRankings(metric, period);
    
    return ApiResponse.success(res, rankings, 'Department rankings retrieved successfully');
  });

  getBranchRankings = AsyncHandler(async (req, res) => {
    const { metric = 'healthScore', period = 'this_month' } = req.query;
    const rankings = await executiveService.getBranchRankings(metric, period);
    
    return ApiResponse.success(res, rankings, 'Branch rankings retrieved successfully');
  });

  getPromotionPipeline = AsyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    const { limit = 50 } = req.query;
    const pipeline = await executiveService.getPromotionPipeline(departmentId, parseInt(limit));
    
    return ApiResponse.success(res, pipeline, 'Promotion pipeline retrieved successfully');
  });

  getTrainingPipeline = AsyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    const { limit = 50 } = req.query;
    const pipeline = await executiveService.getTrainingPipeline(departmentId, parseInt(limit));
    
    return ApiResponse.success(res, pipeline, 'Training pipeline retrieved successfully');
  });

  getSuccessionPlanning = AsyncHandler(async (req, res) => {
    const { role } = req.query;
    const { limit = 50 } = req.query;
    const succession = await executiveService.getSuccessionPlanning(role, parseInt(limit));
    
    return ApiResponse.success(res, succession, 'Succession planning retrieved successfully');
  });

  getLeadershipPipeline = AsyncHandler(async (req, res) => {
    const { level } = req.query;
    const { limit = 50 } = req.query;
    const leadership = await executiveService.getLeadershipPipeline(level, parseInt(limit));
    
    return ApiResponse.success(res, leadership, 'Leadership pipeline retrieved successfully');
  });

  getAttritionRisk = AsyncHandler(async (req, res) => {
    const { departmentId, branchId } = req.query;
    const { limit = 50 } = req.query;
    const attritionRisk = await executiveService.getAttritionRisk(departmentId, branchId, parseInt(limit));
    
    return ApiResponse.success(res, attritionRisk, 'Attrition risk retrieved successfully');
  });

  getHiringRecommendation = AsyncHandler(async (req, res) => {
    const { departmentId, branchId } = req.query;
    const { limit = 50 } = req.query;
    const recommendation = await executiveService.getHiringRecommendation(departmentId, branchId, parseInt(limit));
    
    return ApiResponse.success(res, recommendation, 'Hiring recommendation retrieved successfully');
  });

  getWorkforceCapacity = AsyncHandler(async (req, res) => {
    const { departmentId, branchId, period = 'this_month' } = req.query;
    const capacity = await executiveService.getWorkforceCapacity(departmentId, branchId, period);
    
    return ApiResponse.success(res, capacity, 'Workforce capacity retrieved successfully');
  });

  getOrganizationRisk = AsyncHandler(async (req, res) => {
    const { category } = req.query;
    const { limit = 50 } = req.query;
    const risk = await executiveService.getOrganizationRisk(category, parseInt(limit));
    
    return ApiResponse.success(res, risk, 'Organization risk retrieved successfully');
  });

  // Reports Endpoints
  generateCEOReport = AsyncHandler(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;
    const report = await executiveService.generateCEOReport(startDate, endDate, format);
    
    return ApiResponse.success(res, report, 'CEO report generated successfully');
  });

  generateBoardReport = AsyncHandler(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;
    const report = await executiveService.generateBoardReport(startDate, endDate, format);
    
    return ApiResponse.success(res, report, 'Board report generated successfully');
  });

  generateMonthlyExecutiveReport = AsyncHandler(async (req, res) => {
    const { year, month, format = 'json' } = req.query;
    const report = await executiveService.generateMonthlyExecutiveReport(parseInt(year), parseInt(month), format);
    
    return ApiResponse.success(res, report, 'Monthly executive report generated successfully');
  });

  generateQuarterlyExecutiveReport = AsyncHandler(async (req, res) => {
    const { year, quarter, format = 'json' } = req.query;
    const report = await executiveService.generateQuarterlyExecutiveReport(parseInt(year), parseInt(quarter), format);
    
    return ApiResponse.success(res, report, 'Quarterly executive report generated successfully');
  });

  generateAnnualExecutiveReport = AsyncHandler(async (req, res) => {
    const { year, format = 'json' } = req.query;
    const report = await executiveService.generateAnnualExecutiveReport(parseInt(year), format);
    
    return ApiResponse.success(res, report, 'Annual executive report generated successfully');
  });

  generateDepartmentReport = AsyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;
    const report = await executiveService.generateDepartmentReport(departmentId, startDate, endDate, format);
    
    return ApiResponse.success(res, report, 'Department report generated successfully');
  });

  generateOrganizationReport = AsyncHandler(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;
    const report = await executiveService.generateOrganizationReport(startDate, endDate, format);
    
    return ApiResponse.success(res, report, 'Organization report generated successfully');
  });

  generatePerformanceReport = AsyncHandler(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;
    const report = await executiveService.generatePerformanceReport(startDate, endDate, format);
    
    return ApiResponse.success(res, report, 'Performance report generated successfully');
  });

  generateProductivityReport = AsyncHandler(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;
    const report = await executiveService.generateProductivityReport(startDate, endDate, format);
    
    return ApiResponse.success(res, report, 'Productivity report generated successfully');
  });

  generateGrowthReport = AsyncHandler(async (req, res) => {
    const { startDate, endDate, format = 'json' } = req.query;
    const report = await executiveService.generateGrowthReport(startDate, endDate, format);
    
    return ApiResponse.success(res, report, 'Growth report generated successfully');
  });

  // Business Intelligence Endpoints
  getOrganizationKPIs = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getOrganizationKPIs(period);
    
    return ApiResponse.success(res, kpis, 'Organization KPIs retrieved successfully');
  });

  getDepartmentKPIs = AsyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getDepartmentKPIs(departmentId, period);
    
    return ApiResponse.success(res, kpis, 'Department KPIs retrieved successfully');
  });

  getBranchKPIs = AsyncHandler(async (req, res) => {
    const { branchId } = req.params;
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getBranchKPIs(branchId, period);
    
    return ApiResponse.success(res, kpis, 'Branch KPIs retrieved successfully');
  });

  getAttendanceKPIs = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getAttendanceKPIs(period);
    
    return ApiResponse.success(res, kpis, 'Attendance KPIs retrieved successfully');
  });

  getTaskKPIs = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getTaskKPIs(period);
    
    return ApiResponse.success(res, kpis, 'Task KPIs retrieved successfully');
  });

  getMeetingKPIs = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getMeetingKPIs(period);
    
    return ApiResponse.success(res, kpis, 'Meeting KPIs retrieved successfully');
  });

  getProjectKPIs = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getProjectKPIs(period);
    
    return ApiResponse.success(res, kpis, 'Project KPIs retrieved successfully');
  });

  getPerformanceKPIs = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getPerformanceKPIs(period);
    
    return ApiResponse.success(res, kpis, 'Performance KPIs retrieved successfully');
  });

  getProductivityKPIs = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getProductivityKPIs(period);
    
    return ApiResponse.success(res, kpis, 'Productivity KPIs retrieved successfully');
  });

  getGrowthKPIs = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const kpis = await executiveService.getGrowthKPIs(period);
    
    return ApiResponse.success(res, kpis, 'Growth KPIs retrieved successfully');
  });

  getExecutiveMetrics = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const metrics = await executiveService.getExecutiveMetrics(period);
    
    return ApiResponse.success(res, metrics, 'Executive metrics retrieved successfully');
  });

  // Composite Endpoints
  getExecutiveDashboard = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const dashboard = await executiveService.getExecutiveDashboard(period);
    
    return ApiResponse.success(res, dashboard, 'Executive dashboard retrieved successfully');
  });

  getBusinessIntelligence = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const bi = await executiveService.getBusinessIntelligence(period);
    
    return ApiResponse.success(res, bi, 'Business intelligence retrieved successfully');
  });

  getExecutiveIntelligence = AsyncHandler(async (req, res) => {
    const { period = 'this_month' } = req.query;
    const intelligence = await executiveService.getExecutiveIntelligence(period);
    
    return ApiResponse.success(res, intelligence, 'Executive intelligence retrieved successfully');
  });
}

const executiveController = new ExecutiveController();
export default executiveController;
