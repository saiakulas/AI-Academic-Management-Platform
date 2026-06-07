const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const createLimiter = (options = {}) =>
  rateLimit({
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

// Strict limiter for auth endpoints
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

// General API limiter
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

module.exports = { authLimiter, apiLimiter, createLimiter };
