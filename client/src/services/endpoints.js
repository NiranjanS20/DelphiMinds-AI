/** API endpoint constants */
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const ENDPOINTS = {
  // Auth & User
  USER_PROFILE: `${API_BASE}/user/profile`,

  // Resume
  RESUME_UPLOAD: `${API_BASE}/resume/upload`,

  // Career
  RECOMMENDATIONS: `${API_BASE}/recommendations`,
  SKILL_GAP: `${API_BASE}/skill-gap`,

  // Chatbot
  CHAT: `${API_BASE}/chat`,
};

export default ENDPOINTS;
