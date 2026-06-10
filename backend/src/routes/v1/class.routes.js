const express = require('express');
const router  = express.Router();

const {
  createClass, listClasses, getClassById, updateClass,
  deleteClass, assignSubjectTeacher, getStudentsInClass,
} = require('../../controllers/classes/class.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const {
  createClassSchema, updateClassSchema, assignSubjectTeacherSchema,
} = require('../../validators/class.validator');

router.use(authenticate);

// Admin manages classes
router.post('/', authorize('admin'), validate(createClassSchema), createClass);
router.patch('/:id', authorize('admin'), validate(updateClassSchema), updateClass);
router.delete('/:id', authorize('admin'), deleteClass);

// Assign subject-teacher pair to a class (admin only)
router.post(
  '/:id/subjects',
  authorize('admin'),
  validate(assignSubjectTeacherSchema),
  assignSubjectTeacher
);

// Admin & teacher can view class info and student lists
router.get('/', authorize('admin', 'teacher', 'student'), listClasses);
router.get('/:id', authorize('admin', 'teacher', 'student'), getClassById);
router.get('/:id/students', authorize('admin', 'teacher'), getStudentsInClass);

module.exports = router;
