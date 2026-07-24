import employeeRepository from '../employee/employee.repository.js';
import AppError from '../../core/errors/AppError.js';

class HierarchyService {
  async assignReportingManager(employeeId, managerId, updatedBy) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (managerId) {
      if (managerId.toString() === employeeId) {
        throw new AppError('Employee cannot report to themselves', 400);
      }

      const managerExists = await employeeRepository.exists({ _id: managerId, isDeleted: false });
      if (!managerExists) {
        throw new AppError('Reporting manager not found', 404);
      }

      const hasCircularReporting = await this.checkCircularReporting(employeeId, managerId);
      if (hasCircularReporting) {
        throw new AppError('Circular reporting detected', 400);
      }
    }

    const updatedEmployee = await employeeRepository.updateById(employeeId, { 
      reportingManager: managerId,
      updatedBy 
    });

    await this.updateReportingPath(employeeId);
    await this.updateOrganizationLevel(employeeId);
    await this.updateDirectReportCounts(managerId);

    return updatedEmployee;
  }

  async changeReportingManager(employeeId, newManagerId, updatedBy) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (newManagerId) {
      if (newManagerId.toString() === employeeId) {
        throw new AppError('Employee cannot report to themselves', 400);
      }

      const managerExists = await employeeRepository.exists({ _id: newManagerId, isDeleted: false });
      if (!managerExists) {
        throw new AppError('New reporting manager not found', 404);
      }

      const hasCircularReporting = await this.checkCircularReporting(employeeId, newManagerId);
      if (hasCircularReporting) {
        throw new AppError('Circular reporting detected', 400);
      }
    }

    const oldManagerId = employee.reportingManager;
    const updatedEmployee = await employeeRepository.updateById(employeeId, { 
      reportingManager: newManagerId,
      updatedBy 
    });

    await this.updateReportingPath(employeeId);
    await this.updateOrganizationLevel(employeeId);
    await this.updateDirectReportCounts(oldManagerId);
    await this.updateDirectReportCounts(newManagerId);

    return updatedEmployee;
  }

  async assignSecondaryManager(employeeId, secondaryManagerId, updatedBy) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (secondaryManagerId) {
      if (secondaryManagerId.toString() === employeeId) {
        throw new AppError('Employee cannot be their own secondary manager', 400);
      }

      const managerExists = await employeeRepository.exists({ _id: secondaryManagerId, isDeleted: false });
      if (!managerExists) {
        throw new AppError('Secondary manager not found', 404);
      }

      if (employee.reportingManager && secondaryManagerId.toString() === employee.reportingManager.toString()) {
        throw new AppError('Secondary manager cannot be the same as primary manager', 400);
      }
    }

    const updatedEmployee = await employeeRepository.updateById(employeeId, { 
      secondaryManager: secondaryManagerId,
      updatedBy 
    });

    return updatedEmployee;
  }

  async setDepartmentHead(employeeId, isHead, updatedBy) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const updatedEmployee = await employeeRepository.setDepartmentHead(employeeId, isHead);
    
    if (isHead && employee.department) {
      await employeeRepository.updateDepartmentHeadForDepartment(employee.department, employeeId);
    }

    return updatedEmployee;
  }

  async setTeamLead(employeeId, isLead, updatedBy) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employeeRepository.setTeamLead(employeeId, isLead);
  }

  async getOrganizationTree(rootEmployeeId = null) {
    return employeeRepository.findOrganizationTree(rootEmployeeId);
  }

  async getEmployeeHierarchy(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employeeRepository.findHierarchy(employeeId);
  }

  async getDirectReports(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employeeRepository.findDirectReports(employeeId);
  }

  async getIndirectReports(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employeeRepository.findIndirectReports(employeeId);
  }

  async getAllSubordinates(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const directReports = await employeeRepository.findDirectReports(employeeId);
    const indirectReports = await employeeRepository.findIndirectReports(employeeId);

    return {
      direct: directReports,
      indirect: indirectReports,
      total: directReports.length + indirectReports.length
    };
  }

  async getDepartmentHierarchy(departmentId) {
    const Department = (await import('../department/department.model.js')).default;
    const departmentExists = await Department.exists({ _id: departmentId, isDeleted: false });
    if (!departmentExists) {
      throw new AppError('Department not found', 404);
    }

    const departmentHead = await employeeRepository.findDepartmentHead(departmentId);
    const employees = await employeeRepository.findByDepartment(departmentId);

    const hierarchy = {
      department: departmentId,
      departmentHead: departmentHead || null,
      employees: employees,
      totalEmployees: employees.length
    };

    if (departmentHead) {
      hierarchy.reportingTree = await this.buildDepartmentTree(departmentHead._id, departmentId);
    }

    return hierarchy;
  }

  async buildDepartmentTree(managerId, departmentId) {
    const directReports = await employeeRepository.findDirectReports(managerId);
    const departmentReports = directReports.filter(emp => emp.department && emp.department._id.toString() === departmentId);

    const tree = [];
    for (const report of departmentReports) {
      const node = report.toObject();
      node.subordinates = await this.buildDepartmentTree(report._id, departmentId);
      tree.push(node);
    }

    return tree;
  }

  async getReportingChain(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employeeRepository.findReportingChain(employeeId);
  }

  async checkCircularReporting(employeeId, potentialManagerId) {
    const hierarchy = await employeeRepository.findHierarchy(potentialManagerId, 20);
    const employeeIds = hierarchy.map(emp => emp._id.toString());
    return employeeIds.includes(employeeId);
  }

  async updateReportingPath(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) return;

    const reportingPath = [];
    let currentManager = employee.reportingManager;

    while (currentManager) {
      reportingPath.push(currentManager._id);
      const manager = await employeeRepository.findById(currentManager._id);
      if (!manager) break;
      currentManager = manager.reportingManager;
    }

    await employeeRepository.updateReportingPath(employeeId, reportingPath);

    const subordinates = await employeeRepository.findDirectReports(employeeId);
    for (const subordinate of subordinates) {
      await this.updateReportingPath(subordinate._id);
    }
  }

  async updateOrganizationLevel(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) return;

    let level = 0;
    let currentManager = employee.reportingManager;

    while (currentManager) {
      level++;
      const manager = await employeeRepository.findById(currentManager._id);
      if (!manager) break;
      currentManager = manager.reportingManager;
    }

    await employeeRepository.updateOrganizationLevel(employeeId, level);

    const subordinates = await employeeRepository.findDirectReports(employeeId);
    for (const subordinate of subordinates) {
      await this.updateOrganizationLevel(subordinate._id);
    }
  }

  async updateDirectReportCounts(managerId) {
    if (!managerId) return;

    const directReportCount = await employeeRepository.countSubordinates(managerId, false);
    await employeeRepository.updateDirectReportCount(managerId, directReportCount);
  }

  async getDepartmentHeads() {
    return employeeRepository.findDepartmentHeads();
  }

  async getTeamLeads() {
    return employeeRepository.findTeamLeads();
  }

  async getEmployeesByOrganizationLevel(level) {
    return employeeRepository.findByOrganizationLevel(level);
  }

  async getHierarchyStatistics() {
    const totalEmployees = await employeeRepository.countDocuments({ isDeleted: false });
    const departmentHeads = await employeeRepository.countDocuments({ isDepartmentHead: true, isDeleted: false });
    const teamLeads = await employeeRepository.countDocuments({ isTeamLead: true, isDeleted: false });
    const employeesWithoutManager = await employeeRepository.countDocuments({ reportingManager: null, isDeleted: false });

    const byLevel = await employeeRepository.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$organizationLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalEmployees,
      departmentHeads,
      teamLeads,
      employeesWithoutManager,
      byLevel
    };
  }

  async validateHierarchyChange(employeeId, newManagerId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const validation = {
      isValid: true,
      errors: []
    };

    if (newManagerId) {
      if (newManagerId.toString() === employeeId) {
        validation.isValid = false;
        validation.errors.push('Employee cannot report to themselves');
      }

      const managerExists = await employeeRepository.exists({ _id: newManagerId, isDeleted: false });
      if (!managerExists) {
        validation.isValid = false;
        validation.errors.push('Reporting manager not found');
      }

      const hasCircularReporting = await this.checkCircularReporting(employeeId, newManagerId);
      if (hasCircularReporting) {
        validation.isValid = false;
        validation.errors.push('Circular reporting detected');
      }
    }

    return validation;
  }

  async getManagerChainForApproval(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const approvalChain = [];
    let current = employee;

    while (current.reportingManager) {
      const manager = await employeeRepository.findById(current.reportingManager._id);
      if (!manager) break;
      
      approvalChain.push({
        employeeId: manager._id,
        employeeNumber: manager.employeeNumber,
        name: manager.user?.fullName || 'Unknown',
        designation: manager.designation,
        level: manager.organizationLevel,
        isDepartmentHead: manager.isDepartmentHead
      });

      current = manager;
    }

    return approvalChain;
  }
}

export default new HierarchyService();
