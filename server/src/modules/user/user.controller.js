const userService = require('./user.service');
const { sendSuccess } = require('../../utils/response');
const { asyncHandler } = require('../../utils/response');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user);
  return sendSuccess(res, profile);
});

const syncProfile = asyncHandler(async (req, res) => {
  const profile = await userService.syncProfile(req.user, req.body || {});
  return sendSuccess(res, profile, 'Profile synced');
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile(req.user, req.body || {});
  return sendSuccess(res, profile, 'Profile updated');
});

module.exports = {
  getProfile,
  syncProfile,
  updateProfile,
};
