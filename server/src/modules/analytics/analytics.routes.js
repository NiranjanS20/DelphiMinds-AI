const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const analyticsController = require('./analytics.controller');

const router = express.Router();

// Routes are mounted under /analytics in routes/index.js
router.get('/dashboard', authMiddleware, analyticsController.getDashboardSummary);
router.get('/progress', authMiddleware, analyticsController.getProgress);
router.post('/activity', authMiddleware, analyticsController.trackActivity);

module.exports = router;
