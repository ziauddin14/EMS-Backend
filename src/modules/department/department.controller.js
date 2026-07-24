import departmentService from './department.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class DepartmentController {
  async create(req, res, next) {
    try {
      const department = await departmentService.createDepartment(req.body, req.user.userId);
      return ApiResponse.created(res, 'Department created successfully', { department });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const departments = await departmentService.getAllDepartments(req.query);
      return ApiResponse.success(res, 'Departments retrieved successfully', { departments });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const department = await departmentService.getDepartmentById(id);
      return ApiResponse.success(res, 'Department retrieved successfully', { department });
    } catch (error) {
      next(error);
    }
  }

  async getByCode(req, res, next) {
    try {
      const { code } = req.params;
      const department = await departmentService.getDepartmentByCode(code);
      return ApiResponse.success(res, 'Department retrieved successfully', { department });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const department = await departmentService.updateDepartment(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Department updated successfully', { department });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await departmentService.deleteDepartment(id, req.user.userId);
      return ApiResponse.success(res, 'Department deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const department = await departmentService.restoreDepartment(id);
      return ApiResponse.success(res, 'Department restored successfully', { department });
    } catch (error) {
      next(error);
    }
  }

  async getTree(req, res, next) {
    try {
      const tree = await departmentService.getDepartmentTree();
      return ApiResponse.success(res, 'Department tree retrieved successfully', { tree });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await departmentService.getDepartmentStatistics();
      return ApiResponse.success(res, 'Department statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q } = req.query;
      const departments = await departmentService.searchDepartments(q, req.query);
      return ApiResponse.success(res, 'Departments found', { departments });
    } catch (error) {
      next(error);
    }
  }

  async filter(req, res, next) {
    try {
      const departments = await departmentService.filterDepartments(req.query, req.query);
      return ApiResponse.success(res, 'Departments filtered successfully', { departments });
    } catch (error) {
      next(error);
    }
  }

  async getRootDepartments(req, res, next) {
    try {
      const departments = await departmentService.getRootDepartments();
      return ApiResponse.success(res, 'Root departments retrieved successfully', { departments });
    } catch (error) {
      next(error);
    }
  }

  async getChildDepartments(req, res, next) {
    try {
      const { parentId } = req.params;
      const departments = await departmentService.getChildDepartments(parentId);
      return ApiResponse.success(res, 'Child departments retrieved successfully', { departments });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const departments = await departmentService.getDepartmentsByStatus(status);
      return ApiResponse.success(res, 'Departments retrieved successfully', { departments });
    } catch (error) {
      next(error);
    }
  }

  async getActiveDepartments(req, res, next) {
    try {
      const departments = await departmentService.getActiveDepartments();
      return ApiResponse.success(res, 'Active departments retrieved successfully', { departments });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const department = await departmentService.updateDepartmentStatus(id, status);
      return ApiResponse.success(res, 'Department status updated successfully', { department });
    } catch (error) {
      next(error);
    }
  }

  async updateHead(req, res, next) {
    try {
      const { id } = req.params;
      const { departmentHeadId } = req.body;
      const department = await departmentService.updateDepartmentHead(id, departmentHeadId);
      return ApiResponse.success(res, 'Department head updated successfully', { department });
    } catch (error) {
      next(error);
    }
  }

  async updateParent(req, res, next) {
    try {
      const { id } = req.params;
      const { parentDepartmentId } = req.body;
      const department = await departmentService.updateParentDepartment(id, parentDepartmentId);
      return ApiResponse.success(res, 'Parent department updated successfully', { department });
    } catch (error) {
      next(error);
    }
  }
}

export default new DepartmentController();
