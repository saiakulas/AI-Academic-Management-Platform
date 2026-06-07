const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');

router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduFlow API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
