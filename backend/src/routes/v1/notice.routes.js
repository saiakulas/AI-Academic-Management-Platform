const express = require('express');
const router  = express.Router();

const {
  createNotice, listNotices, getNoticeById,
  updateNotice, deleteNotice, pinNotice,
} = require('../../controllers/notices/notice.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const { createNoticeSchema, updateNoticeSchema, pinNoticeSchema } = require('../../validators/notice.validator');

router.use(authenticate);

// Admin & teacher create notices
router.post('/',
  authorize('admin', 'teacher'),
  validate(createNoticeSchema),
  createNotice
);

// All roles can read notices (filtered by their role in the service)
router.get('/',   authorize('admin', 'teacher', 'student', 'parent'), listNotices);
router.get('/:id', authorize('admin', 'teacher', 'student', 'parent'), getNoticeById);

// Admin & teacher update / delete their own notices
router.patch('/:id',
  authorize('admin', 'teacher'),
  validate(updateNoticeSchema),
  updateNotice
);
router.delete('/:id', authorize('admin', 'teacher'), deleteNotice);

// Only admin can pin / unpin notices
router.patch('/:id/pin',
  authorize('admin'),
  validate(pinNoticeSchema),
  pinNotice
);

module.exports = router;
