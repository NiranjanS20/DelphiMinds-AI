const { normalizeSkillLevel, sanitizeString } = require('../../utils/validators');

const validateAddSkillPayload = (payload = {}) => {
  const name = sanitizeString(payload.name, 120);
  const category = sanitizeString(payload.category || 'general', 80);
  const level = normalizeSkillLevel(payload.level ?? 5);

  const errors = [];
  if (!name) {
    errors.push('Skill name is required');
  }
  if (level === null) {
    errors.push('Skill level must be between 1 and 10');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: { name, category, level },
  };
};

const validateUpdateSkillPayload = (payload = {}) => {
  const level = normalizeSkillLevel(payload.level);
  const errors = [];

  if (level === null) {
    errors.push('Skill level must be between 1 and 10');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: { level },
  };
};

module.exports = {
  validateAddSkillPayload,
  validateUpdateSkillPayload,
};
