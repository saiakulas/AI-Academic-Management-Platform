const express = require('express');
const router  = express.Router();

const {
  createResult, listResults, getResultById, getStudentResults,
  updateResult, togglePublish, deleteResult, getClassPerformance,
} = require('../../controllers/results/result.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const { createResultSchema, updateResultSchema, togglePublishSchema } = require('../../validators/result.validator');

router.use(authenticate);

// Admin + teacher create & manage
router.post('/', authorize('admin','teacher'), validate(createResultSchema), createResult);
router.patch('/:id', authorize('admin','teacher'), validate(updateResultSchema), updateResult);
router.patch('/:id/publish', authorize('admin','teacher'), validate(togglePublishSchema), togglePublish);
router.delete('/:id', authorize('admin'), deleteResult);

// Class performance analytics
router.get('/class/:classId/performance', authorize('admin','teacher'), getClassPerformance);

// Student results — own or admin/teacher
router.get('/student/:studentId', authorize('admin','teacher','student','parent'), getStudentResults);

// General list + detail
router.get('/', authorize('admin','teacher'), listResults);
router.get('/:id', authorize('admin','teacher','student','parent'), getResultById);

module.exports = router;
