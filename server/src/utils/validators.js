const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').toLowerCase());

const isValidUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '')
  );

const validateRequiredFields = (payload, fields) => {
  const missing = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === '';
  });
  return {
    valid: missing.length === 0,
    missing,
  };
};

const sanitizeString = (value, max = 255) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, max);

const normalizeSkillLevel = (level) => {
  const parsed = Number(level);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  if (parsed < 1 || parsed > 10) {
    return null;
  }
  return Math.round(parsed);
};

module.exports = {
  isValidEmail,
  isValidUuid,
  validateRequiredFields,
  sanitizeString,
  normalizeSkillLevel,
};
