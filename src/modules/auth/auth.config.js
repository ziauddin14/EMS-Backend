import { config } from '../../config/env.js';

export const authConfig = {
  jwt: {
    accessTokenExpiry: config.jwtExpiresIn || '15m',
    refreshTokenExpiry: config.refreshTokenExpiresIn || '7d',
    algorithm: 'HS256',
    issuer: 'ems-backend',
    audience: 'ems-users',
    secret: config.jwtSecret,
    refreshTokenSecret: config.refreshTokenSecret
  },
  cookie: {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    domain: config.nodeEnv === 'production' ? process.env.COOKIE_DOMAIN : undefined
  },
  session: {
    maxSessionsPerUser: 5,
    sessionExpiryBuffer: 5 * 60 * 1000,
    cleanupInterval: 24 * 60 * 60 * 1000
  },
  security: {
    enableTokenRotation: true,
    enableDeviceTracking: true,
    enableIPTracking: true,
    enableUserAgentTracking: true,
    maxRefreshAttempts: 5,
    refreshWindow: 30 * 60 * 1000
  }
};
