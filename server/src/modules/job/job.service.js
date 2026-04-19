const jobApiService = require('../../services/jobApi.service');
const { query } = require('../../config/db');
const geminiService = require('../../services/gemini.service');
const skillsService = require('../skills/skills.service');
const { AppError } = require('../../middleware/error.middleware');
const errorCodes = require('../../utils/errorCodes');

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

const getJobById = async ({ id, country }) => jobApiService.getJobById({ id, country });

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

const parseJsonArray = (value) => {
  const normalized = String(value || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  if (!normalized) {
    return [];
  }

  try {
    const parsed = JSON.parse(normalized);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const normalizeSkillNames = (skills = []) => {
  const unique = new Set();
  const result = [];

  for (const raw of skills) {
    const next = String(raw || '').trim().toLowerCase();
    if (!next || unique.has(next)) {
      continue;
    }
    unique.add(next);
    result.push(next);
  }

  return result;
};

const hydrateSkillsFromLatestResume = async (userId) => {
  const latestResumeResult = await query(
    `
      SELECT id, parsed_data
      FROM resumes
      WHERE user_id = $1 AND status = 'parsed'
      ORDER BY COALESCE(parsed_at, updated_at, created_at) DESC
      LIMIT 1
    `,
    [userId]
  );

  if (latestResumeResult.rowCount === 0) {
    return {
      resumeId: null,
      upserted: 0,
    };
  }

  const latestResume = latestResumeResult.rows[0];
  const rawSkills = Array.isArray(latestResume.parsed_data?.skills)
    ? latestResume.parsed_data.skills
    : [];

  const extractedNames = normalizeSkillNames(
    rawSkills.map((entry) => (typeof entry === 'string' ? entry : entry?.name || ''))
  );

  if (extractedNames.length === 0) {
    return {
      resumeId: latestResume.id,
      upserted: 0,
    };
  }

  const applied = await skillsService.addUserSkillsFromML(
    userId,
    {
      skills: extractedNames.map((name) => ({ name })),
    },
    {
      source: 'resume',
      category: 'extracted',
      defaultLevel: 5,
      defaultConfidence: 0.85,
    }
  );

  return {
    resumeId: latestResume.id,
    upserted: applied.length,
  };
};

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

const extractRequiredSkills = async (jobTitle, jobDescription) => {
  const extractionPrompt = `
Extract required skills from this job description.
Return ONLY a JSON array of lowercase skill names.
Role: ${jobTitle || 'unknown'}
Description: ${jobDescription}
`;

  let extracted = [];

  try {
    const geminiResponse = await geminiService.callGemini(extractionPrompt);
    extracted = parseJsonArray(geminiResponse);
  } catch (_error) {
    extracted = [];
  }

  const normalizedFromGemini = normalizeSkillNames(extracted);
  if (normalizedFromGemini.length > 0) {
    return normalizedFromGemini;
  }

  const dictionaryResult = await query(
    'SELECT name FROM skills WHERE is_active = TRUE ORDER BY name ASC'
  );

  const dictionary = dictionaryResult.rows.map((row) => String(row.name || '').toLowerCase()).filter(Boolean);
  const description = String(jobDescription || '').toLowerCase();

  return dictionary.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(description);
  });
};

const saveFitScore = async (userId, payload) => {
  const result = await query(
    `
      INSERT INTO interviews (
        user_id,
        resume_id,
        job_external_id,
        job_title,
        company,
        location,
        job_description,
        fit_score,
        matched_skills,
        missing_skills,
        explanation,
        meta
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12::jsonb)
      ON CONFLICT (user_id, job_external_id)
      DO UPDATE SET
        resume_id = EXCLUDED.resume_id,
        job_title = EXCLUDED.job_title,
        company = EXCLUDED.company,
        location = EXCLUDED.location,
        job_description = EXCLUDED.job_description,
        fit_score = EXCLUDED.fit_score,
        matched_skills = EXCLUDED.matched_skills,
        missing_skills = EXCLUDED.missing_skills,
        explanation = EXCLUDED.explanation,
        meta = EXCLUDED.meta,
        updated_at = NOW()
      RETURNING id, updated_at
    `,
    [
      userId,
      payload.resumeId || null,
      payload.jobExternalId || null,
      payload.jobTitle,
      payload.company || null,
      payload.location || null,
      payload.jobDescription,
      payload.fitScore,
      JSON.stringify(payload.matchedSkills || []),
      JSON.stringify(payload.missingSkills || []),
      payload.explanation || null,
      JSON.stringify(payload.meta || {}),
    ]
  );

  return result.rows[0];
};

const calculateJobFitScore = async (userId, payload = {}) => {
  const {
    jobId,
    country,
    jobTitle,
    jobDescription,
    company,
    location,
  } = payload;

  let resolvedDescription = String(jobDescription || '').trim();
  let resolvedTitle = String(jobTitle || '').trim();
  let resolvedCompany = String(company || '').trim();
  let resolvedLocation = String(location || '').trim();

  if (!resolvedDescription && jobId) {
    const fetched = await jobApiService.getJobById({ id: jobId, country });
    if (fetched) {
      resolvedDescription = String(fetched.description || '').trim();
      resolvedTitle = resolvedTitle || String(fetched.title || '').trim();
      resolvedCompany = resolvedCompany || String(fetched.company || '').trim();
      resolvedLocation = resolvedLocation || String(fetched.location || '').trim();
    }
  }

  if (!resolvedDescription) {
    throw new AppError('Job description is required', 400, errorCodes.VALIDATION_ERROR);
  }

  let userSkills = await getUserSkills(userId);
  let resumeId = null;

  if (!userSkills.length) {
    const hydrateResult = await hydrateSkillsFromLatestResume(userId);
    resumeId = hydrateResult.resumeId;
    userSkills = await getUserSkills(userId);
  }

  if (!userSkills.length) {
    throw new AppError(
      'No resume-derived skills found. Please upload and analyze your resume first.',
      400,
      errorCodes.VALIDATION_ERROR
    );
  }

  const requiredSkills = await extractRequiredSkills(resolvedTitle, resolvedDescription);

  if (!requiredSkills.length) {
    throw new AppError(
      'Unable to extract required skills from this job. Please try another listing.',
      422,
      errorCodes.VALIDATION_ERROR
    );
  }

  const matchedSkills = requiredSkills.filter((skill) =>
    userSkills.some((us) => skill.includes(us) || us.includes(skill))
  );

  const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));

  let fitScore = 0;
  if (requiredSkills.length > 0) {
    fitScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  }

  const analysisPrompt = `
User skills: ${userSkills.join(', ')}
Required skills: ${requiredSkills.join(', ')}
Matched skills: ${matchedSkills.join(', ')}
Missing skills: ${missingSkills.join(', ')}

Explain in 2 concise sentences why this role is or is not a fit.
  `;

  let explanation = '';
  try {
    explanation = await geminiService.callGemini(analysisPrompt);
  } catch (_error) {
    explanation = '';
  }

  let saved = null;
  try {
    saved = await saveFitScore(userId, {
      resumeId,
      jobExternalId: jobId || null,
      jobTitle: resolvedTitle || 'Unknown role',
      company: resolvedCompany,
      location: resolvedLocation,
      jobDescription: resolvedDescription,
      fitScore,
      matchedSkills,
      missingSkills,
      explanation,
      meta: {
        required_skills_count: requiredSkills.length,
        matched_skills_count: matchedSkills.length,
      },
    });
  } catch (_error) {
    saved = null;
  }

  return {
    fit_score: fitScore,
    required_skills: requiredSkills,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    explanation,
    saved_fit_id: saved?.id || null,
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
  calculateJobFitScore,
};
