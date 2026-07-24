import employeeLifecycleRepository from './employeeLifecycle.repository.js';
import employeeRepository from '../employee/employee.repository.js';
import AppError from '../../core/errors/AppError.js';

const VALID_TRANSITIONS = {
  joined: ['probation', 'confirmed', 'suspended', 'resigned', 'terminated'],
  probation: ['confirmed', 'suspended', 'resigned', 'terminated'],
  confirmed: ['promoted', 'transferred', 'on_leave', 'suspended', 'resigned', 'terminated'],
  promoted: ['confirmed', 'transferred', 'on_leave', 'suspended', 'resigned', 'terminated'],
  transferred: ['confirmed', 'on_leave', 'suspended', 'resigned', 'terminated'],
  on_leave: ['confirmed', 'suspended', 'resigned', 'terminated'],
  suspended: ['confirmed', 'resigned', 'terminated'],
  resigned: ['notice_period'],
  notice_period: ['relieved'],
  relieved: ['rehired'],
  terminated: ['rehired'],
  retired: ['rehired'],
  rehired: ['joined', 'probation', 'confirmed']
};

class EmployeeLifecycleService {
  async recordLifecycleEvent(employeeId, eventType, previousStage, newStage, changedBy, reason = null, remarks = null, metadata = {}) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const event = await employeeLifecycleRepository.create({
      employee: employeeId,
      previousStage,
      newStage,
      eventType,
      effectiveDate: new Date(),
      changedBy,
      reason,
      remarks,
      metadata,
      createdBy: changedBy
    });

    await this.updateEmployeeStage(employeeId, newStage, changedBy);
    await this.addEmploymentHistory(employeeId, newStage, changedBy, remarks);

