import taskService from './task.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class TaskController {
  async create(req, res, next) {
    try {
      const task = await taskService.createTask(req.body, req.user.userId);
      return ApiResponse.created(res, 'Task created successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      return ApiResponse.success(res, 'Task retrieved successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const options = {
        filter: req.query,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 },
        limit: parseInt(req.query.limit) || 100,
        skip: parseInt(req.query.skip) || 0
      };
      const tasks = await taskService.getAllTasks(options);
      return ApiResponse.success(res, 'Tasks retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.updateTask(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Task updated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await taskService.deleteTask(id, req.user.userId);
      return ApiResponse.success(res, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.restoreTask(id);
      return ApiResponse.success(res, 'Task restored successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const tasks = await taskService.getActiveTasks();
      return ApiResponse.success(res, 'Active tasks retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getArchived(req, res, next) {
    try {
      const tasks = await taskService.getArchivedTasks();
      return ApiResponse.success(res, 'Archived tasks retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getByProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const tasks = await taskService.getTasksByProject(projectId);
      return ApiResponse.success(res, 'Project tasks retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getByEmployee(req, res, next) {
    try {
      const { employeeId } = req.params;
      const tasks = await taskService.getTasksByEmployee(employeeId);
      return ApiResponse.success(res, 'Employee tasks retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getByDepartment(req, res, next) {
    try {
      const { departmentId } = req.params;
      const tasks = await taskService.getTasksByDepartment(departmentId);
      return ApiResponse.success(res, 'Department tasks retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const tasks = await taskService.getTasksByStatus(status);
      return ApiResponse.success(res, 'Tasks by status retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getByPriority(req, res, next) {
    try {
      const { priority } = req.params;
      const tasks = await taskService.getTasksByPriority(priority);
      return ApiResponse.success(res, 'Tasks by priority retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const tasks = await taskService.getTasksByCategory(category);
      return ApiResponse.success(res, 'Tasks by category retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getOverdue(req, res, next) {
    try {
      const tasks = await taskService.getOverdueTasks();
      return ApiResponse.success(res, 'Overdue tasks retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getDueSoon(req, res, next) {
    try {
      const { days = 7 } = req.query;
      const tasks = await taskService.getDueSoonTasks(parseInt(days));
      return ApiResponse.success(res, 'Due soon tasks retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getByParent(req, res, next) {
    try {
      const { parentTaskId } = req.params;
      const tasks = await taskService.getTasksByParent(parentTaskId);
      return ApiResponse.success(res, 'Subtasks retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q } = req.query;
      const options = {
        limit: parseInt(req.query.limit) || 20,
        skip: parseInt(req.query.skip) || 0
      };
      const tasks = await taskService.searchTasks(q, options);
      return ApiResponse.success(res, 'Search results retrieved successfully', { tasks });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await taskService.getTaskStatistics(req.query);
      return ApiResponse.success(res, 'Task statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeStatistics(req, res, next) {
    try {
      const { employeeId } = req.params;
      const statistics = await taskService.getEmployeeStatistics(employeeId);
      return ApiResponse.success(res, 'Employee task statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async getProjectStatistics(req, res, next) {
    try {
      const { projectId } = req.params;
      const statistics = await taskService.getProjectStatistics(projectId);
      return ApiResponse.success(res, 'Project task statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async addSubTask(req, res, next) {
    try {
      const { id } = req.params;
      const { subTaskId } = req.body;
      const task = await taskService.addSubTask(id, subTaskId);
      return ApiResponse.success(res, 'Subtask added successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async removeSubTask(req, res, next) {
    try {
      const { id } = req.params;
      const { subTaskId } = req.body;
      const task = await taskService.removeSubTask(id, subTaskId);
      return ApiResponse.success(res, 'Subtask removed successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async addDependency(req, res, next) {
    try {
      const { id } = req.params;
      const { dependencyId } = req.body;
      const task = await taskService.addDependency(id, dependencyId);
      return ApiResponse.success(res, 'Dependency added successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async removeDependency(req, res, next) {
    try {
      const { id } = req.params;
      const { dependencyId } = req.body;
      const task = await taskService.removeDependency(id, dependencyId);
      return ApiResponse.success(res, 'Dependency removed successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async archive(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.archiveTask(id);
      return ApiResponse.success(res, 'Task archived successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async unarchive(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.unarchiveTask(id);
      return ApiResponse.success(res, 'Task unarchived successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req, res, next) {
    try {
      const { id } = req.params;
      const { percentage } = req.body;
      const task = await taskService.updateProgress(id, percentage);
      return ApiResponse.success(res, 'Task progress updated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async updateSpentHours(req, res, next) {
    try {
      const { id } = req.params;
      const { hours } = req.body;
      const task = await taskService.updateSpentHours(id, hours);
      return ApiResponse.success(res, 'Task spent hours updated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async assign(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;
      const task = await taskService.assignTask(id, employeeId, req.user.userId);
      return ApiResponse.success(res, 'Task assigned successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async reassign(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;
      const task = await taskService.reassignTask(id, employeeId, req.user.userId);
      return ApiResponse.success(res, 'Task reassigned successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async assignMultiple(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeIds } = req.body;
      const task = await taskService.assignMultipleEmployees(id, employeeIds, req.user.userId);
      return ApiResponse.success(res, 'Employees assigned successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async assignReviewer(req, res, next) {
    try {
      const { id } = req.params;
      const { reviewerId } = req.body;
      const task = await taskService.assignReviewer(id, reviewerId, req.user.userId);
      return ApiResponse.success(res, 'Reviewer assigned successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async moveToProject(req, res, next) {
    try {
      const { id } = req.params;
      const { projectId } = req.body;
      const task = await taskService.moveTaskToProject(id, projectId, req.user.userId);
      return ApiResponse.success(res, 'Task moved successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async clone(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.cloneTask(id, req.user.userId);
      return ApiResponse.created(res, 'Task cloned successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.duplicateTask(id, req.user.userId);
      return ApiResponse.created(res, 'Task duplicated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.cancelTask(id, req.user.userId);
      return ApiResponse.success(res, 'Task cancelled successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async changeStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userRole = req.user.role;
      const task = await taskService.changeTaskStatus(id, status, req.user.userId, userRole);
      return ApiResponse.success(res, 'Task status changed successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async changePriority(req, res, next) {
    try {
      const { id } = req.params;
      const { priority } = req.body;
      const task = await taskService.changeTaskPriority(id, priority, req.user.userId);
      return ApiResponse.success(res, 'Task priority changed successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async addDependency(req, res, next) {
    try {
      const { id } = req.params;
      const { dependencyId } = req.body;
      const task = await taskService.addTaskDependency(id, dependencyId, req.user.userId);
      return ApiResponse.success(res, 'Dependency added successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async removeDependency(req, res, next) {
    try {
      const { id } = req.params;
      const { dependencyId } = req.body;
      const task = await taskService.removeTaskDependency(id, dependencyId, req.user.userId);
      return ApiResponse.success(res, 'Dependency removed successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  async createChecklist(req, res, next) {
    try {
      const { id } = req.params;
      const checklist = await taskService.createChecklist(id, req.body, req.user.userId);
      return ApiResponse.created(res, 'Checklist created successfully', { checklist });
    } catch (error) {
      next(error);
    }
  }

  async updateChecklist(req, res, next) {
    try {
      const { checklistId } = req.params;
      const checklist = await taskService.updateChecklist(checklistId, req.body, req.user.userId);
      return ApiResponse.success(res, 'Checklist updated successfully', { checklist });
    } catch (error) {
      next(error);
    }
  }

  async deleteChecklist(req, res, next) {
    try {
      const { checklistId } = req.params;
      await taskService.deleteChecklist(checklistId, req.user.userId);
      return ApiResponse.success(res, 'Checklist deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async addComment(req, res, next) {
    try {
      const { id } = req.params;
      const comment = await taskService.addComment(id, req.body, req.user.userId);
      return ApiResponse.created(res, 'Comment added successfully', { comment });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const comment = await taskService.updateComment(commentId, req.body, req.user.userId);
      return ApiResponse.success(res, 'Comment updated successfully', { comment });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { commentId } = req.params;
      await taskService.deleteComment(commentId, req.user.userId);
      return ApiResponse.success(res, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const { id } = req.params;
      const timeline = await taskService.getTaskTimeline(id);
      return ApiResponse.success(res, 'Task timeline retrieved successfully', { timeline });
    } catch (error) {
      next(error);
    }
  }

  async bulkAssign(req, res, next) {
    try {
      const { taskIds, employeeId } = req.body;
      const results = await taskService.bulkAssignTasks(taskIds, employeeId, req.user.userId);
      return ApiResponse.success(res, 'Bulk assign completed', { results });
    } catch (error) {
      next(error);
    }
  }

  async bulkReassign(req, res, next) {
    try {
      const { taskIds, employeeId } = req.body;
      const results = await taskService.bulkReassignTasks(taskIds, employeeId, req.user.userId);
      return ApiResponse.success(res, 'Bulk reassign completed', { results });
    } catch (error) {
      next(error);
    }
  }

  async bulkArchive(req, res, next) {
    try {
      const { taskIds } = req.body;
      const results = await taskService.bulkArchiveTasks(taskIds, req.user.userId);
      return ApiResponse.success(res, 'Bulk archive completed', { results });
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req, res, next) {
    try {
      const { taskIds } = req.body;
      const results = await taskService.bulkDeleteTasks(taskIds, req.user.userId);
      return ApiResponse.success(res, 'Bulk delete completed', { results });
    } catch (error) {
      next(error);
    }
  }

  async bulkRestore(req, res, next) {
    try {
      const { taskIds } = req.body;
      const results = await taskService.bulkRestoreTasks(taskIds, req.user.userId);
      return ApiResponse.success(res, 'Bulk restore completed', { results });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateStatus(req, res, next) {
    try {
      const { taskIds, status } = req.body;
      const userRole = req.user.role;
      const results = await taskService.bulkUpdateStatus(taskIds, status, req.user.userId, userRole);
      return ApiResponse.success(res, 'Bulk status update completed', { results });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdatePriority(req, res, next) {
    try {
      const { taskIds, priority } = req.body;
      const results = await taskService.bulkUpdatePriority(taskIds, priority, req.user.userId);
      return ApiResponse.success(res, 'Bulk priority update completed', { results });
    } catch (error) {
      next(error);
    }
  }

  async bulkMove(req, res, next) {
    try {
      const { taskIds, projectId } = req.body;
      const results = await taskService.bulkMoveToProject(taskIds, projectId, req.user.userId);
      return ApiResponse.success(res, 'Bulk move completed', { results });
    } catch (error) {
      next(error);
    }
  }

  async advancedSearch(req, res, next) {
    try {
      const searchCriteria = req.body;
      const options = {
        limit: parseInt(req.query.limit) || 100,
        skip: parseInt(req.query.skip) || 0
      };
      const tasks = await taskService.advancedSearch(searchCriteria, options);
      return ApiResponse.success(res, 'Advanced search completed', { tasks });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
