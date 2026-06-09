const User    = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ApiError  = require('../utils/ApiError');
const paginate  = require('../utils/paginate');
const { generateTokenPair } = require('../utils/tokenUtils');
const { ROLES } = require('../config/roles');

class UserService {
  /**
   * Admin: create any user (including admin/parent).
   * Optionally bootstraps a Student or Teacher profile.
   */
  async adminCreateUser(userData) {
    const exists = await User.findOne({ email: userData.email });
    if (exists) throw new ApiError(409, 'An account with this email already exists');

    const user = await User.create(userData);
    const tokens = generateTokenPair(user);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return { user: user.toSafeObject(), tokens };
  }

  /**
   * List all users with pagination + filtering
   */
  async listUsers({ page, limit, role, search, isActive }) {
    const filter = {};
    if (role)     filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }
    return paginate(User, filter, { page, limit, sort: { createdAt: -1 } });
  }

  /**
   * Get a single user by ID
   */
  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    return user.toSafeObject();
  }

  /**
   * Update user (admin only for role changes)
   */
  async updateUser(id, updates, requestingUser) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found');

    // Only admin can change roles
    if (updates.role && requestingUser.role !== ROLES.ADMIN) {
      throw new ApiError(403, 'Only administrators can change user roles');
    }

    // Prevent admin from demoting themselves
    if (updates.role && id === requestingUser._id.toString()) {
      throw new ApiError(400, 'Administrators cannot change their own role');
    }

    const allowed = ['firstName', 'lastName', 'phone', 'avatar', 'isActive', 'role'];
    allowed.forEach((key) => {
      if (updates[key] !== undefined) user[key] = updates[key];
    });

    await user.save();
    return user.toSafeObject();
  }

  /**
   * Deactivate a user (soft-delete)
   */
  async deactivateUser(id, requestingUserId) {
    if (id === requestingUserId.toString()) {
      throw new ApiError(400, 'You cannot deactivate your own account');
    }
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false, $unset: { refreshToken: 1 } },
      { new: true }
    );
    if (!user) throw new ApiError(404, 'User not found');
    return user.toSafeObject();
  }

  /**
   * Admin: update a user's profile
   */
  async updateProfile(userId, updates) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    const allowed = ['firstName', 'lastName', 'phone', 'avatar'];
    allowed.forEach((k) => { if (updates[k] !== undefined) user[k] = updates[k]; });
    await user.save();
    return user.toSafeObject();
  }
}

module.exports = new UserService();
