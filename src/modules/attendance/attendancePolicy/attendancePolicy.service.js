import attendancePolicyRepository from './attendancePolicy.repository.js';
import { POLICY_MESSAGES } from './attendancePolicy.constants.js';
import AppError from '../../../core/errors/AppError.js';

class AttendancePolicyService {
  async createPolicy(policyData, createdBy) {
    const existingPolicy = await attendancePolicyRepository.exists({
      companyName: policyData.companyName,
      policyName: policyData.policyName
    });
    if (existingPolicy) {
      throw new AppError(POLICY_MESSAGES.POLICY_ALREADY_EXISTS, 409);
    }

    if (policyData.isActive) {
      await attendancePolicyRepository.activatePolicy(null);
    }

    const policy = await attendancePolicyRepository.create({
      ...policyData,
      createdBy
    });

    return policy;
  }

  async updatePolicy(policyId, updateData, updatedBy) {
    const policy = await attendancePolicyRepository.findById(policyId);
    if (!policy) {
      throw new AppError(POLICY_MESSAGES.POLICY_NOT_FOUND, 404);
    }

    if (updateData.companyName || updateData.policyName) {
      const existingPolicy = await attendancePolicyRepository.exists({
        companyName: updateData.companyName || policy.companyName,
        policyName: updateData.policyName || policy.policyName,
        _id: { $ne: policyId }
      });
      if (existingPolicy) {
        throw new AppError(POLICY_MESSAGES.POLICY_ALREADY_EXISTS, 409);
      }
    }

    if (updateData.isActive) {
      await attendancePolicyRepository.activatePolicy(policyId);
    }

    const updatedPolicy = await attendancePolicyRepository.updateById(policyId, {
      ...updateData,
      updatedBy
    });

    return updatedPolicy;
  }

  async deletePolicy(policyId, deletedBy) {
    const policy = await attendancePolicyRepository.findById(policyId);
    if (!policy) {
      throw new AppError(POLICY_MESSAGES.POLICY_NOT_FOUND, 404);
    }

    if (policy.isActive) {
      throw new AppError(POLICY_MESSAGES.CANNOT_DELETE_ACTIVE_POLICY, 400);
    }

    await attendancePolicyRepository.softDeleteById(policyId, deletedBy);
  }

  async restorePolicy(policyId) {
    const policy = await attendancePolicyRepository.findByIdWithoutPopulate(policyId);
    if (!policy) {
      throw new AppError(POLICY_MESSAGES.POLICY_NOT_FOUND, 404);
    }

    if (!policy.isDeleted) {
      throw new AppError('Policy is not deleted', 400);
    }

    return await attendancePolicyRepository.restoreById(policyId);
  }

  async getPolicyById(policyId) {
    const policy = await attendancePolicyRepository.findById(policyId);
    if (!policy) {
      throw new AppError(POLICY_MESSAGES.POLICY_NOT_FOUND, 404);
    }
    return policy;
  }

  async getAllPolicies(query = {}) {
    return await attendancePolicyRepository.findAll(query);
  }

  async getActivePolicy() {
    return await attendancePolicyRepository.findActive();
  }

  async getAllActivePolicies() {
    return await attendancePolicyRepository.findAllActive();
  }

  async getPoliciesByCompany(companyName) {
    return await attendancePolicyRepository.findByCompany(companyName);
  }

  async getPoliciesByStatus(status) {
    return await attendancePolicyRepository.findByStatus(status);
  }

  async activatePolicy(policyId) {
    const policy = await attendancePolicyRepository.findById(policyId);
    if (!policy) {
      throw new AppError(POLICY_MESSAGES.POLICY_NOT_FOUND, 404);
    }

    return await attendancePolicyRepository.activatePolicy(policyId);
  }

  async getPolicyStatistics() {
    const total = await attendancePolicyRepository.count();
    const active = await attendancePolicyRepository.countByStatus(true);
    const inactive = await attendancePolicyRepository.countByStatus(false);

    return {
      total,
      active,
      inactive
    };
  }
}

export default new AttendancePolicyService();
