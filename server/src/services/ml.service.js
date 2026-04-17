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

const toArray = (value) => (Array.isArray(value) ? value : []);
const toString = (value) => (typeof value === 'string' ? value : '');

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
};
