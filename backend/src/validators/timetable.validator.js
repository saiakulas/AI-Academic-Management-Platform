const Joi = require('joi');

const timeRegex = /^\d{2}:\d{2}$/;

const periodSchema = Joi.object({
  day: Joi.string()
    .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
    .required(),
  periodNumber: Joi.number().integer().min(1).required(),
  startTime: Joi.string().pattern(timeRegex).required()
    .messages({ 'string.pattern.base': 'startTime must be HH:MM' }),
  endTime: Joi.string().pattern(timeRegex).required()
    .messages({ 'string.pattern.base': 'endTime must be HH:MM' }),
  subject: Joi.string().hex().length(24).allow(null, '').optional(),
  teacher: Joi.string().hex().length(24).allow(null, '').optional(),
  room:    Joi.string().trim().allow('').optional(),
  type:    Joi.string().valid('lecture', 'lab', 'break', 'free').default('lecture'),
  notes:   Joi.string().trim().allow('').optional(),
});

const createTimetableSchema = Joi.object({
  classId:       Joi.string().hex().length(24).required(),
  academicYear:  Joi.string().trim().required(),
  effectiveFrom: Joi.date().required(),
  effectiveTo:   Joi.date().allow(null).optional(),
  periods:       Joi.array().items(periodSchema).min(1).required()
    .messages({ 'array.min': 'At least one period is required' }),
});

const updateTimetableSchema = Joi.object({
  effectiveFrom: Joi.date().optional(),
  effectiveTo:   Joi.date().allow(null).optional(),
  periods:       Joi.array().items(periodSchema).min(1).optional(),
  isActive:      Joi.boolean().optional(),
});

module.exports = { createTimetableSchema, updateTimetableSchema };
