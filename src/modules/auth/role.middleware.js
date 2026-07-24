import AppError from '../../core/errors/AppError.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles || allowedRoles.length === 0) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};
