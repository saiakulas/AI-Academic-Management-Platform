const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?._id,
  });

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ApiError(409, `${field ? `'${err.keyValue[field]}'` : 'A record'} already exists`);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ApiError(422, 'Validation failed', errors);
  }

  // JWT errors handled in auth middleware — this is a catch-all
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError(413, 'File size exceeds the allowed limit');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Handle 404 routes
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
