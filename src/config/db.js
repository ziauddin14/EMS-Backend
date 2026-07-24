import mongoose from 'mongoose';
import { config } from './env.js';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const options = {
      autoIndex: true,
    };

    await mongoose.connect(config.mongoUri, options);

    const connection = mongoose.connection;
    
    logger.info('✔ MongoDB Connected');
    logger.info(`Database: ${connection.name}`);
  } catch (error) {
    logger.error('✗ MongoDB Connection Failed');
    logger.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
