const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

const CACHE_TTL_MS = 15 * 60 * 1000;
const categoriesCache = new Map();
const salaryCache = new Map();

const adzunaClient = axios.create({
  baseURL: String(env.adzunaBaseUrl || '').replace(/\/$/, ''),
  timeout: 12000,
});

const getCached = (cache, key) => {
  const hit = cache.get(key);
  if (!hit) {
    return null;
  }

  if (Date.now() - hit.cachedAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return hit.value;
};

const setCached = (cache, key, value) => {
  cache.set(key, {
    value,
    cachedAt: Date.now(),
  });
};

const getAllowedCountries = () => {
  const configured = Array.isArray(env.adzunaSupportedCountries)
    ? env.adzunaSupportedCountries
    : [];
  return configured.map((country) => String(country || '').trim().toLowerCase()).filter(Boolean);
};

const normalizeCountry = (country) => {
  const value = String(country || env.adzunaDefaultCountry || 'in').trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(value)) {
    return env.adzunaDefaultCountry || 'in';
  }

  const allowed = getAllowedCountries();
  if (allowed.length > 0 && !allowed.includes(value)) {
    return env.adzunaDefaultCountry || 'in';
  }

  return value;
};

const parsePage = (page) => {
  const parsed = Number(page);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

const hasAdzunaCredentials = () =>
  Boolean(env.adzunaBaseUrl && env.adzunaAppId && env.adzunaAppKey);

const withAuthParams = (params = {}) => ({
  app_id: env.adzunaAppId,
  app_key: env.adzunaAppKey,
  ...params,
});

const safeRequest = async (path, params = {}) => {
  if (!hasAdzunaCredentials()) {
    logger.warn('Adzuna credentials are not configured');
    return null;
  }

  try {
    const response = await adzunaClient.get(path, {
      params: withAuthParams(params),
    });
    return response.data || null;
  } catch (error) {
    const status = error.response?.status;

    if (status === 429) {
      logger.warn('Adzuna rate limit reached', { path, status });
      return null;
    }

    logger.warn('Adzuna request failed', {
      path,
      status,
      error: error.message,
    });
    return null;
  }
};

const normalizeJob = (job) => ({
  id: String(job?.id || ''),
  title: job?.title || '',
  company: job?.company?.display_name || '',
  location:
    job?.location?.display_name ||
    [job?.location?.area?.[0], job?.location?.area?.[1]].filter(Boolean).join(', '),
  salary_min: job?.salary_min ?? null,
  salary_max: job?.salary_max ?? null,
  salary_is_predicted: Number(job?.salary_is_predicted || 0),
  salary_currency: job?.salary_currency || '',
  description: job?.description || '',
  redirect_url: job?.redirect_url || '',
});

const searchJobs = async ({
  query,
  country,
  page,
  location,
  salary_min,
  salary_max,
  category,
} = {}) => {
  const selectedCountry = normalizeCountry(country);
  const selectedPage = parsePage(page);

  const params = {
    what: query || '',
  };

  if (location) {
    params.where = String(location).trim();
  }
  if (salary_min !== undefined && salary_min !== null && salary_min !== '') {
    params.salary_min = Number(salary_min);
  }
  if (salary_max !== undefined && salary_max !== null && salary_max !== '') {
    params.salary_max = Number(salary_max);
  }
  if (category) {
    params.category = String(category).trim();
  }

  const data = await safeRequest(`/jobs/${selectedCountry}/search/${selectedPage}`, params);
  if (!data) {
    return {
      jobs: [],
      count: 0,
      total: 0,
      page: selectedPage,
      country: selectedCountry,
    };
  }

  const results = Array.isArray(data.results) ? data.results : [];

  return {
    jobs: results.map(normalizeJob),
    count: results.length,
    total: Number(data.count || 0),
    page: selectedPage,
    country: selectedCountry,
  };
};

const getCategories = async (country) => {
  const selectedCountry = normalizeCountry(country);
  const cacheKey = `categories:${selectedCountry}`;
  const cached = getCached(categoriesCache, cacheKey);
  if (cached) {
    return cached;
  }

  const data = await safeRequest(`/jobs/${selectedCountry}/categories`);
  const normalized = Array.isArray(data?.results)
    ? data.results.map((item) => ({
        tag: item.tag,
        label: item.label,
      }))
    : [];

  setCached(categoriesCache, cacheKey, normalized);
  return normalized;
};

const getTopCompanies = async ({ query, country } = {}) => {
  const selectedCountry = normalizeCountry(country);
  const data = await safeRequest(`/jobs/${selectedCountry}/top_companies`, {
    what: query || '',
  });

  const results = Array.isArray(data?.leaders) ? data.leaders : Array.isArray(data?.results) ? data.results : [];

  return results.slice(0, 20).map((entry) => ({
    name: entry.canonical_name || entry.company || entry.name || '',
    count: Number(entry.count || entry.jobs || 0),
  }));
};

const getSalaryHistogram = async ({ query, country } = {}) => {
  const selectedCountry = normalizeCountry(country);
  const cacheKey = `salary-hist:${selectedCountry}:${String(query || '').toLowerCase()}`;
  const cached = getCached(salaryCache, cacheKey);
  if (cached) {
    return cached;
  }

  const data = await safeRequest(`/jobs/${selectedCountry}/histogram`, {
    what: query || '',
  });

  const histogram = data?.histogram || data?.results || {};
  setCached(salaryCache, cacheKey, histogram);
  return histogram;
};

const getGeoSalaryData = async (country) => {
  const selectedCountry = normalizeCountry(country);
  const data = await safeRequest(`/jobs/${selectedCountry}/geodata`);
  return data?.results || data || [];
};

const getHistoricalSalary = async ({ query, country } = {}) => {
  const selectedCountry = normalizeCountry(country);
  const cacheKey = `salary-history:${selectedCountry}:${String(query || '').toLowerCase()}`;
  const cached = getCached(salaryCache, cacheKey);
  if (cached) {
    return cached;
  }

  const data = await safeRequest(`/jobs/${selectedCountry}/history`, {
    what: query || '',
  });

  const history = data?.results || data || [];
  setCached(salaryCache, cacheKey, history);
  return history;
};

const getJobById = async ({ id, country } = {}) => {
  const jobId = String(id || '').trim();
  if (!jobId) {
    return null;
  }

  const selectedCountry = normalizeCountry(country);
  const data = await safeRequest(`/jobs/${selectedCountry}/${encodeURIComponent(jobId)}`);

  // Some Adzuna responses wrap job in "results" while others return the job object directly.
  if (data && !Array.isArray(data) && data.id) {
    return normalizeJob(data);
  }

  if (Array.isArray(data?.results) && data.results.length > 0) {
    return normalizeJob(data.results[0]);
  }

  return null;
};

const getCareerMarketData = async (skills = [], country) => {
  const primaryQuery = Array.isArray(skills) && skills.length > 0 ? skills.slice(0, 3).join(' ') : 'software engineer';

  const [jobsResult, salaryHistogram] = await Promise.all([
    searchJobs({ query: primaryQuery, country, page: 1 }),
    getSalaryHistogram({ query: primaryQuery, country }),
  ]);

  return {
    query: primaryQuery,
    jobs: jobsResult.jobs,
    totalJobs: jobsResult.total,
    salaryHistogram,
  };
};

module.exports = {
  searchJobs,
  getJobById,
  getCategories,
  getTopCompanies,
  getSalaryHistogram,
  getGeoSalaryData,
  getHistoricalSalary,
  getCareerMarketData,
};
