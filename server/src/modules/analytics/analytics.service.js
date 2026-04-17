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
};
