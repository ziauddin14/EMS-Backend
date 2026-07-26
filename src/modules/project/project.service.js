import projectRepository from './project.repository.js';
import { PROJECT_MESSAGES, PROJECT_STATUS, PROJECT_PRIORITY } from './project.constants.js';
import AppError from '../../core/errors/AppError.js';

class ProjectService {
  async createProject(projectData, createdBy) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    if (projectData.projectCode) {
      projectData.projectCode = projectData.projectCode.toUpperCase();
      const existingProject = await projectRepository.existsByCode(projectData.projectCode);
      if (existingProject) {
        throw new AppError(PROJECT_MESSAGES.ALREADY_EXISTS, 409);
      }
    }

    if (projectData.projectManager) {
      const managerExists = await Employee.exists({ _id: projectData.projectManager, isDeleted: false });
      if (!managerExists) {
        throw new AppError('Project manager not found', 404);
      }
    }

    if (projectData.department) {
      const departmentExists = await Department.exists({ _id: projectData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found', 404);
      }
    }

    if (projectData.startDate && projectData.expectedEndDate) {
      if (new Date(projectData.startDate) > new Date(projectData.expectedEndDate)) {
        throw new AppError(PROJECT_MESSAGES.INVALID_DATES, 400);
      }
    }

    projectData.createdBy = createdBy;
    const project = await projectRepository.create(projectData);
    return await projectRepository.findById(project._id);
  }

