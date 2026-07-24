import { USER_ROLES } from '../../modules/auth/auth.constants.js';
import logger from '../../config/logger.js';

export const seedRoles = async () => {
  try {
    logger.info('Roles are configured in code (auth.constants.js):');
    Object.values(USER_ROLES).forEach(role => {
      logger.info(`  - ${role}`);
    });
    logger.info('Roles seeding complete (code-based configuration).');
    return true;
  } catch (error) {
    logger.error('Error seeding roles:', error);
    throw error;
  }
};
