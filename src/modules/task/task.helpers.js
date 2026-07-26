import { TASK_STATUS } from './task.constants.js';

export const calculateTaskProgress = (spentHours, estimatedHours) => {
  if (estimatedHours === 0) return 0;
  return Math.min(100, (spentHours / estimatedHours) * 100);
};

export const isTaskOverdue = (dueDate, status) => {
  if (status === TASK_STATUS.COMPLETED || status === TASK_STATUS.CANCELLED) {
    return false;
  }
  if (!dueDate) {
    return false;
  }
  return new Date() > new Date(dueDate);
};

export const calculateRemainingHours = (estimatedHours, spentHours) => {
  return Math.max(0, estimatedHours - spentHours);
};

export const generateTaskNumber = async (projectCode) => {
  const Task = (await import('./task.model.js')).default;
  const count = await Task.countDocuments({ projectCode });
  const paddedCount = String(count + 1).padStart(4, '0');
  return `${projectCode.toUpperCase()}-TASK-${paddedCount}`;
};

export const validateTaskDependencies = async (taskId, dependencyIds) => {
  const Task = (await import('./task.model.js')).default;
  
  for (const depId of dependencyIds) {
    if (depId.toString() === taskId.toString()) {
      throw new Error('Task cannot depend on itself');
    }
    
    const depTask = await Task.findById(depId);
    if (!depTask) {
      throw new Error(`Dependency task ${depId} not found`);
    }
    
    if (depTask.dependencies.includes(taskId)) {
      throw new Error('Circular dependency detected');
    }
  }
  
  return true;
};

export const updateSubTaskProgress = async (parentTaskId) => {
  const Task = (await import('./task.model.js')).default;
  const parentTask = await Task.findById(parentTaskId);
  
  if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) {
    return 0;
  }
  
  const subTasks = await Task.find({ _id: { $in: parentTask.subTasks } });
  const totalProgress = subTasks.reduce((sum, task) => sum + task.completionPercentage, 0);
  const averageProgress = totalProgress / subTasks.length;
  
  return Math.round(averageProgress);
};

export const checkTaskCompletionCriteria = async (task) => {
  if (task.status === TASK_STATUS.COMPLETED) {
    return {
      canComplete: true,
      message: 'Task is already completed'
    };
  }
  
  if (task.subTasks && task.subTasks.length > 0) {
    const Task = (await import('./task.model.js')).default;
    const subTasks = await Task.find({ _id: { $in: task.subTasks } });
    const allSubTasksCompleted = subTasks.every(st => st.status === TASK_STATUS.COMPLETED);
    
    if (!allSubTasksCompleted) {
      return {
        canComplete: false,
        message: 'All subtasks must be completed first'
      };
    }
  }
  
  if (task.dependencies && task.dependencies.length > 0) {
    const Task = (await import('./task.model.js')).default;
    const dependencies = await Task.find({ _id: { $in: task.dependencies } });
    const allDependenciesCompleted = dependencies.every(dep => dep.status === TASK_STATUS.COMPLETED);
    
    if (!allDependenciesCompleted) {
      return {
        canComplete: false,
        message: 'All dependencies must be completed first'
      };
    }
  }
  
  return {
    canComplete: true,
    message: 'Task can be completed'
  };
};

export const getTaskPriorityScore = (priority) => {
  const priorityScores = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };
  return priorityScores[priority] || 2;
};

export const getTaskStatusScore = (status) => {
  const statusScores = {
    backlog: 1,
    todo: 2,
    in_progress: 3,
    review: 4,
    testing: 5,
    completed: 6,
    blocked: 0,
    cancelled: 0
  };
  return statusScores[status] || 0;
};

