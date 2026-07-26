import officeShiftService from './officeShift.service.js';
import { ApiResponse } from '../../../core/responses/index.js';

class OfficeShiftController {
  async create(req, res, next) {
    try {
      const shift = await officeShiftService.createShift(req.body, req.user.userId);
      return ApiResponse.created(res, 'Office shift created successfully', { shift });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const shifts = await officeShiftService.getAllShifts(req.query);
      return ApiResponse.success(res, 'Office shifts retrieved successfully', { shifts });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const shift = await officeShiftService.getShiftById(id);
      return ApiResponse.success(res, 'Office shift retrieved successfully', { shift });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const shift = await officeShiftService.updateShift(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Office shift updated successfully', { shift });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await officeShiftService.deleteShift(id, req.user.userId);
      return ApiResponse.success(res, 'Office shift deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const shift = await officeShiftService.restoreShift(id);
      return ApiResponse.success(res, 'Office shift restored successfully', { shift });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const shifts = await officeShiftService.getActiveShifts();
      return ApiResponse.success(res, 'Active office shifts retrieved successfully', { shifts });
    } catch (error) {
      next(error);
    }
  }

  async getDefault(req, res, next) {
    try {
      const shift = await officeShiftService.getDefaultShift();
      return ApiResponse.success(res, 'Default office shift retrieved successfully', { shift });
    } catch (error) {
      next(error);
    }
  }

  async getByCode(req, res, next) {
    try {
      const { code } = req.params;
      const shift = await officeShiftService.getShiftByCode(code);
      return ApiResponse.success(res, 'Office shift retrieved successfully', { shift });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const shifts = await officeShiftService.getShiftsByStatus(status === 'true');
      return ApiResponse.success(res, 'Office shifts retrieved successfully', { shifts });
    } catch (error) {
      next(error);
    }
  }

  async setAsDefault(req, res, next) {
    try {
      const { id } = req.params;
      const shift = await officeShiftService.setAsDefault(id);
      return ApiResponse.success(res, 'Office shift set as default successfully', { shift });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await officeShiftService.getShiftStatistics();
      return ApiResponse.success(res, 'Office shift statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }
}

export default new OfficeShiftController();
