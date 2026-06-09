const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    department:  { type: String, trim: true },
    grades: [{ type: Number, min: 1, max: 12 }], // applicable grades
    isElective: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subjectSchema.index({ code: 1 });
subjectSchema.index({ isActive: 1 });

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
