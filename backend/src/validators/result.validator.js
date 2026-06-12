const Joi = require('joi');

const gradeSchema = Joi.object({
  subject:       Joi.string().hex().length(24).required(),
  marksObtained: Joi.number().min(0).required(),
  totalMarks:    Joi.number().min(1).required(),
  grade:         Joi.string().trim().optional(),
  remarks:       Joi.string().trim().allow('').optional(),
  teacher:       Joi.string().hex().length(24).optional(),
});

const createResultSchema = Joi.object({
  student:      Joi.string().hex().length(24).required(),
  class:        Joi.string().hex().length(24).required(),
  academicYear: Joi.string().trim().required(),
  examType:     Joi.string().valid('unit-test','midterm','final','quarterly','half-yearly','annual').required(),
  examName:     Joi.string().trim().optional(),
  grades:       Joi.array().items(gradeSchema).min(1).required(),
  isPublished:  Joi.boolean().default(false),
  remarks:      Joi.string().trim().allow('').optional(),
});

const updateResultSchema = Joi.object({
  grades:      Joi.array().items(gradeSchema).min(1),
  examName:    Joi.string().trim(),
  isPublished: Joi.boolean(),
  remarks:     Joi.string().trim().allow(''),
}).min(1);

const togglePublishSchema = Joi.object({
  isPublished: Joi.boolean().required(),
});

module.exports = { createResultSchema, updateResultSchema, togglePublishSchema };
