import apiClient from '../../services/apiClient';

/**
 * Dashboard API service.
 */
const dashboardService = {
  async getUserProfile() {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data?.data || response.data;
  },

  async getSkillSummary() {
    const response = await apiClient.get('/skill-gap');
    return response.data?.data || response.data;
  },

  async getRecommendations() {
    const response = await apiClient.get('/recommendations');
    return response.data?.data || response.data;
  },
};

export default dashboardService;
