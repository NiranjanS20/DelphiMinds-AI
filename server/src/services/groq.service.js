const axios = require('axios');
const env = require('../config/env');
const { AppError } = require('../middleware/error.middleware');
const errorCodes = require('../utils/errorCodes');
const logger = require('../utils/logger');

const callGroq = async ({ systemPrompt, message, history = [] }) => {
  if (!env.groqApiKey) {
    throw new AppError(
      'Groq API key is not configured',
      500,
      errorCodes.EXTERNAL_SERVICE_ERROR
    );
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.content || ''),
    })),
    { role: 'user', content: message },
  ];

  let attempt = 0;
  let lastError = null;

  while (attempt < 3) {
    try {
      const response = await axios.post(
        env.groqApiUrl,
        {
          model: env.groqModel,
          temperature: 0.4,
          messages,
        },
        {
          headers: {
            Authorization: `Bearer ${env.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        logger.warn('Groq returned empty content');
        throw new AppError(
          'Groq response was empty',
          502,
          errorCodes.EXTERNAL_SERVICE_ERROR
        );
      }

      return content;
    } catch (error) {
      attempt += 1;
      lastError = error;
      if (attempt < 3) {
        logger.warn('Groq call failed, retrying', { attempt, error: error.message });
      }
    }
  }

  throw new AppError(
    `Groq call failed: ${lastError?.message || 'unknown error'}`,
    502,
    errorCodes.EXTERNAL_SERVICE_ERROR
  );
};

module.exports = {
  callGroq,
};
