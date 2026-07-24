import { PERMISSIONS, ROLE_PERMISSIONS, USER_ROLES } from '../../modules/auth/auth.permissions.js';
import logger from '../../config/logger.js';

export const seedPermissions = async () => {
  try {
    logger.info('Permissions are configured in code (auth.permissions.js):');
    Object.values(PERMISSIONS).forEach(permission => {
      logger.info(`  - ${permission}`);
    });

    logger.info('Role-Permission mappings:');
    Object.entries(ROLE_PERMISSIONS).forEach(([role, permissions]) => {
      logger.info(`  ${role}: ${permissions.length} permissions`);
    });

    logger.info('Permissions seeding complete (code-based configuration).');
    return true;
  } catch (error) {
    logger.error('Error seeding permissions:', error);
    throw error;
  }
};
