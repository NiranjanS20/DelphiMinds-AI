const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { AppError } = require('./error.middleware');
const errorCodes = require('../utils/errorCodes');

const allowedMimes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

const tempDir = path.resolve(process.cwd(), env.uploadRoot, 'temp');
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExt = ['.pdf', '.doc', '.docx'].includes(ext);

  if (!allowedMimes.has(file.mimetype) && !allowedExt) {
    return cb(
      new AppError(
        'Only PDF or DOC/DOCX files are allowed',
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
