import kpiRepository from './kpi.repository.js';
import { KPI_STATUS, KPI_GRADE, KPI_PERFORMANCE_STATUS, EVALUATION_PERIOD } from './kpi.constants.js';
import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';
import { calculateOverallScore, determinePerformanceGrade, calculateGoalCompletion, isGoalOverdue, isGoalDueSoon } from './kpi.helpers.js';
import { formatKPINumber } from './kpi.helpers.js';

class KPIService {
  constructor() {
    this.repository = kpiRepository;
    this.logger = Logger;
  }

  // KPI Calculation Methods
  async calculateKPI(employeeId, evaluationPeriod, year, periodValue) {
    this.logger.info(`Calculating KPI for employee ${employeeId} for ${evaluationPeriod} ${year}`);
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const kpiData = {
      employee: employeeId,
      department: employee.department,
      designation: employee.designation,
      reportingManager: employee.reportingManager,
      year,
      evaluationPeriod,
      kpiData: []
    };

    if (evaluationPeriod === EVALUATION_PERIOD.MONTHLY) {
      kpiData.month = periodValue;
    } else if (evaluationPeriod === EVALUATION_PERIOD.QUARTERLY) {
      kpiData.quarter = periodValue;
    }

    // Calculate individual KPI components
    const attendanceScore = await this.calculateAttendanceScore(employeeId, year, evaluationPeriod, periodValue);
    const taskCompletionScore = await this.calculateTaskCompletionScore(employeeId, year, evaluationPeriod, periodValue);
    const taskQualityScore = await this.calculateTaskQualityScore(employeeId, year, evaluationPeriod, periodValue);
    const projectContributionScore = await this.calculateProjectContributionScore(employeeId, year, evaluationPeriod, periodValue);
    const workLogScore = await this.calculateWorkLogScore(employeeId, year, evaluationPeriod, periodValue);
    const disciplineScore = await this.calculateDisciplineScore(employeeId, year, evaluationPeriod, periodValue);
    const productivityScore = await this.calculateProductivityScore(employeeId, year, evaluationPeriod, periodValue);
    const reviewScore = await this.calculateReviewScore(employeeId, year, evaluationPeriod, periodValue);
    const communicationScore = await this.calculateCommunicationScore(employeeId, year, evaluationPeriod, periodValue);
    const innovationScore = await this.calculateInnovationScore(employeeId, year, evaluationPeriod, periodValue);
    const learningScore = await this.calculateLearningScore(employeeId, year, evaluationPeriod, periodValue);
    const meetingParticipationScore = await this.calculateMeetingParticipationScore(employeeId, year, evaluationPeriod, periodValue);

    // Get weightage configuration
    const weightage = await this.getKPIWeightage(employee.department, employee.designation);

    // Build KPI data array with weightage
    kpiData.kpiData = [
      { category: 'Attendance', weightage: weightage.attendance, targetValue: 100, actualValue: attendanceScore, score: attendanceScore },
      { category: 'Task Completion', weightage: weightage.taskCompletion, targetValue: 100, actualValue: taskCompletionScore, score: taskCompletionScore },
      { category: 'Task Quality', weightage: weightage.taskQuality, targetValue: 100, actualValue: taskQualityScore, score: taskQualityScore },
      { category: 'Project Contribution', weightage: weightage.projectContribution, targetValue: 100, actualValue: projectContributionScore, score: projectContributionScore },
      { category: 'Work Log', weightage: weightage.workLog, targetValue: 100, actualValue: workLogScore, score: workLogScore },
      { category: 'Discipline', weightage: weightage.discipline, targetValue: 100, actualValue: disciplineScore, score: disciplineScore },
      { category: 'Productivity', weightage: weightage.productivity, targetValue: 100, actualValue: productivityScore, score: productivityScore },
      { category: 'Review', weightage: weightage.review, targetValue: 100, actualValue: reviewScore, score: reviewScore },
      { category: 'Communication', weightage: weightage.communication, targetValue: 100, actualValue: communicationScore, score: communicationScore },
      { category: 'Innovation', weightage: weightage.innovation, targetValue: 100, actualValue: innovationScore, score: innovationScore },
      { category: 'Learning', weightage: weightage.learning, targetValue: 100, actualValue: learningScore, score: learningScore },
      { category: 'Meeting Participation', weightage: weightage.meetingParticipation, targetValue: 100, actualValue: meetingParticipationScore, score: meetingParticipationScore }
    ];

    // Calculate overall score
    kpiData.overallScore = calculateOverallScore(kpiData);
    kpiData.performanceGrade = determinePerformanceGrade(kpiData.overallScore);
    kpiData.status = KPI_STATUS.SUBMITTED;
    kpiData.approvalStatus = 'pending';

    // Generate KPI number
    const sequence = await this.repository.getSequenceNumber(year);
    kpiData.kpiNumber = formatKPINumber(year, sequence);

    // Create KPI record
    const kpi = await this.repository.create(kpiData);
    return kpi;
  }

