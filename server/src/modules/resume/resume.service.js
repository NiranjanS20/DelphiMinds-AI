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

const uploadResume = async (authUser, file) => {
  if (!file) {
    throw new AppError('Resume file is required', 400, errorCodes.FILE_UPLOAD_ERROR);
  }

  const user = await userService.ensureUserFromFirebase(authUser);
  const storedFile = await storageService.storeResumeFile(file);
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

  const mlResult = await mlService.parseResume(storedFile);

  const parsedData = {
    ...mlResult.parsedData,
    skills: mlResult.skills || [],
    experience: mlResult.parsedData?.experience || '',
    education: mlResult.parsedData?.education || '',
    source: 'ml-service',
  };

  const mlMeta = {
    ...(mlResult.meta || {}),
    originalName: storedFile.originalName,
    size: storedFile.size,
    mimetype: storedFile.mimetype,
  };

  const persisted = await withTransaction(async (client) => {
    const updatedResume = await saveParsedData(
      {
        resumeId: resume.id,
        parsedData,
        mlMeta,
        status: mlResult.meta?.fallback ? 'failed' : 'parsed',
      },
      client
    );

    const extractedSkills = await skillsService.addUserSkillsFromML(
      user.id,
      {
        skills: mlResult.skills || [],
      },
      {
        source: 'resume',
        category: 'extracted',
        defaultLevel: 5,
        defaultConfidence: mlResult.meta?.fallback ? 0.4 : 0.9,
        client,
      }
    );

    return {
      resume: updatedResume,
      extractedSkills,
    };
  });

  return {
    ...persisted.resume,
    analysis: {
      extractedSkills: persisted.extractedSkills,
      usedFallback: Boolean(mlResult.meta?.fallback),
    },
  };
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
};
