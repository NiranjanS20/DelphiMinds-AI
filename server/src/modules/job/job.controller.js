const { asyncHandler, sendSuccess } = require('../../utils/response');
const jobService = require('./job.service');

const searchJobs = asyncHandler(async (req, res) => {
  const data = await jobService.searchJobs(req.query || {});
  return sendSuccess(res, data);
});

const getCategories = asyncHandler(async (req, res) => {
  const data = await jobService.getCategories(req.query || {});
  return sendSuccess(res, data);
});

const getTopCompanies = asyncHandler(async (req, res) => {
  const data = await jobService.getTopCompanies(req.query || {});
  return sendSuccess(res, data);
});

const getSalaryHistogram = asyncHandler(async (req, res) => {
  const data = await jobService.getSalaryHistogram(req.query || {});
  return sendSuccess(res, data);
});

const getGeoSalaryData = asyncHandler(async (req, res) => {
  const data = await jobService.getGeoSalaryData(req.query || {});
  return sendSuccess(res, data);
});

const getHistoricalSalary = asyncHandler(async (req, res) => {
  const data = await jobService.getHistoricalSalary(req.query || {});
  return sendSuccess(res, data);
});

module.exports = {
  searchJobs,
  getCategories,
  getTopCompanies,
  getSalaryHistogram,
  getGeoSalaryData,
  getHistoricalSalary,
};
