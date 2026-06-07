const authService = require('../../services/auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const config = require('../../config');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);

  res
    .cookie('accessToken', tokens.accessToken, ACCESS_COOKIE_OPTIONS)
    .cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS)
    .status(201)
    .json(
      new ApiResponse(201, { user, accessToken: tokens.accessToken }, 'Account created successfully')
    );
});

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password);

  res
    .cookie('accessToken', tokens.accessToken, ACCESS_COOKIE_OPTIONS)
    .cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS)
    .status(200)
    .json(
      new ApiResponse(200, { user, accessToken: tokens.accessToken }, 'Login successful')
    );
});

/**
 * @route   POST /api/v1/auth/refresh
 * @access  Public (requires valid refresh token)
 */
const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const { user, tokens } = await authService.refreshToken(incomingToken);

  res
    .cookie('accessToken', tokens.accessToken, ACCESS_COOKIE_OPTIONS)
    .cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS)
    .status(200)
    .json(
      new ApiResponse(200, { user, accessToken: tokens.accessToken }, 'Token refreshed')
    );
});

/**
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  res
    .clearCookie('accessToken', COOKIE_OPTIONS)
    .clearCookie('refreshToken', COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

/**
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile retrieved'));
});

/**
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user._id, currentPassword, newPassword);

  res
    .clearCookie('accessToken', COOKIE_OPTIONS)
    .clearCookie('refreshToken', COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, result, result.message));
});

module.exports = { register, login, refreshToken, logout, getMe, changePassword };
