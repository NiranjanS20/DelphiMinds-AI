const { isValidEmail, sanitizeString } = require('../../utils/validators');

const validateProfileUpdate = (payload = {}) => {
  const errors = [];

  if (payload.name !== undefined) {
    const cleanName = sanitizeString(payload.name, 80);
    if (!cleanName) {
      errors.push('Name cannot be empty');
    }
  }

  if (payload.email !== undefined && !isValidEmail(payload.email)) {
    errors.push('Invalid email format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateProfileUpdate,
};
