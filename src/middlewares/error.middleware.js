import mongoose from 'mongoose';
import { config } from '../config/env.js';
import logger from '../config/logger.js';
import { ApiResponse } from '../core/responses/index.js';
import AppError from '../core/errors/AppError.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = 'Invalid input data.';
  return { message, errors };
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  logger.error('ERROR 💥', err);

  if (err.errors) {
    return ApiResponse.badRequest(res, err.message, err.errors);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  logger.error('ERROR 💥', err);

  if (err.isOperational) {
    return ApiResponse.badRequest(res, err.message);
  }

  if (err.errors) {
    return ApiResponse.badRequest(res, 'Invalid input data.', err.errors);
  }

  return ApiResponse.serverError(res, 'Something went wrong!');
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') {
      const { message, errors } = handleValidationErrorDB(err);
      return ApiResponse.badRequest(res, message, errors);
    }
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(error);
};
