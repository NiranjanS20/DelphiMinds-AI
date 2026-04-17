const { asyncHandler, sendSuccess } = require('../../utils/response');
const resumeService = require('./resume.service');

const uploadResume = asyncHandler(async (req, res) => {
  const data = await resumeService.uploadResume(req.user, req.file);
  return sendSuccess(res, data, 'Resume uploaded and analyzed', 201);
});

const getResume = asyncHandler(async (req, res) => {
  const data = await resumeService.getResumeById(req.user, req.params.id);
  return sendSuccess(res, data);
});

module.exports = {
  uploadResume,
  getResume,
};
