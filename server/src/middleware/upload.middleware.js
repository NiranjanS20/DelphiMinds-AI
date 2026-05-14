const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { getUploadPath } = require('../utils/uploadPaths');
const { AppError } = require('./error.middleware');
const errorCodes = require('../utils/errorCodes');

const allowedMimes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const tempDir = getUploadPath('temp');

const ensureUploadDir = (dir, cb) => {
  fs.promises
    .mkdir(dir, { recursive: true })
    .then(() => cb(null, dir))
    .catch((error) => {
      cb(
        new AppError(
          `Upload directory is not writable: ${dir}. On Render free instances, remove UPLOAD_ROOT or set it to uploads.`,
          500,
          errorCodes.FILE_UPLOAD_ERROR,
          { path: dir, cause: error.message }
        )
      );
    });
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => ensureUploadDir(tempDir, cb),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExt = ['.pdf', '.docx'].includes(ext);

  if (!allowedMimes.has(file.mimetype) && !allowedExt) {
    return cb(
      new AppError(
        'Only PDF or DOCX files are allowed',
        400,
        errorCodes.FILE_UPLOAD_ERROR
      )
    );
  }

  return cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
    files: 1,
  },
});

module.exports = {
  uploadResume,
};
