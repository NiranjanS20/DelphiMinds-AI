const resumeModel = require('../resume/resume.model');
const userService = require('../user/user.service');
const mlService = require('../../services/ml.service');
const { validateResumeId } = require('../resume/resume.validation');
const { AppError } = require('../../middleware/error.middleware');
const errorCodes = require('../../utils/errorCodes');

const MAX_JOB_DESCRIPTION_LENGTH = 12000;

const toString = (value) => (typeof value === 'string' ? value : '');

const toSkillArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((skill) => {
      if (typeof skill === 'string') {
        return skill.trim();
      }

      if (skill && typeof skill === 'object') {
        return String(skill.name || skill.skill || '').trim();
      }

      return '';
    })
    .filter(Boolean);
};

const getResumeForAnalysis = async (userId, resumeId) => {
  if (resumeId) {
    if (!validateResumeId(resumeId)) {
      throw new AppError('Invalid resume ID', 400, errorCodes.VALIDATION_ERROR);
    }

    return resumeModel.findResumeByIdForUser(resumeId, userId);
  }

  return resumeModel.findLatestResumeByUser(userId);
};

const composeResumeText = (parsedData = {}) => {
  const chunks = [
    toString(parsedData.summary),
    toString(parsedData.experience),
    toString(parsedData.education),
    toString(parsedData.projects),
  ].map((chunk) => chunk.trim());

  return chunks.filter(Boolean).join('\n\n');
};

const validateJobDescription = (jobDescription) => {
  const normalized = toString(jobDescription).trim();

  if (!normalized) {
    throw new AppError('Job description is required', 400, errorCodes.VALIDATION_ERROR);
  }

  if (normalized.length > MAX_JOB_DESCRIPTION_LENGTH) {
    throw new AppError(
      `Job description is too long. Max length is ${MAX_JOB_DESCRIPTION_LENGTH} characters.`,
      400,
      errorCodes.VALIDATION_ERROR
    );
  }

  return normalized;
};

const analyzeAts = async (authUser, payload = {}) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  const jobDescription = validateJobDescription(payload.jobDescription);

  const resume = await getResumeForAnalysis(user.id, payload.resumeId);
  if (!resume) {
    throw new AppError('Resume not found', 404, errorCodes.NOT_FOUND);
  }

  const parsedData = resume.parsedData || {};
  const resumeSkills = toSkillArray(parsedData.skills);
  const resumeText = composeResumeText(parsedData);

  if (!resumeText && resumeSkills.length === 0) {
    throw new AppError(
      'Resume has no parsed content. Upload and parse a resume first.',
      400,
      errorCodes.BAD_REQUEST
    );
  }

  const analysis = await mlService.analyzeAts({
    jobDescription,
    resumeText,
    resumeSkills,
    resumeExperience: toString(parsedData.experience),
    resumeEducation: toString(parsedData.education),
  });

  return {
    resume_id: resume.id,
    ats_score: analysis.ats_score,
    breakdown: analysis.breakdown,
    match_score: analysis.match_score,
    matched_keywords: analysis.matched_keywords,
    missing_keywords: analysis.missing_keywords,
    keyword_gap: analysis.keyword_gap,
    improvement_suggestions: analysis.improvement_suggestions,
    meta: analysis.meta,
  };
};

module.exports = {
  analyzeAts,
};
