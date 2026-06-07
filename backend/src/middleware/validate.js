const ApiError = require('../utils/ApiError');

/**
 * Middleware factory for Joi schema validation.
 * Validates req.body against the provided schema.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return next(new ApiError(422, 'Validation failed', errors));
  }

  req.body = value; // Replace with sanitized/converted values
  next();
};

module.exports = validate;
