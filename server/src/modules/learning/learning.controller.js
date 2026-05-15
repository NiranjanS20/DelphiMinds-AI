const learningService = require('./learning.service');
const { asyncHandler } = require('../../utils/response');
const { AppError } = require('../../middleware/error.middleware');
const { query } = require('../../config/db');
const userService = require('../user/user.service');

/**
 * Get Diagnostic Report
 * POST /api/learning/report
 *
 * Fetches the user's latest parsed resume from DB and generates a
 * real AI-powered diagnostic report based on actual extracted data.
 */
const getDiagnosticReport = asyncHandler(async (req, res) => {
  const user = await userService.ensureUserFromFirebase(req.user);

  // Fetch latest parsed resume from DB
  const resumeResult = await query(
    `SELECT id, parsed_data, status
     FROM resumes
     WHERE user_id = $1
     ORDER BY COALESCE(parsed_at, created_at) DESC
     LIMIT 1`,
    [user.id]
  );

  if (resumeResult.rowCount === 0) {
    throw new AppError(
      'No resume found. Please upload and analyze your resume first.',
      404,
      'NOT_FOUND'
    );
  }

  const resume = resumeResult.rows[0];
  const parsedData = resume.parsed_data || {};

  // Extract actual skills from resume
  const rawSkills = Array.isArray(parsedData.skills) ? parsedData.skills : [];
  const skillNames = rawSkills.map((s) => {
    if (typeof s === 'string') return s;
    if (s && typeof s === 'object') return s.name || '';
    return '';
  }).filter(Boolean);

  // Calculate a real score based on resume content richness
  const hasSkills = skillNames.length > 0;
  const hasExperience = Boolean(String(parsedData.experience || '').trim());
  const hasEducation = Boolean(String(parsedData.education || '').trim());
  const hasSummary = Boolean(String(parsedData.summary || '').trim());
  const hasRawText = Boolean(String(parsedData.rawText || '').trim());

  // Score components based on actual content
  const skillsScore = Math.min(100, skillNames.length * 8); // up to 100 for 12+ skills
  const experienceScore = hasExperience ? 80 : 0;
  const educationScore = hasEducation ? 75 : 0;
  const summaryScore = hasSummary ? 70 : 0;
  const contentScore = hasRawText ? 60 : 0;

  // Weight: skills 40%, experience 30%, education 15%, summary 10%, content 5%
  const compositeScore = Math.round(
    (skillsScore * 0.4) +
    (experienceScore * 0.3) +
    (educationScore * 0.15) +
    (summaryScore * 0.1) +
    (contentScore * 0.05)
  );

  const scoreData = {
    score: Math.max(0, Math.min(100, compositeScore)),
    level: compositeScore >= 70 ? 'advanced' : compositeScore >= 40 ? 'intermediate' : 'beginner',
    reasons: [
      hasSkills ? `${skillNames.length} skills extracted from your resume` : 'No skills detected',
      hasExperience ? 'Work experience section found' : 'No experience section detected',
      hasEducation ? 'Education section found' : 'No education section detected',
    ],
  };

  // Derive missing skills by comparing against common market skills
  const commonSkills = ['System Design', 'Cloud Architecture', 'CI/CD', 'Docker', 'Kubernetes', 'TypeScript', 'GraphQL', 'Testing'];
  const userSkillsLower = skillNames.map((s) => s.toLowerCase());
  const missingSkills = commonSkills.filter((s) => !userSkillsLower.includes(s.toLowerCase())).slice(0, 5);

  const targetRole = req.body?.targetRole || 'Software Engineer';

  const userData = {
    score: scoreData.score,
    targetRole,
    skills: skillNames,
    missingSkills,
    experience: parsedData.experience || '',
    education: parsedData.education || '',
    summary: parsedData.summary || '',
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

  // If missingSkills not provided, try to derive from user's resume
  let skillGaps = Array.isArray(missingSkills) ? missingSkills : [];

  if (skillGaps.length === 0 && req.user) {
    try {
      const user = await userService.ensureUserFromFirebase(req.user);
      const resumeResult = await query(
        `SELECT parsed_data FROM resumes WHERE user_id = $1 ORDER BY COALESCE(parsed_at, created_at) DESC LIMIT 1`,
        [user.id]
      );
      if (resumeResult.rowCount > 0) {
        const pd = resumeResult.rows[0].parsed_data || {};
        const userSkills = (Array.isArray(pd.skills) ? pd.skills : [])
          .map((s) => (typeof s === 'string' ? s : s?.name || ''))
          .filter(Boolean)
          .map((s) => s.toLowerCase());

        // Common skills for the role that user might be missing
        const roleSkillMap = {
          'full stack': ['System Design', 'Docker', 'CI/CD', 'TypeScript', 'GraphQL'],
          'frontend': ['TypeScript', 'Testing', 'Performance Optimization', 'Accessibility'],
          'backend': ['System Design', 'Docker', 'PostgreSQL', 'Redis', 'Microservices'],
          'data': ['Machine Learning', 'Statistics', 'Spark', 'Airflow', 'dbt'],
          'ml': ['Deep Learning', 'MLOps', 'Kubernetes', 'Feature Engineering'],
          'devops': ['Kubernetes', 'Terraform', 'Monitoring', 'Security'],
        };

        const roleLower = role.toLowerCase();
        const matchedKey = Object.keys(roleSkillMap).find((k) => roleLower.includes(k));
        if (matchedKey) {
          skillGaps = roleSkillMap[matchedKey].filter((s) => !userSkills.includes(s.toLowerCase()));
        }
      }
    } catch (_err) {
      // Non-fatal — proceed without skill gaps
    }
  }

  const pathContent = await learningService.generateLearningPath(
    req.user?.id || 'guest',
    role,
    timeCommitment,
    level || 'beginner',
    skillGaps
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
