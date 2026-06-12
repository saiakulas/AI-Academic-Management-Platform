const Result  = require('../models/Result');
const Student = require('../models/Student');
const Class   = require('../models/Class');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

class ResultService {
  /**
   * Create / publish a result for a student
   */
  async createResult(data, publishedBy) {
    const student = await Student.findById(data.student);
    if (!student) throw new ApiError(404, 'Student not found');

    const cls = await Class.findById(data.class);
    if (!cls) throw new ApiError(404, 'Class not found');

    // Check for duplicate
    const existing = await Result.findOne({
      student:      data.student,
      examType:     data.examType,
      academicYear: data.academicYear,
    });
    if (existing) {
      throw new ApiError(409, `Result for this student (${data.examType} / ${data.academicYear}) already exists`);
    }

    // Auto-compute letter grades
    const grades = (data.grades || []).map((g) => ({
      ...g,
      grade: g.grade || Result.computeGrade((g.marksObtained / g.totalMarks) * 100),
    }));

    const result = await Result.create({ ...data, grades, publishedBy });
    return this._populate(result._id);
  }

  /**
   * List results — filterable by class, student, academicYear, examType
   */
  async listResults({ page, limit, classId, studentId, academicYear, examType, isPublished }) {
    const filter = {};
    if (classId)      filter.class        = classId;
    if (studentId)    filter.student      = studentId;
    if (academicYear) filter.academicYear = academicYear;
    if (examType)     filter.examType     = examType;
    if (isPublished !== undefined) filter.isPublished = isPublished !== 'false';

    return paginate(Result, filter, {
      page, limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'student', populate: { path: 'user', select: 'firstName lastName email' } },
        { path: 'class',   select: 'name section grade academicYear' },
        { path: 'grades.subject', select: 'name code' },
        { path: 'publishedBy', select: 'firstName lastName role' },
      ],
    });
  }

  /**
   * Get single result by ID
   */
  async getResultById(id) {
    return this._populate(id);
  }

  /**
   * Get results for a specific student (all exams)
   */
  async getStudentResults(studentId, { academicYear, page, limit }) {
    const filter = { student: studentId };
    if (academicYear) filter.academicYear = academicYear;

    return paginate(Result, filter, {
      page, limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'class',   select: 'name section grade academicYear' },
        { path: 'grades.subject', select: 'name code' },
      ],
    });
  }

  /**
   * Update result
   */
  async updateResult(id, updates, requestingRole) {
    const result = await Result.findById(id);
    if (!result) throw new ApiError(404, 'Result not found');

    // Recompute grades if provided
    if (updates.grades) {
      updates.grades = updates.grades.map((g) => ({
        ...g,
        grade: g.grade || Result.computeGrade((g.marksObtained / g.totalMarks) * 100),
      }));
    }

    const allowed = ['grades', 'examName', 'isPublished', 'remarks'];
    allowed.forEach((k) => { if (updates[k] !== undefined) result[k] = updates[k]; });
    await result.save();
    return this._populate(id);
  }

  /**
   * Publish / unpublish result
   */
  async togglePublish(id, isPublished) {
    const result = await Result.findByIdAndUpdate(id, { isPublished }, { new: true });
    if (!result) throw new ApiError(404, 'Result not found');
    return result;
  }

  /**
   * Delete result
   */
  async deleteResult(id) {
    const result = await Result.findByIdAndDelete(id);
    if (!result) throw new ApiError(404, 'Result not found');
    return { message: 'Result deleted successfully' };
  }

  /**
   * Performance analytics for a class
   */
  async getClassPerformance(classId, academicYear) {
    const results = await Result.find({ class: classId, academicYear, isPublished: true })
      .populate('student', 'rollNumber')
      .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('grades.subject', 'name code');

    if (results.length === 0) return { results: [], stats: null };

    const stats = {
      total:   results.length,
      highest: 0,
      lowest:  100,
      average: 0,
      passing: 0,
    };

    const withPct = results.map((r) => {
      const pct = r.percentage;
      if (pct > stats.highest) stats.highest = pct;
      if (pct < stats.lowest)  stats.lowest  = pct;
      if (pct >= 40) stats.passing++;
      return { ...r.toObject(), percentage: pct };
    });

    stats.average = +(withPct.reduce((s, r) => s + r.percentage, 0) / withPct.length).toFixed(2);

    return { results: withPct, stats };
  }

  async _populate(id) {
    const r = await Result.findById(id)
      .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } })
      .populate('class',   'name section grade academicYear')
      .populate('grades.subject', 'name code')
      .populate('grades.teacher', 'firstName lastName')
      .populate('publishedBy', 'firstName lastName role');
    if (!r) throw new ApiError(404, 'Result not found');
    return r;
  }
}

module.exports = new ResultService();
