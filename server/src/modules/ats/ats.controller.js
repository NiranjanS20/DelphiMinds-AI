const { asyncHandler, sendSuccess } = require('../../utils/response');
const atsService = require('./ats.service');

const analyze = asyncHandler(async (req, res) => {
  const data = await atsService.analyzeAts(req.user, req.body || {});
  return sendSuccess(res, data, 'ATS analysis completed');
});

module.exports = {
  analyze,
};
