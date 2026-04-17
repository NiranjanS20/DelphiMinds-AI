const { asyncHandler, sendSuccess } = require('../../utils/response');
const careerService = require('./career.service');

const getRecommendations = asyncHandler(async (req, res) => {
  const data = await careerService.getRecommendations(req.user, req.query || {});
  return sendSuccess(res, data);
});

const getSkillGap = asyncHandler(async (req, res) => {
  const data = await careerService.getSkillGap(req.user, req.query.role, req.query || {});
  return sendSuccess(res, data);
});

module.exports = {
  getRecommendations,
  getSkillGap,
};
