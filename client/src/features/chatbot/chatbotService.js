import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

/**
 * Chatbot API service — uses session-based history managed by backend.
 */
const chatbotService = {
  /**
   * Send a message to the AI mentor.
   * Backend manages conversation history via sessionId.
   * @param {string} message
   * @param {string} [sessionId] - Session ID for conversation continuity
   * @returns {Promise<object>} AI response with reply and sessionId
   */
  async sendMessage(message, sessionId = null) {
    const response = await apiClient.post(ENDPOINTS.CHAT, {
      message,
      ...(sessionId ? { sessionId } : {}),
    });
    return response.data;
  },

  /**
   * Load chat history for a session.
   * @param {string} sessionId
   * @returns {Promise<object>} Chat history
   */
  async getHistory(sessionId) {
    const response = await apiClient.get(`${ENDPOINTS.CHAT_HISTORY}/${sessionId}`);
    return response.data;
  },
};

export default chatbotService;
