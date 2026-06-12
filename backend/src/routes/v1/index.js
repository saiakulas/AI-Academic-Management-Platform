const express = require('express');
const router  = express.Router();

// ── Route modules ─────────────────────────────────────────────────
const authRoutes       = require('./auth.routes');
const userRoutes       = require('./user.routes');
const profileRoutes    = require('./profile.routes');
const studentRoutes    = require('./student.routes');
const teacherRoutes    = require('./teacher.routes');
const classRoutes      = require('./class.routes');
const subjectRoutes    = require('./subject.routes');
const attendanceRoutes = require('./attendance.routes');
const assignmentRoutes = require('./assignment.routes');
const noticeRoutes     = require('./notice.routes');
const resultRoutes     = require('./result.routes');
const materialRoutes   = require('./material.routes');
const dashboardRoutes  = require('./dashboard.routes');

// ── Health check ──────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.status(200).json({
    success:     true,
    message:     'EduFlow API is running',
    version:     '3.0.0',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV,
    modules: [
      'auth', 'users', 'profile', 'students', 'teachers',
      'classes', 'subjects', 'attendance', 'assignments',
      'notices', 'results', 'materials', 'dashboard',
    ],
  });
});

// ── Routes ────────────────────────────────────────────────────────
router.use('/auth',       authRoutes);
router.use('/users',      userRoutes);
router.use('/profile',    profileRoutes);
router.use('/students',   studentRoutes);
router.use('/teachers',   teacherRoutes);
router.use('/classes',    classRoutes);
router.use('/subjects',   subjectRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/assignments',assignmentRoutes);
router.use('/notices',    noticeRoutes);
router.use('/results',    resultRoutes);
router.use('/materials',  materialRoutes);
router.use('/dashboard',  dashboardRoutes);

module.exports = router;
