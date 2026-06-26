const mongoose = require('mongoose');

/**
 * A single period/slot in the weekly timetable.
 */
const periodSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    periodNumber: { type: Number, required: true, min: 1 },
    startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ }, // "08:00"
    endTime:   { type: String, required: true, match: /^\d{2}:\d{2}$/ }, // "08:45"
    subject:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    teacher:   { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    room:      { type: String, trim: true, default: '' },
    type: {
      type: String,
      enum: ['lecture', 'lab', 'break', 'free'],
      default: 'lecture',
    },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const timetableSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
    effectiveTo: {
      type: Date,
      default: null,
    },
    periods: [periodSchema],
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Only one active timetable per class + academicYear at a time
timetableSchema.index({ class: 1, academicYear: 1, isActive: 1 });
timetableSchema.index({ 'periods.teacher': 1, academicYear: 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);
module.exports = Timetable;
