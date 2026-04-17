const skillsService = require('./skills.service');
const { asyncHandler, sendSuccess } = require('../../utils/response');

const getAllSkills = asyncHandler(async (_req, res) => {
  const skills = await skillsService.getAllSkills();
  return sendSuccess(res, skills);
});

const getMySkills = asyncHandler(async (req, res) => {
  const skills = await skillsService.getMySkills(req.user);
  return sendSuccess(res, skills);
});

const addUserSkill = asyncHandler(async (req, res) => {
  const skill = await skillsService.addUserSkill(req.user, req.body || {});
  return sendSuccess(res, skill, 'Skill added', 201);
});

const updateUserSkillLevel = asyncHandler(async (req, res) => {
  const skillId = Number(req.params.id);
  const skill = await skillsService.updateUserSkillLevel(req.user, skillId, req.body || {});
  return sendSuccess(res, skill, 'Skill updated');
});

module.exports = {
  getAllSkills,
  getMySkills,
  addUserSkill,
  updateUserSkillLevel,
};
