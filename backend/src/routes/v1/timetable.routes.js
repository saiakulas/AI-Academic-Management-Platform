const express = require('express');
const router  = express.Router();

const {
  createTimetable,
  getTimetableByClass,
  getAllTimetablesByClass,
  getTimetableByTeacher,
  updateTimetable,
  deleteTimetable,
} = require('../../controllers/timetable/timetable.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const { createTimetableSchema, updateTimetableSchema } = require('../../validators/timetable.validator');

router.use(authenticate);

// Admin creates a new timetable
router.post('/',
  authorize('admin'),
  validate(createTimetableSchema),
  createTimetable
);

// Active timetable for a class — all roles that can see classes
router.get('/class/:classId',
  authorize('admin', 'teacher', 'student', 'parent'),
  getTimetableByClass
);

// Full history for a class — admin & teacher
router.get('/class/:classId/history',
  authorize('admin', 'teacher'),
  getAllTimetablesByClass
);

// Teacher's personal timetable (all classes they appear in)
router.get('/teacher/:teacherId',
  authorize('admin', 'teacher'),
  getTimetableByTeacher
);

// Admin updates / edits a timetable
router.patch('/:id',
  authorize('admin'),
  validate(updateTimetableSchema),
  updateTimetable
);

// Admin deletes a timetable
router.delete('/:id',
  authorize('admin'),
  deleteTimetable
);

module.exports = router;
