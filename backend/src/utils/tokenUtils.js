const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate JWT access token (short-lived)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'eduflow-api',
    audience: 'eduflow-client',
  });
};

/**
 * Generate JWT refresh token (long-lived)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'eduflow-api',
    audience: 'eduflow-client',
  });
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'eduflow-api',
    audience: 'eduflow-client',
  });
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'eduflow-api',
    audience: 'eduflow-client',
  });
};

/**
 * Generate both tokens from user document
 */
const generateTokenPair = (user) => {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
