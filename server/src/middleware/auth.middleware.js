const { verifyFirebaseToken } = require('../config/firebaseAdmin');
const { query } = require('../config/db');
const errorCodes = require('../utils/errorCodes');
const { AppError } = require('./error.middleware');

const verifyToken = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401, errorCodes.UNAUTHORIZED);
    }

    const token = header.replace('Bearer ', '').trim();
    if (!token) {
      throw new AppError('Unauthorized', 401, errorCodes.UNAUTHORIZED);
    }

    const decoded = await verifyFirebaseToken(token);

    // Fetch internal user ID from users table using firebase_uid
    const userResult = await query(
      'SELECT id, metadata FROM users WHERE firebase_uid = $1 LIMIT 1',
      [decoded.uid]
    );

    let internal_id = null;
    let metadata = {};
    const fallbackEmail = `${decoded.uid}@no-email.delphiminds.local`;

    if (userResult.rows.length > 0) {
      internal_id = userResult.rows[0].id;
      metadata = userResult.rows[0].metadata || {};
    } else {
      // Upsert/Create the user if they don't exist yet but valid firebase token is true
      const newUserResult = await query(
        `INSERT INTO users (firebase_uid, email, name)
         VALUES ($1, $2, $3)
         ON CONFLICT (firebase_uid) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [
          decoded.uid,
          decoded.email || fallbackEmail,
          decoded.name || decoded.displayName || 'User',
        ]
      );
      internal_id = newUserResult.rows[0].id;
    }

    req.user = {
      id: internal_id, // Important: using mapped UUID for DB queries
      uid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || decoded.displayName || '',
      picture: decoded.picture || '',
      metadata,
    };

    return next();
  } catch (error) {
    return next(
      error.statusCode
        ? error
        : new AppError('Unauthorized', 401, errorCodes.UNAUTHORIZED)
    );
  }
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
