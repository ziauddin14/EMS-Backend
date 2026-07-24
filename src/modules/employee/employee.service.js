import employeeRepository from './employee.repository.js';
import { EMPLOYEE_MESSAGES, EMPLOYMENT_STATUS, EMPLOYMENT_TYPE } from './employee.constants.js';
import AppError from '../../core/errors/AppError.js';

class EmployeeService {
  async createEmployee(employeeData, createdBy) {
    const User = (await import('../auth/auth.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;
    const Designation = (await import('../designation/designation.model.js')).default;

    const userExists = await User.exists({ _id: employeeData.user, isDeleted: false });
    if (!userExists) {
      throw new AppError('User not found or inactive', 404);
    }

    const existingEmployee = await employeeRepository.findByUser(employeeData.user);
    if (existingEmployee) {
      throw new AppError(EMPLOYEE_MESSAGES.USER_ALREADY_LINKED, 409);
    }

    if (employeeData.department) {
      const departmentExists = await Department.exists({ _id: employeeData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found or inactive', 404);
      }
    }

    if (employeeData.designation) {
      const designationExists = await Designation.exists({ _id: employeeData.designation, isDeleted: false });
      if (!designationExists) {
        throw new AppError('Designation not found or inactive', 404);
      }
    }

    if (employeeData.reportingManager) {
      const managerExists = await employeeRepository.exists({ _id: employeeData.reportingManager, isDeleted: false });
      if (!managerExists) {
        throw new AppError('Reporting manager not found or inactive', 404);
      }
    }

    const employeeNumber = await employeeRepository.generateEmployeeNumber();
    const employee = await employeeRepository.create({
      ...employeeData,
      employeeNumber,
      createdBy
    });

    return employee;
  }

  async updateEmployee(employeeId, updateData, updatedBy) {
    const Department = (await import('../department/department.model.js')).default;
    const Designation = (await import('../designation/designation.model.js')).default;

    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }

    const forbiddenFields = ['employeeNumber', 'user', 'createdBy', 'createdAt'];
    const updateFields = Object.keys(updateData);
    const hasForbiddenField = updateFields.some(field => forbiddenFields.includes(field));
    if (hasForbiddenField) {
      throw new AppError('Cannot update protected fields', 400);
    }

    if (updateData.department) {
      const departmentExists = await Department.exists({ _id: updateData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found or inactive', 404);
      }
    }

    if (updateData.designation) {
      const designationExists = await Designation.exists({ _id: updateData.designation, isDeleted: false });
      if (!designationExists) {
        throw new AppError('Designation not found or inactive', 404);
      }
    }

    if (updateData.reportingManager) {
      if (updateData.reportingManager.toString() === employeeId) {
        throw new AppError('Employee cannot be their own reporting manager', 400);
      }
      const managerExists = await employeeRepository.exists({ _id: updateData.reportingManager, isDeleted: false });
      if (!managerExists) {
        throw new AppError('Reporting manager not found or inactive', 404);
      }
    }

    const updatedEmployee = await employeeRepository.updateById(employeeId, { ...updateData, updatedBy });
    return updatedEmployee;
  }

  async deleteEmployee(employeeId, deletedBy) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }

    if (employee.employmentStatus === EMPLOYMENT_STATUS.ACTIVE) {
      throw new AppError(EMPLOYEE_MESSAGES.CANNOT_DELETE_ACTIVE_EMPLOYEE, 400);
    }

    await employeeRepository.softDeleteById(employeeId, deletedBy);
  }

  async restoreEmployee(employeeId) {
    const employee = await employeeRepository.restoreById(employeeId);
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }

  async getEmployeeById(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }

  async getEmployeeByEmployeeNumber(employeeNumber) {
    const employee = await employeeRepository.findByEmployeeNumber(employeeNumber);
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }

  async getEmployeeByUser(userId) {
    const employee = await employeeRepository.findByUser(userId);
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }

  async getAllEmployees(query = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    };

    const employees = await employeeRepository.findWithPagination({}, options);
    const total = await employeeRepository.countDocuments();

    return {
      employees,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
        hasNext: options.page < Math.ceil(total / options.limit),
        hasPrevious: options.page > 1
      }
    };
  }

  async searchEmployees(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const searchOptions = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const employees = await employeeRepository.search(searchTerm, searchOptions);
    return employees;
  }

  async filterEmployees(filters, options = {}) {
    const query = {};
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    if (filters.department) query.department = filters.department;
    if (filters.designation) query.designation = filters.designation;
    if (filters.employmentStatus) query.employmentStatus = filters.employmentStatus;
    if (filters.employmentType) query.employmentType = filters.employmentType;
    if (filters.reportingManager) query.reportingManager = filters.reportingManager;
    if (filters.isActive !== undefined) query.employmentStatus = filters.isActive ? EMPLOYMENT_STATUS.ACTIVE : { $ne: EMPLOYMENT_STATUS.ACTIVE };
    if (filters.includeDeleted === 'true') {
      delete query.employmentStatus;
    }

    if (filters.joiningDateFrom || filters.joiningDateTo) {
      query.joiningDate = {};
      if (filters.joiningDateFrom) query.joiningDate.$gte = new Date(filters.joiningDateFrom);
      if (filters.joiningDateTo) query.joiningDate.$lte = new Date(filters.joiningDateTo);
    }


    const paginationOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    };

    const employees = await employeeRepository.findWithPagination(query, paginationOptions, filters.includeDeleted === 'true');
    const total = await employeeRepository.countDocuments(query, filters.includeDeleted === 'true');

    return {
      employees,
      pagination: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        total,
        totalPages: Math.ceil(total / paginationOptions.limit),
        hasNext: paginationOptions.page < Math.ceil(total / paginationOptions.limit),
        hasPrevious: paginationOptions.page > 1
      }
    };
  }

  async getEmployeeProfile(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }

  async getEmployeeProfileByEmployeeNumber(employeeNumber) {
    const employee = await employeeRepository.findByEmployeeNumber(employeeNumber);
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }

  async getEmployeeStatistics() {
    return employeeRepository.getStatistics();
  }

  async getDepartmentStatistics(departmentId) {
    const Department = (await import('../department/department.model.js')).default;
    const departmentExists = await Department.exists({ _id: departmentId, isDeleted: false });
    if (!departmentExists) {
      throw new AppError('Department not found or inactive', 404);
    }

    const employees = await employeeRepository.findByDepartment(departmentId);
    const total = employees.length;
    const active = employees.filter(e => e.employmentStatus === EMPLOYMENT_STATUS.ACTIVE).length;
    const probation = employees.filter(e => e.employmentStatus === EMPLOYMENT_STATUS.PROBATION).length;
    const interns = employees.filter(e => e.employmentType === EMPLOYMENT_TYPE.INTERN).length;
    const resigned = employees.filter(e => e.employmentStatus === EMPLOYMENT_STATUS.RESIGNED).length;

    return {
      total,
      byStatus: {
        active,
        probation,
        resigned,
        onLeave: employees.filter(e => e.employmentStatus === EMPLOYMENT_STATUS.ON_LEAVE).length,
        terminated: employees.filter(e => e.employmentStatus === EMPLOYMENT_STATUS.TERMINATED).length,
        suspended: employees.filter(e => e.employmentStatus === EMPLOYMENT_STATUS.SUSPENDED).length
      },
      byType: {
        fullTime: employees.filter(e => e.employmentType === EMPLOYMENT_TYPE.FULL_TIME).length,
        partTime: employees.filter(e => e.employmentType === EMPLOYMENT_TYPE.PART_TIME).length,
        intern,
        contract: employees.filter(e => e.employmentType === EMPLOYMENT_TYPE.CONTRACT).length,
        freelancer: employees.filter(e => e.employmentType === EMPLOYMENT_TYPE.FREELANCER).length
      }
    };
  }

  async getReportingManagerEmployees(managerId) {
    const managerExists = await employeeRepository.exists({ _id: managerId, isDeleted: false });
    if (!managerExists) {
      throw new AppError('Reporting manager not found or inactive', 404);
    }

    return employeeRepository.findByReportingManager(managerId);
  }

  async getEmployeesByDepartment(departmentId) {
    const Department = (await import('../department/department.model.js')).default;
    const departmentExists = await Department.exists({ _id: departmentId, isDeleted: false });
    if (!departmentExists) {
      throw new AppError('Department not found or inactive', 404);
    }

    return employeeRepository.findByDepartment(departmentId);
  }

  async getEmployeesByDesignation(designationId) {
    const Designation = (await import('../designation/designation.model.js')).default;
    const designationExists = await Designation.exists({ _id: designationId, isDeleted: false });
    if (!designationExists) {
      throw new AppError('Designation not found or inactive', 404);
    }

    const employees = await employeeRepository.findAll({ designation: designationId });
    return employees;
  }

  async getEmployeesByEmploymentStatus(status) {
    if (!Object.values(EMPLOYMENT_STATUS).includes(status)) {
      throw new AppError(EMPLOYEE_MESSAGES.INVALID_EMPLOYMENT_STATUS, 400);
    }

    return employeeRepository.findByEmploymentStatus(status);
  }

  async getEmployeesByEmploymentType(type) {
    if (!Object.values(EMPLOYMENT_TYPE).includes(type)) {
      throw new AppError(EMPLOYEE_MESSAGES.INVALID_EMPLOYMENT_TYPE, 400);
    }

    return employeeRepository.findByEmploymentType(type);
  }

  async getActiveEmployees() {
    return employeeRepository.findActive();
  }

  async updateEmploymentStatus(employeeId, newStatus) {
    if (!Object.values(EMPLOYMENT_STATUS).includes(newStatus)) {
      throw new AppError(EMPLOYEE_MESSAGES.INVALID_EMPLOYMENT_STATUS, 400);
    }

    const employee = await employeeRepository.updateById(employeeId, { employmentStatus: newStatus });
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }

  async updateReportingManager(employeeId, newManagerId) {
    if (newManagerId) {
      if (newManagerId.toString() === employeeId) {
        throw new AppError('Employee cannot be their own reporting manager', 400);
      }
      const managerExists = await employeeRepository.exists({ _id: newManagerId, isDeleted: false });
      if (!managerExists) {
        throw new AppError('Reporting manager not found or inactive', 404);
      }
    }

    const employee = await employeeRepository.updateById(employeeId, { reportingManager: newManagerId });
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }

  async updateDepartment(employeeId, newDepartmentId) {
    if (newDepartmentId) {
      const Department = (await import('../department/department.model.js')).default;
      const departmentExists = await Department.exists({ _id: newDepartmentId, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found or inactive', 404);
      }
    }

    const employee = await employeeRepository.updateById(employeeId, { department: newDepartmentId });
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }

  async updateDesignation(employeeId, newDesignationId) {
    if (newDesignationId) {
      const Designation = (await import('../designation/designation.model.js')).default;
      const designationExists = await Designation.exists({ _id: newDesignationId, isDeleted: false });
      if (!designationExists) {
        throw new AppError('Designation not found or inactive', 404);
      }
    }

    const employee = await employeeRepository.updateById(employeeId, { designation: newDesignationId });
    if (!employee) {
      throw new AppError(EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND, 404);
    }
    return employee;
  }
}

export default new EmployeeService();
