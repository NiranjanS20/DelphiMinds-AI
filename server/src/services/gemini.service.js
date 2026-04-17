const axios = require('axios');
const env = require('../config/env');
const { AppError } = require('../middleware/error.middleware');
const errorCodes = require('../utils/errorCodes');

const callGemini = async ({ systemPrompt, message, history = [] }) => {
  if (!env.geminiApiKey) {
    throw new AppError(
      'Gemini API key is not configured',
      500,
      errorCodes.EXTERNAL_SERVICE_ERROR
    );
  }

  const endpoint = `${env.geminiApiUrl.replace(/\/$/, '')}/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
  const turns = history
    .slice(-8)
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.content || ''}`)
    .join('\n');

  const prompt = [
    `System: ${systemPrompt}`,
    turns ? `History:\n${turns}` : '',
    `User: ${message}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  let attempt = 0;
  let lastError = null;

  while (attempt < 3) {
    try {
      const response = await axios.post(
        endpoint,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
          },
        },
        {
          timeout: 20000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new AppError(
          'Gemini response was empty',
          502,
          errorCodes.EXTERNAL_SERVICE_ERROR
        );
      }

      return text;
    } catch (error) {
      attempt += 1;
      lastError = error;
      if (attempt < 3) {
        continue;
      }
    }
  }

  throw new AppError(
    `Gemini call failed: ${lastError?.message || 'unknown error'}`,
    502,
    errorCodes.EXTERNAL_SERVICE_ERROR
  );
};

module.exports = {
  callGemini,
};
