import departmentRepository from './department.repository.js';
import { DEPARTMENT_MESSAGES, DEPARTMENT_STATUS } from './department.constants.js';
import AppError from '../../core/errors/AppError.js';

class DepartmentService {
  async createDepartment(departmentData, createdBy) {
    const existingDepartment = await departmentRepository.findOne({ departmentName: departmentData.departmentName });
    if (existingDepartment) {
      throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_ALREADY_EXISTS, 409);
    }

    if (departmentData.parentDepartment) {
      const parentExists = await departmentRepository.exists({ _id: departmentData.parentDepartment });
      if (!parentExists) {
        throw new AppError(DEPARTMENT_MESSAGES.INVALID_PARENT_DEPARTMENT, 400);
      }
    }

    if (departmentData.departmentHead) {
      const Employee = (await import('../employee/employee.model.js')).default;
      const employeeExists = await Employee.exists({ _id: departmentData.departmentHead, isDeleted: false });
      if (!employeeExists) {
        throw new AppError(DEPARTMENT_MESSAGES.INVALID_DEPARTMENT_HEAD, 400);
      }
    }

    const departmentCode = await departmentRepository.generateDepartmentCode();
    const department = await departmentRepository.create({
      ...departmentData,
      departmentCode,
      createdBy
    });

    return department;
  }

  async updateDepartment(departmentId, updateData, updatedBy) {
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND, 404);
    }

    if (updateData.departmentName && updateData.departmentName !== department.departmentName) {
      const existing = await departmentRepository.findOne({ departmentName: updateData.departmentName });
      if (existing) {
        throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_ALREADY_EXISTS, 409);
      }
    }

    if (updateData.parentDepartment) {
      if (updateData.parentDepartment.toString() === departmentId) {
        throw new AppError(DEPARTMENT_MESSAGES.CIRCULAR_HIERARCHY, 400);
      }

      const parentExists = await departmentRepository.exists({ _id: updateData.parentDepartment });
      if (!parentExists) {
        throw new AppError(DEPARTMENT_MESSAGES.INVALID_PARENT_DEPARTMENT, 400);
      }

      const hasChildren = await department.hasChildDepartments();
      if (hasChildren) {
        const childIds = (await department.getChildDepartments()).map(c => c._id.toString());
        if (childIds.includes(updateData.parentDepartment.toString())) {
          throw new AppError(DEPARTMENT_MESSAGES.CIRCULAR_HIERARCHY, 400);
        }
      }
    }

    if (updateData.departmentHead) {
      const Employee = (await import('../employee/employee.model.js')).default;
      const employeeExists = await Employee.exists({ _id: updateData.departmentHead, isDeleted: false });
      if (!employeeExists) {
        throw new AppError(DEPARTMENT_MESSAGES.INVALID_DEPARTMENT_HEAD, 400);
      }
    }

    const updatedDepartment = await departmentRepository.updateById(departmentId, { ...updateData, updatedBy });
    return updatedDepartment;
  }

  async deleteDepartment(departmentId, deletedBy) {
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND, 404);
    }

    const hasChildren = await department.hasChildDepartments();
    if (hasChildren) {
      throw new AppError(DEPARTMENT_MESSAGES.CANNOT_DELETE_WITH_CHILDREN, 400);
    }

    const hasEmployees = await department.hasEmployees();
    if (hasEmployees) {
      throw new AppError(DEPARTMENT_MESSAGES.CANNOT_DELETE_WITH_EMPLOYEES, 400);
    }

    await departmentRepository.softDeleteById(departmentId, deletedBy);
  }

  async restoreDepartment(departmentId) {
    const department = await departmentRepository.restoreById(departmentId);
    if (!department) {
      throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND, 404);
    }
    return department;
  }

  async getDepartmentById(departmentId) {
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND, 404);
    }
    return department;
  }

  async getDepartmentByCode(departmentCode) {
    const department = await departmentRepository.findByCode(departmentCode);
    if (!department) {
      throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND, 404);
    }
    return department;
  }

  async getAllDepartments(query = {}) {
    return departmentRepository.findAll(query);
  }

  async searchDepartments(searchTerm, options = {}) {
    return departmentRepository.search(searchTerm, options);
  }

  async filterDepartments(filters, options = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.parentDepartment) query.parentDepartment = filters.parentDepartment;
    if (filters.departmentHead) query.departmentHead = filters.departmentHead;
    return departmentRepository.findWithPagination(query, options);
  }

  async getDepartmentTree() {
    return departmentRepository.buildTree();
  }

  async getDepartmentStatistics() {
    return departmentRepository.getStatistics();
  }

  async getRootDepartments() {
    return departmentRepository.findRootDepartments();
  }

  async getChildDepartments(parentId) {
    return departmentRepository.findByParentDepartment(parentId);
  }

  async getDepartmentsByStatus(status) {
    return departmentRepository.findByStatus(status);
  }

  async getActiveDepartments() {
    return departmentRepository.findActive();
  }

  async updateDepartmentStatus(departmentId, newStatus) {
    const department = await departmentRepository.updateById(departmentId, { status: newStatus });
    if (!department) {
      throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND, 404);
    }
    return department;
  }

  async updateDepartmentHead(departmentId, newHeadId) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: newHeadId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError(DEPARTMENT_MESSAGES.INVALID_DEPARTMENT_HEAD, 400);
    }

    const department = await departmentRepository.updateById(departmentId, { departmentHead: newHeadId });
    if (!department) {
      throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND, 404);
    }
    return department;
  }

  async updateParentDepartment(departmentId, newParentId) {
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new AppError(DEPARTMENT_MESSAGES.DEPARTMENT_NOT_FOUND, 404);
    }

    if (newParentId && newParentId.toString() === departmentId) {
      throw new AppError(DEPARTMENT_MESSAGES.CIRCULAR_HIERARCHY, 400);
    }

    if (newParentId) {
      const parentExists = await departmentRepository.exists({ _id: newParentId });
      if (!parentExists) {
        throw new AppError(DEPARTMENT_MESSAGES.INVALID_PARENT_DEPARTMENT, 400);
      }

      const hasChildren = await department.hasChildDepartments();
      if (hasChildren) {
        const childIds = (await department.getChildDepartments()).map(c => c._id.toString());
        if (childIds.includes(newParentId.toString())) {
          throw new AppError(DEPARTMENT_MESSAGES.CIRCULAR_HIERARCHY, 400);
        }
      }
    }

    const updatedDepartment = await departmentRepository.updateById(departmentId, { parentDepartment: newParentId });
    return updatedDepartment;
  }
}

export default new DepartmentService();
