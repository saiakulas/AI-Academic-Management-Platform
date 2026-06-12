const express = require('express');
const router  = express.Router();

const { authenticate }  = require('../../middleware/auth.middleware');
const validate          = require('../../middleware/validate');
const asyncHandler      = require('../../utils/asyncHandler');
const ApiResponse       = require('../../utils/ApiResponse');
const userService       = require('../../services/user.service');
const authService       = require('../../services/auth.service');
const { changePasswordSchema, updateProfileSchema } = require('../../validators/auth.validator');

router.use(authenticate);

// GET /api/v1/profile  — full current user profile
router.get('/', asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile retrieved'));
}));

// PATCH /api/v1/profile — update own profile fields
router.patch('/', validate(updateProfileSchema), asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully'));
}));

// PATCH /api/v1/profile/change-password
router.patch('/change-password', validate(changePasswordSchema), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
  res.status(200).json(new ApiResponse(200, result, result.message));
}));

module.exports = router;
