const skillsModel = require('./skills.model');
const userService = require('../user/user.service');
const {
  validateAddSkillPayload,
  validateUpdateSkillPayload,
} = require('./skills.validation');
const { AppError } = require('../../middleware/error.middleware');
const errorCodes = require('../../utils/errorCodes');

const normalizeSkillName = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const normalizeConfidence = (value, fallback = 1) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  if (parsed < 0) {
    return 0;
  }
  if (parsed > 1) {
    return 1;
  }
  return Number(parsed.toFixed(3));
};

const normalizeLevel = (value, fallback = 5) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  if (parsed < 1) {
    return 1;
  }
  if (parsed > 10) {
    return 10;
  }
  return Math.round(parsed);
};

const getAllSkills = async () => skillsModel.getAllSkills();

const getMySkills = async (authUser) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  return skillsModel.getUserSkills(user.id);
};

const ensureSkillExists = async ({ name, category }, client) =>
  skillsModel.createSkill({ name, category }, client);

const addUserSkill = async (authUser, payload) => {
  const validation = validateAddSkillPayload(payload);
  if (!validation.valid) {
    throw new AppError('Invalid skill payload', 400, errorCodes.VALIDATION_ERROR, {
      errors: validation.errors,
    });
  }

  const user = await userService.ensureUserFromFirebase(authUser);
  const skill = await ensureSkillExists(validation.data);

  await skillsModel.upsertUserSkill({
    userId: user.id,
    skillId: skill.id,
    level: validation.data.level,
    source: 'manual',
    confidence: 1,
  });

  return {
    ...skill,
    level: validation.data.level,
  };
};

const updateSkillLevel = async (authUser, skillId, payload) => {
  const validation = validateUpdateSkillPayload(payload);
  if (!validation.valid) {
    throw new AppError('Invalid skill payload', 400, errorCodes.VALIDATION_ERROR, {
      errors: validation.errors,
    });
  }

  const user = await userService.ensureUserFromFirebase(authUser);
  const skill = await skillsModel.findSkillById(skillId);

  if (!skill) {
    throw new AppError('Skill not found', 404, errorCodes.NOT_FOUND);
  }

  await skillsModel.upsertUserSkill({
    userId: user.id,
    skillId: skill.id,
    level: validation.data.level,
    source: 'manual',
    confidence: 1,
  });

  return {
    ...skill,
    level: validation.data.level,
  };
};

const updateUserSkillLevel = async (authUser, skillId, payload) =>
  updateSkillLevel(authUser, skillId, payload);

const addUserSkillsFromML = async (userId, mlPayload = {}, options = {}) => {
  const source = options.source || 'ml';
  const client = options.client;

  const payloadSkills = Array.isArray(mlPayload)
    ? mlPayload
    : Array.isArray(mlPayload.skills)
      ? mlPayload.skills
      : [];

  const normalized = [];
  const seen = new Set();

  for (const raw of payloadSkills) {
    const item = typeof raw === 'string' ? { name: raw } : raw || {};
    const name = normalizeSkillName(item.name || raw);
    if (!name) {
      continue;
    }

    const dedupeKey = name.toLowerCase();
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);

    normalized.push({
      name,
      category: normalizeSkillName(item.category || options.category || source || 'general'),
      level: normalizeLevel(item.level ?? options.defaultLevel ?? 5, 5),
      confidence: normalizeConfidence(item.confidence, options.defaultConfidence ?? 0.9),
    });
  }

  const applied = [];
  for (const skillInput of normalized) {
    const skill = await ensureSkillExists(skillInput, client);
    await skillsModel.upsertUserSkill(
      {
        userId,
        skillId: skill.id,
        level: skillInput.level,
        source,
        confidence: skillInput.confidence,
      },
      client
    );

    applied.push({
      skillId: skill.id,
      name: skill.name,
      category: skill.category,
      level: skillInput.level,
      confidence: skillInput.confidence,
      source,
    });
  }

  return applied;
};

const upsertExtractedSkills = async (userId, skillNames = []) => {
  const applied = await addUserSkillsFromML(
    userId,
    {
      skills: skillNames,
    },
    {
      source: 'resume',
      category: 'extracted',
      defaultLevel: 5,
      defaultConfidence: 0.85,
    }
  );

  return applied.length;
};

module.exports = {
  getAllSkills,
  getMySkills,
  addUserSkill,
  updateSkillLevel,
  updateUserSkillLevel,
  addUserSkillsFromML,
  upsertExtractedSkills,
};
