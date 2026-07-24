import hierarchyService from './hierarchy.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class HierarchyController {
  async assignManager(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { managerId } = req.body;
      const result = await hierarchyService.assignReportingManager(employeeId, managerId, req.user.userId);
      return ApiResponse.success(res, 'Reporting manager assigned successfully', { employee: result });
    } catch (error) {
      next(error);
    }
  }

  async changeManager(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { managerId } = req.body;
      const result = await hierarchyService.changeReportingManager(employeeId, managerId, req.user.userId);
      return ApiResponse.success(res, 'Reporting manager changed successfully', { employee: result });
    } catch (error) {
      next(error);
    }
  }

  async assignSecondaryManager(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { secondaryManagerId } = req.body;
      const result = await hierarchyService.assignSecondaryManager(employeeId, secondaryManagerId, req.user.userId);
      return ApiResponse.success(res, 'Secondary manager assigned successfully', { employee: result });
    } catch (error) {
      next(error);
    }
  }

  async setDepartmentHead(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { isHead } = req.body;
      const result = await hierarchyService.setDepartmentHead(employeeId, isHead, req.user.userId);
      return ApiResponse.success(res, 'Department head status updated successfully', { employee: result });
    } catch (error) {
      next(error);
    }
  }

  async setTeamLead(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { isLead } = req.body;
      const result = await hierarchyService.setTeamLead(employeeId, isLead, req.user.userId);
      return ApiResponse.success(res, 'Team lead status updated successfully', { employee: result });
    } catch (error) {
      next(error);
    }
  }

  async getOrganizationTree(req, res, next) {
    try {
      const { rootEmployeeId } = req.query;
      const tree = await hierarchyService.getOrganizationTree(rootEmployeeId);
      return ApiResponse.success(res, 'Organization tree retrieved successfully', { tree });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeHierarchy(req, res, next) {
    try {
      const { employeeId } = req.params;
      const hierarchy = await hierarchyService.getEmployeeHierarchy(employeeId);
      return ApiResponse.success(res, 'Employee hierarchy retrieved successfully', { hierarchy });
    } catch (error) {
      next(error);
    }
  }

  async getDirectReports(req, res, next) {
    try {
      const { employeeId } = req.params;
      const reports = await hierarchyService.getDirectReports(employeeId);
      return ApiResponse.success(res, 'Direct reports retrieved successfully', { reports, count: reports.length });
    } catch (error) {
      next(error);
    }
  }

  async getIndirectReports(req, res, next) {
    try {
      const { employeeId } = req.params;
      const reports = await hierarchyService.getIndirectReports(employeeId);
      return ApiResponse.success(res, 'Indirect reports retrieved successfully', { reports, count: reports.length });
    } catch (error) {
      next(error);
    }
  }

  async getAllSubordinates(req, res, next) {
    try {
      const { employeeId } = req.params;
      const result = await hierarchyService.getAllSubordinates(employeeId);
      return ApiResponse.success(res, 'All subordinates retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentHierarchy(req, res, next) {
    try {
      const { departmentId } = req.params;
      const hierarchy = await hierarchyService.getDepartmentHierarchy(departmentId);
      return ApiResponse.success(res, 'Department hierarchy retrieved successfully', { hierarchy });
    } catch (error) {
      next(error);
    }
  }

  async getReportingChain(req, res, next) {
    try {
      const { employeeId } = req.params;
      const chain = await hierarchyService.getReportingChain(employeeId);
      return ApiResponse.success(res, 'Reporting chain retrieved successfully', { chain });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentHeads(req, res, next) {
    try {
      const heads = await hierarchyService.getDepartmentHeads();
      return ApiResponse.success(res, 'Department heads retrieved successfully', { heads, count: heads.length });
    } catch (error) {
      next(error);
    }
  }

  async getTeamLeads(req, res, next) {
    try {
      const leads = await hierarchyService.getTeamLeads();
      return ApiResponse.success(res, 'Team leads retrieved successfully', { leads, count: leads.length });
    } catch (error) {
      next(error);
    }
  }

  async getByOrganizationLevel(req, res, next) {
    try {
      const { level } = req.params;
      const employees = await hierarchyService.getEmployeesByOrganizationLevel(parseInt(level));
      return ApiResponse.success(res, 'Employees retrieved successfully', { employees, count: employees.length });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await hierarchyService.getHierarchyStatistics();
      return ApiResponse.success(res, 'Hierarchy statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async validateHierarchyChange(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { managerId } = req.body;
      const validation = await hierarchyService.validateHierarchyChange(employeeId, managerId);
      return ApiResponse.success(res, 'Hierarchy validation completed', validation);
    } catch (error) {
      next(error);
    }
  }

  async getApprovalChain(req, res, next) {
    try {
      const { employeeId } = req.params;
      const chain = await hierarchyService.getManagerChainForApproval(employeeId);
      return ApiResponse.success(res, 'Approval chain retrieved successfully', { chain });
    } catch (error) {
      next(error);
    }
  }
}

export default new HierarchyController();
