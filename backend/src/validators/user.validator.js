const Joi = require('joi');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const adminCreateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName:  Joi.string().trim().min(2).max(50).required(),
  email:     Joi.string().email().lowercase().required(),
  password:  Joi.string().pattern(passwordRegex).required().messages({
    'string.pattern.base': 'Password must have uppercase, lowercase, number and special character',
  }),
  role:  Joi.string().valid('admin', 'teacher', 'student', 'parent').required(),
  phone: Joi.string().trim().allow('').optional(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName:  Joi.string().trim().min(2).max(50),
  phone:     Joi.string().trim().allow(''),
  avatar:    Joi.string().uri().allow('', null),
  isActive:  Joi.boolean(),
  role:      Joi.string().valid('admin', 'teacher', 'student', 'parent'),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName:  Joi.string().trim().min(2).max(50),
  phone:     Joi.string().trim().allow(''),
  avatar:    Joi.string().uri().allow('', null),
}).min(1);

module.exports = { adminCreateUserSchema, updateUserSchema, updateProfileSchema };