export const calculateTaskScore = (task) => {
  let score = 0;
  
  score += getTaskPriorityScore(task.priority) * 10;
  score += getTaskStatusScore(task.status) * 5;
  
  if (task.isOverdue) {
    score += 20;
  }
  
  if (task.dueDate) {
    const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 1) {
      score += 15;
    } else if (daysUntilDue <= 3) {
      score += 10;
    } else if (daysUntilDue <= 7) {
      score += 5;
    }
  }
  
  return score;
};

export const sortTasksByPriority = (tasks) => {
  return tasks.sort((a, b) => {
    const scoreA = calculateTaskScore(a);
    const scoreB = calculateTaskScore(b);
    return scoreB - scoreA;
  });
};

export const TASK_STATUS_WORKFLOW = {
  [TASK_STATUS.BACKLOG]: [TASK_STATUS.TODO],
  [TASK_STATUS.TODO]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
  [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.REVIEW, TASK_STATUS.BLOCKED, TASK_STATUS.TODO],
  [TASK_STATUS.REVIEW]: [TASK_STATUS.TESTING, TASK_STATUS.IN_PROGRESS, TASK_STATUS.BLOCKED],
  [TASK_STATUS.TESTING]: [TASK_STATUS.COMPLETED, TASK_STATUS.REVIEW, TASK_STATUS.BLOCKED],
  [TASK_STATUS.COMPLETED]: [],
  [TASK_STATUS.BLOCKED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.TODO, TASK_STATUS.CANCELLED],
  [TASK_STATUS.CANCELLED]: [TASK_STATUS.TODO]
};

export const canTransitionStatus = (currentStatus, newStatus, hasPermission = false) => {
  if (currentStatus === newStatus) {
    return { canTransition: false, message: 'Status is already the same' };
  }

  const allowedTransitions = TASK_STATUS_WORKFLOW[currentStatus] || [];
  
  if (!allowedTransitions.includes(newStatus)) {
    if (!hasPermission) {
      return { canTransition: false, message: 'Cannot skip workflow without permission' };
    }
  }

  return { canTransition: true, message: 'Status transition allowed' };
};

export const validateStatusTransition = async (task, newStatus, userRole) => {
  const hasPermission = ['admin', 'manager', 'project_manager'].includes(userRole);
  const transitionCheck = canTransitionStatus(task.status, newStatus, hasPermission);
  
  if (!transitionCheck.canTransition) {
    return transitionCheck;
  }

  if (newStatus === TASK_STATUS.COMPLETED) {
    const completionCheck = await checkTaskCompletionCriteria(task);
    if (!completionCheck.canComplete) {
      return completionCheck;
    }
  }

  if (newStatus === TASK_STATUS.TESTING) {
    if (task.status !== TASK_STATUS.REVIEW && !hasPermission) {
      return { canTransition: false, message: 'Cannot move to Testing without Review' };
    }
  }

  return { canTransition: true, message: 'Status transition validated' };
};

export const calculateProjectProgress = async (projectId) => {
  const Task = (await import('./task.model.js')).default;
  const tasks = await Task.find({ project: projectId, isDeleted: false });
  
  if (tasks.length === 0) return 0;
  
  const totalProgress = tasks.reduce((sum, task) => sum + task.completionPercentage, 0);
  return Math.round(totalProgress / tasks.length);
};

export const calculateProjectStatistics = async (projectId) => {
  const Task = (await import('./task.model.js')).default;
  const tasks = await Task.find({ project: projectId, isDeleted: false });
  
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
    pendingTasks: tasks.filter(t => t.status !== TASK_STATUS.COMPLETED && t.status !== TASK_STATUS.CANCELLED).length,
    overdueTasks: tasks.filter(t => t.isOverdue).length,
    blockedTasks: tasks.filter(t => t.status === TASK_STATUS.BLOCKED).length,
    inProgressTasks: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
    totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
    totalSpentHours: tasks.reduce((sum, t) => sum + (t.spentHours || 0), 0)
  };
};

