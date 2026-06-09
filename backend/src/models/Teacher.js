const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    department:  { type: String, trim: true },
    designation: { type: String, trim: true, default: 'Teacher' },
    qualification: { type: String, trim: true },
    specialization: [{ type: String, trim: true }],
    joiningDate: { type: Date, default: Date.now },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

teacherSchema.index({ employeeId: 1 });
teacherSchema.index({ isActive: 1 });

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
