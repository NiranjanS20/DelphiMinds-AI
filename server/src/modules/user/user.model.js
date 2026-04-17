const { query } = require('../../config/db');

const getExecutor = (client) => client || { query };

const mapUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    firebaseUid: row.firebase_uid,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const findByFirebaseUid = async (firebaseUid, client) => {
  const result = await getExecutor(client).query('SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1', [
    firebaseUid,
  ]);
  return mapUser(result.rows[0]);
};

const createUser = async ({ firebaseUid, email, name }, client) => {
  const result = await getExecutor(client).query(
    `
      INSERT INTO users (firebase_uid, email, name)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [firebaseUid, email, name || null]
  );
  return mapUser(result.rows[0]);
};

const createUserIfNotExists = async ({ firebaseUid, email, name }, client) => {
  const result = await getExecutor(client).query(
    `
      INSERT INTO users (firebase_uid, email, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (firebase_uid)
      DO UPDATE SET
        email = COALESCE(EXCLUDED.email, users.email),
        name = COALESCE(EXCLUDED.name, users.name),
        updated_at = NOW()
      RETURNING *
    `,
    [firebaseUid, email, name || null]
  );

  return mapUser(result.rows[0]);
};

const getUserByUID = async (firebaseUid, client) => findByFirebaseUid(firebaseUid, client);

const updateUserByFirebaseUid = async (firebaseUid, payload, client) => {
  const result = await getExecutor(client).query(
    `
      UPDATE users
      SET
        email = COALESCE($2, email),
        name = COALESCE($3, name),
        updated_at = NOW()
      WHERE firebase_uid = $1
      RETURNING *
    `,
    [firebaseUid, payload.email || null, payload.name || null]
  );

  return mapUser(result.rows[0]);
};

module.exports = {
  getUserByUID,
  findByFirebaseUid,
  createUser,
  createUserIfNotExists,
  updateUserByFirebaseUid,
};
