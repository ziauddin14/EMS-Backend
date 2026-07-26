import attendancePolicyService from './attendancePolicy.service.js';
import { ApiResponse } from '../../../core/responses/index.js';

class AttendancePolicyController {
  async create(req, res, next) {
    try {
      const policy = await attendancePolicyService.createPolicy(req.body, req.user.userId);
      return ApiResponse.created(res, 'Attendance policy created successfully', { policy });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const policies = await attendancePolicyService.getAllPolicies(req.query);
      return ApiResponse.success(res, 'Attendance policies retrieved successfully', { policies });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const policy = await attendancePolicyService.getPolicyById(id);
      return ApiResponse.success(res, 'Attendance policy retrieved successfully', { policy });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const policy = await attendancePolicyService.updatePolicy(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Attendance policy updated successfully', { policy });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await attendancePolicyService.deletePolicy(id, req.user.userId);
      return ApiResponse.success(res, 'Attendance policy deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const policy = await attendancePolicyService.restorePolicy(id);
      return ApiResponse.success(res, 'Attendance policy restored successfully', { policy });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const policy = await attendancePolicyService.getActivePolicy();
      return ApiResponse.success(res, 'Active attendance policy retrieved successfully', { policy });
    } catch (error) {
      next(error);
    }
  }

  async getAllActive(req, res, next) {
    try {
      const policies = await attendancePolicyService.getAllActivePolicies();
      return ApiResponse.success(res, 'Active attendance policies retrieved successfully', { policies });
    } catch (error) {
      next(error);
    }
  }

  async getByCompany(req, res, next) {
    try {
      const { companyName } = req.params;
      const policies = await attendancePolicyService.getPoliciesByCompany(companyName);
      return ApiResponse.success(res, 'Attendance policies retrieved successfully', { policies });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const policies = await attendancePolicyService.getPoliciesByStatus(status === 'true');
      return ApiResponse.success(res, 'Attendance policies retrieved successfully', { policies });
    } catch (error) {
      next(error);
    }
  }

  async activate(req, res, next) {
    try {
      const { id } = req.params;
      const policy = await attendancePolicyService.activatePolicy(id);
      return ApiResponse.success(res, 'Attendance policy activated successfully', { policy });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await attendancePolicyService.getPolicyStatistics();
      return ApiResponse.success(res, 'Attendance policy statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendancePolicyController();
