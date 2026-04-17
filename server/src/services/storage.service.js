const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

const ensureDir = async (dir) => {
  await fs.promises.mkdir(dir, { recursive: true });
};

const sanitizeFileName = (name) =>
  String(name || 'resume')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 120);

const moveFile = async (sourcePath, targetPath) => {
  try {
    await fs.promises.rename(sourcePath, targetPath);
  } catch (_error) {
    await fs.promises.copyFile(sourcePath, targetPath);
    await fs.promises.unlink(sourcePath);
  }
};

const storeResumeFile = async (file) => {
  const ext = path.extname(file.originalname || file.filename || '.pdf') || '.pdf';
  const safeBase = sanitizeFileName(path.basename(file.originalname || 'resume', ext));
  const finalName = `${safeBase}-${uuidv4()}${ext.toLowerCase()}`;

  const resumeDir = path.resolve(process.cwd(), env.uploadRoot, 'resumes');
  const finalPath = path.resolve(resumeDir, finalName);

  await ensureDir(resumeDir);
  await moveFile(file.path, finalPath);

  return {
    filePath: finalPath,
    fileUrl: `/uploads/resumes/${finalName}`,
    fileName: finalName,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
};

module.exports = {
  storeResumeFile,
};
