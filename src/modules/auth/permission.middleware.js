import { hasPermission, hasAnyPermission, hasAllPermissions } from './auth.permissions.js';
import AppError from '../../core/errors/AppError.js';

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!hasPermission(req.user.role, permission)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

export const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

export const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!hasAllPermissions(req.user.role, permissions)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};
