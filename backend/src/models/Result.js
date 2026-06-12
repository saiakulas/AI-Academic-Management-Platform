const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    subject:    { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    totalMarks:    { type: Number, required: true, min: 1 },
    grade:         { type: String, trim: true },   // A+, A, B, etc.
    remarks:       { type: String, trim: true },
    teacher:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Student',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Class',
      required: true,
    },
    academicYear: { type: String, required: true, trim: true },
    examType: {
      type: String,
      enum: ['unit-test', 'midterm', 'final', 'quarterly', 'half-yearly', 'annual'],
      required: true,
    },
    examName: { type: String, trim: true },
    grades:   [gradeSchema],
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
    remarks:     { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique: one result per student per exam per academic year
resultSchema.index(
  { student: 1, examType: 1, academicYear: 1 },
  { unique: true }
);
resultSchema.index({ class: 1, academicYear: 1 });
resultSchema.index({ isPublished: 1 });

// Virtual: percentage
resultSchema.virtual('percentage').get(function () {
  if (!this.grades || this.grades.length === 0) return 0;
  const total   = this.grades.reduce((s, g) => s + g.totalMarks, 0);
  const obtained = this.grades.reduce((s, g) => s + g.marksObtained, 0);
  return total ? +((obtained / total) * 100).toFixed(2) : 0;
});

// Virtual: total marks obtained
resultSchema.virtual('totalObtained').get(function () {
  return this.grades?.reduce((s, g) => s + g.marksObtained, 0) ?? 0;
});

// Virtual: total possible marks
resultSchema.virtual('totalPossible').get(function () {
  return this.grades?.reduce((s, g) => s + g.totalMarks, 0) ?? 0;
});

// Static: compute letter grade from percentage
resultSchema.statics.computeGrade = function (pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
};

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
