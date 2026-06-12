const Joi = require('joi');

const createMaterialSchema = Joi.object({
  title:        Joi.string().trim().max(200).required(),
  description:  Joi.string().trim().allow('').optional(),
  subject:      Joi.string().hex().length(24).required(),
  class:        Joi.string().hex().length(24).allow(null, '').optional(),
  materialType: Joi.string().valid('notes','assignment','reference','question-paper','syllabus','other').default('notes'),
  tags:         Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()  // comma-separated from form-data
  ).optional(),
  isPublished:  Joi.boolean().default(true),
});

const updateMaterialSchema = Joi.object({
  title:        Joi.string().trim().max(200),
  description:  Joi.string().trim().allow(''),
  materialType: Joi.string().valid('notes','assignment','reference','question-paper','syllabus','other'),
  tags:         Joi.array().items(Joi.string().trim()),
  isPublished:  Joi.boolean(),
}).min(1);

module.exports = { createMaterialSchema, updateMaterialSchema };
