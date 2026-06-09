const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    student:  { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true,
    },
    remarks: { type: String, trim: true },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    class:    { type: mongoose.Schema.Types.ObjectId, ref: 'Class',   required: true },
    subject:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    records: [attendanceRecordSchema],
    session: {
      type: String,
      enum: ['morning', 'afternoon', 'full-day'],
      default: 'full-day',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for same class+date+session+subject
attendanceSchema.index(
  { class: 1, date: 1, session: 1, subject: 1 },
  { unique: true }
);
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ class: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
