const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const careerController = require('./career.controller');

const router = express.Router();

router.get('/recommendations', authMiddleware, careerController.getRecommendations);
router.get('/skill-gap', authMiddleware, careerController.getSkillGap);
router.get('/career/recommendations', authMiddleware, careerController.getRecommendations);
router.get('/career/skill-gap', authMiddleware, careerController.getSkillGap);

module.exports = router;
