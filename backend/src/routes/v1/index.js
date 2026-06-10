const express = require('express');
const router  = express.Router();

const authRoutes       = require('./auth.routes');
const userRoutes       = require('./user.routes');
const studentRoutes    = require('./student.routes');
const teacherRoutes    = require('./teacher.routes');
const classRoutes      = require('./class.routes');
const subjectRoutes    = require('./subject.routes');
const attendanceRoutes = require('./attendance.routes');
const assignmentRoutes = require('./assignment.routes');
const noticeRoutes     = require('./notice.routes');
const dashboardRoutes  = require('./dashboard.routes');

// ── Public ────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.status(200).json({
    success:     true,
    message:     'EduFlow API is running',
    version:     '2.0.0',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── Auth ──────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Resources ─────────────────────────────────────────────────────
router.use('/users',       userRoutes);
router.use('/students',    studentRoutes);
router.use('/teachers',    teacherRoutes);
router.use('/classes',     classRoutes);
router.use('/subjects',    subjectRoutes);
router.use('/attendance',  attendanceRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/notices',     noticeRoutes);
router.use('/dashboard',   dashboardRoutes);

module.exports = router;
