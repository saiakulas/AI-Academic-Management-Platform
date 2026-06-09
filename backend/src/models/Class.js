const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
    },
    grade: {
      type: Number,
      required: [true, 'Grade is required'],
      min: 1,
      max: 12,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      // e.g. "2024-25"
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    subjects: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
      },
    ],
    capacity: { type: Number, default: 40 },
    room:     { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Class + section + year must be unique together
classSchema.index({ grade: 1, section: 1, academicYear: 1 }, { unique: true });
classSchema.index({ academicYear: 1, isActive: 1 });

// Virtual: display name e.g. "Grade 10 - A"
classSchema.virtual('displayName').get(function () {
  return `Grade ${this.grade} - ${this.section}`;
});

const Class = mongoose.model('Class', classSchema);
module.exports = Class;
