const express = require('express');
const router  = express.Router();

const {
  createSubject, listSubjects, getSubjectById,
  updateSubject, deleteSubject,
} = require('../../controllers/subjects/subject.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const { createSubjectSchema, updateSubjectSchema } = require('../../validators/subject.validator');

router.use(authenticate);

// Admin manages subjects
router.post('/', authorize('admin'), validate(createSubjectSchema), createSubject);
router.patch('/:id', authorize('admin'), validate(updateSubjectSchema), updateSubject);
router.delete('/:id', authorize('admin'), deleteSubject);

// All authenticated users can view subjects
router.get('/', authorize('admin', 'teacher', 'student'), listSubjects);
router.get('/:id', authorize('admin', 'teacher', 'student'), getSubjectById);

module.exports = router;
