const express = require('express');
const userRoutes = require('../modules/user/user.routes');
const resumeRoutes = require('../modules/resume/resume.routes');
const skillsRoutes = require('../modules/skills/skills.routes');
const jobRoutes = require('../modules/job/job.routes');
const careerRoutes = require('../modules/career/career.routes');
const chatbotRoutes = require('../modules/chatbot/chatbot.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
const learningRoutes = require('../modules/learning/learning.routes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'delphiminds-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/user', userRoutes);
router.use('/resume', resumeRoutes);
router.use('/skills', skillsRoutes);
router.use('/jobs', jobRoutes);
router.use('/', careerRoutes);
router.use('/', chatbotRoutes);
router.use('/', analyticsRoutes);
router.use('/learning', learningRoutes);

module.exports = router;
