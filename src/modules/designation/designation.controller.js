import designationService from './designation.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class DesignationController {
  async create(req, res, next) {
    try {
      const designation = await designationService.createDesignation(req.body, req.user.userId);
      return ApiResponse.created(res, 'Designation created successfully', { designation });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const designations = await designationService.getAllDesignations(req.query);
      return ApiResponse.success(res, 'Designations retrieved successfully', { designations });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const designation = await designationService.getDesignationById(id);
      return ApiResponse.success(res, 'Designation retrieved successfully', { designation });
    } catch (error) {
      next(error);
    }
  }

  async getByCode(req, res, next) {
    try {
      const { code } = req.params;
      const designation = await designationService.getDesignationByCode(code);
      return ApiResponse.success(res, 'Designation retrieved successfully', { designation });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const designation = await designationService.updateDesignation(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Designation updated successfully', { designation });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await designationService.deleteDesignation(id, req.user.userId);
      return ApiResponse.success(res, 'Designation deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const designation = await designationService.restoreDesignation(id);
      return ApiResponse.success(res, 'Designation restored successfully', { designation });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await designationService.getDesignationStatistics();
      return ApiResponse.success(res, 'Designation statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q } = req.query;
      const designations = await designationService.searchDesignations(q, req.query);
      return ApiResponse.success(res, 'Designations found', { designations });
    } catch (error) {
      next(error);
    }
  }

  async filter(req, res, next) {
    try {
      const designations = await designationService.filterDesignations(req.query, req.query);
      return ApiResponse.success(res, 'Designations filtered successfully', { designations });
    } catch (error) {
      next(error);
    }
  }

  async getByDepartment(req, res, next) {
    try {
      const { departmentId } = req.params;
      const designations = await designationService.getDesignationsByDepartment(departmentId);
      return ApiResponse.success(res, 'Designations retrieved successfully', { designations });
    } catch (error) {
      next(error);
    }
  }

  async getByHierarchyLevel(req, res, next) {
    try {
      const { level } = req.params;
      const designations = await designationService.getDesignationsByHierarchyLevel(parseInt(level));
      return ApiResponse.success(res, 'Designations retrieved successfully', { designations });
    } catch (error) {
      next(error);
    }
  }

  async getByJobGrade(req, res, next) {
    try {
      const { grade } = req.params;
      const designations = await designationService.getDesignationsByJobGrade(grade);
      return ApiResponse.success(res, 'Designations retrieved successfully', { designations });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const designations = await designationService.getDesignationsByStatus(status);
      return ApiResponse.success(res, 'Designations retrieved successfully', { designations });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const designations = await designationService.getActiveDesignations();
      return ApiResponse.success(res, 'Active designations retrieved successfully', { designations });
    } catch (error) {
      next(error);
    }
  }

  async getByHierarchyRange(req, res, next) {
    try {
      const { minLevel, maxLevel } = req.params;
      const designations = await designationService.getDesignationsByHierarchyRange(parseInt(minLevel), parseInt(maxLevel));
      return ApiResponse.success(res, 'Designations retrieved successfully', { designations });
    } catch (error) {
      next(error);
    }
  }

  async getManagement(req, res, next) {
    try {
      const designations = await designationService.getManagementDesignations();
      return ApiResponse.success(res, 'Management designations retrieved successfully', { designations });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const designation = await designationService.updateDesignationStatus(id, status);
      return ApiResponse.success(res, 'Designation status updated successfully', { designation });
    } catch (error) {
      next(error);
    }
  }

  async updateDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const { departmentId } = req.body;
      const designation = await designationService.updateDesignationDepartment(id, departmentId);
      return ApiResponse.success(res, 'Department updated successfully', { designation });
    } catch (error) {
      next(error);
    }
  }

  async updateHierarchy(req, res, next) {
    try {
      const { id } = req.params;
      const { hierarchyLevel } = req.body;
      const designation = await designationService.updateDesignationHierarchy(id, hierarchyLevel);
      return ApiResponse.success(res, 'Hierarchy level updated successfully', { designation });
    } catch (error) {
      next(error);
    }
  }

  async updateSalaryRange(req, res, next) {
    try {
      const { id } = req.params;
      const { minimumSalary, maximumSalary } = req.body;
      const designation = await designationService.updateSalaryRange(id, minimumSalary, maximumSalary);
      return ApiResponse.success(res, 'Salary range updated successfully', { designation });
    } catch (error) {
      next(error);
    }
  }
}

export default new DesignationController();
