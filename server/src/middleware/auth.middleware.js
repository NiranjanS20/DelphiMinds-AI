const { verifyFirebaseToken } = require('../config/firebaseAdmin');
const { query } = require('../config/db');
const errorCodes = require('../utils/errorCodes');
const { AppError } = require('./error.middleware');
const logger = require('../utils/logger');

const verifyToken = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization?.split(' ')?.[1];

    logger.debug('Auth middleware: token header received', {
      hasAuthorizationHeader: Boolean(authorization),
      hasBearerPrefix: authorization.startsWith('Bearer '),
      hasToken: Boolean(token),
      path: req.originalUrl,
    });

    if (!token || !authorization.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401, errorCodes.UNAUTHORIZED);
    }

    const decoded = await verifyFirebaseToken(token);
    logger.debug('Auth middleware: token verified', {
      uid: decoded.uid,
      email: decoded.email || null,
      path: req.originalUrl,
    });

    // Atomic upsert — eliminates race condition on concurrent first requests
    const fallbackEmail = `${decoded.uid}@no-email.delphiminds.local`;
    const upsertResult = await query(
      `INSERT INTO users (firebase_uid, email, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (firebase_uid) DO UPDATE
         SET email = COALESCE(NULLIF(EXCLUDED.email, ''), users.email),
             name = COALESCE(NULLIF(EXCLUDED.name, ''), users.name),
             updated_at = NOW()
       RETURNING id, metadata`,
      [
        decoded.uid,
        decoded.email || fallbackEmail,
        decoded.name || decoded.displayName || 'User',
      ]
    );
    const internal_id = upsertResult.rows[0].id;
    const metadata = upsertResult.rows[0].metadata || {};
    logger.debug('Auth middleware: user resolved', {
      uid: decoded.uid,
      userId: internal_id,
    });

    req.user = {
      ...decoded,
      id: internal_id, // Important: using mapped UUID for DB queries
      uid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || decoded.displayName || '',
      picture: decoded.picture || '',
      metadata,
    };

    return next();
  } catch (error) {
    if (error.statusCode === 401) {
      return next(error);
    }

    const isFirebaseTokenError =
      /token|id token|verifyidtoken|auth/i.test(String(error.message || ''));

    if (isFirebaseTokenError) {
      logger.warn('Auth middleware: token verification failed', {
        message: error.message,
        path: req.originalUrl,
      });
      return next(new AppError('Unauthorized', 401, errorCodes.UNAUTHORIZED));
    }

    logger.error('Auth middleware: non-auth error', {
      message: error.message,
      path: req.originalUrl,
    });

    return next(error);
  }
};

module.exports = verifyToken;