    return event;
  }

  async updateEmployeeStage(employeeId, newStage, changedBy) {
    const updateData = {
      employmentStage: newStage,
      updatedBy: changedBy
    };

    if (newStage === 'confirmed') {
      updateData.isConfirmed = true;
      updateData.isOnProbation = false;
      updateData.confirmationDate = new Date();
    } else if (newStage === 'probation') {
      updateData.isOnProbation = true;
      updateData.isConfirmed = false;
      updateData.probationStartDate = new Date();
    } else if (newStage === 'resigned') {
      updateData.isResigned = true;
    } else if (newStage === 'notice_period') {
      updateData.isResigned = true;
      updateData.noticeStartDate = new Date();
    } else if (newStage === 'relieved') {
      updateData.isResigned = false;
      updateData.exitDate = new Date();
    } else if (newStage === 'terminated') {
      updateData.isTerminated = true;
      updateData.exitDate = new Date();
    } else if (newStage === 'rehired') {
      updateData.isTerminated = false;
      updateData.isResigned = false;
    }

    return employeeRepository.updateById(employeeId, updateData);
  }

  async addEmploymentHistory(employeeId, stage, changedBy, remarks = null) {
    const employee = await employeeRepository.findByIdWithoutPopulate(employeeId);
    if (!employee) return;

    employee.employmentHistory.push({
      stage,
      effectiveDate: new Date(),
      changedBy,
      remarks
    });

    return employee.save();
  }

  async validateStageTransition(employeeId, newStage) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const currentStage = employee.employmentStage;
    const allowedTransitions = VALID_TRANSITIONS[currentStage] || [];

    if (!allowedTransitions.includes(newStage)) {
      throw new AppError(`Invalid stage transition from ${currentStage} to ${newStage}`, 400);
    }

    return true;
  }

  async confirmEmployee(employeeId, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (employee.isConfirmed) {
      throw new AppError('Employee is already confirmed', 400);
    }

    await this.validateStageTransition(employeeId, 'confirmed');

    return this.recordLifecycleEvent(
      employeeId,
      'confirm',
      employee.employmentStage,
      'confirmed',
      changedBy,
      null,
      remarks
    );
  }

  async startProbation(employeeId, probationEndDate, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (employee.isOnProbation) {
      throw new AppError('Employee is already on probation', 400);
    }

    await this.validateStageTransition(employeeId, 'probation');

    await employeeRepository.updateById(employeeId, {
      probationStartDate: new Date(),
      probationEndDate: new Date(probationEndDate),
      updatedBy: changedBy
    });

    return this.recordLifecycleEvent(
      employeeId,
      'probation_start',
      employee.employmentStage,
      'probation',
      changedBy,
      null,
      remarks,
      { probationEndDate }
    );
  }

  async completeProbation(employeeId, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (!employee.isOnProbation) {
      throw new AppError('Employee is not on probation', 400);
    }

    await this.validateStageTransition(employeeId, 'confirmed');

    return this.recordLifecycleEvent(
      employeeId,
      'probation_complete',
      employee.employmentStage,
      'confirmed',
      changedBy,
      'Probation completed successfully',
      remarks
    );
  }

  async promoteEmployee(employeeId, newDesignationId, salary, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (employee.isTerminated || employee.isResigned) {
      throw new AppError('Cannot promote terminated or resigned employee', 400);
    }

    await this.validateStageTransition(employeeId, 'promoted');

    const Designation = (await import('../designation/designation.model.js')).default;
    const designationExists = await Designation.exists({ _id: newDesignationId, isDeleted: false });
    if (!designationExists) {
      throw new AppError('Designation not found', 404);
    }

    const employeeData = await employeeRepository.findByIdWithoutPopulate(employeeId);
    employeeData.promotionHistory.push({
      designation: newDesignationId,
      department: employeeData.department,
      effectiveDate: new Date(),
      salary,
      promotedBy: changedBy
    });
    await employeeData.save();

    await employeeRepository.updateById(employeeId, {
      designation: newDesignationId,
      updatedBy: changedBy
    });

    return this.recordLifecycleEvent(
      employeeId,
      'promote',
      employee.employmentStage,
      'promoted',
      changedBy,
      'Employee promoted',
      remarks,
      { newDesignationId, salary }
    );
  }

  async transferEmployee(employeeId, newDepartmentId, reason, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (employee.isTerminated || employee.isResigned) {
      throw new AppError('Cannot transfer terminated or resigned employee', 400);
    }

    await this.validateStageTransition(employeeId, 'transferred');

    const Department = (await import('../department/department.model.js')).default;
    const departmentExists = await Department.exists({ _id: newDepartmentId, isDeleted: false });
    if (!departmentExists) {
      throw new AppError('Department not found', 404);
    }

    const employeeData = await employeeRepository.findByIdWithoutPopulate(employeeId);
    employeeData.transferHistory.push({
      fromDepartment: employeeData.department,
      toDepartment: newDepartmentId,
      effectiveDate: new Date(),
      transferredBy: changedBy,
      reason
    });
    await employeeData.save();

    await employeeRepository.updateById(employeeId, {
      department: newDepartmentId,
      updatedBy: changedBy
    });

    return this.recordLifecycleEvent(
      employeeId,
      'transfer',
      employee.employmentStage,
      'transferred',
      changedBy,
      reason,
      remarks,
      { newDepartmentId }
    );
  }

  async suspendEmployee(employeeId, reason, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (employee.employmentStatus === 'suspended') {
      throw new AppError('Employee is already suspended', 400);
    }

    await this.validateStageTransition(employeeId, 'suspended');

    await employeeRepository.updateById(employeeId, {
      employmentStatus: 'suspended',
      updatedBy: changedBy
    });

    return this.recordLifecycleEvent(
      employeeId,
      'suspend',
      employee.employmentStage,
      'suspended',
      changedBy,
      reason,
      remarks
    );
  }

  async resumeEmployee(employeeId, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (employee.employmentStatus !== 'suspended') {
      throw new AppError('Employee is not suspended', 400);
    }

    await this.validateStageTransition(employeeId, 'confirmed');

    await employeeRepository.updateById(employeeId, {
      employmentStatus: 'active',
      updatedBy: changedBy
    });

    return this.recordLifecycleEvent(
      employeeId,
      'resume',
      employee.employmentStage,
      'confirmed',
      changedBy,
      'Employee resumed',
      remarks
    );
  }

  async resignEmployee(employeeId, resignationReason, noticePeriodDays, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (employee.isResigned) {
      throw new AppError('Employee is already resigned', 400);
    }

    if (employee.isTerminated) {
      throw new AppError('Employee is already terminated', 400);
    }

    await this.validateStageTransition(employeeId, 'resigned');

    await employeeRepository.updateById(employeeId, {
      resignationReason,
      noticePeriodDays: noticePeriodDays || 30,
      updatedBy: changedBy
    });

    return this.recordLifecycleEvent(
      employeeId,
      'resign',
      employee.employmentStage,
      'resigned',
      changedBy,
      resignationReason,
      remarks,
      { noticePeriodDays }
    );
  }

  async startNoticePeriod(employeeId, lastWorkingDate, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (!employee.isResigned) {
      throw new AppError('Employee must be resigned before starting notice period', 400);
    }

    if (employee.noticeStartDate) {
      throw new AppError('Notice period already started', 400);
    }

    await this.validateStageTransition(employeeId, 'notice_period');

    await employeeRepository.updateById(employeeId, {
      noticeStartDate: new Date(),
      lastWorkingDate: new Date(lastWorkingDate),
      updatedBy: changedBy
    });

    return this.recordLifecycleEvent(
      employeeId,
      'notice_start',
      employee.employmentStage,
      'notice_period',
      changedBy,
      'Notice period started',
      remarks,
      { lastWorkingDate }
    );
  }

  async completeExit(employeeId, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (!employee.isResigned) {
      throw new AppError('Employee must be resigned to complete exit', 400);
    }

    await this.validateStageTransition(employeeId, 'relieved');

    await employeeRepository.updateById(employeeId, {
      employmentStatus: 'resigned',
      exitDate: new Date(),
      updatedBy: changedBy
    });

    return this.recordLifecycleEvent(
      employeeId,
      'exit_complete',
      employee.employmentStage,
      'relieved',
      changedBy,
      'Exit completed',
      remarks
    );
  }

  async terminateEmployee(employeeId, terminationReason, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (employee.isTerminated) {
      throw new AppError('Employee is already terminated', 400);
    }

    await this.validateStageTransition(employeeId, 'terminated');

    await employeeRepository.updateById(employeeId, {
      terminationReason,
      employmentStatus: 'terminated',
      exitDate: new Date(),
      updatedBy: changedBy
    });

    return this.recordLifecycleEvent(
      employeeId,
      'terminate',
      employee.employmentStage,
      'terminated',
      changedBy,
      terminationReason,
      remarks
    );
  }

  async rehireEmployee(employeeId, newDesignationId, newDepartmentId, joiningDate, changedBy, remarks = null) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (!employee.isTerminated && !employee.isResigned) {
      throw new AppError('Employee must be terminated or resigned to be rehired', 400);
    }

    await this.validateStageTransition(employeeId, 'rehired');

    const updateData = {
      employmentStatus: 'active',
      employmentStage: 'joined',
      joiningDate: new Date(joiningDate),
      updatedBy: changedBy
    };

    if (newDesignationId) {
      const Designation = (await import('../designation/designation.model.js')).default;
      const designationExists = await Designation.exists({ _id: newDesignationId, isDeleted: false });
      if (!designationExists) {
        throw new AppError('Designation not found', 404);
      }
      updateData.designation = newDesignationId;
    }

    if (newDepartmentId) {
      const Department = (await import('../department/department.model.js')).default;
      const departmentExists = await Department.exists({ _id: newDepartmentId, isDeleted: false });
      if (!departmentExists) {
        throw new AppError('Department not found', 404);
      }
      updateData.department = newDepartmentId;
    }

    await employeeRepository.updateById(employeeId, updateData);

    return this.recordLifecycleEvent(
      employeeId,
      'rehire',
      employee.employmentStage,
      'rehired',
      changedBy,
      'Employee rehired',
      remarks,
      { newDesignationId, newDepartmentId, joiningDate }
    );
  }

  async getEmployeeHistory(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employeeLifecycleRepository.getEmployeeHistory(employeeId);
  }

  async getLifecycleStatistics() {
    return employeeLifecycleRepository.getStatistics();
  }

  async getEmployeeLifecycleStatus(employeeId) {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const history = await employeeLifecycleRepository.getEmployeeHistory(employeeId);
    const latestEvent = await employeeLifecycleRepository.getLatestEvent(employeeId);

    return {
      currentStage: employee.employmentStage,
      isConfirmed: employee.isConfirmed,
      isOnProbation: employee.isOnProbation,
      isResigned: employee.isResigned,
      isTerminated: employee.isTerminated,
      probationStartDate: employee.probationStartDate,
      probationEndDate: employee.probationEndDate,
      confirmationDate: employee.confirmationDate,
      noticeStartDate: employee.noticeStartDate,
      lastWorkingDate: employee.lastWorkingDate,
      exitDate: employee.exitDate,
      terminationReason: employee.terminationReason,
      resignationReason: employee.resignationReason,
      history,
      latestEvent
    };
  }
}

export default new EmployeeLifecycleService();
