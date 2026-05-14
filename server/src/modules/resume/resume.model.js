const { query } = require('../../config/db');

const getExecutor = (client) => client || { query };

const mapResume = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    fileUrl: row.file_url,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    status: row.status,
    parsedData: row.parsed_data,
    mlMeta: row.ml_meta,
    parsedAt: row.parsed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const saveResume = async (
  { userId, fileUrl, fileName, mimeType, fileSizeBytes, parsedData, mlMeta, status = 'uploaded' },
  client
) => {
  const result = await getExecutor(client).query(
    `
      INSERT INTO resumes (
        user_id,
        file_url,
        file_name,
        mime_type,
        file_size_bytes,
        parsed_data,
        ml_meta,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      userId,
      fileUrl,
      fileName || 'resume',
      mimeType || null,
      fileSizeBytes || null,
      parsedData || {},
      mlMeta || {},
      status,
    ]
  );

  return mapResume(result.rows[0]);
};

const createResume = async (payload, client) => saveResume(payload, client);

const saveParsedData = async (
  {
    resumeId,
    parsedData,
    mlMeta,
    status = 'parsed',
    parsedAt = new Date().toISOString(),
  },
  client
) => {
  const result = await getExecutor(client).query(
    `
      UPDATE resumes
      SET
        parsed_data = COALESCE($2, parsed_data),
        ml_meta = COALESCE($3, ml_meta),
        status = COALESCE($4, status),
        parsed_at = COALESCE($5, parsed_at),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [resumeId, parsedData || {}, mlMeta || {}, status, parsedAt]
  );

  return mapResume(result.rows[0]);
};

const findResumeByIdForUser = async (id, userId, client) => {
  const result = await getExecutor(client).query(
    'SELECT * FROM resumes WHERE id = $1 AND user_id = $2 LIMIT 1',
    [id, userId]
  );

  return mapResume(result.rows[0]);
};

const listResumesByUser = async (userId, { limit = 20, offset = 0 } = {}, client) => {
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20));
  const safeOffset = Math.max(0, Number(offset) || 0);

  const result = await getExecutor(client).query(
    `
      SELECT *, COUNT(*) OVER()::int AS total_count
      FROM resumes
      WHERE user_id = $1
      ORDER BY COALESCE(parsed_at, created_at) DESC, created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [userId, safeLimit, safeOffset]
  );

  return {
    resumes: result.rows.map(mapResume),
    total: Number(result.rows[0]?.total_count || 0),
  };
};

const findLatestResumeByUser = async (userId, client) => {
  const result = await getExecutor(client).query(
    `
      SELECT *
      FROM resumes
      WHERE user_id = $1
      ORDER BY
        CASE WHEN status = 'parsed' THEN 0 ELSE 1 END,
        COALESCE(parsed_at, created_at) DESC,
        created_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return mapResume(result.rows[0]);
};

module.exports = {
  saveResume,
  saveParsedData,
  createResume,
  findResumeByIdForUser,
  findLatestResumeByUser,
  listResumesByUser,
};
