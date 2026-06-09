const Joi = require('joi');

const attendanceRecordSchema = Joi.object({
  student: Joi.string().hex().length(24).required(),
  status:  Joi.string().valid('present', 'absent', 'late', 'excused').required(),
  remarks: Joi.string().trim().allow('').optional(),
});

const markAttendanceSchema = Joi.object({
  classId:   Joi.string().hex().length(24).required(),
  subjectId: Joi.string().hex().length(24).allow(null).optional(),
  date:      Joi.date().max('now').required().messages({
    'date.max': 'Cannot mark attendance for a future date',
  }),
  session: Joi.string().valid('morning', 'afternoon', 'full-day').default('full-day'),
  records: Joi.array().items(attendanceRecordSchema).min(1).required().messages({
    'array.min': 'At least one student record is required',
  }),
});

const updateAttendanceSchema = Joi.object({
  records: Joi.array().items(attendanceRecordSchema).min(1).required(),
});

module.exports = { markAttendanceSchema, updateAttendanceSchema };
