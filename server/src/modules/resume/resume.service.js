const resumeModel = require('./resume.model');
const userService = require('../user/user.service');
const skillsService = require('../skills/skills.service');
const storageService = require('../../services/storage.service');
const mlService = require('../../services/ml.service');
const { withTransaction } = require('../../config/db');
const { AppError } = require('../../middleware/error.middleware');
const errorCodes = require('../../utils/errorCodes');
const { validateResumeId } = require('./resume.validation');

const saveResume = async (payload, client) => resumeModel.saveResume(payload, client);
const saveParsedData = async (payload, client) => resumeModel.saveParsedData(payload, client);

const toSkillArray = (skills = []) => {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((skill) => {
      if (typeof skill === 'string') return { name: skill.trim(), category: 'Extracted', proficiency: 70 };
      if (skill && typeof skill === 'object') {
        const name = String(skill.name || skill.skill || '').trim();
        if (!name) return null;
        const raw = Number(skill.proficiency ?? skill.level ?? 0);
        const proficiency = raw <= 10 && raw > 0 ? Math.round(raw * 10) : Math.min(100, Math.max(1, Math.round(raw)));
        return { name, category: skill.category || 'Extracted', proficiency: proficiency || 70 };
      }
      return null;
    })
    .filter(Boolean);
};

const uploadResume = async (authUser, file) => {
  if (!file) {
    throw new AppError('Resume file is required', 400, errorCodes.FILE_UPLOAD_ERROR);
  }

  const user = await userService.ensureUserFromFirebase(authUser);
  const storedFile = await storageService.storeResumeFile(file);

  // Create initial DB record
  const resume = await saveResume({
    userId: user.id,
    fileUrl: storedFile.fileUrl,
    fileName: storedFile.fileName,
    mimeType: storedFile.mimetype,
    fileSizeBytes: storedFile.size,
    status: 'uploaded',
    parsedData: {},
    mlMeta: {
      stage: 'uploaded',
      originalName: storedFile.originalName,
    },
  });

  // Call ML service — now returns full response with parsedData
  const mlResult = await mlService.parseResume(storedFile);

  // Build complete parsedData that will be persisted
  const mlParsed = mlResult.parsedData || {};
  const normalizedSkills = toSkillArray(mlResult.skills || mlParsed.skills || []);

  const parsedData = {
    skills: normalizedSkills,
    experience: String(mlParsed.experience || mlResult.experience || '').trim(),
    education: String(mlParsed.education || mlResult.education || '').trim(),
    summary: String(mlParsed.summary || mlResult.summary || '').trim(),
    rawText: String(mlParsed.rawText || mlResult.rawText || '').trim(),
    source: 'ml-service',
    metadata: mlParsed.metadata || {},
  };

  const hasParsedContent =
    parsedData.rawText ||
    parsedData.summary ||
    parsedData.experience ||
    parsedData.education ||
    normalizedSkills.length > 0;

  const mlMeta = {
    ...(mlResult.meta || {}),
    originalName: storedFile.originalName,
    size: storedFile.size,
    mimetype: storedFile.mimetype,
    fallback: Boolean(mlResult.meta?.fallback),
  };

  const persisted = await withTransaction(async (client) => {
    const updatedResume = await saveParsedData(
      {
        resumeId: resume.id,
        parsedData,
        mlMeta,
        status: hasParsedContent && !mlResult.meta?.fallback ? 'parsed' : 'failed',
      },
      client
    );

    // Persist skills to user_skills table
    const extractedSkills = await skillsService.addUserSkillsFromML(
      user.id,
      { skills: normalizedSkills },
      {
        source: 'resume',
        category: 'extracted',
        defaultLevel: 5,
        defaultConfidence: mlResult.meta?.fallback ? 0.4 : 0.9,
        client,
      }
    );

    return { resume: updatedResume, extractedSkills };
  });

  return {
    ...persisted.resume,
    skills: normalizedSkills,
    summary: parsedData.summary,
    experience: parsedData.experience,
    education: parsedData.education,
    Fallback: Boolean(mlResult.meta?.fallback),
    analysis: {
      extractedSkills: persisted.extractedSkills,
      usedFallback: Boolean(mlResult.meta?.fallback),
    },
  };
};

const getLatestResume = async (authUser) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  const resume = await resumeModel.findLatestResumeByUser(user.id);
  if (!resume) {
    throw new AppError('Resume not found', 404, errorCodes.NOT_FOUND);
  }
  return resume;
};

const getResumeHistory = async (authUser, options = {}) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  return resumeModel.listResumesByUser(user.id, options);
};

const getResumeById = async (authUser, resumeId) => {
  if (!validateResumeId(resumeId)) {
    throw new AppError('Invalid resume ID', 400, errorCodes.VALIDATION_ERROR);
  }
  const user = await userService.ensureUserFromFirebase(authUser);
  const resume = await resumeModel.findResumeByIdForUser(resumeId, user.id);
  if (!resume) {
    throw new AppError('Resume not found', 404, errorCodes.NOT_FOUND);
  }
  return resume;
};

module.exports = {
  saveResume,
  saveParsedData,
  uploadResume,
  getResumeById,
  getLatestResume,
  getResumeHistory,
};
