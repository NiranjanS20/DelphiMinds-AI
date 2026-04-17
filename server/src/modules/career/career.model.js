const { query } = require('../../config/db');

const getExecutor = (client) => client || { query };

const mapCareerPath = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    requiredSkills: Array.isArray(row.required_skills) ? row.required_skills : [],
    salaryBand: row.salary_band || {},
    growthOutlook: row.growth_outlook,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapRecommendation = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    resumeId: row.resume_id,
    careerPathId: row.career_path_id,
    batchId: row.batch_id,
    source: row.source,
    recommendations: row.recommendations,
    skillGaps: row.skill_gaps,
    contextPayload: row.context_payload,
    modelVersion: row.model_version,
    generatedAt: row.generated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const listCareerPaths = async (client) => {
  const result = await getExecutor(client).query(
    `
      SELECT
        id,
        slug,
        title,
        description,
        required_skills,
        salary_band,
        growth_outlook,
        created_at,
        updated_at
      FROM career_paths
      ORDER BY title ASC
    `
  );

  return result.rows.map(mapCareerPath);
};

const findCareerPathByTitleOrSlug = async (value, client) => {
  const result = await getExecutor(client).query(
    `
      SELECT
        id,
        slug,
        title,
        description,
        required_skills,
        salary_band,
        growth_outlook,
        created_at,
        updated_at
      FROM career_paths
      WHERE LOWER(title) = LOWER($1) OR LOWER(slug) = LOWER($1)
      LIMIT 1
    `,
    [value]
  );

  return mapCareerPath(result.rows[0]);
};

const storeRecommendationSnapshot = async (
  {
    userId,
    resumeId,
    careerPathId,
    source,
    recommendations,
    skillGaps,
    contextPayload,
    modelVersion,
  },
  client
) => {
  const result = await getExecutor(client).query(
    `
      INSERT INTO recommendations (
        user_id,
        resume_id,
        career_path_id,
        source,
        recommendations,
        skill_gaps,
        context_payload,
        model_version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      userId,
      resumeId || null,
      careerPathId || null,
      source || 'ml',
      recommendations || [],
      skillGaps || [],
      contextPayload || {},
      modelVersion || null,
    ]
  );

  return mapRecommendation(result.rows[0]);
};

const getLatestRecommendationsForUser = async (userId, limit = 1, client) => {
  const result = await getExecutor(client).query(
    `
      SELECT *
      FROM recommendations
      WHERE user_id = $1
      ORDER BY generated_at DESC
      LIMIT $2
    `,
    [userId, limit]
  );

  return result.rows.map(mapRecommendation);
};

module.exports = {
  listCareerPaths,
  findCareerPathByTitleOrSlug,
  storeRecommendationSnapshot,
  getLatestRecommendationsForUser,
};
