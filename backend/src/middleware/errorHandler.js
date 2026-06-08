
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Ensure all errors are ApiError instances
  let error =
    err instanceof ApiError
      ? err
      : new ApiError(500, 'Internal Server Error');

  /**
   * Sanitize sensitive request data before logging
   */
  const sanitizedBody = { ...req.body };

  if (sanitizedBody.password) {
    sanitizedBody.password = '***';
  }

  if (sanitizedBody.confirmPassword) {
    sanitizedBody.confirmPassword = '***';
  }

  /**
   * Structured Error Logging
   */
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?._id || null,
    body: sanitizedBody,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });

  /**
   * Mongoose CastError
   * Example: Invalid ObjectId
   */
  if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(
      400,
      `Invalid ${err.path}`
    );
  }

  /**
   * Duplicate Key Error
   */
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];

    error = new ApiError(
      409,
      `${field} already exists`
    );
  }

  /**
   * Mongoose Validation Error
   */
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
      code: 'VALIDATION_ERROR',
    }));

    error = new ApiError(
      422,
      'Validation failed',
      errors
    );
  }

  /**
   * JWT Errors
   */
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(
      401,
      'Invalid token'
    );
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(
      401,
      'Token expired'
    );
  }

  /**
   * Multer Errors
   */
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError(
      413,
      'File size exceeds allowed limit'
    );
  }

  /**
   * Final Response
   */
  const statusCode = error.statusCode || 500;

  const response = {
    success: false,
    message: error.message || 'Internal Server Error',
    errors: error.errors || [],
  };

  /**
   * Show stack only in development
   */
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res
    .status(statusCode)
    .json(response);
};

/**
 * 404 Handler
 */
const notFound = (req, res, next) => {
  next(
    new ApiError(
      404,
      `Route not found: ${req.originalUrl}`
    )
  );
};

module.exports = {
  errorHandler,
  notFound,
};
