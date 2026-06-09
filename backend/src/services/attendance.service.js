const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');
const Class      = require('../models/Class');
const ApiError   = require('../utils/ApiError');
const paginate   = require('../utils/paginate');

class AttendanceService {
  /**
   * Mark attendance for a class on a given date
   */
  async markAttendance({ classId, subjectId, date, session, records, markedBy }) {
    const cls = await Class.findById(classId);
    if (!cls) throw new ApiError(404, 'Class not found');

    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // Check for duplicate
    const existing = await Attendance.findOne({
      class:   classId,
      date:    attendanceDate,
      session: session || 'full-day',
      subject: subjectId || null,
    });
    if (existing) {
      throw new ApiError(409, 'Attendance already marked for this class, date and session');
    }

    const attendance = await Attendance.create({
      class:    classId,
      subject:  subjectId || null,
      markedBy,
      date:     attendanceDate,
      session:  session || 'full-day',
      records,
    });

    return Attendance.findById(attendance._id)
      .populate('class',    'name section grade')
      .populate('subject',  'name code')
      .populate('markedBy', 'firstName lastName role')
      .populate('records.student', 'rollNumber')
      .populate({ path: 'records.student', populate: { path: 'user', select: 'firstName lastName' } });
  }

  /**
   * Update existing attendance record
   */
  async updateAttendance(id, records) {
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { records },
      { new: true, runValidators: true }
    )
      .populate('class', 'name section grade')
      .populate('subject', 'name code');
    if (!attendance) throw new ApiError(404, 'Attendance record not found');
    return attendance;
  }

  /**
   * Get attendance for a class over a date range
   */
  async getClassAttendance({ classId, startDate, endDate, page, limit }) {
    const cls = await Class.findById(classId);
    if (!cls) throw new ApiError(404, 'Class not found');

    const filter = { class: classId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }

    return paginate(Attendance, filter, {
      page, limit,
      sort: { date: -1 },
      populate: [
        { path: 'subject',  select: 'name code' },
        { path: 'markedBy', select: 'firstName lastName' },
      ],
    });
  }

  /**
   * Get attendance summary for a specific student
   */
  async getStudentAttendanceSummary(studentId, { startDate, endDate }) {
    const student = await Student.findById(studentId);
    if (!student) throw new ApiError(404, 'Student not found');

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate)   dateFilter.$lte = new Date(endDate);

    const records = await Attendance.find({
      class: student.currentClass,
      ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}),
      'records.student': studentId,
    }).select('date session records.$');

    const summary = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };

    records.forEach((a) => {
      const rec = a.records.find((r) => r.student.toString() === studentId);
      if (rec) {
        summary.total++;
        summary[rec.status]++;
      }
    });

    summary.attendancePercentage = summary.total
      ? +((summary.present / summary.total) * 100).toFixed(2)
      : 0;

    return { student: studentId, ...summary };
  }

  /**
   * Get today's attendance summary across all classes (admin dashboard)
   */
  async getTodaySummary() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await Attendance.find({ date: { $gte: today, $lt: tomorrow } })
      .populate('class', 'name section grade');

    let totalStudents = 0, totalPresent = 0, totalAbsent = 0;
    records.forEach((a) => {
      a.records.forEach((r) => {
        totalStudents++;
        if (r.status === 'present' || r.status === 'late') totalPresent++;
        else totalAbsent++;
      });
    });

    return {
      date: today,
      classesMarked: records.length,
      totalStudents,
      totalPresent,
      totalAbsent,
      attendanceRate: totalStudents
        ? +((totalPresent / totalStudents) * 100).toFixed(2)
        : 0,
    };
  }
}

module.exports = new AttendanceService();
