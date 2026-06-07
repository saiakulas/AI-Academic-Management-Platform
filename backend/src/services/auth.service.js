const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/tokenUtils');
const ApiError = require('../utils/ApiError');
const config = require('../config');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const user = await User.create(userData);
    const tokens = generateTokenPair(user);

    // Store hashed refresh token
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return { user: user.toSafeObject(), tokens };
  }

  /**
   * Login user with email and password
   */
  async login(email, password) {
    const user = await User.findOne({ email }).select('+password +refreshToken +loginAttempts +lockUntil');

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check account lock
    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      throw new ApiError(
        423,
        `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`
      );
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account has been deactivated. Contact your administrator.');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      const attemptsLeft = Math.max(0, 5 - (user.loginAttempts + 1));
      throw new ApiError(
        401,
        attemptsLeft > 0
          ? `Invalid email or password. ${attemptsLeft} attempts remaining.`
          : 'Account locked due to too many failed attempts.'
      );
    }

    // Reset login attempts on success
    await user.resetLoginAttempts();

    const tokens = generateTokenPair(user);

    // Store refresh token
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return { user: user.toSafeObject(), tokens };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token. Please log in again.');
    }

    const user = await User.findById(decoded.sub).select('+refreshToken');

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account deactivated');
    }

    // Validate stored refresh token (rotation security)
    if (user.refreshToken !== incomingRefreshToken) {
      // Possible token reuse attack — invalidate all sessions
      await User.findByIdAndUpdate(user._id, { $unset: { refreshToken: 1 } });
      throw new ApiError(401, 'Token reuse detected. All sessions invalidated. Please log in again.');
    }

    const tokens = generateTokenPair(user);

    // Rotate refresh token
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return { user: user.toSafeObject(), tokens };
  }

  /**
   * Logout: invalidate refresh token
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  /**
   * Get current user profile
   */
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toSafeObject();
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    // Invalidate all existing sessions
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

    return { message: 'Password changed successfully. Please log in again.' };
  }
}

module.exports = new AuthService();
