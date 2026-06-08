const Joi = require('joi');
const { PUBLIC_REGISTER_ROLES } = require('../config/roles');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Public self-registration.
 * Only 'teacher' and 'student' roles are allowed.
 * 'admin' and 'parent' must be created by an admin.
 */
const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().pattern(passwordRegex).required().messages({
    'string.pattern.base':
      'Password must contain at least one uppercase letter, lowercase letter, number, and special character',
    'any.required': 'Password is required',
  }),
  role: Joi.string()
    .valid(...PUBLIC_REGISTER_ROLES)
    .default('student')
    .messages({
      'any.only': `Self-registration is only available for: ${PUBLIC_REGISTER_ROLES.join(', ')}. Contact your administrator for other roles.`,
    }),
  phone: Joi.string().trim().optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().pattern(passwordRegex).required().messages({
    'string.pattern.base':
      'New password must contain at least one uppercase letter, lowercase letter, number, and special character',
    'any.required': 'New password is required',
  }),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your new password',
  }),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  phone: Joi.string().trim().allow(''),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
};
