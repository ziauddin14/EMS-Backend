import taskRepository from './task.repository.js';
import { TASK_MESSAGES, TASK_STATUS, TASK_PRIORITY, TASK_CATEGORY } from './task.constants.js';
import AppError from '../../core/errors/AppError.js';
import { validateEmployeeAssignment, validateProjectForTask, detectCircularDependency, validateStatusTransition, extractMentions } from './task.helpers.js';

class TaskService {
  async createTask(taskData, createdBy) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    if (taskData.taskNumber) {
      taskData.taskNumber = taskData.taskNumber.toUpperCase();
      const existingTask = await taskRepository.existsByNumber(taskData.taskNumber);
      if (existingTask) {
        throw new AppError(TASK_MESSAGES.ALREADY_EXISTS, 409);
      }
    }

    if (taskData.project) {
      const projectExists = await Project.exists({ _id: taskData.project, isDeleted: false });
      if (!projectExists) {
        throw new AppError('Project not found', 404);
      }
    }

    if (taskData.department) {
      const departmentExists = await Department.exists({ _id: taskData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found', 404);
      }
    }

    if (taskData.assignedBy) {
      const assignerExists = await Employee.exists({ _id: taskData.assignedBy, isDeleted: false });
      if (!assignerExists) {
        throw new AppError('Assigner not found', 404);
      }
    }

    if (taskData.assignedTo) {
      const assigneeExists = await Employee.exists({ _id: taskData.assignedTo, isDeleted: false });
      if (!assigneeExists) {
        throw new AppError('Assignee not found', 404);
      }
    }

    if (taskData.reviewer) {
      const reviewerExists = await Employee.exists({ _id: taskData.reviewer, isDeleted: false });
      if (!reviewerExists) {
        throw new AppError('Reviewer not found', 404);
      }
    }

    if (taskData.parentTask) {
      const parentExists = await taskRepository.exists(taskData.parentTask);
      if (!parentExists) {
        throw new AppError('Parent task not found', 404);
      }
    }

    if (taskData.startDate && taskData.dueDate) {
      if (new Date(taskData.startDate) > new Date(taskData.dueDate)) {
        throw new AppError(TASK_MESSAGES.INVALID_DATES, 400);
      }
    }

    if (taskData.status && !Object.values(TASK_STATUS).includes(taskData.status)) {
      throw new AppError(TASK_MESSAGES.INVALID_STATUS, 400);
    }

    if (taskData.priority && !Object.values(TASK_PRIORITY).includes(taskData.priority)) {
      throw new AppError(TASK_MESSAGES.INVALID_PRIORITY, 400);
    }

    if (taskData.category && !Object.values(TASK_CATEGORY).includes(taskData.category)) {
      throw new AppError(TASK_MESSAGES.INVALID_CATEGORY, 400);
    }

    taskData.createdBy = createdBy;
    const task = await taskRepository.create(taskData);
    return await taskRepository.findById(task._id);
  }

