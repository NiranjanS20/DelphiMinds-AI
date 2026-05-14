const fs = require('fs');
const os = require('os');
const path = require('path');
const env = require('../config/env');

let cachedUploadRoot = null;

const toAbsolutePath = (uploadRoot) =>
  path.isAbsolute(uploadRoot)
    ? uploadRoot
    : path.resolve(process.cwd(), uploadRoot);

const canUseDirectory = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch (_error) {
    return false;
  }
};

const getUploadRoot = () => {
  if (cachedUploadRoot) {
    return cachedUploadRoot;
  }

  const configuredRoot = env.uploadRoot || 'uploads';
  const candidates = [
    toAbsolutePath(configuredRoot),
    path.join(os.tmpdir(), 'delphiminds-uploads'),
  ];

  for (const candidate of candidates) {
    if (canUseDirectory(candidate)) {
      cachedUploadRoot = candidate;
      return cachedUploadRoot;
    }
  }

  // Return the configured path so the caller can surface the real filesystem error.
  cachedUploadRoot = toAbsolutePath(configuredRoot);
  return cachedUploadRoot;
};

const getUploadPath = (...segments) => path.join(getUploadRoot(), ...segments);

module.exports = {
  getUploadRoot,
  getUploadPath,
};
