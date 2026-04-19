const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const analyticsController = require('./analytics.controller');

const router = express.Router();

router.get('/analytics/dashboard', authMiddleware, analyticsController.getDashboardSummary);
router.get('/analytics/progress', authMiddleware, analyticsController.getProgress);
router.post('/analytics/activity', authMiddleware, analyticsController.trackActivity);

module.exports = router;
