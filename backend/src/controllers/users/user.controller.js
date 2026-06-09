const userService   = require('../../services/user.service');
const ApiResponse   = require('../../utils/ApiResponse');
const asyncHandler  = require('../../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Users retrieved'));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, { user }, 'User retrieved'));
});

const adminCreateUser = asyncHandler(async (req, res) => {
  const result = await userService.adminCreateUser(req.body);
  res.status(201).json(new ApiResponse(201, result, 'User created successfully'));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user);
  res.status(200).json(new ApiResponse(200, { user }, 'User updated'));
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, { user }, 'User deactivated'));
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated'));
});

module.exports = { listUsers, getUserById, adminCreateUser, updateUser, deactivateUser, updateMyProfile };
