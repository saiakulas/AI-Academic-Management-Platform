const User     = require('../models/User');
const Student  = require('../models/Student');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');
const { generateTokenPair } = require('../utils/tokenUtils');

class StudentService {
  /**
   * Admin creates a student: creates User account + Student profile atomically
   */
  async createStudent(data) {
    const { firstName, lastName, email, password, phone, rollNumber,
            admissionNumber, dateOfBirth, gender, bloodGroup, address,
            currentClass, admissionDate } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(409, 'An account with this email already exists');

    const existingRoll = await Student.findOne({ rollNumber });
    if (existingRoll) throw new ApiError(409, 'Roll number already in use');

    // Create user account
    const user = await User.create({
      firstName, lastName, email,
      password: password || 'Student@1234', // default, must change
      phone,
      role: 'student',
      isEmailVerified: true,
    });

    // Create student profile
    const student = await Student.create({
      user:            user._id,
      rollNumber,
      admissionNumber: admissionNumber || rollNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      currentClass,
      admissionDate:   admissionDate || new Date(),
    });

    const tokens = generateTokenPair(user);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return await Student.findById(student._id)
      .populate('user', '-password -refreshToken -loginAttempts -lockUntil -__v')
      .populate('currentClass', 'name section grade academicYear');
  }

  /**
   * List students with pagination, search, and class filter
   */
  async listStudents({ page, limit, search, classId, isActive }) {
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive !== 'false';
    if (classId) filter.currentClass = classId;

    // If search, first find matching users
    if (search) {
      const users = await User.find({
        role: 'student',
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName:  { $regex: search, $options: 'i' } },
          { email:     { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const userIds = users.map((u) => u._id);
      filter.$or = [
        { user: { $in: userIds } },
        { rollNumber:      { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
      ];
    }

    return paginate(Student, filter, {
      page, limit,
      populate: [
        { path: 'user', select: 'firstName lastName email phone avatar isActive' },
        { path: 'currentClass', select: 'name section grade academicYear' },
      ],
    });
  }

  /**
   * Get single student by ID (Student _id or User _id)
   */
  async getStudentById(id) {
    let student = await Student.findById(id)
      .populate('user', '-password -refreshToken -loginAttempts -lockUntil -__v')
      .populate('currentClass', 'name section grade academicYear')
      .populate('parents', 'firstName lastName email phone');

    if (!student) {
      // Try finding by user._id
      student = await Student.findOne({ user: id })
        .populate('user', '-password -refreshToken -loginAttempts -lockUntil -__v')
        .populate('currentClass', 'name section grade academicYear')
        .populate('parents', 'firstName lastName email phone');
    }

    if (!student) throw new ApiError(404, 'Student not found');
    return student;
  }

  /**
   * Update student profile
   */
  async updateStudent(id, updates) {
    const student = await Student.findById(id);
    if (!student) throw new ApiError(404, 'Student not found');

    const studentFields = ['rollNumber', 'dateOfBirth', 'gender', 'bloodGroup',
                           'address', 'currentClass', 'admissionDate', 'isActive'];
    const userFields    = ['firstName', 'lastName', 'phone', 'avatar'];

    // Update student document
    studentFields.forEach((k) => {
      if (updates[k] !== undefined) student[k] = updates[k];
    });
    await student.save();

    // Update linked user document
    const userUpdates = {};
    userFields.forEach((k) => { if (updates[k] !== undefined) userUpdates[k] = updates[k]; });
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(student.user, userUpdates);
    }

    return this.getStudentById(id);
  }

  /**
   * Soft-delete a student
   */
  async deleteStudent(id) {
    const student = await Student.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!student) throw new ApiError(404, 'Student not found');
    await User.findByIdAndUpdate(student.user, { isActive: false });
    return { message: 'Student deactivated successfully' };
  }

  /**
   * Assign parent(s) to student
   */
  async assignParents(studentId, parentIds) {
    const student = await Student.findById(studentId);
    if (!student) throw new ApiError(404, 'Student not found');

    // Validate all parents exist and have parent role
    const parents = await User.find({ _id: { $in: parentIds }, role: 'parent' });
    if (parents.length !== parentIds.length) {
      throw new ApiError(400, 'One or more parent IDs are invalid or not parent-role users');
    }

    student.parents = [...new Set([...student.parents.map(String), ...parentIds])];
    await student.save();
    return this.getStudentById(studentId);
  }
}

module.exports = new StudentService();
