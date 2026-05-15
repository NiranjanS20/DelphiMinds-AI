const axios = require('axios');
const env = require('../config/env');
const { AppError } = require('../middleware/error.middleware');
const errorCodes = require('../utils/errorCodes');
const logger = require('../utils/logger');

/**
 * Call Gemini API with correct request format for gemini-1.5-flash.
 * Uses multi-turn `contents` array with system instruction separately.
 */
const callGemini = async ({ systemPrompt, message, history = [] }) => {
  const apiKey = env.geminiApiKey;
  if (!apiKey) {
    throw new AppError('Gemini API key is not configured', 500, errorCodes.EXTERNAL_SERVICE_ERROR);
  }

  const model = env.geminiModel || 'gemini-1.5-flash';
  const baseUrl = (env.geminiApiUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
  const endpoint = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  // Build conversation turns - Gemini uses alternating user/model roles
  const contents = [];

  // Add history (must alternate user/model)
  const safeHistory = Array.isArray(history) ? history.slice(-8) : [];
  for (const item of safeHistory) {
    if (!item || !item.content) continue;
    contents.push({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(item.content).slice(0, 1500) }],
    });
  }

  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: String(message) }],
  });

  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  };

  // Add system instruction if provided (supported in gemini-1.5-flash)
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
        timeout: 25000,
        headers: { 'Content-Type': 'application/json' },
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new AppError('Gemini response was empty', 502, errorCodes.EXTERNAL_SERVICE_ERROR);
      }
      return text;
    } catch (error) {
      attempt += 1;
      lastError = error;
      const status = error.response?.status;
      const errData = error.response?.data;
      logger.warn('Gemini call failed', { attempt, status, error: error.message, detail: JSON.stringify(errData).slice(0, 200) });

      if (attempt < 3) continue;
    }
  }

  throw new AppError(
    `Gemini call failed after retries: ${lastError?.message || 'unknown error'}`,
    502,
    errorCodes.EXTERNAL_SERVICE_ERROR
  );
};

/**
 * Simple text-only call (no history/system prompt) — used for skill extraction etc.
 */
const callGeminiSimple = async (prompt) => {
  return callGemini({ message: prompt, systemPrompt: '', history: [] });
};

module.exports = { callGemini, callGeminiSimple };
