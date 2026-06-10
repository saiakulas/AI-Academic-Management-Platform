const express = require('express');
const router  = express.Router();

const {
  createTeacher, listTeachers, getTeacherById,
  updateTeacher, deleteTeacher,
} = require('../../controllers/teachers/teacher.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const { createTeacherSchema, updateTeacherSchema } = require('../../validators/teacher.validator');

router.use(authenticate);

// Admin creates teacher
router.post('/', authorize('admin'), validate(createTeacherSchema), createTeacher);

// Admin can list all teachers; teachers can list (to see colleagues)
router.get('/', authorize('admin', 'teacher'), listTeachers);
router.get('/:id', authorize('admin', 'teacher'), getTeacherById);

// Admin updates teacher profile
router.patch('/:id', authorize('admin'), validate(updateTeacherSchema), updateTeacher);

// Admin deactivates teacher
router.delete('/:id', authorize('admin'), deleteTeacher);

module.exports = router;
