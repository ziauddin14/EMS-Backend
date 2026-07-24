import { verifyAccessToken } from './token.utils.js';
import authRepository from './auth.repository.js';
import sessionService from './session.service.js';
import AppError from '../../core/errors/AppError.js';
import logger from '../../config/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return next(new AppError('Authentication required. Please login.', 401));
    }

    const decoded = verifyAccessToken(accessToken);

    const user = await authRepository.findById(decoded.userId);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user.isDeleted) {
      return next(new AppError('User account has been deleted.', 404));
    }

    if (!user.isActive) {
      return next(new AppError('User account is inactive.', 403));
    }

    const session = await sessionService.getSessionById(decoded.sessionId);
    if (!session || !session.isActive()) {
      return next(new AppError('Session expired or invalid. Please login again.', 401));
    }

    if (session.userId.toString() !== user._id.toString()) {
      return next(new AppError('Invalid session.', 401));
    }

    await sessionService.updateSessionLastUsed(session._id);

    req.user = {
      userId: user._id,
      sessionId: session._id,
      deviceId: decoded.deviceId,
      tokenFamily: decoded.tokenFamily,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please login again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please login again.', 401));
    }
    logger.error('Authentication error:', error);
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      req.user = null;
      return next();
    }

    const decoded = verifyAccessToken(accessToken);

    const user = await authRepository.findById(decoded.userId);
    if (!user || user.isDeleted || !user.isActive) {
      req.user = null;
      return next();
    }

    const session = await sessionService.getSessionById(decoded.sessionId);
    if (!session || !session.isActive() || session.userId.toString() !== user._id.toString()) {
      req.user = null;
      return next();
    }

    await sessionService.updateSessionLastUsed(session._id);

    req.user = {
      userId: user._id,
      sessionId: session._id,
      deviceId: decoded.deviceId,
      tokenFamily: decoded.tokenFamily,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};
