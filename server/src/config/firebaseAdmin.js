const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const env = require('./env');
const logger = require('../utils/logger');

let initialized = false;

const loadServiceAccountFromFile = () => {
  const configuredPath = env.firebaseServiceAccountPath || env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const fallbackPath = path.resolve(__dirname, 'firebaseServiceAccount.json');
  const filePath = configuredPath
    ? path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(process.cwd(), configuredPath)
    : fallbackPath;

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileContent);

    if (parsed && parsed.project_id && parsed.private_key && parsed.client_email) {
      return parsed;
    }

    return null;
  } catch (error) {
    logger.error('Invalid Firebase service account file', {
      filePath,
      error: error.message,
    });
    return null;
  }
};

const initializeFirebase = () => {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return;
  }

  const options = {};
  const serviceAccount = loadServiceAccountFromFile();

  if (serviceAccount && serviceAccount.project_id) {
    options.credential = admin.credential.cert(serviceAccount);
    options.projectId = serviceAccount.project_id;
  } else if (env.firebaseServiceAccountJson) {
    try {
      const parsedServiceAccount = JSON.parse(env.firebaseServiceAccountJson);
      options.credential = admin.credential.cert(parsedServiceAccount);
      if (!options.projectId && parsedServiceAccount.project_id) {
        options.projectId = parsedServiceAccount.project_id;
      }
    } catch (error) {
      logger.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON', {
        error: error.message,
      });
      throw error;
    }
  } else {
    options.credential = admin.credential.applicationDefault();
  }

  if (!options.projectId && env.firebaseProjectId) {
    options.projectId = env.firebaseProjectId;
  }

  admin.initializeApp(options);
  initialized = true;
  logger.info('Firebase Admin initialized');
};

const verifyFirebaseToken = async (token) => {
  if (!token) {
    throw new Error('Missing Firebase token');
  }

  if (env.allowMockAuth && token === 'dev-token') {
    return {
      uid: 'dev-user-uid',
      email: 'dev@delphiminds.local',
      name: 'Dev User',
    };
  }

  initializeFirebase();
  return admin.auth().verifyIdToken(token);
};

module.exports = {
  admin,
  initializeFirebase,
  verifyFirebaseToken,
};
