import { config } from '../../config/env.js';
import { authRepository } from '../../modules/auth/index.js';
import { USER_ROLES, USER_STATUS } from '../../modules/auth/auth.constants.js';
import logger from '../../config/logger.js';

export const seedSuperAdmin = async () => {
  try {
    const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_FIRST_NAME, SUPER_ADMIN_LAST_NAME } = process.env;

    if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD || !SUPER_ADMIN_FIRST_NAME || !SUPER_ADMIN_LAST_NAME) {
      logger.warn('Super Admin environment variables not set. Skipping Super Admin seeding.');
      return;
    }

    const existingAdmin = await authRepository.findByEmail(SUPER_ADMIN_EMAIL);
    if (existingAdmin) {
      logger.info('Super Admin already exists. Skipping creation.');
      return existingAdmin;
    }

    const superAdminData = {
      firstName: SUPER_ADMIN_FIRST_NAME,
      lastName: SUPER_ADMIN_LAST_NAME,
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      role: USER_ROLES.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE,
      isEmailVerified: true,
      isActive: true
    };

    const superAdmin = await authRepository.create(superAdminData);
    logger.info('Super Admin created successfully.');
    return superAdmin;
  } catch (error) {
    logger.error('Error seeding Super Admin:', error);
    throw error;
  }
};
