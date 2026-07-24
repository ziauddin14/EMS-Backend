import mongoose from 'mongoose';
import { config } from '../../../config/env.js';
import logger from '../../../config/logger.js';
import { ApiResponse } from '../../../core/responses/index.js';
import { formatUptime } from '../helpers/formatUptime.js';

export const healthCheck = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const uptime = process.uptime();
  const uptimeFormatted = formatUptime(uptime);
  const timestamp = new Date().toISOString();

  logger.debug('Health check requested');

  const healthData = {
    server: 'running',
    database: dbStatus,
    environment: config.nodeEnv,
    uptime: uptimeFormatted,
    timestamp
  };

  return ApiResponse.success(res, 'EMS Backend is healthy.', healthData);
};
