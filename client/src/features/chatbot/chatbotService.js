import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

/**
 * Chatbot API service.
 */
const chatbotService = {
  /**
   * Send a message to the AI mentor.
   * @param {string} message
   * @param {Array} history - Previous messages for context
   * @returns {Promise<object>} AI response
   */
  async sendMessage(message, history = []) {
    const response = await apiClient.post(ENDPOINTS.CHAT, {
      message,
      history,
    });
    return response.data;
  },
};

export default chatbotService;
