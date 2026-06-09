const Class    = require('../models/Class');
const Student  = require('../models/Student');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

class ClassService {
  async createClass(data) {
    const { grade, section, academicYear } = data;
    const exists = await Class.findOne({ grade, section: section.toUpperCase(), academicYear });
    if (exists) {
      throw new ApiError(409, `Class Grade ${grade}-${section.toUpperCase()} already exists for ${academicYear}`);
    }
    const cls = await Class.create(data);
    return Class.findById(cls._id)
      .populate('classTeacher', 'employeeId')
      .populate({ path: 'classTeacher', populate: { path: 'user', select: 'firstName lastName email' } });
  }

  async listClasses({ page, limit, grade, academicYear, isActive }) {
    const filter = {};
    if (grade)        filter.grade = Number(grade);
    if (academicYear) filter.academicYear = academicYear;
    if (isActive !== undefined) filter.isActive = isActive !== 'false';

    return paginate(Class, filter, {
      page, limit,
      sort: { grade: 1, section: 1 },
      populate: [
        { path: 'classTeacher', populate: { path: 'user', select: 'firstName lastName' } },
      ],
    });
  }

  async getClassById(id) {
    const cls = await Class.findById(id)
      .populate({ path: 'classTeacher', populate: { path: 'user', select: 'firstName lastName email' } })
      .populate({ path: 'subjects.subject', select: 'name code' })
      .populate({ path: 'subjects.teacher', populate: { path: 'user', select: 'firstName lastName' } });
    if (!cls) throw new ApiError(404, 'Class not found');

    // Count students in this class
    const studentCount = await Student.countDocuments({ currentClass: id, isActive: true });
    const classObj = cls.toObject();
    classObj.studentCount = studentCount;
    return classObj;
  }

  async updateClass(id, updates) {
    const cls = await Class.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!cls) throw new ApiError(404, 'Class not found');
    return cls;
  }

  async deleteClass(id) {
    const studentCount = await Student.countDocuments({ currentClass: id, isActive: true });
    if (studentCount > 0) {
      throw new ApiError(400, `Cannot delete class with ${studentCount} active student(s). Reassign students first.`);
    }
    const cls = await Class.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!cls) throw new ApiError(404, 'Class not found');
    return { message: 'Class deactivated successfully' };
  }

  async assignSubjectTeacher(classId, subjectId, teacherId) {
    const cls = await Class.findById(classId);
    if (!cls) throw new ApiError(404, 'Class not found');

    const idx = cls.subjects.findIndex((s) => s.subject.toString() === subjectId);
    if (idx > -1) {
      cls.subjects[idx].teacher = teacherId;
    } else {
      cls.subjects.push({ subject: subjectId, teacher: teacherId });
    }
    await cls.save();
    return this.getClassById(classId);
  }

  async getStudentsInClass(classId, { page, limit }) {
    const cls = await Class.findById(classId);
    if (!cls) throw new ApiError(404, 'Class not found');

    return paginate(Student, { currentClass: classId, isActive: true }, {
      page, limit,
      populate: [{ path: 'user', select: 'firstName lastName email phone avatar' }],
    });
  }
}

module.exports = new ClassService();
