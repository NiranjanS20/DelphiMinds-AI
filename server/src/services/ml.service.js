const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const env = require('../config/env');
const logger = require('../utils/logger');

const MAX_RETRIES = 2;
const ML_BASE_URL = (env.mlServiceUrl || 'http://localhost:8000').replace(/\/$/, '');

const fallbackParsePayload = (reason = 'ML service unavailable') => ({
  skills: [],
  experience: '',
  education: '',
  meta: {
    fallback: true,
    reason,
  },
});

const fallbackRecommendationPayload = (reason = 'ML service unavailable') => ({
  recommendations: [],
  careers: [],
  skill_gaps: [],
  meta: {
    fallback: true,
    reason,
  },
});

const fallbackAtsPayload = (reason = 'ML service unavailable') => ({
  ats_score: 0,
  breakdown: {
    keyword_match: 0,
    skill_relevance: 0,
    completeness: 0,
  },
  match_score: 0,
  matched_keywords: [],
  missing_keywords: [],
  keyword_gap: {
    missing_keywords: [],
  },
  improvement_suggestions: [
    'Add role-specific keywords from the job description.',
    'Strengthen your skills, experience, and education sections.',
    'Use measurable achievements aligned with the target role.',
  ],
  meta: {
    fallback: true,
    reason,
  },
});

const toArray = (value) => (Array.isArray(value) ? value : []);
const toString = (value) => (typeof value === 'string' ? value : '');
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
        timeout: 25000,
        maxBodyLength: Infinity,
      });

      return {
        skills: toArray(response.data?.skills),
        experience: toString(response.data?.experience),
        education: toString(response.data?.education),
        meta: {
          fallback: false,
          source: 'ml-service',
        },
      };
    } catch (error) {
      attempt += 1;
      logger.warn('ML parse attempt failed', {
        attempt,
        error: error.message,
      });

      if (attempt > MAX_RETRIES) {
        logger.error('ML parse failed, using fallback response', {
          error: error.message,
        });
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
      .map((skill) => String(skill || '').trim())
      .filter(Boolean),
  };

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const response = await axios.post(endpoint, payload, {
        timeout: 20000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        recommendations: toArray(response.data?.recommendations || response.data?.careers),
        careers: toArray(response.data?.careers),
        skill_gaps: toArray(response.data?.skill_gaps),
        meta: {
          fallback: false,
          source: 'ml-service',
        },
      };
    } catch (error) {
      attempt += 1;
      logger.warn('ML recommend attempt failed', {
        attempt,
        error: error.message,
      });

      if (attempt > MAX_RETRIES) {
        logger.error('ML recommend failed, using fallback response', {
          error: error.message,
        });
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
      .map((skill) => String(skill || '').trim())
      .filter(Boolean),
    resume_experience: toString(data.resumeExperience),
    resume_education: toString(data.resumeEducation),
  };

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const response = await axios.post(endpoint, payload, {
        timeout: 25000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data || {};
      const keywordGap = result.keyword_gap || {};

      return {
        ats_score: Math.max(0, Math.min(100, toNumber(result.ats_score, 0))),
        breakdown: {
          keyword_match: Math.max(
            0,
            Math.min(100, toNumber(result.breakdown?.keyword_match, 0))
          ),
          skill_relevance: Math.max(
            0,
            Math.min(100, toNumber(result.breakdown?.skill_relevance, 0))
          ),
          completeness: Math.max(
            0,
            Math.min(100, toNumber(result.breakdown?.completeness, 0))
          ),
        },
        match_score: Math.max(0, Math.min(100, toNumber(result.match_score, 0))),
        matched_keywords: toArray(result.matched_keywords),
        missing_keywords: toArray(result.missing_keywords),
        keyword_gap: {
          missing_keywords: toArray(keywordGap.missing_keywords),
        },
        improvement_suggestions: toArray(result.improvement_suggestions),
        meta: {
          fallback: false,
          source: 'ml-service',
        },
      };
    } catch (error) {
      attempt += 1;
      logger.warn('ML ATS analysis attempt failed', {
        attempt,
        error: error.message,
      });

      if (attempt > MAX_RETRIES) {
        logger.error('ML ATS analysis failed, using fallback response', {
          error: error.message,
        });
        return fallbackAtsPayload(error.message);
      }
    }
  }

  return fallbackAtsPayload();
};

const parseResume = async (fileInfo) => {
  const mlResponse = await callParseResume(fileInfo || {});

  return {
    skills: mlResponse.skills || [],
    parsedData: {
      experience: mlResponse.experience || '',
      education: mlResponse.education || '',
    },
    meta: mlResponse.meta || {
      fallback: true,
      reason: 'ML service unavailable',
    },
  };
};

module.exports = {
  parseResume,
  callParseResume,
  callRecommendation,
  callAtsAnalysis,
  analyzeAts: callAtsAnalysis,
};
