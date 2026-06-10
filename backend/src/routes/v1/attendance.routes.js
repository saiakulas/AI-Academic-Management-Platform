const express = require('express');
const router  = express.Router();

const {
  markAttendance, updateAttendance,
  getClassAttendance, getStudentAttendanceSummary, getTodaySummary,
} = require('../../controllers/attendance/attendance.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const { markAttendanceSchema, updateAttendanceSchema } = require('../../validators/attendance.validator');

router.use(authenticate);

// Admin-only dashboard summary
router.get('/today-summary', authorize('admin'), getTodaySummary);

// Admin & teacher mark / update attendance
router.post('/', authorize('admin', 'teacher'), validate(markAttendanceSchema), markAttendance);
router.patch('/:id', authorize('admin', 'teacher'), validate(updateAttendanceSchema), updateAttendance);

// Class attendance history — admin & teacher
router.get('/class/:classId', authorize('admin', 'teacher'), getClassAttendance);

// Student attendance summary — admin, teacher, student, parent
router.get('/student/:studentId/summary',
  authorize('admin', 'teacher', 'student', 'parent'),
  getStudentAttendanceSummary
);

module.exports = router;
