import projectService from './project.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class ProjectController {
  async create(req, res, next) {
    try {
      const project = await projectService.createProject(req.body, req.user.userId);
      return ApiResponse.created(res, 'Project created successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      return ApiResponse.success(res, 'Project retrieved successfully', { project });
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
      const projects = await projectService.getAllProjects(options);
      return ApiResponse.success(res, 'Projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.updateProject(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Project updated successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await projectService.deleteProject(id, req.user.userId);
      return ApiResponse.success(res, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.restoreProject(id);
      return ApiResponse.success(res, 'Project restored successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const projects = await projectService.getActiveProjects();
      return ApiResponse.success(res, 'Active projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async getArchived(req, res, next) {
    try {
      const projects = await projectService.getArchivedProjects();
      return ApiResponse.success(res, 'Archived projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async getByDepartment(req, res, next) {
    try {
      const { departmentId } = req.params;
      const projects = await projectService.getProjectsByDepartment(departmentId);
      return ApiResponse.success(res, 'Department projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async getByProjectManager(req, res, next) {
    try {
      const { managerId } = req.params;
      const projects = await projectService.getProjectsByProjectManager(managerId);
      return ApiResponse.success(res, 'Manager projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async getByMember(req, res, next) {
    try {
      const { employeeId } = req.params;
      const projects = await projectService.getProjectsByMember(employeeId);
      return ApiResponse.success(res, 'Member projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const projects = await projectService.getProjectsByStatus(status);
      return ApiResponse.success(res, 'Projects by status retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async getByPriority(req, res, next) {
    try {
      const { priority } = req.params;
      const projects = await projectService.getProjectsByPriority(priority);
      return ApiResponse.success(res, 'Projects by priority retrieved successfully', { projects });
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
      const projects = await projectService.searchProjects(q, options);
      return ApiResponse.success(res, 'Search results retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async getOverdue(req, res, next) {
    try {
      const projects = await projectService.getOverdueProjects();
      return ApiResponse.success(res, 'Overdue projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async getUpcoming(req, res, next) {
    try {
      const { days = 7 } = req.query;
      const projects = await projectService.getUpcomingProjects(parseInt(days));
      return ApiResponse.success(res, 'Upcoming projects retrieved successfully', { projects });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await projectService.getProjectStatistics(req.query);
      return ApiResponse.success(res, 'Project statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;
      const project = await projectService.addMember(id, employeeId);
      return ApiResponse.success(res, 'Member added successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;
      const project = await projectService.removeMember(id, employeeId);
      return ApiResponse.success(res, 'Member removed successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async addTeamLead(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;
      const project = await projectService.addTeamLead(id, employeeId);
      return ApiResponse.success(res, 'Team lead added successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async removeTeamLead(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;
      const project = await projectService.removeTeamLead(id, employeeId);
      return ApiResponse.success(res, 'Team lead removed successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async archive(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.archiveProject(id);
      return ApiResponse.success(res, 'Project archived successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async unarchive(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.unarchiveProject(id);
      return ApiResponse.success(res, 'Project unarchived successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async assignManager(req, res, next) {
    try {
      const { id } = req.params;
      const { managerId } = req.body;
      const project = await projectService.assignProjectManager(id, managerId, req.user.userId);
      return ApiResponse.success(res, 'Project manager assigned successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async assignMembers(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeIds } = req.body;
      const project = await projectService.assignMembers(id, employeeIds, req.user.userId);
      return ApiResponse.success(res, 'Members assigned successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async removeMembers(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeIds } = req.body;
      const project = await projectService.removeMembers(id, employeeIds, req.user.userId);
      return ApiResponse.success(res, 'Members removed successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async assignTeamLeads(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeIds } = req.body;
      const project = await projectService.assignTeamLeads(id, employeeIds, req.user.userId);
      return ApiResponse.success(res, 'Team leads assigned successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async removeTeamLeads(req, res, next) {
    try {
      const { id } = req.params;
      const { employeeIds } = req.body;
      const project = await projectService.removeTeamLeads(id, employeeIds, req.user.userId);
      return ApiResponse.success(res, 'Team leads removed successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async activate(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.activateProject(id, req.user.userId);
      return ApiResponse.success(res, 'Project activated successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.deactivateProject(id, req.user.userId);
      return ApiResponse.success(res, 'Project deactivated successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  async getHealth(req, res, next) {
    try {
      const { id } = req.params;
      const health = await projectService.getProjectHealth(id);
      return ApiResponse.success(res, 'Project health retrieved successfully', { health });
    } catch (error) {
      next(error);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const { id } = req.params;
      const timeline = await projectService.getActivityTimeline(id);
      return ApiResponse.success(res, 'Project timeline retrieved successfully', { timeline });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();
