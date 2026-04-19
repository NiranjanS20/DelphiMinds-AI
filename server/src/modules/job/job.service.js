const jobApiService = require('../../services/jobApi.service');
const { query } = require('../../config/db');
const geminiService = require('../../services/gemini.service');

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

const getUserSkills = async (userId) => {
  const result = await query(
    `SELECT s.name 
     FROM user_skills us 
     JOIN skills s ON us.skill_id = s.id 
     WHERE us.user_id = $1`,
    [userId]
  );
  return result.rows.map((row) => row.name.toLowerCase());
};

const calculateJobFitScore = async (userId, jobDescription, jobTitle) => {
  const userSkills = await getUserSkills(userId);
  if (!userSkills.length) {
    throw new Error('No skills found for user. Please upload a resume first.');
  }

  // Use Gemini to extract required skills intelligently from job description
  const prompt = `
      Analyze the following job description for the role of "${jobTitle}".
      Extract all technical and soft skills required.
      Return ONLY a raw JSON array of strings representing the skills in lowercase.
      Job Description: ${jobDescription}
  `;

  let requiredSkillsRaw = '[]';
  try {
      requiredSkillsRaw = await geminiService.callGemini(prompt);
  } catch (e) {
      console.error('Failed Gemini API call:', e.message);
  }

  let requiredSkills = [];
  try {
      const jsonStr = requiredSkillsRaw.replace(/```json/g, '').replace(/```/g, '').trim();
      requiredSkills = JSON.parse(jsonStr) || [];
  } catch (e) {
      console.error('Failed to parse Gemini output:', requiredSkillsRaw);
  }

  // Compute Match
  const matchedSkills = requiredSkills.filter((skill) =>
    userSkills.some((us) => skill.includes(us) || us.includes(skill))
  );

  const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));

  let fitScore = 0;
  if (requiredSkills.length > 0) {
    fitScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  }

  // Optional AI Analysis
  const analysisPrompt = `
      User has skills: ${userSkills.join(', ')}.
      Job requires: ${requiredSkills.join(', ')}.
      Give a 2-sentence explanation of why this job is a good fit or what they lack.
  `;
  
  let explanation = '';
  try {
    explanation = await geminiService.callGemini(analysisPrompt);
  } catch (e) {}

  return {
    fit_score: fitScore,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    explanation,
  };
};

module.exports = {
  searchJobs,
  getCategories,
  getTopCompanies,
  getSalaryHistogram,
  getGeoSalaryData,
  getHistoricalSalary,
  calculateJobFitScore,
};
