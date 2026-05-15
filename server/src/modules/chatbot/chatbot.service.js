const { v4: uuidv4 } = require('uuid');
const userService = require('../user/user.service');
const skillsModel = require('../skills/skills.model');
const chatModel = require('./chat.model');
const jobApiService = require('../../services/jobApi.service');
const { callGroq } = require('../../services/groq.service');
const { callGemini } = require('../../services/gemini.service');
const { withTransaction, query } = require('../../config/db');
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

/**
 * Fetch the user's latest resume data for enriching the chatbot context.
 */
const getResumeContext = async (userId) => {
  try {
    const result = await query(
      `SELECT parsed_data, status FROM resumes
       WHERE user_id = $1
       ORDER BY COALESCE(parsed_at, created_at) DESC
       LIMIT 1`,
      [userId]
    );
    if (result.rowCount === 0) return null;
    return result.rows[0].parsed_data || null;
  } catch (_err) {
    return null;
  }
};

const buildSystemPrompt = (profile, skills, resumeData) => {
  const skillSummary =
    skills.length > 0
      ? skills.map((skill) => `${skill.name}(${skill.level}/10)`).join(', ')
      : 'No skills on record';

  const lines = [
    'You are Delphi, an AI Career Intelligence Mentor for DelphiMinds platform.',
    'Give practical, concise, and highly personalized career advice.',
    'Be conversational but professional. Use numbered steps for action items.',
    '',
    `User Profile:`,
    `- Name: ${profile.name || 'User'}`,
    `- Email: ${profile.email || 'N/A'}`,
    `- Skills on record: ${skillSummary}`,
  ];

  // Add resume-specific context if available
  if (resumeData) {
    const rawSkills = Array.isArray(resumeData.skills) ? resumeData.skills : [];
    const skillNames = rawSkills.map((s) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean);

    if (skillNames.length > 0) {
      lines.push(`- Resume skills: ${skillNames.slice(0, 15).join(', ')}`);
    }
    if (resumeData.experience) {
      lines.push(`- Experience summary: ${String(resumeData.experience).slice(0, 300)}`);
    }
    if (resumeData.education) {
      lines.push(`- Education: ${String(resumeData.education).slice(0, 200)}`);
    }
    if (resumeData.summary) {
      lines.push(`- Professional summary: ${String(resumeData.summary).slice(0, 300)}`);
    }
  } else {
    lines.push('- No resume uploaded yet. Encourage the user to upload their resume for personalized advice.');
  }

  lines.push('');
  lines.push('Always give advice grounded in the user\'s actual profile above.');

  return lines.join('\n');
};

const buildMarketSummary = (jobs = [], salaryHistogram = {}) => {
  const trendingRoles = jobs.slice(0, 5).map((job) => job.title).filter(Boolean);
  const salaryRanges = Object.keys(salaryHistogram || {}).slice(0, 6);
  return { trendingRoles, salaryRanges };
};

const getJobContext = async (skills = []) => {
  const queryStr = skills.length > 0 ? skills[0].name : 'software engineer';
  try {
    const [jobsResult, salaryHistogram] = await Promise.all([
      jobApiService.searchJobs({ query: queryStr, page: 1 }),
      jobApiService.getSalaryHistogram({ query: queryStr }),
    ]);
    return buildMarketSummary(jobsResult.jobs || [], salaryHistogram || {});
  } catch (_err) {
    return { trendingRoles: [], salaryRanges: [] };
  }
};

const persistChatExchange = async ({ userId, sessionId, message, reply, provider, contextPayload }) => {
  return withTransaction(async (client) => {
    await chatModel.appendMessage({ userId, sessionId, role: 'user', message, contextPayload }, client);
    await chatModel.appendMessage({ userId, sessionId, role: 'assistant', message: reply, provider, contextPayload }, client);
    return sessionId;
  });
};

const askCareerMentor = async (authUser, message, history = [], options = {}) => {
  if (!message || String(message).trim().length < 2) {
    throw new AppError('Message is required', 400, errorCodes.VALIDATION_ERROR);
  }

  const profile = await userService.ensureUserFromFirebase(authUser);
  const [skills, resumeData, marketSummary] = await Promise.all([
    skillsModel.getUserSkills(profile.id),
    getResumeContext(profile.id),
    getJobContext([]),
  ]);

  const systemPrompt = [
    buildSystemPrompt(profile, skills, resumeData),
    marketSummary.trendingRoles.length > 0
      ? `\nJob market trending roles: ${marketSummary.trendingRoles.join(', ')}`
      : '',
    marketSummary.salaryRanges.length > 0
      ? `Salary buckets observed: ${marketSummary.salaryRanges.join(', ')}`
      : '',
  ].filter(Boolean).join('\n');

  const safeHistory = toSafeHistory(history);
  const shouldPersist = options.storeHistory !== false;
  const sessionId = options.sessionId || uuidv4();
  const userMessage = String(message).trim();

  // Try Groq first, then fall back to Gemini
  try {
    const reply = await callGroq({ systemPrompt, message: userMessage, history: safeHistory });

    if (shouldPersist) {
      await persistChatExchange({
        userId: profile.id,
        sessionId,
        message: userMessage,
        reply,
        provider: 'groq',
        contextPayload: { skillsCount: skills.length, hasResume: Boolean(resumeData), marketSummary },
      });
    }

    return {
      provider: 'groq',
      reply,
      sessionId,
      context: { skillsCount: skills.length, jobMarket: marketSummary },
    };
  } catch (groqError) {
    logger.warn('Groq call failed, falling back to Gemini', { error: groqError.message });

    const reply = await callGemini({ systemPrompt, message: userMessage, history: safeHistory });

    if (shouldPersist) {
      await persistChatExchange({
        userId: profile.id,
        sessionId,
        message: userMessage,
        reply,
        provider: 'gemini',
        contextPayload: {
          skillsCount: skills.length,
          hasResume: Boolean(resumeData),
          marketSummary,
          fallbackFrom: 'groq',
        },
      });
    }

    return {
      provider: 'gemini',
      reply,
      sessionId,
      context: { skillsCount: skills.length, jobMarket: marketSummary },
    };
  }
};

module.exports = { askCareerMentor };
