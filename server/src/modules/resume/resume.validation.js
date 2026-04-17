const { isValidUuid } = require('../../utils/validators');

const validateResumeId = (id) => isValidUuid(id);

module.exports = {
  validateResumeId,
};
