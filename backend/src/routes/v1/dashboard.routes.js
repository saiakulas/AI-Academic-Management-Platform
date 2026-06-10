const express = require('express');
const router  = express.Router();

const { getDashboard } = require('../../controllers/dashboard/dashboard.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

// Role-aware — returns different data per role
router.get('/', getDashboard);

module.exports = router;
