const Joi = require('joi');

const createClassSchema = Joi.object({
  name:         Joi.string().trim().required(),
  section:      Joi.string().trim().uppercase().max(5).required(),
  grade:        Joi.number().integer().min(1).max(12).required(),
  academicYear: Joi.string().trim().pattern(/^\d{4}-\d{2,4}$/).required().messages({
    'string.pattern.base': 'Academic year must be in format YYYY-YY or YYYY-YYYY (e.g. 2024-25)',
  }),
  classTeacher: Joi.string().hex().length(24).allow(null).optional(),
  capacity:     Joi.number().integer().min(1).max(100).optional(),
  room:         Joi.string().trim().optional(),
});

const updateClassSchema = Joi.object({
  name:         Joi.string().trim(),
  section:      Joi.string().trim().uppercase().max(5),
  capacity:     Joi.number().integer().min(1).max(100),
  room:         Joi.string().trim().allow(''),
  classTeacher: Joi.string().hex().length(24).allow(null),
  isActive:     Joi.boolean(),
}).min(1);

const assignSubjectTeacherSchema = Joi.object({
  subjectId: Joi.string().hex().length(24).required(),
  teacherId: Joi.string().hex().length(24).required(),
});

module.exports = { createClassSchema, updateClassSchema, assignSubjectTeacherSchema };
