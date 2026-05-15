const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const env = require('../config/env');
const logger = require('../utils/logger');

const MAX_RETRIES = 2;
const ML_BASE_URL = (env.mlServiceUrl || 'http://localhost:8000').replace(/\/$/, '');

const fallbackParsePayload = (reason = 'ML service unavailable') => ({
  parsedData: {
    skills: [],
    experience: '',
    education: '',
    summary: '',
    rawText: '',
  },
  skills: [],
  experience: '',
  education: '',
  summary: '',
  rawText: '',
  meta: { fallback: true, reason },
});

const fallbackRecommendationPayload = (reason = 'ML service unavailable') => ({
  recommendations: [],
  careers: [],
  skill_gaps: [],
  meta: { fallback: true, reason },
});

const fallbackAtsPayload = (reason = 'ML service unavailable') => ({
  ats_score: 0,
  breakdown: { keyword_match: 0, skill_relevance: 0, completeness: 0 },
  match_score: 0,
  matched_keywords: [],
  missing_keywords: [],
  keyword_gap: { missing_keywords: [] },
  improvement_suggestions: [
    'Add role-specific keywords from the job description.',
    'Strengthen your skills, experience, and education sections.',
    'Use measurable achievements aligned with the target role.',
  ],
  meta: { fallback: true, reason },
});

const toArray = (value) => (Array.isArray(value) ? value : []);
const toString = (value) => (typeof value === 'string' ? value.trim() : '');
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Normalize raw ML skill list to {name, category, proficiency} objects
const normalizeSkillList = (skills = []) => {
  return toArray(skills)
    .map((skill) => {
      if (typeof skill === 'string') {
        return { name: skill.trim(), category: 'Extracted', proficiency: 70 };
      }
      if (skill && typeof skill === 'object') {
        const name = toString(skill.name || skill.skill || '');
        if (!name) return null;
        const raw = Number(skill.proficiency ?? skill.level ?? 0);
        let proficiency = 70;
        if (Number.isFinite(raw) && raw > 0) {
          proficiency = raw <= 10 ? Math.min(100, Math.round(raw * 10)) : Math.min(100, Math.round(raw));
        }
        return { name, category: skill.category || 'Extracted', proficiency };
      }
      return null;
    })
    .filter(Boolean);
};

const callParseResume = async ({ filePath, originalName, mimetype }) => {
  const endpoint = ML_BASE_URL + '/parse-resume';

  if (!filePath || !fs.existsSync(filePath)) {
    logger.warn('ML parse skipped because resume file is missing', { filePath });
    return fallbackParsePayload('Resume file is missing');
  }

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: originalName || 'resume.pdf',
        contentType: mimetype || 'application/pdf',
      });

      const response = await axios.post(endpoint, formData, {
        headers: formData.getHeaders(),
        timeout: 30000,
        maxBodyLength: Infinity,
      });

      const data = response.data || {};
      const rawSkills = toArray(data.skills);
      const normalizedSkills = normalizeSkillList(rawSkills);

      // Full parsed data including all text fields
      const parsedData = {
        skills: normalizedSkills,
        experience: toString(data.experience),
        education: toString(data.education),
        summary: toString(data.summary),
        rawText: toString(data.raw_text || data.rawText),
        metadata: (data.metadata && typeof data.metadata === 'object') ? data.metadata : {},
        source: 'ml-service',
      };

      return {
        parsedData,
        skills: normalizedSkills,
        experience: parsedData.experience,
        education: parsedData.education,
        summary: parsedData.summary,
        rawText: parsedData.rawText,
        meta: {
          fallback: false,
          source: 'ml-service',
          metadata: parsedData.metadata,
        },
      };
    } catch (error) {
      attempt += 1;
      logger.warn('ML parse attempt failed', { attempt, error: error.message });
      if (attempt > MAX_RETRIES) {
        logger.error('ML parse failed after retries, using fallback', { error: error.message });
        return fallbackParsePayload(error.message);
      }
    }
  }

  return fallbackParsePayload();
};

const callRecommendation = async (data = {}) => {
  const endpoint = ML_BASE_URL + '/recommend';
  const payload = {
    skills: toArray(data.skills)
      .map((skill) => {
        if (typeof skill === 'string') return skill.trim();
        if (skill && typeof skill === 'object') return toString(skill.name || '');
        return '';
      })
      .filter(Boolean),
  };

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const response = await axios.post(endpoint, payload, {
        timeout: 20000,
        headers: { 'Content-Type': 'application/json' },
      });
      return {
        recommendations: toArray(response.data?.recommendations || response.data?.careers),
        careers: toArray(response.data?.careers),
        skill_gaps: toArray(response.data?.skill_gaps),
        meta: { fallback: false, source: 'ml-service' },
      };
    } catch (error) {
      attempt += 1;
      logger.warn('ML recommend attempt failed', { attempt, error: error.message });
      if (attempt > MAX_RETRIES) {
        return fallbackRecommendationPayload(error.message);
      }
    }
  }
  return fallbackRecommendationPayload();
};

const callAtsAnalysis = async (data = {}) => {
  const endpoint = ML_BASE_URL + '/analyze-ats';
  const payload = {
    job_description: toString(data.jobDescription),
    resume_text: toString(data.resumeText),
    resume_skills: toArray(data.resumeSkills)
      .map((skill) => {
        if (typeof skill === 'string') return skill.trim();
        if (skill && typeof skill === 'object') return toString(skill.name || '');
        return '';
      })
      .filter(Boolean),
    resume_experience: toString(data.resumeExperience),
    resume_education: toString(data.resumeEducation),
  };

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const response = await axios.post(endpoint, payload, {
        timeout: 25000,
        headers: { 'Content-Type': 'application/json' },
      });
      const result = response.data || {};
      const keywordGap = result.keyword_gap || {};
      return {
        ats_score: Math.max(0, Math.min(100, toNumber(result.ats_score, 0))),
        breakdown: {
          keyword_match: Math.max(0, Math.min(100, toNumber(result.breakdown?.keyword_match, 0))),
          skill_relevance: Math.max(0, Math.min(100, toNumber(result.breakdown?.skill_relevance, 0))),
          completeness: Math.max(0, Math.min(100, toNumber(result.breakdown?.completeness, 0))),
        },
        match_score: Math.max(0, Math.min(100, toNumber(result.match_score, 0))),
        matched_keywords: toArray(result.matched_keywords),
        missing_keywords: toArray(result.missing_keywords),
        keyword_gap: { missing_keywords: toArray(keywordGap.missing_keywords) },
        improvement_suggestions: toArray(result.improvement_suggestions),
        meta: { fallback: false, source: 'ml-service' },
      };
    } catch (error) {
      attempt += 1;
      logger.warn('ML ATS analysis attempt failed', { attempt, error: error.message });
      if (attempt > MAX_RETRIES) {
        return fallbackAtsPayload(error.message);
      }
    }
  }
  return fallbackAtsPayload();
};

// Main entry used by resume.service.js
const parseResume = async (fileInfo) => {
  const mlResponse = await callParseResume(fileInfo || {});
  return mlResponse; // Return full response so resume.service can persist everything
};

module.exports = {
  parseResume,
  callParseResume,
  callRecommendation,
  callAtsAnalysis,
  analyzeAts: callAtsAnalysis,
};
