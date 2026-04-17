const jobApiService = require('../../services/jobApi.service');

const parseNumberOrUndefined = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parsePage = (page) => {
  const parsed = Number(page);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

const searchJobs = async (query = {}) =>
  jobApiService.searchJobs({
    query: query.q || query.query || '',
    country: query.country,
    page: parsePage(query.page),
    location: query.location,
    salary_min: parseNumberOrUndefined(query.salary_min),
    salary_max: parseNumberOrUndefined(query.salary_max),
    category: query.category,
  });

const getCategories = async (query = {}) =>
  jobApiService.getCategories(query.country);

const getTopCompanies = async (query = {}) =>
  jobApiService.getTopCompanies({
    query: query.q || query.query || '',
    country: query.country,
  });

const getSalaryHistogram = async (query = {}) =>
  jobApiService.getSalaryHistogram({
    query: query.q || query.query || '',
    country: query.country,
  });

const getGeoSalaryData = async (query = {}) =>
  jobApiService.getGeoSalaryData(query.country);

const getHistoricalSalary = async (query = {}) =>
  jobApiService.getHistoricalSalary({
    query: query.q || query.query || '',
    country: query.country,
  });

module.exports = {
  searchJobs,
  getCategories,
  getTopCompanies,
  getSalaryHistogram,
  getGeoSalaryData,
  getHistoricalSalary,
};
