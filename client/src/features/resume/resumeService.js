import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

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
    return response.data;
  },
};

export default resumeService;
