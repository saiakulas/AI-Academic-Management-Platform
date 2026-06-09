const Joi = require('joi');

const addressSchema = Joi.object({
  street:  Joi.string().trim().allow(''),
  city:    Joi.string().trim().allow(''),
  state:   Joi.string().trim().allow(''),
  pincode: Joi.string().trim().allow(''),
});

const createStudentSchema = Joi.object({
  // User account fields
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName:  Joi.string().trim().min(2).max(50).required(),
  email:     Joi.string().email().lowercase().required(),
  password:  Joi.string().min(8).optional(),
  phone:     Joi.string().trim().allow('').optional(),

  // Student profile fields
  rollNumber:      Joi.string().trim().required(),
  admissionNumber: Joi.string().trim().optional(),
  dateOfBirth:     Joi.date().max('now').optional(),
  gender:          Joi.string().valid('male', 'female', 'other').optional(),
  bloodGroup:      Joi.string().valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-').optional(),
  address:         addressSchema.optional(),
  currentClass:    Joi.string().hex().length(24).optional(),
  admissionDate:   Joi.date().optional(),
});

const updateStudentSchema = Joi.object({
  firstName:    Joi.string().trim().min(2).max(50),
  lastName:     Joi.string().trim().min(2).max(50),
  phone:        Joi.string().trim().allow(''),
  avatar:       Joi.string().uri().allow('', null),
  dateOfBirth:  Joi.date().max('now'),
  gender:       Joi.string().valid('male', 'female', 'other'),
  bloodGroup:   Joi.string().valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
  address:      addressSchema,
  currentClass: Joi.string().hex().length(24).allow(null),
  isActive:     Joi.boolean(),
}).min(1);

const assignParentsSchema = Joi.object({
  parentIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

module.exports = { createStudentSchema, updateStudentSchema, assignParentsSchema };
