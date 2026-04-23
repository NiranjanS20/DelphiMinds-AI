import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

const unwrapPayload = (response) => response?.data?.data || response?.data || {};

const normalizeRecommendations = (payload = {}) => {
  const recommendations = Array.isArray(payload.recommendations) ? payload.recommendations : [];

  return recommendations.map((item, index) => {
    const requiredSkills = Array.isArray(item.requiredSkills) ? item.requiredSkills : [];
    const matchedSkills = Array.isArray(item.matchedSkills) ? item.matchedSkills : [];
    const missingSkills =
      Array.isArray(item.missingSkills) && item.missingSkills.length > 0
        ? item.missingSkills
        : requiredSkills.filter((skill) => !matchedSkills.includes(skill));
    const score = Number(item.match ?? item.matchScore ?? item.match_score ?? 0) || 0;

    return {
      id: item.id || item.careerPathId || `career-${index + 1}`,
      title: item.title || 'Recommended Role',
      match: Math.max(0, Math.min(100, Math.round(score))),
      company: item.company || 'Market aggregate',
      salary: item.salary || 'N/A',
      growth: item.growth || 'Medium',
      description:
        item.description || 'AI-curated role based on your current profile and market demand.',
      requiredSkills,
      matchedSkills,
      missingSkills,
      timeToReady: item.timeToReady || '3-6 months',
    };
  });
};

const normalizeSkillGap = (payload = {}) => {
  const targetRole = payload.targetRole?.title || payload.targetRole || 'Target Role';
  const requiredSkills = Array.isArray(payload.targetRole?.requiredSkills)
    ? payload.targetRole.requiredSkills
    : [];
  const missingSkills = Array.isArray(payload.missingSkills) ? payload.missingSkills : [];
  const missingNames = missingSkills.map((skill) => String(skill.name || '').trim()).filter(Boolean);

  const strengths = requiredSkills
    .filter((skill) => !missingNames.includes(skill))
    .slice(0, 6)
    .map((name) => ({
      name,
      current: 82,
      required: 70,
      status: 'met',
    }));

  const gaps = missingSkills.map((skill) => {
    const required = Math.max(50, Math.min(95, Number(skill.targetLevel || 7) * 10));
    const current = Math.max(20, required - 28);
    const gap = required - current;

    return {
      name: skill.name,
      current,
      required,
      gap,
      priority: gap >= 30 ? 'high' : gap >= 20 ? 'medium' : 'low',
      resources: [],
    };
  });

  const overallReadiness = Math.max(0, Math.min(100, 100 - gaps.length * 12));

  return {
    targetRole,
    overallReadiness,
    strengths,
    gaps,
  };
};

/**
 * Career module API service.
 */
const careerService = {
  async getRecommendations() {
    const response = await apiClient.get(ENDPOINTS.RECOMMENDATIONS);
    const payload = unwrapPayload(response);
    return {
      ...payload,
      recommendations: normalizeRecommendations(payload),
    };
  },

  async getSkillGap() {
    const response = await apiClient.get(ENDPOINTS.SKILL_GAP);
    return normalizeSkillGap(unwrapPayload(response));
  },
};

export default careerService;
