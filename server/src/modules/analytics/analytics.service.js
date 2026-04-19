const { query } = require('../../config/db');
const userService = require('../user/user.service');
const skillsModel = require('../skills/skills.model');

const getProgress = async (authUser) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  const userSkills = await skillsModel.getUserSkills(user.id);

  const totalSkills = userSkills.length;
  const completedSkills = userSkills.filter((skill) => skill.level >= 8).length;
  const averageLevel =
    totalSkills === 0
      ? 0
      : Number(
          (
            userSkills.reduce((sum, skill) => sum + Number(skill.level || 0), 0) /
            totalSkills
          ).toFixed(2)
        );

  const activityResult = await query(
    `
      SELECT id, activity_type, metadata, created_at
      FROM user_activity
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `,
    [user.id]
  );

  return {
    totalSkills,
    completedSkills,
    completionRate: totalSkills ? Math.round((completedSkills / totalSkills) * 100) : 0,
    averageLevel,
    recentActivity: activityResult.rows.map((row) => ({
      id: row.id,
      type: row.activity_type,
      metadata: row.metadata,
      createdAt: row.created_at,
    })),
  };
};

const getDashboardSummary = async (authUser) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  const userSkills = await skillsModel.getUserSkills(user.id);

  const resumeCountResult = await query(
    'SELECT COUNT(*)::int AS count FROM resumes WHERE user_id = $1',
    [user.id]
  );

  const latestResumeResult = await query(
    `
      SELECT id, parsed_data, status, parsed_at, created_at
      FROM resumes
      WHERE user_id = $1
      ORDER BY COALESCE(parsed_at, created_at) DESC
      LIMIT 1
    `,
    [user.id]
  );

  const learningProgressResult = await query(
    `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COALESCE(AVG(current_score), 0)::numeric(10,2) AS avg_score
      FROM user_progress
      WHERE user_id = $1
    `,
    [user.id]
  );

  const interviewsResult = await query(
    `
      SELECT
        COUNT(*)::int AS total,
        COALESCE(AVG(fit_score), 0)::numeric(10,2) AS avg_fit,
        COALESCE(MAX(fit_score), 0)::numeric(10,2) AS best_fit
      FROM interviews
      WHERE user_id = $1
    `,
    [user.id]
  );

  const recentActivityResult = await query(
    `
      SELECT id, activity_type, metadata, created_at
      FROM user_activity
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `,
    [user.id]
  );

  const latestResume = latestResumeResult.rows[0] || null;
  const resumeSkills = Array.isArray(latestResume?.parsed_data?.skills)
    ? latestResume.parsed_data.skills
    : [];

  const normalizedSkills = userSkills.map((skill) => ({
    name: skill.name,
    proficiency: Math.round((Number(skill.level || 0) / 10) * 100),
    category: skill.category,
    source: skill.source,
  }));

  const progressRow = learningProgressResult.rows[0] || {
    total: 0,
    completed: 0,
    avg_score: 0,
  };

  const interviews = interviewsResult.rows[0] || {
    total: 0,
    avg_fit: 0,
    best_fit: 0,
  };

  const completion =
    Number(progressRow.total || 0) > 0
      ? Math.round((Number(progressRow.completed || 0) / Number(progressRow.total || 1)) * 100)
      : 0;

  return {
    resumeCount: Number(resumeCountResult.rows[0]?.count || 0),
    skillCount: normalizedSkills.length,
    careerMatches: Number(interviews.total || 0),
    completion,
    resumeScore: Math.round(Number(progressRow.avg_score || 0)),
    latestResume: latestResume
      ? {
          id: latestResume.id,
          status: latestResume.status,
          parsedAt: latestResume.parsed_at,
          createdAt: latestResume.created_at,
          extractedSkills: resumeSkills.length,
        }
      : null,
    skills: normalizedSkills,
    progress: {
      coursesCompleted: Number(progressRow.completed || 0),
      totalCourses: Number(progressRow.total || 0),
      streak: 0,
      hoursLearned: 0,
    },
    jobInsights: {
      analysesCount: Number(interviews.total || 0),
      avgFitScore: Number(interviews.avg_fit || 0),
      bestFitScore: Number(interviews.best_fit || 0),
    },
    recentActivity: recentActivityResult.rows.map((row) => ({
      id: row.id,
      type: row.activity_type,
      metadata: row.metadata,
      createdAt: row.created_at,
    })),
  };
};

const trackActivity = async (authUser, payload = {}) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  const activityType = String(payload.type || '').trim() || 'general_event';
  const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};

  const result = await query(
    `
      INSERT INTO user_activity (user_id, activity_type, metadata)
      VALUES ($1, $2, $3)
      RETURNING id, activity_type, metadata, created_at
    `,
    [user.id, activityType, metadata]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    type: row.activity_type,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
};

module.exports = {
  getProgress,
  trackActivity,
  getDashboardSummary,
};
