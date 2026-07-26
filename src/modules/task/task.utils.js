export const sanitizeTaskInput = (taskData) => {
  const sanitized = { ...taskData };
  
  if (sanitized.title) {
    sanitized.title = sanitized.title.trim();
  }
  
  if (sanitized.description) {
    sanitized.description = sanitized.description.trim();
  }
  
  if (sanitized.taskNumber) {
    sanitized.taskNumber = sanitized.taskNumber.toUpperCase().trim();
  }
  
  if (sanitized.labels && Array.isArray(sanitized.labels)) {
    sanitized.labels = sanitized.labels.map(label => label.trim()).filter(label => label.length > 0);
  }
  
  return sanitized;
};

export const formatTaskResponse = (task) => {
  return {
    id: task._id,
    taskNumber: task.taskNumber,
    title: task.title,
    description: task.description,
    project: task.project,
    department: task.department,
    assignedBy: task.assignedBy,
    assignedTo: task.assignedTo,
    reviewer: task.reviewer,
    priority: task.priority,
    status: task.status,
    category: task.category,
    labels: task.labels,
    estimatedHours: task.estimatedHours,
    spentHours: task.spentHours,
    startDate: task.startDate,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    completionPercentage: task.completionPercentage,
    parentTask: task.parentTask,
    subTasks: task.subTasks,
    dependencies: task.dependencies,
    attachments: task.attachments,
    commentsCount: task.commentsCount,
    checklistCount: task.checklistCount,
    workLogCount: task.workLogCount,
    isRecurring: task.isRecurring,
    recurringType: task.recurringType,
    isOverdue: task.isOverdue,
    isArchived: task.isArchived,
    isActive: task.isActive,
    createdAt: task.createdAt,
    updatedAt: task.updatedBy
  };
};

export const formatProjectResponse = (project) => {
  return {
    id: project._id,
    projectCode: project.projectCode,
    name: project.name,
    description: project.description,
    client: project.client,
    department: project.department,
    projectManager: project.projectManager,
    teamLeads: project.teamLeads,
    members: project.members,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    expectedEndDate: project.expectedEndDate,
    actualEndDate: project.actualEndDate,
    estimatedHours: project.estimatedHours,
    spentHours: project.spentHours,
    progress: project.progress,
    budget: project.budget,
    tags: project.tags,
    attachments: project.attachments,
    color: project.color,
    isArchived: project.isArchived,
    isActive: project.isActive,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
};

export const formatWorkLogResponse = (worklog) => {
  return {
    id: worklog._id,
    employee: worklog.employee,
    task: worklog.task,
    project: worklog.project,
    workDate: worklog.workDate,
    startTime: worklog.startTime,
    endTime: worklog.endTime,
    duration: worklog.duration,
    description: worklog.description,
    activityType: worklog.activityType,
    billable: worklog.billable,
    status: worklog.status,
    attachments: worklog.attachments,
    createdAt: worklog.createdAt,
    updatedAt: worklog.updatedAt
  };
};

export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  return Math.max(0, durationMs / (1000 * 60));
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return true;
  return new Date(startDate) <= new Date(endDate);
};

export const generateProjectCode = async (prefix = 'PRJ') => {
  const Project = (await import('../project/project.model.js')).default;
  const count = await Project.countDocuments({ projectCode: new RegExp(`^${prefix}`) });
  const paddedCount = String(count + 1).padStart(4, '0');
  return `${prefix}-${paddedCount}`;
};

export const parseFilters = (query) => {
  const filters = {};
  
  if (query.status) {
    filters.status = query.status;
  }
  
  if (query.priority) {
    filters.priority = query.priority;
  }
  
  if (query.category) {
    filters.category = query.category;
  }
  
  if (query.project) {
    filters.project = query.project;
  }
  
  if (query.department) {
    filters.department = query.department;
  }
  
  if (query.assignedTo) {
    filters.assignedTo = query.assignedTo;
  }
  
  if (query.isOverdue !== undefined) {
    filters.isOverdue = query.isOverdue === 'true';
  }
  
  if (query.isArchived !== undefined) {
    filters.isArchived = query.isArchived === 'true';
  }
  
  return filters;
};

export const parseSort = (sortString) => {
  if (!sortString) return { createdAt: -1 };
  
  try {
    return JSON.parse(sortString);
  } catch (error) {
    return { createdAt: -1 };
  }
};

export const buildPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

export const validateEmployeeAccess = (employeeId, requestedEmployeeId, userRole) => {
  if (userRole === 'admin' || userRole === 'hr') {
    return true;
  }
  
  return employeeId.toString() === requestedEmployeeId.toString();
};

export const validateProjectAccess = (project, userId, userRole) => {
  if (userRole === 'admin' || userRole === 'hr') {
    return true;
  }
  
  if (project.projectManager.toString() === userId.toString()) {
    return true;
  }
  
  if (project.teamLeads.some(lead => lead.toString() === userId.toString())) {
    return true;
  }
  
  if (project.members.some(member => member.toString() === userId.toString())) {
    return true;
  }
  
  return false;
};
