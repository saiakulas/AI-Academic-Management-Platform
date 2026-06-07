const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authenticate: verify JWT access token from Authorization header or cookie
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  // Fallback: check httpOnly cookie
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired. Please refresh your session.');
    }
    throw new ApiError(401, 'Invalid access token.');
  }

  const user = await User.findById(decoded.sub).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(401, 'User no longer exists.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account has been deactivated. Contact your administrator.');
  }

  if (user.isLocked) {
    throw new ApiError(423, 'Account is temporarily locked due to too many failed attempts.');
  }

  req.user = user;
  next();
});

/**
 * Authorize: check if user has required role(s)
 */
const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      );
    }

    next();
  });

/**
 * Optional auth: attach user if token present, else continue
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).select('-password -refreshToken');
      if (user?.isActive) {
        req.user = user;
      }
    }
  } catch (_) {
    // Silent fail for optional auth
  }
  next();
});

module.exports = { authenticate, authorize, optionalAuth };
