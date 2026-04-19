const learningService = require('./learning.service');
const { asyncHandler } = require('../../utils/response');
const { AppError } = require('../../middleware/error.middleware');

/**
 * Get Diagnostic Report
 * GET /api/learning/report
 */
const getDiagnosticReport = asyncHandler(async (req, res) => {
  // Assuming body has data for now, or fetch from user entity. 
  // Let's take it from query or body
  const parsedData = req.body.parsedData || {
    skillsMatch: 60,
    projects: 80,
    experience: 50,
    keywords: 70
  };

  const scoreData = learningService.calculateResumeScore(parsedData);

  const userData = {
    score: scoreData.score,
    targetRole: req.body.targetRole || 'Software Engineer',
    skills: req.body.skills || ['JavaScript', 'React'],
    missingSkills: req.body.missingSkills || ['Node.js', 'System Design']
  };

  const report = await learningService.generateDiagnosticReport(userData);

  res.status(200).json({
    success: true,
    data: {
      score: scoreData,
      report,
    },
  });
});

/**
 * Generate Learning Path
 * POST /api/learning/path
 */
const generatePath = asyncHandler(async (req, res) => {
  const { role, timeCommitment, level, missingSkills } = req.body;

  if (!role || !timeCommitment) {
    throw new AppError('Please provide role and timeCommitment', 400);
  }

  const pathContent = await learningService.generateLearningPath(
    req.user?.id || 'guest',
    role,
    timeCommitment,
    level || 'beginner',
    missingSkills || []
  );

  res.status(200).json({
    success: true,
    data: pathContent,
  });
});

module.exports = {
  getDiagnosticReport,
  generatePath,
};
