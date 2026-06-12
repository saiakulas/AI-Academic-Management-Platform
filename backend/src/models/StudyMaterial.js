const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, trim: true },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Subject',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Class',
      default: null, // null = applicable to all classes for the subject
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },
    fileUrl:  { type: String, required: true },
    fileName: { type: String, trim: true },
    fileSize: { type: Number },           // bytes
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'image', 'video', 'other'],
      default: 'pdf',
    },
    materialType: {
      type: String,
      enum: ['notes', 'assignment', 'reference', 'question-paper', 'syllabus', 'other'],
      default: 'notes',
    },
    tags:       [{ type: String, trim: true, lowercase: true }],
    downloads:  { type: Number, default: 0 },
    isPublished:{ type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

studyMaterialSchema.index({ subject: 1, class: 1 });
studyMaterialSchema.index({ uploadedBy: 1 });
studyMaterialSchema.index({ isPublished: 1 });
studyMaterialSchema.index({ materialType: 1 });

// Virtual: formatted file size
studyMaterialSchema.virtual('fileSizeFormatted').get(function () {
  if (!this.fileSize) return null;
  if (this.fileSize < 1024) return `${this.fileSize} B`;
  if (this.fileSize < 1048576) return `${(this.fileSize / 1024).toFixed(1)} KB`;
  return `${(this.fileSize / 1048576).toFixed(1)} MB`;
});

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
module.exports = StudyMaterial;
