const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    submittedAt: { type: Date, default: Date.now },
    content:     { type: String, trim: true },
    fileUrl:     { type: String },
    grade:       { type: Number, min: 0 },
    feedback:    { type: String, trim: true },
    gradedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gradedAt:    { type: Date },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned', 'late'],
      default: 'submitted',
    },
  },
  { _id: true, timestamps: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, trim: true },
    class:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class',   required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    totalMarks:   { type: Number, default: 100 },
    instructions: { type: String, trim: true },
    attachments:  [{ type: String }],
    submissions:  [submissionSchema],
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

assignmentSchema.index({ class: 1, subject: 1 });
assignmentSchema.index({ assignedBy: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });

// Virtual: submission count
assignmentSchema.virtual('submissionCount').get(function () {
  return this.submissions?.length || 0;
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
