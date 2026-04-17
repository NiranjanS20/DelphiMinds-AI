const { verifyFirebaseToken } = require('../config/firebaseAdmin');
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

    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || decoded.displayName || '',
      picture: decoded.picture || '',
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
