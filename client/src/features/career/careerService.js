import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

/**
 * Career module API service.
 */
const careerService = {
  async getRecommendations() {
    const response = await apiClient.get(ENDPOINTS.RECOMMENDATIONS);
    return response.data;
  },

  async getSkillGap() {
    const response = await apiClient.get(ENDPOINTS.SKILL_GAP);
    return response.data;
  },
};

export default careerService;
