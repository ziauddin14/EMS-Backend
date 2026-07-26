import officeShiftRepository from './officeShift.repository.js';
import { SHIFT_MESSAGES } from './officeShift.constants.js';
import AppError from '../../../core/errors/AppError.js';

class OfficeShiftService {
  async createShift(shiftData, createdBy) {
    const existingShift = await officeShiftRepository.findByCode(shiftData.code);
    if (existingShift) {
      throw new AppError(SHIFT_MESSAGES.SHIFT_ALREADY_EXISTS, 409);
    }

    if (shiftData.isDefault) {
      await officeShiftRepository.setAsDefault(null);
    }

    const shift = await officeShiftRepository.create({
      ...shiftData,
      createdBy
    });

    return shift;
  }

  async updateShift(shiftId, updateData, updatedBy) {
    const shift = await officeShiftRepository.findById(shiftId);
    if (!shift) {
      throw new AppError(SHIFT_MESSAGES.SHIFT_NOT_FOUND, 404);
    }

    if (updateData.code && updateData.code !== shift.code) {
      const existingShift = await officeShiftRepository.findByCode(updateData.code);
      if (existingShift) {
        throw new AppError(SHIFT_MESSAGES.SHIFT_ALREADY_EXISTS, 409);
      }
    }

    if (updateData.isDefault) {
      await officeShiftRepository.setAsDefault(shiftId);
    }

    const updatedShift = await officeShiftRepository.updateById(shiftId, {
      ...updateData,
      updatedBy
    });

    return updatedShift;
  }

  async deleteShift(shiftId, deletedBy) {
    const shift = await officeShiftRepository.findById(shiftId);
    if (!shift) {
      throw new AppError(SHIFT_MESSAGES.SHIFT_NOT_FOUND, 404);
    }

    if (shift.isDefault) {
      throw new AppError(SHIFT_MESSAGES.CANNOT_DELETE_DEFAULT_SHIFT, 400);
    }

    const hasEmployees = await shift.hasEmployees();
    if (hasEmployees) {
      throw new AppError(SHIFT_MESSAGES.SHIFT_HAS_EMPLOYEES, 400);
    }

    await officeShiftRepository.softDeleteById(shiftId, deletedBy);
  }

  async restoreShift(shiftId) {
    const shift = await officeShiftRepository.findByIdWithoutPopulate(shiftId);
    if (!shift) {
      throw new AppError(SHIFT_MESSAGES.SHIFT_NOT_FOUND, 404);
    }

    if (!shift.isDeleted) {
      throw new AppError('Shift is not deleted', 400);
    }

    return await officeShiftRepository.restoreById(shiftId);
  }

  async getShiftById(shiftId) {
    const shift = await officeShiftRepository.findById(shiftId);
    if (!shift) {
      throw new AppError(SHIFT_MESSAGES.SHIFT_NOT_FOUND, 404);
    }
    return shift;
  }

  async getAllShifts(query = {}) {
    return await officeShiftRepository.findAll(query);
  }

  async getActiveShifts() {
    return await officeShiftRepository.findActive();
  }

  async getDefaultShift() {
    return await officeShiftRepository.findDefault();
  }

  async getShiftByCode(code) {
    const shift = await officeShiftRepository.findByCode(code);
    if (!shift) {
      throw new AppError(SHIFT_MESSAGES.SHIFT_NOT_FOUND, 404);
    }
    return shift;
  }

  async getShiftsByStatus(status) {
    return await officeShiftRepository.findByStatus(status);
  }

  async setAsDefault(shiftId) {
    const shift = await officeShiftRepository.findById(shiftId);
    if (!shift) {
      throw new AppError(SHIFT_MESSAGES.SHIFT_NOT_FOUND, 404);
    }

    if (!shift.isActive) {
      throw new AppError('Cannot set inactive shift as default', 400);
    }

    return await officeShiftRepository.setAsDefault(shiftId);
  }

  async getShiftStatistics() {
    const total = await officeShiftRepository.count();
    const active = await officeShiftRepository.countByStatus(true);
    const inactive = await officeShiftRepository.countByStatus(false);

    return {
      total,
      active,
      inactive
    };
  }
}

export default new OfficeShiftService();
