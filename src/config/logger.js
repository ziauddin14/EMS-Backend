import winston from 'winston';
import { config } from './env.js';

const isDevelopment = config.nodeEnv === 'development';

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: isDevelopment
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
            return `[${level}]\n${timestamp}\n${message}\n${stack}\n--------------------------------`;
          }
          return `[${level}]\n${timestamp}\n${message}\n--------------------------------`;
        })
      )
    : winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
  transports: [
    new winston.transports.Console()
  ]
});

export default logger;
