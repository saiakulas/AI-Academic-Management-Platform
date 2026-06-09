const Joi = require('joi');

const createTeacherSchema = Joi.object({
  firstName:      Joi.string().trim().min(2).max(50).required(),
  lastName:       Joi.string().trim().min(2).max(50).required(),
  email:          Joi.string().email().lowercase().required(),
  password:       Joi.string().min(8).optional(),
  phone:          Joi.string().trim().allow('').optional(),
  employeeId:     Joi.string().trim().required(),
  department:     Joi.string().trim().optional(),
  designation:    Joi.string().trim().optional(),
  qualification:  Joi.string().trim().optional(),
  specialization: Joi.array().items(Joi.string().trim()).optional(),
  joiningDate:    Joi.date().optional(),
});

const updateTeacherSchema = Joi.object({
  firstName:      Joi.string().trim().min(2).max(50),
  lastName:       Joi.string().trim().min(2).max(50),
  phone:          Joi.string().trim().allow(''),
  avatar:         Joi.string().uri().allow('', null),
  department:     Joi.string().trim(),
  designation:    Joi.string().trim(),
  qualification:  Joi.string().trim(),
  specialization: Joi.array().items(Joi.string().trim()),
  isActive:       Joi.boolean(),
}).min(1);

module.exports = { createTeacherSchema, updateTeacherSchema };
