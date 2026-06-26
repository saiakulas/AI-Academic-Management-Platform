const Timetable = require('../models/Timetable');
const Class     = require('../models/Class');
const Teacher   = require('../models/Teacher');
const ApiError  = require('../utils/ApiError');

const POPULATE_PERIODS = [
  { path: 'periods.subject', select: 'name code' },
  { path: 'periods.teacher', populate: { path: 'user', select: 'firstName lastName' } },
];

class TimetableService {
  /**
   * Create a new timetable for a class (deactivates any existing active one).
   */
  async createTimetable({ classId, academicYear, effectiveFrom, effectiveTo, periods, createdBy }) {
    const cls = await Class.findById(classId);
    if (!cls) throw new ApiError(404, 'Class not found');

    // Deactivate any existing active timetable for this class/year
    await Timetable.updateMany(
      { class: classId, academicYear, isActive: true },
      { isActive: false, effectiveTo: effectiveFrom }
    );

    const timetable = await Timetable.create({
      class: classId,
      academicYear,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      periods,
      createdBy,
    });

    return this._populated(timetable._id);
  }

  /**
   * Get the active timetable for a class.
   */
  async getByClass(classId) {
    const cls = await Class.findById(classId);
    if (!cls) throw new ApiError(404, 'Class not found');

    const timetable = await Timetable.findOne({ class: classId, isActive: true })
      .populate('class', 'name section grade academicYear')
      .populate(POPULATE_PERIODS);

    return timetable;
  }

  /**
   * Get all timetables for a class (history).
   */
  async getAllByClass(classId) {
    const cls = await Class.findById(classId);
    if (!cls) throw new ApiError(404, 'Class not found');

    return Timetable.find({ class: classId })
      .sort({ createdAt: -1 })
      .populate('class', 'name section grade academicYear')
      .populate(POPULATE_PERIODS);
  }

  /**
   * Get the active timetable for a teacher (all classes they teach).
   */
  async getByTeacher(teacherId) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) throw new ApiError(404, 'Teacher not found');

    // Find all active timetables that contain periods assigned to this teacher
    const timetables = await Timetable.find({
      isActive: true,
      'periods.teacher': teacherId,
    })
      .populate('class', 'name section grade academicYear')
      .populate(POPULATE_PERIODS);

    // Filter periods to only show the teacher's own periods
    return timetables.map((tt) => {
      const obj = tt.toObject();
      obj.periods = obj.periods.filter(
        (p) => p.teacher && p.teacher._id.toString() === teacherId.toString()
      );
      return obj;
    });
  }

  /**
   * Update an existing timetable's periods or metadata.
   */
  async updateTimetable(id, updates) {
    const timetable = await Timetable.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!timetable) throw new ApiError(404, 'Timetable not found');
    return this._populated(timetable._id);
  }

  /**
   * Delete a timetable.
   */
  async deleteTimetable(id) {
    const timetable = await Timetable.findByIdAndDelete(id);
    if (!timetable) throw new ApiError(404, 'Timetable not found');
    return timetable;
  }

  // ─── Internal helpers ─────────────────────────────────────────

  async _populated(id) {
    return Timetable.findById(id)
      .populate('class', 'name section grade academicYear')
      .populate('createdBy', 'firstName lastName')
      .populate(POPULATE_PERIODS);
  }
}

module.exports = new TimetableService();
