import designationRepository from './designation.repository.js';
import { DESIGNATION_MESSAGES, DESIGNATION_STATUS } from './designation.constants.js';
import AppError from '../../core/errors/AppError.js';

class DesignationService {
  async createDesignation(designationData, createdBy) {
    const existingDesignation = await designationRepository.findOne({ designationName: designationData.designationName });
    if (existingDesignation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_ALREADY_EXISTS, 409);
    }

    if (designationData.department) {
      const Department = (await import('../department/department.model.js')).default;
      const departmentExists = await Department.exists({ _id: designationData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError(DESIGNATION_MESSAGES.INVALID_DEPARTMENT, 400);
      }
    }

    if (designationData.minimumSalary !== null && designationData.maximumSalary !== null) {
      if (designationData.minimumSalary > designationData.maximumSalary) {
        throw new AppError('Minimum salary cannot be greater than maximum salary', 400);
      }
    }

    const designationCode = await designationRepository.generateDesignationCode();
    const designation = await designationRepository.create({
      ...designationData,
      designationCode,
      createdBy
    });

    return designation;
  }

  async updateDesignation(designationId, updateData, updatedBy) {
    const designation = await designationRepository.findById(designationId);
    if (!designation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND, 404);
    }

    if (updateData.designationName && updateData.designationName !== designation.designationName) {
      const existing = await designationRepository.findOne({ designationName: updateData.designationName });
      if (existing) {
        throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_ALREADY_EXISTS, 409);
      }
    }

    if (updateData.department) {
      const Department = (await import('../department/department.model.js')).default;
      const departmentExists = await Department.exists({ _id: updateData.department, isDeleted: false });
      if (!departmentExists) {
        throw new AppError(DESIGNATION_MESSAGES.INVALID_DEPARTMENT, 400);
      }
    }

    if (updateData.minimumSalary !== null && updateData.maximumSalary !== null) {
      if (updateData.minimumSalary > updateData.maximumSalary) {
        throw new AppError('Minimum salary cannot be greater than maximum salary', 400);
      }
    }

    const updatedDesignation = await designationRepository.updateById(designationId, { ...updateData, updatedBy });
    return updatedDesignation;
  }

  async deleteDesignation(designationId, deletedBy) {
    const designation = await designationRepository.findById(designationId);
    if (!designation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND, 404);
    }

    const hasEmployees = await designation.hasEmployees();
    if (hasEmployees) {
      throw new AppError(DESIGNATION_MESSAGES.CANNOT_DELETE_WITH_EMPLOYEES, 400);
    }

    await designationRepository.softDeleteById(designationId, deletedBy);
  }

  async restoreDesignation(designationId) {
    const designation = await designationRepository.restoreById(designationId);
    if (!designation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND, 404);
    }
    return designation;
  }

  async getDesignationById(designationId) {
    const designation = await designationRepository.findById(designationId);
    if (!designation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND, 404);
    }
    return designation;
  }

  async getDesignationByCode(designationCode) {
    const designation = await designationRepository.findByCode(designationCode);
    if (!designation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND, 404);
    }
    return designation;
  }

  async getAllDesignations(query = {}) {
    return designationRepository.findAll(query);
  }

  async searchDesignations(searchTerm, options = {}) {
    return designationRepository.search(searchTerm, options);
  }

  async filterDesignations(filters, options = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.department) query.department = filters.department;
    if (filters.hierarchyLevel) query.hierarchyLevel = filters.hierarchyLevel;
    if (filters.jobGrade) query.jobGrade = filters.jobGrade;
    return designationRepository.findWithPagination(query, options);
  }

  async getDesignationStatistics() {
    return designationRepository.getStatistics();
  }

  async getDesignationsByDepartment(departmentId) {
    return designationRepository.findByDepartment(departmentId);
  }

  async getDesignationsByHierarchyLevel(level) {
    return designationRepository.findByHierarchyLevel(level);
  }

  async getDesignationsByJobGrade(grade) {
    return designationRepository.findByJobGrade(grade);
  }

  async getDesignationsByStatus(status) {
    return designationRepository.findByStatus(status);
  }

  async getActiveDesignations() {
    return designationRepository.findActive();
  }

  async getDesignationsByHierarchyRange(minLevel, maxLevel) {
    return designationRepository.findByHierarchyRange(minLevel, maxLevel);
  }

  async getManagementDesignations() {
    return designationRepository.findAll().then(designations => designations.filter(d => d.hierarchyLevel >= 4));
  }

  async updateDesignationStatus(designationId, newStatus) {
    const designation = await designationRepository.updateById(designationId, { status: newStatus });
    if (!designation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND, 404);
    }
    return designation;
  }

  async updateDesignationDepartment(designationId, newDepartmentId) {
    if (newDepartmentId) {
      const Department = (await import('../department/department.model.js')).default;
      const departmentExists = await Department.exists({ _id: newDepartmentId, isDeleted: false });
      if (!departmentExists) {
        throw new AppError(DESIGNATION_MESSAGES.INVALID_DEPARTMENT, 400);
      }
    }

    const designation = await designationRepository.updateById(designationId, { department: newDepartmentId });
    if (!designation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND, 404);
    }
    return designation;
  }

  async updateDesignationHierarchy(designationId, newLevel) {
    const designation = await designationRepository.updateById(designationId, { hierarchyLevel: newLevel });
    if (!designation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND, 404);
    }
    return designation;
  }

  async updateSalaryRange(designationId, minSalary, maxSalary) {
    if (minSalary !== null && maxSalary !== null && minSalary > maxSalary) {
      throw new AppError('Minimum salary cannot be greater than maximum salary', 400);
    }

    const designation = await designationRepository.updateById(designationId, { minimumSalary: minSalary, maximumSalary: maxSalary });
    if (!designation) {
      throw new AppError(DESIGNATION_MESSAGES.DESIGNATION_NOT_FOUND, 404);
    }
    return designation;
  }
}

export default new DesignationService();
