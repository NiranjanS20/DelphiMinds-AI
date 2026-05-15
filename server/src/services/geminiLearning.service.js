const axios = require('axios');
const env = require('../config/env');
const { AppError } = require('../middleware/error.middleware');
const errorCodes = require('../utils/errorCodes');
const logger = require('../utils/logger');

/**
 * Gemini service for learning path generation.
 * Falls back to GEMINI_API_KEY if GEMINI_LEARNING_API_KEY is not set.
 * Uses correct Gemini API format (systemInstruction + contents).
 */
const callGeminiLearning = async ({ systemPrompt, message, history = [] }) => {
  // Prefer dedicated learning key, fall back to main key
  const apiKey = env.geminiLearningApiKey || env.geminiApiKey;
  if (!apiKey) {
    throw new AppError(
      'Gemini API key is not configured (set GEMINI_API_KEY or GEMINI_LEARNING_API_KEY)',
      500,
      errorCodes.EXTERNAL_SERVICE_ERROR
    );
  }

  const model = env.geminiModel || 'gemini-1.5-flash';
  const baseUrl = (env.geminiApiUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
  const endpoint = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  // Build conversation turns
  const contents = [];
  const safeHistory = Array.isArray(history) ? history.slice(-6) : [];
  for (const item of safeHistory) {
    if (!item || !item.content) continue;
    contents.push({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(item.content).slice(0, 1200) }],
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: String(message) }],
  });

  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.2, // Low temp for structured JSON output
      maxOutputTokens: 2048,
    },
  };

  if (systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: String(systemPrompt) }],
    };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < 3) {
    try {
      const response = await axios.post(endpoint, requestBody, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new AppError('Gemini Learning response was empty', 502, errorCodes.EXTERNAL_SERVICE_ERROR);
      }
      return text;
    } catch (error) {
      attempt += 1;
      lastError = error;
      const status = error.response?.status;
      logger.warn('Gemini Learning call failed', { attempt, status, error: error.message });
      if (attempt < 3) continue;
    }
  }

  throw new AppError(
    `Gemini Learning call failed: ${lastError?.message || 'unknown error'}`,
    502,
    errorCodes.EXTERNAL_SERVICE_ERROR
  );
};

module.exports = { callGeminiLearning };
