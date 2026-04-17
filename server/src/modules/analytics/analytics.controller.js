const { asyncHandler, sendSuccess } = require('../../utils/response');
const analyticsService = require('./analytics.service');

const getProgress = asyncHandler(async (req, res) => {
  const data = await analyticsService.getProgress(req.user);
  return sendSuccess(res, data);
});

const trackActivity = asyncHandler(async (req, res) => {
  const data = await analyticsService.trackActivity(req.user, req.body || {});
  return sendSuccess(res, data, 'Activity tracked', 201);
});

module.exports = {
  getProgress,
  trackActivity,
};
