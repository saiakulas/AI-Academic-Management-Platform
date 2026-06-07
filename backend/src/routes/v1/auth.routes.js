const express = require('express');
const router = express.Router();

const { register, login, refreshToken, logout, getMe, changePassword } = require('../../controllers/auth/auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require('../../validators/auth.validator');

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', authLimiter, refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.patch('/change-password', authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;
