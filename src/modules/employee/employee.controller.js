import employeeService from './employee.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class EmployeeController {
  async create(req, res, next) {
    try {
      const employee = await employeeService.createEmployee(req.body, req.user.userId);
      return ApiResponse.created(res, 'Employee created successfully', { employee });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const employees = await employeeService.getAllEmployees(req.query);
      return ApiResponse.success(res, 'Employees retrieved successfully', { employees });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(id);
      return ApiResponse.success(res, 'Employee retrieved successfully', { employee });
    } catch (error) {
      next(error);
    }
  }

  async getByEmployeeNumber(req, res, next) {
    try {
      const { employeeNumber } = req.params;
      const employee = await employeeService.getEmployeeByEmployeeNumber(employeeNumber);
      return ApiResponse.success(res, 'Employee retrieved successfully', { employee });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await employeeService.updateEmployee(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Employee updated successfully', { employee });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await employeeService.deleteEmployee(id, req.user.userId);
      return ApiResponse.success(res, 'Employee deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await employeeService.restoreEmployee(id);
      return ApiResponse.success(res, 'Employee restored successfully', { employee });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const { employeeNumber } = req.params;
      const employee = await employeeService.getEmployeeProfileByEmployeeNumber(employeeNumber);
      return ApiResponse.success(res, 'Employee profile retrieved successfully', { employee });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await employeeService.getEmployeeStatistics();
      return ApiResponse.success(res, 'Employee statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q } = req.query;
      const employees = await employeeService.searchEmployees(q, req.query);
      return ApiResponse.success(res, 'Employees found', { employees });
    } catch (error) {
      next(error);
    }
  }

  async filter(req, res, next) {
    try {
      const employees = await employeeService.filterEmployees(req.query, req.query);
      return ApiResponse.success(res, 'Employees filtered successfully', { employees });
    } catch (error) {
      next(error);
    }
  }

  async getByDepartment(req, res, next) {
    try {
      const { departmentId } = req.params;
      const employees = await employeeService.getEmployeesByDepartment(departmentId);
      return ApiResponse.success(res, 'Department employees retrieved successfully', { employees });
    } catch (error) {
      next(error);
    }
  }

  async getByDesignation(req, res, next) {
    try {
      const { designationId } = req.params;
      const employees = await employeeService.getEmployeesByDesignation(designationId);
      return ApiResponse.success(res, 'Designation employees retrieved successfully', { employees });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const employees = await employeeService.getEmployeesByEmploymentStatus(status);
      return ApiResponse.success(res, 'Employees retrieved successfully', { employees });
    } catch (error) {
      next(error);
    }
  }

  async getByType(req, res, next) {
    try {
      const { type } = req.params;
      const employees = await employeeService.getEmployeesByEmploymentType(type);
      return ApiResponse.success(res, 'Employees retrieved successfully', { employees });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const employees = await employeeService.getActiveEmployees();
      return ApiResponse.success(res, 'Active employees retrieved successfully', { employees });
    } catch (error) {
      next(error);
    }
  }

  async getReportingManagerEmployees(req, res, next) {
    try {
      const { managerId } = req.params;
      const employees = await employeeService.getReportingManagerEmployees(managerId);
      return ApiResponse.success(res, 'Reporting manager employees retrieved successfully', { employees });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const employee = await employeeService.updateEmploymentStatus(id, status);
      return ApiResponse.success(res, 'Employment status updated successfully', { employee });
    } catch (error) {
      next(error);
    }
  }

  async updateReportingManager(req, res, next) {
    try {
      const { id } = req.params;
      const { reportingManagerId } = req.body;
      const employee = await employeeService.updateReportingManager(id, reportingManagerId);
      return ApiResponse.success(res, 'Reporting manager updated successfully', { employee });
    } catch (error) {
      next(error);
    }
  }

  async updateDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const { departmentId } = req.body;
      const employee = await employeeService.updateDepartment(id, departmentId);
      return ApiResponse.success(res, 'Department updated successfully', { employee });
    } catch (error) {
      next(error);
    }
  }

  async updateDesignation(req, res, next) {
    try {
      const { id } = req.params;
      const { designationId } = req.body;
      const employee = await employeeService.updateDesignation(id, designationId);
      return ApiResponse.success(res, 'Designation updated successfully', { employee });
    } catch (error) {
      next(error);
    }
  }
}

export default new EmployeeController();
