const Joi = require('joi');

const createAssignmentSchema = Joi.object({
  title:        Joi.string().trim().max(200).required(),
  description:  Joi.string().trim().optional(),
  class:        Joi.string().hex().length(24).required(),
  subject:      Joi.string().hex().length(24).required(),
  dueDate:      Joi.date().greater('now').required().messages({
    'date.greater': 'Due date must be in the future',
  }),
  totalMarks:   Joi.number().min(1).max(1000).optional(),
  instructions: Joi.string().trim().optional(),
  status:       Joi.string().valid('draft', 'published').default('published'),
});

const updateAssignmentSchema = Joi.object({
  title:        Joi.string().trim().max(200),
  description:  Joi.string().trim(),
  dueDate:      Joi.date(),
  totalMarks:   Joi.number().min(1).max(1000),
  instructions: Joi.string().trim(),
  status:       Joi.string().valid('draft', 'published', 'closed'),
}).min(1);

const submitAssignmentSchema = Joi.object({
  content: Joi.string().trim().optional(),
  fileUrl: Joi.string().uri().optional(),
}).or('content', 'fileUrl').messages({
  'object.missing': 'Either content or fileUrl is required',
});

const gradeSubmissionSchema = Joi.object({
  grade:    Joi.number().min(0).required(),
  feedback: Joi.string().trim().optional(),
});

module.exports = {
  createAssignmentSchema, updateAssignmentSchema,
  submitAssignmentSchema, gradeSubmissionSchema,
};
