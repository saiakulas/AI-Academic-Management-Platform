const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
    },
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    address: {
      street:  { type: String, trim: true },
      city:    { type: String, trim: true },
      state:   { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    currentClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    admissionDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// rollNumber already indexed by unique:true in the field definition
studentSchema.index({ currentClass: 1 });
studentSchema.index({ isActive: 1 });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
