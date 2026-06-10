const express = require('express');
const router  = express.Router();

const {
  createAssignment, listAssignments, getAssignmentById,
  updateAssignment, deleteAssignment,
  submitAssignment, gradeSubmission,
} = require('../../controllers/assignments/assignment.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const {
  createAssignmentSchema, updateAssignmentSchema,
  submitAssignmentSchema, gradeSubmissionSchema,
} = require('../../validators/assignment.validator');

router.use(authenticate);

// Admin & teacher create assignments
router.post('/',
  authorize('admin', 'teacher'),
  validate(createAssignmentSchema),
  createAssignment
);

// All can list (filtered by class/subject in query)
router.get('/', authorize('admin', 'teacher', 'student'), listAssignments);
router.get('/:id', authorize('admin', 'teacher', 'student'), getAssignmentById);

// Admin & teacher update / delete
router.patch('/:id',
  authorize('admin', 'teacher'),
  validate(updateAssignmentSchema),
  updateAssignment
);
router.delete('/:id', authorize('admin', 'teacher'), deleteAssignment);

// Student submits
router.post('/:id/submit',
  authorize('student'),
  validate(submitAssignmentSchema),
  submitAssignment
);

// Teacher grades a specific submission
router.patch('/:id/submissions/:submissionId/grade',
  authorize('admin', 'teacher'),
  validate(gradeSubmissionSchema),
  gradeSubmission
);

module.exports = router;
