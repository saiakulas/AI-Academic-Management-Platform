const Joi = require('joi');

const ROLES      = ['admin', 'teacher', 'student', 'parent'];
const CATEGORIES = ['general', 'academic', 'event', 'exam', 'holiday', 'circular'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

const createNoticeSchema = Joi.object({
  title:          Joi.string().trim().max(200).required(),
  content:        Joi.string().trim().required(),
  targetAudience: Joi.array().items(Joi.string().valid(...ROLES)).min(1).default(ROLES),
  priority:       Joi.string().valid(...PRIORITIES).default('normal'),
  category:       Joi.string().valid(...CATEGORIES).default('general'),
  expiresAt:      Joi.date().greater('now').allow(null).optional(),
  isPublished:    Joi.boolean().default(true),
  isPinned:       Joi.boolean().default(false),
});

const updateNoticeSchema = Joi.object({
  title:          Joi.string().trim().max(200),
  content:        Joi.string().trim(),
  targetAudience: Joi.array().items(Joi.string().valid(...ROLES)).min(1),
  priority:       Joi.string().valid(...PRIORITIES),
  category:       Joi.string().valid(...CATEGORIES),
  expiresAt:      Joi.date().allow(null),
  isPublished:    Joi.boolean(),
  isPinned:       Joi.boolean(),
}).min(1);

const pinNoticeSchema = Joi.object({
  isPinned: Joi.boolean().required(),
});

module.exports = { createNoticeSchema, updateNoticeSchema, pinNoticeSchema };