export const calculateEmployeeProductivity = async (employeeId, startDate, endDate) => {
  const Task = (await import('./task.model.js')).default;
  const WorkLog = (await import('../worklog/worklog.model.js')).default;
  
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  
  const tasks = await Task.find({ assignedTo: employeeId, isDeleted: false, ...dateFilter });
  const worklogs = await WorkLog.find({ employee: employeeId, isDeleted: false, ...dateFilter });
  
  const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
  const averageCompletionTime = completedTasks.length > 0
    ? completedTasks.reduce((sum, t) => {
        if (t.completedAt && t.createdAt) {
          return sum + (new Date(t.completedAt) - new Date(t.createdAt));
        }
        return sum;
      }, 0) / completedTasks.length
    : 0;
  
  const totalWorkHours = worklogs.reduce((sum, w) => sum + (w.duration || 0), 0);
  
  return {
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    pendingTasks: tasks.length - completedTasks.length,
    overdueTasks: tasks.filter(t => t.isOverdue).length,
    averageCompletionTime: Math.round(averageCompletionTime / (1000 * 60 * 60 * 24)),
    totalWorkHours: Math.round(totalWorkHours / 60),
    utilization: totalWorkHours > 0 ? Math.min(100, (totalWorkHours / (40 * 60)) * 100) : 0
  };
};

export const validateEmployeeAssignment = async (employeeId) => {
  const Employee = (await import('../employee/employee.model.js')).default;
  const employee = await Employee.findById(employeeId);
  
  if (!employee) {
    return { valid: false, message: 'Employee not found' };
  }
  
  if (employee.isDeleted) {
    return { valid: false, message: 'Employee is deleted' };
  }
  
  if (!employee.isActive) {
    return { valid: false, message: 'Employee is inactive' };
  }
  
  return { valid: true, message: 'Employee is valid for assignment' };
};

export const validateProjectForTask = async (projectId) => {
  const Project = (await import('../project/project.model.js')).default;
  const project = await Project.findById(projectId);
  
  if (!project) {
    return { valid: false, message: 'Project not found' };
  }
  
  if (project.isDeleted) {
    return { valid: false, message: 'Project is deleted' };
  }
  
  if (project.isArchived) {
    return { valid: false, message: 'Project is archived' };
  }
  
  if (!project.isActive) {
    return { valid: false, message: 'Project is inactive' };
  }
  
  return { valid: true, message: 'Project is valid for task assignment' };
};

export const detectCircularDependency = async (taskId, potentialDependencyId) => {
  if (taskId.toString() === potentialDependencyId.toString()) {
    return { hasCircular: true, message: 'Task cannot depend on itself' };
  }
  
  const Task = (await import('./task.model.js')).default;
  const visited = new Set();
  
  const checkCircular = async (currentId, targetId) => {
    if (currentId.toString() === targetId.toString()) {
      return true;
    }
    
    if (visited.has(currentId.toString())) {
      return false;
    }
    
    visited.add(currentId.toString());
    
    const task = await Task.findById(currentId);
    if (!task || !task.dependencies) return false;
    
    for (const depId of task.dependencies) {
      if (await checkCircular(depId, targetId)) {
        return true;
      }
    }
    
    return false;
  };
  
  const hasCircular = await checkCircular(potentialDependencyId, taskId);
  return { hasCircular, message: hasCircular ? 'Circular dependency detected' : 'No circular dependency' };
};

export const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

export const validateWorkLogOverlap = async (employeeId, startTime, endTime, excludeWorkLogId = null) => {
  const WorkLog = (await import('../worklog/worklog.model.js')).default;
  
  const query = {
    employee: employeeId,
    isDeleted: false,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  };
  
  if (excludeWorkLogId) {
    query._id = { $ne: excludeWorkLogId };
  }
  
  const overlapping = await WorkLog.findOne(query);
  
  if (overlapping) {
    return { hasOverlap: true, message: 'Work log overlaps with existing entry' };
  }
  
  return { hasOverlap: false, message: 'No overlap detected' };
};
