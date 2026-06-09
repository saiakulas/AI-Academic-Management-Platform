const User     = require('../models/User');
const Teacher  = require('../models/Teacher');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const { generateTokenPair } = require('../utils/tokenUtils');

class TeacherService {
  /**
   * Admin creates a teacher: User account + Teacher profile
   */
  async createTeacher(data) {
    const { firstName, lastName, email, password, phone,
            employeeId, department, designation, qualification,
            specialization, joiningDate } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(409, 'An account with this email already exists');

    const existingEmp = await Teacher.findOne({ employeeId });
    if (existingEmp) throw new ApiError(409, 'Employee ID already in use');

    const user = await User.create({
      firstName, lastName, email,
      password: password || 'Teacher@1234',
      phone,
      role: 'teacher',
      isEmailVerified: true,
    });

    const teacher = await Teacher.create({
      user:           user._id,
      employeeId,
      department,
      designation:    designation || 'Teacher',
      qualification,
      specialization: specialization || [],
      joiningDate:    joiningDate || new Date(),
    });

    const tokens = generateTokenPair(user);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return Teacher.findById(teacher._id)
      .populate('user', '-password -refreshToken -loginAttempts -lockUntil -__v')
      .populate('subjects', 'name code')
      .populate('classes',  'name section grade academicYear');
  }

  /**
   * List teachers with pagination and search
   */
  async listTeachers({ page, limit, search, department, isActive }) {
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive !== 'false';
    if (department) filter.department = { $regex: department, $options: 'i' };

    if (search) {
      const users = await User.find({
        role: 'teacher',
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName:  { $regex: search, $options: 'i' } },
          { email:     { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const userIds = users.map((u) => u._id);
      filter.$or = [
        { user:       { $in: userIds } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    return paginate(Teacher, filter, {
      page, limit,
      populate: [
        { path: 'user', select: 'firstName lastName email phone avatar isActive' },
        { path: 'subjects', select: 'name code' },
      ],
    });
  }

  /**
   * Get single teacher
   */
  async getTeacherById(id) {
    let teacher = await Teacher.findById(id)
      .populate('user', '-password -refreshToken -loginAttempts -lockUntil -__v')
      .populate('subjects', 'name code department')
      .populate('classes',  'name section grade academicYear');

    if (!teacher) {
      teacher = await Teacher.findOne({ user: id })
        .populate('user', '-password -refreshToken -loginAttempts -lockUntil -__v')
        .populate('subjects', 'name code department')
        .populate('classes',  'name section grade academicYear');
    }

    if (!teacher) throw new ApiError(404, 'Teacher not found');
    return teacher;
  }

  /**
   * Update teacher
   */
  async updateTeacher(id, updates) {
    const teacher = await Teacher.findById(id);
    if (!teacher) throw new ApiError(404, 'Teacher not found');

    const teacherFields = ['employeeId', 'department', 'designation',
                           'qualification', 'specialization', 'joiningDate', 'isActive'];
    const userFields    = ['firstName', 'lastName', 'phone', 'avatar'];

    teacherFields.forEach((k) => { if (updates[k] !== undefined) teacher[k] = updates[k]; });
    await teacher.save();

    const userUpdates = {};
    userFields.forEach((k) => { if (updates[k] !== undefined) userUpdates[k] = updates[k]; });
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(teacher.user, userUpdates);
    }

    return this.getTeacherById(id);
  }

  /**
   * Soft-delete teacher
   */
  async deleteTeacher(id) {
    const teacher = await Teacher.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!teacher) throw new ApiError(404, 'Teacher not found');
    await User.findByIdAndUpdate(teacher.user, { isActive: false });
    return { message: 'Teacher deactivated successfully' };
  }
}

module.exports = new TeacherService();
