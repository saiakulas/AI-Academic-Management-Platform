const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

// In development, disable rate limiting so local testing isn't blocked
const isDev = process.env.NODE_ENV !== 'production';

const createLimiter = (options = {}) => {
  if (isDev) {
    // Pass-through middleware in development
    return (_req, _res, next) => next();
  }

  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(
        new ApiError(
          429,
          options.message || 'Too many requests. Please try again later.'
        )
      );
    },
  });
};

// Strict limiter for auth endpoints (production only)
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

// General API limiter (production only)
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

module.exports = { authLimiter, apiLimiter, createLimiter };
