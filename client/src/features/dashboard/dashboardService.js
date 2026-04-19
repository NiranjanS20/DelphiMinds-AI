import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

/**
 * Dashboard API service.
 */
const dashboardService = {
  async getUserProfile() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD);
    return response.data;
  },

  async getSkillSummary() {
    const response = await apiClient.get(ENDPOINTS.SKILL_GAP);
    return response.data;
  },

  async getRecommendations() {
    const response = await apiClient.get(ENDPOINTS.RECOMMENDATIONS);
    return response.data;
  },
};

export default dashboardService;