  async calculateOverallScore(kpiId) {
    this.logger.info(`Calculating overall score for KPI ${kpiId}`);
    const kpi = await this.repository.findById(kpiId);
    if (!kpi) {
      throw new AppError('KPI not found', 404);
    }

    const overallScore = calculateOverallScore(kpi);
    const updatedKPI = await this.repository.updateById(kpiId, { overallScore });
    return updatedKPI;
  }

  async determineGrade(kpiId) {
    this.logger.info(`Determining grade for KPI ${kpiId}`);
    const kpi = await this.repository.findById(kpiId);
    if (!kpi) {
      throw new AppError('KPI not found', 404);
    }

    const performanceGrade = determinePerformanceGrade(kpi.overallScore);
    const performanceStatus = this.determinePerformanceStatus(kpi.overallScore);
    
    const updatedKPI = await this.repository.updateById(kpiId, { 
      performanceGrade,
      performanceStatus
    });
    return updatedKPI;
  }

  async calculateRanking(year, periodType, periodValue) {
    this.logger.info(`Calculating ranking for ${periodType} ${year}`);
    
    const filter = { year, isDeleted: false };
    if (periodType === EVALUATION_PERIOD.MONTHLY) {
      filter.month = periodValue;
    } else if (periodType === EVALUATION_PERIOD.QUARTERLY) {
      filter.quarter = periodValue;
    }

    const allKPIs = await this.repository.findAll({ filter, sort: { overallScore: -1 } });
    
    const rankingUpdates = allKPIs.map((kpi, index) => ({
      updateOne: {
        filter: { _id: kpi._id },
        update: { ranking: index + 1, percentile: ((index + 1) / allKPIs.length) * 100 }
      }
    }));

    if (rankingUpdates.length > 0) {
      await this.repository.bulkWrite(rankingUpdates);
    }

    return allKPIs;
  }

  // KPI CRUD Operations
  async createKPI(kpiData, createdBy) {
    this.logger.info('Creating new KPI');
    
    const Employee = (await import('../employee/employee.model.js')).default;
    const employee = await Employee.findById(kpiData.employee);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Check if KPI already exists for this period
    const existingKPI = await this.repository.existsForEmployeeAndPeriod(
      kpiData.employee,
      kpiData.year,
      kpiData.evaluationPeriod,
      kpiData.month || kpiData.quarter
    );
    if (existingKPI) {
      throw new AppError('KPI already exists for this period', 409);
    }

    // Generate KPI number if not provided
    if (!kpiData.kpiNumber) {
      const sequence = await this.repository.getSequenceNumber(kpiData.year);
      kpiData.kpiNumber = formatKPINumber(kpiData.year, sequence);
    }

    kpiData.department = employee.department;
    kpiData.designation = employee.designation;
    kpiData.reportingManager = employee.reportingManager;
    kpiData.createdBy = createdBy;

    const kpi = await this.repository.create(kpiData);
    return kpi;
  }

  async updateKPI(kpiId, updateData, updatedBy) {
    this.logger.info(`Updating KPI ${kpiId}`);
    const kpi = await this.repository.findById(kpiId);
    if (!kpi) {
      throw new AppError('KPI not found', 404);
    }

    const forbiddenFields = ['employee', 'year', 'evaluationPeriod', 'kpiNumber', 'createdBy', 'createdAt'];
    const updateFields = Object.keys(updateData);
    const hasForbiddenField = updateFields.some(field => forbiddenFields.includes(field));
    if (hasForbiddenField) {
      throw new AppError('Cannot update protected fields', 400);
    }

    // Recalculate overall score if kpiData is updated
    if (updateData.kpiData) {
      updateData.overallScore = calculateOverallScore({ ...kpi, ...updateData });
      updateData.performanceGrade = determinePerformanceGrade(updateData.overallScore);
    }

    updateData.updatedBy = updatedBy;
    const updatedKPI = await this.repository.updateById(kpiId, updateData);
    return updatedKPI;
  }

  async deleteKPI(kpiId, deletedBy) {
    this.logger.info(`Deleting KPI ${kpiId}`);
    const kpi = await this.repository.findById(kpiId);
    if (!kpi) {
      throw new AppError('KPI not found', 404);
    }

    await this.repository.softDeleteById(kpiId, deletedBy);
  }

