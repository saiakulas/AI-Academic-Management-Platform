const User        = require('../models/User');
const Student     = require('../models/Student');
const Teacher     = require('../models/Teacher');
const Class       = require('../models/Class');
const Subject     = require('../models/Subject');
const Attendance  = require('../models/Attendance');
const Assignment  = require('../models/Assignment');
const Notice      = require('../models/Notice');

class DashboardService {
  /**
   * Admin dashboard — institution-wide overview
   */
  async getAdminStats() {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalParents,
      recentStudents,
      recentNotices,
      pendingAssignments,
      todayAttendance,
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Teacher.countDocuments({ isActive: true }),
      Class.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'parent', isActive: true }),

      // Last 5 students enrolled
      Student.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'firstName lastName email avatar')
        .populate('currentClass', 'name section grade'),

      // Last 5 notices
      Notice.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('author', 'firstName lastName role'),

      // Open assignments (published, not yet due)
      Assignment.countDocuments({ status: 'published', dueDate: { $gte: new Date() } }),

      // Today's attendance
      this._getTodayAttendanceRate(),
    ]);

    // Weekly attendance trend (last 7 days)
    const attendanceTrend = await this._getWeeklyAttendanceTrend();

    return {
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalParents,
        pendingAssignments,
        todayAttendanceRate: todayAttendance,
      },
      recentStudents,
      recentNotices,
      attendanceTrend,
    };
  }

  /**
   * Teacher dashboard — classes, assignments, attendance overview
   */
  async getTeacherStats(userId) {
    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) {
      return { stats: {}, classes: [], recentAssignments: [], notices: [] };
    }

    const [
      myClasses,
      myAssignments,
      recentNotices,
      pendingGrading,
    ] = await Promise.all([
      Class.find({ _id: { $in: teacher.classes }, isActive: true })
        .select('name section grade academicYear'),

      Assignment.find({ assignedBy: userId, status: { $ne: 'draft' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('class', 'name section grade')
        .populate('subject', 'name code'),

      Notice.find({
        isPublished: true,
        targetAudience: 'teacher',
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      })
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(5)
        .populate('author', 'firstName lastName'),

      // Assignments with ungraded submissions
      Assignment.countDocuments({
        assignedBy: userId,
        'submissions.status': 'submitted',
      }),
    ]);

    // Student count across teacher's classes
    const studentCount = await Student.countDocuments({
      currentClass: { $in: teacher.classes },
      isActive: true,
    });

    return {
      stats: {
        totalClasses:    myClasses.length,
        totalStudents:   studentCount,
        totalAssignments: myAssignments.length,
        pendingGrading,
      },
      classes:           myClasses,
      recentAssignments: myAssignments,
      notices:           recentNotices,
    };
  }

  /**
   * Student dashboard — own attendance, assignments, notices
   */
  async getStudentStats(userId) {
    const student = await Student.findOne({ user: userId })
      .populate('currentClass', 'name section grade academicYear');

    if (!student) {
      return { stats: {}, assignments: [], notices: [] };
    }

    const classId = student.currentClass?._id;

    const [
      assignments,
      notices,
      attendanceSummary,
      mySubmissions,
    ] = await Promise.all([
      // Upcoming assignments for student's class
      Assignment.find({
        class:  classId,
        status: 'published',
        dueDate: { $gte: new Date() },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate('subject', 'name code')
        .populate('assignedBy', 'firstName lastName'),

      // Notices visible to students
      Notice.find({
        isPublished:    true,
        targetAudience: 'student',
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      })
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(5)
        .populate('author', 'firstName lastName'),

      // Attendance this month
      this._getStudentMonthlyAttendance(student._id, classId),

      // How many assignments submitted this month
      Assignment.countDocuments({
        class:              classId,
        'submissions.student': student._id,
      }),
    ]);

    return {
      stats: {
        attendancePercentage: attendanceSummary.percentage,
        totalPresent:         attendanceSummary.present,
        totalAbsent:          attendanceSummary.absent,
        submittedAssignments: mySubmissions,
        upcomingAssignments:  assignments.length,
      },
      currentClass: student.currentClass,
      assignments,
      notices,
    };
  }

  /**
   * Parent dashboard — children's attendance + notices
   */
  async getParentStats(userId) {
    const children = await Student.find({ parents: userId, isActive: true })
      .populate('user', 'firstName lastName email avatar')
      .populate('currentClass', 'name section grade');

    const childStats = await Promise.all(
      children.map(async (child) => {
        const summary = await this._getStudentMonthlyAttendance(
          child._id,
          child.currentClass?._id
        );
        return {
          student:    child,
          attendance: summary,
        };
      })
    );

    const notices = await Notice.find({
      isPublished:    true,
      targetAudience: 'parent',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5)
      .populate('author', 'firstName lastName');

    return {
      stats:     { totalChildren: children.length },
      childStats,
      notices,
    };
  }

  // ── Private helpers ────────────────────────────────────────────

  async _getTodayAttendanceRate() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
    let total = 0, present = 0;
    records.forEach((a) => {
      a.records.forEach((r) => {
        total++;
        if (r.status === 'present' || r.status === 'late') present++;
      });
    });
    return total ? +((present / total) * 100).toFixed(2) : 0;
  }

  async _getWeeklyAttendanceTrend() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);

      const records = await Attendance.find({ date: { $gte: day, $lt: next } });
      let total = 0, present = 0;
      records.forEach((a) => {
        a.records.forEach((r) => {
          total++;
          if (r.status === 'present' || r.status === 'late') present++;
        });
      });

      days.push({
        date:    day.toISOString().split('T')[0],
        day:     day.toLocaleDateString('en-US', { weekday: 'short' }),
        present,
        absent:  total - present,
        rate:    total ? +((present / total) * 100).toFixed(2) : 0,
      });
    }
    return days;
  }

  async _getStudentMonthlyAttendance(studentId, classId) {
    if (!classId) return { present: 0, absent: 0, late: 0, total: 0, percentage: 0 };

    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = await Attendance.find({
      class:             classId,
      date:              { $gte: start, $lte: now },
      'records.student': studentId,
    });

    const summary = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
    records.forEach((a) => {
      const r = a.records.find((x) => x.student.toString() === studentId.toString());
      if (r) {
        summary.total++;
        summary[r.status]++;
      }
    });

    summary.percentage = summary.total
      ? +((summary.present / summary.total) * 100).toFixed(2)
      : 0;

    return summary;
  }
}

module.exports = new DashboardService();
