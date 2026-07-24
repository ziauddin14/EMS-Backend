import { seedRoles } from './roles.seeder.js';
import { seedPermissions } from './permissions.seeder.js';
import { seedSuperAdmin } from './superAdmin.seeder.js';
import logger from '../../config/logger.js';

export const seedSystem = async () => {
  try {
    logger.info('==================================');
    logger.info('Starting System Seeding');
    logger.info('==================================\n');

    await seedRoles();
    logger.info('');

    await seedPermissions();
    logger.info('');

    await seedSuperAdmin();
    logger.info('');

    logger.info('==================================');
    logger.info('System Seeding Completed');
    logger.info('==================================');
  } catch (error) {
    logger.error('System seeding failed:', error);
    throw error;
  }
};