  // Approval Methods
  async approveKPI(kpiId, approverId) {
    this.logger.info(`Approving KPI ${kpiId} by ${approverId}`);
    const kpi = await this.repository.findById(kpiId);
    if (!kpi) {
      throw new AppError('KPI not found', 404);
    }

    if (kpi.approvalStatus === 'approved') {
      throw new AppError('KPI already approved', 400);
    }

    const updatedKPI = await this.repository.updateById(kpiId, {
      approvalStatus: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      status: KPI_STATUS.APPROVED,
      updatedBy: approverId
    });
    return updatedKPI;
  }

  async rejectKPI(kpiId, approverId, reason) {
    this.logger.info(`Rejecting KPI ${kpiId} by ${approverId}`);
    const kpi = await this.repository.findById(kpiId);
    if (!kpi) {
      throw new AppError('KPI not found', 404);
    }

    if (kpi.approvalStatus === 'approved') {
      throw new AppError('Cannot reject approved KPI', 400);
    }

    const updatedKPI = await this.repository.updateById(kpiId, {
      approvalStatus: 'rejected',
      rejectionReason: reason,
      approvedBy: approverId,
      approvedAt: new Date(),
      status: KPI_STATUS.REJECTED,
      updatedBy: approverId
    });
    return updatedKPI;
  }

  async reviewKPI(kpiId, reviewerId, reviewData) {
    this.logger.info(`Reviewing KPI ${kpiId} by ${reviewerId}`);
    const kpi = await this.repository.findById(kpiId);
    if (!kpi) {
      throw new AppError('KPI not found', 404);
    }

    const review = {
      reviewer: reviewerId,
      reviewDate: new Date(),
      comments: reviewData?.comments || '',
      rating: reviewData?.rating || null,
      recommendations: reviewData?.recommendations || []
    };

    const updatedKPI = await this.repository.updateById(kpiId, {
      $push: { reviews: review },
      updatedBy: reviewerId
    });
    return updatedKPI;
  }

  // Individual KPI Component Calculation Methods
  async calculateAttendanceScore(employeeId, year, evaluationPeriod, periodValue) {
    const Attendance = (await import('../attendance/attendance.model.js')).default;
    
    const startDate = this.getStartDate(year, evaluationPeriod, periodValue);
    const endDate = this.getEndDate(year, evaluationPeriod, periodValue);
    
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      attendanceDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    if (attendanceRecords.length === 0) return 0;

    const presentDays = attendanceRecords.filter(a => a.attendanceStatus === 'present').length;
    const totalWorkingDays = attendanceRecords.length;
    const attendancePercentage = (presentDays / totalWorkingDays) * 100;

    // Deduct for late arrivals
    const lateArrivals = attendanceRecords.filter(a => a.lateMinutes > 0).length;
    const lateDeduction = (lateArrivals / totalWorkingDays) * 10;

    return Math.max(0, attendancePercentage - lateDeduction);
  }

