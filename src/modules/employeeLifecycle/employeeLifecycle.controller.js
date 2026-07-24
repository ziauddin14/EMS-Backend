import employeeLifecycleService from './employeeLifecycle.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class EmployeeLifecycleController {
  async confirm(req, res, next) {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const result = await employeeLifecycleService.confirmEmployee(id, req.user.userId, remarks);
      return ApiResponse.success(res, 'Employee confirmed successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async startProbation(req, res, next) {
    try {
      const { id } = req.params;
      const { probationEndDate, remarks } = req.body;
      const result = await employeeLifecycleService.startProbation(id, probationEndDate, req.user.userId, remarks);
      return ApiResponse.success(res, 'Probation started successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async completeProbation(req, res, next) {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const result = await employeeLifecycleService.completeProbation(id, req.user.userId, remarks);
      return ApiResponse.success(res, 'Probation completed successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async promote(req, res, next) {
    try {
      const { id } = req.params;
      const { newDesignationId, salary, remarks } = req.body;
      const result = await employeeLifecycleService.promoteEmployee(id, newDesignationId, salary, req.user.userId, remarks);
      return ApiResponse.success(res, 'Employee promoted successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async transfer(req, res, next) {
    try {
      const { id } = req.params;
      const { newDepartmentId, reason, remarks } = req.body;
      const result = await employeeLifecycleService.transferEmployee(id, newDepartmentId, reason, req.user.userId, remarks);
      return ApiResponse.success(res, 'Employee transferred successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async suspend(req, res, next) {
    try {
      const { id } = req.params;
      const { reason, remarks } = req.body;
      const result = await employeeLifecycleService.suspendEmployee(id, reason, req.user.userId, remarks);
      return ApiResponse.success(res, 'Employee suspended successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async resume(req, res, next) {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const result = await employeeLifecycleService.resumeEmployee(id, req.user.userId, remarks);
      return ApiResponse.success(res, 'Employee resumed successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async resign(req, res, next) {
    try {
      const { id } = req.params;
      const { resignationReason, noticePeriodDays, remarks } = req.body;
      const result = await employeeLifecycleService.resignEmployee(id, resignationReason, noticePeriodDays, req.user.userId, remarks);
      return ApiResponse.success(res, 'Employee resigned successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async startNotice(req, res, next) {
    try {
      const { id } = req.params;
      const { lastWorkingDate, remarks } = req.body;
      const result = await employeeLifecycleService.startNoticePeriod(id, lastWorkingDate, req.user.userId, remarks);
      return ApiResponse.success(res, 'Notice period started successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async completeExit(req, res, next) {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const result = await employeeLifecycleService.completeExit(id, req.user.userId, remarks);
      return ApiResponse.success(res, 'Exit completed successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async terminate(req, res, next) {
    try {
      const { id } = req.params;
      const { terminationReason, remarks } = req.body;
      const result = await employeeLifecycleService.terminateEmployee(id, terminationReason, req.user.userId, remarks);
      return ApiResponse.success(res, 'Employee terminated successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async rehire(req, res, next) {
    try {
      const { id } = req.params;
      const { newDesignationId, newDepartmentId, joiningDate, remarks } = req.body;
      const result = await employeeLifecycleService.rehireEmployee(id, newDesignationId, newDepartmentId, joiningDate, req.user.userId, remarks);
      return ApiResponse.success(res, 'Employee rehired successfully', { event: result });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { employeeId } = req.params;
      const history = await employeeLifecycleService.getEmployeeHistory(employeeId);
      return ApiResponse.success(res, 'Employee history retrieved successfully', { history, count: history.length });
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      const { employeeId } = req.params;
      const status = await employeeLifecycleService.getEmployeeLifecycleStatus(employeeId);
      return ApiResponse.success(res, 'Employee lifecycle status retrieved successfully', status);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await employeeLifecycleService.getLifecycleStatistics();
      return ApiResponse.success(res, 'Lifecycle statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }
}

export default new EmployeeLifecycleController();
