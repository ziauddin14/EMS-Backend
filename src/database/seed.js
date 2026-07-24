import connectDB from '../config/db.js';
import { seedSystem } from './seeders/system.seeder.js';
import logger from '../config/logger.js';

const seed = async () => {
  try {
    await connectDB();
    await seedSystem();
    logger.info('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
