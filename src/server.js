import app from './app.js';
import connectDB from './config/db.js';
import { config } from './config/env.js';
import logger from './config/logger.js';

await connectDB();

const server = app.listen(config.port, () => {
  logger.info('==================================\n\nEMS Backend Server Started\n\nEnvironment: ' + config.nodeEnv + '\nPort: ' + config.port + '\n\n==================================');
});

const gracefulShutdown = (signal) => {
  logger.warn(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${config.port} is already in use.`);
  } else {
    logger.error('Server error:', error);
  }
  process.exit(1);
});
