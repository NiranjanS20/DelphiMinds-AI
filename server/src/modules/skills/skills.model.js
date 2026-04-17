const { query } = require('../../config/db');

const getExecutor = (client) => client || { query };

const mapSkill = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapUserSkill = (row) => ({
  skillId: row.skill_id,
  name: row.name,
  category: row.category,
  level: row.proficiency,
  source: row.source,
  confidence: row.confidence,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getAllSkills = async (client) => {
  const result = await getExecutor(client).query(
    'SELECT id, name, category, created_at, updated_at FROM skills ORDER BY name ASC'
  );
  return result.rows.map(mapSkill);
};

const findSkillById = async (id, client) => {
  const result = await getExecutor(client).query(
    'SELECT id, name, category, created_at, updated_at FROM skills WHERE id = $1 LIMIT 1',
    [id]
  );
  return result.rows[0] ? mapSkill(result.rows[0]) : null;
};

const findSkillByName = async (name, client) => {
  const result = await getExecutor(client).query(
    'SELECT id, name, category, created_at, updated_at FROM skills WHERE name = $1 LIMIT 1',
    [name]
  );
  return result.rows[0] ? mapSkill(result.rows[0]) : null;
};

const createSkill = async ({ name, category }, client) => {
  const result = await getExecutor(client).query(
    `
      INSERT INTO skills (name, category)
      VALUES ($1, $2)
      ON CONFLICT (name)
      DO UPDATE SET
        category = COALESCE(EXCLUDED.category, skills.category),
        updated_at = NOW()
      RETURNING id, name, category, created_at, updated_at
    `,
    [name, category || 'general']
  );
  return mapSkill(result.rows[0]);
};

const upsertUserSkill = async ({ userId, skillId, level, source = 'manual', confidence = 1 }, client) => {
  const result = await getExecutor(client).query(
    `
      INSERT INTO user_skills (user_id, skill_id, proficiency, source, confidence)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, skill_id)
      DO UPDATE SET
        proficiency = EXCLUDED.proficiency,
        source = EXCLUDED.source,
        confidence = EXCLUDED.confidence,
        updated_at = NOW()
      RETURNING user_id, skill_id, proficiency, source, confidence, created_at, updated_at
    `,
    [userId, skillId, level, source, confidence]
  );

  const row = result.rows[0];
  return {
    userId: row.user_id,
    skillId: row.skill_id,
    level: row.proficiency,
    source: row.source,
    confidence: row.confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const getUserSkills = async (userId, client) => {
  const result = await getExecutor(client).query(
    `
      SELECT
        us.skill_id,
        us.proficiency,
        us.source,
        us.confidence,
        us.created_at,
        us.updated_at,
        s.name,
        s.category
      FROM user_skills us
      JOIN skills s ON s.id = us.skill_id
      WHERE us.user_id = $1
      ORDER BY us.proficiency DESC, s.name ASC
    `,
    [userId]
  );

  return result.rows.map(mapUserSkill);
};

module.exports = {
  getAllSkills,
  findSkillById,
  findSkillByName,
  createSkill,
  upsertUserSkill,
  getUserSkills,
};
