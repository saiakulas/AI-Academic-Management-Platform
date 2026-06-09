const Joi = require('joi');

const createSubjectSchema = Joi.object({
  name:        Joi.string().trim().required(),
  code:        Joi.string().trim().uppercase().min(2).max(10).required(),
  description: Joi.string().trim().allow('').optional(),
  department:  Joi.string().trim().optional(),
  grades:      Joi.array().items(Joi.number().integer().min(1).max(12)).optional(),
  isElective:  Joi.boolean().optional(),
});

const updateSubjectSchema = Joi.object({
  name:        Joi.string().trim(),
  code:        Joi.string().trim().uppercase().min(2).max(10),
  description: Joi.string().trim().allow(''),
  department:  Joi.string().trim(),
  grades:      Joi.array().items(Joi.number().integer().min(1).max(12)),
  isElective:  Joi.boolean(),
  isActive:    Joi.boolean(),
}).min(1);

module.exports = { createSubjectSchema, updateSubjectSchema };
