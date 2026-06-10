const express = require('express');
const router  = express.Router();

const {
  listUsers, getUserById, adminCreateUser,
  updateUser, deactivateUser, updateMyProfile,
} = require('../../controllers/users/user.controller');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const {
  adminCreateUserSchema, updateUserSchema, updateProfileSchema,
} = require('../../validators/user.validator');

// All routes require authentication
router.use(authenticate);

// ── My profile (any authenticated user) ──────────────────────────
router.patch('/me', validate(updateProfileSchema), updateMyProfile);

// ── Admin-only user management ────────────────────────────────────
router.get('/',    authorize('admin'), listUsers);
router.post('/',   authorize('admin'), validate(adminCreateUserSchema), adminCreateUser);
router.get('/:id', authorize('admin'), getUserById);
router.patch('/:id', authorize('admin'), validate(updateUserSchema), updateUser);
router.delete('/:id', authorize('admin'), deactivateUser);

module.exports = router;
