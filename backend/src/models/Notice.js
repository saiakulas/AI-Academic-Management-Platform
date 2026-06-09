const mongoose = require('mongoose');
const { ROLES } = require('../config/roles');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Who this notice is visible to
    targetAudience: {
      type: [String],
      enum: Object.values(ROLES),
      default: Object.values(ROLES), // all roles by default
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    category: {
      type: String,
      enum: ['general', 'academic', 'event', 'exam', 'holiday', 'circular'],
      default: 'general',
    },
    attachments: [{ type: String }],
    expiresAt:   { type: Date, default: null },
    isPublished: { type: Boolean, default: true },
    isPinned:    { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

noticeSchema.index({ isPublished: 1, createdAt: -1 });
noticeSchema.index({ targetAudience: 1 });
noticeSchema.index({ isPinned: -1, createdAt: -1 });

const Notice = mongoose.model('Notice', noticeSchema);
module.exports = Notice;