  async getTaskById(id) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }
    return task;
  }

  async getAllTasks(options = {}) {
    return await taskRepository.findAll(options);
  }

  async updateTask(id, updateData, updatedBy) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    if (updateData.taskNumber) {
      updateData.taskNumber = updateData.taskNumber.toUpperCase();
      const existingTask = await taskRepository.existsByNumber(updateData.taskNumber);
      if (existingTask && existingTask._id.toString() !== id) {
        throw new AppError(TASK_MESSAGES.ALREADY_EXISTS, 409);
      }
    }

    if (updateData.project) {
      const Project = (await import('../project/project.model.js')).default;
      const projectExists = await Project.exists({ _id: updateData.project, isDeleted: false });
      if (!projectExists) {
        throw new AppError('Project not found', 404);
      }
    }

    if (updateData.department) {
      const Department = (await import('../department/department.model.js')).default;
      const departmentExists = await Department.exists({ _id: updateData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found', 404);
      }
    }

    if (updateData.assignedBy || updateData.assignedTo || updateData.reviewer) {
      const Employee = (await import('../employee/employee.model.js')).default;
      if (updateData.assignedBy) {
        const assignerExists = await Employee.exists({ _id: updateData.assignedBy, isDeleted: false });
        if (!assignerExists) throw new AppError('Assigner not found', 404);
      }
      if (updateData.assignedTo) {
        const assigneeExists = await Employee.exists({ _id: updateData.assignedTo, isDeleted: false });
        if (!assigneeExists) throw new AppError('Assignee not found', 404);
      }
      if (updateData.reviewer) {
        const reviewerExists = await Employee.exists({ _id: updateData.reviewer, isDeleted: false });
        if (!reviewerExists) throw new AppError('Reviewer not found', 404);
      }
    }

    if (updateData.parentTask) {
      const parentExists = await taskRepository.exists(updateData.parentTask);
      if (!parentExists) {
        throw new AppError('Parent task not found', 404);
      }
    }

    if (updateData.startDate || updateData.dueDate) {
      const startDate = updateData.startDate || task.startDate;
      const dueDate = updateData.dueDate || task.dueDate;
      if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
        throw new AppError(TASK_MESSAGES.INVALID_DATES, 400);
      }
    }

    if (updateData.status && !Object.values(TASK_STATUS).includes(updateData.status)) {
      throw new AppError(TASK_MESSAGES.INVALID_STATUS, 400);
    }

    if (updateData.priority && !Object.values(TASK_PRIORITY).includes(updateData.priority)) {
      throw new AppError(TASK_MESSAGES.INVALID_PRIORITY, 400);
    }

    if (updateData.category && !Object.values(TASK_CATEGORY).includes(updateData.category)) {
      throw new AppError(TASK_MESSAGES.INVALID_CATEGORY, 400);
    }

    if (updateData.completionPercentage !== undefined) {
      if (updateData.completionPercentage < 0 || updateData.completionPercentage > 100) {
        throw new AppError(TASK_MESSAGES.INVALID_COMPLETION, 400);
      }
    }

    updateData.updatedBy = updatedBy;
    return await taskRepository.updateById(id, updateData);
  }

  async deleteTask(id, deletedBy) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    if (task.subTasks && task.subTasks.length > 0) {
      throw new AppError(TASK_MESSAGES.TASK_HAS_SUBTASKS, 400);
    }

    if (task.dependencies && task.dependencies.length > 0) {
      throw new AppError(TASK_MESSAGES.TASK_HAS_DEPENDENCIES, 400);
    }

    return await taskRepository.softDelete(id, deletedBy);
  }

  async restoreTask(id) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }
    return await taskRepository.restore(id);
  }

  async getActiveTasks() {
    return await taskRepository.findActive();
  }

  async getArchivedTasks() {
    return await taskRepository.findArchived();
  }

  async getTasksByProject(projectId) {
    return await taskRepository.findByProject(projectId);
  }

  async getTasksByEmployee(employeeId) {
    return await taskRepository.findByEmployee(employeeId);
  }

  async getTasksByDepartment(departmentId) {
    return await taskRepository.findByDepartment(departmentId);
  }

  async getTasksByStatus(status) {
    if (!Object.values(TASK_STATUS).includes(status)) {
      throw new AppError(TASK_MESSAGES.INVALID_STATUS, 400);
    }
    return await taskRepository.findByStatus(status);
  }

  async getTasksByPriority(priority) {
    if (!Object.values(TASK_PRIORITY).includes(priority)) {
      throw new AppError(TASK_MESSAGES.INVALID_PRIORITY, 400);
    }
    return await taskRepository.findByPriority(priority);
  }

  async getTasksByCategory(category) {
    if (!Object.values(TASK_CATEGORY).includes(category)) {
      throw new AppError(TASK_MESSAGES.INVALID_CATEGORY, 400);
    }
    return await taskRepository.findByCategory(category);
  }

  async getOverdueTasks() {
    return await taskRepository.findOverdue();
  }

  async getDueSoonTasks(days = 7) {
    return await taskRepository.findDueSoon(days);
  }

  async getTasksByParent(parentTaskId) {
    return await taskRepository.findByParent(parentTaskId);
  }

  async searchTasks(searchTerm, options = {}) {
    return await taskRepository.search(searchTerm, options);
  }

  async getTaskStatistics(filters = {}) {
    return await taskRepository.statistics(filters);
  }

  async getEmployeeStatistics(employeeId) {
    return await taskRepository.employeeStatistics(employeeId);
  }

  async getProjectStatistics(projectId) {
    return await taskRepository.projectStatistics(projectId);
  }

  async addSubTask(taskId, subTaskId) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const subTaskExists = await taskRepository.exists(subTaskId);
    if (!subTaskExists) {
      throw new AppError('Sub task not found', 404);
    }

    return await task.addSubTask(subTaskId);
  }

  async removeSubTask(taskId, subTaskId) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }
    return await task.removeSubTask(subTaskId);
  }

  async addDependency(taskId, dependencyId) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const dependencyExists = await taskRepository.exists(dependencyId);
    if (!dependencyExists) {
      throw new AppError('Dependency task not found', 404);
    }

    return await task.addDependency(dependencyId);
  }

  async removeDependency(taskId, dependencyId) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }
    return await task.removeDependency(dependencyId);
  }

  async archiveTask(taskId) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }
    return await task.archive();
  }

  async unarchiveTask(taskId) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }
    return await task.unarchive();
  }

  async updateProgress(taskId, percentage) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }
    return await task.updateProgress(percentage);
  }

  async updateSpentHours(taskId, hours) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }
    return await task.updateSpentHours(hours);
  }

  async assignTask(taskId, employeeId, assignedBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const employeeValidation = await validateEmployeeAssignment(employeeId);
    if (!employeeValidation.valid) {
      throw new AppError(employeeValidation.message, 400);
    }

    if (task.assignedTo && task.assignedTo.toString() === employeeId.toString()) {
      throw new AppError('Task is already assigned to this employee', 400);
    }

    const oldAssignee = task.assignedTo;
    const updatedTask = await taskRepository.updateById(taskId, {
      assignedTo: employeeId,
      assignedBy,
      updatedBy: assignedBy
    });

    await this.logActivity(taskId, 'assign', assignedBy, {
      oldValue: oldAssignee,
      newValue: employeeId,
      fieldChanged: 'assignedTo'
    });

    return updatedTask;
  }

  async reassignTask(taskId, employeeId, reassignedBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const employeeValidation = await validateEmployeeAssignment(employeeId);
    if (!employeeValidation.valid) {
      throw new AppError(employeeValidation.message, 400);
    }

    if (!task.assignedTo) {
      throw new AppError('Task is not assigned to anyone', 400);
    }

    if (task.assignedTo.toString() === employeeId.toString()) {
      throw new AppError('Task is already assigned to this employee', 400);
    }

    const oldAssignee = task.assignedTo;
    const updatedTask = await taskRepository.updateById(taskId, {
      assignedTo: employeeId,
      updatedBy: reassignedBy
    });

    await this.logActivity(taskId, 'reassign', reassignedBy, {
      oldValue: oldAssignee,
      newValue: employeeId,
      fieldChanged: 'assignedTo'
    });

    return updatedTask;
  }

  async assignMultipleEmployees(taskId, employeeIds, assignedBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const validEmployeeIds = [];
    for (const employeeId of employeeIds) {
      const validation = await validateEmployeeAssignment(employeeId);
      if (!validation.valid) {
        throw new AppError(validation.message, 400);
      }
      validEmployeeIds.push(employeeId);
    }

    const oldAssignee = task.assignedTo;
    const updatedTask = await taskRepository.updateById(taskId, {
      assignedTo: validEmployeeIds[0],
      updatedBy: assignedBy
    });

    await this.logActivity(taskId, 'assign', assignedBy, {
      oldValue: oldAssignee,
      newValue: validEmployeeIds[0],
      fieldChanged: 'assignedTo'
    });

    return updatedTask;
  }

  async assignReviewer(taskId, reviewerId, assignedBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const employeeValidation = await validateEmployeeAssignment(reviewerId);
    if (!employeeValidation.valid) {
      throw new AppError(employeeValidation.message, 400);
    }

    const oldReviewer = task.reviewer;
    const updatedTask = await taskRepository.updateById(taskId, {
      reviewer: reviewerId,
      updatedBy: assignedBy
    });

    await this.logActivity(taskId, 'assign_reviewer', assignedBy, {
      oldValue: oldReviewer,
      newValue: reviewerId,
      fieldChanged: 'reviewer'
    });

    return updatedTask;
  }

  async moveTaskToProject(taskId, newProjectId, movedBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const projectValidation = await validateProjectForTask(newProjectId);
    if (!projectValidation.valid) {
      throw new AppError(projectValidation.message, 400);
    }

    const oldProject = task.project;
    const updatedTask = await taskRepository.updateById(taskId, {
      project: newProjectId,
      updatedBy: movedBy
    });

    await this.logActivity(taskId, 'move', movedBy, {
      oldValue: oldProject,
      newValue: newProjectId,
      fieldChanged: 'project'
    });

    return updatedTask;
  }

  async cloneTask(taskId, clonedBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const clonedData = {
      ...task.toObject(),
      _id: undefined,
      taskNumber: `${task.taskNumber}-CLONE`,
      title: `${task.title} (Copy)`,
      subTasks: [],
      dependencies: [],
      commentsCount: 0,
      checklistCount: 0,
      workLogCount: 0,
      isOverdue: false,
      createdBy: clonedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const clonedTask = await taskRepository.create(clonedData);
    await this.logActivity(clonedTask._id, 'create', clonedBy, {
      description: 'Task cloned from ' + taskId
    });

    return await taskRepository.findById(clonedTask._id);
  }

  async duplicateTask(taskId, duplicatedBy) {
    return await this.cloneTask(taskId, duplicatedBy);
  }

  async cancelTask(taskId, cancelledBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    if (task.status === TASK_STATUS.CANCELLED) {
      throw new AppError('Task is already cancelled', 400);
    }

    const updatedTask = await taskRepository.updateById(taskId, {
      status: TASK_STATUS.CANCELLED,
      updatedBy: cancelledBy
    });

    await this.logActivity(taskId, 'status_change', cancelledBy, {
      oldValue: task.status,
      newValue: TASK_STATUS.CANCELLED,
      fieldChanged: 'status'
    });

    return updatedTask;
  }

  async changeTaskStatus(taskId, newStatus, changedBy, userRole) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    if (!Object.values(TASK_STATUS).includes(newStatus)) {
      throw new AppError(TASK_MESSAGES.INVALID_STATUS, 400);
    }

    const validation = await validateStatusTransition(task, newStatus, userRole);
    if (!validation.canTransition) {
      throw new AppError(validation.message, 400);
    }

    const oldStatus = task.status;
    const updatedTask = await taskRepository.updateById(taskId, {
      status: newStatus,
      updatedBy: changedBy
    });

    if (newStatus === TASK_STATUS.COMPLETED) {
      updatedTask.completedAt = new Date();
      updatedTask.completionPercentage = 100;
      await updatedTask.save();
    }

    await this.logActivity(taskId, 'status_change', changedBy, {
      oldValue: oldStatus,
      newValue: newStatus,
      fieldChanged: 'status'
    });

    return updatedTask;
  }

  async changeTaskPriority(taskId, newPriority, changedBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    if (!Object.values(TASK_PRIORITY).includes(newPriority)) {
      throw new AppError(TASK_MESSAGES.INVALID_PRIORITY, 400);
    }

    const oldPriority = task.priority;
    const updatedTask = await taskRepository.updateById(taskId, {
      priority: newPriority,
      updatedBy: changedBy
    });

    await this.logActivity(taskId, 'priority_change', changedBy, {
      oldValue: oldPriority,
      newValue: newPriority,
      fieldChanged: 'priority'
    });

    return updatedTask;
  }

  async addTaskDependency(taskId, dependencyId, addedBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const circularCheck = await detectCircularDependency(taskId, dependencyId);
    if (circularCheck.hasCircular) {
      throw new AppError(circularCheck.message, 400);
    }

    if (task.dependencies.includes(dependencyId)) {
      throw new AppError('Dependency already exists', 400);
    }

    const updatedTask = await task.addDependency(dependencyId);
    await this.logActivity(taskId, 'add_dependency', addedBy, {
      newValue: dependencyId,
      fieldChanged: 'dependencies'
    });

    return updatedTask;
  }

  async removeTaskDependency(taskId, dependencyId, removedBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    if (!task.dependencies.includes(dependencyId)) {
      throw new AppError('Dependency does not exist', 400);
    }

    const updatedTask = await task.removeDependency(dependencyId);
    await this.logActivity(taskId, 'remove_dependency', removedBy, {
      oldValue: dependencyId,
      fieldChanged: 'dependencies'
    });

    return updatedTask;
  }

  async createChecklist(taskId, checklistData, createdBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const Checklist = (await import('./checklist.model.js')).default;
    const checklist = await Checklist.create({
      task: taskId,
      title: checklistData.title,
      description: checklistData.description,
      order: checklistData.order || 0,
      createdBy
    });

    await taskRepository.updateById(taskId, {
      $inc: { checklistCount: 1 }
    });

    await this.logActivity(taskId, 'add_checklist', createdBy, {
      newValue: checklist._id,
      fieldChanged: 'checklistCount'
    });

    return checklist;
  }

  async updateChecklist(checklistId, updateData, updatedBy) {
    const Checklist = (await import('./checklist.model.js')).default;
    const checklist = await Checklist.findById(checklistId);
    
    if (!checklist) {
      throw new AppError('Checklist not found', 404);
    }

    if (updateData.isCompleted !== undefined) {
      checklist.isCompleted = updateData.isCompleted;
      if (updateData.isCompleted) {
        checklist.completedAt = new Date();
        checklist.completedBy = updatedBy;
      }
    }

    if (updateData.title) checklist.title = updateData.title;
    if (updateData.description) checklist.description = updateData.description;
    if (updateData.order !== undefined) checklist.order = updateData.order;

    checklist.updatedBy = updatedBy;
    await checklist.save();

    const Task = (await import('./task.model.js')).default;
    const task = await Task.findById(checklist.task);
    
    if (task) {
      const Checklist = (await import('./checklist.model.js')).default;
      const totalChecklists = await Checklist.countByTask(checklist.task);
      const completedChecklists = await Checklist.countCompletedByTask(checklist.task);
      const progress = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0;
      
      await taskRepository.updateById(checklist.task, {
        completionPercentage: Math.round(progress)
      });
    }

    await this.logActivity(checklist.task, 'update_checklist', updatedBy, {
      newValue: checklistId,
      fieldChanged: 'checklist'
    });

    return checklist;
  }

  async deleteChecklist(checklistId, deletedBy) {
    const Checklist = (await import('./checklist.model.js')).default;
    const checklist = await Checklist.findById(checklistId);
    
    if (!checklist) {
      throw new AppError('Checklist not found', 404);
    }

    await Checklist.findByIdAndUpdate(checklistId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy
    });

    await taskRepository.updateById(checklist.task, {
      $inc: { checklistCount: -1 }
    });

    await this.logActivity(checklist.task, 'delete_checklist', deletedBy, {
      oldValue: checklistId,
      fieldChanged: 'checklistCount'
    });

    return { success: true };
  }

  async addComment(taskId, commentData, createdBy) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(TASK_MESSAGES.NOT_FOUND, 404);
    }

    const Comment = (await import('./comment.model.js')).default;
    const mentions = extractMentions(commentData.content);
    
    const comment = await Comment.create({
      task: taskId,
      content: commentData.content,
      mentionedEmployees: mentions,
      attachments: commentData.attachments || [],
      parentComment: commentData.parentComment || null,
      createdBy
    });

    await taskRepository.updateById(taskId, {
      $inc: { commentsCount: 1 }
    });

    await this.logActivity(taskId, 'add_comment', createdBy, {
      newValue: comment._id,
      fieldChanged: 'commentsCount'
    });

    return comment;
  }

  async updateComment(commentId, updateData, updatedBy) {
    const Comment = (await import('./comment.model.js')).default;
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.createdBy.toString() !== updatedBy.toString()) {
      throw new AppError('You can only edit your own comments', 403);
    }

    comment.content = updateData.content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    comment.editedBy = updatedBy;
    await comment.save();

    await this.logActivity(comment.task, 'update_comment', updatedBy, {
      newValue: commentId,
      fieldChanged: 'comment'
    });

    return comment;
  }

  async deleteComment(commentId, deletedBy) {
    const Comment = (await import('./comment.model.js')).default;
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    await Comment.findByIdAndUpdate(commentId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy
    });

    await taskRepository.updateById(comment.task, {
      $inc: { commentsCount: -1 }
    });

    await this.logActivity(comment.task, 'delete_comment', deletedBy, {
      oldValue: commentId,
      fieldChanged: 'commentsCount'
    });

    return { success: true };
  }

  async getTaskTimeline(taskId) {
    const ActivityTimeline = (await import('./activityTimeline.model.js')).default;
    return await ActivityTimeline.findByTask(taskId);
  }

  async bulkAssignTasks(taskIds, employeeId, assignedBy) {
    const employeeValidation = await validateEmployeeAssignment(employeeId);
    if (!employeeValidation.valid) {
      throw new AppError(employeeValidation.message, 400);
    }

    const results = [];
    for (const taskId of taskIds) {
      try {
        const task = await this.assignTask(taskId, employeeId, assignedBy);
        results.push({ taskId, success: true, task });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkReassignTasks(taskIds, employeeId, reassignedBy) {
    const employeeValidation = await validateEmployeeAssignment(employeeId);
    if (!employeeValidation.valid) {
      throw new AppError(employeeValidation.message, 400);
    }

    const results = [];
    for (const taskId of taskIds) {
      try {
        const task = await this.reassignTask(taskId, employeeId, reassignedBy);
        results.push({ taskId, success: true, task });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkArchiveTasks(taskIds, archivedBy) {
    const results = [];
    for (const taskId of taskIds) {
      try {
        const task = await this.archiveTask(taskId);
        results.push({ taskId, success: true, task });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkDeleteTasks(taskIds, deletedBy) {
    const results = [];
    for (const taskId of taskIds) {
      try {
        await this.deleteTask(taskId, deletedBy);
        results.push({ taskId, success: true });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkRestoreTasks(taskIds, restoredBy) {
    const results = [];
    for (const taskId of taskIds) {
      try {
        const task = await this.restoreTask(taskId);
        results.push({ taskId, success: true, task });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkUpdateStatus(taskIds, newStatus, updatedBy, userRole) {
    if (!Object.values(TASK_STATUS).includes(newStatus)) {
      throw new AppError(TASK_MESSAGES.INVALID_STATUS, 400);
    }

    const results = [];
    for (const taskId of taskIds) {
      try {
        const task = await this.changeTaskStatus(taskId, newStatus, updatedBy, userRole);
        results.push({ taskId, success: true, task });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkUpdatePriority(taskIds, newPriority, updatedBy) {
    if (!Object.values(TASK_PRIORITY).includes(newPriority)) {
      throw new AppError(TASK_MESSAGES.INVALID_PRIORITY, 400);
    }

    const results = [];
    for (const taskId of taskIds) {
      try {
        const task = await this.changeTaskPriority(taskId, newPriority, updatedBy);
        results.push({ taskId, success: true, task });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }

    return results;
  }

  async bulkMoveToProject(taskIds, newProjectId, movedBy) {
    const projectValidation = await validateProjectForTask(newProjectId);
    if (!projectValidation.valid) {
      throw new AppError(projectValidation.message, 400);
    }

    const results = [];
    for (const taskId of taskIds) {
      try {
        const task = await this.moveTaskToProject(taskId, newProjectId, movedBy);
        results.push({ taskId, success: true, task });
      } catch (error) {
        results.push({ taskId, success: false, error: error.message });
      }
    }

    return results;
  }

  async advancedSearch(searchCriteria, options = {}) {
    const { 
      title, 
      taskNumber, 
      assignedTo, 
      project, 
      department, 
      priority, 
      status, 
      category, 
      labels, 
      dueDateFrom, 
      dueDateTo, 
      createdFrom, 
      createdTo 
    } = searchCriteria;

    const filter = { isDeleted: false };

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (taskNumber) {
      filter.taskNumber = { $regex: taskNumber, $options: 'i' };
    }
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    if (project) {
      filter.project = project;
    }
    if (department) {
      filter.department = department;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }
    if (labels && labels.length > 0) {
      filter.labels = { $in: labels };
    }
    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
      if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
    }
    if (createdFrom || createdTo) {
      filter.createdAt = {};
      if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
      if (createdTo) filter.createdAt.$lte = new Date(createdTo);
    }

    return await taskRepository.findAll({ ...options, filter });
  }

  async logActivity(taskId, action, performedBy, metadata = {}) {
    const ActivityTimeline = (await import('./activityTimeline.model.js')).default;
    
    await ActivityTimeline.createActivity({
      entityType: 'task',
      entityId: taskId,
      action,
      performedBy,
      ...metadata
    });
  }
}

export default new TaskService();
