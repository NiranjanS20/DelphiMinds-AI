const { query } = require('../../config/db');

const getExecutor = (client) => client || { query };

const mapChatRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    role: row.role,
    message: row.message,
    provider: row.provider,
    contextPayload: row.context_payload,
    tokensUsed: row.tokens_used,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const appendMessage = async (
  { userId, sessionId, role, message, provider, contextPayload, tokensUsed },
  client
) => {
  const result = await getExecutor(client).query(
    `
      INSERT INTO chat_history (
        user_id,
        session_id,
        role,
        message,
        provider,
        context_payload,
        tokens_used
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      userId,
      sessionId,
      role,
      message,
      provider || null,
      contextPayload || {},
      Number.isInteger(tokensUsed) ? tokensUsed : null,
    ]
  );

  return mapChatRow(result.rows[0]);
};

module.exports = {
  appendMessage,
};
