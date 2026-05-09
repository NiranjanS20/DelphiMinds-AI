const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const careerController = require('./career.controller');

const router = express.Router();

// Routes are mounted under /career in routes/index.js
router.get('/recommendations', authMiddleware, careerController.getRecommendations);
router.get('/skill-gap', authMiddleware, careerController.getSkillGap);

module.exports = router;