  async calculateTaskCompletionScore(employeeId, year, evaluationPeriod, periodValue) {
    const Task = (await import('../task/task.model.js')).default;
    
    const startDate = this.getStartDate(year, evaluationPeriod, periodValue);
    const endDate = this.getEndDate(year, evaluationPeriod, periodValue);
    
    const tasks = await Task.find({
      assignedTo: employeeId,
      startDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionPercentage = (completedTasks / tasks.length) * 100;

    // Bonus for early completion
    const onTimeTasks = tasks.filter(t => 
      t.status === 'completed' && t.completedAt && new Date(t.completedAt) <= new Date(t.dueDate)
    ).length;
    const onTimeBonus = (onTimeTasks / tasks.length) * 5;

    return Math.min(100, completionPercentage + onTimeBonus);
  }

  async calculateTaskQualityScore(employeeId, year, evaluationPeriod, periodValue) {
    const Task = (await import('../task/task.model.js')).default;
    
    const startDate = this.getStartDate(year, evaluationPeriod, periodValue);
    const endDate = this.getEndDate(year, evaluationPeriod, periodValue);
    
    const tasks = await Task.find({
      assignedTo: employeeId,
      startDate: { $gte: startDate, $lte: endDate },
      status: 'completed',
      isDeleted: false
    }).populate('reviews');

    if (tasks.length === 0) return 0;

    let totalQualityScore = 0;
    let taskCount = 0;

    tasks.forEach(task => {
      if (task.reviews && task.reviews.length > 0) {
        const avgRating = task.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / task.reviews.length;
        totalQualityScore += (avgRating / 5) * 100;
        taskCount++;
      } else {
        // Default score for tasks without reviews
        totalQualityScore += 75;
        taskCount++;
      }
    });

    return taskCount > 0 ? totalQualityScore / taskCount : 0;
  }

  async calculateProjectContributionScore(employeeId, year, evaluationPeriod, periodValue) {
    const Task = (await import('../task/task.model.js')).default;
    
    const startDate = this.getStartDate(year, evaluationPeriod, periodValue);
    const endDate = this.getEndDate(year, evaluationPeriod, periodValue);
    
    const tasks = await Task.find({
      assignedTo: employeeId,
      project: { $exists: true },
      startDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    if (tasks.length === 0) return 0;

    const completedProjectTasks = tasks.filter(t => t.status === 'completed').length;
    const contributionScore = (completedProjectTasks / tasks.length) * 100;

    // Bonus for high-priority project tasks
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status === 'completed').length;
    const priorityBonus = (highPriorityTasks / tasks.length) * 10;

    return Math.min(100, contributionScore + priorityBonus);
  }

  async calculateWorkLogScore(employeeId, year, evaluationPeriod, periodValue) {
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    
    const startDate = this.getStartDate(year, evaluationPeriod, periodValue);
    const endDate = this.getEndDate(year, evaluationPeriod, periodValue);
    
    const workLogs = await WorkLog.find({
      employee: employeeId,
      logDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    if (workLogs.length === 0) return 0;

    const totalHours = workLogs.reduce((sum, log) => sum + (log.hours || 0), 0);
    const expectedHours = workLogs.length * 8; // Assuming 8 hours per day
    const hoursScore = Math.min(100, (totalHours / expectedHours) * 100);

    // Quality of work logs (based on descriptions)
    const detailedLogs = workLogs.filter(log => log.description && log.description.length > 50).length;
    const qualityScore = (detailedLogs / workLogs.length) * 100;

    return (hoursScore + qualityScore) / 2;
  }

  async calculateDisciplineScore(employeeId, year, evaluationPeriod, periodValue) {
    const Attendance = (await import('../attendance/attendance.model.js')).default;
    const Warning = (await import('./warning.model.js')).default;
    
    const startDate = this.getStartDate(year, evaluationPeriod, periodValue);
    const endDate = this.getEndDate(year, evaluationPeriod, periodValue);
    
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      attendanceDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    const warnings = await Warning.find({
      employee: employeeId,
      issuedDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    let disciplineScore = 100;

    // Deduct for late arrivals
    const lateArrivals = attendanceRecords.filter(a => a.lateMinutes > 0).length;
    disciplineScore -= (lateArrivals * 2);

    // Deduct for early departures
    const earlyDepartures = attendanceRecords.filter(a => a.earlyDepartureMinutes > 0).length;
    disciplineScore -= (earlyDepartures * 2);

    // Deduct for warnings
    warnings.forEach(warning => {
      if (warning.severity === 'high') disciplineScore -= 15;
      else if (warning.severity === 'medium') disciplineScore -= 10;
      else disciplineScore -= 5;
    });

    return Math.max(0, disciplineScore);
  }

  async calculateProductivityScore(employeeId, year, evaluationPeriod, periodValue) {
    const Task = (await import('../task/task.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;
    
    const startDate = this.getStartDate(year, evaluationPeriod, periodValue);
    const endDate = this.getEndDate(year, evaluationPeriod, periodValue);
    
    const tasks = await Task.find({
      assignedTo: employeeId,
      startDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    const workLogs = await WorkLog.find({
      employee: employeeId,
      logDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    if (tasks.length === 0 || workLogs.length === 0) return 0;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalHours = workLogs.reduce((sum, log) => sum + (log.hours || 0), 0);

    const tasksPerHour = totalHours > 0 ? completedTasks / totalHours : 0;
    const productivityScore = tasksPerHour * 20; // Base productivity metric

    return Math.min(100, productivityScore * 10);
  }

  async calculateReviewScore(employeeId, year, evaluationPeriod, periodValue) {
    const Task = (await import('../task/task.model.js')).default;
    
    const startDate = this.getStartDate(year, evaluationPeriod, periodValue);
    const endDate = this.getEndDate(year, evaluationPeriod, periodValue);
    
    const tasks = await Task.find({
      reviewer: employeeId,
      startDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    if (tasks.length === 0) return 0;

    const reviewedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'reviewed').length;
    const reviewScore = (reviewedTasks / tasks.length) * 100;

    return reviewScore;
  }

  async calculateCommunicationScore(employeeId, year, evaluationPeriod, periodValue) {
    // This would integrate with a communication module if available
    // For now, return a default score based on task comments
    const Task = (await import('../task/task.model.js')).default;
    
    const startDate = this.getStartDate(year, evaluationPeriod, periodValue);
    const endDate = this.getEndDate(year, evaluationPeriod, periodValue);
    
    const tasks = await Task.find({
      assignedTo: employeeId,
      startDate: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    if (tasks.length === 0) return 70; // Default score

    const tasksWithComments = tasks.filter(t => t.comments && t.comments.length > 0).length;
    const communicationScore = 70 + ((tasksWithComments / tasks.length) * 30);

    return Math.min(100, communicationScore);
  }

  async calculateInnovationScore(employeeId, year, evaluationPeriod, periodValue) {
    // This would integrate with an innovation/suggestion module
    // For now, return a default score
    return 75; // Default score - can be enhanced with innovation tracking
  }

  async calculateLearningScore(employeeId, year, evaluationPeriod, periodValue) {
    // This would integrate with a training/learning module
    // For now, return a default score
    return 75; // Default score - can be enhanced with training tracking
  }

  async calculateMeetingParticipationScore(employeeId, year, evaluationPeriod, periodValue) {
    // This would integrate with a meeting module
    // For now, return a default score
    return 75; // Default score - can be enhanced with meeting tracking
  }

  // Weightage Configuration
  async getKPIWeightage(departmentId, designationId) {
    // Default weightage configuration
    // This can be enhanced to fetch from a configuration collection
    const defaultWeightage = {
      attendance: 15,
      taskCompletion: 20,
      taskQuality: 15,
      projectContribution: 10,
      workLog: 5,
      discipline: 10,
      productivity: 10,
      review: 5,
      communication: 3,
      innovation: 2,
      learning: 3,
      meetingParticipation: 2
    };

    // Check if department-specific weightage exists
    // For now, return default weightage
    return defaultWeightage;
  }

  // Helper Methods
  getStartDate(year, evaluationPeriod, periodValue) {
    if (evaluationPeriod === EVALUATION_PERIOD.MONTHLY) {
      return new Date(year, periodValue - 1, 1);
    } else if (evaluationPeriod === EVALUATION_PERIOD.QUARTERLY) {
      const quarterStart = {
        1: new Date(year, 0, 1),
        2: new Date(year, 3, 1),
        3: new Date(year, 6, 1),
        4: new Date(year, 9, 1)
      };
      return quarterStart[periodValue];
    } else {
      return new Date(year, 0, 1);
    }
  }

  getEndDate(year, evaluationPeriod, periodValue) {
    if (evaluationPeriod === EVALUATION_PERIOD.MONTHLY) {
      return new Date(year, periodValue, 0);
    } else if (evaluationPeriod === EVALUATION_PERIOD.QUARTERLY) {
      const quarterEnd = {
        1: new Date(year, 2, 31),
        2: new Date(year, 5, 30),
        3: new Date(year, 8, 30),
        4: new Date(year, 11, 31)
      };
      return quarterEnd[periodValue];
    } else {
      return new Date(year, 11, 31);
    }
  }

  determinePerformanceStatus(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 50) return 'Needs Improvement';
    return 'Critical';
  }

  // Dashboard Methods
  async getDashboard(employeeId, year, periodType) {
    this.logger.info(`Getting dashboard for employee ${employeeId}`);
    
    const kpis = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const latestKPI = kpis[0] || null;
    const historicalTrend = await this.repository.getYearlyTrend(employeeId, [year - 2, year - 1, year]);
    const departmentAverage = latestKPI ? await this.repository.getDepartmentAverage(latestKPI.department, year) : 0;

    return {
      currentKPI: latestKPI,
      historicalTrend,
      departmentAverage,
      ranking: latestKPI?.ranking || null,
      percentile: latestKPI?.percentile || null
    };
  }

  async getDepartmentDashboard(departmentId, year, periodType) {
    this.logger.info(`Getting department dashboard for ${departmentId}`);
    
    const departmentKPIs = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { overallScore: -1 }
    });

    const topPerformers = departmentKPIs.slice(0, 10);
    const lowPerformers = departmentKPIs.slice(-10).reverse();
    const departmentAverage = await this.repository.getDepartmentAverage(departmentId, year);

    return {
      topPerformers,
      lowPerformers,
      departmentAverage,
      totalEmployees: departmentKPIs.length
    };
  }

  async getManagerDashboard(managerId, year, periodType) {
    this.logger.info(`Getting manager dashboard for ${managerId}`);
    
    const managerKPIs = await this.repository.findByManager(managerId, {
      filter: { year },
      sort: { overallScore: -1 }
    });

    const teamAverage = managerKPIs.length > 0 
      ? managerKPIs.reduce((sum, kpi) => sum + kpi.overallScore, 0) / managerKPIs.length 
      : 0;

    const topPerformers = managerKPIs.slice(0, 5);
    const lowPerformers = managerKPIs.slice(-5).reverse();

    return {
      teamAverage,
      topPerformers,
      lowPerformers,
      totalTeamMembers: managerKPIs.length
    };
  }

  // Report Methods
  async generateReport(reportType, options) {
    this.logger.info(`Generating ${reportType} report`);
    
    const { year, departmentId, employeeId, periodType } = options;
    
    switch (reportType) {
      case 'employee-kpi':
        return await this.generateKPIReport(employeeId, year, periodType);
      case 'department-kpi':
        return await this.generateDepartmentReport(departmentId, year, periodType);
      case 'organization-kpi':
        return await this.generateOrganizationReport(year, periodType);
      default:
        throw new AppError('Invalid report type', 400);
    }
  }

  async generateKPIReport(employeeId, year, periodType) {
    this.logger.info(`Generating KPI report for employee ${employeeId}`);
    
    const kpis = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const report = {
      employeeId,
      year,
      periodType,
      kpis: kpis.map(kpi => ({
        kpiNumber: kpi.kpiNumber,
        evaluationPeriod: kpi.evaluationPeriod,
        overallScore: kpi.overallScore,
        performanceGrade: kpi.performanceGrade,
        performanceStatus: kpi.performanceStatus,
        ranking: kpi.ranking,
        percentile: kpi.percentile,
        kpiData: kpi.kpiData
      })),
      summary: {
        averageScore: kpis.length > 0 ? kpis.reduce((sum, kpi) => sum + kpi.overallScore, 0) / kpis.length : 0,
        highestScore: kpis.length > 0 ? Math.max(...kpis.map(kpi => kpi.overallScore)) : 0,
        lowestScore: kpis.length > 0 ? Math.min(...kpis.map(kpi.overallScore)) : 0,
        totalKPIs: kpis.length
      }
    };

    return report;
  }

  async generateDepartmentReport(departmentId, year, periodType) {
    this.logger.info(`Generating department report for ${departmentId}`);
    
    const departmentKPIs = await this.repository.findByDepartment(departmentId, {
      filter: { year },
      sort: { overallScore: -1 }
    });

    const report = {
      departmentId,
      year,
      periodType,
      employees: departmentKPIs.map(kpi => ({
      employeeId: kpi.employee,
      employeeName: kpi.employeeName,
      overallScore: kpi.overallScore,
      performanceGrade: kpi.performanceGrade,
      ranking: kpi.ranking
    })),
      summary: {
        averageScore: departmentKPIs.length > 0 ? departmentKPIs.reduce((sum, kpi) => sum + kpi.overallScore, 0) / departmentKPIs.length : 0,
        totalEmployees: departmentKPIs.length,
        topPerformers: departmentKPIs.slice(0, 5),
        lowPerformers: departmentKPIs.slice(-5).reverse()
      }
    };

    return report;
  }

  async generateOrganizationReport(year, periodType) {
    this.logger.info(`Generating organization report for ${year}`);
    
    const allKPIs = await this.repository.findAll({
      filter: { year },
      sort: { overallScore: -1 }
    });

    const report = {
      year,
      periodType,
      summary: {
        averageScore: allKPIs.length > 0 ? allKPIs.reduce((sum, kpi) => sum + kpi.overallScore, 0) / allKPIs.length : 0,
        totalEmployees: allKPIs.length,
        topPerformers: allKPIs.slice(0, 10),
        lowPerformers: allKPIs.slice(-10).reverse()
      },
      departmentBreakdown: await this.getDepartmentBreakdown(year)
    };

    return report;
  }

  async getDepartmentBreakdown(year) {
    const departmentKPIs = await this.repository.findAll({
      filter: { year },
      sort: { overallScore: -1 }
    });

    const breakdown = {};
    departmentKPIs.forEach(kpi => {
      const deptId = kpi.department?.toString();
      if (!breakdown[deptId]) {
        breakdown[deptId] = {
          departmentId: deptId,
          departmentName: kpi.departmentName,
          averageScore: 0,
          employeeCount: 0,
          kpis: []
        };
      }
      breakdown[deptId].kpis.push(kpi.overallScore);
      breakdown[deptId].employeeCount++;
    });

    Object.keys(breakdown).forEach(deptId => {
      const dept = breakdown[deptId];
      dept.averageScore = dept.kpis.reduce((sum, score) => sum + score, 0) / dept.employeeCount;
      delete dept.kpis;
    });

    return Object.values(breakdown);
  }

  // Analytics Methods
  async getAnalytics(employeeId, year, periodType) {
    this.logger.info(`Getting analytics for employee ${employeeId}`);
    
    const kpis = await this.repository.findByEmployee(employeeId, {
      filter: { year },
      sort: { createdAt: -1 }
    });

    const analytics = {
      employeeId,
      year,
      periodType,
      currentKPI: kpis[0] || null,
      trendAnalysis: await this.getTrendAnalysis(employeeId, [year - 2, year - 1, year]),
      comparativeAnalysis: await this.getComparativeAnalysis([employeeId], year, periodType),
      strengths: this.identifyStrengths(kpis[0]),
      weaknesses: this.identifyWeaknesses(kpis[0]),
      recommendations: this.generateRecommendations(kpis[0])
    };

    return analytics;
  }

  async getTrendAnalysis(employeeId, years) {
    this.logger.info(`Getting trend analysis for employee ${employeeId}`);
    
    const trendData = await this.repository.getYearlyTrend(employeeId, years);
    
    const trend = {
      employeeId,
      years,
      data: trendData,
      improvementPercentage: this.calculateImprovementPercentage(trendData),
      growthPercentage: this.calculateGrowthPercentage(trendData),
      trendDirection: this.determineTrendDirection(trendData)
    };

    return trend;
  }

  calculateImprovementPercentage(trendData) {
    if (trendData.length < 2) return 0;
    const latest = trendData[trendData.length - 1]?.overallScore || 0;
    const previous = trendData[trendData.length - 2]?.overallScore || 0;
    if (previous === 0) return 0;
    return ((latest - previous) / previous) * 100;
  }

  calculateGrowthPercentage(trendData) {
    if (trendData.length < 2) return 0;
    const latest = trendData[trendData.length - 1]?.overallScore || 0;
    const first = trendData[0]?.overallScore || 0;
    if (first === 0) return 0;
    return ((latest - first) / first) * 100;
  }

  determineTrendDirection(trendData) {
    if (trendData.length < 3) return 'stable';
    const recent = trendData.slice(-3);
    let increasing = 0, decreasing = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].overallScore > recent[i - 1].overallScore) increasing++;
      else if (recent[i].overallScore < recent[i - 1].overallScore) decreasing++;
    }
    if (increasing > decreasing) return 'improving';
    if (decreasing > increasing) return 'declining';
    return 'stable';
  }

  async getComparativeAnalysis(employeeIds, year, periodType) {
    this.logger.info('Getting comparative analysis');
    
    const allKPIs = await this.repository.findAll({
      filter: { year },
      sort: { overallScore: -1 }
    });

    const employeeKPIs = allKPIs.filter(kpi => employeeIds.includes(kpi.employee.toString()));
    const organizationAverage = allKPIs.length > 0 ? allKPIs.reduce((sum, kpi) => sum + kpi.overallScore, 0) / allKPIs.length : 0;

    const comparison = {
      employeeIds,
      year,
      periodType,
      employeeScores: employeeKPIs.map(kpi => ({
        employeeId: kpi.employee,
        overallScore: kpi.overallScore,
        ranking: kpi.ranking,
        percentile: kpi.percentile
      })),
      organizationAverage,
      aboveAverage: employeeKPIs.filter(kpi => kpi.overallScore > organizationAverage).length,
      belowAverage: employeeKPIs.filter(kpi => kpi.overallScore < organizationAverage).length
    };

    return comparison;
  }

  identifyStrengths(kpi) {
    if (!kpi || !kpi.kpiData) return [];
    return kpi.kpiData.filter(item => item.score >= 80).map(item => item.category);
  }

  identifyWeaknesses(kpi) {
    if (!kpi || !kpi.kpiData) return [];
    return kpi.kpiData.filter(item => item.score < 60).map(item => item.category);
  }

  generateRecommendations(kpi) {
    if (!kpi) return [];
    const recommendations = [];
    const weaknesses = this.identifyWeaknesses(kpi);
    
    weaknesses.forEach(weakness => {
      switch (weakness) {
        case 'Attendance':
          recommendations.push('Improve punctuality and attendance consistency');
          break;
        case 'Task Completion':
          recommendations.push('Focus on completing tasks on time');
          break;
        case 'Task Quality':
          recommendations.push('Improve quality of deliverables');
          break;
        case 'Productivity':
          recommendations.push('Enhance work efficiency and output');
          break;
        default:
          recommendations.push(`Focus on improving ${weakness}`);
      }
    });

    return recommendations;
  }

  // Bulk Operations
  async bulkCreate(kpiDataArray, createdBy) {
    this.logger.info(`Bulk creating ${kpiDataArray.length} KPIs`);
    
    const results = [];
    for (const kpiData of kpiDataArray) {
      try {
        const kpi = await this.createKPI(kpiData, createdBy);
        results.push({ success: true, kpi });
      } catch (error) {
        results.push({ success: false, error: error.message, data: kpiData });
      }
    }

    return results;
  }

  async bulkUpdate(kpiIds, updateData, updatedBy) {
    this.logger.info(`Bulk updating ${kpiIds.length} KPIs`);
    
    const results = [];
    for (const kpiId of kpiIds) {
      try {
        const kpi = await this.updateKPI(kpiId, updateData, updatedBy);
        results.push({ success: true, kpi });
      } catch (error) {
        results.push({ success: false, error: error.message, kpiId });
      }
    }

    return results;
  }

  async bulkApprove(kpiIds, approverId) {
    this.logger.info(`Bulk approving ${kpiIds.length} KPIs`);
    
    const results = [];
    for (const kpiId of kpiIds) {
      try {
        const kpi = await this.approveKPI(kpiId, approverId);
        results.push({ success: true, kpi });
      } catch (error) {
        results.push({ success: false, error: error.message, kpiId });
      }
    }

    return results;
  }

  async bulkCalculate(employeeIds, evaluationPeriod, year, periodValue) {
    this.logger.info(`Bulk calculating KPIs for ${employeeIds.length} employees`);
    
    const results = [];
    for (const employeeId of employeeIds) {
      try {
        const kpi = await this.calculateKPI(employeeId, evaluationPeriod, year, periodValue);
        results.push({ success: true, kpi, employeeId });
      } catch (error) {
        results.push({ success: false, error: error.message, employeeId });
      }
    }

    return results;
  }

  // Export/Import Methods
  async exportKPIs(options) {
    this.logger.info('Exporting KPIs');
    
    const { year, departmentId, employeeId, format } = options;
    const filter = { year, isDeleted: false };
    if (departmentId) filter.department = departmentId;
    if (employeeId) filter.employee = employeeId;

    const kpis = await this.repository.findAll({ filter });
    
    const exportData = kpis.map(kpi => ({
      kpiNumber: kpi.kpiNumber,
      employee: kpi.employee,
      employeeName: kpi.employeeName,
      department: kpi.department,
      departmentName: kpi.departmentName,
      year: kpi.year,
      evaluationPeriod: kpi.evaluationPeriod,
      overallScore: kpi.overallScore,
      performanceGrade: kpi.performanceGrade,
      performanceStatus: kpi.performanceStatus,
      ranking: kpi.ranking,
      kpiData: kpi.kpiData
    }));

    return exportData;
  }

  async importKPIs(kpiDataArray, createdBy) {
    this.logger.info(`Importing ${kpiDataArray.length} KPIs`);
    
    const results = [];
    for (const kpiData of kpiDataArray) {
      try {
        const kpi = await this.createKPI(kpiData, createdBy);
        results.push({ success: true, kpi });
      } catch (error) {
        results.push({ success: false, error: error.message, data: kpiData });
      }
    }

    return results;
  }

  // Validation Methods
  async validateKPI(kpiData) {
    this.logger.info('Validating KPI data');
    
    const errors = [];

    if (!kpiData.employee) {
      errors.push('Employee is required');
    }

    if (!kpiData.year || kpiData.year < 2000 || kpiData.year > 2100) {
      errors.push('Valid year is required');
    }

    if (!kpiData.evaluationPeriod) {
      errors.push('Evaluation period is required');
    }

    if (kpiData.evaluationPeriod === EVALUATION_PERIOD.MONTHLY && !kpiData.month) {
      errors.push('Month is required for monthly evaluation');
    }

    if (kpiData.evaluationPeriod === EVALUATION_PERIOD.QUARTERLY && !kpiData.quarter) {
      errors.push('Quarter is required for quarterly evaluation');
    }

    if (kpiData.kpiData && kpiData.kpiData.length > 0) {
      let totalWeightage = 0;
      kpiData.kpiData.forEach(item => {
        if (item.weightage < 0 || item.weightage > 100) {
          errors.push(`Invalid weightage for ${item.category}`);
        }
        if (item.score < 0 || item.score > 100) {
          errors.push(`Invalid score for ${item.category}`);
        }
        totalWeightage += item.weightage;
      });

      if (Math.abs(totalWeightage - 100) > 1) {
        errors.push('Total weightage must equal 100%');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async validateScores(scores) {
    this.logger.info('Validating scores');
    
    const errors = [];

    if (!Array.isArray(scores)) {
      errors.push('Scores must be an array');
      return { valid: false, errors };
    }

    scores.forEach((score, index) => {
      if (typeof score !== 'number' || isNaN(score)) {
        errors.push(`Score at index ${index} must be a number`);
      }
      if (score < 0 || score > 100) {
        errors.push(`Score at index ${index} must be between 0 and 100`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper Methods
  async getEmployeeKPIs(employeeId, options) {
    return await this.repository.findByEmployee(employeeId, options);
  }

  async getDepartmentKPIs(departmentId, options) {
    return await this.repository.findByDepartment(departmentId, options);
  }

  async getManagerKPIs(managerId, options) {
    return await this.repository.findByManager(managerId, options);
  }

  async getTopPerformers(year, limit) {
    return await this.repository.getTopPerformers(year, limit);
  }

  async getLowPerformers(year, limit) {
    return await this.repository.getLowPerformers(year, limit);
  }

  async getDepartmentAverage(departmentId, year) {
    return await this.repository.getDepartmentAverage(departmentId, year);
  }

  async getYearlyTrend(employeeId, years) {
    return await this.repository.getYearlyTrend(employeeId, years);
  }
}

const kpiService = new KPIService();
export default kpiService;
