const resumeModel = require('./resume.model');
const userService = require('../user/user.service');
const skillsService = require('../skills/skills.service');
const storageService = require('../../services/storage.service');
const mlService = require('../../services/ml.service');
const { withTransaction } = require('../../config/db');
const { AppError } = require('../../middleware/error.middleware');
const errorCodes = require('../../utils/errorCodes');
const { validateResumeId } = require('./resume.validation');

const normalizeSkill = (skill) => {
  if (!skill) return '';
  const s = skill.trim();
  const lower = s.toLowerCase();
  if (lower === 'js') return 'JavaScript';
  if (lower === 'ml') return 'Machine Learning';
  if (lower === 'node') return 'Node.js';
  if (lower === 'react.js') return 'React';
  if (lower === 'vue.js') return 'Vue';
  return s;
};

// Map Gemini proficiency strings to numeric levels (1-10 scale)
const PROFICIENCY_MAP = {
  beginner: 2,
  intermediate: 5,
  advanced: 8,
};

const mapProficiency = (proficiencyStr) => {
  const key = String(proficiencyStr || '').toLowerCase().trim();
  return PROFICIENCY_MAP[key] || 5; // default to intermediate
};

const saveResume = async (payload, client) => resumeModel.saveResume(payload, client);
const saveParsedData = async (payload, client) => resumeModel.saveParsedData(payload, client);

/**
 * Flatten the advanced skills object into a deduplicated string[]
 * for backward compatibility with analytics, job fit, and ATS consumers.
 */
const flattenSkillsToArray = (skillsObj = {}) => {
  const allEntries = [
    ...(skillsObj.technical_skills || []),
    ...(skillsObj.soft_skills || []),
    ...(skillsObj.tools_and_platforms || []),
  ];

  const names = allEntries
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      return entry?.name || '';
    })
    .map(normalizeSkill)
    .filter(Boolean);

  return Array.from(new Set(names));
};

/**
 * Build skill objects with proficiency for addUserSkillsFromML.
 * Each entry becomes { name, level, confidence }.
 */
const buildSkillPayload = (skillsObj = {}) => {
  const allEntries = [
    ...(skillsObj.technical_skills || []),
    ...(skillsObj.soft_skills || []),
    ...(skillsObj.tools_and_platforms || []),
  ];

  const seen = new Set();
  const result = [];

  for (const entry of allEntries) {
    const name = normalizeSkill(typeof entry === 'string' ? entry : entry?.name || '');
    if (!name) continue;

    const dedupeKey = name.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    result.push({
      name,
      level: mapProficiency(entry?.proficiency),
    });
  }

  return result;
};

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

  // --- V2 Pipeline: Single call to Gemini-powered extraction ---
  const v2Result = await mlService.callParseResumeV2(storedFile);
  const isFallback = !!v2Result.meta?.fallback;
  const processingStatus = isFallback ? 'fallback' : 'success';

  // Flatten skills for backward compatibility (analytics, job fit, ATS)
  const flatSkills = flattenSkillsToArray(v2Result.skills || {});

  // Build the parsed_data object that gets stored in PostgreSQL.
  // The flat `skills` array satisfies downstream consumers;
  // the categorized sub-objects are preserved for advanced features.
  const parsedData = {
    // Backward-compatible flat fields (consumed by ATS, analytics, job fit)
    name: v2Result.personal_information?.name || '',
    email: v2Result.personal_information?.email || '',
    phone: v2Result.personal_information?.phone || '',
    summary: v2Result.summary || '',
    skills: flatSkills,
    experience: v2Result.experience || [],
    education: v2Result.education || [],
    projects: v2Result.projects || [],

    // Advanced structured data (for future features)
    personal_information: v2Result.personal_information || {},
    career_metadata: v2Result.career_metadata || {},
    skills_detailed: v2Result.skills || {},
    certifications: v2Result.certifications || [],
    career_preferences: v2Result.career_preferences || {},
    gap_analysis_seed: v2Result.gap_analysis_seed || {},
    ai_analysis: v2Result.ai_analysis || {},

    source: 'gemini-v2',
  };

  const rawText = v2Result.raw_resume_text || '';

  const mlMeta = {
    ...(v2Result.parser_metadata || {}),
    originalName: storedFile.originalName,
    size: storedFile.size,
    mimetype: storedFile.mimetype,
  };

  // --- DB Persistence ---
  const persisted = await withTransaction(async (client) => {
    const updatedResume = await saveParsedData(
      {
        resumeId: resume.id,
        parsedData,
        rawText,
        geminiProcessedData: v2Result.processing_info || {},
        processingStatus,
        parserVersion: 'v2-gemini',
        mlMeta,
        status: isFallback ? 'failed' : 'parsed',
      },
      client
    );

    // Normalize skills into skills + user_skills tables
    const skillPayload = buildSkillPayload(v2Result.skills || {});
    const confidence = v2Result.ai_analysis?.confidence_score || (isFallback ? 0.4 : 0.95);

    const extractedSkills = await skillsService.addUserSkillsFromML(
      user.id,
      { skills: skillPayload },
      {
        source: 'resume',
        category: 'extracted',
        defaultLevel: 5,
        defaultConfidence: confidence,
        client,
      }
    );

    return {
      resume: updatedResume,
      extractedSkills,
    };
  });

  // --- Response adapter: exact same shape as before ---
  return {
    ...persisted.resume,
    analysis: {
      extractedSkills: persisted.extractedSkills,
      usedFallback: isFallback,
      processingStatus,
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

const getLatestResume = async (authUser) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  const resume = await resumeModel.findLatestResumeByUser(user.id);

  if (!resume) {
    throw new AppError('Resume not found', 404, errorCodes.NOT_FOUND);
  }

  return resume;
};

const getResumeHistory = async (authUser) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  const resumes = await resumeModel.findAllResumesByUser(user.id);

  return {
    resumes: Array.isArray(resumes) ? resumes : [],
    total: resumes ? resumes.length : 0,
  };
};

module.exports = {
  saveResume,
  saveParsedData,
  uploadResume,
  getResumeById,
  getLatestResume,
  getResumeHistory,
};