  async getProjectById(id) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }
    return project;
  }

  async getAllProjects(options = {}) {
    return await projectRepository.findAll(options);
  }

  async updateProject(id, updateData, updatedBy) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    if (updateData.projectCode) {
      updateData.projectCode = updateData.projectCode.toUpperCase();
      const existingProject = await projectRepository.existsByCode(updateData.projectCode);
      if (existingProject && existingProject._id.toString() !== id) {
        throw new AppError(PROJECT_MESSAGES.ALREADY_EXISTS, 409);
      }
    }

    if (updateData.projectManager) {
      const Employee = (await import('../employee/employee.model.js')).default;
      const managerExists = await Employee.exists({ _id: updateData.projectManager, isDeleted: false });
      if (!managerExists) {
        throw new AppError('Project manager not found', 404);
      }
    }

    if (updateData.department) {
      const Department = (await import('../department/department.model.js')).default;
      const departmentExists = await Department.exists({ _id: updateData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found', 404);
      }
    }

    if (updateData.startDate || updateData.expectedEndDate) {
      const startDate = updateData.startDate || project.startDate;
      const expectedEndDate = updateData.expectedEndDate || project.expectedEndDate;
      if (new Date(startDate) > new Date(expectedEndDate)) {
        throw new AppError(PROJECT_MESSAGES.INVALID_DATES, 400);
      }
    }

    if (updateData.status && !Object.values(PROJECT_STATUS).includes(updateData.status)) {
      throw new AppError(PROJECT_MESSAGES.INVALID_STATUS, 400);
    }

    if (updateData.priority && !Object.values(PROJECT_PRIORITY).includes(updateData.priority)) {
      throw new AppError(PROJECT_MESSAGES.INVALID_PRIORITY, 400);
    }

    updateData.updatedBy = updatedBy;
    return await projectRepository.updateById(id, updateData);
  }

  async deleteProject(id, deletedBy) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    const Task = (await import('../task/task.model.js')).default;
    const activeTasks = await Task.countDocuments({ project: id, isDeleted: false });
    if (activeTasks > 0) {
      throw new AppError(PROJECT_MESSAGES.PROJECT_HAS_TASKS, 400);
    }

    return await projectRepository.softDelete(id, deletedBy);
  }

  async restoreProject(id) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }
    return await projectRepository.restore(id);
  }

  async getActiveProjects() {
    return await projectRepository.findActive();
  }

  async getArchivedProjects() {
    return await projectRepository.findArchived();
  }

  async getProjectsByDepartment(departmentId) {
    return await projectRepository.findByDepartment(departmentId);
  }

  async getProjectsByProjectManager(managerId) {
    return await projectRepository.findByProjectManager(managerId);
  }

  async getProjectsByMember(employeeId) {
    return await projectRepository.findByMember(employeeId);
  }

  async getProjectsByStatus(status) {
    if (!Object.values(PROJECT_STATUS).includes(status)) {
      throw new AppError(PROJECT_MESSAGES.INVALID_STATUS, 400);
    }
    return await projectRepository.findByStatus(status);
  }

  async getProjectsByPriority(priority) {
    if (!Object.values(PROJECT_PRIORITY).includes(priority)) {
      throw new AppError(PROJECT_MESSAGES.INVALID_PRIORITY, 400);
    }
    return await projectRepository.findByPriority(priority);
  }

  async searchProjects(searchTerm, options = {}) {
    return await projectRepository.search(searchTerm, options);
  }

  async getOverdueProjects() {
    return await projectRepository.findOverdue();
  }

  async getUpcomingProjects(days = 7) {
    return await projectRepository.findUpcoming(days);
  }

  async getProjectStatistics(filters = {}) {
    return await projectRepository.statistics(filters);
  }

  async addMember(projectId, employeeId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found', 404);
    }

    return await project.addMember(employeeId);
  }

  async removeMember(projectId, employeeId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }
    return await project.removeMember(employeeId);
  }

  async addTeamLead(projectId, employeeId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError('Employee not found', 404);
    }

    return await project.addTeamLead(employeeId);
  }

  async removeTeamLead(projectId, employeeId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }
    return await project.removeTeamLead(employeeId);
  }

  async archiveProject(projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }
    return await project.archive();
  }

  async unarchiveProject(projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }
    return await project.unarchive();
  }

  async updateSpentHours(projectId, hours) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }
    return await project.updateSpentHours(hours);
  }

  async assignProjectManager(projectId, managerId, updatedBy) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    const Employee = (await import('../employee/employee.model.js')).default;
    const manager = await Employee.findById(managerId);
    
    if (!manager) {
      throw new AppError('Employee not found', 404);
    }
    
    if (manager.isDeleted) {
      throw new AppError('Cannot assign deleted employee', 400);
    }
    
    if (!manager.isActive) {
      throw new AppError('Cannot assign inactive employee', 400);
    }

    if (project.isArchived) {
      throw new AppError('Cannot modify archived project', 400);
    }

    const oldManager = project.projectManager;
    const updatedProject = await projectRepository.updateById(projectId, {
      projectManager: managerId,
      updatedBy
    });

    await this.logActivity(projectId, 'assign_manager', updatedBy, {
      oldValue: oldManager,
      newValue: managerId,
      fieldChanged: 'projectManager'
    });

    return updatedProject;
  }

  async assignMembers(projectId, employeeIds, updatedBy) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    if (project.isArchived) {
      throw new AppError('Cannot modify archived project', 400);
    }

    const Employee = (await import('../employee/employee.model.js')).default;
    const validEmployeeIds = [];
    
    for (const employeeId of employeeIds) {
      const employee = await Employee.findById(employeeId);
      
      if (!employee) {
        throw new AppError(`Employee ${employeeId} not found`, 404);
      }
      
      if (employee.isDeleted) {
        throw new AppError(`Cannot assign deleted employee ${employeeId}`, 400);
      }
      
      if (!employee.isActive) {
        throw new AppError(`Cannot assign inactive employee ${employeeId}`, 400);
      }

      if (project.members.includes(employeeId)) {
        continue;
      }

      validEmployeeIds.push(employeeId);
    }

    const oldMembers = [...project.members];
    const updatedProject = await projectRepository.updateById(projectId, {
      $addToSet: { members: { $each: validEmployeeIds } },
      updatedBy
    });

    await this.logActivity(projectId, 'assign_members', updatedBy, {
      oldValue: oldMembers,
      newValue: updatedProject.members,
      fieldChanged: 'members'
    });

    return updatedProject;
  }

  async removeMembers(projectId, employeeIds, updatedBy) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    if (project.isArchived) {
      throw new AppError('Cannot modify archived project', 400);
    }

    const oldMembers = [...project.members];
    const updatedProject = await projectRepository.updateById(projectId, {
      $pull: { members: { $in: employeeIds } },
      updatedBy
    });

    await this.logActivity(projectId, 'remove_members', updatedBy, {
      oldValue: oldMembers,
      newValue: updatedProject.members,
      fieldChanged: 'members'
    });

    return updatedProject;
  }

  async assignTeamLeads(projectId, employeeIds, updatedBy) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    if (project.isArchived) {
      throw new AppError('Cannot modify archived project', 400);
    }

    const Employee = (await import('../employee/employee.model.js')).default;
    const validEmployeeIds = [];
    
    for (const employeeId of employeeIds) {
      const employee = await Employee.findById(employeeId);
      
      if (!employee) {
        throw new AppError(`Employee ${employeeId} not found`, 404);
      }
      
      if (employee.isDeleted) {
        throw new AppError(`Cannot assign deleted employee ${employeeId}`, 400);
      }
      
      if (!employee.isActive) {
        throw new AppError(`Cannot assign inactive employee ${employeeId}`, 400);
      }

      if (project.teamLeads.includes(employeeId)) {
        continue;
      }

      validEmployeeIds.push(employeeId);
    }

    const oldTeamLeads = [...project.teamLeads];
    const updatedProject = await projectRepository.updateById(projectId, {
      $addToSet: { teamLeads: { $each: validEmployeeIds } },
      updatedBy
    });

    await this.logActivity(projectId, 'assign_team_leads', updatedBy, {
      oldValue: oldTeamLeads,
      newValue: updatedProject.teamLeads,
      fieldChanged: 'teamLeads'
    });

    return updatedProject;
  }

  async removeTeamLeads(projectId, employeeIds, updatedBy) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    if (project.isArchived) {
      throw new AppError('Cannot modify archived project', 400);
    }

    const oldTeamLeads = [...project.teamLeads];
    const updatedProject = await projectRepository.updateById(projectId, {
      $pull: { teamLeads: { $in: employeeIds } },
      updatedBy
    });

    await this.logActivity(projectId, 'remove_team_leads', updatedBy, {
      oldValue: oldTeamLeads,
      newValue: updatedProject.teamLeads,
      fieldChanged: 'teamLeads'
    });

    return updatedProject;
  }

  async activateProject(projectId, updatedBy) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    if (project.isActive) {
      throw new AppError('Project is already active', 400);
    }

    const updatedProject = await projectRepository.updateById(projectId, {
      isActive: true,
      isArchived: false,
      updatedBy
    });

    await this.logActivity(projectId, 'activate', updatedBy, {
      oldValue: project.isActive,
      newValue: true,
      fieldChanged: 'isActive'
    });

    return updatedProject;
  }

  async deactivateProject(projectId, updatedBy) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    if (!project.isActive) {
      throw new AppError('Project is already inactive', 400);
    }

    const updatedProject = await projectRepository.updateById(projectId, {
      isActive: false,
      updatedBy
    });

    await this.logActivity(projectId, 'deactivate', updatedBy, {
      oldValue: project.isActive,
      newValue: false,
      fieldChanged: 'isActive'
    });

    return updatedProject;
  }

  async getProjectHealth(projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError(PROJECT_MESSAGES.NOT_FOUND, 404);
    }

    const Task = (await import('../task/task.model.js')).default;
    const tasks = await Task.find({ project: projectId, isDeleted: false });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => t.isOverdue).length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const healthScore = this.calculateHealthScore(progress, overdueTasks, blockedTasks, totalTasks);

    return {
      projectId,
      projectName: project.name,
      progress: Math.round(progress),
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      overdueTasks,
      blockedTasks,
      inProgressTasks,
      healthScore,
      healthStatus: this.getHealthStatus(healthScore),
      spentHours: project.spentHours,
      estimatedHours: project.estimatedHours,
      budgetUtilization: project.budget > 0 ? (project.spentHours * 100) / project.budget : 0
    };
  }

  calculateHealthScore(progress, overdueTasks, blockedTasks, totalTasks) {
    let score = 100;
    
    if (totalTasks > 0) {
      const overdueRatio = overdueTasks / totalTasks;
      const blockedRatio = blockedTasks / totalTasks;
      
      score -= overdueRatio * 30;
      score -= blockedRatio * 20;
    }
    
    score += progress * 0.2;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  getHealthStatus(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'poor';
    return 'critical';
  }

  async logActivity(projectId, action, performedBy, metadata = {}) {
    const ActivityTimeline = (await import('../task/activityTimeline.model.js')).default;
    
    await ActivityTimeline.createActivity({
      entityType: 'project',
      entityId: projectId,
      action,
      performedBy,
      ...metadata
    });
  }

  async getActivityTimeline(projectId) {
    const ActivityTimeline = (await import('../task/activityTimeline.model.js')).default;
    return await ActivityTimeline.findByProject(projectId);
  }
}

export default new ProjectService();
