import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeImportance = (importance) => {
  const value = String(importance || 'medium').toLowerCase();
  if (value === 'high' || value === 'low') return value;
  return 'medium';
};

const normalizeResponse = (payload = {}) => {
  const matchedKeywords = Array.isArray(payload.matched_keywords) ? payload.matched_keywords : [];
  const missingKeywords = Array.isArray(payload.missing_keywords) ? payload.missing_keywords : [];

  const gapItems = Array.isArray(payload.keyword_gap?.missing_keywords)
    ? payload.keyword_gap.missing_keywords
    : [];

  const keywordGap = gapItems
    .map((item) => {
      if (typeof item === 'string') {
        return { keyword: item, importance: 'medium' };
      }

      if (!item || typeof item !== 'object') {
        return null;
      }

      const keyword = String(item.keyword || '').trim();
      if (!keyword) return null;

      return {
        keyword,
        importance: normalizeImportance(item.importance),
      };
    })
    .filter(Boolean);

  const fallbackGap =
    keywordGap.length > 0
      ? keywordGap
      : missingKeywords.map((keyword) => ({ keyword, importance: 'medium' }));

  return {
    resumeId: payload.resume_id,
    atsScore: clamp(Math.round(toNumber(payload.ats_score, 0)), 0, 100),
    matchScore: clamp(Math.round(toNumber(payload.match_score, 0)), 0, 100),
    breakdown: {
      keywordMatch: clamp(Math.round(toNumber(payload.breakdown?.keyword_match, 0)), 0, 100),
      skillRelevance: clamp(Math.round(toNumber(payload.breakdown?.skill_relevance, 0)), 0, 100),
      completeness: clamp(Math.round(toNumber(payload.breakdown?.completeness, 0)), 0, 100),
    },
    matchedKeywords,
    missingKeywords,
    keywordGap: fallbackGap,
    suggestions: Array.isArray(payload.improvement_suggestions) ? payload.improvement_suggestions : [],
    meta: payload.meta || {},
  };
};

const atsService = {
  async analyze(jobDescription, options = {}) {
    const response = await apiClient.post(ENDPOINTS.ATS_ANALYZE, {
      jobDescription,
      ...(options.resumeId ? { resumeId: options.resumeId } : {}),
    });

    const payload = response.data?.data || response.data || {};
    return normalizeResponse(payload);
  },
};

export default atsService;
