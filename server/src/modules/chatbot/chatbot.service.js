const { v4: uuidv4 } = require('uuid');
const userService = require('../user/user.service');
const skillsModel = require('../skills/skills.model');
const chatModel = require('./chat.model');
const jobApiService = require('../../services/jobApi.service');
const { callGroq } = require('../../services/groq.service');
const { callGemini } = require('../../services/gemini.service');
const { withTransaction } = require('../../config/db');
const { AppError } = require('../../middleware/error.middleware');
const errorCodes = require('../../utils/errorCodes');
const logger = require('../../utils/logger');

const toSafeHistory = (history) =>
  Array.isArray(history)
    ? history
        .slice(-10)
        .filter((item) => item && item.content)
        .map((item) => ({
          role: item.role === 'assistant' ? 'assistant' : 'user',
          content: String(item.content).slice(0, 1200),
        }))
    : [];

const buildSystemPrompt = (profile, skills) => {
  const skillSummary = skills.map((skill) => `${skill.name}(${skill.level}/10)`).join(', ') || 'No skills found';

  return [
    'You are DelphiMinds, an AI Career Intelligence mentor.',
    'Give practical, concise and personalized advice.',
    `User profile: name=${profile.name || 'N/A'}, email=${profile.email || 'N/A'}`,
    `User skills: ${skillSummary}`,
    'When suggesting actions, provide short numbered steps.',
  ].join('\n');
};

const buildMarketSummary = (jobs = [], salaryHistogram = {}) => {
  const trendingRoles = jobs.slice(0, 5).map((job) => job.title).filter(Boolean);
  const salaryRanges = Object.keys(salaryHistogram || {}).slice(0, 6);

  return {
    trendingRoles,
    salaryRanges,
  };
};

const getJobContext = async (skills = []) => {
  const query = skills.length > 0 ? skills[0].name : 'software engineer';

  const [jobsResult, salaryHistogram] = await Promise.all([
    jobApiService.searchJobs({ query, page: 1 }),
    jobApiService.getSalaryHistogram({ query }),
  ]);

  return buildMarketSummary(jobsResult.jobs || [], salaryHistogram || {});
};

const persistChatExchange = async ({ userId, sessionId, message, reply, provider, contextPayload }) => {
  return withTransaction(async (client) => {
    await chatModel.appendMessage(
      {
        userId,
        sessionId,
        role: 'user',
        message,
        contextPayload,
      },
      client
    );

    await chatModel.appendMessage(
      {
        userId,
        sessionId,
        role: 'assistant',
        message: reply,
        provider,
        contextPayload,
      },
      client
    );

    return sessionId;
  });
};

const askCareerMentor = async (authUser, message, history = [], options = {}) => {
  if (!message || String(message).trim().length < 2) {
    throw new AppError('Message is required', 400, errorCodes.VALIDATION_ERROR);
  }

  const profile = await userService.ensureUserFromFirebase(authUser);
  const skills = await skillsModel.getUserSkills(profile.id);
  const marketSummary = await getJobContext(skills);
  const systemPrompt = `${buildSystemPrompt(profile, skills)}\nJob market trending roles: ${
    marketSummary.trendingRoles.join(', ') || 'N/A'
  }\nSalary buckets observed: ${marketSummary.salaryRanges.join(', ') || 'N/A'}`;
  const safeHistory = toSafeHistory(history);
  const shouldPersist = options.storeHistory !== false;
  const sessionId = options.sessionId || uuidv4();

  try {
    const reply = await callGroq({
      systemPrompt,
      message: String(message).trim(),
      history: safeHistory,
    });

    if (shouldPersist) {
      await persistChatExchange({
        userId: profile.id,
        sessionId,
        message: String(message).trim(),
        reply,
        provider: 'groq',
        contextPayload: {
          skillsCount: skills.length,
          marketSummary,
        },
      });
    }

    return {
      provider: 'groq',
      reply,
      sessionId,
      context: {
        skillsCount: skills.length,
        jobMarket: marketSummary,
      },
    };
  } catch (groqError) {
    logger.warn('Groq call failed, using Gemini fallback', {
      error: groqError.message,
    });

    const reply = await callGemini({
      systemPrompt,
      message: String(message).trim(),
      history: safeHistory,
    });

    if (shouldPersist) {
      await persistChatExchange({
        userId: profile.id,
        sessionId,
        message: String(message).trim(),
        reply,
        provider: 'gemini',
        contextPayload: {
          skillsCount: skills.length,
          marketSummary,
          fallbackFrom: 'groq',
        },
      });
    }

    return {
      provider: 'gemini',
      reply,
      sessionId,
      context: {
        skillsCount: skills.length,
        jobMarket: marketSummary,
      },
    };
  }
};

module.exports = {
  askCareerMentor,
};
