import warningRepository from './warning.repository.js';
import { WARNING_TYPE, WARNING_SEVERITY, WARNING_STATUS } from './kpi.constants.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import { formatWarningNumber } from './kpi.helpers.js';

class WarningService {
  constructor() {
    this.repository = warningRepository;
    this.logger = Logger;
  }

  // Warning Issuance Methods
  async issueWarning(warningData, createdBy) {
    this.logger.info('Issuing new warning');
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    if (warningData.employee) {
      const employeeExists = await Employee.exists({ _id: warningData.employee, isDeleted: false });
      if (!employeeExists) {
        throw new AppError('Employee not found', 404);
      }
    }

    if (warningData.issuer) {
      const issuerExists = await Employee.exists({ _id: warningData.issuer, isDeleted: false });
      if (!issuerExists) {
        throw new AppError('Issuer not found', 404);
      }
    }

    if (warningData.department) {
      const departmentExists = await Department.exists({ _id: warningData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found', 404);
      }
    }

    // Generate warning number if not provided
    if (!warningData.warningNumber) {
      const year = warningData.year || new Date().getFullYear();
      const sequence = await this.repository.getSequenceNumber(year);
      warningData.warningNumber = formatWarningNumber(year, sequence);
    }

    warningData.status = WARNING_STATUS.ACTIVE;
    warningData.approvalStatus = 'pending';
    warningData.createdBy = createdBy;

    const warning = await this.repository.create(warningData);
    return warning;
  }

  async issueBulkWarnings(warningDataArray, createdBy) {
    this.logger.info(`Issuing ${warningDataArray.length} warnings`);
    
    const results = [];
    for (const warningData of warningDataArray) {
      try {
        const warning = await this.issueWarning(warningData, createdBy);
        results.push({ success: true, warning });
      } catch (error) {
        results.push({ success: false, error: error.message, data: warningData });
      }
    }

    return results;
  }

  // Warning CRUD Operations
  async createWarning(warningData, createdBy) {
    this.logger.info('Creating new warning');
    return await this.issueWarning(warningData, createdBy);
  }

  async updateWarning(warningId, updateData, updatedBy) {
    this.logger.info(`Updating warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    const forbiddenFields = ['warningNumber', 'employee', 'createdBy', 'createdAt'];
    const updateFields = Object.keys(updateData);
    const hasForbiddenField = updateFields.some(field => forbiddenFields.includes(field));
    if (hasForbiddenField) {
      throw new AppError('Cannot update protected fields', 400);
    }

    updateData.updatedBy = updatedBy;
    const updatedWarning = await this.repository.updateById(warningId, updateData);
    return updatedWarning;
  }

  async deleteWarning(warningId, deletedBy) {
    this.logger.info(`Deleting warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    await this.repository.softDeleteById(warningId, deletedBy);
  }

  // Resolution Methods
  async resolveWarning(warningId, resolverId, resolutionNotes, updatedBy) {
    this.logger.info(`Resolving warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    if (warning.status === WARNING_STATUS.RESOLVED) {
      throw new AppError('Warning already resolved', 400);
    }

    const updatedWarning = await this.repository.updateById(warningId, {
      status: WARNING_STATUS.RESOLVED,
      resolvedAt: new Date(),
      resolvedBy: resolverId,
      resolutionNotes,
      updatedBy: resolverId
    });
    return updatedWarning;
  }

  async addCorrectiveAction(warningId, actionData, updatedBy) {
    this.logger.info(`Adding corrective action to warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    const correctiveAction = {
      _id: new Date().getTime().toString(),
      description: actionData.description,
      targetDate: actionData.targetDate,
      completed: false,
      addedAt: new Date(),
      addedBy: updatedBy
    };

    const updatedWarning = await this.repository.updateById(warningId, {
      $push: { correctiveActions: correctiveAction },
      updatedBy
    });
    return updatedWarning;
  }

  async completeCorrectiveAction(warningId, actionId, updatedBy) {
    this.logger.info(`Completing corrective action ${actionId} for warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    const action = warning.correctiveActions?.find(a => a._id.toString() === actionId);
    if (!action) {
      throw new AppError('Corrective action not found', 404);
    }

    action.completed = true;
    action.completedAt = new Date();
    action.completedBy = updatedBy;

    const updatedWarning = await this.repository.updateById(warningId, {
      correctiveActions: warning.correctiveActions,
      updatedBy
    });
    return updatedWarning;
  }

  // Appeal Methods
  async appealWarning(warningId, appealReason, appealedBy) {
    this.logger.info(`Appealing warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    if (warning.appeal) {
      throw new AppError('Warning already has an appeal', 400);
    }

    const updatedWarning = await this.repository.updateById(warningId, {
      appeal: {
        reason: appealReason,
        status: 'pending',
        appealedAt: new Date(),
      },
      updatedBy: appealedBy
    });
    return updatedWarning;
  }

  async reviewAppeal(warningId, reviewerId, decision, decisionNotes, updatedBy) {
    this.logger.info(`Reviewing appeal for warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    if (!warning.appeal) {
      throw new AppError('No appeal found for this warning', 404);
    }

    warning.appeal.status = decision;
    warning.appeal.reviewedBy = reviewerId;
    warning.appeal.reviewedAt = new Date();
    warning.appeal.decisionNotes = decisionNotes;

    // If appeal is approved, resolve the warning
    if (decision === 'approved') {
      warning.status = WARNING_STATUS.RESOLVED;
      warning.resolvedAt = new Date();
      warning.resolvedBy = reviewerId;
      warning.resolutionNotes = 'Appeal approved';
    }

    const updatedWarning = await this.repository.updateById(warningId, {
      appeal: warning.appeal,
      status: warning.status,
      resolvedAt: warning.resolvedAt,
      resolvedBy: warning.resolvedBy,
      resolutionNotes: warning.resolutionNotes,
      updatedBy: reviewerId
    });
    return updatedWarning;
  }

  async approveAppeal(warningId, reviewerId, decisionNotes, updatedBy) {
    this.logger.info(`Approving appeal for warning ${warningId}`);
    return await this.reviewAppeal(warningId, reviewerId, 'approved', decisionNotes, updatedBy);
  }

  async rejectAppeal(warningId, reviewerId, decisionNotes, updatedBy) {
    this.logger.info(`Rejecting appeal for warning ${warningId}`);
    return await this.reviewAppeal(warningId, reviewerId, 'rejected', decisionNotes, updatedBy);
  }

  // Escalation Methods
  async escalateWarning(warningId, escalatedTo, escalationReason, updatedBy) {
    this.logger.info(`Escalating warning ${warningId}`);
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    const escalateToExists = await Employee.exists({ _id: escalatedTo, isDeleted: false });
    if (!escalateToExists) {
      throw new AppError('Escalation target not found', 404);
    }

    const updatedWarning = await this.repository.updateById(warningId, {
      escalation: {
        escalatedTo,
        escalationReason,
        escalatedAt: new Date(),
        escalatedBy: updatedBy
      },
      updatedBy
    });
    return updatedWarning;
  }

  // Follow-up Methods
  async setFollowUp(warningId, followUpDate, followUpNotes, updatedBy) {
    this.logger.info(`Setting follow-up for warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    const updatedWarning = await this.repository.updateById(warningId, {
      followUp: {
        followUpDate,
        followUpNotes,
        setAt: new Date(),
        setBy: updatedBy,
        completed: false
      },
      updatedBy
    });
    return updatedWarning;
  }

  async completeFollowUp(warningId, followUpNotes, updatedBy) {
    this.logger.info(`Completing follow-up for warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    warning.followUp.completed = true;
    warning.followUp.completedAt = new Date();
    warning.followUp.completedBy = updatedBy;
    if (followUpNotes) warning.followUp.completionNotes = followUpNotes;

    const updatedWarning = await this.repository.updateById(warningId, {
      followUp: warning.followUp,
      updatedBy
    });
    return updatedWarning;
  }

  // Expiry Methods
  async setExpiry(warningId, expiryDate, updatedBy) {
    this.logger.info(`Setting expiry for warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    const updatedWarning = await this.repository.updateById(warningId, {
      expiryDate,
      updatedBy
    });
    return updatedWarning;
  }

  async expireWarning(warningId, updatedBy) {
    this.logger.info(`Expiring warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    const updatedWarning = await this.repository.updateById(warningId, {
      status: WARNING_STATUS.EXPIRED,
      expiredAt: new Date(),
      updatedBy
    });
    return updatedWarning;
  }

  // Dashboard Methods
  async getDashboard(employeeId, year) {
    this.logger.info(`Getting dashboard for employee ${employeeId}`);
    
    const warnings = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const activeWarnings = warnings.filter(w => w.status === WARNING_STATUS.ACTIVE);
    const resolvedWarnings = warnings.filter(w => w.status === WARNING_STATUS.RESOLVED);
    const severeWarnings = warnings.filter(w => w.severity === WARNING_SEVERITY.HIGH);

    return {
      employeeId,
      year,
      totalWarnings: warnings.length,
      activeWarnings: activeWarnings.length,
      resolvedWarnings: resolvedWarnings.length,
      severeWarnings: severeWarnings.length,
      warnings: warnings.slice(0, 10)
    };
  }

  async getDepartmentDashboard(departmentId, year) {
    this.logger.info(`Getting department dashboard for ${departmentId}`);
    
    const warnings = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const departmentStats = await this.repository.getDepartmentWarningStats(departmentId, year);
    const unresolved = await this.repository.findUnresolved({ filter: { departmentId } });

    return {
      departmentId,
      year,
      totalWarnings: warnings.length,
      warnings: warnings.slice(0, 20),
      departmentStats,
      unresolvedCount: unresolved.length
    };
  }

  async getManagerDashboard(managerId, year) {
    this.logger.info(`Getting manager dashboard for ${managerId}`);
    
    const warnings = await this.repository.findByIssuer(managerId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const pendingAppeals = await this.repository.findPendingAppeals({ filter: { issuer: managerId } });
    const pendingFollowUp = await this.repository.findPendingFollowUp({ filter: { issuer: managerId } });

    return {
      managerId,
      year,
      totalWarnings: warnings.length,
      pendingAppeals: pendingAppeals.length,
      pendingFollowUp: pendingFollowUp.length,
      warnings: warnings.slice(0, 20)
    };
  }

  // Report Methods
  async generateReport(reportType, options) {
    this.logger.info(`Generating ${reportType} report`);
    
    const { year, departmentId, employeeId } = options;
    
    switch (reportType) {
      case 'employee-warnings':
        return await this.generateWarningReport(employeeId, year);
      case 'department-warnings':
        return await this.generateDepartmentWarningReport(departmentId, year);
      case 'organization-warnings':
        return await this.generateOrganizationWarningReport(year);
      default:
        throw new AppError('Invalid report type', 400);
    }
  }

  async generateWarningReport(employeeId, year) {
    this.logger.info(`Generating warning report for employee ${employeeId}`);
    
    const warnings = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      employeeId,
      year,
      warnings: warnings.map(warning => ({
        warningNumber: warning.warningNumber,
        type: warning.type,
        severity: warning.severity,
        status: warning.status,
        issuedDate: warning.issuedAt,
        resolvedDate: warning.resolvedAt
      })),
      summary: {
        totalWarnings: warnings.length,
        active: warnings.filter(w => w.status === WARNING_STATUS.ACTIVE).length,
        resolved: warnings.filter(w => w.status === WARNING_STATUS.RESOLVED).length,
        severe: warnings.filter(w => w.severity === WARNING_SEVERITY.HIGH).length
      }
    };

    return report;
  }

  async generateDepartmentWarningReport(departmentId, year) {
    this.logger.info(`Generating department warning report for ${departmentId}`);
    
    const warnings = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const departmentStats = await this.repository.getDepartmentWarningStats(departmentId, year);

    const report = {
      departmentId,
      year,
      warnings: warnings.slice(0, 50),
      summary: {
        totalWarnings: warnings.length,
        active: warnings.filter(w => w.status === WARNING_STATUS.ACTIVE).length,
        resolved: warnings.filter(w => w.status === WARNING_STATUS.RESOLVED).length,
        severe: warnings.filter(w => w.severity === WARNING_SEVERITY.HIGH).length
      },
      departmentStats
    };

    return report;
  }

  async generateOrganizationWarningReport(year) {
    this.logger.info(`Generating organization warning report for ${year}`);
    
    const allWarnings = await this.repository.findAll({
      filter: { year },
      sort: { createdAt: -1 }
    });

    const severityStats = await this.repository.getSeverityStats(year);

    const report = {
      year,
      summary: {
        totalWarnings: allWarnings.length,
        active: allWarnings.filter(w => w.status === WARNING_STATUS.ACTIVE).length,
        resolved: allWarnings.filter(w => w.status === WARNING_STATUS.RESOLVED).length,
        severe: allWarnings.filter(w => w.severity === WARNING_SEVERITY.HIGH).length
      },
      warnings: allWarnings.slice(0, 100),
      severityStats
    };

    return report;
  }

  // Analytics Methods
  async getAnalytics(employeeId, year) {
    this.logger.info(`Getting analytics for employee ${employeeId}`);
    
    const warnings = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const warningCount = await this.repository.getEmployeeWarningCount(employeeId, year);

    const analytics = {
      employeeId,
      year,
      totalWarnings: warnings.length,
      activeWarnings: warnings.filter(w => w.status === WARNING_STATUS.ACTIVE).length,
      resolvedWarnings: warnings.filter(w => w.status === WARNING_STATUS.RESOLVED).length,
      byType: this.groupWarningsByType(warnings),
      bySeverity: this.groupWarningsBySeverity(warnings),
      byStatus: this.groupWarningsByStatus(warnings),
      warningCount
    };

    return analytics;
  }

  async getEmployeeWarningCount(employeeId, year) {
    this.logger.info(`Getting warning count for employee ${employeeId}`);
    return await this.repository.getEmployeeWarningCount(employeeId, year);
  }

  async getDepartmentWarningStats(departmentId, year) {
    this.logger.info(`Getting department warning statistics for ${departmentId}`);
    return await this.repository.getDepartmentWarningStats(departmentId, year);
  }

  async getSeverityStats(year) {
    this.logger.info(`Getting severity statistics for ${year}`);
    return await this.repository.getSeverityStats(year);
  }

  async getUnresolvedWarnings(options) {
    this.logger.info('Getting unresolved warnings');
    return await this.repository.findUnresolved(options);
  }

  async getPendingAppeals(options) {
    this.logger.info('Getting pending appeals');
    return await this.repository.findPendingAppeals(options);
  }

  async getExpiredWarnings() {
    this.logger.info('Getting expired warnings');
    return await this.repository.findExpired();
  }

  async getPendingFollowUp() {
    this.logger.info('Getting pending follow-ups');
    return await this.repository.findPendingFollowUp();
  }

  groupWarningsByType(warnings) {
    const grouped = {};
    warnings.forEach(warning => {
      const type = warning.type;
      if (!grouped[type]) grouped[type] = 0;
      grouped[type]++;
    });
    return grouped;
  }

  groupWarningsBySeverity(warnings) {
    const grouped = {};
    warnings.forEach(warning => {
      const severity = warning.severity;
      if (!grouped[severity]) grouped[severity] = 0;
      grouped[severity]++;
    });
    return grouped;
  }

  groupWarningsByStatus(warnings) {
    const grouped = {};
    warnings.forEach(warning => {
      const status = warning.status;
      if (!grouped[status]) grouped[status] = 0;
      grouped[status]++;
    });
    return grouped;
  }

  // Automatic Detection Methods
  async detectLowPerformanceWarnings(year, periodType, periodValue) {
    this.logger.info(`Detecting low performance warnings for ${year}`);
    
    const kpiService = (await import('./kpi.service.js')).default;
    const filter = { year, evaluationPeriod: periodType, isDeleted: false };
    if (periodType === 'monthly') filter.month = periodValue;
    else if (periodType === 'quarterly') filter.quarter = periodValue;

    const allKPIs = await kpiService.repository.findAll({
      filter,
      sort: { overallScore: 1 }
    });

    const lowPerformers = allKPIs.filter(kpi => kpi.overallScore < 50);
    const warnings = lowPerformers.map(kpi => ({
      employee: kpi.employee,
      employeeName: kpi.employeeName,
      department: kpi.department,
      overallScore: kpi.overallScore,
      warningType: WARNING_TYPE.PERFORMANCE,
      severity: kpi.overallScore < 30 ? WARNING_SEVERITY.HIGH : WARNING_SEVERITY.MEDIUM,
      reason: `Low performance score of ${kpi.overallScore}`,
      recommendation: 'Performance improvement plan required'
    }));

    return warnings;
  }

  async detectAttendanceWarnings(employeeId, year) {
    this.logger.info(`Detecting attendance warnings for employee ${employeeId}`);
    
    const Attendance = (await import('../attendance/attendance.model.js')).default;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      attendanceDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    const absentDays = attendanceRecords.filter(a => a.attendanceStatus === 'absent').length;
    const lateDays = attendanceRecords.filter(a => a.lateArrival).length;
    const totalDays = attendanceRecords.length;

    const warnings = [];
    if (totalDays > 0 && (absentDays / totalDays) > 0.1) {
      warnings.push({
        employee: employeeId,
        warningType: WARNING_TYPE.ATTENDANCE,
        severity: WARNING_SEVERITY.HIGH,
        reason: `High absenteeism: ${absentDays} absent out of ${totalDays} days`,
        recommendation: 'Attendance counseling required'
      });
    }

    if (lateDays > 5) {
      warnings.push({
        employee: employeeId,
        warningType: WARNING_TYPE.DISCIPLINE,
        severity: WARNING_SEVERITY.MEDIUM,
        reason: `Frequent late arrivals: ${lateDays} instances`,
        recommendation: 'Punctuality improvement required'
      });
    }

    return warnings;
  }

  async detectTaskDeadlineWarnings(employeeId, year) {
    this.logger.info(`Detecting task deadline warnings for employee ${employeeId}`);
    
    const Task = (await import('../task/task.model.js')).default;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const tasks = await Task.find({
      assignedTo: employeeId,
      startDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    const overdueTasks = tasks.filter(t => t.dueDate < new Date() && t.status !== 'completed');
    const missedDeadlines = tasks.filter(t => t.status === 'completed' && t.completedAt > t.dueDate);

    const warnings = [];
    if (overdueTasks.length > 3) {
      warnings.push({
        employee: employeeId,
        warningType: WARNING_TYPE.DISCIPLINE,
        severity: WARNING_SEVERITY.HIGH,
        reason: `Multiple overdue tasks: ${overdueTasks.length} tasks`,
        recommendation: 'Time management improvement required'
      });
    }

    if (missedDeadlines.length > 5) {
      warnings.push({
        employee: employeeId,
        warningType: WARNING_TYPE.PERFORMANCE,
        severity: WARNING_SEVERITY.MEDIUM,
        reason: `Frequent deadline misses: ${missedDeadlines.length} tasks`,
        recommendation: 'Task prioritization improvement required'
      });
    }

    return warnings;
  }

  async detectGoalOverdueWarnings(year) {
    this.logger.info(`Detecting goal overdue warnings for ${year}`);
    
    const goalService = (await import('./goal.service.js')).default;
    const goals = await goalService.repository.findAll({
      filter: { year, status: 'active', isDeleted: false },
      sort: { dueDate: 1 }
    });

    const overdueGoals = goals.filter(g => new Date(g.dueDate) < new Date());
    const warnings = overdueGoals.map(goal => ({
      employee: goal.owner,
      warningType: WARNING_TYPE.PERFORMANCE,
      severity: WARNING_SEVERITY.MEDIUM,
      reason: `Overdue goal: ${goal.title}`,
      recommendation: 'Goal completion acceleration required'
    }));

    return warnings;
  }

  async autoGenerateWarnings(year, periodType, periodValue) {
    this.logger.info(`Auto-generating warnings for ${year}`);
    
    const lowPerformanceWarnings = await this.detectLowPerformanceWarnings(year, periodType, periodValue);
    const goalOverdueWarnings = await this.detectGoalOverdueWarnings(year);

    const allWarnings = [...lowPerformanceWarnings, ...goalOverdueWarnings];
    const generatedWarnings = [];

    for (const warningData of allWarnings) {
      try {
        const warning = await this.issueWarning(warningData, 'system');
        generatedWarnings.push({ success: true, warning });
      } catch (error) {
        generatedWarnings.push({ success: false, error: error.message, data: warningData });
      }
    }

    return generatedWarnings;
  }

  // Bulk Operations
  async bulkCreate(warningDataArray, createdBy) {
    this.logger.info(`Bulk creating ${warningDataArray.length} warnings`);
    return await this.issueBulkWarnings(warningDataArray, createdBy);
  }

  async bulkUpdate(warningIds, updateData, updatedBy) {
    this.logger.info(`Bulk updating ${warningIds.length} warnings`);
    
    const results = [];
    for (const warningId of warningIds) {
      try {
        const warning = await this.updateWarning(warningId, updateData, updatedBy);
        results.push({ success: true, warning });
      } catch (error) {
        results.push({ success: false, error: error.message, warningId });
      }
    }

    return results;
  }

  async bulkResolve(warningIds, resolverId, resolutionNotes) {
    this.logger.info(`Bulk resolving ${warningIds.length} warnings`);
    
    const results = [];
    for (const warningId of warningIds) {
      try {
        const warning = await this.resolveWarning(warningId, resolverId, resolutionNotes, resolverId);
        results.push({ success: true, warning });
      } catch (error) {
        results.push({ success: false, error: error.message, warningId });
      }
    }

    return results;
  }

  // Comment Methods
  async addComment(warningId, comment, addedBy) {
    this.logger.info(`Adding comment to warning ${warningId}`);
    
    const warning = await this.repository.findById(warningId);
    if (!warning) {
      throw new AppError('Warning not found', 404);
    }

    const commentObj = {
      comment,
      addedBy,
      addedAt: new Date()
    };

    const updatedWarning = await this.repository.updateById(warningId, {
      $push: { comments: commentObj },
      updatedBy: addedBy
    });
    return updatedWarning;
  }

  // Helper Methods
  async getEmployeeWarnings(employeeId, options) {
    return await this.repository.findByEmployee(employeeId, options);
  }

  async getDepartmentWarnings(departmentId, options) {
    return await this.repository.findByDepartment(departmentId, options);
  }

  async getIssuerWarnings(issuerId, options) {
    return await this.repository.findByIssuer(issuerId, options);
  }

  async getWarningsByType(type, options) {
    return await this.repository.findByType(type, options);
  }

  async getWarningsBySeverity(severity, options) {
    return await this.repository.findBySeverity(severity, options);
  }

  async getWarningsByStatus(status, options) {
    return await this.repository.findByStatus(status, options);
  }

  async getUnresolvedWarningsData(options) {
    return await this.repository.findUnresolved(options);
  }

  async getPendingAppealsData(options) {
    return await this.repository.findPendingAppeals(options);
  }

  async getExpiredWarningsData() {
    return await this.repository.findExpired();
  }

  async getPendingFollowUpData() {
    return await this.repository.findPendingFollowUp();
  }

  async getEmployeeWarningCountData(employeeId, year) {
    return await this.repository.getEmployeeWarningCount(employeeId, year);
  }

  async getDepartmentWarningStatsData(departmentId, year) {
    return await this.repository.getDepartmentWarningStats(departmentId, year);
  }

  async getSeverityStatsData(year) {
    return await this.repository.getSeverityStats(year);
  }
}

const warningService = new WarningService();
export default warningService;
