const express = require('express');
const router  = express.Router();

const {
  createStudent, listStudents, getStudentById,
  updateStudent, deleteStudent, assignParents,
} = require('../../controllers/students/student.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const {
  createStudentSchema, updateStudentSchema, assignParentsSchema,
} = require('../../validators/student.validator');

router.use(authenticate);

// Admin creates student (with user account)
router.post('/', authorize('admin'), validate(createStudentSchema), createStudent);

// Admin & teacher can list/view students
router.get('/', authorize('admin', 'teacher'), listStudents);
router.get('/:id', authorize('admin', 'teacher'), getStudentById);

// Admin & teacher can update student info
router.patch('/:id', authorize('admin', 'teacher'), validate(updateStudentSchema), updateStudent);

// Admin can deactivate a student
router.delete('/:id', authorize('admin'), deleteStudent);

// Admin links parents to a student
router.post('/:id/parents', authorize('admin'), validate(assignParentsSchema), assignParents);

module.exports = router;
