const userService = require('../user/user.service');
const skillsModel = require('../skills/skills.model');
const careerModel = require('./career.model');
const mlService = require('../../services/ml.service');
const jobApiService = require('../../services/jobApi.service');

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const toSkillMap = (skills = []) => {
  const map = new Map();
  for (const skill of skills) {
    map.set(normalizeText(skill.name), skill);
  }
  return map;
};

const estimateTimeToReady = (missingCount) => {
  if (missingCount <= 1) return '1-3 months';
  if (missingCount <= 3) return '3-6 months';
  if (missingCount <= 5) return '6-9 months';
  return '9-12 months';
};

const scoreProfile = (profile, userSkillMap, globalSkillGaps = []) => {
  const required = Array.isArray(profile.requiredSkills) ? profile.requiredSkills : [];

  const matched = required.filter((skill) => userSkillMap.has(skill.toLowerCase()));
  const pathMissing = required.filter((skill) => !userSkillMap.has(skill.toLowerCase()));
  const gaps = new Set(pathMissing);
  for (const gap of globalSkillGaps || []) {
    const normalized = String(gap || '').trim();
    if (normalized) {
      gaps.add(normalized);
    }
  }
  const missing = [...gaps];

  const denominator = required.length || 1;
  const matchScore = Math.round((matched.length / denominator) * 100);
  const salary = profile.salaryBand?.display || profile.salaryBand?.range || 'N/A';

  return {
    id: profile.slug || profile.id,
    careerPathId: profile.id,
    title: profile.title,
    description: profile.description || 'AI-curated role based on your current profile and market demand.',
    company: 'Market aggregate',
    salary,
    growth: profile.growthOutlook || 'Medium',
    requiredSkills: required,
    matchScore,
    match: matchScore,
    matchedSkills: matched,
    missingSkills: missing,
    timeToReady: estimateTimeToReady(missing.length),
  };
};

const buildProfilesFromMl = (mlCareers = [], careerPaths = []) => {
  const pathByTitle = new Map(careerPaths.map((path) => [normalizeText(path.title), path]));
  const pathBySlug = new Map(careerPaths.map((path) => [normalizeText(path.slug), path]));

  const profiles = [];
  const seen = new Set();

  for (const rawCareer of mlCareers) {
    const title = String(rawCareer || '').trim();
    if (!title) {
      continue;
    }

    const normalized = normalizeText(title);
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);

    const matchedPath = pathByTitle.get(normalized) || pathBySlug.get(normalized);
    if (matchedPath) {
      profiles.push(matchedPath);
      continue;
    }

    profiles.push({
      id: null,
      slug: normalized.replace(/\s+/g, '-'),
      title,
      description: 'Role suggested by ML service.',
      requiredSkills: [],
      salaryBand: {},
      growthOutlook: 'Medium',
    });
  }

  if (profiles.length === 0) {
    return careerPaths;
  }

  return profiles;
};

const storeRecommendations = async (userId, payload = {}, client) => {
  const first = Array.isArray(payload.recommendations) ? payload.recommendations[0] : null;
  return careerModel.storeRecommendationSnapshot(
    {
      userId,
      resumeId: payload.resumeId,
      careerPathId: first?.careerPathId || null,
      source: payload.source || 'ml',
      recommendations: payload.recommendations || [],
      skillGaps: payload.skillGaps || [],
      contextPayload: payload.contextPayload || {},
      modelVersion: payload.modelVersion,
    },
    client
  );
};

const getRecommendations = async (authUser, options = {}) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  const userSkills = await skillsModel.getUserSkills(user.id);
  const skillMap = toSkillMap(userSkills);
  const country = options.country;

  const mlResult = await mlService.callRecommendation({
    skills: userSkills.map((skill) => skill.name),
  });

  const careerPaths = await careerModel.listCareerPaths();
  const candidateProfiles = buildProfilesFromMl(
    mlResult.recommendations || mlResult.careers || [],
    careerPaths
  );

  const recommendations = candidateProfiles
    .map((profile) => scoreProfile(profile, skillMap, mlResult.skill_gaps || []))
    .sort((a, b) => b.matchScore - a.matchScore);

  const topRecommendations = recommendations.slice(0, 3);
  const marketRoleData = await Promise.all(
    topRecommendations.map((rec) =>
      jobApiService.searchJobs({
        query: rec.title,
        country,
        page: 1,
      })
    )
  );

  const recommendedRoles = topRecommendations.map((rec, index) => ({
    role_id: rec.id,
    role_title: rec.title,
    match_score: rec.matchScore,
    openings: marketRoleData[index]?.total || 0,
    sample_jobs: marketRoleData[index]?.jobs?.slice(0, 5) || [],
  }));

  const missingSkills = topRecommendations[0]?.missingSkills || [];
  const salaryData = await jobApiService.getSalaryHistogram({
    query: topRecommendations[0]?.title || 'software engineer',
    country,
  });

  const marketInsights = await jobApiService.getCareerMarketData(
    recommendations[0]?.matchedSkills || [],
    country
  );

  const saved = await storeRecommendations(user.id, {
    resumeId: options.resumeId,
    source: mlResult.meta?.fallback ? 'hybrid' : 'ml',
    recommendations,
    skillGaps: mlResult.skill_gaps || [],
    contextPayload: {
      inputSkills: userSkills.map((skill) => skill.name),
      country: country || null,
      mlMeta: mlResult.meta || {},
    },
    modelVersion: mlResult.meta?.source || 'ml-service',
  });

  return {
    userSkills,
    recommendations,
    marketInsights,
    recommended_roles: recommendedRoles,
    missing_skills: missingSkills,
    market_salary_data: salaryData,
    recommendation_id: saved.id,
    recommendation_batch_id: saved.batchId,
  };
};

const getSkillGap = async (authUser, targetRoleId, options = {}) => {
  const user = await userService.ensureUserFromFirebase(authUser);
  const userSkills = await skillsModel.getUserSkills(user.id);
  const skillMap = toSkillMap(userSkills);
  const country = options.country;

  const careerPaths = await careerModel.listCareerPaths();
  const normalizedTarget = normalizeText(targetRoleId);
  const targetProfile =
    careerPaths.find(
      (profile) =>
        normalizeText(profile.slug) === normalizedTarget || normalizeText(profile.title) === normalizedTarget
    ) || careerPaths[0];

  const missingSkills = (targetProfile?.requiredSkills || [])
    .filter((skill) => !skillMap.has(skill.toLowerCase()))
    .map((name) => ({ name, targetLevel: 7 }));

  const marketSalaryData = await jobApiService.getSalaryHistogram({
    query: targetProfile?.title || 'software engineer',
    country,
  });

  return {
    targetRole: {
      id: targetProfile?.id || null,
      title: targetProfile?.title || 'Software Engineer',
    },
    missingSkills,
    currentSkillCount: userSkills.length,
    market_salary_data: marketSalaryData,
  };
};

module.exports = {
  storeRecommendations,
  getRecommendations,
  getSkillGap,
};
