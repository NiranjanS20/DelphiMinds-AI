const userModel = require('./user.model');
const { validateProfileUpdate } = require('./user.validation');
const { AppError } = require('../../middleware/error.middleware');
const errorCodes = require('../../utils/errorCodes');
const { sanitizeString } = require('../../utils/validators');

const createUserIfNotExists = async (authUser, profileOverrides = {}, client) => {
  if (!authUser?.uid) {
    throw new AppError('Missing authenticated user context', 401, errorCodes.UNAUTHORIZED);
  }

  const firebaseUid = authUser.uid;
  const email = profileOverrides.email || authUser.email;
  const name = sanitizeString(
    profileOverrides.name || authUser.name || profileOverrides.displayName || '',
    80
  );

  if (!email) {
    throw new AppError('Authenticated user email is missing', 400, errorCodes.BAD_REQUEST);
  }

  return userModel.createUserIfNotExists(
    {
      firebaseUid,
      email,
      name: name || null,
    },
    client
  );
};

const ensureUserFromFirebase = async (authUser, profileOverrides = {}, client) =>
  createUserIfNotExists(authUser, profileOverrides, client);

const getUserByUID = async (firebaseUid, client) => userModel.getUserByUID(firebaseUid, client);

const getProfile = async (authUser) => ensureUserFromFirebase(authUser);

const syncProfile = async (authUser, payload = {}) => {
  if (payload.uid && payload.uid !== authUser.uid) {
    throw new AppError('Profile uid mismatch', 403, errorCodes.FORBIDDEN);
  }

  const user = await ensureUserFromFirebase(authUser, payload);
  const result = await validateProfileUpdate(payload);
  const nextName = payload.name || payload.displayName;

  if (!result.valid) {
    throw new AppError('Invalid profile payload', 400, errorCodes.VALIDATION_ERROR, {
      errors: result.errors,
    });
  }

  if (nextName || payload.email) {
    const updated = await userModel.updateUserByFirebaseUid(authUser.uid, {
      name: nextName ? sanitizeString(nextName, 80) : undefined,
      email: payload.email,
    });
    return updated || user;
  }

  return user;
};

const updateProfile = async (authUser, payload = {}) => {
  const result = validateProfileUpdate(payload);
  if (!result.valid) {
    throw new AppError('Invalid profile payload', 400, errorCodes.VALIDATION_ERROR, {
      errors: result.errors,
    });
  }

  await ensureUserFromFirebase(authUser);

  const updated = await userModel.updateUserByFirebaseUid(authUser.uid, {
    name: payload.name ? sanitizeString(payload.name, 80) : undefined,
    email: payload.email,
  });

  if (!updated) {
    throw new AppError('User not found', 404, errorCodes.NOT_FOUND);
  }

  return updated;
};

module.exports = {
  createUserIfNotExists,
  getUserByUID,
  ensureUserFromFirebase,
  getProfile,
  syncProfile,
  updateProfile,
};
