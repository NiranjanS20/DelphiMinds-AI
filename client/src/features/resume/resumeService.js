import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeProficiency = (skill) => {
  const raw = Number(skill?.proficiency ?? skill?.level ?? 0);
  if (!Number.isFinite(raw) || raw <= 0) {
    return 70;
  }

  if (raw <= 10) {
    return clamp(Math.round(raw * 10), 1, 100);
  }

  return clamp(Math.round(raw), 1, 100);
};

const normalizeSkill = (skill) => {
  if (typeof skill === 'string') {
    const name = skill.trim();
    if (!name) return null;

    return {
      name,
      category: 'Extracted',
      proficiency: 70,
    };
  }

  if (!skill || typeof skill !== 'object') {
    return null;
  }

  const name = String(skill.name || skill.skill || '').trim();
  if (!name) return null;

  return {
    name,
    category: skill.category || 'Extracted',
    proficiency: normalizeProficiency(skill),
  };
};

const mapUploadPayload = (payload = {}) => {
  const parsedData = payload.parsedData || {};
  const extractedSkills = payload.analysis?.extractedSkills;
  const sourceSkills = Array.isArray(extractedSkills) && extractedSkills.length > 0
    ? extractedSkills
    : Array.isArray(parsedData.skills) ? parsedData.skills : Array.isArray(payload.skills) ? payload.skills : [];

  const safeSkills = Array.isArray(sourceSkills) ? sourceSkills : [];

  return {
    id: payload.id,
    fileName: payload.fileName || payload.file_name || '',
    status: payload.status,
    summary: parsedData.summary || payload.summary || '',
    experience: parsedData.experience || payload.experience || '',
    education: parsedData.education || payload.education || '',
    skills: safeSkills.map(normalizeSkill).filter(Boolean),
    raw: payload,
  };
};

/**
 * Resume API service.
 */
const resumeService = {
  /**
   * Upload a resume file for AI analysis.
   * @param {File} file
   * @returns {Promise<object>} Parsed resume data
   */
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await apiClient.post(ENDPOINTS.RESUME_UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s for large files
    });

    const payload = response.data?.data || response.data || {};
    return mapUploadPayload(payload);
  },

  /**
   * Get the latest resume.
   * @returns {Promise<object>} Latest resume data
   */
  async getLatestResume() {
    const response = await apiClient.get(ENDPOINTS.RESUME_LATEST);
    const payload = response.data?.data || response.data || {};
    return mapUploadPayload(payload);
  },

  /**
   * Get resume history.
   * @returns {Promise<object>} Resume history data
   */
  async getResumeHistory() {
    const response = await apiClient.get(ENDPOINTS.RESUME_HISTORY);
    const payload = response.data?.data || response.data || {};
    return {
      resumes: Array.isArray(payload.resumes) ? payload.resumes.map(mapUploadPayload) : [],
      total: Number(payload.total) || 0,
    };
  },
};

export default resumeService;
